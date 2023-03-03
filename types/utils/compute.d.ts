type SuspenseData = {
    data: any;
    action: any;
    sustand_internal_iscomputed: boolean;
};
declare const _default: (action: (...parmas: any[]) => Promise<any>, options?: {
    initialValue?: any;
}) => SuspenseData;
export default _default;
