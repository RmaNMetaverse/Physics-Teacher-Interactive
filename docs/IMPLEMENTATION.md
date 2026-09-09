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
- Scaffold: complete.
- Curriculum: complete — 24 lessons and 17 prerequisite math tutorials.
- Models: complete — eight deterministic SI simulation families and trajectory sampling.
- Interface: complete — responsive 3D laboratory, graphs, lessons, math, assessments, curriculum, and local progress.
- Verification: complete locally — type checking, lint, 73 unit/content/scientific tests, eight browser journeys, and production build.
- Deployment: GitHub Actions workflow committed; repository Pages source must be set to GitHub Actions before the first deployment can publish.

Ruling: use the newly created dedicated project directory in place; no pre-existing checkout or changes need isolation. The approved static Vite/GitHub Pages architecture takes precedence over a hosted Sites scaffold.
