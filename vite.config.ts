import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/nova-learn/', // This matches your GitHub repository name
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 3000,
  }
});