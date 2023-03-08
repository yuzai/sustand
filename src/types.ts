export type Status = 'pending' | 'fullfilled' | 'rejected';

/** 初始化时对 state 的转换 */
export type Convert<T> = {
    [property in keyof T]:
        T[property] extends { action: (...args: any) => any, sustand_internal_iscomputed: boolean }
            ? ReturnType<T[property]["action"]> :
            T[property] extends { action: (...args: any) => any, sustand_internal_issuspense: boolean }
                ? {
                    [key: string]: {
                        data: Awaited<ReturnType<T[property]["action"]>>,
                        status: Status,
                        error: any,
                        refresh: (force?: boolean) => Promise<any>,
                    }
                } : T[property]
}

/** 标记 suspense 的原始类型 */
export type SuspensedConvert<T> = {
    [property in keyof T]: T[property] extends { action: (...args: any) => any, sustand_internal_issuspense: boolean } ? {
        data: Awaited<ReturnType<T[property]["action"]>>,
        sustand_internal_issuspense: true,
    } : T[property]
}

/** 比较器函数 */
export type Compare<T> = (preState: T, nextState: T) => boolean;

/** 选择器函数 */
export type Selector<T, S> = (states: T) => S;

/** 获取普通状态 */
export type UseStore<T> = {
    <S>(selector: Selector<T, S>, compare?: Compare<T>): S;
    <K extends keyof T>(key: K, compare?: Compare<T>):
    [state: T[K], setState: T[K] | ((state: T[K]) => T[K])];
};

/** 获取loadable */
export type UseStoreLoadable<T> = {
    <S extends SuspensedConvert<T>, K extends keyof S>(key: K, options?: {
        args?: any,
        manual?: boolean,
    }):
    {
        data: S[K] extends { data: any, sustand_internal_issuspense: boolean } ? S[K]["data"] : never,
        status: Status,
        error: any,
        refresh: (force?: boolean) => Promise<any>,
    };
};

/** 获取suspense */
export type UseStoreSuspense<T> = {
    <S extends SuspensedConvert<T>, K extends keyof S>(key: K, options?: {
        args?: any,
        manual?: boolean,
        loadable?: boolean,
    }):
    {
        data: S[K] extends { data: any, sustand_internal_issuspense: boolean } ? S[K]["data"] : never,
        status: Status,
        error: any,
        refresh: (force?: boolean) => Promise<any>,
    };
};

export type SetState<T> = {
    (
        partial: T | Partial<T> | ((state: T) => T | Partial<T>),
        desc?: string,
        replace?: boolean
    ): void
}

export type GetState<T> = {
    <K extends keyof T>(key: K): T[K];
    <S>(selector: (state: T) => S): S;
    (): T,
}

export type GetWrapper = <T>(f: () => T) => GetState<T>;

export type StoreApi<T> = {
    getState: GetState<T>,
    setState: SetState<T>,
    subscribe: (listener: ((state: T, prevState: T) => void)) => () => void,
    subscribeWithSelector?: <S>(
        selector: (states: T) => S,
        listener: (cur: S, pre: S) => void,
        options?: {
            fireImmediately?: boolean,
            equalityFn?: (cur: S | Partial<S> | any, pre: S | Partial<S> | any) => boolean,
        }
    ) => void,
};

/** 为 js 准备的类型声明 */
export type StateCreator<T> = (set: SetState<any>, get: GetState<any>, api: StoreApi<any>) => T;

/** 为原始 zustand 准备的类型声明 */
export type StateCreatorMiddware<T extends {}> = (set: SetState<T>, get: GetState<T>, api: StoreApi<T>) => T;

/** 为本项目准备的类型声明 */
export type StateCreatorTs<T extends {}> = (set: SetState<Convert<T>>, get: GetState<Convert<T>>, api: StoreApi<Convert<T>>) => T;

/** 创建 store */
export type Create = {
    <T extends {}>(create: StateCreator<T>, opts?: any): {
        useStore: UseStore<Convert<T>>,
        useStoreSuspense: UseStoreSuspense<T>,
        useStoreLoadable: UseStoreLoadable<T>,
        store: StoreApi<Convert<T>>
    },
    <T extends {}>(): (create: StateCreatorTs<T>, opts?: any) => {
        useStore: UseStore<Convert<T>>,
        useStoreSuspense: UseStoreSuspense<T>,
        useStoreLoadable: UseStoreLoadable<T>,
        store: StoreApi<Convert<T>>
    },
};

export type Computed<T, S> = {
    action: (state: Convert<T>) => S,
    sustand_internal_iscomputed: boolean,
}

export type Suspensed<T, S> = {
    action: (...args: any[]) => Promise<S>,
    sustand_internal_issuspense: boolean,
    initialValue?: S,
    selector?: (state: Convert<T>) => any,
    compare: (cur: Convert<T>, pre: Convert<T>) => boolean,
}

declare global {
    interface Window {
        __ssrstreamingdata__: {
            [key: string]: string,
        }
    }
}
