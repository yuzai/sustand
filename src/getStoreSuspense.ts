import { useCallback, useRef, createElement } from 'react';
import { shallow } from 'zustand/shallow';

const getSuspense = ({
    store,
    useZustandStore,
    suspenseCaches
}) => {
    const useStoreSuspense = (key, options:any = {}) => {
        const config = suspenseCaches[key];
        const optionsRef = useRef(options);
        optionsRef.current = options;
        const cacheKey = JSON.stringify(options.args);
        const state = config.state;

        let createPromise: (force?: boolean) => Promise<any>;

        const cacheFromServer = typeof window === 'undefined' ? {}
            // eslint-disable-next-line
            : window?.__ssrstreamingdata__?.[cacheKey] || {};

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
            }

            if (config.selector && typeof config.selector === 'function') {
                store.subscribe((curState, preState) => {
                    const cur = config.selector(curState);
                    const pre = config.selector(preState);
                    const compare = config.compare || shallow;
                    if (!(compare(cur, pre))) {
                        createPromise();
                    }
                });
            }
        }

        createPromise = useCallback((force = false) => {
            const cacheKeyRef = optionsRef.current.args;
            const cacheKeyValue = JSON.stringify(cacheKeyRef);
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
                    });
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
                    })
                }),
                refresh: createPromise,
                force,
                fromServer: false,
            }
            state[cacheKeyValue] = {
                ...state[cacheKeyValue],
                ...s,
            }
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
                })
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

        const { data, status } = useZustandStore((state) => {
            return {
                status: state[key][cacheKey]?.status || 'pending',
                data: state[key][cacheKey]?.data,
            }
        }, (a, b) => a.status === b.status && shallow(a.data, b.data));

        const { cache, fullfilledOnce, force, error, fromLocal, fromServer } = state[cacheKey];
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

        if (fromServer) {
            return {
                error,
                data,
                status,
                refresh: createPromise,
                loadScript,
            };
        }

        if (!cache) {
            if (!manual) {
                if (!fromLocal) {
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
            }
        }

        if (fromLocal) {
            return {
                error,
                data,
                status,
                refresh: createPromise,
                loadScript,
            }
        }

        if (fullfilledOnce && !force) {
            return {
                error,
                data,
                status,
                refresh: createPromise,
                loadScript,
            }
        }

        switch (status) {
            case 'pending': throw cache;
            case 'fullfilled': return {
                error,
                data,
                status: status,
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
        }
    };

    return useStoreSuspense;
}

export default getSuspense;