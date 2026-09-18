# Changelog

## 2026-09-18 — Retain only GitHub Pages deployment

- Removed `vercel.json` and retired Vercel preview and production configuration.
- Clarified documentation in `docs/DEPLOYMENT.md` and `README.md` to establish GitHub Pages as the single supported static deployment target.

## 2026-09-18 — Interactive 2D physics overhaul and definitive mobile fixes

- Made polished, continuously animated 2D simulations the default throughout the physics catalog, with specialized visual systems for trajectories, waves, gases, fields, probability distributions, optics, matter, and space.
- Kept optional 3D views only where spatial depth materially supports learning: orbital gravity, spatial electromagnetic fields, atomic structure, condensed-matter structure, and astrophysics.
- Reused the existing pure SI models for every view, so live readouts, graphs, assessments, parameter controls, and 2D/3D visuals remain synchronized without duplicating scientific calculations.
- Restored smooth continuous mobile range dragging by removing the document-wide touch cancellation and manual pointer capture that interfered with native range controls; the slider itself still prevents page panning during an active gesture.
- Removed the LiquidGlass compositor's hard-coded white scene fill. Refracted gaps now use the computed app, body, or page theme background, and the dependency correction is automatically reapplied after installs with `patch-package`.
- Added full model-family renderer tests, spatial-render policy tests, a genuine Chrome touch-drag regression, a dark-theme LiquidGlass pixel regression after rapid scrolling, and updated cross-course browser coverage for the 2D-first interface.

## 2026-09-17 — Bubbly Liquid Glass tab switch

- Replaced the separate active-tab fills with one persistent Liquid Glass selection lens shared by Explore, Learn and Progress on desktop and mobile.
- Added a spring glide, elastic lens deformation and a short-lived trailing droplet inspired by Kube's lip-bezel switch, while keeping the effect event-driven and inexpensive when idle.
- Added reduced-motion, reduced-transparency, high-contrast and disabled-glass fallbacks, plus component coverage for the indicator's route position.

## 2026-09-17 — Stable refraction and instant tab routing

- Patched the LiquidGlass fragment shader so chromatic dispersion is confined to the curved dock bevel. Narrow colored card and mission-node edges no longer recombine with adjacent light surfaces into broad white bands inside the flat glass area.
- Routed Explore, Learn, Progress, the home mark and the XP summary through React state plus the History API, preserving accessible hash URLs while switching views immediately without browser hash-navigation repainting.

## 2026-09-17 — Mobile glass color preservation

- Retuned the mobile LiquidGlass shader to preserve narrow saturated course accents instead of spreading them into oversized white bands, while increasing chromatic aberration at the refracted edge.
- Made the pre-render fallback fully opaque so the mobile dock does not briefly sample scrolling content before the WebGL canvas is ready.
- Kept the dock fixed after the renderer initializes by removing a stale positioning rule left behind by the retired CSS overlay treatment.


## 2026-09-17 — Mobile interaction and bite-sized lesson polish

- Kept the mobile LiquidGlass navigation synchronized through rapid and inertial scrolling with frame-coalesced updates, visual-viewport tracking, and a guaranteed settled redraw.
- Enlarged simulation slider touch targets to 44 px, captured active pointers, and suppressed page panning until the gesture ends so parameter changes feel immediate on phones.
- Made every display equation a keyboard-accessible horizontal viewport so long KaTeX formulas remain complete without widening or clipping the mobile page.
- Replaced long main-path explanation cards with concise sentence-level bites capped at 32 words while preserving every original paragraph for Deep Dive, including scientific caveats and frontier-status wording.
- Added focused component, catalog, and Chromium mobile regressions for rapid glass refresh, slider gesture locking, equation containment, and concise-versus-detailed content.

## 2026-09-17 — Mobile liquid-glass navigation

