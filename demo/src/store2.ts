// import 'react';
// import create, {
//     devtools,
//     compute,
//     Computed,
//     Suspensed,
//     suspense,
//     persist,
//     StateCreator,
//     createContext,
// } from "sustand";

// interface Store {
//     a: number,
//     b: number,
//     d: Function,
//     f: {
//         data: number,
//     },
//     sumAB: Computed<Store & StoreB, number>,
//     sumABAB: Computed<Store & StoreB, number>,
//     suspenseV1: Suspensed<Store & StoreB, string>,
// }

// const storeSlice: StateCreator<StoreB & Store, Store> = (set, get) => ({
//     a: 1,
//     b: 2,
//     d: () => {
//         get();
//         set({})
//         set({
//             a: 1,
//         });

//         set({
//             a: 2,
//         })
//     },
//     f: {
//         data: 2,
//     },
//     sumAB: compute(
//         (state) => state.a + state.b,
//     ),
//     sumABAB: compute(
//         (state) => state.a + state.b + state.sumAB,
//     ),
//     suspenseV1: suspense(() => {
//         const res = get('f')
//         return new Promise((resolve) => {
//             setTimeout(() => {
//                 resolve('100');
//             }, 1000)
//         })
//     }, {
//         selector: (state) => state.f,
//         equalityFn: (a, b) => a === b,
//     }),
// });

// interface StoreB {
//     a: number,
//     b: number,
//     d: Function,
//     q: {
//         data: number,
//     },
//     sumAB: Computed<StoreB, number>,
//     // sumABAB: Computed<Store, number>,
//     suspenseV2: Suspensed<StoreB, number>,
// }

// const createSliceB:StateCreator<StoreB & Store, StoreB> = (set, get) => ({
//     a: 1,
//     b: 2,
//     d: () => {},
//     q: {
//         data: 2,
//     },
//     sumAB: compute(
//         state => state.a + state.b + state.
//     ),
//     suspenseV2: suspense(() => {
//         const res = get('f');
//         return new Promise((resolve) => {
//             setTimeout(() => {
//                 resolve(100);
//             }, 1000)
//         })
//     }),
// });

// type D = StoreB & Store;

// const { useStore, useStoreSuspense, useStoreLoadable } = create<StoreB & Store>()((...a) => ({
//     ...createSliceB(...a),
//     ...storeSlice(...a),
// }));

// const { useStore: uuu, Provider } = createContext<Store>();

// // const res = uuu('sumAB')

// const res = useStore('suspenseV1')

// const res = useStore('suspenseV2')
