declare const useSelectorWithEquality: <T, R>(selector: (state: T) => R, equalityFn: (a: R, b: R) => boolean) => (state: T) => R;
export default useSelectorWithEquality;
