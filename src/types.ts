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

export type Status = 'pending' | 'fullfilled' | 'rejected';

/** 获取loadable */
export type UseStoreLoadable<T> = {
    <K extends keyof T>(key: K, options?: {
        args?: any,
        manual?: boolean,
    }):
    {
        data: T[K],
        status: Status,
        // error: any,
        refresh: () => void,
    };
};

/** 获取suspense */
export type UseStoreSuspense<T> = {
    <K extends keyof T>(key: K, options?: {
        args?: any,
        manual?: boolean,
        loadable?: boolean,
    }):
    {
        data: T[K] extends { data: any } ? T[K]["data"] : any,
        status: Status,
        // error: any,
        refresh: () => void,
    };
};

export type SetState<T> = {
    (
        partial: T | Partial<T> | { _(state: T): T | Partial<T> }['_'],
        replace?: boolean | undefined
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
    subscribe: (listener: ((state: T, prevState: T) => void)) => void,
    subscribeWithSelector?: (
        selector: (states: T) => any,
        listener: (cur: any, pre: any) => any,
        options?: {
            fireImmediately?: boolean,
            equalityFn?: (cur: T | Partial<T> | any, pre: T | Partial<T> | any) => boolean,
        }
    ) => void,
};

export type Convert<T> = {
    [property in keyof T]:
        T[property] extends { action: (...args: any) => any, sustand_internal_iscomputed: boolean }
            ? ReturnType<T[property]["action"]> :
            T[property] extends { action: (...args: any) => any, sustand_internal_issuspense: boolean }
                ? {
                    data: Awaited<ReturnType<T[property]["action"]>>,
                    status: any,
                    error: any
                } : T[property]
}

export type StateCreator<T> = (set: SetState<any>, get: GetState<any>, api: StoreApi<any>) => T;

export type StateCreatorTs<T extends {}> = (set: SetState<T>, get: GetState<T>, api: StoreApi<T>) => T;

/** 创建 store */
export type Create = {
    <T extends {}>(create: StateCreator<T>, opts?: any): {
        useStore: UseStore<Convert<T>>,
        useStoreSuspense: UseStoreSuspense<Convert<T>>,
        useStoreLoadable: UseStoreLoadable<Convert<T>>,
        store: StoreApi<Convert<T>>
    },
    <T extends {}>(): (create: StateCreatorTs<T>, opts?: any) => {
        useStore: UseStore<Convert<T>>,
        useStoreSuspense: UseStoreSuspense<Convert<T>>,
        useStoreLoadable: UseStoreLoadable<Convert<T>>,
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
