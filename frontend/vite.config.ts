import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: "@", replacement: "/src" }
    ],
  },
  build: {
    // Production optimizations
    minify: 'terser',
    sourcemap: false, // Disable in production for security
    rollupOptions: {
      output: {
        // Code splitting for better caching
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          utils: ['axios', 'zustand'],
          ui: ['lucide-react']
        }
      }
    },
    // Asset optimization
    assetsInlineLimit: 4096, // Inline small assets
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    }
  },
  preview: {
    port: 3000,
    host: true
  }
}) 