/// <reference types="react" />
declare const createContext: () => {
    Provider: import("react").Provider<any>;
    useStore: (...args: any[]) => any;
    useStoreLoadable: (...args: any[]) => any;
    useStoreSuspense: (...args: any[]) => any;
    useStoreComputed: (...args: any[]) => any;
    getStore: () => any;
};
export default createContext;
