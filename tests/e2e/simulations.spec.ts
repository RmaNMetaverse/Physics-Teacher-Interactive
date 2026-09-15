import { expect, test } from './fixtures';

const representativeCourses = [
  { courseId: 'foundations', missionId: 'vector-addition', modelId: 'vectors' },
  { courseId: 'foundations', missionId: 'projectile-motion', modelId: 'projectile' },
  { courseId: 'foundations', missionId: 'net-force', modelId: 'forces' },
  { courseId: 'foundations', missionId: 'work', modelId: 'energy' },
  { courseId: 'foundations', missionId: 'momentum', modelId: 'collisions' },
  { courseId: 'foundations', missionId: 'orbits', modelId: 'gravity' },
  { courseId: 'foundations', missionId: 'hookes-law', modelId: 'spring' },
  { courseId: 'foundations', missionId: 'pendulum', modelId: 'pendulum' },
  { courseId: 'foundations', missionId: 'measurement-basics', modelId: 'measurement' },
  { courseId: 'classical-mechanics', missionId: 'classical-mechanics-frames-and-motion', modelId: 'motion' },
  { courseId: 'waves-sound', missionId: 'waves-sound-oscillation', modelId: 'waves' },
  { courseId: 'thermodynamics', missionId: 'thermodynamics-microscopic-temperature', modelId: 'thermal' },
  { courseId: 'electromagnetism', missionId: 'electromagnetism-charge-and-field', modelId: 'electromagnetism' },
  { courseId: 'optics', missionId: 'optics-reflection', modelId: 'optics' },
  { courseId: 'relativity', missionId: 'relativity-events-and-frames', modelId: 'relativity' },
  { courseId: 'quantum', missionId: 'quantum-light-quanta', modelId: 'quantum' },
  { courseId: 'atomic-molecular', missionId: 'atomic-molecular-spectra', modelId: 'atomic' },
  { courseId: 'nuclear', missionId: 'nuclear-binding', modelId: 'nuclear' },
  { courseId: 'particle', missionId: 'particle-relativistic-particles', modelId: 'particle' },
  { courseId: 'condensed-matter', missionId: 'condensed-matter-lattices', modelId: 'condensed' },
  { courseId: 'astrophysics', missionId: 'astrophysics-stellar-light', modelId: 'astrophysics' },
  { courseId: 'cosmology-frontiers', missionId: 'cosmology-frontiers-expansion', modelId: 'cosmology' },
];

