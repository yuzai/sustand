import { useRef } from 'react';

const UNSET: unique symbol = Symbol('sustand_unset');

// 对 zustand v5 的 useStore 单参数形式做适配：
// 把 (selector, equalityFn) 合并成一个自带记忆的选择器。
// 相等时返回上一次的引用，让 useSyncExternalStore 的 Object.is 判定为相等，不 re-render。
const useSelectorWithEquality = <T, R>(
    selector: (state: T) => R,
    equalityFn: (a: R, b: R) => boolean,
) => {
    const prev = useRef<R | typeof UNSET>(UNSET);
    return (state: T): R => {
        const next = selector(state);
        if (prev.current !== UNSET && equalityFn(prev.current as R, next)) {
            return prev.current as R;
        }
        prev.current = next;
        return next;
    };
};

export default useSelectorWithEquality;
