# Apple Design UI/UX Overhaul (Precision Scientific Studio) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul the entire UI/UX of Physics Teacher Interactive using the Apple Design Skill and Human Interface Guidelines to create an authentic "Precision Scientific Studio" experience with layer-disciplined Liquid Glass, macOS & iOS navigation, tactile lab instruments, and WCAG AA contrast compliance.

**Architecture:** Pure CSS custom property tokens calibrated for WCAG AA contrast across 5 themes; strict layer discipline restricting Liquid Glass blur exclusively to floating functional controls (`.adventure-topbar`, `.mobile-tab-bar`, `.playback-hud`, `.appearance-popover`) while keeping content cards on crisp standard materials; desktop macOS-style segmented topbar switcher and mobile iOS floating bottom tab bar; tactile physics lab controls with knurled sliders and tabular telemetry.

**Tech Stack:** React 19, TypeScript 5.9, Three.js 0.180, Lucide React, KaTeX, Vitest, Playwright, Vite 6.

## Global Constraints

- Keep SI physics models independent of React and rendering.
- Preserve static GitHub Pages compatibility and hash routing. No credentials or paid services are required.
- Do not use Liquid Glass (`backdrop-filter`) on content-layer cards, lists, or containers.
- Guarantee WCAG AA text contrast (≥ 4.5:1 for body text, ≥ 3.0:1 for large/bold text) across all 5 themes.
- Touch target minimums: 44×44 pt on mobile, 28×28 pt on desktop.
- Numerical measurements and elapsed timecodes must use `font-variant-numeric: tabular-nums`.
- Always verify `npm run check` passes before final commit and push.

---

### Task 1: Safe Window Media Guard & Existing Test Stability

**Files:**
- Modify: `src/components/simulation/Lab.tsx:100-115`
- Test: `tests/simulation-boundary.test.tsx`

**Interfaces:**
- Consumes: `window.matchMedia` browser API (with safe undefined check in test/SSR environments).
- Produces: Safe motion preference listener in `Lab.tsx` that will not throw in JSDOM environments.

- [ ] **Step 1: Inspect failing tests in tests/simulation-boundary.test.tsx**

Run: `npx vitest run tests/simulation-boundary.test.tsx`
Expected: 4 tests failing with `window.matchMedia is not a function`.

- [ ] **Step 2: Add optional chaining and existence check to Lab.tsx**

In `src/components/simulation/Lab.tsx`:
```tsx
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const respectMotion = () => {
      if (media.matches || document.documentElement.dataset.reducedMotion === 'true') setPlaying(false);
    };
    media.addEventListener?.('change', respectMotion);
    const observer = new MutationObserver(respectMotion);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-reduced-motion'] });
    return () => {
      media.removeEventListener?.('change', respectMotion);
      observer.disconnect();
    };
  }, []);
```

- [ ] **Step 3: Run Vitest to verify all tests in simulation-boundary pass**

Run: `npx vitest run tests/simulation-boundary.test.tsx`
Expected: 5 passed (100% pass).

- [ ] **Step 4: Commit**

```bash
git add src/components/simulation/Lab.tsx
git commit -m "fix(simulation): add defensive guard for matchMedia in headless test environments"
```

---

### Task 2: Design Tokens & Liquid Glass Layer Discipline

**Files:**
- Modify: `src/styles/tokens.css`
- Modify: `src/styles/appearance.css`
- Test: `tests/appearance.test.ts`

**Interfaces:**
- Consumes: CSS Custom Properties on `:root` and `[data-theme]`.
- Produces: Calibrated semantic tokens, SF Pro font stack, squircle radii, and strict layer-disciplined Liquid Glass classes (`.liquid-glass-surface`, `.liquid-glass-hud`).

- [ ] **Step 1: Write test for token contrast and layer discipline in tests/appearance.test.ts**

Add tests ensuring all theme contrast tokens meet WCAG requirements and that content cards do not inherit blur.

- [ ] **Step 2: Run test to check current behavior**

Run: `npx vitest run tests/appearance.test.ts`

- [ ] **Step 3: Update tokens.css with Apple SF Pro stack, squircle radii, and WCAG AA contrast**