- Replaced the CSS-only mobile navigation material with the requested `@ybouane/liquidglass` WebGL renderer, with high-refraction blur, chromatic edge detail, specular highlights, and an idle-friendly single-instance lifecycle.
- Linked the renderer to the existing Liquid Glass preference: it initializes only on compact screens, tears down immediately when disabled, and falls back to a solid navigation material for high-contrast, reduced-transparency, or unsupported browsers.
- Made the Appearance & Display panel fully opaque in every visual-effects mode so settings remain legible and visually separate from the lesson beneath.
- Added lifecycle, preference-propagation, and opaque-surface regression coverage. Included `patch-package`, which the published LiquidGlass package requires for clean installs.

## 2026-09-15 — README badge polish

- Added shields.io badges for CI, GitHub Pages, the main frontend stack, cloud sync, browser testing, supported Node.js version and released course count.

## 2026-09-15 — GitHub Pages browser-check fix

- Updated Explore, Progress and release browser checks to derive course counts from the published catalog. The new Electronics and Arduino/ESP32 paths raised the visible course count from 14 to 16, while older hard-coded expectations stopped CI and Pages before artifact upload.
- Clarified that the existing 3D simulation browser matrix covers the original physics models; the lightweight electronics workbenches have their own desktop and mobile journeys.

## 2026-09-15 — Electronics and Arduino/ESP32 starter paths

- Added an Electronics course after Electromagnetism with five authored missions on DC circuits, schematics, breadboards, resistors, LEDs, component roles and measurements, plus a checkpoint.
- Added a separate beginner Arduino/ESP32 course with five authored missions covering safe board wiring, Blink, button input, PWM and analog sensing, plus a checkpoint.
- Marked both entry-level electronics paths as Beginner in Explore.
- Added two pure SI classroom models and a lightweight interactive schematic, wiring and board workbench with live switch/button controls and readouts. The models explicitly limit themselves to ideal DC templates and predefined board behavior.
- Added reference calculations, curriculum validations and desktop/mobile browser journeys for the new paths.
- Captured both interactive workbench views for the README preview gallery.

## 2026-09-15 — Nested lesson card spacing fix

- Made math foundation check cards explicit vertical stacks so prompts, inputs, action rows, hints, and feedback no longer touch in quick-check and expanded math views.
- Widened remaining compact vertical stacks in course-path mission cards, progress theme controls, settings descriptions, backup helper text, and mobile daily-goal buttons.
- Added a regression assertion for foundation check card spacing and verified representative desktop, tablet, and mobile routes with a stricter spacing audit.

## 2026-09-15 — Mission step vertical spacing and row alignment

- Structured `#main-content > section > main > article > div` and `.assessment-body` into flex columns with consistent 20px vertical spacing on desktop and 16px on mobile.
- Separated assessment choices, input rows, action buttons, hints, and feedback messages so they no longer stick together or crowd vertically.
- Aligned action buttons (`.primary-button` and `.text-button` / `.hint-button`) with matching minimum heights, touch targets, and centered inline-flex geometry.
- Added responsive full-width vertical action stacking on mobile viewports for clean touch alignment.
- Added automated test suite verifying desktop and mobile layout rules for mission step containers.

## 2026-09-15 — Typography and simulation control polish

- Added locally bundled Space Grotesk, JetBrains Mono, and IBM Plex Mono fonts, with the official hosted sources as fallback.
- Added saved Modern Sans, Technical Mono, and Retro Computer type choices in Appearance; existing learner progress upgrades to Modern Sans automatically.
- Standardized icon-and-label control spacing, including lesson hints, segmented laboratory tabs, and other icon-bearing buttons.
- Added clear vertical separation between answer actions and feedback.
- Moved playback controls below the simulation and parameter grid, removed their canvas overlay, and fixed the time readout width so changing values do not shift the interface.
- Removed parameter-panel nested scrolling at desktop, tablet, and mobile widths.
## 2026-09-15 — First-load cloud progress prompt

