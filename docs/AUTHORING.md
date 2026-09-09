# Authoring guide

Add course material as typed data and keep scientific calculation separate from prose and rendering. Run the relevant tests after each addition and `npm run check` before publishing.

## Add a lesson

1. Choose a stable, unique kebab-case lesson ID and one of the eight released family IDs.
2. Add a `LessonDefinition` in `src/content/`. Set realistic minutes, explicit objectives, earlier lesson prerequisites, and existing math tutorial IDs.
3. Write original prediction guidance, experiment steps, at least two explanatory passages, a KaTeX equation, accessible symbol definitions, and a worked example with at least two steps.
4. Add exactly three assessments: one `concept`, one `calculation`, and one `experiment`. Concept answers are zero-based indices into `options`. Quantitative answers need a finite SI value, a positive absolute tolerance, and an exact unit string.
5. Record the approximations in `assumptions`, give direct references for scientific claims, and set `reviewedAt` to the actual review date in `YYYY-MM-DD` form.
6. Connect the lesson to its experiment preset using only parameter keys declared by that family.
7. Run curriculum, assessment, physics, and browser checks. Confirm every prerequisite exists and the graph remains acyclic.

Assessment IDs are stable kebab-case keys. Changing an ID discards the association with saved learner answers, so treat it as a migration decision.

## Add a math tutorial

1. Choose a unique kebab-case ID and list only existing tutorial prerequisites.
2. Supply original explanation, a readable equation, a worked example, and one meaningful interactive or stepwise exercise.
3. Use bounded `min`, `max`, `step`, and `initial` values; make the instruction explain what the learner should observe or calculate.
4. Add an assessment with the same scoring conventions as lessons.
5. Add tests showing the tutorial closes a real lesson prerequisite and does not create a cycle.

## Add or change a physics model

1. Write an independent failing test from an analytical result, conservation law, or hand-calculated reference case.
2. Implement the minimum deterministic calculation in `src/physics/`. Keep all internal calculations in SI and do not import React, Three.js, DOM APIs, or content components.
3. Define bounded controls and units. Decide how invalid parameters and out-of-duration times behave, then cover those boundaries with tests.
4. Return bodies for rendering and observations for accessible text/chart/table output. Never read scientific numbers back from scene geometry.
5. Document assumptions and known limits in the linked lessons and [Scientific validation](SCIENTIFIC_VALIDATION.md).
6. Verify reset, pause, single-step, playback speed, graph, and table behavior in the browser.

## Writing and source rules

Explain causal reasoning in plain English before relying on formulas. Define symbols and units at first use. Worked examples should show why each step is valid. Hints guide without revealing an unrelated shortcut; explanations teach the result whether the learner was right or wrong.

Consult the [source policy](SOURCES.md). Cite claims to the closest authoritative page, keep prose and exercises original, avoid copied diagrams, and state where a model departs from real behavior. The review date records when a human or contributor last checked the lesson against its cited sources; it is not a claim of exhaustive coverage.