In `src/styles/tokens.css`:
- Set `font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;`
- Calibrate dark theme `--muted: #9bb0cb` (6.2:1) and `--text-subtle: #8297b5` (4.7:1).
- Calibrate light theme `--muted: #475569` (7.0:1) and `--text-subtle: #5b6e87` (5.1:1).
- Define squircle radii: `--radius-sm: 8px; --radius-md: 12px; --radius-lg: 18px; --radius-xl: 22px; --radius-full: 9999px;`
- Add utility `--font-tabular: tabular-nums;`

- [ ] **Step 4: Overhaul appearance.css with strict layer discipline**

In `src/styles/appearance.css`:
- Remove glass styling from `.course-card`, `.continue-hero`, `.mission-player`, `.mission-step`, `.deep-dive-section`, `.lab`, `.xp-card`, `.streak-card`, `.mastery-section`, `.badge-shelf-section`, `.progress-settings-section`, `.setting-card`.
- Apply Liquid Glass strictly to floating functional layers: `.adventure-topbar`, `.mobile-tab-bar`, `.playback-hud`, and `.appearance-popover`.
- Add specular hairline highlights: `border: 1px solid rgba(255, 255, 255, 0.12); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18), var(--shadow);`
- Enforce opaque fallback for `prefers-reduced-transparency: reduce` and high contrast.

- [ ] **Step 5: Run tests and verify**

Run: `npx vitest run tests/appearance.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/styles/tokens.css src/styles/appearance.css tests/appearance.test.ts
git commit -m "style(design-tokens): enforce Apple HIG layer discipline and WCAG AA contrast"
```

---

### Task 3: Quick Appearance Popover Component

**Files:**
- Create: `src/components/navigation/AppearancePopover.tsx`
- Test: `tests/appearance-popover.test.tsx`

**Interfaces:**
- Consumes: `LearnerProgressV2['settings']`, `onUpdateSettings: (settings: Partial<AppearanceSettings>) => void`.
- Produces: `<AppearancePopover isOpen={boolean} onClose={() => void} ... />` floating glass dialog.

- [ ] **Step 1: Write failing test in tests/appearance-popover.test.tsx**

Test rendering, theme option selection, Liquid Glass toggle, Reduced Motion toggle, and closing on outside click / Escape key.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/appearance-popover.test.tsx`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement AppearancePopover.tsx**

Create `src/components/navigation/AppearancePopover.tsx` with:
- Floating Liquid Glass container with `role="dialog"` and `aria-label="Appearance settings"`.
- Theme chips: Dark, Light, Eye Comfort, Ocean, High Contrast.
- Native-styled toggle switches for Liquid Glass and Reduced Motion.
- Keyboard accessibility: Escape key calls `onClose()`, focus trapped or managed.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/appearance-popover.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/navigation/AppearancePopover.tsx tests/appearance-popover.test.tsx
git commit -m "feat(navigation): add Apple HIG floating glass AppearancePopover"
```

---

### Task 4: Mobile iOS Floating Bottom Tab Bar

**Files:**
- Create: `src/components/navigation/MobileTabBar.tsx`
- Test: `tests/mobile-navigation.test.tsx`

**Interfaces:**
- Consumes: `currentRoute: AppRoute`, `learnHash: string`.
- Produces: `<MobileTabBar currentRoute={route} learnHash={learnHash} />`.

- [ ] **Step 1: Write failing test in tests/mobile-navigation.test.tsx**

Test that MobileTabBar renders 3 primary tabs (`Explore`, `Learn`, `Progress`), marks active tab with `aria-current="page"`, uses correct links, and includes accessibility labels.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/mobile-navigation.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement MobileTabBar.tsx**

