import { expect, test } from './fixtures';

for (const width of [360, 768, 1280]) {
  test(`workspace saves notebooks and renders graphs at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('/#/workspace');
    await expect(page.getByRole('heading', { name: 'Math Workspace', exact: true })).toBeVisible();
    await expect(page.locator('math-field').first()).toBeVisible();
    await page.getByLabel('Notebook title', { exact: true }).fill('Saved experiment');
    await expect(page.getByRole('status').first()).toHaveText('Saved on this device.');
    await page.locator('.workspace-board').scrollIntoViewIfNeeded();
    await expect(page.locator('.workspace-board svg')).toBeVisible({ timeout: 20000 });
    if (width === 360) await page.screenshot({ path: 'test-results/workspace-mobile.png', fullPage: true });
    await page.reload();
    await expect(page.getByLabel('Notebook title', { exact: true })).toHaveValue('Saved experiment');
    await page.getByRole('button', { name: 'Add text', exact: true }).click();
    await page.getByLabel('Explanation or observation').fill('Velocity is the slope of position against time.');
    await expect(page.getByRole('status').first()).toHaveText('Saved on this device.');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test('lecture inventory distinguishes indexing from coverage', async ({ page }) => {
  await page.goto('/#/explore');
  await page.getByRole('link', { name: 'Follow the Stanford lectures', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Curriculum expansion in progress' })).toBeVisible();
  await page.getByLabel('Search courses and lecture titles').fill('Classical Mechanics');
  await expect(page.locator('summary', { hasText: 'Classical Mechanics' })).toHaveCount(2);
});

test('lesson formulas carry their context into a notebook and return to the lesson', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('physics-mission-session-foundations-projectile-motion', JSON.stringify({ curriculumRevision:1, currentStepIndex:3, answers:{}, hintedStepIds:[], expandedMathStepIds:[], completedSimulationStepIds:[], recapCompleted:false })));
  await page.goto('/#/mission/foundations/projectile-motion');
  await page.getByText('Another worked example: test the limits', { exact:true }).click();
  await expect(page.locator('.foundation-enrichment')).toContainText('Horizontal range: 8 m');
  await page.getByRole('button', { name:'Open in workspace', exact:true }).click();
  await expect(page.getByLabel('Notebook title', { exact:true })).toHaveValue('Projectile motion');
  await expect(page.getByRole('link', { name:'Return to lesson', exact:true })).toHaveAttribute('href','#/mission/foundations/projectile-motion');
  await page.getByRole('link', { name:'Return to lesson', exact:true }).click();
  await expect(page.getByRole('heading', { name:'Projectile motion', exact:true })).toBeVisible();
});

test('formula input supports the physical keyboard and graphs export to PNG', async ({ page }) => {
  await page.goto('/#/workspace');
  const field = page.locator('math-field').first();
  await expect(field).toBeVisible();
  await field.click();
  await expect(field).toBeFocused();
  await page.keyboard.press('ControlOrMeta+A'); await page.keyboard.type('2+3');
  await expect(page.getByRole('math', { name:'Calculation result' })).toContainText('5');
  await page.getByRole('button', { name:'Export notebook', exact:true }).click();
  await page.locator('.workspace-board').scrollIntoViewIfNeeded();
  await expect(page.locator('.workspace-board svg')).toBeVisible();
  const download = Promise.race([page.waitForEvent('download'), page.getByRole('alert').waitFor({ state:'visible' }).then(async () => { throw new Error(await page.getByRole('alert').innerText()); })]);
  await page.getByRole('button', { name:'Export PNG', exact:true }).click();
  expect((await download).suggestedFilename()).toBe('physics-graph.png');
});
