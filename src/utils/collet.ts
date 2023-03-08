import { memoize } from 'proxy-memoize';
import {
    StateCreatorTs,
    Convert,
    SetState,
    GetState,
    StoreApi,
} from '../types';

let wrapper = memoize;

// 当不支持 proxy 时，直接走透传逻辑
if (!window.Proxy) {
    wrapper = (fn) => fn;
}

const collect = <T extends {}>(
    func: StateCreatorTs<T>,
    computedCaches,
    suspenseCaches
) => (set: SetState<Convert<T>>, get: GetState<Convert<T>>, api: StoreApi<Convert<T>>): Convert<T> => {
    const state = func(set, get, api);
    Object.keys(state).forEach((key) => {
        if (state[key] && state[key].sustand_internal_iscomputed) {
            computedCaches[key] = {
                ...state[key],
                action: wrapper(state[key].action || (() => null)),
            }
            state[key] = null;
        }
        if (state[key] && state[key].sustand_internal_issuspense) {
            suspenseCaches[key] = {
                ...state[key],
                data: {},
                state: {},
            }
            state[key] = {};
        }
    });
    Object.keys(computedCaches).forEach((key) => {
        state[key] = computedCaches[key].action(state);
    });
    return state as Convert<T>;
}

export default collect;
