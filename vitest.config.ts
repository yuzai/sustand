import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            sustand: path.resolve(__dirname, 'src'),
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        include: ['src/__tests__/**/*.test.{ts,tsx}'],
        setupFiles: ['./src/__tests__/setup.ts'],
    },
});
