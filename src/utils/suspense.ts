import { shallow } from 'zustand/shallow';

type SuspenseData = {
    data: any,
    action: any,
    selector: any,
    initialValue: any,
    compare: any,
    sustand_internal_issuspense: boolean,
};

export default (
    action: (...parmas: any[]) => Promise<any>,
    options: {
        selector?: (state: any) => any,
        initialValue?: any,
        compare?: <T>(a: T, b: T) => boolean,
    } = {}
) : SuspenseData => ({
    action,
    selector: options.selector || null,
    initialValue: options.initialValue || undefined,
    compare: options.compare || shallow,
    data: {},
    sustand_internal_issuspense: true,
});
