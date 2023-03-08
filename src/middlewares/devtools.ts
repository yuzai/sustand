import { devtools as zustandDevtools, DevtoolsOptions } from 'zustand/middleware';
import { StateCreatorMiddware } from '../types';

type Devtools = {
    <T extends {}>(create: StateCreatorMiddware<T>, options?: DevtoolsOptions): StateCreatorMiddware<T>
};

const devtools: Devtools = (
    func,
    options:DevtoolsOptions = {}
) => (zustandDevtools as any)(func, options);

const wrapper = (options: DevtoolsOptions) => {
    return (func) => devtools(func, options);
}

export default wrapper;

export type {
    DevtoolsOptions,
};
