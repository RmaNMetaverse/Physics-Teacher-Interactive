import { expect, test } from './fixtures';

test.describe('Mission player and layered math', () => {
  test('plays through a Foundations mission with expanded math, deep dive, and completion', async ({ page }) => {
    await page.goto('/#/mission/foundations/measurement-basics');

    // Verify mission player header
    await expect(page.getByRole('heading', { level: 1, name: 'Physical quantities and scale' })).toBeVisible();
    await expect(page.locator('.mission-player-title .eyebrow')).toHaveText('Physics Foundations');

    // Step 1: Observe
    await expect(page.locator('.step-kind-badge', { hasText: 'Observe' })).toBeVisible();
    const nextBtn = page.getByRole('button', { name: 'Next step' });
    await expect(nextBtn).toBeEnabled();
    await nextBtn.click();

    // Step 2: Predict (assessment)
    await expect(page.getByText('Prediction')).toBeVisible();
    await expect(page.getByText('Which statement is a complete length measurement?')).toBeVisible();
    await expect(nextBtn).toBeDisabled();

    // Answer prediction
    await page.getByRole('button', { name: /The rod is 2 m long/i }).click();
    await page.getByRole('button', { name: 'Check answer' }).click();
    await expect(page.getByRole('status')).toContainText("That's right");
    await expect(nextBtn).toBeEnabled();
    await nextBtn.click();

    // Step 3: Simulate
    await expect(page.getByText('Interactive simulation')).toBeVisible();
    await expect(nextBtn).toBeDisabled();
    await page.getByRole('button', { name: /Run simulation & record observation/i }).click();
    await expect(page.getByRole('status')).toContainText('Observation complete');
    await expect(nextBtn).toBeEnabled();
    await nextBtn.click();

    // Step 4: Math Step 1 (math-arithmetic)
    await expect(page.getByText('Layered mathematics')).toBeVisible();
    await expect(page.getByText('Symbol definitions')).toBeVisible();

    // Expand "Teach me the math"
    const teachMathBtn = page.getByRole('button', { name: /Teach me the math/i });
    await expect(teachMathBtn).toBeVisible();
    await teachMathBtn.click();

    // Foundation view is expanded
    await expect(page.getByRole('heading', { name: 'Core concepts' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Worked example' })).toBeVisible();

    // Reveal next worked step
    const revealStepBtn = page.locator('.reveal-step-button');
    if (await revealStepBtn.isVisible()) {
      await revealStepBtn.click();
    }

    // Answer the math check: prompt is "Evaluate 5 + 2 × 6." (answer 17)
    const mathCheckInput = page.locator('.foundation-check input');
    await mathCheckInput.fill('17');
    await page.locator('.foundation-check button', { hasText: 'Check answer' }).click();

    // Close foundation view
    await page.getByRole('button', { name: 'Close math foundation' }).click();
    await expect(teachMathBtn).toBeFocused();

    // Advance to next step
    await page.getByRole('button', { name: 'Next step', exact: true }).click();

    // Step 5: Math Step 2 (math-decimals)
    await page.getByRole('button', { name: /Teach me the math/i }).click();
    // Prompt: "Evaluate 0.4 × 0.3." -> answer 0.12
    const decimalInput = page.locator('.foundation-check input');
    await decimalInput.fill('0.12');
    await page.locator('.foundation-check button', { hasText: 'Check answer' }).click();
    await page.getByRole('button', { name: 'Next step', exact: true }).click();

    // Step 6: Explain
    await expect(page.getByText('Explanation')).toBeVisible();
    await page.getByRole('button', { name: 'Next step', exact: true }).click();

    // Step 7: Calculation Check ("Four adjacent 0.75 m sections...") -> answer 3
    const calcInput = page.locator('.numeric-answer input');
    await calcInput.fill('3');
    await page.getByRole('button', { name: 'Check answer' }).click();
    await page.getByRole('button', { name: 'Next step', exact: true }).click();

    // Step 8: Experiment Check ("Set length to 4 m...") -> answer 4
    const expInput = page.locator('.numeric-answer input');
    await expInput.fill('4');
    await page.getByRole('button', { name: 'Check answer' }).click();
    await page.getByRole('button', { name: 'Next step', exact: true }).click();

    // Step 9: Recap
    await expect(page.getByRole('heading', { name: /Mission complete/i })).toBeVisible();
    await expect(page.getByText('Key takeaways')).toBeVisible();

    // Verify rewards
    await expect(page.getByText(/3 \/ 3 Stars/i)).toBeVisible();
    await expect(page.getByText('+60 XP')).toBeVisible();

    // Explore Deep Dive without tabs
    await page.getByRole('button', { name: /Explore deep dive/i }).click();
    await expect(page.getByRole('heading', { name: 'Complete physical and mathematical treatment' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Derivation & mathematical formulation/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Model assumptions & physical limitations/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Authoritative sources & literature/i })).toBeVisible();

    // Continue to next mission
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page).toHaveURL(/#\/mission\/foundations\/unit-conversion$/);
  });

  test('plays through a Quantum starter mission and persists progress across reload', async ({ page }) => {
    await page.goto('/#/mission/quantum/quantum-light-quanta');

    await expect(page.getByRole('heading', { level: 1, name: 'Light quanta' })).toBeVisible();
    await expect(page.locator('.mission-player-title .eyebrow')).toHaveText('Quantum Physics');

    // Step 1: Observe
    await page.getByRole('button', { name: 'Next step', exact: true }).click();

    // Step 2: Predict: "At fixed frequency, brighter monochromatic light changes what?" -> "Photon arrival rate"
    await page.getByRole('button', { name: /Photon arrival rate/i }).click();
    await page.getByRole('button', { name: 'Check answer' }).click();
    await page.getByRole('button', { name: 'Next step', exact: true }).click();

    // Step 3: Simulate
    await page.getByRole('button', { name: /Run simulation & record observation/i }).click();
    await page.getByRole('button', { name: 'Next step', exact: true }).click();

    // Step 4: Explain
    await expect(page.locator('.step-kind-badge', { hasText: 'Explanation' })).toBeVisible();
    await page.getByRole('button', { name: 'Next step', exact: true }).click();

    // Step 5: Math Step: Answer check "6e-19 J" (or expand)
    await page.getByRole('button', { name: /Teach me the math/i }).click();
    const mathInput = page.locator('.foundation-check input');
    await mathInput.fill('6e-19');
    await page.locator('.foundation-check button', { hasText: 'Check answer' }).click();
    await page.getByRole('button', { name: 'Next step', exact: true }).click();

    // Step 6: Check: "Which change raises photon energy?" -> "Increasing frequency"
    await page.getByRole('button', { name: /Increasing frequency/i }).click();
    await page.getByRole('button', { name: 'Check answer' }).click();
    await page.getByRole('button', { name: 'Next step', exact: true }).click();

    // Step 7: Recap
    await expect(page.getByText(/3 \/ 3 Stars/i)).toBeVisible();

    // Reload page to verify persistence without data loss
    await page.reload();
    await expect(page.getByRole('heading', { name: /Mission complete/i })).toBeVisible();
    await expect(page.getByText(/3 \/ 3 Stars/i)).toBeVisible();

    // Click exit to course
    await page.getByRole('link', { name: /Back to Quantum Physics path/i }).first().click();
    await expect(page).toHaveURL(/#\/course\/quantum$/);
  });

  test('responsive viewports have no overflow, one prominent 44px action, and reduced motion zeros celebration duration', async ({ page }) => {
    const viewports = [
      { width: 320, height: 700, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1440, height: 900, name: 'desktop' },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/#/mission/quantum/quantum-light-quanta');

      // No horizontal page overflow
      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(overflow, `Horizontal overflow at ${vp.width}x${vp.height} in Mission`).toBe(false);

      // One prominent mission action with min 44px height
      const nextBtn = page.getByRole('button', { name: 'Next step', exact: true });
      await expect(nextBtn).toBeVisible();
      const nextBox = await nextBtn.boundingBox();
      expect(nextBox).not.toBeNull();
      expect(nextBox!.height, `Next button height at ${vp.name}`).toBeGreaterThanOrEqual(44);

      // Visible focus on interactive primary action
      await nextBtn.focus();
      await expect(nextBtn).toBeFocused();
      const btnFocus = await nextBtn.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          outlineStyle: style.outlineStyle,
          outlineWidth: parseFloat(style.outlineWidth) || 0,
          boxShadow: style.boxShadow,
        };
      });
      const hasVisibleFocus = (btnFocus.outlineStyle !== 'none' && btnFocus.outlineWidth >= 2) || (btnFocus.boxShadow !== 'none' && !btnFocus.boxShadow.includes('rgba(0, 0, 0, 0)'));
      expect(hasVisibleFocus, `Next button should display visible focus ring at ${vp.name}`).toBe(true);
    }

    // Emulate reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/#/mission/quantum/quantum-light-quanta');

    // Verify celebration duration is zero under reduced motion
    const cssCelebrationDuration = await page.evaluate(() => {
      const rootVal = getComputedStyle(document.documentElement).getPropertyValue('--celebration-duration').trim();
      return rootVal;
    });
    expect(
      cssCelebrationDuration === '0ms' || cssCelebrationDuration === '0s',
      `Expected --celebration-duration to be 0ms under reduced motion, got '${cssCelebrationDuration}'`
    ).toBe(true);

    // Reset media emulation to isolate the data-reduced-motion attribute test
    await page.emulateMedia({ reducedMotion: 'no-preference' });

    // Also verify data-reduced-motion="true" sets duration to zero
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-reduced-motion', 'true');
    });
    const attrCelebrationDuration = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--celebration-duration').trim();
    });
    expect(
      attrCelebrationDuration === '0ms' || attrCelebrationDuration === '0s',
      `Expected --celebration-duration to be 0ms with data-reduced-motion="true", got '${attrCelebrationDuration}'`
    ).toBe(true);
  });
});
