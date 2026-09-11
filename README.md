# Physics Teacher Interactive

Physics Teacher Interactive is a free, static, open-source physics adventure for learning physics by predicting, experimenting, calculating, and explaining. It combines 14 open courses, 89 interactive missions, 13 checkpoints, 20 deterministic SI physics models, 17 layered mathematics tutorials, accessible equations, and client-only local progress stored securely in the learner's browser.

## Multi-Course Architecture

The platform provides open access to 14 structured physics courses:

- **Physics Foundations (Complete Course)**: A complete 24-mission foundations course covering measurement, vector geometry, kinematics, Newton's laws of motion, work and mechanical energy, linear momentum and collisions, gravitation and orbital mechanics, and harmonic oscillations.
- **Thirteen Starter Paths**: Five-mission starter courses with culminating four-step checkpoints across Classical Mechanics, Waves and Sound, Thermodynamics, Electromagnetism, Optics, Relativity, Quantum Physics, Atomic and Molecular, Nuclear Physics, Particle Physics, Condensed Matter, Astrophysics, and Cosmology and Frontiers. Deeper treatments beyond these bounded starter paths are planned future extensions.

All courses are immediately accessible from the **Explore** gallery with search and category filtering; prerequisites provide learning guidance without hard completion gates.

## Balanced Science Adventure

- **Focused Mission Player**: Bite-sized missions structured into consistent active learning steps: *Observe*, *Predict*, *Simulate*, *Explain*, *Layered Math*, *Check*, and *Recap*.
- **Layered Mathematics**: Every equation offers a concise *Quick Mode* for experienced learners (compact formula, symbol definitions, immediate check) and an expandable *Foundation Mode* for zero-prior-knowledge mastery (core concepts, plain-English explanations, interactive visual manipulation, sequential worked steps, and prerequisite return navigation).
- **Explicit Scientific Status**: Every mission clearly labels its scientific consensus tier:
  - `established`: Reproducible empirical consensus (e.g., Newtonian mechanics, Maxwellian electromagnetism, standard quantum mechanics).
  - `active-research`: Areas with active experimental and theoretical investigation (e.g., neutrino masses, dark matter, dark energy).
  - `interpretation`: Theoretical interpretative frameworks (e.g., Copenhagen, Many-Worlds).
  - `speculative`: Theoretical proposals at physics frontiers (e.g., string theory, loop quantum gravity, multiverse).
- **Deterministic SI Simulations & Resilient Fallback**: 20 pure SI physics calculation models independent of React and Three.js. If WebGL context loss or hardware rendering failures occur, the application seamlessly transitions to **Reduced Visual Mode**—keeping all physics controls, parameter sliders, SVG plots, accessible measurement data tables, and model descriptions fully functional.
- **Local Progress & Rewards (Version 2)**: Level progression, daily streaks, customizable daily goals (1, 3, 5 missions/day), course mastery rings, and checkpoint achievement badges. Mission XP is awarded once; replaying missions can improve star ratings without XP duplication. Supports automatic version-1 migration, JSON backup export/import, and progress reset while preserving user preferences.
- **Privacy & Static Deployment**: No accounts, passwords, cookies, cloud backends, analytics, or paid services. The application runs entirely client-side, deploys statically to GitHub Pages, and uses hash routing (`base: './'`) for robust direct linking and refresh-safe subpath hosting.

## Run Locally

Requires Node.js 22.20 or newer:

```sh
npm ci
npm run dev
```

Run comprehensive quality checks:

```sh
npm run check          # Typecheck, lint, unit tests, and Vite production build
npm run test:e2e        # Playwright end-to-end browser journeys
```

## Project Guides

- [Architecture](docs/ARCHITECTURE.md) — System components, boundaries, state machine, and data flow
- [Curriculum](docs/CURRICULUM.md) — Complete 14-course syllabus, starter paths, and math roadmap
- [Authoring Guide](docs/AUTHORING.md) — Authoring courses, missions, layered math, and physics models
- [Scientific Validation](docs/SCIENTIFIC_VALIDATION.md) — Dimensional consistency, reference cases, and model limits
- [Sources and Citations](docs/SOURCES.md) — Open educational citations, reference maps, and boundary limits
- [Deployment](docs/DEPLOYMENT.md) — GitHub Pages static deployment and subpath verification
- [Contributing](CONTRIBUTING.md) — Development guidelines and contribution policies

## License and Source Policy

Project licensing is recorded in the repository license. Source citations support scientific claims and contextual study; course explanations, numerical problems, interactive simulations, and learning assets are original works.
