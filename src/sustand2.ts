import { create } from 'zustand';
import { useCallback, useRef } from 'react';
import { shallow } from 'zustand/shallow';
import collect from './utils/collet';

const createSustand = (func: (set: any, get: any, api: any) => any) => {
    const computedCaches = {};
    const suspenseCaches = {};
    const lazySetActions = {};

    const useZustandStore = create(collect(func, computedCaches, suspenseCaches));

    // 单独将 store 的方法导出
    const store = {
        getState: useZustandStore.getState,
        setState: useZustandStore.setState,
        subscribe: useZustandStore.subscribe,
        // eslint-disable-next-line
        // @ts-ignore
        subscribeWithSelector: useZustandStore.subscribeWithSelector,
    };

    store.subscribe((state) => {
        Object.keys(computedCaches).forEach((key) => {
            state[key] = computedCaches[key].action(state);
            computedCaches[key].data = state[key];
        });
    });

    const useStoreSuspense = (key, options:any = {}) => {
        const config = suspenseCaches[key];
        const optionsRef = useRef(options);
        optionsRef.current = options;
        const cacheKey = JSON.stringify(optionsRef.current.args);
        const state = config.state;

        if (!state[cacheKey]) {
            state[cacheKey] = {
                status: 'pending',
                data: options.initialValue,
                error: null,
                cache: null,
                refresh: () => {},
                fullfilledOnce: false,
                force: false,
                subscribed: false,
                fromServer: false,
            }
        }

        const createPromise = useCallback((force = false) => {
            const s = {
                status: 'pending',
                // data 不用覆盖，使用上一次即可
                // error 不用覆盖,
                cache: config.action(optionsRef.current.args).then((res) => {
                    state[cacheKey] = {
                        ...state[cacheKey],
                        status: 'fullfilled',
                        data: res,
                        error: null,
                        // cache,
                        // refresh
                        fullfilledOnce: true,
                        force: false,
                        // subscribed
                        // fromServer
                    };
                    store.setState({
                        [key]: {
                            [cacheKey]: {
                                status: state[cacheKey].status,
                                error: state[cacheKey].error,
                                data: state[cacheKey].data,
                            }
                        }
                    });
                }).catch((e) => {
                    state[cacheKey] = {
                        ...state[cacheKey],
                        status: 'rejected',
                        error: e,
                    };
                    store.setState({
                        [key]: {
                            [cacheKey]: {
                                status: state[cacheKey].status,
                                error: state[cacheKey].error,
                                data: state[cacheKey].data,
                            }
                        }
                    })
                }),
                refresh: createPromise,
                // fullfilledOnce 不用覆盖，使用上一次即可
                force,
                // subscribed 不用覆盖，使用上一次即可
                fromServer: false,
            }
            state[cacheKey] = {
                ...state[cacheKey],
                ...s,
            }
            store.setState({
                [key]: {
                    [cacheKey]: {
                        status: state[cacheKey].status,
                        error: state[cacheKey].error,
                        data: state[cacheKey].data,
                    }
                }
            })
            return new Promise((resolve, reject) => state[cacheKey].cache.then(() => {
                const temp = state[cacheKey];
                if (temp.status === 'fullfilled') {
                    resolve(temp.data);
                } else {
                    reject(temp.error);
                }
            }));
        }, []);

        useZustandStore((state) => ({
            status: state[key][cacheKey]?.status,
        }));

        if (!state[cacheKey].cache) {
            throw createPromise();
        } else {
            // 未完成过，正常走 suspense 逻辑即可
            switch (state[cacheKey].status) {
                case 'pending': throw state[cacheKey].cache;
                case 'fullfilled': return {
                    data: state[cacheKey].data,
                    status: state[cacheKey].status,
                    refresh: createPromise,
                };
                case 'rejected': throw state[cacheKey].error;
                default: break;
            }
        }
    };

    const useStore = (f?, compare?): any => {
        let fn = f;
        // 比较函数默认全部 shallow
        let isEqual = compare || shallow;
        // useStore('key') 时，将比较函数整理成仅比较 state
        const compareData = useCallback((a, b) => shallow(a[0], b[0]), []);
        if (typeof f === 'string') {
            // TODO:如果选择的属性是函数 or suspense value，发出警告
            // 惰性生成 setState
            let setState = lazySetActions[f];
            if (!setState) {
                lazySetActions[f] = (v) => {
                    if (typeof v === 'function') {
                        store.setState({ [f]: v(store.getState()[f]) });
                    } else {
                        store.setState({ [f]: v });
                    }
                };
                setState = lazySetActions[f];
            }
            fn = (state) => [state[f], setState];
            isEqual = compare || compareData;
        }
        // 使用 zustand 的 useStore 完成状态生成
        const res = useZustandStore(fn, isEqual);

        return res;
    };

    return {
        useStore,
        useStoreSuspense,
    };
}

export default createSustand;
