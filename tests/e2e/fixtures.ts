import { expect, test as base } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      sessionStorage.setItem('physics-account-gate-dismissed', 'true');
    });
    await use(page);
  },
});

export { expect };
