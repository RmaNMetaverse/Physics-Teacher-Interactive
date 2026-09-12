import { expect, test } from '@playwright/test';

test.describe('Progress page and rewards dashboard (v2)', () => {
  test('renders level, XP progress, daily streak, mastery rings, and badge shelf', async ({ page }) => {
    await page.goto('/#/progress');

    // Page title and eyebrow
    await expect(page.getByRole('heading', { level: 1, name: 'Progress' })).toBeVisible();
    await expect(page.getByText('Your learning record', { exact: true })).toBeVisible();

    // XP Bar and Level
    await expect(page.getByText(/Level 1/)).toBeVisible();
    await expect(page.getByRole('progressbar', { name: /Progress to Level 2/i })).toBeVisible();
    await expect(page.getByText(/0 \/ 500 XP/)).toBeVisible();

    // Streak Card
    await expect(page.getByText(/^0 days$/)).toBeVisible();
    await expect(page.getByText(/Daily Streak/)).toBeVisible();
    await expect(page.getByTestId('streak-flame')).toBeVisible();

    // Daily learning goals
    const goal3Btn = page.getByRole('button', { name: /3 missions \/ day/i });
    await expect(goal3Btn).toBeVisible();
    await expect(goal3Btn).toHaveAttribute('aria-pressed', 'true');

    // Course Mastery Section
    await expect(page.getByRole('heading', { name: 'Course Mastery' })).toBeVisible();
    await expect(page.getByText(/0 missions completed/)).toBeVisible();
    await expect(page.getByRole('img', { name: /Physics Foundations: 0% complete/i })).toBeVisible();
    await expect(page.getByRole('img', { name: /Quantum Physics: 0% complete/i })).toBeVisible();

    // Checkpoint Badges
    await expect(page.getByRole('heading', { name: 'Checkpoint Badges' })).toBeVisible();
    await expect(page.getByText(/0 badges earned/)).toBeVisible();
    await expect(page.getByText(/Complete checkpoints in any course to earn badges/)).toBeVisible();
  });

  test('keeps dashboard regions spaced and readable at desktop and phone widths', async ({ page }) => {
    await page.goto('/#/progress');

    const layout = await page.evaluate(() => {
      const rewards = document.querySelector('.progress-rewards-dashboard');
      const mastery = document.querySelector('.mastery-rings-grid');
      const activity = document.querySelector('.activity-ledger-list');
      const firstActivity = document.querySelector('.activity-ledger-item');
      return {
        rewardsDisplay: rewards ? getComputedStyle(rewards).display : '',
        masteryDisplay: mastery ? getComputedStyle(mastery).display : '',
        activityGap: activity ? getComputedStyle(activity).gap : '',
        activityRowDisplay: firstActivity ? getComputedStyle(firstActivity).display : '',
      };
    });

    expect(layout.rewardsDisplay).toBe('grid');
    expect(layout.masteryDisplay).toBe('grid');
    expect(layout.activityGap).not.toBe('0px');
    expect(layout.activityRowDisplay).toBe('flex');

    await page.setViewportSize({ width: 360, height: 800 });
    await expect(page.locator('.progress-page-container')).toBeVisible();
    await expect(page.locator('.mastery-rings-grid')).toBeVisible();
    const mobileColumns = await page.locator('.progress-rewards-dashboard').evaluate((element) => getComputedStyle(element).gridTemplateColumns);
    expect(mobileColumns.split(' ').length).toBe(1);
  });

  test('switches daily goals and preserves selection', async ({ page }) => {
    await page.goto('/#/progress');

    const goal1Btn = page.getByRole('button', { name: /1 mission \/ day/i });
    const goal5Btn = page.getByRole('button', { name: /5 missions \/ day/i });

    await goal5Btn.click();
    await expect(goal5Btn).toHaveAttribute('aria-pressed', 'true');
    await expect(goal1Btn).toHaveAttribute('aria-pressed', 'false');

    await goal1Btn.click();
    await expect(goal1Btn).toHaveAttribute('aria-pressed', 'true');
    await expect(goal5Btn).toHaveAttribute('aria-pressed', 'false');
  });

  test('toggles preferences: theme, sound, reduced motion, and celebrations', async ({ page }) => {
    await page.goto('/#/progress');

    // Theme toggle
    const themeBtn = page.getByRole('button', { name: /Light mode|Dark mode/i });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await themeBtn.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.getByRole('button', { name: /Night theme/i }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    // Sound toggle
    const soundSwitch = page.getByRole('switch', { name: 'Sound' });
    await expect(soundSwitch).toHaveAttribute('aria-checked', 'true');
    await soundSwitch.click();
    await expect(soundSwitch).toHaveAttribute('aria-checked', 'false');

    // Reduced motion toggle
    const motionSwitch = page.getByRole('switch', { name: 'Reduced motion' });
    await expect(motionSwitch).toHaveAttribute('aria-checked', 'false');
    await motionSwitch.click();
    await expect(motionSwitch).toHaveAttribute('aria-checked', 'true');

    // Celebrations toggle
    const celebSwitch = page.getByRole('switch', { name: 'Celebrations' });
    await expect(celebSwitch).toHaveAttribute('aria-checked', 'true');
    await celebSwitch.click();
    await expect(celebSwitch).toHaveAttribute('aria-checked', 'false');
  });

  test('persists theme presets, custom colors, and optional Liquid Glass', async ({ page }) => {
    await page.goto('/#/progress');
    await page.getByRole('button', { name: 'Eye Comfort theme' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'eye-comfort');

    await page.getByLabel('Custom primary color').fill('#d946ef');
    await page.getByLabel('Custom secondary color').fill('#14b8a6');
    await expect.poll(() => page.locator('html').evaluate(element => getComputedStyle(element).getPropertyValue('--accent').trim())).toBe('#d946ef');
    await expect.poll(() => page.locator('html').evaluate(element => getComputedStyle(element).getPropertyValue('--teal').trim())).toBe('#14b8a6');
    await page.locator('.progress-settings-section').screenshot({ path: 'test-results/eye-comfort-liquid-glass.png' });

    const glass = page.getByRole('switch', { name: 'Liquid Glass' });
    await expect(glass).toHaveAttribute('aria-checked', 'true');
    await glass.click();
    await expect(page.locator('html')).toHaveAttribute('data-liquid-glass', 'false');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'eye-comfort');
    await expect(page.locator('html')).toHaveAttribute('data-liquid-glass', 'false');
    await expect(page.getByLabel('Custom primary color')).toHaveValue('#d946ef');
    await page.setViewportSize({ width: 320, height: 700 });
    await page.locator('main').focus();
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await page.locator('.progress-settings-section').screenshot({ path: 'test-results/custom-theme-mobile.png' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(await page.evaluate(() => window.innerWidth));
  });

  test('exports progress as valid JSON file', async ({ page }) => {
    await page.goto('/#/progress');

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /Export progress/i }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe('physics-teacher-progress.json');
    const stream = await download.createReadStream();
    let content = '';
    for await (const chunk of stream) content += chunk.toString();

    const parsed = JSON.parse(content);
    expect(parsed.version).toBe(2);
    expect(parsed.settings).toBeDefined();
    expect(parsed.xpLedger).toBeDefined();
    expect(Array.isArray(parsed.completedMissions)).toBe(true);
  });

  test('resets learning progress while preserving user settings', async ({ page }) => {
    // Populate some active progress and custom settings in localStorage first
    await page.addInitScript(() => {
      localStorage.setItem(
        'physics-teacher-interactive-progress-v2',
        JSON.stringify({
          version: 2,
          selectedCourseId: 'foundations',
          nextMissionByCourse: {},
          completedMissions: [],
          missionStars: {},
          stepAttempts: {},
          answers: {},
          completedMathSteps: [],
          xpLedger: {},
          totalXp: 0,
          streak: { current: 5, longest: 10, lastActiveDate: '2026-09-11' },
          dailyGoal: 5,
          badges: [],
          settings: {
            theme: 'light',
            sound: false,
            reducedMotion: true,
            celebrations: false,
          },
          savedAt: '2026-09-11T10:00:00.000Z',
        })
      );
    });

    await page.goto('/#/progress');

    // Handle confirm dialog automatically
    page.on('dialog', dialog => dialog.accept());

    await page.getByRole('button', { name: /Reset progress/i }).click();

    // Verify streak reset to 0 days
    await expect(page.getByText(/^0 days$/)).toBeVisible();

    // Settings must be preserved!
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(page.getByRole('switch', { name: 'Sound' })).toHaveAttribute('aria-checked', 'false');
    await expect(page.getByRole('switch', { name: 'Reduced motion' })).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByRole('switch', { name: 'Celebrations' })).toHaveAttribute('aria-checked', 'false');
  });

  test('validates import file and updates progress', async ({ page }) => {
    await page.goto('/#/progress');

    // Prepare valid V2 progress export
    const validProgress = {
      version: 2,
      selectedCourseId: 'foundations',
      nextMissionByCourse: { foundations: 'unit-conversion' },
      completedMissions: ['foundations/measurement-basics'],
      missionStars: { 'foundations/measurement-basics': 3 },
      stepAttempts: { 'foundations/measurement-basics/measurement-basics-predict': 1 },
      answers: { 'foundations/measurement-basics/measurement-basics-predict': 1 },
      completedMathSteps: [],
      xpLedger: { 'foundations/measurement-basics': 60 },
      totalXp: 60,
      streak: { current: 2, longest: 4, lastActiveDate: '2026-09-11' },
      dailyGoal: 3,
      badges: [],
      settings: {
        theme: 'dark',
        sound: true,
        reducedMotion: false,
        celebrations: true,
      },
      savedAt: '2026-09-11T12:00:00.000Z',
    };

    // Upload the file to the file input
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'imported-progress.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(validProgress)),
    });

    // Check success status and UI update
    await expect(page.getByText('Progress imported successfully.')).toBeVisible();
    await expect(page.getByText(/60 \/ 500 XP/)).toBeVisible();
    await expect(page.getByText(/^2 days$/)).toBeVisible();
    await expect(page.getByText(/1 mission completed/)).toBeVisible();
  });
});
