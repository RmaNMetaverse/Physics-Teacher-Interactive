import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e', fullyParallel: false, retries: 0,
  // WebGL, refraction, and math workers compete for the same GPU/CPU resources.
  workers: 2,
  reporter: 'list', use: { baseURL: 'http://127.0.0.1:5173', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) } }],
  // Release checks exercise the same built assets that GitHub Pages serves.
  // A dev-server dependency optimization reload can cancel offscreen workers.
  webServer: { command: 'npm run preview -- --port 5173', url: 'http://127.0.0.1:5173', reuseExistingServer: false },
});
