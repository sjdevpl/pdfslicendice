import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Repository name for GitHub Pages base path
// Note: Must match the actual repository name exactly (case-sensitive)
const REPO_NAME = 'pdfslicendice';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES === 'true' ? `/${REPO_NAME}/` : '/',
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    target: 'esnext',
    assetsDir: 'assets',
    // Ensure assets are properly referenced with base path
    rollupOptions: {
      output: {
        // Ensure consistent asset naming
        assetFileNames: 'assets/[name].[hash][extname]',
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
      },
    },
  },
  optimizeDeps: {
    include: ['pdfjs-dist']
  }
});
