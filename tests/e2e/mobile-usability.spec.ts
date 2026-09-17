import { expect, test } from './fixtures';

async function openQuantumStep(page: import('@playwright/test').Page, currentStepIndex: number) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript((stepIndex) => {
    localStorage.setItem('physics-mission-session-quantum-quantum-light-quanta', JSON.stringify({
      currentStepIndex: stepIndex,
      answers: {},
      hintedStepIds: [],
      expandedMathStepIds: [],
      completedSimulationStepIds: [],
      recapCompleted: false,
    }));
  }, currentStepIndex);
  await page.goto('/#/mission/quantum/quantum-light-quanta');
}

test('mobile simulation sliders capture touch gestures without shrinking their hit target', async ({ page }) => {
  await openQuantumStep(page, 2);
  const slider = page.locator('.hardware-slider').first();
  await expect(slider).toBeVisible();

  const metrics = await slider.evaluate((element) => {
    const style = getComputedStyle(element);
    return { height: element.getBoundingClientRect().height, touchAction: style.touchAction };
  });
  expect(metrics.height).toBeGreaterThanOrEqual(44);
  expect(metrics.touchAction).toBe('none');

  await slider.dispatchEvent('pointerdown', { pointerId: 11, pointerType: 'touch', isPrimary: true });
  await expect(page.locator('html')).toHaveClass(/is-adjusting-simulation-parameter/);
  await slider.dispatchEvent('pointerup', { pointerId: 11, pointerType: 'touch', isPrimary: true });
  await expect(page.locator('html')).not.toHaveClass(/is-adjusting-simulation-parameter/);
});

test('display equations stay inside the mobile page and provide their own horizontal viewport', async ({ page }) => {
  await openQuantumStep(page, 4);
  const equation = page.locator('.equation-scroll-region').first();
  await expect(equation).toBeVisible();

  const layout = await equation.evaluate((element) => ({
    overflowX: getComputedStyle(element).overflowX,
    equationWidth: element.getBoundingClientRect().width,
    viewportWidth: window.innerWidth,
    pageWidth: document.documentElement.scrollWidth,
  }));

  expect(layout.overflowX).toBe('auto');
  expect(layout.equationWidth).toBeLessThanOrEqual(layout.viewportWidth);
  expect(layout.pageWidth).toBeLessThanOrEqual(layout.viewportWidth + 1);
});
