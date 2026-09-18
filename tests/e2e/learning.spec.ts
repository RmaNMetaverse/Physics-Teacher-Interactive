import { expect, test } from './fixtures';

test('curriculum search and topic filters navigate to real courses and missions', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/#\/explore$/);
  await expect(page.getByRole('heading', { name: 'Explore physics' })).toBeVisible();

  // Search courses
  await page.getByPlaceholder('Search courses').fill('measurement');
  await expect(page.getByRole('link', { name: 'Open course: Physics Foundations' })).toBeVisible();

  // Clear search and click topic filter chip
  await page.getByPlaceholder('Search courses').fill('');
  await page.getByRole('button', { name: 'Modern' }).click();
  await expect(page.getByRole('link', { name: 'Open course: Quantum Physics' })).toBeVisible();

  // Open course and first mission
  await page.getByRole('link', { name: 'Open course: Quantum Physics' }).click();
  await expect(page).toHaveURL(/#\/course\/quantum$/);
  await expect(page.getByRole('heading', { name: 'Quantum Physics' })).toBeVisible();

  await page.getByRole('link', { name: /Light quanta/i }).click();
  await expect(page).toHaveURL(/#\/mission\/quantum\/quantum-light-quanta$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Light quanta' })).toBeVisible();
});

test('mission simulation offers interactive controls, graph data, and accessible measurements table', async ({ page }) => {
  await page.goto('/#/mission/foundations/projectile-motion');
  await expect(page.getByRole('heading', { level: 1, name: 'Projectile motion' })).toBeVisible();

  // Step 1: Observe -> Next
  await page.getByRole('button', { name: 'Next step', exact: true }).click();
  // Step 2: Predict -> Next
  await page.getByRole('button', { name: /vertical velocity is zero/i }).click();
  await page.getByRole('button', { name: 'Check answer' }).click();
  await page.getByRole('button', { name: 'Next step', exact: true }).click();

  // Step 3: Simulate
  await expect(page.locator('.lab')).toBeVisible();

  // Switch to graph & data view
  await page.getByRole('button', { name: 'Graph & data' }).click();
  await expect(page.getByRole('table', { name: 'Live measurements' })).toBeVisible();

  // Switch back to the default live 2D model
  await page.getByRole('button', { name: 'Live 2D' }).click();
  await expect(page.getByTestId('physics-2d')).toBeVisible();
});

test('foundation math mode and deep dive reference treatment', async ({ page }) => {
  await page.goto('/#/mission/quantum/quantum-light-quanta');
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

  // Step 5: Math
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

  // Open deep dive
  await page.getByRole('button', { name: /Explore deep dive/i }).click();
  await expect(page.getByRole('heading', { name: 'Complete physical and mathematical treatment' })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Derivation & mathematical formulation/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Model assumptions & physical limitations/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Authoritative sources & literature/i })).toBeVisible();
});