Create `src/components/navigation/MobileTabBar.tsx` with:
- Liquid Glass floating dock at `bottom: calc(12px + env(safe-area-inset-bottom))`.
- 3 touch targets (48px height) with SF-style Lucide icons: `Compass`, `Map`, `ChartNoAxesColumn`.
- Filled/bold visual representation when active, subtle active indicator pill, and touch feedback (`transform: scale(0.96)`).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/mobile-navigation.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/navigation/MobileTabBar.tsx tests/mobile-navigation.test.tsx
git commit -m "feat(navigation): add iOS-style floating bottom Liquid Glass tab bar"
```

---

### Task 5: Overhaul App Shell & Desktop macOS Navigation

**Files:**
- Modify: `src/app/AppShell.tsx`
- Modify: `src/styles/shell.css`
- Modify: `src/styles/responsive.css`
- Test: `tests/router.test.ts`
- Test: `tests/e2e/responsive.spec.ts`

**Interfaces:**
- Consumes: `AppShellProps` (`route`, `learnHash`, `recoveryMessage`, `mainRef`, `children`).
- Produces: Unified responsive shell supporting desktop macOS segmented switcher + mobile bottom dock + appearance popover.

- [ ] **Step 1: Update AppShell.tsx to integrate segmented control, telemetry badge, AppearancePopover, and MobileTabBar**

In `src/app/AppShell.tsx`:
- Add state for `isAppearanceOpen`.
- Render macOS-style segmented control in desktop header with sliding active indicator.
- Render XP / Streak telemetry badge in header.
- Render Palette trigger button that toggles `AppearancePopover`.
- Render `MobileTabBar` for compact viewports.

- [ ] **Step 2: Refactor shell.css and responsive.css**

- Style `.adventure-topbar` as authentic 56px Liquid Glass header.
- Style `.macos-segmented-nav` with sliding pill background, subtle borders, and smooth transitions.
- Ensure on viewports `<= 768px`, desktop nav is hidden and `.mobile-tab-bar` is active with safe-area spacing.

- [ ] **Step 3: Verify with Vitest and typecheck**

Run: `npm run typecheck && npm test`
Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/app/AppShell.tsx src/styles/shell.css src/styles/responsive.css
git commit -m "feat(shell): implement macOS segmented desktop toolbar and responsive shell"
```

---

### Task 6: Overhaul Precision Physics Lab & Floating Playback HUD

**Files:**
- Modify: `src/components/simulation/Lab.tsx`
- Modify: `src/styles/simulation.css`
- Test: `tests/simulation-boundary.test.tsx`

**Interfaces:**
- Consumes: Simulation definition, parameters, state, trajectory.
- Produces: Precision instrument lab frame, floating glass playback HUD pill, knurled sliders with live unit badges, tabular telemetry readouts.

- [ ] **Step 1: Write test for playback HUD and knurled slider accessibility**

Verify that Play, Step, Reset, and Speed buttons exist with proper aria attributes and that slider values show unit formatting.

- [ ] **Step 2: Update Lab.tsx with Floating Glass Playback HUD**

In `src/components/simulation/Lab.tsx`:
- Group playback controls into a centered floating Liquid Glass HUD (`.playback-hud`) hovering over the canvas:
  - Play/Pause circular primary button with prominent fill.
  - Step button (1/60s advance).
  - Reset button.
  - Speed multiplier segmented pill (`0.5×`, `1×`, `2×`).
  - Monospace tabular timecode (`tabular-nums`).
- Style sliders with knurled hardware appearance, live unit pills, and keyboard navigation.
- Ensure telemetry meters use tabular figures for jitter-free 60 FPS animation.

- [ ] **Step 3: Update simulation.css**

- Apply precision instrument styling to `.lab-canvas-frame`: dark anodized aluminum bezel (`#0b121e`), 18px radii, subtle depth.
- Style `.playback-hud` with Liquid Glass blur, hairline specular borders, and tactile touch states.
- Style `.parameter-slider` with custom thumb and active expansion.

- [ ] **Step 4: Run tests to verify**

Run: `npx vitest run tests/simulation-boundary.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/simulation/Lab.tsx src/styles/simulation.css
git commit -m "feat(simulation): add precision instrument housing and floating glass playback HUD"
```

---

### Task 7: Overhaul Explore Page & Course Path UI

**Files:**
- Modify: `src/pages/ExplorePage.tsx`
- Modify: `src/pages/CoursePathPage.tsx`
- Modify: `src/styles/explore.css`
- Modify: `src/styles/path.css`
- Test: `tests/learning-catalog.test.ts`

