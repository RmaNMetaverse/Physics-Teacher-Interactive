# Changelog

## 2026-09-14 — Apple HIG Appearance Popover & Quick Navigation

- Added `<AppearancePopover />` floating Liquid Glass dialog enabling in-place theme switching (dark, light, eye-comfort, ocean, high-contrast) and visual effect toggles (Liquid Glass, Reduced Motion) without losing user learning context.
- Implemented accessible modal controls with Escape key dismissal, click-outside dismissal, and direct navigation to full settings.
- Added comprehensive unit tests in `tests/appearance-popover.test.tsx`.

## 2026-09-14 — Apple HIG Design Tokens & Liquid Glass Layer Discipline

- Calibrated semantic color tokens for dark and light themes to exceed WCAG AA contrast (normal text >= 4.5:1, subtle text >= 4.5:1, headings/primary text >= 7.0:1).
- Defined Apple SF Pro font stack, squircle radii (`--radius-sm: 8px;`, `--radius-md: 12px;`, `--radius-lg: 18px;`, `--radius-xl: 22px;`), and tabular numeric alignment token (`--font-tabular: tabular-nums;`).
- Enforced Apple HIG Liquid Glass layer discipline: restricted backdrop-filter blur and specular hairline highlights strictly to floating functional controls (`.adventure-topbar`, `.mobile-tab-bar`, `.playback-hud`, `.appearance-popover`) and utility classes (`.liquid-glass-surface`, `.liquid-glass-hud`).
- Guaranteed crisp standard opaque materials without backdrop blur for all content cards (`.course-card`, `.mission-player`, `.setting-card`, `.lab`, etc.).
- Enforced opaque fallbacks for `prefers-reduced-transparency: reduce` and `[data-theme="high-contrast"]`.

## 2026-09-12 — Progress dashboard layout redesign

- Rebuilt the progress page layout with explicit component-aligned dashboard styles, consistent card surfaces, readable typography, and intentional whitespace between every progress section.
- Added responsive reward, streak, goal, mastery, activity, settings, and backup layouts for desktop, tablet, and narrow phone widths.
- Added accessible visual hierarchy for XP, streak, mastery, badge, and activity metadata while preserving existing progress behavior and hash routing.

## 2026-09-12 — Appearance discoverability and layout repair

- Added an always-visible Appearance shortcut to the top bar, with a compact icon-only treatment on phones, so theme presets, custom colors, and Liquid Glass are reachable from every route.
- Made Liquid Glass the default for new sessions and for legacy dark/light settings that have no stored glass preference.
- Repaired the Learn course header grid: back navigation, course title, and progress/time stats now occupy explicit stable regions and collapse cleanly on mobile.
- Added focused browser coverage for the global appearance entry point, course-header structure, responsive overflow, and touch layout.

## 2026-09-12 — Custom themes and Liquid Glass

- Expanded appearance settings from dark/light into Light, Night, Eye Comfort, Ocean, and High Contrast presets, each with tailored surfaces, text, borders, shadows, and default accents.
- Added persistent primary and secondary color pickers, preset-color reset, and automatic light/dark foreground selection for filled primary controls.
- Added an independent Liquid Glass switch with translucent blurred panels, specular borders, soft color blooms, elevated controls, progressive fallback, and no continuous animation.
- Preserved import compatibility with version-1 dark/light preferences and original version-2 settings while strictly validating new theme, color, and glass values.
- Added responsive settings layouts for 320px phones and automated coverage for theme selection, color application, Liquid Glass, reload persistence, migration, validation, and horizontal overflow.
- Documented presets, visual behavior, compatibility, and persistence in `docs/APPEARANCE.md`.

## 2026-09-12 — 3D laboratory visual upgrade

- Rebuilt the shared 3D stage with beveled instrument housings, brushed-metal bump and roughness textures, directional rim lighting, luminous deck accents, procedural surface shaders, and astronomy halos and star fields.
- Upgraded all eight foundation experiment families with detailed apparatus, solid vector shafts, ramp supports, cart wheel hubs, spring guides, pendulum hardware, and clearer schematic markers.
- Filled the previously empty 3D views for all 12 advanced models with distinct, labeled displays driven by existing SI observations, including animated wave samples, relativistic clocks, instanced probability bins, and physical instrument readouts.
- Kept geometry bounded and rendering on demand, removed shadow-map rendering costs, added conservative initial pixel-ratio caps and sustained-frame-time resolution reduction, and fitted cameras to narrow mobile viewports. No dependency changes or remote visual assets.
- Expanded browser checks to actual WebGL/shader output, rendering budgets, all 20 models, foundation variants, and a 320px high-DPI phone. Documented scientific interpretation and performance limits in docs/3D-RENDERING.md.

## 0.2.0 — 2026-09-11

