type SuspenseData = {
    data: any;
    action: any;
    selector: any;
    initialValue: any;
    compare: any;
    sustand_internal_issuspense: boolean;
};
declare const _default: (action: (...parmas: any[]) => Promise<any>, options?: {
    selector?: ((state: any) => any) | undefined;
    initialValue?: any;
    compare?: (<T>(a: T, b: T) => boolean) | undefined;
}) => SuspenseData;
export default _default;
