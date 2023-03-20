import { Convert } from '../types';
declare const _default: <T, S>(action: (state: Convert<T>) => S) => {
    action: (state: Convert<T>) => S;
    sustand_internal_iscomputed: boolean;
};
export default _default;
