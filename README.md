# Physics Teacher Interactive

Physics Teacher Interactive is a free, static foundations course for learning physics by predicting, experimenting, calculating, and explaining. It combines 24 authored lessons, prerequisite mathematics, deterministic Three.js experiments, accessible equations, and progress stored only in the learner's browser.

## First release

The released course covers eight foundations families:

1. measurement, units, and uncertainty;
2. coordinates, components, and vector addition;
3. velocity, acceleration, and projectiles;
4. inertia, net force, and friction;
5. work, energy, and conservation;
6. momentum, impulse, and collisions;
7. circular motion, gravitation, and orbits;
8. Hooke's law, springs, and pendulums.

Each family has an independently tested interactive experiment. Every lesson has objectives, prerequisites, original explanations, an equation with accessible text, a worked example, concept/calculation/experiment assessments, sources, and explicit model limitations. Charts have a table fallback, simulation controls are bounded, and the interface supports keyboard use and desktop, tablet, and phone layouts.

The math library covers arithmetic, signed numbers, fractions, decimals, ratios, scientific notation, powers, algebra, coordinates, functions, geometry, trigonometry, vectors, rates, accumulation, sine, and uncertainty. The prerequisite graph is closed and acyclic: a released lesson never requires an unavailable tutorial.

Extended classical physics, modern physics, selected graduate treatments, and sourced frontier surveys are planned later releases. Those topics are not part of the supported first-release course. See [Curriculum](docs/CURRICULUM.md).

## Run locally

Install Node.js 22.20 or newer, then run:

```sh
npm ci
npm run dev
```

No account, API key, credential, server, or paid service is required. Learner progress stays in `localStorage`; export a progress file before clearing site data or changing browsers.

Useful checks:

```sh
npm run check
npx playwright install chromium
npm run test:e2e
```

`npm run check` runs TypeScript, lint, unit tests, and a production build. See [Deployment](docs/DEPLOYMENT.md) for GitHub Pages and subpath verification.

## Project guides

- [Architecture](docs/ARCHITECTURE.md)
- [Curriculum](docs/CURRICULUM.md)
- [Authoring lessons and models](docs/AUTHORING.md)
- [Scientific validation](docs/SCIENTIFIC_VALIDATION.md)
- [Sources and citation policy](docs/SOURCES.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Contributing](CONTRIBUTING.md)

## License and source use

Project licensing is recorded in the repository license when present. Source citations support scientific claims; they do not license copied prose, figures, or exercises. Course explanations, examples, assessments, and visual assets must be original or separately licensed and attributed.
