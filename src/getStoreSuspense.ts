import { useCallback, useRef } from 'react';
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

        let createPromise;

        if (!state[cacheKey]) {
            state[cacheKey] = {
                status: 'pending',
                data: store.getState(key)[cacheKey]?.data || config.initialValue,
                error: null,
                cache: null,
                refresh: () => {},
                fullfilledOnce: false,
                force: false,
                fromServer: false,
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
                    };
                    store.setState({
                        [key]: {
                            ...store.getState(key),
                            [cacheKeyValue]: {
                                status: state[cacheKeyValue].status,
                                error: state[cacheKeyValue].error,
                                data: state[cacheKeyValue].data,
                            }
                        }
                    });
                }).catch((e) => {
                    state[cacheKeyValue] = {
                        ...state[cacheKeyValue],
                        status: 'rejected',
                        error: e,
                    };
                    store.setState({
                        [key]: {
                            ...store.getState(key),
                            [cacheKeyValue]: {
                                status: state[cacheKeyValue].status,
                                error: state[cacheKeyValue].error,
                                data: state[cacheKeyValue].data,
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

        const { cache, fullfilledOnce, force, error } = state[cacheKey];
        const { loadable, manual } = options;

        if (loadable && !force) {
            if (!cache && !manual) {
                createPromise();
            }
            return {
                data,
                status,
                refresh: createPromise,
            };
        }

        if (!cache) {
            if (!manual) {
                throw createPromise();
            }
            return {
                data,
                status,
                refresh: createPromise,
            }
        }
        if (fullfilledOnce && !force) {
            return {
                data,
                status,
                refresh: createPromise,
            }
        }

        // 未完成过，正常走 suspense 逻辑即可
        switch (status) {
            case 'pending': throw cache;
            case 'fullfilled': return {
                data,
                status: status,
                refresh: createPromise,
            };
            case 'rejected': throw error;
            default: break;
        }

        return {
            data,
            status,
            refresh: createPromise,
        }
    };

    return useStoreSuspense;
}

export default getSuspense;