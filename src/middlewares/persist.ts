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

    const result = zustandPersist(fn as any, options as PersistOptions<TState>);

    return result as any;
};

const wrapper = (options?) => {
    return (fn) => {
        return persist(fn, options);
    }
}

export default wrapper;
