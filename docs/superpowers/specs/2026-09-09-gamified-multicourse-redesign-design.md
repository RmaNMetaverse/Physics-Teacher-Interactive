# Gamified multi-course redesign

**Status:** Approved for implementation
**Date:** 2026-09-09
**Product:** Physics Teacher Interactive

## Problem

The first release contains deep explanations, mathematics, simulations, assessments, and sources, but its laboratory shell exposes too many controls and sections at once. Learners must understand the interface before they can learn physics. Course discovery is also hidden behind the foundations sequence, so a curious learner cannot begin with quantum physics, relativity, or another motivating subject.

## Product direction

Physics Teacher Interactive becomes a balanced science adventure built around one loop:

1. choose any course;
2. follow a clear visual path;
3. complete one focused interactive mission;
4. earn XP, mastery, a streak, and course badges.
5. continue immediately or open the optional deep dive.

The design draws on the clarity of visual learning paths and short practice loops without copying another product's branding, illustrations, copy, or layout. Rewards support learning without blocking progress. There are no punitive lives, artificial wait timers, or paywalls.

## Experience principles

- **One decision per screen.** Home lets the learner choose a course or resume the next mission. A mission presents one step at a time.
- **Every course is open.** Recommendations show useful prerequisites, but no course is locked. Quantum physics can be selected on the first visit.
- **Intuition before notation.** Learners predict and manipulate a model before receiving the mathematical explanation.
- **Depth stays close.** Every mission includes optional derivations, prerequisite math, worked examples, sources, and limitations.
- **Reward mastery.** XP, stars, badges, streaks, and course completion celebrate real actions and correct understanding.
- **Scientific honesty.** Content distinguishes established results, active research, interpretations, and speculative proposals.
- **Private by default.** This release stores progress locally and supports validated export and import. Accounts and cloud storage remain future infrastructure.

## Information architecture

The persistent navigation has three destinations:

- **Explore:** course gallery, search, topic filters, and all available starter paths.
- **Learn:** the currently selected course path and one prominent continue action.
- **Progress:** XP, streak, mastery, badges, completed courses, preferences, and backup controls.

Desktop uses a compact top bar and centered content. Mobile uses a three-item bottom navigation. The existing dense course sidebar and lesson-section tabs are removed.

Hash routes preserve static hosting:

- `#/` and `#/explore`
- `#/course/:courseId`
- `#/mission/:courseId/:missionId`
- `#/progress`

Unknown, retired, or malformed routes recover to Explore with a clear notice.

## Core screens

### Explore

Explore opens on the first visit. It contains:

- a greeting and compact XP/streak display;
- one continue card when progress exists;
- a grid of course cards with level, starter mission count, estimated time, progress, and scientific scope;
- filters for Foundations, Classical, Modern, Space, and Frontier;
- a recommendation labeled as guidance rather than a prerequisite gate.

Quantum Physics, Relativity, Astrophysics, and every other released starter course are visible and selectable immediately.

### Course path

Each course has a vertical visual path. Nodes represent short missions, interactive labs, and unit checkpoints. Completed nodes show mastery, the next recommended node receives the strongest emphasis, and later nodes remain selectable.

The header contains only course title, progress, estimated remaining time, and a route back to Explore. A course overview and references live in a lightweight details sheet instead of occupying the primary path.

### Mission player

A mission is a five-to-eight-minute sequence with a progress bar and one interaction at a time. Available step types are:

- story or observation;
- prediction;
- simulation manipulation;
- just-in-time mathematics;
- worked example;
- concept or calculation check;
- explanation in the learner's own reasoning;
- recap and reward.

The standard flow is **observe → predict → manipulate → explain → solve → recap**. Courses can omit a step only when it adds no learning value.

The simulation occupies the center of the relevant step. Essential controls are shown beside it; advanced parameters stay behind an “Explore further” disclosure. Graphs and accessible data tables remain available from the simulation.

The optional deep dive unfolds below the completed step and contains derivations, richer explanation, prerequisite mathematics, model assumptions, sources, and further experiments. Learners can preserve a quick rhythm without losing access to full treatment.

### Progress

Progress presents:

- total XP and current level;
- current and longest learning streak;
- a configurable daily goal measured in completed mission steps;
- course mastery rings;
- earned badges and checkpoint stars;
- recent activity;
- local backup import/export and reset;
- theme, sound, motion, and celebration preferences.

## Initial course catalog

The redesign releases the complete existing Foundations course and thirteen new playable starter courses. Each new starter has five missions, a checkpoint, prerequisite math, sources, limitations, and at least one meaningful interactive simulation.

1. Physics Foundations
2. Classical Mechanics
3. Waves and Sound
4. Thermodynamics
5. Electromagnetism
6. Optics
7. Relativity
8. Quantum Physics
9. Atomic and Molecular Physics
10. Nuclear Physics
11. Particle Physics
12. Condensed Matter
13. Astrophysics
14. Cosmology and Frontiers

Physics Foundations retains all 24 existing lesson topics. Each topic becomes a mission with three to seven short steps. Existing explanations, assessments, equations, math tutorials, simulations, sources, and limitations are preserved and reorganized.

Starter courses are labeled **Starter path** and do not imply full subject coverage. The catalog and course overview identify the content review date. Frontier missions label established observations, well-supported theory, open questions, interpretations, and speculative proposals separately.

## Reusable mission engine

Course and mission content remain typed data, separate from React and scientific calculations.

`CourseDefinition` owns catalog metadata, course grouping, scope label, color theme, prerequisites as recommendations, mission order, sources, and review date.

