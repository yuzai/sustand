declare const _default: <T, S, R>(action: (...parmas: any[]) => Promise<S>, options?: {
    selector?: ((state: T) => R) | undefined;
    initialValue?: S | undefined;
    equalityFn?: ((a: R, b: R) => boolean) | undefined;
}) => {
    action: (...parmas: any[]) => Promise<S>;
    selector: ((state: T) => R) | undefined;
    equalityFn: (a: R, b: R) => boolean;
    initialValue: NonNullable<S> | undefined;
    sustand_internal_issuspense: boolean;
};
export default _default;