- Completed legacy UI cleanup by removing retired `MathModal.tsx` and `AssessmentCard.tsx` and stripping obsolete selectors from `src/styles.css`.
- Added `--accent-contrast` semantic token in `src/styles/tokens.css` (`#ffffff` light, `#0d1117` dark) ensuring WCAG AA compliance across primary accent buttons in Explore, Mission Player, and Shell.
- Replaced legacy browser tests in `tests/e2e/learning.spec.ts` and `tests/e2e/release.spec.ts` with comprehensive coverage of Explore discovery, Quantum starter mission flow, one-time XP, replay without duplication, course switching, version-1 progress migration, forced 3D fallback mode, version-2 JSON export, unknown route recovery, and subpath reload safety.
- Updated all project guides and architectural documentation for the Balanced Science Adventure multi-course system.

- Implemented the full Balanced Science Adventure visual design system with semantic CSS tokens and modular stylesheets (`tokens.css`, `shell.css`, `explore.css`, `path.css`, `mission.css`, `progress.css`, `simulation.css`, `responsive.css`).
- Introduced semantic color palettes and surfaces: warm off-white surfaces (`#fbfbfe` light, `#0d1117` / `#161b22` dark), deep navy text (`#0d192e`), violet journey accents, mint mastery, gold rewards, and coral feedback.
- Enforced minimum 44px touch/click targets across primary controls, navigation links, filters, and call-to-action buttons.
- Added high-contrast visible focus rings across interactive elements (`button`, `a`, `input`, `select`).
- Designed fluid responsive layouts for Desktop (1440x900), Tablet (768x1024), and Mobile (320x700), eliminating horizontal page overflow and providing a 3-item persistent bottom navigation bar on mobile (`Explore`, `Learn`, `Progress`).
- Displayed course mission path as a clean ordered list without connector lines.
- Integrated dual reduced-motion support across both system `@media (prefers-reduced-motion: reduce)` and learner preference `data-reduced-motion="true"`, ensuring celebration animation duration is 0ms.
- Added end-to-end browser specifications in `tests/e2e/navigation.spec.ts` and `tests/e2e/mission.spec.ts` covering 320x700, 768x1024, and 1440x900 viewports, no page overflow, mobile bottom nav, 44px targets, visible focus, and reduced-motion celebration duration.

- Implemented `ProgressPage` providing a full mastery dashboard, level progression, streak tracking, daily goal controls, course mastery rings, checkpoint badge shelf, validated recent ledger activity, user preferences, and data backup controls.
- Added accessible reward components: `XpBar` with `Math.floor(totalXp / 500) + 1` level derivation and singular/plural XP copy, `StreakCard` with longest streak tracking and flame visual, `MasteryRing` with accessible SVG ring and text equivalents, `BadgeShelf` displaying checkpoint achievement badges, and `Celebration` with a restrained SVG burst.
- Guarded celebrations with user preferences and `prefers-reduced-motion` detection, ensuring zero duration under reduced motion and synthesized sound with zero network requests.
- Added daily learning goal controls (1, 3, 5 missions/day), theme appearance toggles ('light' | 'dark'), and preference switches for sound, reduced motion, and celebratory animations.
- Implemented robust data management: export to validated version-2 JSON file, import validated via `parseProgressV2` with error alerts, and progress reset with confirmation that strictly preserves user settings.
- Added unique key to `<Lab />` in `SimulationStep.tsx` ensuring clean simulation scene reset between mission steps.
- Mounted `<Celebration />` in `RecapStep` upon mission completion, honoring learner preferences (`settings.celebrations`, `settings.sound`, `settings.reducedMotion`) and ensuring safe cleanup of Web Audio contexts.
- Replaced `ProgressPlaceholder` in `App.tsx` with `<ProgressPage progress={progress} onProgressChange={setProgress} />`.
- Added comprehensive unit and component tests in `tests/rewards.test.tsx` and end-to-end browser specifications in `tests/e2e/progress-v2.spec.ts`.

- Integrated shared simulation engine across all 14 courses via `SimulationStep.tsx` and generalized `Lab.tsx`.
- Implemented `SimulationBoundary.tsx` providing a resilient error boundary and reduced visual mode catching WebGL context, dynamic import, and scene rendering failures.
- Preserved the active pure model loop during reduced visual mode: experiment controls, numerical observations, SVG graphs, accessible measurement data tables, and model descriptions remain fully interactive even when 3D rendering is unavailable.
- Generalized `Lab`, `Scene`, and `GraphView` from legacy `Family` to universal `ModelId`, displaying at most three essential controls before an accessible "Explore further" disclosure.
- Added keyboard operability for numeric inputs and sliders with arrow navigation and bounds checking.
- Preserved play, pause, reset, step forward, playback speed controls, time scrubbing, and live numerical time display.
- Relocated `Lab`, `Scene`, and `GraphView` to `src/components/simulation/`.
- Added unit tests in `tests/simulation-boundary.test.tsx` and Playwright E2E browser specifications in `tests/e2e/simulations.spec.ts` covering forced fallback and representative simulation missions from all 14 courses.

