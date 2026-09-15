import { expect, test } from './fixtures';

async function openQuantumLab(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    localStorage.setItem('physics-mission-session-quantum-quantum-light-quanta', JSON.stringify({
      currentStepIndex: 2,
      answers: {},
      hintedStepIds: [],
      expandedMathStepIds: [],
      completedSimulationStepIds: [],
      recapCompleted: false,
    }));
  });
  await page.goto('/#/mission/quantum/quantum-light-quanta');
}

test('simulation starts itself and parameter changes keep it running', async ({ page }) => {
  await openQuantumLab(page);
  const time = page.getByTestId('simulation-time');
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
  await expect.poll(async () => Number(await time.textContent())).toBeGreaterThan(0);

  const before = Number(await time.textContent());
  const slider = page.locator('input[type="range"]').first();
  await slider.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
  await expect.poll(async () => Number(await time.textContent())).toBeGreaterThan(0);
  expect(Number(await time.textContent())).not.toBe(before);

  await page.getByRole('button', { name: 'Pause' }).click();
  const paused = await time.textContent();
  await page.waitForTimeout(300);
  await expect(time).toHaveText(paused!);
});

test('reduced-motion preference keeps autoplay opt-in', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openQuantumLab(page);
  await expect(page.getByRole('button', { name: 'Play' })).toBeVisible();
  await expect(page.getByTestId('simulation-time')).toHaveText('0');
});
