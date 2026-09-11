# Changelog

## Unreleased

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
