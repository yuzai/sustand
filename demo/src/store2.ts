import create, { devtools, compute, Computed, Suspensed, suspense } from "sustand";

interface Store {
    a: number,
    b: number,
    d: Function,
    f: {
        data: number,
    },
    sumAB: Computed<Store, number>,
    sumABAB: Computed<Store, number>,
    suspenseV1: Suspensed<Store, number>,
}

const { store, useStore, useStoreSuspense, useStoreLoadable } = create<Store>()((set, get) => ({
    a: 1,
    b: 2,
    d: () => {
        get();
        set({})
        set({
            a: 1,
        });

        set({
            a: 2,
        })
    },
    f: {
        data: 2,
    },
    sumAB: compute(
        (state) => state.a + state.b,
    ),
    sumABAB: compute(
        (state) => state.a + state.b + state.sumAB,
    ),
    suspenseV1: suspense(() => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(100);
            }, 1000)
        })
    }),
}), {
    middwares: [
        devtools({
            name: 'ttt',
        })
    ]
});


const s = store.getState('sumAB')

const d = store.getState('suspenseV1');

const all = store.getState();

const res = useStoreLoadable('suspenseV1');

const a = useStore(state => state.suspenseV1.test.data)