import path from 'path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        root: './src',
        include: ['**/*.{test,spec}.{ts,tsx}'],
        setupFiles: ['./test-setup.ts']
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    }
})
