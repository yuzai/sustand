import { devtools as zustandDevtools, DevtoolsOptions } from 'zustand/middleware';
import { SetState, GetState, StoreCreateApi } from '../types';

const setMiddleware = (func) => (set, get, api) => {
    const originSetState = api.setState;

    // eslint-disable-next-line
    api.setState = (partial, desc: string) => {
        return originSetState(partial, false, desc);
    };

    const states = func(api.setState, get, api);

    return states;
};

type Devtools = {
    <T>(create: (
        set: SetState,
        get: GetState,
        api: StoreCreateApi
    ) => T, options?: DevtoolsOptions): (set: SetState, get: GetState, api: StoreCreateApi) => T
};

const devtools: Devtools = (
    func: any,
    options:DevtoolsOptions = {}
) => (zustandDevtools as any)(setMiddleware(func), options);

const wrapper = (options) => {
    return (func) => devtools(func, options);
}

export default wrapper;

export type {
    DevtoolsOptions,
};
