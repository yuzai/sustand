import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import create from 'sustand';

describe('useStore (key-based)', () => {
    it('returns [value, setter] for a normal key', () => {
        const { useStore, store } = create<any>()(() => ({ count: 0 }));

        let setter: any;
        function C() {
            const [v, s] = useStore('count') as any;
            setter = s;
            return <span data-testid="v">{v}</span>;
        }
        render(<C />);

        expect(screen.getByTestId('v').textContent).toBe('0');
        expect(typeof setter).toBe('function');

        act(() => { setter(5); });
        expect(store.getState('count')).toBe(5);
        expect(screen.getByTestId('v').textContent).toBe('5');

        act(() => { setter((pre: number) => pre + 1); });
        expect(store.getState('count')).toBe(6);
    });

    it('setter reference is stable across renders', () => {
        const { useStore, store } = create<any>()(() => ({ count: 0 }));

        const setters: any[] = [];
        function C() {
            const [, s] = useStore('count') as any;
            setters.push(s);
            return <span>{store.getState('count')}</span>;
        }
        render(<C />);

        act(() => { store.setState({ count: 1 }); });
        act(() => { store.setState({ count: 2 }); });

        expect(setters.length).toBeGreaterThanOrEqual(3);
        const first = setters[0];
        for (const s of setters) {
            expect(s).toBe(first);
        }
    });
});

describe('useStore (selector fn)', () => {
    it('default equality is shallow — unrelated updates do not re-render', () => {
        const { useStore, store } = create<any>()(() => ({ a: 1, b: 2, c: 3 }));

        let renderCount = 0;
        function C() {
            renderCount += 1;
            const [a, b] = useStore((s: any) => [s.a, s.b]);
            return <span data-testid="v">{a},{b}</span>;
        }
        render(<C />);

        const initial = renderCount;

        // unrelated field change: shallow([1,2], [1,2]) === true → no re-render
        act(() => { store.setState({ c: 99 }); });
        expect(renderCount).toBe(initial);

        // watched field change
        act(() => { store.setState({ a: 10 }); });
        expect(renderCount).toBe(initial + 1);
        expect(screen.getByTestId('v').textContent).toBe('10,2');
    });

    it('object return also shallow-compared', () => {
        const { useStore, store } = create<any>()(() => ({ a: 1, b: 2, c: 3 }));

        let renderCount = 0;
        function C() {
            renderCount += 1;
            const { a, b } = useStore((s: any) => ({ a: s.a, b: s.b }));
            return <span>{a},{b}</span>;
        }
        render(<C />);
        const initial = renderCount;
        act(() => { store.setState({ c: 99 }); });
        expect(renderCount).toBe(initial);
    });
});
