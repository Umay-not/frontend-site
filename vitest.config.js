import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: './backend/__tests__/setup.js',
        include: ['backend/__tests__/**/*.test.js'],
        coverage: {
            reporter: ['text', 'html'],
            exclude: ['node_modules/', 'backend/__tests__/']
        }
    }
});
