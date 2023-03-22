import create, {
    devtools,
    compute,
    Computed,
    Suspensed,
    suspense,
    persist,
    StateCreator,
    createContext,
} from 'sustand';

interface StoreA {
  a: number,
  b: number,
  sumAB: Computed<Store, number>
}

interface StoreB {
  c: number,
  d: number,
  sumCD: Computed<Store, number>
}

type Store = StoreA & StoreB;

const createSliceA: StateCreator<Store, StoreA> = (set, get) => ({
  a: 1,
  b: 2,
  sumAB: compute((state) => state.a + state.b),
})

const createSliceB: StateCreator<Store, StoreB> = (set, get) => ({
  c: 1,
  d: 2,
  sumCD: compute((state) => state.c + state.d),
})

const { useStore, useStoreSuspense, useStoreLoadable } = create<Store>()((...a) => ({
    ...createSliceA(...a),
    ...createSliceB(...a),
}));