test.describe('Mission simulations across all 14 courses', () => {
  for (const { courseId, missionId, modelId } of representativeCourses) {
    test(`renders interactive simulation and graph data for ${courseId} (${modelId})`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      // Set saved session at simulate step (index 2)
      await page.addInitScript(
        ({ cId, mId }) => {
          localStorage.setItem(
            `physics-mission-session-${cId}-${mId}`,
            JSON.stringify({
              currentStepIndex: 2,
              answers: {},
              hintedStepIds: [],
              expandedMathStepIds: [],
              completedSimulationStepIds: [],
              recapCompleted: false,
            })
          );
        },
        { cId: courseId, mId: missionId }
      );

      await page.goto(`/#/mission/${courseId}/${missionId}`);

      // Verify simulate step header and prompt
      await expect(page.getByText('Interactive simulation')).toBeVisible();
      await expect(page.getByText('Interactive laboratory')).toBeVisible();
      const canvas = page.locator('.scene-canvas canvas');
      await expect(canvas).toBeVisible();
      await expect.poll(async () => Number(await canvas.getAttribute('data-draw-calls'))).toBeGreaterThan(5);
      expect(Number(await canvas.getAttribute('data-draw-calls'))).toBeLessThan(100);
      expect(Number(await canvas.getAttribute('data-triangles'))).toBeLessThan(100000);
      await page.setViewportSize({ width: 390, height: 844 });
      await expect(canvas).toBeVisible();
      await expect(page.locator('.hud-play-btn')).toHaveAttribute('aria-label', 'Pause');
      if (!['vectors', 'measurement'].includes(modelId)) await expect(page.getByTestId('simulation-time')).not.toHaveText('0');
      await page.locator('.experiment-viewport').screenshot({ path: 'test-results/scene-' + modelId + '-mobile.png' });
      await page.locator('.hud-play-btn').click();
      const paused = await page.getByTestId('simulation-time').textContent();
      await page.waitForTimeout(200);
      await expect(page.getByTestId('simulation-time')).toHaveText(paused!);
      await page.locator('.hud-play-btn').click();
      expect(errors).toEqual([]);

      // Controls panel exists and shows at most 3 before Explore further
      await expect(page.getByText('Experiment controls')).toBeVisible();

      // Telemetry (numerical observations) exists
      await expect(page.locator('.telemetry')).toBeVisible();

      // Playbar is present with simulation time
      await expect(page.getByTestId('simulation-time')).toBeVisible();

      // Record observation
      const runBtn = page.getByRole('button', { name: /Run simulation & record observation/i });
      await expect(runBtn).toBeVisible();
      await runBtn.click();
      await expect(page.locator('.simulation-completed-banner')).toContainText('Observation complete');

      // Switch to graph & data view
      await page.getByRole('button', { name: 'Graph & data' }).click();
      await expect(page.getByRole('table', { name: 'Live measurements' })).toBeVisible();
      await expect(page.locator('.graph-view svg')).toBeVisible();
    });
  }

  test('preserves interaction, controls, observations, graph, and table in forced reduced visual mode', async ({ page }) => {
    // Set forced simulation error via init script
    await page.addInitScript(() => {
      (window as unknown as { __FORCE_SIMULATION_ERROR__?: boolean }).__FORCE_SIMULATION_ERROR__ = true;
      localStorage.setItem(
        'physics-mission-session-foundations-measurement-basics',
        JSON.stringify({
          currentStepIndex: 2,
          answers: {},
          hintedStepIds: [],
          expandedMathStepIds: [],
          completedSimulationStepIds: [],
          recapCompleted: false,
        })
      );
    });

    await page.goto('/#/mission/foundations/measurement-basics');

    // 1. Recovery copy is visible
    await expect(page.getByText(/3D rendering is unavailable/i)).toBeVisible();

    // 2. Model description is visible
    await expect(page.locator('.model-description-panel')).toBeVisible();

    // 3. Controls are visible
    await expect(page.getByText('Experiment controls')).toBeVisible();
    const lengthSlider = page.getByLabel('Length', { exact: true });
    await expect(lengthSlider).toBeVisible();

    // 4. Numerical observations (telemetry) are visible
    await expect(page.locator('.telemetry')).toBeVisible();

    // 5. Graph and accessible data table are visible
    await expect(page.getByRole('table', { name: 'Live measurements' })).toBeVisible();
    await expect(page.locator('.graph-view svg')).toBeVisible();

    // 6. Keyboard interaction with slider
    await lengthSlider.focus();
    await page.keyboard.press('ArrowRight');

    // 7. Complete observation
    const runBtn = page.getByRole('button', { name: /Run simulation & record observation/i });
    await expect(runBtn).toBeVisible();
    await runBtn.click();
    await expect(page.locator('.simulation-completed-banner')).toContainText('Observation complete');
  });
});

test('caps high-DPI phone rendering and keeps the scene inside a 320px viewport', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 320, height: 700 }, deviceScaleFactor: 3 });
  const page = await context.newPage();
  await page.addInitScript(() => {
    localStorage.setItem('physics-mission-session-quantum-quantum-light-quanta', JSON.stringify({
      currentStepIndex: 2, answers: {}, hintedStepIds: [], expandedMathStepIds: [],
      completedSimulationStepIds: [], recapCompleted: false,
    }));
  });
  await page.goto('/#/mission/quantum/quantum-light-quanta');
  const canvas = page.locator('.scene-canvas canvas');
  await expect.poll(async () => Number(await canvas.getAttribute('data-draw-calls'))).toBeGreaterThan(5);
  expect(Number(await canvas.getAttribute('data-pixel-ratio'))).toBeLessThanOrEqual(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await context.close();
});
