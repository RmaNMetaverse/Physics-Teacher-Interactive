# Physics Teacher Interactive: approved implementation

Build a static English React/TypeScript/Vite application with Three.js experiments, authored guidance, KaTeX equations, accessible mathematics, and local progress. Dark scientific laboratory with light reading theme. Desktop, tablet and phone support. User approved 2026-09-09.

## Deliverables
1. Repository scaffold and CI/deployment setup.
2. 24 substantive lessons: measurement/units/uncertainty; coordinates/components/vector addition; velocity/acceleration/projectiles; inertia/net force/friction; work/energy/conservation; momentum/impulse/collisions; circular motion/gravitation/orbits; Hooke/spring/pendulum.
3. Eight independently tested experiment families. Deterministic models, units, bounded controls, reset, pause, step, speed, observations, charts, graph/table fallback.
4. Mathematics tutorials: arithmetic, signed numbers, fractions, decimals, ratios, scientific notation, powers, algebra, coordinates, functions, geometry, trigonometry, vectors, rates, accumulation, sine, uncertainty. Each with interactive visualization or meaningful stepwise exercise and assessment.
5. Integrated learning interface, curriculum, searchable lessons, math library, sandbox, readiness guidance, three assessments per lesson, local progress import/export.
6. Responsive and accessible verification, meaningful scientific tests, browser regression tests, root/subpath builds, documentation, validated commits and pushes.

## Later releases
Extended classical physics (rotation, fluids, waves, thermal, electricity, optics); modern physics (relativity, quantum, atomic/nuclear/particle, condensed matter, astrophysics/cosmology); selected graduate treatments and sourced frontier surveys. Mathematics expands alongside each phase. Future courses remain visibly planned and do not count as released.

## Scientific policy
Editorial cutoff 2026-09-09 is a target scope, not a claim of exhaustive research coverage. Each released lesson records consulted sources and review date. Quantitative simulations show approximation limits. Reference tests use independent analytical cases and conservation laws.

## Interface contracts
See src/types.ts for LessonDefinition, MathTutorialDefinition, SimulationDefinition, LearnerProgress. Lesson IDs are stable kebab-case; family identifiers are measurement, vectors, motion, forces, energy, collisions, gravity, oscillations. Local progress version starts at 1.

## Execution ledger
- **Release 0.1.0 (Foundations Course)**: Complete — 24 foundations lessons, 8 simulation families, 17 math tutorials, responsive laboratory shell, and version-1 local progress.
- **Release 0.2.0 (Balanced Science Adventure Redesign)**: Complete:
  - Catalog: 14 open courses, 89 normal missions, and 13 checkpoints with closed acyclic prerequisite graph and explicit science-status labels.
  - Physics Engine: 20 pure SI models in central registry (`src/physics/catalog.ts`) with analytical reference tests and finite boundary behavior.
  - Layered Mathematics: 17 tutorials adapted into two-layer representations (Quick formula mode + expandable Foundation mode with interactive visuals and checks).
  - Mission Player: 7-step guided journey (Observe, Predict, Simulate, Explain, Layered Math, Check, Recap) with tab-free Deep Dive, 1–3 star scoring, and one-time XP awards.
  - Simulation Resilience: `SimulationBoundary` providing automatic Reduced Visual Mode fallback (active physics loop, controls, SVG plot, live measurements table) upon WebGL failure.
  - Progress v2: Level derivation, daily streaks, customizable daily goals, course mastery rings, checkpoint badge shelf, validated JSON import/export, and automatic version-1 migration.
  - Visual System: Modular CSS tokens, WCAG AA button contrast (`--accent-contrast`), visible focus indicators, and strict reduced-motion clamping to 0ms.
  - Legacy Cleanup: Removed obsolete UI components (`MathModal`, `AssessmentCard`), cleansed legacy stylesheet rules, and verified zero unused dependencies.
  - Verification: 227 unit/integration tests passing in Vitest, 37 Playwright end-to-end browser journeys passing in Chromium across 3 viewports, zero production audit vulnerabilities, and static GitHub Pages production bundle verified.

Ruling: use the newly created dedicated project directory in place; no pre-existing checkout or changes need isolation. The approved static Vite/GitHub Pages architecture takes precedence over a hosted Sites scaffold.
