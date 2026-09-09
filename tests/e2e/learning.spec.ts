import { expect, test } from '@playwright/test';

test('opens the working lab and preserves experiments through prerequisite math', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Projectile motion', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Play experiment', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pause experiment', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Pause experiment', exact: true }).click();
  const time = await page.getByTestId('simulation-time').textContent();
  await page.getByRole('button', { name: 'Math toolkit', exact: true }).click();
  await page.getByRole('button', { name: /Open math tutorial/ }).first().click();
  await expect(page.getByRole('dialog', { name: /Math tutorial/ })).toBeVisible();
  await page.getByRole('button', { name: 'Return to experiment', exact: true }).click();
  await expect(page.getByTestId('simulation-time')).toHaveText(time!);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Projectile motion', exact: true })).toBeVisible();
});

test('curriculum search and beginner path open real lessons', async ({ page }) => {
  await page.goto('/#/curriculum');
  await page.getByRole('searchbox', { name: 'Search curriculum' }).fill('uncertainty');
  await page.getByRole('button', { name: /Open lesson: Measurement and uncertainty/ }).click();
  await expect(page.getByRole('heading', { name: 'Measurement and uncertainty', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Start from zero', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Physical quantities and scale', exact: true })).toBeVisible();
});

test('offers a readable graph alternative and responsive navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Graph & data', exact: true }).click();
  await expect(page.getByRole('table', { name: 'Live measurements' })).toBeVisible();
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
});
