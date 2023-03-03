type SuspenseData = {
    data: any,
    action: any,
    sustand_internal_iscomputed: boolean,
};

export default (
    action: (...parmas: any[]) => Promise<any>,
    options: {
        initialValue?: any,
    } = {}
) : SuspenseData => ({
    action,
    data: {},
    sustand_internal_iscomputed: true,
});
