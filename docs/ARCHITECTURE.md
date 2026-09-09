# Architecture

Physics Teacher Interactive is a client-only React 19 and TypeScript application built by Vite. A production build is a static `dist/` directory suitable for GitHub Pages at a domain root or repository subpath. Hash routes keep direct navigation and reloads independent of server rewrite rules.

## Boundaries

- `src/content/` owns lesson and mathematics definitions. Definitions conform to the interfaces in `src/types.ts`; IDs are stable kebab-case data keys.
- `src/physics/` owns deterministic SI calculation models. These modules do not import React, Three.js, browser globals, or rendering code.
- `src/lib/assessment.ts` converts assessment input into a correct/incorrect result. Concept answers use zero-based option indices. Quantitative answers use strict finite numbers, optional exact units, and absolute tolerances.
- `src/lib/progress.ts` owns the version-1 local progress schema, validation, and resilient `localStorage` access.
- React components own navigation and interaction. Three.js renders model output but does not calculate the underlying physics.
- Charts and tables consume the same observation values. The table is a semantic fallback, not a second model.

The main data flow is:

```text
lesson preset + bounded controls -> pure SI model -> simulation state
simulation state -> Three.js scene + observations -> chart + table
assessment input -> pure scoring -> progress -> localStorage/export
```

## Scientific model contract

Each `SimulationDefinition` exposes bounded parameter definitions and a pure `evaluate(parameters, time)` function. Inputs and observations use the documented SI units. Equal inputs produce equal outputs. Pause, step, reset, and playback speed change the sampled time or controls; they do not introduce a second physics implementation.

Models state their domain. Collisions, projectile motion, springs, pendulums, and orbits use classroom approximations described by each lesson. The renderer may scale positions for visibility, but displayed numerical observations come from SI model values.

## Curriculum integrity

Lessons and math tutorials form one directed prerequisite graph. Validation tests require unique IDs, known prerequisites, no cycles, and an available math tutorial for every lesson `math` reference. A course is released only when all its nodes pass these checks.

## Progress and privacy

`LearnerProgress.version` starts at `1`. Imports require every version-1 field, reject extra root fields, invalid values, unsafe answer IDs, and lesson/math IDs outside the current catalog. Stored progress is local to the browser origin. Storage exceptions degrade to an in-memory empty record and are surfaced through the `persistent` result; the application remains usable.

There is no backend, analytics service, account system, or credential flow in the first release.

## Portability and accessibility

Vite uses a relative asset base. Internal navigation uses `#/...`, so both `/` and `/Physics-Teacher-Interactive/` hosting paths work without redirects. All essential interactions use HTML controls and keyboard-operable dialogs. KaTeX presentation is paired with readable equation text. Dynamic visualizations expose observations as text and a table.
