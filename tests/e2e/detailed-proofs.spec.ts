import { expect, test } from './fixtures';

for (const width of [280, 320, 768, 1440]) test(`optional detailed proofs open with keyboard and fit a ${width}px screen`, async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('physics-mission-session-foundations-projectile-motion', JSON.stringify({
      curriculumRevision: 1, currentStepIndex: 3, answers: {}, hintedStepIds: [], expandedMathStepIds: [],
      completedSimulationStepIds: [], recapCompleted: false,
    }));
  });
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`/?proof-width=${width}#/mission/foundations/projectile-motion`);
    const proof = page.locator('.formula-detailed-proof');
    await expect(proof).not.toHaveAttribute('open');
    await expect(proof.locator('.formula-proof-content')).toHaveCount(0);
    await proof.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(proof).toHaveAttribute('open');
    await expect(proof).toContainText('Integrate acceleration');
    await expect(proof).toContainText('quadratic root');
    await expect(proof.locator('.formula-proof-content .formula-reasoning-steps li')).toHaveCount(5);
    expect(await page.locator('.mission-step').evaluate(element => element.getBoundingClientRect().width)).toBeLessThanOrEqual(width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await proof.locator('summary').focus();
    await page.keyboard.press('Space');
    await expect(proof).not.toHaveAttribute('open');
});

test('math refreshers expose their own proof independently of the parent physics lesson', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('physics-mission-session-foundations-friction', JSON.stringify({
      curriculumRevision: 1, currentStepIndex: 4, answers: {}, hintedStepIds: [], expandedMathStepIds: [],
      completedSimulationStepIds: [], recapCompleted: false,
    }));
  });
  await page.goto('/#/mission/foundations/friction');
  await page.locator('.formula-detailed-proof summary').click();
  await expect(page.locator('.formula-proof-content')).toContainText('empirical Coulomb friction');
  await page.getByRole('button', { name: 'Teach me the math' }).click();
  await page.getByRole('button', { name: 'Algebra: isolate the unknown', exact: true }).click();
  const refresher = page.locator('.math-prereq-view .formula-detailed-proof');
  await expect(refresher).not.toHaveAttribute('open');
  await refresher.locator('summary').click();
  await expect(refresher).toContainText('Substitute back');
});
