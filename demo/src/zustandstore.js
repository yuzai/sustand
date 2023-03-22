import { create } from 'zustand';

const useStore = create(() => ({
    a: 1,
    b: 2,
    c: () => {
        const res = useStore.getState();
        useStore.setState((state) => {})
    }
}));

useStore((state) => state.a);