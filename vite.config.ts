import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  // Relative asset paths — the game also works in a subdirectory (GitHub Pages: /sokoban/)
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
