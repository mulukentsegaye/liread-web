import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    preserveSymlinks: true,
    alias: {
      '@': path.resolve(__dirname, './src'),
      'epubjs': path.resolve(__dirname, './node_modules/epubjs/dist/epub.js'),
    },
  },
  optimizeDeps: {
    include: ['epubjs'],
  },
  server: {
    port: 3000,
    open: false,
  },
});
