/// <reference types="react" />
declare const getSuspense: ({ store, useZustandStore, suspenseCaches, computedCaches, }: {
    store: any;
    useZustandStore: any;
    suspenseCaches: any;
    computedCaches: any;
}) => (key: any, options?: any) => {
    error: any;
    data: any;
    status: any;
    refresh: (force?: boolean) => Promise<any>;
    loadScript: undefined;
} | {
    error: any;
    data: any;
    status: any;
    refresh: (force?: boolean) => Promise<any>;
    loadScript: import("react").DetailedReactHTMLElement<{
        dangerouslySetInnerHTML: {
            __html: string;
        };
    }, HTMLElement>;
};
export default getSuspense;
