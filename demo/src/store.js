import create, { compute, suspense, devtools, persist } from 'sustand';

const { useStore, useStoreSuspense, store, useStoreLoadable } = create(
    (set, get) => ({
        counta: 1,
        countb: 1,
        countc: 1,
        countd: 1,
        setCountD: (f) => {
            if (typeof f === 'function') {
                set({
                    countd: f(get('countd')),
                }, 'test');
            } else {
                set({
                    countd: f,
                }, 'test');
            }
        },
        sumCountAB: compute((state) => {
            return state.counta + state.countb;
        }),
        sumCountABCD: compute((state) => {
            return state.sumCountAB + state.countc + state.countd;
        }),
        suspense1: suspense((args) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve('1' + new Date().getTime() + JSON.stringify(args));
                }, 2000);
            });
        }, {
            selector: (state) => [state.counta, state.countb],
            equalityFn: (a, b) => a[0] === b[0],
        }),
        suspense2: suspense((args) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    reject('2' + new Date().getTime() + JSON.stringify(args));
                }, 2000);
            });
        }, {
            selector: (state) => [state.counta, state.countb],
        }),
    }),
    {
        middwares: [
            devtools({
                name: 'tttt',
            }),
            persist({
                name: 'test',
            }),
        ]
    }
);

export {
    useStore,
    useStoreSuspense,
    useStoreLoadable,
    store,
}

const s = store.getState();

setTimeout(() => {
    console.log(store.getState('counta'));
}, 200);
// const d = useStore(state => state.sumCountAB);

// const susp = useStoreSuspense('suspense2');

// useStore('');

