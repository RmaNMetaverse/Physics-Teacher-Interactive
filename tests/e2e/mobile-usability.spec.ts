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
  await slider.scrollIntoViewIfNeeded();

  const metrics = await slider.evaluate((element) => {
    const style = getComputedStyle(element);
    return { height: element.getBoundingClientRect().height, touchAction: style.touchAction };
  });
  expect(metrics.height).toBeGreaterThanOrEqual(44);
  expect(metrics.touchAction).toBe('none');

  const before = Number(await slider.inputValue());
  const box = await slider.boundingBox();
  if (!box) throw new Error('Slider has no layout box');
  await slider.evaluate(element => {
    (window as Window & { __sliderInputCount?: number }).__sliderInputCount = 0;
    element.addEventListener('input', () => {
      const target = window as Window & { __sliderInputCount?: number };
      target.__sliderInputCount = (target.__sliderInputCount ?? 0) + 1;
    });
  });
  const client = await page.context().newCDPSession(page);
  await client.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 1 });
  const y = box.y + box.height / 2;
  const startX = box.x + 12;
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: startX, y, id: 1 }] });
  await expect(page.locator('html')).toHaveClass(/is-adjusting-simulation-parameter/);
  for (let step = 1; step <= 12; step += 1) {
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: startX + (box.width - 24) * step / 12, y, id: 1 }],
    });
  }
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect(page.locator('html')).not.toHaveClass(/is-adjusting-simulation-parameter/);
  expect(Number(await slider.inputValue())).not.toBe(before);
  expect(await page.evaluate(() => (window as Window & { __sliderInputCount?: number }).__sliderInputCount ?? 0)).toBeGreaterThan(1);
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