- Added a focused bite-sized `MissionPlayer` and `MissionPage` with close navigation, step progress, one prominent primary action, optional back action, and continuous local-storage resume state.
- Added focused step renderers for observe, predict/check assessments, interactive simulations, layered math, physical explanations, and recap.
- Implemented layered math in `MathStep` with a concise overview (equation, purpose, symbols) and expandable foundation mode revealing concepts, plain-language explanations, interactive visual manipulation, sequential worked steps, check assessments, prerequisite return navigation, and focus restoration.
- Resolved mission player state reconciliation on mission transitions using key-based component recreation (`key={`${course.id}:${mission.id}`}`).
- Gated mission completion side effects with session reference tracking to prevent re-render loops and redundant storage writes.
- Added direct math check assessment affordances and footer completion hints to Quick Mode so learners can verify understanding without mandatory tutorial expansion.
- Aligned recap fallback star calculations for missions without scored steps with mission-engine mastery rules.
- Implemented `RecapStep` awarding one-time XP and 1–3 star mastery, offering Continue, Replay, and expandable tab-free `DeepDive` with derivations, explanations, limitations, experimental suggestions, and literature citations.
- Enhanced `Equation` with accessible `role="math"`, `aria-label`, and optional inline display modes.
- Added unit and component tests in `tests/math-layer.test.tsx` and end-to-end browser specifications in `tests/e2e/mission.spec.ts` covering Foundations and Quantum missions.

- Corrected numeric-answer rounding allowance to scale with the answer magnitude, preventing zero or substantially wrong answers from passing tiny SI-energy checks with explicit scientific tolerances.

- Authored thirteen open five-mission starter courses and thirteen checkpoints, bringing the validated catalog to fourteen courses and eighty-nine normal missions; Quantum is addressable from its first mission without completion gates.
- Added distinctive explanations, equations, symbol definitions, worked examples, layered prerequisite math, three scored checks, source references, evidence labels, and explicit lab limitations to every starter mission.
- Distinguished established quantum predictions from interpretations, active research on neutrino masses and cosmic components, and explicitly speculative quantum-gravity/multiverse proposals; documented starter scope and source review.

- Added twelve pure SI classroom models across waves, thermal physics, electromagnetism, optics, relativity, quantum, atomic, nuclear, particle, condensed matter, astrophysics and cosmology, with analytic reference tests and documented approximation limits.
- Added a shared 20-model registry for course validation and evaluation while retaining the legacy eight-family API; hardened new model input/time bounds, focal-lens singularity handling, normalized quantum probability bins and exponential stability.

- Fixed recap readiness so `canAdvance` is true only when all scored steps and simulations are complete and the recap has not already been completed.
- Added a pure, deterministic mission state machine with validated navigation, answers, guidance, math and simulation completion, restore support, and 1–3 star mastery outcomes.
- Hardened version-2 serialization and local persistence with catalog-aware validation, deterministic checkpoint prerequisites and badge alignment, and globally unique badge IDs.
- Added catalog-validated version-2 learner progress with safe version-1 migration, one-time mission XP, replay star improvements, checkpoint badges, configurable daily goals, local-day streaks, and resilient local storage/import handling.
- Approved the Balanced Science Adventure redesign and reusable mission-engine specification for a gamified 14-course learning platform with concise and expandable zero-prior-knowledge mathematics.
- Added typed, catalog-validated open courses and missions with required instructional content, unique assessment IDs, signed math visuals, source, limitation, simulation, checkpoint, and recommendation-graph safeguards.
- Adapted all 24 Foundations lessons into 60-XP missions while preserving their authored explanations, assessments, sources, limitations, SI presets, and math prerequisites.
- Added concise expert math paths with expandable zero-prior-knowledge concepts, symbol definitions, prerequisite return links, visuals, worked examples, hints, and checks for all 17 tutorials.
- Preserved each Foundations mission’s original equation, symbol glossary, worked example, and review date, and validated its math-step return links and visual identities.
- Completed equation-level symbol and operation definitions for all 17 tutorials with exhaustive authored metadata.
- Restored lightweight checkpoint missions by limiting legacy equation, glossary, worked-example, and review-date requirements to normal instructional missions.

## 0.1.0 — 2026-09-09

- Released a 24-lesson foundations course across measurement, vectors, motion, forces, energy, momentum, gravity, and oscillations.
- Added eight deterministic SI simulation families with interactive 3D scenes, live measurements, graphs, and readable data tables.
- Added 17 prerequisite math tutorials with manipulable visuals, worked examples, hints, and checks.
- Added guided lesson sections, curriculum search, local progress, validated import/export, theme controls, and responsive layouts.
- Hardened saved progress against retired or tampered curriculum and assessment IDs, and kept keyboard skip navigation on the active lesson.
- Added scientific, curriculum, accessibility, and browser regression tests.
- Added SHA-pinned CI and GitHub Pages deployment workflows for Node.js 22.20.
