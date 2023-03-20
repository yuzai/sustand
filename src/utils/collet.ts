import { memoize } from 'proxy-memoize';
import {
    StateCreator,
    Convert,
    StateCreatorMiddware,
} from '../types';

let wrapper = (fn) => memoize(fn, {
    noWeakMap: true,
});

// 当不支持 proxy 时，直接走透传逻辑
if (typeof window !== 'undefined' && !window?.Proxy) {
    wrapper = (fn) => fn;
}

// eslint-disable-next-line @typescript-eslint/ban-types
const collect = <T extends {}>(
    func: StateCreator<T>,
    computedCaches,
    suspenseCaches
): StateCreatorMiddware<Convert<T>> => (set, get, api) => {
        const state = func(set, get, api);
        Object.keys(state).forEach((key) => {
            if (state[key] && state[key].sustand_internal_iscomputed) {
                // eslint-disable-next-line no-param-reassign
                computedCaches[key] = {
                    ...state[key],
                    action: wrapper(state[key].action || (() => null)),
                };
                state[key] = null;
            }
            if (state[key] && state[key].sustand_internal_issuspense) {
                // eslint-disable-next-line no-param-reassign
                suspenseCaches[key] = {
                    ...state[key],
                    data: {},
                    state: {},
                };
                state[key] = {};
            }
        });
        Object.keys(computedCaches).forEach((key) => {
            state[key] = computedCaches[key].action(state);
        });
        return state as Convert<T>;
    };

export default collect;
