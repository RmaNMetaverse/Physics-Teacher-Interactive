# Design Document: Apple Design UI/UX Overhaul (Precision Scientific Studio)

**Date**: 2026-09-14  
**Status**: Approved  
**Framework**: Apple Human Interface Guidelines (HIG) via [apple-design-skill](https://github.com/dickwu/apple-design-skill)  
**Target Platform**: Responsive Web (macOS Desktop, iPadOS Tablet, iOS Phone, and cross-platform desktop/mobile browsers)

---

## 1. Executive Summary & Design Thesis

### The Product
Physics Teacher Interactive is an interactive learning platform that couples rigorous SI physics simulations in Three.js with a structured curriculum of 24 foundations lessons, 89 normal missions, 13 checkpoints, and 17 layered mathematics modules.

### The Design Thesis
**The single job of this interface is to make theoretical physics tangible and immediate through the metaphor of a precision scientific studio instrument.**
The signature element is the **tactile laboratory workbench**: precision knurled parameter controls, live tabular telemetry readouts, and a floating Liquid Glass playback HUD over real-time WebGL physics simulations.

### Apple HIG Alignment
This overhaul grounds the application in Apple's eight design principles reintroduced in June 2026:
* **Purpose**: Keep the learner focused on physical principles without visual distraction.
* **Agency**: Provide effortless recovery from errors, undoable actions, and non-blocking exploration.
* **Responsibility**: Fully transparent local storage, accessible fallbacks, and zero user tracking.
* **Familiarity**: Adopt platform navigation patterns (macOS top toolbar with segmented switcher on desktop; floating bottom Liquid Glass tab bar on mobile).
* **Flexibility**: Responsive layouts from 320px mobile screens to ultra-wide displays with Dynamic Type / font scaling resilience.
* **Simplicity**: Every UI element earns its place; remove redundant decorative blur and unnecessary cards.
* **Craft**: Pixel-perfect alignment, continuous squircle radii (`18px–24px`), optical sizing, and tabular figure stability.
* **Delight**: Meaningful celebration moments (XP awards, star ratings, and streak punch cards) that feel satisfying without ever degrading into mere decoration.

---

## 2. Design System Foundations & Token Architecture

### 2.1 Authentic Liquid Glass & Layer Discipline (`liquid-glass.md`)
Apple HIG mandates a strict separation between two layers:
1. **Functional Layer (Liquid Glass permitted)**:
   * Only floating navigation controls and transient overlays:
     * Desktop Sticky Topbar (`.adventure-topbar`)
     * Mobile Floating Bottom Tab Bar (`.mobile-tab-bar`)
     * Floating Simulation Playback HUD (`.playback-hud`)
     * Quick Appearance Popover / Sheet (`.appearance-popover`)
   * Specification:
     * `backdrop-filter: blur(24px) saturate(150%)`
     * `-webkit-backdrop-filter: blur(24px) saturate(150%)`
     * Background fill: `color-mix(in srgb, var(--panel) 76%, transparent)`
     * Specular hairline edge: `border: 1px solid rgba(255, 255, 255, 0.12)`
     * Top edge specular reflection: `box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.18), var(--shadow)`
   * Accessibility: When `prefers-reduced-transparency: reduce` or high-contrast mode is active, all blur is removed and surfaces render as opaque `--panel` with solid borders.

2. **Content Layer (Opaque Standard Materials)**:
   * Course cards, mission step cards, deep-dive accordions, reading text, setting cards, and the simulation enclosure sit in the content layer.
   * They use Apple standard materials (`--panel`, `--raised`, `--sunken`) with continuous squircle corners (`border-radius: 18px–22px`).
   * Eliminates the defect of "glass stacked on glass" which previously caused illegible text and visual mud.

### 2.2 Color System & Contrast Guarantee (`color.md`, `accessibility.md`)
All body text and subtle labels are calibrated to guarantee WCAG AA compliance (contrast ratio ≥ 4.5:1 for body text, ≥ 3.0:1 for large/bold text).

```css
/* Dark Theme (Default) */
:root, [data-theme="dark"] {
  --bg: #090d16;
  --panel: #121824;
  --raised: #1c2436;
  --sunken: #060910;
  --line: #263249;
  --line-subtle: #192233;

  --text: #f5f8fc;
  --muted: #9bb0cb;        /* Contrast ratio: 6.2:1 against --panel (Passes WCAG AA) */
  --text-subtle: #8297b5;  /* Contrast ratio: 4.7:1 against --panel (Passes WCAG AA) */

  --accent: #a78bfa;        /* SF Purple / Indigo */
  --accent-hover: #c4b5fd;
  --accent-soft: rgba(167, 139, 250, 0.16);
  --accent-contrast: #090d16;

  --teal: #34d399;          /* SF Mint (Mastery) */
  --teal-soft: rgba(52, 211, 153, 0.16);

  --gold: #fbbf24;          /* SF Amber (Rewards & Streaks) */
  --gold-soft: rgba(251, 191, 36, 0.16);

  --coral: #fb7185;         /* SF Coral (Alerts & Warnings) */
  --coral-soft: rgba(251, 113, 133, 0.16);
}

/* Light Theme */
[data-theme="light"] {
  --bg: #f8fafc;
  --panel: #ffffff;
  --raised: #edf2f7;
  --sunken: #e2e8f0;
  --line: #d8e2ed;
  --line-subtle: #eef3f8;

  --text: #0f172a;
  --muted: #475569;        /* Contrast ratio: 7.0:1 against --bg (Passes WCAG AA) */
  --text-subtle: #5b6e87;  /* Contrast ratio: 5.1:1 against --bg (Passes WCAG AA) */

  --accent: #7c3aed;
  --accent-hover: #6d28d9;
  --accent-soft: rgba(124, 58, 237, 0.12);
  --accent-contrast: #ffffff;

  --teal: #059669;
  --teal-soft: rgba(5, 150, 105, 0.12);

  --gold: #d97706;
  --gold-soft: rgba(217, 119, 6, 0.12);

  --coral: #e11d48;
  --coral-soft: rgba(225, 29, 72, 0.12);
}
```

### 2.3 Typography & Metrics (`typography.md`)
* Primary Font Family: `-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
* Monospace & Telemetry: `"SF Mono", ui-monospace, Menlo, Monaco, Consolas, monospace`
* Numeric Stability: All live measurements, elapsed timecodes, and telemetry meters use `font-variant-numeric: tabular-nums` to eliminate jitter during 60 FPS animation.
* Touch Targets: Minimum 44×44 pt on mobile touch devices, 28×28 pt on desktop (`accessibility.md`).

---

## 3. Navigation Architecture & App Shell

### 3.1 Desktop macOS-Style Top Toolbar
* **Height & Position**: Sticky top toolbar at 56px height with authentic Liquid Glass translucency.
* **Left**: Brand lockup with Atom glyph, clean title text, and subtle version tag.
* **Center**: macOS-style segmented switcher:
  * 3 equal-width segments: **Explore** (`Compass`), **Learn** (`Map`), **Progress** (`ChartNoAxesColumn`).
  * Sliding background pill indicator with spring transition.
  * Full keyboard arrow-key navigation (Left/Right to switch, Space/Enter to activate).
* **Right**:
  * Telemetry pill displaying XP and active Streak with amber flame glyph.
  * Appearance Popover button (`Palette` icon), opening an in-place floating glass popover (no more jarring page redirect).

### 3.2 Mobile iOS-Style Floating Bottom Tab Bar
* On screens ≤ 768px:
  * The main navigation moves to a floating bottom Liquid Glass tab bar anchored at `bottom: calc(12px + env(safe-area-inset-bottom))`.
  * Features 3 large touch targets (48px height) with SF Symbols: `Compass`, `Map`, `ChartNoAxesColumn`.
  * Active state displays filled icons and accent glow.
  * Active tap response uses Apple-style compression feedback (`transform: scale(0.96)`).
* The top mobile bar is simplified into a lightweight header displaying brand title, current course breadcrumb, and the quick appearance toggle.

### 3.3 Quick Appearance Popover
* Accessible popover anchored to the palette button in the top bar.
* Contains:
  1. Theme Segmented Chips: Dark, Light, Eye-Comfort, Ocean, High-Contrast.
  2. Liquid Glass Switch: Apple-style toggle switch with instant feedback.
  3. Reduced Motion Switch: Apple-style toggle switch that clamps animations to 0ms.
  4. Link to full settings on the Progress page.

---

## 4. Precision Physics Lab & Instrument Controls

### 4.1 Instrument Enclosure & Viewport
* **Housing**: Dark anodized aluminum frame (`#0b121e`), brushed metal rim, chamfered corner radii (`18px`).
* **Header Controls**:
  * Top-left: Stage name & model identifier.
  * Top-right: Segmented control for **3D Canvas** vs **Graph Plotter**.
  * Camera Angle Switcher: Compact icon button group for Default, Overhead, Elevation, and Tracking views.

### 4.2 Floating Glass Playback HUD
* **Position**: Floats centered above the bottom edge of the 3D viewport on a Liquid Glass pill.
* **Controls**:
  * **Play / Pause**: 44px round button with high-contrast filled icon and primary accent styling.
  * **Frame Step**: Advances physics simulation by 1/60th second for frame-by-frame scientific study.
  * **Reset**: Rewinds to $t = 0$ while preserving adjusted parameters.
  * **Speed Multiplier**: Segmented selector for `0.5×`, `1×`, and `2×`.
  * **Timecode Readout**: High-precision tabular readout (`t = 1.25 s / 5.00 s`) with scrubbing scrubber rail.

### 4.3 Knurled Tactile Sliders
* **Appearance**: Hardware-inspired cylindrical thumb with subtle knurling ridges, smooth track fill, and active expansion state.
* **Live Value Pill**: Floating numeric badge positioned above thumb indicating exact numeric value with SI unit (e.g. `k = 25.0 N/m`, `v₀ = 14.2 m/s`).
* **Keyboard Control**: Arrow keys for fine single-step increments; Shift + Arrow for 10× coarse adjustment.
* **Progressive Disclosure**: Primary 2–3 parameters stay visible; secondary parameters tuck behind an "Explore Deeper" disclosure chevron.

### 4.4 Telemetry Meters
* Modular grid of telemetry cards displaying real-time SI values (Velocity, Acceleration, Kinetic Energy, Potential Energy, Momentum).
* Rendered in `font-variant-numeric: tabular-nums` to ensure stability.

---

## 5. Page Experiences

### 5.1 Explore Page
* **Hero "Continue Learning" Card**: Featured banner with smooth depth gradient, active mission artwork, progress bar, and high-visibility "Continue Mission ›" button.
* **Spotlight-Style Course Search**: Centered search input with magnifying glass and keyboard shortcut hint (`Cmd/Ctrl + K`).
* **Course Category Filter Chips**: Apple segmented pills (**All**, **Foundations**, **Classical**, **Modern**, **Space**, **Frontier**) with springy active pill indicators.
* **Course Gallery Cards**: Continuous squircles (`20px`), level pill, estimated time with clock icon, mission count badge, progress track, and subtle hover elevation (`translateY(-2px)`).

### 5.2 Course Path Page
* **Course Overview Header**: Circular SVG mastery ring, remaining time estimate, and macOS-style back button (`‹ Back to Explore`).
* **Vertical Milestone Pathway**:
  * Connected by a solid path rail.
  * Completed nodes: Mint circle with checkmark.
  * Active/Next node: Pulsing accent glow with Play icon and highlighted card.
  * Checkpoints: Amber hexagonal trophy badges.
  * Available nodes: Monochromatic step indicators.

### 5.3 Mission Player (7-Step Guided Flow)
* **Segmented Mission Progress Bar**: 7-segment progress pill showing the flow: *Observe → Predict → Simulate → Explain → Math → Check → Recap*.
* **Assessment & Question Cards**: Tactile option cards with radio rings, clear hover states, and inline feedback (mint for correct, coral for retry with explanatory rationale).
* **Layered Math Display**: Clean KaTeX formula presentation with a fluid button to expand the interactive visual foundation.
* **Recap Celebration**: Activity-style summary with 1–3 star ratings, XP awards, and direct "Next Mission ›" action.

### 5.4 Progress Page & Inset Settings
* **Activity Dashboard**: Concentric SVG mastery rings, weekly punch cards for streaks, and XP level progress.
* **Badge Shelf**: Metallic-sheen 3D-styled checkpoint badges with unlock timestamps.
* **Grouped Inset Settings**:
  * Segmented daily goal selector (1, 3, 5 missions).
  * Appearance theme preview swatches.
  * Native-styled switches for Liquid Glass and Reduced Motion.
  * Validated JSON import/export with drag-and-drop target zone.

---

## 6. Verification & Quality Gates

1. **Unit & Integration Tests**:
   * All 236+ Vitest tests must pass.
   * Add test coverage for the quick appearance popover, mobile tab bar active states, and reduced motion safety in `Lab.tsx`.
2. **Type Checking & Linting**:
   * `tsc --noEmit` and `eslint .` must pass with zero errors.
3. **Build & Bundle Verification**:
   * `npm run build` must succeed with production bundle optimization.
4. **Browser & Playwright Verification**:
   * Run Playwright e2e suite across Desktop (1280×800), Tablet (768×1024), and Mobile (375×667).
5. **Git Push & Source Control Workflow**:
   * Update `CHANGELOG.md` with complete documentation of the Apple Design overhaul.
   * Commit and push cleanly to `origin/main` according to `AGENTS.md`.
