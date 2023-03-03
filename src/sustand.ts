import {
    useCallback,
    createElement,
} from 'react';
import { create as createZustand } from 'zustand';
import { memoize } from 'proxy-memoize';
import { shallow } from 'zustand/shallow';
import {
    Create,
    UseStore,
    UseStoreSuspense,
    Selector,
    StoreApiSetState,
    SuspenseCacheType
} from './types';
import getMiddleware from './utils/getMiddleware';
import getWrapper from './utils/getWrapper';
import setMiddleware from './utils/setMiddware';

export { default as suspense } from './utils/suspense';

export { default as compute } from './utils/compute';

export { default as shallow } from 'zustand/shallow';

export * from './types';

const createSustand: Create = (func) => {
    type TState = ReturnType<typeof func>;
    // 缓存状态的 actions, useStore('key')，将其 set 方法缓存在此处
    const lazySetActions = new Map();
    // 缓存 suspense 的 cache
    const suspenseCaches = new Map<string, any>();

    const useZustandStore = createZustand(setMiddleware(getMiddleware(func, suspenseCaches)));

    // 单独将 store 的方法导出
    const store = {
        getState: getWrapper(useZustandStore.getState),
        setState: useZustandStore.setState as StoreApiSetState<TState>,
        subscribe: useZustandStore.subscribe,
        destroy: useZustandStore.destroy,
        // eslint-disable-next-line
        // @ts-ignore
        subscribeWithSelector: useZustandStore.subscribeWithSelector,
    };

    const useStoreSuspense: UseStoreSuspense<TState> = (key: keyof TState, options = {}) => {
        const config = store.getState(key);
        const args = options.args;
        const cacheKey = JSON.stringify([key, args]);

        // 解析 config
        // 初始值以 options 为主
        const initialValue = options.initialValue || config.initialValue;
        // 定义获取数据的 action，此处需要约束，必须返回 promise;
        const action = config.action;
        // 依赖的选择器
        const selector = config.selector;
        // 依赖的比较器
        const compare = config.compare;

        // 处理 options
        // 是否走 loadable 模式
        const loadable = options.loadable;
        // 是否手动触发
        const manual = options.manual || false;

        // cache data structor
        /*
        cache: 获取数据的 Promise
        error: 错误信息
        data: 数据
        status: 'pending' | 'fullfilled' | 'rejected'
        fullfilledOnce: 标记是否完成过一次，由于该数据可能会多次被获取，故需要进行标记
        refresh: 刷新方法，refresh(true) -> suspense, refresh() -> loadable
        force: 是否强制走 suspense
        subscribed: 标记是否订阅过 selector
        fromServer: 标记数据是否来自于 ssr
        */
        let storeCache = suspenseCaches.get(cacheKey);

        const cacheFromServer = typeof window === 'undefined' ? {}
            // eslint-disable-next-line
            : window?.__ssrstreamingdata__?.[cacheKey] || {};

        if (!storeCache) {
            // 不存在则创建一个 zustand store
            // 新建一个 store 的目的，是 selector 的存在
            // 当 selector 返回的数据改变时，触发新 store 的 set，从而引发局部更新
            // 如果不新起 store，那么将触发原 store 的 set，逻辑错误(会多执行一遍监听器)
            suspenseCaches.set(cacheKey, createZustand<SuspenseCacheType>()(() => ({
                error: null,
                data: initialValue,
                // 标记是否完成过一次，如果完成过一次，默认后续会走 loadable 逻辑
                fullfilledOnce: false,
                refresh: () => { },
                cache: null,
                ...config.data?.[cacheKey],
                subscribed: false,
                status: 'pending',
                ...cacheFromServer,
            })));

            storeCache = suspenseCaches.get(cacheKey);

            storeCache.getState = getWrapper(storeCache.getState);
        }

        // 监听 storeCache 的变化
        const {
            data,
            status,
            error,
            // 标记是否完成过，默认如果成功过，那么后续的默认 refresh 行为，均为 loadable
            fullfilledOnce,
        } = storeCache((s) => ({
            data: s.data,
            status: s.status,
            error: s.error,
            fullfilledOnce: s.fullfilledOnce,
        }), shallow);

        const createPromise = useCallback((force = false) => {
            // todo: 竞态问题，当多次 refresh 时，应当内部处理一下 竞态问题
            const s = {
                status: 'pending',
                cache: action(args).then((res) => {
                    const temp = {
                        status: 'fullfilled',
                        error: null,
                        data: res,
                        fullfilledOnce: true,
                        force: false,
                    };
                    storeCache.setState(temp);
                    store.setState((state) => ({
                        [key]: {
                            ...state[key],
                            data: {
                                ...state[key]?.data,
                                [cacheKey]: {
                                    ...state[key]?.data?.[cacheKey],
                                    ...temp,
                                },
                            },
                        }
                    }), `suspense value:${String(key)} fullfilled`);
                }).catch((e) => {
                    const temp = {
                        status: 'rejected',
                        error: e,
                    };
                    storeCache.setState(temp);
                    store.setState((state) => ({
                        [key]: {
                            ...state[key],
                            data: {
                                ...state[key]?.data,
                                [cacheKey]: {
                                    ...state[key]?.data?.[cacheKey],
                                    ...temp,
                                },
                            },
                        }
                    }), `suspense value:${String(key)} rejected`);
                }),
                error: null,
                data: storeCache.getState('data') || initialValue,
                refresh: createPromise,
                force: force === true,
                fromServer: false,
            };
            storeCache.setState(s);
            Promise.resolve().then(() => {
                store.setState((state) => ({
                    [key]: {
                        ...state[key],
                        data: {
                            ...state[key]?.data,
                            [cacheKey]: s,
                        },
                    }
                }), `suspense value:${String(key)} init`);
            });
            return new Promise((resolve, reject) => storeCache.getState('cache').then(() => {
                const temp = storeCache.getState();
                if (temp.status === 'fullfilled') {
                    resolve(temp.data);
                } else {
                    reject(temp.error);
                }
            }));
        }, [storeCache]);

        const subscribed = storeCache.getState('subscribed');

        // 订阅 selector 变化
        if (!subscribed && typeof selector === 'function') {
            // 标记已经订阅过
            storeCache.setState({
                subscribed: true,
            });
            store.subscribe((curState, preState) => {
                const cur = selector(curState);
                const pre = selector(preState);
                if (!compare(cur, pre)) {
                    createPromise();
                }
            });
        }

        // 判断 store 中是否存在数据
        const promiseCache = storeCache.getState('cache');

        const force = storeCache.getState('force');

        // loadable 逻辑，且不是 force 逻辑 直接返回数据
        if (loadable && !force) {
            // 没有 promise 且不是手动触发逻辑 且 cache 不是从 storage 中获取
            if ((!promiseCache || !promiseCache.then) && !manual) {
                createPromise();
            }
            return {
                data,
                status,
                refresh: createPromise,
            };
        }

        const loadScript = createElement('div', {
            dangerouslySetInnerHTML: {
                __html: `<script>
                    window.__ssrstreamingdata__ = window.__ssrstreamingdata__ || {};
                    window.__ssrstreamingdata__[JSON.stringify(${cacheKey})] = ${JSON.stringify({
    data,
    status,
    fromServer: true,
})}
                </script>`
            },
        });

        const fromServer = storeCache.getState('fromServer');

        if (fromServer) {
            return {
                data,
                status,
                refresh: createPromise,
                loadScript,
            };
        }

        if (!promiseCache) {
            if (!manual) {
            // 不存在，则创建 promise 并抛出，触发 suspense
            // eslint-disable-next-line
                throw createPromise();
            }
        } else if (!promiseCache.then) {
            // 数据来自于 storage
            // 则不 throw，仅执行刷新
            createPromise();
        } else if (fullfilledOnce && !force) {
            // 完成过一次，则默认走 loadable 逻辑
            return {
                data,
                status,
                refresh: createPromise,
                loadScript,
            };
        } else {
            // 未完成过，正常走 suspense 逻辑即可
            switch (status) {
                case 'pending': throw promiseCache;
                case 'fullfilled': return {
                    data,
                    status,
                    refresh: createPromise,
                    loadScript,
                };
                case 'rejected': throw error;
                default: break;
            }
        }

        return {
            data,
            status,
            refresh: createPromise,
        };
    };

    // 不过是 useStoreSuspense 的一种特殊场景，直接全走 loadable 逻辑即可
    const useStoreLoadable: UseStoreSuspense<TState> = (
        key: keyof TState,
        options = {}
    ) => useStoreSuspense(key, {
        ...options,
        loadable: true,
    });

    const computedCache: any = {};

    function initComputed(state) {
        const res = {};
        const computedKeys: Array<string> = [];
        Object.keys(state).forEach((key) => {
            if (state[key] && state[key].sustand_internal_iscomputed) {
                if (!computedCache[key]) {
                    computedCache[key] = {};
                    computedCache[key].action = memoize(state[key].action || (() => null));
                }
                computedKeys.push(key);
            } else if (state[key] && state[key].sustand_internal_issuspense) {
                res[key] = state[key].data;
            } else {
                res[key] = state[key];
            }
        });
        computedKeys.forEach((key) => {
            res[key] = computedCache[key].action(res);
        });
        return res;
    }

    let computedState: any = initComputed(store.getState());

    // 每次 store 改变，执行一次计算
    // 由于存在 computed 依赖的情况，所以需要被依赖的 computed 属性值放在前
    store.subscribe((state) => {
        computedState = initComputed(state);
    });

    const useStoreComputed = (key: keyof TState, compare?) => {
        const isEqual = compare || shallow;
        const res = useZustandStore(() => computedState[key], isEqual);
        return res;
    };

    const useStore: UseStore<TState> = (f, compare?): any => {
        let fn = f;
        // 比较函数默认全部 shallow
        let isEqual = compare || shallow;
        // useStore('key') 时，将比较函数整理成仅比较 state
        const compareData = useCallback((a, b) => shallow(a[0], b[0]), []);
        if (typeof f === 'string') {
            // TODO:如果选择的属性是函数 or suspense value，发出警告
            // 惰性生成 setState
            let setState = lazySetActions.get(f);
            if (!setState) {
                lazySetActions.set(f, (v: string | Selector<TState, any>) => {
                    if (typeof v === 'function') {
                        store.setState({ [f]: v(store.getState()[f]) }, `setState: ${f}`);
                    } else {
                        store.setState({ [f]: v }, `setState: ${f}`);
                    }
                });
                setState = lazySetActions.get(f);
            }
            fn = (state: TState) => [state[f], setState];
            isEqual = compare || compareData;
        }
        // 使用 zustand 的 useStore 完成状态生成
        const res = useZustandStore(fn, isEqual);

        return res;
    };

    return {
        useStore,
        useStoreComputed,
        useStoreSuspense,
        useStoreLoadable,
        store,
    };
};

export default createSustand;
