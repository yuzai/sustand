import { create as createZustand } from 'zustand';
import { useCallback } from 'react';
import { shallow } from 'zustand/shallow';
import setMiddleware from './middlewares/setMiddware';
import {
    Create,
    UseStore,
    UseStoreSuspense,
    StoreApi,
    StateCreatorTs,
    Convert,
    SetState,
    GetState,
    UseStoreLoadable,
    CreateOptions,
} from './types';
import getSuspense from './getStoreSuspense';
import collect from './utils/collet';
import getMiddleware from './utils/getMiddleware';

const createSustand = <T extends {}>(func: StateCreatorTs<T>, options?: CreateOptions<Convert<T>>) => {
    const computedCaches = {};
    const suspenseCaches = {};
    const lazySetActions = {};
    
    let createFn = collect<T>(func, computedCaches, suspenseCaches);

    createFn = setMiddleware(createFn);

    createFn = getMiddleware(createFn);

    options?.middwares?.forEach((middware) => {
        createFn = middware(createFn);
    });


    // @ts-ignore
    const useZustandStore = createZustand<Convert<T>>(createFn);

    // 单独将 store 的方法导出
    const store: StoreApi<Convert<T>> = {
        // 用 as 进行强制类型转换，TODO: 参考 zustand mutators 写法修改类型
        getState: useZustandStore.getState as GetState<Convert<T>>,
        // 用 as 进行强制类型转换
        setState: useZustandStore.setState as SetState<Convert<T>>,
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
        computedCaches,
    });

    const useStoreLoadable: UseStoreLoadable<T> = (key, options?) => {
        return getSuspense({
            store,
            useZustandStore,
            suspenseCaches,
            computedCaches,
        })(key, {
            ...options,
            loadable: true,
        })
    }

    const useStore: UseStore<T> = (f?, equalityFn?): any => {
        let fn = f;
        // 比较函数默认全部 shallow
        let isEqual = equalityFn || shallow;
        // useStore('key') 时，将比较函数整理成仅比较 state
        const equalityFnData = useCallback((a, b) => shallow(a[0], b[0]), []);
        if (typeof f === 'string') {
            const state = store.getState();
            let setState = lazySetActions[f];
            if (!setState) {
                lazySetActions[f] = (v: Function | any) => {
                    if (typeof v === 'function') {
                        if (f in state) {
                            store.setState({
                                [f]: v(store.getState()[f])
                            } as Partial<Convert<T>>, `setState: ${f}`);
                        }
                    } else {
                        store.setState({
                            [f]: v
                        } as Partial<Convert<T>>, `setState: ${f}`);
                    }
                };
                setState = lazySetActions[f];
            }
            // TODO:如果选择的属性是函数 or suspense value，发出警告
            // 惰性生成 setState
            fn = (state) => [state[f], setState];
            isEqual = equalityFn || equalityFnData;
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

const create = (<T extends {}>(createState?: StateCreatorTs<T>, options?: CreateOptions<Convert<T>>) =>
    createState ? createSustand(createState, options) : createSustand) as Create;

export default create;

