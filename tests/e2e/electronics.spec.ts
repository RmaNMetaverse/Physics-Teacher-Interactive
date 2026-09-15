import { expect, test } from './fixtures';

for (const item of [
  { course: 'electronics', mission: 'electronics-voltage-current-resistance', region: 'Interactive circuit workbench' },
  { course: 'arduino-esp32', mission: 'arduino-esp32-button-input', region: 'Interactive board workbench' },
]) {
  test(`${item.course} workbench responds on desktop and phone`, async ({ page }) => {
    await page.addInitScript(({ course, mission }) => {
      sessionStorage.setItem('physics-account-gate-dismissed', 'true');
      localStorage.setItem(`physics-mission-session-${course}-${mission}`, JSON.stringify({
        currentStepIndex: 2, answers: {}, hintedStepIds: [], expandedMathStepIds: [], completedSimulationStepIds: [], recapCompleted: false,
      }));
    }, item);
    await page.goto(`/#/mission/${item.course}/${item.mission}`);
    const workbench = page.getByRole('region', { name: item.region });
    await expect(workbench).toBeVisible();
    await workbench.screenshot({ path: `test-results/${item.course}-workbench-desktop.png` });
    await expect(workbench.getByRole('button', { name: 'Schematic' })).toBeVisible();
    await workbench.getByRole('button', { name: 'Wiring' }).click();
    await expect(workbench.getByRole('button', { name: 'Wiring' })).toHaveAttribute('aria-pressed', 'true');
    if (item.course === 'electronics') {
      await expect(workbench.getByText('Total current')).toBeVisible();
      await workbench.getByRole('button', { name: 'Open switch' }).click();
      await expect(workbench.getByRole('button', { name: 'Close switch' })).toBeVisible();
      await expect(workbench.getByText('0 mA')).toBeVisible();
    } else {
      await workbench.getByRole('button', { name: 'Press button' }).click();
      await expect(workbench.getByText('HIGH', { exact: true })).toBeVisible();
    }
    await page.setViewportSize({ width: 360, height: 740 });
    await expect(workbench).toBeVisible();
    await workbench.screenshot({ path: `test-results/${item.course}-workbench-mobile.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  });
}
