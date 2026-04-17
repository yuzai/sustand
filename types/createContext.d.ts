import { UseStore, UseStoreSuspense, StoreApi, Convert } from './types';
declare const createContext: <T extends {}>(fn?: () => T) => {
    Provider: import("react").Provider<{
        useStore?: UseStore<T>;
        useStoreSuspense?: UseStoreSuspense<T>;
        useStoreLoadable?: UseStoreSuspense<T>;
        store?: StoreApi<Convert<T>>;
    }>;
    useStore: UseStore<T>;
    useStoreLoadable: UseStoreSuspense<T>;
    useStoreSuspense: UseStoreSuspense<T>;
    getStore: () => StoreApi<Convert<T>> | undefined;
};
export default createContext;