- Added a prominent centered account prompt after the configured Supabase client finishes checking the initial session and finds no signed-in user.
- Reused the existing email registration, email/password sign-in, Google OAuth, GitHub OAuth, and local-to-cloud progress merge flow.
- Let visitors close the prompt immediately to explore locally, then show a clear reminder that the top-bar avatar reopens sign-in and cloud sync.
- Remembered that choice for the current tab session so route changes and reloads do not repeatedly interrupt a visitor who chose local progress.
- Kept unconfigured static builds local-first without presenting unavailable authentication actions, and automatically remove the prompt after successful authentication.
- Added accessible modal semantics, initial heading focus, contained keyboard tabbing, responsive sizing, and inline OAuth error reporting.
- Added configured-cloud browser coverage for the prompt itself and a shared dismissed-gate fixture for the existing learning and simulation journeys.

## 2026-09-15 - Responsive vertical spacing polish

- Added explicit vertical rhythm across mission steps, math explainers, simulation controls, course cards, account notices, and progress/settings sections so stacked UI elements no longer touch on desktop, tablet, or mobile layouts.
- Improved mobile lab headers and compact text groups with larger responsive gaps for clearer separation.

## 2026-09-14 — Opaque account panel

- Made the account and cloud-sync popover fully opaque with no backdrop blur, preventing the authentication form from blending into the toolbar behind it.

## 2026-09-14 — OAuth callback route recovery fix

- Recognized Supabase OAuth callback fragments before hash-route validation so successful Google and GitHub sign-ins no longer show the false red invalid-route message.
- Leave the authentication fragment available until the Supabase client processes the session and removes it.

## 2026-09-14 — Auth redirect reliability

- Added an explicit email confirmation redirect to the current static-host URL, matching the existing OAuth return behavior and preserving the GitHub Pages repository subpath.
- Documented the exact Supabase URL configuration and Google/GitHub OAuth callback needed for the public GitHub Pages deployment.

## 2026-09-14 — GitHub Pages cloud configuration fix

- Assigned the GitHub Pages build job to the `github-pages` environment so its Supabase variables are available when Vite creates the production bundle.
- Added an explicit workflow check that stops deployment when either required Supabase variable is missing instead of silently publishing a local-only build.
- Clarified that Vercel's Production, Preview, and Development scopes are unrelated to the single GitHub Pages environment.

## 2026-09-14 — OAuth single sign-on (Google and GitHub)

- Added `signInWithProvider` method to `CloudAccount` supporting Google and GitHub OAuth via `supabase.auth.signInWithOAuth`.
- Added "or continue with" divider and branded SSO buttons (inline Google multi-color logo, GitHub mark) to the account popover.
- SSO buttons share the disabled state with the email form during authentication and inherit the existing session hydration and progress merge flow.
- Added CSS for `.account-sso-divider`, `.account-sso-buttons`, and `.account-sso-button` matching the glassmorphism design system.
- Exported `OAuthProvider` type from `useCloudAccount.ts` for downstream consumers.

## 2026-09-14 — Supabase accounts and durable progress sync

- Added optional email registration, sign-in, sign-out, sync status, and manual synchronization controls without removing anonymous localStorage use.
- Added a conflict-aware progress merge that preserves completed missions, best stars, badges, XP, math work, attempts, and the newest settings across devices.
- Added a protected `user_progress` Supabase migration with per-user row-level security and no anonymous database access.
- Added environment-based Supabase configuration and documented GitHub Pages, Vercel production, and branch-preview deployment without Docker.
- Added focused cloud merge tests; unconfigured builds continue to operate as the original local-only app.

## 2026-09-14 — Cinematic simulations and continuous autoplay

