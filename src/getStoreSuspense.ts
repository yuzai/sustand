import { useCallback, useRef, createElement } from 'react';
import { shallow } from 'zustand/shallow';

const getSuspense = ({
    store,
    useZustandStore,
    suspenseCaches,
    computedCaches,
}) => {
    const useStoreSuspense = (key, options:any = {}) => {
        const config = suspenseCaches[key];
        const optionsRef = useRef(options);
        optionsRef.current = options;
        const cacheKey = options.args ? JSON.stringify(options.args) : 'default';
        const state = config.state;

        let createPromise: (force?: boolean) => Promise<any>;

        const cacheFromServer = typeof window === 'undefined' ? {}
            // eslint-disable-next-line
            : window?.__ssrstreamingdata__?.[key + cacheKey] || {};

        if (!state[cacheKey]) {
            const fromLocal = !!store.getState(key)[cacheKey]?.data;
            state[cacheKey] = {
                status: 'pending',
                data: store.getState(key)[cacheKey]?.data || config.initialValue,
                error: null,
                cache: null,
                refresh: () => {},
                fullfilledOnce: false,
                force: false,
                fromLocal,
                fromServer: false,
                ...cacheFromServer,
            };

            if (config.selector && typeof config.selector === 'function') {
                store.subscribe((curState, preState) => {
                    const cur = config.selector(curState);
                    const pre = config.selector(preState);
                    const equalityFn = config.equalityFn || shallow;
                    if (!(equalityFn(cur, pre))) {
                        createPromise();
                    }
                });
            }
        }

        createPromise = useCallback((force = false) => {
            const cacheKeyRef = optionsRef.current.args;
            const cacheKeyValue = cacheKeyRef ? JSON.stringify(cacheKeyRef) : 'default';
            const s = {
                status: 'pending',
                // data 不用覆盖，使用上一次即可
                // error 不用覆盖,
                cache: config.action(cacheKeyRef).then((res) => {
                    state[cacheKeyValue] = {
                        ...state[cacheKeyValue],
                        status: 'fullfilled',
                        data: res,
                        error: null,
                        fullfilledOnce: true,
                        force: false,
                        fromLocal: false,
                        fromServer: false,
                    };
                    store.setState({
                        [key]: {
                            ...store.getState(key),
                            [cacheKeyValue]: {
                                status: state[cacheKeyValue].status,
                                error: state[cacheKeyValue].error,
                                data: state[cacheKeyValue].data,
                                refresh: createPromise,
                            }
                        }
                    }, `suspense value:${String(key)} fullfilled`);
                }).catch((e) => {
                    state[cacheKeyValue] = {
                        ...state[cacheKeyValue],
                        status: 'rejected',
                        error: e,
                        fromLocal: false,
                        fromServer: false,
                    };
                    store.setState({
                        [key]: {
                            ...store.getState(key),
                            [cacheKeyValue]: {
                                status: state[cacheKeyValue].status,
                                error: state[cacheKeyValue].error,
                                data: state[cacheKeyValue].data,
                                refresh: createPromise,
                            }
                        }
                    }, `suspense value:${String(key)} rejected`);
                }),
                refresh: createPromise,
                force,
                fromServer: false,
            };
            state[cacheKeyValue] = {
                ...state[cacheKeyValue],
                ...s,
            };
            Promise.resolve().then(() => {
                store.setState({
                    [key]: {
                        ...store.getState(key),
                        [cacheKeyValue]: {
                            status: state[cacheKeyValue].status,
                            error: state[cacheKeyValue].error,
                            data: state[cacheKeyValue].data,
                            refresh: createPromise,
                        }
                    }
                }, `suspense value:${String(key)} start or refresh`);
            });
            return new Promise((resolve, reject) => state[cacheKeyValue].cache.then(() => {
                const temp = state[cacheKeyValue];
                if (temp.status === 'fullfilled') {
                    resolve(temp.data);
                } else {
                    reject(temp.error);
                }
            }));
        }, []);

        const { data, status } = useZustandStore((s) => (
            {
                status: s[key][cacheKey]?.status || 'pending',
                data: s[key][cacheKey]?.data,
            }
        ), (a, b) => a.status === b.status && shallow(a.data, b.data));

        const {
            cache,
            fullfilledOnce,
            force,
            error,
            fromLocal,
            fromServer
        } = state[cacheKey];
        const { loadable, manual } = options;

        if (loadable && !force) {
            if (!cache && !manual) {
                createPromise();
            }
            return {
                error,
                data,
                status,
                refresh: createPromise,
                loadScript: undefined,
            };
        }

        const loadScript = createElement('div', {
            dangerouslySetInnerHTML: {
                __html: `<script>
                    window.__ssrstreamingdata__ = window.__ssrstreamingdata__ || {};
                    window.__ssrstreamingdata__['${key + cacheKey}'] = ${JSON.stringify({
    data: state[cacheKey].data,
    status: state[cacheKey].status,
    fromServer: true,
})}
                </script>`
            },
        });

        if (fromServer && typeof window !== 'undefined') {
            if (!state[cacheKey].hydrated) {
                state[cacheKey].hydrated = true;
                // 如果是来自于服务端渲染，那么需要静默的同步到 state 中
                const pre = store.getState();
                const temp = {
                    ...pre,
                    [key]: {
                        ...pre[key],
                        [cacheKey]: {
                            error,
                            data: state[cacheKey].data,
                            status: state[cacheKey].status,
                            refresh: createPromise,
                        }
                    }
                };
                Object.keys(computedCaches).forEach((k) => {
                    pre[k] = computedCaches[k].action(temp);
                    // eslint-disable-next-line no-param-reassign
                    computedCaches[k].data = pre[k];
                });
                pre[key][cacheKey] = temp[key][cacheKey];
            }
            return {
                error,
                data: state[cacheKey].data,
                status: state[cacheKey].status,
                refresh: createPromise,
                loadScript,
            };
        }

        if (!cache) {
            if (!manual) {
                if (!fromLocal) {
                    // eslint-disable-next-line @typescript-eslint/no-throw-literal
                    throw createPromise();
                } else {
                    createPromise();
                }
            }
            return {
                error,
                data,
                status,
                refresh: createPromise,
                loadScript,
            };
        }

        if (fromLocal) {
            return {
                error,
                data,
                status,
                refresh: createPromise,
                loadScript,
            };
        }

        if (fullfilledOnce && !force) {
            return {
                error,
                data,
                status,
                refresh: createPromise,
                loadScript,
            };
        }

        switch (status) {
            case 'pending': throw cache;
            case 'fullfilled': return {
                error,
                data,
                status,
                refresh: createPromise,
                loadScript,
            };
            case 'rejected': throw error;
            default: break;
        }

        return {
            error,
            data,
            status,
            refresh: createPromise,
            loadScript,
        };
    };

    return useStoreSuspense;
};

export default getSuspense;