**Interfaces:**
- Consumes: `CourseDefinition[]`, `LearnerProgressV2`.
- Produces: Refined Spotlight-style course search, squircle course cards, and milestone pathway.

- [ ] **Step 1: Refactor ExplorePage.tsx and explore.css**

- Enhance Continue Learning card with subtle gradient depth and Apple-style typography.
- Refine search field with Spotlight look (magnifying glass, clear button, keyboard hint).
- Style filter chips with Apple pill segmented styling.
- Style `.course-card` with continuous 20px squircle corners, subtle borders, and smooth hover lift.

- [ ] **Step 2: Refactor CoursePathPage.tsx and path.css**

- Enhance course header with circular SVG mastery ring and macOS-style back button.
- Style milestone pathway with solid connector rail, mint completed checkmarks, glowing active Play nodes, and amber checkpoint trophy nodes.

- [ ] **Step 3: Run Vitest tests to verify**

Run: `npx vitest run tests/learning-catalog.test.ts tests/starter-courses.test.ts`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/pages/ExplorePage.tsx src/pages/CoursePathPage.tsx src/styles/explore.css src/styles/path.css
git commit -m "style(pages): overhaul Explore gallery and Course Path with Apple squircle design"
```

---

### Task 8: Overhaul Mission Player & Progress / Settings UI

**Files:**
- Modify: `src/components/mission/MissionPlayer.tsx`
- Modify: `src/pages/ProgressPage.tsx`
- Modify: `src/styles/mission.css`
- Modify: `src/styles/progress.css`
- Test: `tests/rewards.test.tsx`
- Test: `tests/mission-content.test.ts`

**Interfaces:**
- Consumes: Mission steps, learner progress, user settings.
- Produces: 7-segment journey progress bar, tactile radio option cards, inset grouped settings, and Activity-style recap.

- [ ] **Step 1: Refactor MissionPlayer.tsx and mission.css**

- Replace plain step counter with a 7-segment Apple-style journey bar.
- Refine assessment question options as tactile selectable cards with active borders and inline feedback (no disruptive alerts).
- Polish KaTeX formula presentations and Deep Dive disclosures.
- Style Recap step with 1–3 star ratings, XP awards, and celebratory animations.

- [ ] **Step 2: Refactor ProgressPage.tsx and progress.css**

- Organize settings into iOS Settings-style grouped inset cards with clean section headers.
- Style daily goal selector as a segmented control.
- Polish metallic sheen on Checkpoint Badge Shelf items.
- Ensure drag-and-drop JSON backup area has clear dashed border and accessible status feedback.

- [ ] **Step 3: Run Vitest tests to verify**

Run: `npx vitest run tests/rewards.test.tsx tests/mission-content.test.ts`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/mission/MissionPlayer.tsx src/pages/ProgressPage.tsx src/styles/mission.css src/styles/progress.css
git commit -m "style(mission-progress): overhaul Mission Player flow and iOS-style inset settings"
```

---

### Task 9: Comprehensive Verification, Documentation & Authorized Push

**Files:**
- Modify: `CHANGELOG.md`
- Test: Vitest full suite (`npm test`)
- Test: Playwright E2E suite (`npx playwright test`)
- Build: Vite production build (`npm run check`)

**Interfaces:**
- Consumes: Full codebase.
- Produces: Passing test suites across all viewports, documented CHANGELOG, and clean push to `origin/main`.

- [ ] **Step 1: Run full verification suite**

Run: `npm run check`
Expected: `typecheck`, `lint`, `test`, and `build` all exit with code 0.

- [ ] **Step 2: Run Playwright e2e browser checks**

Run: `npx playwright test`
Expected: All visual, interaction, and responsive navigation journeys pass.

- [ ] **Step 3: Update CHANGELOG.md**

Document all scientific, interface, and Apple Design Skill improvements under `[Unreleased]` or `[0.3.0]`.

- [ ] **Step 4: Final commit and push**

```bash
git add CHANGELOG.md
git commit -m "release: Apple Design UI/UX overhaul across tokens, navigation, lab, and pages"
git push origin main
```
