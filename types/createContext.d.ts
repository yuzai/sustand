/// <reference types="react" />
import { UseStore, UseStoreSuspense, StoreApi, Convert } from './types';
declare const createContext: <T extends {}>(fn?: (() => T) | undefined) => {
    Provider: import("react").Provider<{
        useStore?: UseStore<T> | undefined;
        useStoreSuspense?: UseStoreSuspense<T, {
            args?: any;
            manual?: boolean | undefined;
            loadable?: boolean | undefined;
        }> | undefined;
        useStoreLoadable?: UseStoreSuspense<T, {
            args?: any;
            manual?: boolean | undefined;
            loadable?: boolean | undefined;
        }> | undefined;
        store?: StoreApi<Convert<T>> | undefined;
    }>;
    useStore: UseStore<T>;
    useStoreLoadable: UseStoreSuspense<T, {
        args?: any;
        manual?: boolean | undefined;
        loadable?: boolean | undefined;
    }>;
    useStoreSuspense: UseStoreSuspense<T, {
        args?: any;
        manual?: boolean | undefined;
        loadable?: boolean | undefined;
    }>;
    getStore: () => StoreApi<Convert<T>> | undefined;
};
export default createContext;
