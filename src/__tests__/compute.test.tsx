import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import create, { compute } from 'sustand';

describe('compute', () => {
    it('seeds initial value from dependencies', () => {
        const { store } = create<any>()(() => ({
            a: 1,
            b: 2,
            sumAB: compute<any, number>((state: any) => state.a + state.b),
        }));
        expect(store.getState('sumAB')).toBe(3);
    });

    it('recomputes when dependencies change', () => {
        const { store } = create<any>()((set: any) => ({
            a: 1,
            b: 2,
            sumAB: compute<any, number>((state: any) => state.a + state.b),
            setA: (v: number) => set({ a: v }),
        }));
        store.getState('setA')(10);
        expect(store.getState('sumAB')).toBe(12);
    });

    it('reads through useStore(computedKey)', () => {
        const { useStore, store } = create<any>()(() => ({
            a: 1,
            b: 2,
            sumAB: compute<any, number>((state: any) => state.a + state.b),
        }));

        function Viewer() {
            const v = useStore('sumAB');
            return <span data-testid="sum">{v}</span>;
        }
        render(<Viewer />);
        expect(screen.getByTestId('sum').textContent).toBe('3');

        act(() => {
            store.setState({ a: 5 });
        });
        expect(screen.getByTestId('sum').textContent).toBe('7');
    });

    it('setting a computed field is overridden by the subscribe recompute', () => {
        const { store } = create<any>()(() => ({
            a: 1,
            b: 2,
            sumAB: compute<any, number>((state: any) => state.a + state.b),
        }));
        store.setState({ sumAB: 999 } as any);
        expect(store.getState('sumAB')).toBe(3);
    });
});
