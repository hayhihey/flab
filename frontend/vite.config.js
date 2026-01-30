import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        // Optimize build size
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
            },
        },
        // Split chunks for better caching
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'ui-vendor': ['lucide-react'],
                    'axios-vendor': ['axios'],
                },
            },
        },
        reportCompressedSize: true,
        chunkSizeWarningLimit: 1000,
    },
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:4000',
                changeOrigin: true,
            },
        },
        // Optimize HMR
        hmr: {
            host: 'localhost',
            port: 3000,
        },
    },
    optimizeDeps: {
        // Pre-bundle these for faster startup
        include: [
            'react',
            'react-dom',
            'react-router-dom',
            'axios',
            'lucide-react',
            'zustand',
        ],
    },
});
