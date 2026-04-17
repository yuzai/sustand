import { describe, it, expect } from 'vitest';
import { Suspense } from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import create, { suspense } from 'sustand';

const flush = () => new Promise((r) => setTimeout(r, 0));

describe('suspense', () => {
    it('suspends on first read, then renders resolved data', async () => {
        let resolveIt: (v: string) => void = () => {};
        const { useStoreSuspense } = create<any>()(() => ({
            data: suspense<any, string, any>(
                () => new Promise<string>((r) => { resolveIt = r; })
            ),
        }));

        function Child() {
            const { data } = useStoreSuspense('data');
            return <span data-testid="out">got:{data}</span>;
        }

        render(
            <Suspense fallback={<span data-testid="fallback">loading</span>}>
                <Child />
            </Suspense>
        );

        expect(screen.getByTestId('fallback')).toBeInTheDocument();

        await act(async () => {
            resolveIt('hello');
            await flush();
            await flush();
        });

        await waitFor(() => {
            expect(screen.getByTestId('out').textContent).toBe('got:hello');
        });
    });

    it('refresh() is silent — no fallback, data updated in place', async () => {
        let counter = 0;
        const { useStoreSuspense } = create<any>()(() => ({
            data: suspense<any, string, any>(
                () => Promise.resolve(`v${++counter}`)
            ),
        }));

        let refreshRef: ((force?: boolean) => void) | null = null;
        function Child() {
            const { data, refresh } = useStoreSuspense('data');
            refreshRef = refresh;
            return <span data-testid="out">data:{data}</span>;
        }

        render(
            <Suspense fallback={<span data-testid="fallback">loading</span>}>
                <Child />
            </Suspense>
        );

        await waitFor(() => {
            expect(screen.getByTestId('out').textContent).toBe('data:v1');
        });

        await act(async () => {
            refreshRef!();
            await flush();
            await flush();
        });

        // never shows fallback again
        expect(screen.queryByTestId('fallback')).toBeNull();
        await waitFor(() => {
            expect(screen.getByTestId('out').textContent).toBe('data:v2');
        });
    });

    it('different args produce independent cache entries', async () => {
        const calls: any[] = [];
        const { useStoreSuspense } = create<any>()(() => ({
            data: suspense<any, string, any>((args: any) => {
                calls.push(args);
                return Promise.resolve(`for:${JSON.stringify(args)}`);
            }),
        }));

        function Child({ args, tid }: any) {
            const { data } = useStoreSuspense('data', { args });
            return <span data-testid={tid}>{data}</span>;
        }

        render(
            <>
                <Suspense fallback={<span>l1</span>}>
                    <Child args={{ id: 1 }} tid="one" />
                </Suspense>
                <Suspense fallback={<span>l2</span>}>
                    <Child args={{ id: 2 }} tid="two" />
                </Suspense>
            </>
        );

        await waitFor(() => {
            expect(screen.getByTestId('one').textContent).toBe('for:{"id":1}');
            expect(screen.getByTestId('two').textContent).toBe('for:{"id":2}');
        });
        expect(calls).toHaveLength(2);
    });
});
