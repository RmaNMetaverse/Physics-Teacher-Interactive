# Changelog

## Unreleased

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