import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL;
if (!baseURL) {
  throw new Error(
    'Brak zmiennej BASE_URL — testy e2e uruchamiaj przez "make test-e2e" (ustawia BASE_URL=http://nginx:8080).',
  );
}

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: [['list']],
  outputDir: 'test-results',
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