- Added a deterministic, model-derived 3D quantum probability cloud whose bead density follows the existing |ψ|² bins while retaining all exact quantitative bars and readouts.
- Animated bounded instanced particle systems for thermal, atomic, nuclear, condensed-matter, astrophysics, and cosmology displays, with labels that distinguish illustrative motion from calculated quantities.
- Moved gravity, astrophysics, and cosmology into a dedicated deep-space environment with star fields and orbital framing instead of the generic laboratory platform.
- Made simulations start automatically, loop at the model duration, and continue after parameter changes; explicit Pause remains sticky and reduced-motion preferences still begin paused.
- Added focused unit and browser coverage for autoplay, looping, parameter response, pause behavior, and reduced motion; updated the complete all-course WebGL matrix for autoplay-first operation.
- Revalidated all 24 representative simulation scenarios below 100 draw calls and 100,000 triangles, including mobile screenshots and a 320px high-DPI device.

## [0.3.0] — 2026-09-14: Apple Design UI/UX Overhaul (Precision Scientific Studio)

Comprehensive overhaul of the Physics Teacher Interactive interface using the Apple Design Skill and Human Interface Guidelines (HIG) to create an authentic "Precision Scientific Studio" learning experience.

### 1. Authentic Liquid Glass Layer Discipline & WCAG AA Contrast Tokens
- Calibrated semantic design tokens across all 5 themes (`dark`, `light`, `eye-comfort`, `ocean`, `high-contrast`) guaranteeing WCAG AA contrast compliance (≥ 4.5:1 for normal body text, ≥ 3.0:1 for large/bold text, ≥ 7.0:1 for primary headings).
- Defined Apple SF Pro typography hierarchy, continuous squircle radii tokens (`--radius-sm: 8px`, `--radius-md: 12px`, `--radius-lg: 18px`, `--radius-xl: 22px`, `--radius-full: 9999px`), and tabular figure alignment token (`--font-tabular: tabular-nums`).
- Strictly enforced Apple HIG Liquid Glass layer discipline: restricted `backdrop-filter: blur(...)` and specular top hairline highlights exclusively to floating functional controls (`.adventure-topbar`, `.mobile-tab-bar`, `.playback-hud`, `.appearance-popover`) and utility classes (`.liquid-glass-surface`, `.liquid-glass-hud`).
- Kept all content-layer containers, cards, and text surfaces (`.course-card`, `.mission-player`, `.setting-card`, `.lab-content`) on crisp standard opaque materials to eliminate readability issues and visual mud.
- Provided high-contrast and reduced-transparency fallbacks (`prefers-reduced-transparency: reduce`, `[data-theme="high-contrast"]`) disabling glass blur and rendering solid opaque backgrounds with clear 1px borders.

### 2. macOS Desktop Segmented Navigation & iOS Mobile Floating Liquid Glass Tab Bar
- Rebuilt `<AppShell />` header with a macOS-style segmented toolbar (`.macos-segmented-nav`) featuring Explore, Learn, and Progress segments with active indicators and 28px/44px minimum interactive targets.
- Created sticky 56px Liquid Glass topbar with specular edge highlights and integrated telemetry stats pill displaying live XP and streak counters.
- Implemented `<MobileTabBar />` floating Liquid Glass navigation dock anchored above safe area (`bottom: calc(12px + env(safe-area-inset-bottom))`) on mobile viewports (≤ 768px).
- Embedded primary navigation items for Explore (`Compass`), Learn (`Map`), and Progress (`ChartNoAxesColumn`) with active page indicators, tactile press feedback (`:active { transform: scale(0.95); }`), and 48px × 48px touch targets exceeding WCAG minimums.

### 3. In-Place Accessible AppearancePopover Dialog
- Created `<AppearancePopover />` floating Liquid Glass popover replacing disruptive page jumps with an in-place modal dialog accessible anywhere in the application.
- Provided rapid theme selection pills (Dark, Light, Eye-Comfort, Ocean, High-Contrast), visual effects toggles for Liquid Glass and Reduced Motion, and quick link to full settings.
- Fully accessible keyboard navigation: Escape key dismissal, outside pointerdown dismissal, explicit dialog ARIA roles (`role="dialog"`, `aria-label="Appearance settings"`, `aria-modal="true"`), and focus restoration.

