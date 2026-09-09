import { expect, test } from '@playwright/test';

test('publishes the complete foundations and mathematics libraries', async ({ page }) => {
  await page.goto('/#/curriculum');
  await expect(page.getByRole('button', { name: /^Open lesson:/ })).toHaveCount(24);
  await page.goto('/#/math');
  await expect(page.getByRole('button', { name: /^Open math tutorial:/ })).toHaveCount(17);
  await page.getByRole('button', { name: /^Open math tutorial:/ }).first().click();
  await expect(page.getByRole('dialog', { name: /^Math tutorial:/ })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('renders every experiment family with matching graph data', async ({ page }) => {
  const representatives = [
    ['measurement-basics', 'Physical quantities and scale'],
    ['vector-components', 'Resolve an arrow into components'],
    ['projectile-motion', 'Projectile motion'],
    ['net-force', 'Predict acceleration from the net force'],
    ['energy-conservation', 'Keep a complete energy account'],
    ['collision-types', 'Separate momentum conservation from elasticity'],
    ['orbits', 'An orbit is a continuous fall'],
    ['pendulum', 'A pendulum’s small-angle clock'],
  ] as const;
  for (const [id, title] of representatives) {
    await page.goto('/#/lesson/' + id);
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
    await expect(page.locator('canvas')).toBeVisible();
    await page.getByRole('button', { name: 'Graph & data', exact: true }).click();
    await expect(page.getByRole('table', { name: 'Live measurements' })).toBeVisible();
  }
});

test('exports valid local progress and recovers from an unknown route', async ({ page }) => {
  await page.goto('/#/progress');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export progress', exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('physics-teacher-progress.json');
  const stream = await download.createReadStream();
  let json = '';
  for await (const chunk of stream) json += chunk.toString();
  expect(JSON.parse(json)).toMatchObject({ version: 1, completed: [], answers: {}, mathCompleted: [] });
  await page.goto('/#/does-not-exist');
  await expect(page.getByRole('heading', { name: 'Projectile motion', exact: true })).toBeVisible();
});
test('skip navigation keeps the current lesson route and focuses the lesson content', async ({ page }) => {
  await page.goto('/#/lesson/orbits');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to lesson' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#\/lesson\/orbits$/);
  await expect(page.locator('#main-content')).toBeFocused();
  await expect(page.getByRole('heading', { name: 'An orbit is a continuous fall', exact: true })).toBeVisible();
});

test('discards stale stored curriculum and assessment identifiers on startup', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('physics-teacher-interactive-progress-v1', JSON.stringify({
      version: 1,
      completed: ['retired-lesson'],
      answers: { 'retired-assessment': 1 },
      mathCompleted: ['retired-math'],
      lastLesson: 'retired-lesson',
      theme: 'dark',
      savedAt: '2026-09-09T00:00:00.000Z',
    }));
  });
  await page.goto('/#/progress');
  await expect(page.getByText('of 24 lessons completed')).toBeVisible();
  await expect(page.locator('.stat-card').first().locator('strong')).toHaveText('0');
  await expect(page.getByText('challenges answered').locator('..').locator('strong')).toHaveText('0');
  await page.getByRole('button', { name: 'Continue learning' }).click();
  await expect(page).toHaveURL(/#\/lesson\/projectile-motion$/);
});
