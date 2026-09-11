import { expect, test } from '@playwright/test';

test('release journey: first visit Explore, open Quantum, complete mission with math, earn XP once, replay without duplicate XP, view path & Progress, switch to Foundations', async ({ page }) => {
  // 1. First visit Explore
  await page.goto('/');
  await expect(page).toHaveURL(/#\/explore$/);
  await expect(page.getByRole('heading', { name: 'Explore physics' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Continue learning' })).toBeVisible();
  await expect(page.getByRole('link', { name: /^Open course:/ })).toHaveCount(14);

  // 2. Open Quantum course
  await page.getByRole('link', { name: 'Open course: Quantum Physics' }).click();
  await expect(page).toHaveURL(/#\/course\/quantum$/);
  await expect(page.getByRole('heading', { name: 'Quantum Physics' })).toBeVisible();

  const missionNodes = page.getByRole('list', { name: 'Quantum Physics mission path' }).getByRole('link');
  await expect(missionNodes).toHaveCount(6);

  // 3. Open and finish first mission with expanded math
  await missionNodes.first().click();
  await expect(page).toHaveURL(/#\/mission\/quantum\/quantum-light-quanta$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Light quanta' })).toBeVisible();

  // Step 1: Observe
  await page.getByRole('button', { name: 'Next step', exact: true }).click();

  // Step 2: Predict
  await page.getByRole('button', { name: /Photon arrival rate/i }).click();
  await page.getByRole('button', { name: 'Check answer' }).click();
  await page.getByRole('button', { name: 'Next step', exact: true }).click();

  // Step 3: Simulate
  await page.getByRole('button', { name: /Run simulation & record observation/i }).click();
  await page.getByRole('button', { name: 'Next step', exact: true }).click();

  // Step 4: Explain
  await page.getByRole('button', { name: 'Next step', exact: true }).click();

  // Step 5: Expanded Math
  await page.getByRole('button', { name: /Teach me the math/i }).click();
  await expect(page.getByRole('heading', { name: 'Core concepts' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Worked example' })).toBeVisible();
  const mathInput = page.locator('.foundation-check input');
  await mathInput.fill('6e-19');
  await page.locator('.foundation-check button', { hasText: 'Check answer' }).click();
  await page.getByRole('button', { name: 'Next step', exact: true }).click();

  // Step 6: Check
  await page.getByRole('button', { name: /Increasing frequency/i }).click();
  await page.getByRole('button', { name: 'Check answer' }).click();
  await page.getByRole('button', { name: 'Next step', exact: true }).click();

  // Step 7: Recap & finish
  await page.getByRole('button', { name: 'Finish mission' }).click();
  await expect(page.getByText(/3 \/ 3 Stars/i)).toBeVisible();
  await expect(page.getByText('+60 XP')).toBeVisible();

  // 4. Record XP and replay without duplicate XP
  await page.getByRole('button', { name: 'Replay mission' }).click();

  // Walk through and finish again
  await page.getByRole('button', { name: 'Next step', exact: true }).click(); // observe
  await page.getByRole('button', { name: /Photon arrival rate/i }).click();
  await page.getByRole('button', { name: 'Check answer' }).click();
  await page.getByRole('button', { name: 'Next step', exact: true }).click(); // predict
  await page.getByRole('button', { name: /Run simulation & record observation/i }).click();
  await page.getByRole('button', { name: 'Next step', exact: true }).click(); // simulate
  await page.getByRole('button', { name: 'Next step', exact: true }).click(); // explain
  await page.getByRole('button', { name: /Teach me the math/i }).click();
  const replayMathInput = page.locator('.foundation-check input');
  await replayMathInput.fill('6e-19');
  await page.locator('.foundation-check button', { hasText: 'Check answer' }).click();
  await page.getByRole('button', { name: 'Next step', exact: true }).click(); // math
  await page.getByRole('button', { name: /Increasing frequency/i }).click();
  await page.getByRole('button', { name: 'Check answer' }).click();
  await page.getByRole('button', { name: 'Next step', exact: true }).click(); // check
  await page.getByRole('button', { name: 'Finish mission' }).click(); // recap

  // Replay should show completion without awarding duplicate XP
  await expect(page.getByText(/3 \/ 3 Stars/i)).toBeVisible();

  // 5. View path and Progress
  await page.getByRole('link', { name: /Back to Quantum Physics path/i }).first().click();
  await expect(page).toHaveURL(/#\/course\/quantum$/);
  await expect(page.locator('.mission-node-complete')).toHaveCount(1);

  await page.goto('/#/progress');
  await expect(page.getByRole('heading', { level: 1, name: 'Progress' })).toBeVisible();
  await expect(page.getByText(/60 \/ 500 XP/)).toBeVisible();
  await expect(page.getByText(/1 mission completed/)).toBeVisible();

  // 6. Switch to Foundations
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Explore' }).click();
  await page.getByRole('link', { name: 'Open course: Physics Foundations' }).click();
  await expect(page).toHaveURL(/#\/course\/foundations$/);
  await expect(page.getByRole('heading', { name: 'Physics Foundations' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Learn' }))
    .toHaveAttribute('href', '#/course/foundations');
  const foundationsNodes = page.getByRole('list', { name: 'Physics Foundations mission path' }).getByRole('link');
  await expect(foundationsNodes).toHaveCount(24);
});

test('migrates version-1 local progress, sanitizes stale keys, and exports valid version-2 JSON', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('physics-teacher-interactive-progress-v1', JSON.stringify({
      version: 1,
      completed: ['measurement-basics', 'retired-lesson-id'],
      answers: { 'measurement-basics-check': 1, 'retired-assessment': 0 },
      mathCompleted: ['math-arithmetic', 'retired-math-id'],
      lastLesson: 'measurement-basics',
      theme: 'dark',
      savedAt: '2026-09-09T00:00:00.000Z',
    }));
  });

  await page.goto('/#/progress');
  await expect(page.getByRole('heading', { level: 1, name: 'Progress' })).toBeVisible();

  // Verify migration: 1 valid completed mission from Foundations was migrated
  await expect(page.getByText(/1 mission completed/)).toBeVisible();

  // Export progress and verify Version 2 JSON schema
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export progress', exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('physics-teacher-progress.json');

  const stream = await download.createReadStream();
  let jsonStr = '';
  for await (const chunk of stream) jsonStr += chunk.toString();
  const exported = JSON.parse(jsonStr);

  expect(exported.version).toBe(2);
  expect(exported.completedMissions).toContain('foundations/measurement-basics');
  expect(exported.completedMissions).not.toContain('retired-lesson-id');
  expect(exported.completedMissions).not.toContain('foundations/retired-lesson-id');
});

test('forces 3D rendering failure to activate reduced visual mode with active controls and data table', async ({ page }) => {
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

  // Recovery banner is displayed
  await expect(page.getByText(/3D rendering is unavailable/i)).toBeVisible();

  // Model controls and observations remain fully active
  await expect(page.locator('.parameters')).toBeVisible();
  await expect(page.locator('.graph-view svg')).toBeVisible();
  await expect(page.getByRole('table', { name: 'Live measurements' })).toBeVisible();
});

test('recovers from unknown routes with status announcement and reloads safely at Pages subpath', async ({ page }) => {
  // Unknown route recovery
  await page.goto('/#/explore');
  await page.goto('/#/unknown-route');
  await expect(page).toHaveURL(/#\/explore$/);
  await expect(page.getByRole('status')).toContainText('returned you to Explore');

  // Reload at subpath with hash
  await page.goto('/#/mission/quantum/quantum-light-quanta');
  await expect(page.getByRole('heading', { level: 1, name: 'Light quanta' })).toBeVisible();
  await page.reload();
  await expect(page).toHaveURL(/#\/mission\/quantum\/quantum-light-quanta$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Light quanta' })).toBeVisible();
});
