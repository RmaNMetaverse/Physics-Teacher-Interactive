import { expect, test } from './fixtures';

for (const width of [280, 320, 360]) {
  test(`long projectile formulas remain reachable in prose and display math at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 740 });
    await page.addInitScript(() => {
      localStorage.setItem('physics-mission-session-foundations-projectile-motion', JSON.stringify({
        curriculumRevision: 1, currentStepIndex: 3, answers: {}, hintedStepIds: [],
        expandedMathStepIds: [], completedSimulationStepIds: [], recapCompleted: false,
      }));
    });
    await page.goto('/#/mission/foundations/projectile-motion');
    await page.evaluate(() => document.fonts.ready);
    const range = page.locator('.formula-reasoning-steps li').last().locator('.equation-inline-span').first();
    await expect(range).toBeVisible();
    const layout = await range.evaluate(element => {
      const parent = element.closest('li')!;
      return { width: element.getBoundingClientRect().width, parentWidth: parent.getBoundingClientRect().width,
        overflow: getComputedStyle(element).overflowX };
    });
    expect(layout.width).toBeLessThanOrEqual(layout.parentWidth + 1);
    expect(layout.width).toBeLessThanOrEqual(width);
    expect(layout.overflow).toBe('auto');
    // Scrolling reaches the rightmost mathematical term, not just a clipped line.
    for (const formula of [range, page.locator('.equation-container .equation-scroll-region').first()]) {
      await formula.scrollIntoViewIfNeeded();
      const bounds = await formula.evaluate(element => {
        const content = element.querySelector('.katex-html')!;
        const before = element.scrollLeft;
        element.scrollLeft = element.scrollWidth;
        return { before, after: element.scrollLeft, width: element.clientWidth, scrollWidth: element.scrollWidth,
          right: content.getBoundingClientRect().right, viewportRight: element.getBoundingClientRect().right };
      });
      expect(bounds.scrollWidth).toBeGreaterThan(bounds.width);
      expect(bounds.after).toBeGreaterThan(bounds.before);
      expect(bounds.right).toBeLessThanOrEqual(bounds.viewportRight + 1);
      await expect(formula).toHaveAttribute('tabindex', '0');
      await expect(formula.locator('..').locator('.equation-scroll-hint')).toBeVisible();
      await formula.evaluate(element => { element.scrollLeft = 0; });
      await formula.focus();
      await page.keyboard.press('ArrowRight');
      await expect.poll(() => formula.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1);
    // The observer removes the hint and extra keyboard stop once the formula fits.
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(range.locator('..').locator('.equation-scroll-hint')).toHaveCount(0);
    await expect(range).not.toHaveAttribute('tabindex', '0');
  });
}
