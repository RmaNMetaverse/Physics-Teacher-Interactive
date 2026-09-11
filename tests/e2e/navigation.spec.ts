import { expect, test } from '@playwright/test';

test('opens Explore first with one continue action and every open course', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveURL(/#\/explore$/);
  await expect(page.getByRole('heading', { name: 'Explore physics' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Continue learning' })).toHaveCount(1);
  await expect(page.getByRole('link', { name: /^Open course:/ })).toHaveCount(14);
  await expect(page.getByText('Open course', { exact: true })).toHaveCount(14);
  await expect(page.getByRole('link', { name: 'Open course: Physics Foundations' }).locator('..').locator('dd').first()).toHaveText('24 missions');
  await expect(page.getByRole('link', { name: 'Open course: Quantum Physics' }).locator('..').locator('dd').first()).toHaveText('6 missions');

  const navigation = page.getByRole('navigation', { name: 'Main navigation' });
  await expect(navigation.getByRole('link')).toHaveCount(3);
  await expect(navigation.getByRole('link').allTextContents()).resolves.toEqual(['Explore', 'Learn', 'Progress']);
  await expect(page.locator('.sidebar')).toHaveCount(0);
  await expect(page.locator('.lesson-tabs')).toHaveCount(0);
});

test('opens Quantum first and exposes every mission node to native tab order', async ({ page }) => {
  await page.goto('/#/explore');
  await page.getByRole('link', { name: 'Open course: Quantum Physics' }).click();

  await expect(page).toHaveURL(/#\/course\/quantum$/);
  await expect(page.getByRole('heading', { name: 'Quantum Physics' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Learn' }))
    .toHaveAttribute('href', '#/course/quantum');
  const nodes = page.getByRole('list', { name: 'Quantum Physics mission path' }).getByRole('link');
  await expect(nodes).toHaveCount(6);
  await expect(nodes.first()).toHaveAttribute('data-state', 'next');
  await expect(nodes.nth(1)).toHaveAttribute('data-state', 'available');
  await expect(nodes.last()).toHaveAttribute('data-kind', 'checkpoint');
  await nodes.first().focus();
  await expect(nodes.first()).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(nodes.nth(1)).toBeFocused();

  await nodes.first().click();
  await expect(page).toHaveURL(/#\/mission\/quantum\/quantum-light-quanta$/);
  await expect(page.getByRole('link', { name: 'Back to Quantum Physics path' })).toBeVisible();
});

test('filters the course gallery and recovers invalid routes with an announcement', async ({ page }) => {
  await page.goto('/#/explore');
  await page.getByRole('button', { name: 'Modern' }).click();
  await expect(page.getByRole('link', { name: 'Open course: Quantum Physics' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open course: Astrophysics' })).toHaveCount(0);

  await page.goto('/#/course/not-a-course');
  await expect(page).toHaveURL(/#\/explore$/);
  await expect(page.getByRole('status')).toContainText('returned you to Explore');
});

test('skip navigation preserves the current hash route and focuses main content', async ({ page }) => {
  await page.goto('/#/course/quantum');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#\/course\/quantum$/);
  await expect(page.locator('#main-content')).toBeFocused();
});
