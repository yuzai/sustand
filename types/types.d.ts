/** 比较器函数 */
export type Compare<T> = (preState: T, nextState: T) => boolean;
/** 选择器函数 */
export type Selector<T, S> = (states: T) => S;
/** 获取suspense */
export type UseStoreSuspense<T> = {
    <S>(key: keyof T, options?: {
        args?: any;
        initialValue?: S;
        manual?: boolean;
        loadable?: boolean;
    }): {
        data: S;
        status: 'pending' | 'fullfilled' | 'rejected';
        refresh: () => void;
    };
};
/** 获取普通状态 */
export type UseStore<T> = {
    <S>(selector: Selector<T, S>, compare?: Compare<T>): S;
    (key: keyof T, compare?: Compare<T>): [
        state: T[keyof T],
        setState: T[keyof T] | ((state: T[keyof T]) => any)
    ];
};
/** 获取loadable */
type UseStoreLoadable<T> = {
    <S>(key: keyof T, options?: {
        args?: any;
        initialValue?: S;
        manual?: boolean;
        loadable?: boolean;
    }): {
        data: S;
        status: 'pending' | 'fullfilled' | 'rejected';
        refresh: () => void;
    };
};
export type GetState = {
    (getter: string): any;
    <S>(getter: (states: any) => S): S;
};
export type SetState = {
    (partial: {
        [key: string]: any;
    }, desc?: string): void;
    <T>(partial: (states: T) => T | Partial<T>, desc?: string): void;
};
export type StoreApiGetState<T> = {
    (key: keyof T): T[keyof T] | {
        data: any;
        status: 'pending' | 'fullfilled' | 'rejected';
        refresh: () => void;
    } | unknown;
    <S>(selector: (state: T) => S): S;
    (): T;
};
export type StoreApiSetState<T> = {
    (state: T | Partial<T> | any, actionName?: string): void;
    (partial: (states: T) => T | Partial<T>, actionName?: string): void;
};
export type StoreCreateApi = {
    getState: StoreApiGetState<any>;
    setState: StoreApiSetState<any>;
    destroy: () => void;
    subscribe: (listener: ((state: any, prevState: any) => void)) => void;
    subscribeWithSelector?: (selector: (states: any) => any, listener: (cur: any, pre: any) => any, options?: {
        fireImmediately?: boolean;
        equalityFn?: (cur: any | Partial<any> | any, pre: any | Partial<any> | any) => boolean;
    }) => void;
};
export type StoreApi<T> = {
    getState: StoreApiGetState<T>;
    setState: StoreApiSetState<T>;
    destroy: () => void;
    subscribe: (listener: ((state: T, prevState: T) => void)) => void;
    subscribeWithSelector?: (selector: (states: T) => any, listener: (cur: any, pre: any) => any, options?: {
        fireImmediately?: boolean;
        equalityFn?: (cur: T | Partial<T> | any, pre: T | Partial<T> | any) => boolean;
    }) => void;
};
/** 创建 store */
export type Create = {
    <T>(create: (set: SetState, get: GetState, api: StoreCreateApi) => T, opts?: any): {
        useStore: UseStore<T>;
        useStoreSuspense: UseStoreSuspense<T>;
        useStoreLoadable: UseStoreLoadable<T>;
        store: StoreApi<T>;
    };
};
declare global {
    interface Window {
        __ssrstreamingdata__: {
            [key: string]: string;
        };
    }
}
export {};
