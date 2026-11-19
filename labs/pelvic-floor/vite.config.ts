import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import {fileURLToPath, URL} from 'node:url';
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {alias: {'@': fileURLToPath(new URL('./src', import.meta.url))}},
  // The active entry selects the approved weekly flow or the library bundle.
  // Compile this source in isolation; publishing it requires a separate review.
  build: {outDir: 'dist', emptyOutDir: true, sourcemap: false},
});
