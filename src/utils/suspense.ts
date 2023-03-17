import { shallow } from 'zustand/shallow';

export default <T, S, R>(
    action: (...parmas: any[]) => Promise<S>,
    options: {
        selector?: (state: T) => R,
        initialValue?: S,
        equalityFn?: (a: R, b: R) => boolean,
    } = {}
) => ({
    action,
    selector: options.selector,
    equalityFn: options.equalityFn || shallow,
    initialValue: options.initialValue || undefined,
    sustand_internal_issuspense: true,
});
