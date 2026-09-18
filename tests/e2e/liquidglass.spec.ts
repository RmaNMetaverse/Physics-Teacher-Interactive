import { expect, test } from './fixtures';

test('dark-theme liquid glass never turns refracted mobile content into a white fill', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/explore');
  const nav = page.getByRole('navigation', { name: 'Mobile navigation' });
  await expect(nav).toHaveAttribute('data-liquid-glass-renderer', 'ready', { timeout: 15_000 });

  await page.evaluate(() => {
    window.scrollTo(0, 200);
    window.scrollTo(0, 700);
    window.scrollTo(0, 1200);
  });
  await page.waitForTimeout(250);

  const canvas = nav.locator('canvas').first();
  await expect(canvas).toBeVisible();
  const ratio = await canvas.evaluate((element: HTMLCanvasElement) => {
    const context = element.getContext('2d');
    if (!context) return 1;
    const pixels = context.getImageData(0, 0, element.width, element.height).data;
    let opaque = 0;
    let white = 0;
    for (let index = 0; index < pixels.length; index += 16) {
      const alpha = pixels[index + 3];
      if (alpha < 180) continue;
      opaque += 1;
      if (pixels[index] > 244 && pixels[index + 1] > 244 && pixels[index + 2] > 244) white += 1;
    }
    return opaque ? white / opaque : 1;
  });
  expect(ratio).toBeLessThan(.12);
});
