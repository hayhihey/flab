import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

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
    // Report compressed size
    reportCompressedSize: true,
    // Increase chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
  server: {
    // Enable compression
    middlewareMode: false,
    // Optimize HMR
    hmr: {
      host: 'localhost',
      port: 3001,
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
})
