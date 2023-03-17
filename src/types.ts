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
                        refresh: (force?: boolean) => Promise<Awaited<ReturnType<T[property]["action"]>>>,
                    }
                } : T[property]
}

/** 筛选满足 C 的 keys */
type Filter<T, C> = {
    [P in keyof T]: T[P] extends C ? P : never
}[keyof T];

/** 筛选 suspense 的 keys */
export type FilterSuspenseKey<T> = Filter<T, { action: (...args: any) => any, sustand_internal_issuspense: boolean }>;

/** 筛选 computed 的 keys */
export type FilterComputedKey<T> = Filter<T, { action: (...args: any) => any, sustand_internal_iscomputed: boolean }>;

/** 筛选非 computed 和 非 suspense 的keys */
export type FilterNormalKey<T> = Exclude<keyof T, FilterSuspenseKey<T> | FilterComputedKey<T>>;

/** 标记 suspense 的原始类型 */
export type SuspensedConvert<T> = {
    [P in FilterSuspenseKey<T>]: {
        // TODO: 此处不知为何 ts 没有自动识别出来 T[P] 一定是具有 action 属性的
        data: T[P] extends { action: (...args: any) => any } ? Awaited<ReturnType<T[P]["action"]>> : never,
        sustand_internal_issuspense: true,
    }
}

/** 比较器函数 */
export type EqualityFn<T> = (preState: T, nextState: T) => boolean;

/** 获取普通状态 */
export type UseStore<T> = {
    <F extends (state: Convert<T>) => any>(selector: F, equalityFn?: EqualityFn<ReturnType<F>>): ReturnType<F>;
    <K extends FilterNormalKey<T> | FilterComputedKey<T>>(key: K, equalityFn?: EqualityFn<T[K]>):
    [state: T[K], setState: T[K] | ((state: T[K]) => T[K])];
};

export type UseStoreSuspense<T, O = {
    args?: any,
    manual?: boolean,
    loadable?: boolean,
}> = <S extends SuspensedConvert<T>, K extends keyof S>(key: K, options?: O) => {
    data: S[K]['data'],
    status: Status,
    error: any,
    refresh: (force?: boolean) => Promise<S[K]['data']>,
    loadScript: undefined | React.DetailedReactHTMLElement<{ dangerouslySetInnerHTML: { __html: string; }; }, HTMLElement>,
};

/** 获取loadable */
export type UseStoreLoadable<T> = UseStoreSuspense<T, {
    args?: any,
    manual?: boolean,
}>;

export type SetState<T> = {
    (
        partial: T | Partial<T> | ((state: T) => T | Partial<T>),
        desc?: string,
        replace?: boolean
    ): void
}

export type GetState<T> = {
    <K extends keyof T>(key: K): T[K];
    <F extends (...args: any[]) => any>(selector: F): ReturnType<F>;
    (): T,
}

export type GetWrapper = <T>(f: () => T) => GetState<T>;

export type StoreApi<T> = {
    getState: GetState<T>,
    setState: SetState<T>,
    subscribe: (listener: ((state: T, prevState: T) => void)) => () => void,
    subscribeWithSelector?: <F extends (state: T) => any, S extends ReturnType<F>>(
        selector: F,
        listener: (cur: S, pre: S) => void,
        options?: {
            fireImmediately?: boolean,
            equalityFn?: EqualityFn<S>,
        }
    ) => void,
};

/** 为 js 准备的类型声明 */
export type StateCreator<T> = (set: SetState<any>, get: GetState<any>, api: StoreApi<any>) => T;

/** 为原始 zustand 准备的类型声明 */
export type StateCreatorMiddware<T extends {}> = (set: SetState<T>, get: GetState<T>, api: StoreApi<T>) => T;

/** 为本项目准备的类型声明 */
export type StateCreatorTs<T extends {}, S = T> = (set: SetState<Convert<S & T>>, get: GetState<Convert<S & T>>, api: StoreApi<Convert<S & T>>) => S;

export type CreateOptions = {
    middwares?: (<T extends {}>(fn: StateCreatorMiddware<T>) => StateCreatorMiddware<T>)[]
}

/** 创建 store */
export type Create = {
    <T extends {}>(create: StateCreator<T>, opts?: CreateOptions): {
        useStore: UseStore<T>,
        useStoreSuspense: UseStoreSuspense<T>,
        useStoreLoadable: UseStoreLoadable<T>,
        store: StoreApi<Convert<T>>
    },
    <T extends {}>(): (create: StateCreatorTs<T>, opts?: CreateOptions) => {
        useStore: UseStore<T>,
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
    equalityFn: EqualityFn<any>,
}

declare global {
    interface Window {
        __ssrstreamingdata__: {
            [key: string]: string,
        }
    }
}
