
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES === 'true' ? '/Pdfslicendice/' : '/',
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    target: 'esnext'
  },
  optimizeDeps: {
    include: ['pdfjs-dist']
  }
});
