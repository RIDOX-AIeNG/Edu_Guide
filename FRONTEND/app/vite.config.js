import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  build: {
    // Code splitting — each page becomes its own chunk
    rollupOptions: {
      output: {
        manualChunks: {
          // Heavy libraries in their own chunks (cached separately by CDN)
          'vendor-react':   ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui':      ['lucide-react', 'react-hot-toast'],
          'vendor-charts':  ['recharts'],
          'vendor-forms':   ['axios'],
        },
      },
    },
    // Enable minification + compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,    // remove console.log in production
        drop_debugger: true,
      },
    },
    // Warn if any chunk > 500KB
    chunkSizeWarningLimit: 500,
    // Generate source maps for error tracking (don't serve publicly)
    sourcemap: false,
    // Asset filename hashing for long-lived CDN cache
    assetsDir: 'assets',
  },

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})

