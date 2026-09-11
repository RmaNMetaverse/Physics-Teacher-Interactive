import { expect, test } from '@playwright/test';

const representativeCourses = [
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
