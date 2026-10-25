import type { ConfigOptions } from '@nuxt/test-utils/playwright';
import { defineConfig } from '@playwright/test';

export default defineConfig<ConfigOptions>({
  testDir: 'tests/e2e/browser',
  fullyParallel: false,
  workers: 1,
  use: {
    trace: 'retain-on-failure',
    nuxt: {
      rootDir: '.',
      build: false,
      server: false,
      host: process.env.TARGET_URL ?? 'http://localhost:3000',
    },
  },
});
