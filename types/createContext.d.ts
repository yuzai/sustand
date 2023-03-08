/// <reference types="react" />
import { UseStore, UseStoreSuspense, StoreApi } from './types';
declare const createContext: <T>() => {
    Provider: import("react").Provider<any>;
    useStore: UseStore<T>;
    useStoreLoadable: UseStoreSuspense<T>;
    useStoreSuspense: UseStoreSuspense<T>;
    useStoreComputed: (...args: any[]) => any;
    getStore: () => StoreApi<T>;
};
export default createContext;
