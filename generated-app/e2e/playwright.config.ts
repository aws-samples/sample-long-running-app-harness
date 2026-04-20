import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: 1,
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:6174',
    trace: 'on-first-retry',
  },
});
