import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-book-file-handler',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url && req.url.startsWith('/api/book-file')) {
            try {
              const { default: handler } = await import('./api/book-file');
              await handler(req, res);
            } catch (err) {
              console.error('API Error in dev server:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Internal Server Error' }));
            }
            return;
          }
          next();
        });
      },
    },
  ],
  resolve: {
    preserveSymlinks: true,
    alias: {
      '@': path.resolve(__dirname, './src'),
      'epubjs': path.resolve(__dirname, './node_modules/epubjs/dist/epub.js'),
      'JSZip': path.resolve(__dirname, './node_modules/jszip/dist/jszip.min.js'),
      'jszip': path.resolve(__dirname, './node_modules/jszip/dist/jszip.min.js'),
    },
  },
  optimizeDeps: {
    include: ['epubjs', 'jszip'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-icons': ['lucide-react'],
          'vendor-charts': ['recharts'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-reader': ['pdfjs-dist', 'epubjs', 'jszip'],
        },
      },
    },
    chunkSizeWarningLimit: 1200,
  },
  server: {
    port: 3000,
    open: false,
  },
});
