import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { 
    port: 5173, 
    host: true,
    hmr: {
      overlay: false // Disable HMR overlay to prevent caching issues
    },
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  preview: { port: 4173, host: true },
  // Force no caching in development
  optimizeDeps: {
    force: true
  },
  build: {
    // Ensure fresh builds
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
});