### 4. Precision Physics Lab Housing, Floating Playback HUD, Knurled Sliders & Tabular Telemetry
- Enclosed simulation viewports in a precision dark anodized aluminum instrument housing (`.lab-canvas-frame`, `#0b121e`, 18px squircle radii, subtle inner depth).
- Floated playback controls as a centered Liquid Glass HUD pill (`.playback-hud`) over the bottom canvas with primary filled Play/Pause button (44px min touch target), Step button (1/60s advance), Reset button, segmented speed switcher (`0.5×`, `1×`, `2×`), and monospace tabular timecode display (`tabular-nums`).
- Designed tactile knurled hardware sliders (`.hardware-slider`) with multi-stripe knurled thumb grips, live value unit pills (`.live-unit-badge`), and keyboard focus rings.
- Styled telemetry meters as Apple Watch modular readout tiles with hairline dividers, colored status glow dots, and tabular figures (`font-variant-numeric: tabular-nums`) to prevent layout jitter during 60 FPS animation.
- Preserved graceful degradation in `<SimulationBoundary />`: automatically falls back to accessible numerical observations, graph plots, and data tables whenever WebGL is unavailable.

### 5. Spotlight Course Search, Squircle Cards & Connected Milestone Pathway
- Overhauled Explore Page with Spotlight-style course search (search icon, single-click clear button, keyboard shortcut hint with `Cmd/Ctrl + K` and `/` focus listeners).
- Styled Explore topic filters as Apple segmented pill controls with `aria-pressed` state indicators.
- Upgraded course cards to 20px squircle geometry (`border-radius: 20px`), subtle elevation lift (`translateY(-2px)`), category badges, and tabular completion percentages.
- Enhanced Continue Learning Hero card with subtle depth gradient, current course details, category badge, and prominent action button.
- Overhauled Course Path header with macOS-style back button (`‹ Back to Explore` with hover highlight), course title, time remaining, and circular SVG mastery ring gauge.
- Built vertical milestone pathway with solid connecting rail (`.path-rail`), mint completed checkmarks, glowing active Play nodes, and amber checkpoint trophy nodes (`<Trophy />`).

### 6. 7-Segment Mission Journey Bar & iOS Settings Grouped Inset Layout
- Overhauled Mission Player with an Apple-style 7-segment journey progress bar (`.mission-journey-bar`) tracking Observe, Predict, Simulate, Explain, Math, Check, and Recap stages with active/completed indicators.
- Redesigned assessment options with tactile squircle card containers (`.answer-option`, `.option-card`), active borders, elevation on hover, and accessible circular radio indicators.
- Added smooth inline feedback transitions featuring mint highlights for correct answers and coral retry hints without disruptive alert dialogs.
- Polished KaTeX formula presentation with continuous squircles and smooth foundation mode disclosure.
- Upgraded Recap step with Apple Activity-style rewards summary, gold star sparkle badges, XP awards pill, and prominent continue CTA.
- Overhauled Progress page with iOS Settings-style grouped inset cards (`border-radius: 18px`), Apple segmented daily goal control (1, 3, 5 missions), theme swatches, native-styled toggle switches for Liquid Glass and Reduced Motion, and drag-and-drop progress JSON backup/restore.

### 7. Verification & End-to-End Test Suite
- Comprehensive verification suite passing with 0 errors across TypeScript typecheck (`tsc --noEmit`), ESLint (`eslint .`), full Vitest suite (23 test files, 281 unit/integration tests), and Vite production build.
- Full Playwright E2E browser test suite passing across all 49 tests spanning desktop (1440×900), tablet (768×1024), and mobile phone (320×700, 390×844) viewports.


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
## 2026-09-14 — 3D simulation README gallery

- Added captured measurement, quantum, and cosmology simulation-stage screenshots to the README.
