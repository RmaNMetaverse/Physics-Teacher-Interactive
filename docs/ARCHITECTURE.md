# Architecture

Physics Teacher Interactive is a client-only React 19 and TypeScript application built with Vite. A production build produces a static `dist/` bundle optimized for zero-configuration deployment to GitHub Pages at either a custom domain root or repository subpath. Hash-based routing (`#/explore`, `#/course/:id`, `#/mission/:courseId/:missionId`, `#/progress`) ensures that all route transitions, bookmarks, and reloads work without server-side rewrite rules.

## Core Boundaries

The application is structured into decoupled, strictly typed subsystems:

- **Learning Catalog (`src/learning/`)**:
  - `catalog.ts`: Immutable registry validating the 16 open courses, 99 normal missions, and 15 checkpoints. Enforces unique kebab-case IDs, closed acyclic prerequisite graphs, required instructional content, and valid KaTeX equations.
  - `mission-engine.ts`: Pure, deterministic state machine controlling mission step sequencing (Observe, Predict, Simulate, Explain, Layered Math, Check, Recap), assessment checking, hints, simulation tracking, restore state, and 1–3 star mastery scoring.
  - `math-layers.ts`: Converts mathematical tutorials into two-layer representations (Quick formula mode and expandable Foundation mode with interactive visual manipulatives).
- **Physics Engine (`src/physics/`)**:
  - Contains 22 deterministic, analytical SI physics models (`src/physics/models/`) and a central registry (`src/physics/catalog.ts`).
  - Independent of React, Three.js, DOM APIs, and rendering code. Input parameters and output kinematics/observations use SI units exclusively.
- **Simulation Laboratory & Resilient Fallback (`src/components/simulation/`)**:
  - `Lab.tsx`: Shared experiment viewport with bounded controls (maximum 3 primary controls before disclosure), play/pause, time scrubbing, and telemetry readouts.
  - `ElectronicsWorkbench.tsx`: Lightweight SVG circuit schematic, breadboard-style connection view, and guided board visualizer driven only by pure SI models; it avoids WebGL overhead on circuit lessons.
  - `SimulationBoundary.tsx`: Resilient error boundary wrapping 3D rendering. When WebGL context loss or hardware rendering errors occur, it activates **Reduced Visual Mode**—preserving the active physics loop, control sliders, SVG parameter plots, and accessible measurement data tables.
- **Progress & Rewards (Version 2) (`src/progress/`)**:
  - `progress.ts` & `types.ts`: Manages level calculations (`Math.floor(xp / 500) + 1`), local-day streak tracking, daily mission goals (1, 3, 5 missions/day), course mastery statistics, and checkpoint badges.
  - Automatic migration seamlessly converts version-1 local storage records into version-2 schema, discarding obsolete or tampered identifiers.
  - Validated JSON export and import with strict schema checking.
- **Application Shell & Navigation (`src/app/`, `src/pages/`)**:
  - `App.tsx` and `router.ts`: Router parses hash fragments, validates course and mission IDs against the catalog, and recovers gracefully to `#/explore` with an accessible status announcement if an invalid hash is entered.
  - `AppShell.tsx`: Three-destination navigation (`Explore`, `Learn` dynamically targeted to the active course path, and `Progress`), with a mobile persistent bottom bar, accessible skip links, and dark/light theme switching.
- **Visual Design System (`src/styles/`)**:
  - Semantic CSS tokens (`tokens.css`) defining surface elevations, high-contrast text, journey violet accents, mastery mint, reward gold, and feedback coral.
  - High-contrast `--accent-contrast` token (`#ffffff` in light mode, `#0d1117` in dark mode) ensuring WCAG AA compliance across buttons.
  - Respects system `prefers-reduced-motion` and user `data-reduced-motion="true"` settings, clamping celebratory animation durations to 0ms.

## Main Data Flows

```text
1. Navigation:
   URL Hash -> router.parseHash -> AppRoute -> Course/Mission from courseCatalog -> Page View

2. Mission Player Execution:
   MissionDefinition -> mission-engine (session/reducer) -> Step View
   User Action (Predict / Simulate / Math / Check) -> dispatch(action) -> updated session
   Recap Completion -> saveProgressV2 -> localStorage (physics-teacher-interactive-progress-v2)

3. Physics Evaluation:
   Parameters (preset + sliders) -> evaluateModel(modelId, parameters, t) -> SimulationState
   SimulationState -> Three.js Scene (3D) OR GraphView / DataTable (Reduced Visual Mode)

4. Progress Migration & Backup:
   v1 localStorage -> migrateV1ToV2 -> catalog validation -> v2 Progress
   User Export -> serializeProgressV2 -> physics-teacher-progress.json download
```

## Static Deployment and Privacy Guarantees

- **No Credentials or Cloud Services**: No user accounts, passwords, analytics trackers, external APIs, or remote databases.
- **GitHub Pages Subpath Portability**: Vite `base: './'` coupled with hash routing guarantees full compatibility with GitHub Pages deployments under subpaths like `/Physics-Teacher-Interactive/`.
- **Offline Resilience**: All computational models, KaTeX fonts, icons, and audio synthesis run locally in the browser.
