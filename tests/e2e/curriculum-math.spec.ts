import { expect, test } from './fixtures';

test('friction teaches applied math and opens generic algebra only as optional help on every viewport', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('physics-mission-session-foundations-friction', JSON.stringify({
      curriculumRevision: 1, currentStepIndex: 4, answers: {}, hintedStepIds: [],
      expandedMathStepIds: [], completedSimulationStepIds: [], recapCompleted: false,
    }));
  });
  for (const viewport of [{ width: 320, height: 700 }, { width: 768, height: 1024 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport);
    await page.goto(`/?math-viewport=${viewport.width}#/mission/foundations/friction`);
    const article = page.locator('.mission-step-math');
    await expect(article).toContainText('For N = 30 N and μk = 0.3');
    await expect(article.locator('.formula-reasoning')).toContainText(/static friction/i);
    await expect(article).not.toContainText('2x + 3');
    await page.getByRole('button', { name: 'Teach me the math' }).click();
    await expect(page.getByRole('heading', { name: 'Optional math refreshers' })).toBeVisible();
    await expect(article).toContainText('A horizontal 2 kg block');
    await expect(article.locator('.foundation-visual')).toHaveCount(0);
    await page.getByRole('button', { name: 'Algebra: isolate the unknown', exact: true }).click();
    await expect(article.locator('.math-prereq-view')).toContainText('Subtract 3');
    await page.getByRole('button', { name: /Return to Apply the math/i }).click();
    await page.locator('.foundation-check input').fill('9');
    await page.locator('.foundation-check button', { hasText: 'Check answer' }).click();
    await expect(page.getByRole('button', { name: 'Next step', exact: true })).toBeEnabled();
    await page.getByRole('button', { name: 'Next step', exact: true }).click();
    await expect(page.getByText('Concept check', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
  }
});
