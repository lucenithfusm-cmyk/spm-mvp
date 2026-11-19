import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import {fileURLToPath, URL} from 'node:url';
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {alias: {'@': fileURLToPath(new URL('./src', import.meta.url))}},
  // The active touch-screen entry lives in premium-v2/sensate-lab. This
  // retained React source must never replace that approved entry during QA.
  build: {outDir: 'dist', emptyOutDir: true, sourcemap: false},
});
