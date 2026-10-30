import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.ts', 'tests/guard/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        plugins: [svelte()],
        resolve: { conditions: ['browser'] },
        test: {
          name: 'integration',
          include: ['tests/integration/**/*.test.ts'],
          environment: 'jsdom',
          setupFiles: ['tests/integration/setup.ts'],
        },
      },
    ],
  },
});
