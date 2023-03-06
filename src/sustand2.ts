import { create } from 'zustand';
import { useCallback } from 'react';
import { shallow } from 'zustand/shallow';
import getSuspense from './getStoreSuspense';
import collect from './utils/collet';
import getWrapper from './utils/getWrapper';

const createSustand = (func: (set: any, get: any, api: any) => any, {
    middlewars = [],
}) => {
    const computedCaches = {};
    const suspenseCaches = {};
    const lazySetActions = {};
    
    let createFn = collect(func, computedCaches, suspenseCaches);

    middlewars.forEach((middware) => {
        createFn = middware(createFn);
    });

    const useZustandStore = create(createFn);

    // 单独将 store 的方法导出
    const store = {
        getState: getWrapper(useZustandStore.getState),
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

    const useStoreSuspense = getSuspense({
        store,
        useZustandStore,
        suspenseCaches,
    });

    const useStoreLoadable = (key: string, options?) => {
        return getSuspense({
            store,
            useZustandStore,
            suspenseCaches
        })(key, {
            ...options,
            loadable: true,
        })
    }

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
                        console.log(store.setState);
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
        useStoreLoadable,
        store,
    };
}

export default createSustand;
