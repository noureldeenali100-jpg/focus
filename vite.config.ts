import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2015',
    minify: 'terser',
    cssTarget: 'chrome61', // Ensures better compatibility for CSS features
    outDir: 'dist',
    sourcemap: false, // Recommended for production to reduce bundle size
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
  define: {
    // Vite does not expose process.env by default. 
    // This allows the @google/genai SDK to access the API key via process.env.API_KEY as required.
    'process.env.API_KEY': JSON.stringify(process.env.VITE_API_KEY || process.env.API_KEY),
  },
  server: {
    headers: {
      // Prevents issues with Cross-Origin resource sharing on some mobile browsers
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
});