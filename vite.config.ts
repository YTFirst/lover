import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'frontend',
  server: {
    port: 5050,
    proxy: {
      '/api': {
        target: 'http://localhost:5050',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: '../dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'frontend/index.html')
      },
      output: {
        manualChunks: {
          'vendor': ['crypto-js']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'frontend'),
      '@modules': resolve(__dirname, 'frontend/modules'),
      '@backend': resolve(__dirname, 'backend'),
      '@config': resolve(__dirname, 'config')
    }
  },
  optimizeDeps: {
    include: ['crypto-js']
  }
});
