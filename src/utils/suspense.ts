import { shallow } from 'zustand/shallow';

export default <T, S>(
    action: (...parmas: any[]) => Promise<S>,
    options: {
        selector?: (state: T) => any,
        initialValue?: any,
        compare?: <T>(a: T, b: T) => boolean,
    } = {}
) => ({
    action,
    selector: options.selector,
    compare: options.compare || shallow,
    initialValue: options.initialValue || undefined,
    sustand_internal_issuspense: true,
});
