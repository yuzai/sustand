import create, {
    devtools,
    compute,
    Computed,
    Suspensed,
    suspense,
    persist,
    StateCreatorTs,
} from "sustand";

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

const storeSlice: StateCreatorTs<StoreB & Store, Store> = (set, get) => ({
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
        const res = get('f')
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(100);
            }, 1000)
        })
    }),
});

interface StoreB {
    a: number,
    b: number,
    d: Function,
    q: {
        data: number,
    },
    sumAB: Computed<Store, number>,
    // sumABAB: Computed<Store, number>,
    suspenseV1: Suspensed<Store, number>,
}

const createSliceB:StateCreatorTs<StoreB & Store, StoreB> = (set, get) => ({
    a: 1,
    b: 2,
    d: () => {},
    q: {
        data: 2,
    },
    sumAB: compute(
        state => state.a + state.b
    ),
    suspenseV1: suspense(() => {
        const res = get('f');
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(100);
            }, 1000)
        })
    }),
});

type D = StoreB & Store;

const { useStore } = create<StoreB & Store>()((...a) => ({
    ...createSliceB(...a),
    ...storeSlice(...a),
}));
