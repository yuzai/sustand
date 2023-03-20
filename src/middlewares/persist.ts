import { persist as zustandPersist, PersistOptions } from 'zustand/middleware';
import { StateCreatorMiddware } from '../types';

export type {
    PersistOptions
};

export type Persist = {
    // eslint-disable-next-line @typescript-eslint/ban-types
    <T extends {}>(
        create: StateCreatorMiddware<T>,
        options?: PersistOptions<T>
    ): StateCreatorMiddware<T>,
};

const persist: Persist = (fn, options?) => {
    type TState = ReturnType<typeof fn>;

    const result = zustandPersist(fn as any, options as PersistOptions<TState>);

    return result as any;
};

const wrapper = (options: PersistOptions<any>) => (fn) => persist(fn, options);

export default wrapper;
