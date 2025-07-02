import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuration optimisée pour la production
export default defineConfig({
  plugins: [react()],
  mode: 'production',
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['react', 'react-dom', '@reduxjs/toolkit', 'react-redux'],
  },
  define: {
    global: 'globalThis',
    'process.env.NODE_ENV': '"production"',
  },
  resolve: {
    alias: {
      'pdfjs-dist': 'pdfjs-dist/legacy/build/pdf',
    },
  },
  build: {
    target: 'es2015',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
          ui: ['framer-motion', 'lucide-react'],
          pdf: ['pdfjs-dist', 'mammoth'],
          supabase: ['@supabase/supabase-js'],
          ai: ['@google/generative-ai', 'groq-sdk'],
        },
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || 'asset';
          const info = name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096,
  },
  server: {
    port: 5173,
    host: true,
  },
}); 