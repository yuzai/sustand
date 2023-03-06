import { memoize } from 'proxy-memoize';

const collect = (
    func: (set: any, get: any, api: any) => any,
    computedCaches,
    suspenseCaches
) => (set, get, api) => {
    const state = func(set, get, api);
    Object.keys(state).forEach((key) => {
        if (state[key] && state[key].sustand_internal_iscomputed) {
            computedCaches[key] = {
                ...state[key],
                data: null,
                action: memoize(state[key].action || (() => null)),
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
    return state;
}

export default collect;
