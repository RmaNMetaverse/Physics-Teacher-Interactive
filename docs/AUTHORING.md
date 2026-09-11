# Authoring Guide

Add course material as typed data and keep scientific calculation separate from prose and rendering. Run unit, content, and browser verification tests after each addition, and run `npm run check` before publishing.

## Course Structure & Organization

The platform organizes learning into courses with open access:
- **Physics Foundations**: 24 normal instructional missions adapting core foundations lessons.
- **Thirteen Starter Courses**: Exactly 5 normal missions followed by 1 checkpoint mission. Deeper treatments beyond these 5-mission starter paths remain planned future releases.
- **Checkpoints**: Four-step synthesis missions (Observe, Check 1, Check 2, Recap) awarding 100 XP and a distinctive course badge.

## Author a Normal Mission

Each normal instructional mission is defined in `src/learning/courses/<course-id>.ts` with exactly 7 sequential steps:

1. **Observe**: Set physical scenario and pose an inquiry question.
2. **Predict**: Qualitative multiple-choice assessment testing intuition before simulation.
3. **Simulate**: Interactive lab experiment prompt with bounded controls and telemetry.
4. **Explain**: Detailed physical explanation linking observed evidence to physical principles.
5. **Layered Math**: Concise quick formula layer plus expandable zero-prior-knowledge foundation layer.
6. **Check**: Quantitative or experimental assessment verifying calculation mastery.
7. **Recap**: Takeaways list, 1–3 star scoring, XP award, and access to the comprehensive Deep Dive section.

### Required Mission Fields
- `id`: Stable, unique kebab-case identifier (e.g. `quantum-light-quanta`).
- `title` & `summary`: Plain-English descriptions without jargon.
- `scienceStatus`: Explicit scientific consensus level:
  - `'established'`: Consensus physics backed by reproducible empirical tests.
  - `'active-research'`: Ongoing experimental and theoretical research.
  - `'interpretation'`: Theoretical interpretative frameworks.
  - `'speculative'`: Theoretical frontier proposals (multiverse, string theory, etc.).
- `equation`, `symbols`, and `workedExample`: Rigorous reference formulation displayed in Quick Mode and Deep Dive.
- `sources`: Array of authoritative external references (OpenStax, CERN, NASA, etc.).
- `limitations`: List of explicit model approximations and boundary conditions.

## Author Layered Math

Every math step implements the `MathLayer` contract:
- **Quick Mode**:
  - `equation`: Formatted KaTeX string.
  - `summary`: One-sentence operational summary.
  - `symbols`: Array of `{ symbol, meaning, unit? }`.
- **Foundation Mode**:
  - `title` & `concepts`: Core concepts addressed.
  - `explanation`: Step-by-step conceptual guide.
  - `visual`: Interactive manipulative (`number`, `ratio`, `graph`, `triangle`, `vector`, `wave`, `area`) with bounds (`min`, `max`, `step`, `initial`).
  - `workedExample`: Structured calculation problem with sequential `steps` and `answer`.
  - `check`: Scored assessment verifying mathematical mechanics.

## Register a Physics Model

1. Implement deterministic SI calculations in `src/physics/models/<model-id>.ts`.
   - Never import React, Three.js, DOM APIs, or rendering libraries.
   - Ensure all public parameter corners and integration times return finite numerical values.
2. Register the model in `src/physics/catalog.ts`:
   - Add model ID to `ModelId` union.
   - Define bounded parameters with min, max, step, and default values.
   - Expose the pure `evaluate(parameters, time)` function returning `SimulationState` (bodies, observations, time).
3. Add analytical reference tests in `tests/advanced-physics.test.ts` checking conservation laws, limits, and hand-calculated cases.
4. Verify both 3D rendering and Reduced Visual Mode fallback (SVG plot and measurements table).

## Scientific and Writing Standards

- Explain causal reasoning in plain English before presenting mathematical formulas.
- Define symbols and SI units upon their first appearance.
- Checkpoints test mastery across preceding missions without adding new theoretical concepts.
- Document known model limitations and domain boundaries in the linked mission and [Scientific Validation](SCIENTIFIC_VALIDATION.md).
