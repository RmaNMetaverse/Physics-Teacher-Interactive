import { expect, test } from '@playwright/test';

test('configured signed-out visitors see the progress-sync prompt and can continue locally', async ({ page }) => {
  await page.goto('/#/explore');
  const gate = page.getByRole('dialog', { name: 'Sign in to sync progress' });
  if (await gate.count() === 0) {
    test.skip(true, 'Cloud authentication is not configured for this build.');
    return;
  }

  await expect(gate).toBeVisible();
  await expect(page.getByRole('button', { name: 'Google' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'GitHub' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue without signing in' }).click();
  await expect(gate).not.toBeVisible();
  await expect(page.getByRole('status')).toContainText('sign in later from the avatar');

  await page.getByRole('button', { name: 'Sign in or register' }).click();
  await expect(page.getByRole('dialog', { name: 'Account and cloud sync' })).toBeVisible();
});
