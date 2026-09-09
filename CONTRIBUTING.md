# Contributing

Contributions should improve the complete foundations release or clearly label work for a planned course. Read `docs/IMPLEMENTATION.md`, [Architecture](docs/ARCHITECTURE.md), [Authoring](docs/AUTHORING.md), and [Scientific validation](docs/SCIENTIFIC_VALIDATION.md) before changing course or simulation behavior.

## Development

Use Node.js 22.20 or newer and install the locked dependencies with `npm ci`. Keep changes focused. Do not commit credentials, `.env` files, generated `dist/`, test reports, or unrelated work.

For a scientific calculation or behavioral change, first add a meaningful test that fails for the missing or incorrect behavior. Implement the change, then run:

```sh
npm run check
npx playwright install chromium
npm run test:e2e
```

Dependency changes must include `package-lock.json`. Scientific and interface changes must be described in `CHANGELOG.md`.

## Course contributions

- Follow the typed contracts in `src/types.ts` and the step-by-step [Authoring guide](docs/AUTHORING.md).
- Preserve unique stable kebab-case IDs and a closed, acyclic prerequisite graph.
- Supply original explanations, equations with readable symbol definitions, a worked example, concept/calculation/experiment assessments, sources, assumptions, and an actual review date for every lesson.
- Keep every required math tutorial available and substantive.
- Keep SI models deterministic and independent from React and rendering.
- Provide accessible observations and a graph/table alternative for visual evidence.

Foundations additions must fit the released eight-family scope. Rotation, fluids, waves, thermal physics, electricity, optics, modern physics, graduate treatments, and frontier surveys are planned work until a later release is explicitly approved. Label proposed or theoretical material accurately.

## Source control

The repository owner has authorized maintainers to update `CHANGELOG.md`, commit, and push each coherent validated change set. Never force-push or discard remote changes. Resolve concurrent changes without overwriting contributor work, and report authentication or push failures. Pull requests should state the user-visible or scientific behavior changed, the model assumptions affected, and the validation performed.