`MissionDefinition` owns objectives, estimated minutes, XP, steps, math requirements, simulation reference, checkpoint rules, scientific status, sources, and limitations.

`MissionStep` is a discriminated union. Each step renderer receives the step definition, current answer, mission state, and narrow callbacks. Renderers do not mutate storage directly.

The mission engine is a deterministic state machine. It controls current step, answer attempts, feedback, completion, earned XP, stars, and navigation. A learner can revisit every step. XP for a mission is awarded once; retries improve mastery without duplicating XP.

Scientific models remain in `src/physics` and accept SI parameters without React dependencies. Simulations reference model IDs instead of embedding calculation code in content or components.

## Gamification rules

- Completing a normal mission awards its declared XP once.
- A first-attempt correct check earns three stars; a correct retry earns two; completing with guided help earns one.
- Course badges require its checkpoint, not raw activity time.
- A streak advances when the learner completes at least one mission step on a new local calendar day.
- Missing a day leaves content and mastery untouched. The interface encourages a return without shame.
- Celebrations use short motion and optional sound. Reduced-motion and sound settings override them.
- Daily goals are adjustable and never block course access.
- All rewards have accessible text; color and animation are never the only signal.

## Progress data

Local progress moves from version 1 to version 2:

- selected course and next recommended mission;
- completed mission IDs and per-mission stars;
- step answers and attempts;
- completed math steps;
- awarded-XP ledger;
- total XP and level;
- streak dates and daily goal;
- badges;
- theme, sound, reduced motion, and celebration settings;
- canonical save timestamp.

Migration maps existing lesson completions and answers into Foundations missions, preserves theme and math completion, and recomputes derived counts. Unknown course, mission, step, assessment, badge, or ledger IDs are discarded. Invalid records fall back safely to a fresh profile. Import validates the same catalog-aware invariants as browser startup.

## Visual system

The selected **Balanced Science Adventure** direction uses:

- warm off-white surfaces with deep navy text;
- violet as the journey color, mint for mastery, gold for rewards, and coral for feedback;
- generous rounded cards and path nodes;
- friendly geometric iconography and original CSS/SVG scientific illustrations;
- strong hierarchy and calm reading typography;
- celebratory accents around real milestones rather than constant visual noise.

Dark mode uses the same semantic hierarchy. Content remains readable at 320 CSS pixels without horizontal page overflow.

## Failure handling and accessibility

If WebGL or a 3D scene fails, the mission keeps its controls, numerical observations, graph, data table, and explanation. A clear message describes the reduced visual mode.

Every interaction supports keyboard operation and visible focus. Mission progress is announced without stealing focus. Equations retain MathML through KaTeX. Simulations have textual descriptions and table alternatives. Dialogs trap and restore focus. Motion follows `prefers-reduced-motion` and the in-app preference. Touch targets are at least 44 CSS pixels where space permits.

Local-storage, import, and export failures produce plain recovery messages without losing the current in-memory session.

## Component boundaries

- `AppRouter`: hash route parsing and recovery.
- `AppShell`: compact navigation and global status.
- `ExplorePage`: course discovery and continue card.
- `CoursePathPage`: visual mission path.
- `MissionPlayer`: mission state machine and step transitions.
- `MissionStepRenderer`: delegates to focused step components.
- `SimulationStep`: shared lab controls and accessible fallbacks.
- `DeepDive`: derivations, math, sources, and limitations.
- `ProgressPage`: mastery, rewards, settings, and backup.
- `progressV2`: migration, validation, persistence, and reward ledger.
- `courseCatalog`: typed, acyclic course and mission registry.

Large course content files are split by course. Shared UI components do not import course-specific content.

## Verification

Meaningful tests cover:

- course catalog IDs, starter-path completeness, source presence, scientific labels, and acyclic recommendations;
- every required math reference and simulation reference;
- mission state transitions, retries, one-time XP, stars, badges, daily goals, and streak day boundaries;
- version-1 migration and catalog-aware version-2 validation;
- new scientific calculations against independent analytic cases and conservation laws;
- reduced simulation fallback;
- Explore, open Quantum first, path selection, complete mission, revisit, progress, import/export, unknown route recovery, keyboard use, reduced motion, and 320-pixel layout;
- production build from root and the GitHub Pages project subpath.

`npm run check` and the browser suite remain required in CI and the Pages workflow.

## Deployment and future accounts

The application remains a credential-free static Vite build with relative assets and hash routing for GitHub Pages. The redesign does not add registration, single sign-on, cloud saves, payments, analytics, or a backend.

After implementation, project guidance will describe practical hosted architectures, identity providers, databases, deployment platforms, operational responsibilities, and current cost ranges for adding accounts and per-user synchronization. That guidance is advisory only and does not add infrastructure to this release.

## Acceptance criteria

- A new learner can select Quantum Physics from the first screen and begin a real interactive starter mission.
- The primary journey never requires choosing among lesson-section tabs.
- A learner can reach the next meaningful interaction with one prominent action per screen.
- Every new starter course has five playable missions, a checkpoint, required math, sources, limitations, and a working simulation; Foundations retains its 24-topic path.
- Foundations preserves the complete existing body of content through the mission structure.
- XP cannot be duplicated by revisiting or refreshing.
- Progress survives refresh, migrates from version 1, and rejects unknown IDs.
- The interface passes keyboard, reduced-motion, and 320-pixel browser checks.
- All checks, production build, and GitHub Pages subpath verification pass before release.
