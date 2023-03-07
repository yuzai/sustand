import { create as createZustand } from 'zustand';
import { useCallback } from 'react';
import { shallow } from 'zustand/shallow';
import {
    Create,
    UseStore,
    UseStoreSuspense,
    StoreApi,
    StateCreatorTs,
    Convert,
    StateCreatorMiddware
} from './types';
import getSuspense from './getStoreSuspense';
import collect from './utils/collet';
import getWrapper from './utils/getWrapper';

type Options = {
    middwares?: (<T extends {}>(fn: StateCreatorMiddware<T>) => StateCreatorMiddware<T>)[]
}

const createSustand = <T extends {}>(func: StateCreatorTs<T>, options?: Options) => {
    const computedCaches = {};
    const suspenseCaches = {};
    const lazySetActions = {};
    
    let createFn = collect<T>(func, computedCaches, suspenseCaches) as StateCreatorMiddware<T>;

    options?.middwares?.forEach((middware) => {
        createFn = middware(createFn);
    });


    // @ts-ignore
    const useZustandStore = createZustand<Convert<T>>(createFn);

    // 单独将 store 的方法导出
    const store: StoreApi<Convert<T>> = {
        getState: getWrapper(useZustandStore.getState),
        setState: useZustandStore.setState,
        subscribe: useZustandStore.subscribe,
    };

    store.subscribe((state) => {
        Object.keys(computedCaches).forEach((key) => {
            state[key] = computedCaches[key].action(state);
            computedCaches[key].data = state[key];
        });
    });

    const useStoreSuspense: UseStoreSuspense<T> = getSuspense({
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

    const useStore: UseStore<T> = (f?, compare?): any => {
        let fn = f;
        // 比较函数默认全部 shallow
        let isEqual = compare || shallow;
        // useStore('key') 时，将比较函数整理成仅比较 state
        const compareData = useCallback((a, b) => shallow(a[0], b[0]), []);
        if (typeof f === 'string') {
            const state = store.getState();
            let setState = lazySetActions[f];
            if (!setState) {
                lazySetActions[f] = (v: Function | any) => {
                    if (typeof v === 'function') {
                        if (f in state) {
                            store.setState({
                                [f]: v(store.getState()[f])
                            } as Partial<Convert<T>>);
                        }
                    } else {
                        store.setState({
                            [f]: v
                        } as Partial<Convert<T>>);
                    }
                };
                setState = lazySetActions[f];
            }
            // TODO:如果选择的属性是函数 or suspense value，发出警告
            // 惰性生成 setState
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

const create = (<T extends {}>(createState?: StateCreatorTs<Convert<T>>, options?: Options) =>
    createState ? createSustand(createState, options) : createSustand) as Create;

export default create;

