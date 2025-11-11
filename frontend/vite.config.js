import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/auth/google': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/auth/refresh': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/auth/status': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/auth/logout': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
