import {
    createContext as reactCreateContext,
    useContext,
} from 'react';
import { UseStore, UseStoreSuspense, StoreApi, Convert } from './types';

const createContext = <T extends {}>() => {
    const context = reactCreateContext<{
        useStore?: UseStore<T>,
        useStoreSuspense?: UseStoreSuspense<T>,
        useStoreLoadable?: UseStoreSuspense<T>,
        store?: StoreApi<Convert<T>>,
    }>({});

    const Provider = context.Provider;

    const useStore: UseStore<T> = (f, equalityFn?): any => {
        const value = useContext(context);
        if (value.useStore) {
            return value.useStore(f, equalityFn);
        }
        throw new Error('provider not exist');
    };

    const useStoreLoadable: UseStoreSuspense<T> = (...args) => {
        const value = useContext(context);
        if (value.useStoreLoadable) {
            return value.useStoreLoadable(...args);
        }
        throw new Error('provider not exist');
    };

    const useStoreSuspense:UseStoreSuspense<T> = (...args) => {
        const value = useContext(context);
        if (value.useStoreSuspense) {
            return value.useStoreSuspense(...args);
        }
        throw new Error('provider not exist');
    };

    const getStore:() => StoreApi<Convert<T>> | undefined = () => {
        const value = useContext(context);
        if (!value) {
            throw new Error('provider not exist');
        }
        if (value.store) {
            return value.store;
        }
        throw new Error('provider not exist');
    };

    return {
        Provider,
        useStore,
        useStoreLoadable,
        useStoreSuspense,
        getStore,
    };
};

export default createContext;
