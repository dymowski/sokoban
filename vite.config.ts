import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  // Względne ścieżki assetów — gra działa też w podkatalogu (GitHub Pages: /sokoban/)
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
