import { shallow } from 'zustand/shallow';
declare const _default: <T, S>(action: (...parmas: any[]) => Promise<S>, options?: {
    selector?: ((state: T) => any) | undefined;
    initialValue?: any;
    compare?: (<T_1>(a: T_1, b: T_1) => boolean) | undefined;
}) => {
    action: (...parmas: any[]) => Promise<S>;
    selector: ((state: T) => any) | undefined;
    compare: typeof shallow;
    initialValue: any;
    sustand_internal_issuspense: boolean;
};
export default _default;
