import { persist as zustandPersist, PersistOptions } from 'zustand/middleware';
import { SetState, GetState, StoreCreateApi } from '../types';

export type {
    PersistOptions
};

export type Persist = {
    <T>(create: (
        set: SetState,
        get: GetState,
        api: StoreCreateApi,
    ) => T, options?: PersistOptions<T>): (set: SetState, get: GetState, api: StoreCreateApi) => T
};

const persist: Persist = (fn, options?) => {
    type TState = ReturnType<typeof fn>;

    const result = zustandPersist(fn as any, {
        ...options,
        merge: (presistState: any, currentState: any) => {
            let res: any = {};
            if (options?.merge) {
                res = options.merge(presistState, currentState);
            } else {
                res = {
                    ...currentState,
                    ...presistState,
                };
            }
            for (const key in res) {
                if (typeof currentState[key] === 'object' && currentState[key]?.sustand_internal_issuspense) {
                    res[key] = {
                        ...currentState[key],
                        ...res[key],
                    };
                }
            }
            return res;
        }
    } as PersistOptions<TState>);

    return result as any;
};

export default persist;
