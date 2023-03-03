import create, { compute } from 'sustand';

const { useStore, useStoreSuspense } = create((set, get) => ({
    counta: 1,
    countb: 1,
    countc: 1,
    countd: 1,
    setCountD: (f) => {
        if (typeof f === 'function') {
            set({
                countd: f(get().countd),
            })
        } else {
            set({
                countd: f,
            })
        }
    },
    sumCountAB: compute((state) => {
        return state.counta + state.countb;
    }),
    sumCountABCD: compute((state) => {
        return state.sumCountAB + state.countc + state.countd;
    }),
}));

export {
    useStore,
    useStoreSuspense,
}

// import create, { suspense, devtools, persist } from 'sustand';
// import produce from 'immer';

// const { useStore, useStoreLoadable, useStoreSuspense, store } = create(devtools(persist((set, get, api) => ({
//     gameInfo: {
//         userA: {
//             baseInfo: {
//                 gender: 'boy',
//                 nickname: 'hhboy',
//             },
//             extraInfo: {
//                 name: 'A',
//                 age: 12,
//             }
//         },
//         useB: {
//             baseInfo: {
//                 gender: 'girl',
//                 nickname: 'hhgirl',
//             },
//             extraInfo: {
//                 name: 'B',
//                 age: 12,
//             }
//         }
//     },
//     changeUserAGender: (gender) => {
//         set(produce(state => {
//             state.gameInfo.userA.baseInfo.gender = gender;
//         }))
//     },
//     count: 0,
//     title: 'initial title',
//     setCount: (f) => {
//         console.log(get('loadingValue'));
//         set({
//             count: f(get('count'))
//         }, 'setCount')
//     },
//     refresh: () => {
//         const { refresh } = get('loadingValue');
//         refresh();
//     },
//     changeTitle: (title) => {
//         set({
//             title,
//         })
//     },
//     obj: {
//         a: 1,
//         b: 2,
//     },
//     setObj: (f) => {
//         if (typeof f === 'function') {
//             const obj = get('obj');
//             set({
//                 obj: f(obj),
//             });
//         } else {
//             set({
//                 obj: f,
//             })
//         }
//     },
//     loadingValue: suspense(() => {
//         return new Promise((resolve, reject) => {
//             setTimeout(() => {
//                 resolve(`${get('count')}${get('title')}${new Date().getTime()}`);
//             }, 1000)
//         });
//     }, {
//         selector: (state) => ({
//             title: state.title,
//             count: state.count,
//         })
//     }),
//     suspenseValue: suspense(
//         (args) => {
//             return new Promise((resolve, reject) => {
//                 setTimeout(() => {
//                     resolve(`${get('count')}${get('title')}${new Date().getTime()}`);
//                 }, 2000)
//             });
//         },
//         {
//             selector: (state) => ({
//                 count: state.count,
//                 title: state.title,
//             }),
//         },
//     ),
// }), {
//     name: 'foot-storage',
// })), {
//     name: 'ttttt',
// });

// // store.subscribeWithSelector((state) => state.count, (cur, pre) => {
// //     console.log(cur, pre);
// // });

// console.log(store.getState());

// export {
//     useStore,
//     useStoreLoadable,
//     useStoreSuspense,
// }