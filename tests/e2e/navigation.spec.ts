import { expect, test } from '@playwright/test';

test('opens Explore first with one continue action and every open course', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveURL(/#\/explore$/);
  await expect(page.getByRole('heading', { name: 'Explore physics' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Continue learning' })).toHaveCount(1);
  await expect(page.getByRole('link', { name: /^Open course:/ })).toHaveCount(14);
  await expect(page.getByText('Open course', { exact: true })).toHaveCount(14);
  await expect(page.getByRole('link', { name: 'Open course: Physics Foundations' }).locator('..').locator('dd').first()).toHaveText('24 missions');
  await expect(page.getByRole('link', { name: 'Open course: Quantum Physics' }).locator('..').locator('dd').first()).toHaveText('6 missions');

  const navigation = page.getByRole('navigation', { name: 'Main navigation' });
  await expect(navigation.getByRole('link')).toHaveCount(3);
  await expect(navigation.getByRole('link').allTextContents()).resolves.toEqual(['Explore', 'Learn', 'Progress']);
  await expect(page.locator('.sidebar')).toHaveCount(0);
  await expect(page.locator('.lesson-tabs')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Appearance settings' })).toBeVisible();
  await page.getByRole('button', { name: 'Appearance settings' }).click();
  await expect(page.getByRole('dialog', { name: 'Appearance settings' })).toBeVisible();
  await page.getByRole('button', { name: 'Close appearance settings' }).click();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Progress' }).click();
  await expect(page).toHaveURL(/#\/progress$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Progress' })).toBeVisible();
});

test('opens Quantum first and exposes every mission node to native tab order', async ({ page }) => {
  await page.goto('/#/explore');
  await page.getByRole('link', { name: 'Open course: Quantum Physics' }).click();

  await expect(page).toHaveURL(/#\/course\/quantum$/);
  await expect(page.getByRole('heading', { name: 'Quantum Physics' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Learn' }))
    .toHaveAttribute('href', '#/course/quantum');
  const nodes = page.getByRole('list', { name: 'Quantum Physics mission path' }).getByRole('link');
  await expect(nodes).toHaveCount(6);
  await expect(nodes.first()).toHaveAttribute('data-state', 'next');
  await expect(nodes.nth(1)).toHaveAttribute('data-state', 'available');
  await expect(nodes.last()).toHaveAttribute('data-kind', 'checkpoint');
  await nodes.first().focus();
  await expect(nodes.first()).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(nodes.nth(1)).toBeFocused();

  await nodes.first().click();
  await expect(page).toHaveURL(/#\/mission\/quantum\/quantum-light-quanta$/);
  await expect(page.getByRole('link', { name: 'Back to Quantum Physics path' })).toBeVisible();
});

test('course header keeps back link, title, and stats in a stable layout', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#/course/quantum');
  const header = page.locator('#main-content > .course-path-header');
  await expect(header).toBeVisible();
  await expect(header.locator('.contextual-back')).toBeVisible();
  await expect(header.locator('h1')).toHaveText('Quantum Physics');
  await expect(header.locator('dl')).toBeVisible();
  expect(await header.evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length)).toBe(3);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1440);
});

test('filters the course gallery and recovers invalid routes with an announcement', async ({ page }) => {
  await page.goto('/#/explore');
  await page.getByRole('button', { name: 'Modern' }).click();
  await expect(page.getByRole('link', { name: 'Open course: Quantum Physics' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open course: Astrophysics' })).toHaveCount(0);

  await page.goto('/#/course/not-a-course');
  await expect(page).toHaveURL(/#\/explore$/);
  await expect(page.getByRole('status')).toContainText('returned you to Explore');
});

test('skip navigation preserves the current hash route and focuses main content', async ({ page }) => {
  await page.goto('/#/course/quantum');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#\/course\/quantum$/);
  await expect(page.locator('#main-content')).toBeFocused();
});

test('responsive viewports (320x700, 768x1024, 1440x900) have no horizontal page overflow, mobile bottom nav, and 44px targets', async ({ page }) => {
  const viewports = [
    { width: 320, height: 700, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1440, height: 900, name: 'desktop' },
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('/#/explore');

    // Assert no horizontal page overflow
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(overflow, `Horizontal overflow at ${vp.width}x${vp.height} on Explore`).toBe(false);

    // Primary nav targets (44px mobile, 28px desktop Apple HIG)
    const isMobile = vp.width <= 768;
    const navLocator = isMobile
      ? page.getByRole('navigation', { name: 'Mobile navigation' })
      : page.getByRole('navigation', { name: 'Main navigation' });
    const navLinks = navLocator.getByRole('link');
    const navCount = await navLinks.count();
    expect(navCount).toBe(3);
    for (let i = 0; i < navCount; i++) {
      const box = await navLinks.nth(i).boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height, `Nav link ${i} height at ${vp.name}`).toBeGreaterThanOrEqual(isMobile ? 44 : 28);
      expect(box!.width, `Nav link ${i} width at ${vp.name}`).toBeGreaterThanOrEqual(isMobile ? 44 : 28);
    }

    // Primary action target >= 44px
    const continueAction = page.getByRole('link', { name: 'Continue learning' });
    const continueBox = await continueAction.boundingBox();
    expect(continueBox).not.toBeNull();
    expect(continueBox!.height, `Continue action height at ${vp.name}`).toBeGreaterThanOrEqual(44);

    // Filter chips have >= 44px touch height
    const filterBtn = page.getByRole('button', { name: 'Modern' });
    const filterBox = await filterBtn.boundingBox();
    expect(filterBox).not.toBeNull();
    expect(filterBox!.height, `Filter button height at ${vp.name}`).toBeGreaterThanOrEqual(44);

    // Test Course Path at this viewport
    await page.goto('/#/course/quantum');
    const pathOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(pathOverflow, `Horizontal overflow at ${vp.width}x${vp.height} on Course Path`).toBe(false);

    // Contextual back link has touch target >= 44px
    const backLink = page.getByRole('link', { name: /Back to Explore/i });
    const backBox = await backLink.boundingBox();
    expect(backBox).not.toBeNull();
    expect(backBox!.height, `Back link height at ${vp.name}`).toBeGreaterThanOrEqual(44);

    // Verify mobile bottom nav positioning at 320x700
    if (vp.width === 320) {
      const nav = page.getByRole('navigation', { name: 'Mobile navigation' });
      const navPosition = await nav.evaluate(el => {
        const style = window.getComputedStyle(el);
        return { position: style.position };
      });
      expect(navPosition.position).toBe('fixed');
    }

    // No legacy sidebar or lesson tabs at any viewport
    await expect(page.locator('.sidebar')).toHaveCount(0);
    await expect(page.locator('.lesson-tabs')).toHaveCount(0);
  }
});

test('course path displays as an ordered list without connector lines and elements show visible focus', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#/course/quantum');

  // Verify path list has no connector line pseudo-element
  const connectorLine = await page.evaluate(() => {
    const list = document.querySelector('.mission-path');
    if (!list) return null;
    const before = window.getComputedStyle(list, '::before');
    return {
      content: before.content,
      display: before.display,
      width: before.width,
    };
  });
  const hasLine = connectorLine && connectorLine.content !== 'none' && connectorLine.content !== '""' && connectorLine.display !== 'none' && parseFloat(connectorLine.width) > 0;
  expect(hasLine, 'Course path should not have connector lines').toBe(false);

  // Focus visible test: high-contrast visible focus ring
  const firstNode = page.getByRole('list', { name: 'Quantum Physics mission path' }).getByRole('link').first();
  await firstNode.focus();
  await expect(firstNode).toBeFocused();
  const focusRing = await firstNode.evaluate(el => {
    const style = window.getComputedStyle(el);
    return {
      outlineStyle: style.outlineStyle,
      outlineWidth: parseFloat(style.outlineWidth) || 0,
      boxShadow: style.boxShadow,
    };
  });
  const hasVisibleFocus = (focusRing.outlineStyle !== 'none' && focusRing.outlineWidth >= 2) || (focusRing.boxShadow !== 'none' && !focusRing.boxShadow.includes('rgba(0, 0, 0, 0)'));
  expect(hasVisibleFocus, 'Interactive elements must display a visible focus indicator').toBe(true);
});
