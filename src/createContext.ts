import {
    createContext as reactCreateContext,
    useContext,
} from 'react';
import { UseStore, UseStoreSuspense, StoreApi } from './types';

const createContext = <T>() => {
    const context = reactCreateContext<any>(undefined);

    const Provider = context.Provider;

    const useStore: UseStore<T> = (...args: any[]) => {
        const value = useContext(context);
        if (!value) {
            throw new Error('provider not exist');
        }
        return value.useStore(...args);
    };

    const useStoreLoadable:UseStoreSuspense<T> = (...args) => {
        const value = useContext(context);
        if (!value) {
            throw new Error('provider not exist');
        }
        return value.useStoreLoadable(...args);
    };

    const useStoreSuspense:UseStoreSuspense<T> = (...args) => {
        const value = useContext(context);
        if (!value) {
            throw new Error('provider not exist');
        }
        return value.useStoreSuspense(...args);
    };

    const useStoreComputed = (...args) => {
        const value = useContext(context);
        if (!value) {
            throw new Error('provider not exist');
        }
        return value.useStoreComputed(...args);
    };

    const getStore:() => StoreApi<T> = () => {
        const value = useContext(context);
        if (!value) {
            throw new Error('provider not exist');
        }
        return value.store;
    };

    return {
        Provider,
        useStore,
        useStoreLoadable,
        useStoreSuspense,
        useStoreComputed,
        getStore,
    };
};

export default createContext;
