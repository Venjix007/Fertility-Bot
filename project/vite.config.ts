import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['react', 'react-dom', 'react-router-dom'],
    force: true
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 5173,
      protocol: 'ws',
      host: 'localhost'
    },
    watch: {
      usePolling: true,
      interval: 100
    }
  },
  preview: {
    port: 5173,
    strictPort: true,
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react'],
          form: ['react-hook-form', '@hookform/resolvers', 'zod']
        }
      }
    }
  }
});
