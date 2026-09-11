# Gamified Multi-Course Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dense single-course laboratory shell with a Balanced Science Adventure where learners choose any of 14 courses, follow visual paths, and complete short interactive missions without losing equations, mathematics, sources, or scientific rigor.

**Architecture:** A typed course catalog feeds a deterministic mission state machine and a version-2 local progress store. React renders Explore, Course Path, Mission, and Progress screens from reusable definitions; SI calculations remain React-independent in `src/physics`. Foundations adapts its existing 24 lessons, while thirteen new course files provide five-mission starter paths and checkpoints.

**Tech Stack:** React 19, TypeScript 5.9, Vite 6, Three.js with React Three Fiber, KaTeX, Vitest, Playwright, localStorage, GitHub Actions, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-09-09-gamified-multicourse-redesign-design.md`

## Global Constraints

- Preserve GitHub Pages compatibility with `base: './'` and hash routes.
- Keep physics models deterministic, finite, SI-based, and independent of React.
- Publish 14 open courses: a complete 24-mission Foundations path and thirteen five-mission starter paths.
- Give every starter a checkpoint, prerequisite math, sources, limitations, and a meaningful simulation.
- Give every equation a concise experienced-learner layer and expandable zero-prior-knowledge layer.
- The expanded layer defines symbols and operations, uses a visual, works an example step by step, and checks understanding.
- Treat prerequisites as recommendations; never lock a course.
- Award mission XP once. Replays may improve stars without duplicating XP.
- Separate established physics, active research, interpretation, and speculative proposals.
- Migrate version-1 progress into a catalog-validated version-2 record.
- Support keyboard use, visible focus, MathML, reduced motion, scene descriptions, graphs, and data tables.
- Add no accounts, SSO, cloud saves, analytics, payments, credentials, or backend.
- Update `CHANGELOG.md` and guides after every validated change set.
- Before release run `npm run check`, `npm run test:e2e`, and an exact Pages-subpath smoke test.

## Target file map

- `src/learning/types.ts`: course, mission, step, math-layer, reward, and scientific-status contracts.
- `src/learning/catalog.ts`: validated registry and lookups.
- `src/learning/foundations.ts`: converts 24 legacy lessons into missions.
- `src/learning/math-layers.ts`: converts math tutorials into two-layer explanations.
- `src/learning/courses/*.ts`: one starter-course file per non-Foundations course.
- `src/learning/mission-engine.ts`: pure mission reducer and star calculation.
- `src/progress/types.ts`, `src/progress/progress.ts`: version 2, migration, validation, persistence, rewards, and streaks.
- `src/physics/models/*.ts`, `src/physics/catalog.ts`: focused advanced models and registry.
- `src/app/router.ts`, `src/app/AppShell.tsx`: routes and three-destination shell.
- `src/pages/*.tsx`: Explore, Course Path, Mission, and Progress.
- `src/components/mission/*.tsx`: focused step renderers and Deep Dive.
- `src/components/simulation/*.tsx`: shared lab and reduced visual mode.
- `src/components/rewards/*.tsx`: XP, streak, mastery, badges, and celebrations.
- `src/styles/*.css`: visual tokens and page-level styles.

Keep legacy lesson and progress contracts until Foundations migration is proven. Remove obsolete UI only in the final cleanup task.

### Task 1: Learning contracts and catalog validation

**Files:**
- Create: `src/learning/types.ts`
- Create: `src/learning/catalog.ts`
- Create: `tests/learning-catalog.test.ts`
- Modify: `src/types.ts`
- Modify: `CHANGELOG.md`

**Interfaces:**
- Produces: `ScienceStatus`, `MathLayer`, `MissionStep`, `MissionDefinition`, `CourseDefinition`, and `CourseCatalog`.
- Produces: `createCourseCatalog(courses)`, `getCourse(id)`, `getMission(courseId, missionId)`, and catalog ID sets.

- [x] **Step 1: Write failing validation tests**

Test duplicate IDs, missing simulations, incomplete math layers, missing sources/limitations, malformed checkpoints, recommendation cycles, and open access.

```ts
expect(() => createCourseCatalog([duplicateMissionCourse])).toThrow(/duplicate mission/i);
expect(() => createCourseCatalog([quickMathOnlyCourse])).toThrow(/expanded math/i);
expect(catalog.getCourse('quantum').access).toBe('open');
```

- [x] **Step 2: Verify failure**

Run: `npm test -- tests/learning-catalog.test.ts`
Expected: FAIL because the module does not exist.

- [x] **Step 3: Implement stable contracts**

```ts
export type ScienceStatus = 'established'|'active-research'|'interpretation'|'speculative';
export interface MathLayer {
  quick: { equation:string; summary:string; symbols:Array<{symbol:string;meaning:string;unit?:string}> };
  foundation: {
    title:string; concepts:string[]; explanation:string[];
    visual:{kind:'number'|'ratio'|'graph'|'triangle'|'vector'|'wave'|'area';min:number;max:number;step:number;initial:number;instruction:string};
    workedExample:{question:string;steps:string[];answer:string};
    check:Assessment;
  };
}
export type MissionStep =
 | {id:string;kind:'observe';title:string;body:string[]}
 | {id:string;kind:'predict'|'check';assessment:Assessment}
 | {id:string;kind:'simulate';modelId:ModelId;prompt:string;preset:Parameters}
 | {id:string;kind:'math';title:string;layer:MathLayer}
 | {id:string;kind:'explain';title:string;body:string[]}
 | {id:string;kind:'recap';takeaways:string[]};
```

Require unique kebab-case IDs, exactly one final recap, a learner action before recap, valid KaTeX, both math layers, sources, limitations, and valid model/math references. Return readonly maps.

- [x] **Step 4: Verify pass and legacy compatibility**

Run: `npm test -- tests/learning-catalog.test.ts tests/content.test.ts`
Expected: PASS.

- [x] **Step 5: Document, commit, and push**

```bash
git add src/learning src/types.ts tests/learning-catalog.test.ts CHANGELOG.md
git commit -m "feat: add typed course and mission catalog"
git push origin main
```

### Task 2: Two-layer mathematics and Foundations adapter

**Files:**
- Create: `src/learning/math-layers.ts`
- Create: `src/learning/foundations.ts`
- Create: `tests/mission-content.test.ts`
- Modify: `src/content/math.ts`
- Modify: `src/content/index.ts`
- Modify: `CHANGELOG.md`

**Interfaces:**
- Consumes: existing `LessonDefinition` and `MathTutorialDefinition`.
- Produces: `createMathLayer(tutorial): MathLayer` and `foundationCourse: CourseDefinition`.

- [x] **Step 1: Write failing zero-prior-math tests**

For each equation, require quick copy under 240 characters, every symbol defined, at least two foundation explanations, a visual, two worked steps, a hint, and substantial feedback. Reject dismissive wording.

```ts
expect(step.layer.quick.summary.length).toBeLessThanOrEqual(240);
expect(step.layer.quick.symbols.length).toBeGreaterThan(0);
expect(step.layer.foundation.explanation.length).toBeGreaterThanOrEqual(2);
expect(step.layer.foundation.explanation.join(' ')).not.toMatch(/\b(simply|obviously|trivial)\b/i);
```

Assert that the adapter preserves every legacy explanation, assessment, source, assumption, preset, and math reference across 24 missions.

- [x] **Step 2: Verify failure**

Run: `npm test -- tests/mission-content.test.ts`
Expected: FAIL because the adapter does not exist.

- [x] **Step 3: Author explicit math metadata**

Add `concepts` and `symbols` to all 17 tutorials. Define variables, negative numbers, fractions, operations, graphs, and units with no assumed vocabulary.

- [x] **Step 4: Implement `createMathLayer`**

Quick mode states purpose, equation, and symbol meanings. Foundation mode carries prerequisite links, explanations, visual, worked example, and assessment. Nested prerequisites return to the same mission step.

- [x] **Step 5: Implement Foundations missions**

For each legacy lesson build: observe, concept prediction, simulation, required math steps, explanation, calculation check, experiment check, recap. Award 60 XP once and preserve review date, sources, limitations, and SI preset.

- [x] **Step 6: Verify and commit**

Run: `npm test -- tests/mission-content.test.ts tests/content.test.ts tests/math-widget.test.ts`
Expected: PASS with 24 missions and 17 complete layered tutorials.

```bash
git add src/learning src/content tests/mission-content.test.ts CHANGELOG.md
git commit -m "feat: adapt foundations to layered missions"
git push origin main
```

### Task 3: Version-2 progress, migration, and rewards

**Files:**
- Create: `src/progress/types.ts`
- Create: `src/progress/progress.ts`
- Create: `tests/progress-v2.test.ts`
- Modify: `src/lib/progress.ts`
- Modify: `src/types.ts`
- Modify: `CHANGELOG.md`

**Interfaces:**
- Produces: `LearnerProgressV2`, `createProgressV2(now)`, `readProgressV2(catalog,now)`, `parseProgressV2(json,catalog,now)`, `recordStep(progress,event,now)`, `completeMission(progress,result,catalog,now)`, and `serializeProgressV2(progress,catalog)` plus `saveProgressV2(progress,catalog)`.

- [x] **Step 1: Write failing progress tests**

Cover migration, ID validation, one-time XP, replay star improvement, badge awards, daily goals 1/3/5, local-day streak boundaries, missed days, blocked storage, import, and corrupted JSON.

```ts
const once=completeMission(progress,{courseId:'quantum',missionId:'quantum-light-quanta',stars:2},catalog,now);
const replay=completeMission(once,{courseId:'quantum',missionId:'quantum-light-quanta',stars:3},catalog,later);
expect(replay.totalXp).toBe(once.totalXp);
expect(replay.missionStars['quantum/quantum-light-quanta']).toBe(3);
```

- [x] **Step 2: Verify failure**

Run: `npm test -- tests/progress-v2.test.ts`
Expected: FAIL because version 2 does not exist.

- [x] **Step 3: Implement the source-of-truth record**

```ts
interface LearnerProgressV2 {
 version:2; selectedCourseId:string; nextMissionByCourse:Record<string,string>;
 completedMissions:string[]; missionStars:Record<string,1|2|3>;
 stepAttempts:Record<string,number>; answers:Record<string,number|string>;
 completedMathSteps:string[]; xpLedger:Record<string,number>; totalXp:number;
 streak:{current:number;longest:number;lastActiveDate:string}; dailyGoal:1|3|5;
 badges:string[]; settings:{theme:'light'|'dark';sound:boolean;reducedMotion:boolean;celebrations:boolean};
 savedAt:string;
}
```

Derive total XP from the validated ledger. Use local `YYYY-MM-DD` dates. Reject invalid stars rather than coercing them.

- [x] **Step 4: Implement version-1 migration**

Map legacy lesson IDs to `foundations/<lesson-id>`, answers to adapted step IDs, and math completions to foundation math steps. Preserve theme. Discard unknown legacy IDs and award historical XP once.

- [x] **Step 5: Verify and commit**

Run: `npm test -- tests/progress-v2.test.ts tests/progress.test.ts`
Expected: PASS.

```bash
git add src/progress src/lib/progress.ts src/types.ts tests/progress-v2.test.ts CHANGELOG.md
git commit -m "feat: add gamified progress and migration"
git push origin main
```

### Task 4: Deterministic mission state machine

**Files:**
- Create: `src/learning/mission-engine.ts`
- Create: `tests/mission-engine.test.ts`
- Modify: `CHANGELOG.md`

**Interfaces:**
- Produces: `createMissionSession(mission,saved?)`, `missionReducer(state,action)`, `calculateStars(state)`, and `MissionCompletion`.

- [x] **Step 1: Write failing transition tests**

Cover next/back, revisit, answer tolerance, hints, expanded math state, simulation completion, recap, first-attempt stars, retry stars, guided stars, and restore.

```ts
const answered=missionReducer(createMissionSession(mission),{type:'answer',stepId:'predict',value:1});
expect(answered.canAdvance).toBe(true);
expect(()=>missionReducer(answered,{type:'goto',index:99})).toThrow(/step/i);
```

- [x] **Step 2: Verify failure**

Run: `npm test -- tests/mission-engine.test.ts`
Expected: FAIL because the reducer does not exist.

- [x] **Step 3: Implement pure actions**

Support `next`, `back`, `goto`, `answer`, `request-hint`, `toggle-math-foundation`, `complete-simulation`, and `restore`. Keep storage outside the reducer.

- [x] **Step 4: Implement stars**

Three stars: all scored steps first-attempt correct without hints. Two: correct after retries without guided solution. One: completed with guidance.

- [x] **Step 5: Verify and commit**

Run: `npm test -- tests/mission-engine.test.ts tests/assessment.test.ts`
Expected: PASS.

```bash
git add src/learning/mission-engine.ts tests/mission-engine.test.ts CHANGELOG.md
git commit -m "feat: add deterministic mission engine"
git push origin main
```

### Task 5: Advanced SI model modules

**Files:**
- Create: `src/physics/models/waves.ts`, `thermal.ts`, `electromagnetism.ts`, `optics.ts`, `relativity.ts`, `quantum.ts`, `atomic.ts`, `nuclear.ts`, `particle.ts`, `condensed.ts`, `astrophysics.ts`, `cosmology.ts`
- Create: `src/physics/catalog.ts`
- Create: `tests/advanced-physics.test.ts`
- Modify: `src/physics/index.ts`, `src/physics/README.md`, `CHANGELOG.md`

**Interfaces:**
- Produces model IDs `waves`, `thermal`, `electromagnetism`, `optics`, `relativity`, `quantum`, `atomic`, `nuclear`, `particle`, `condensed`, `astrophysics`, `cosmology`.
- Produces: `evaluateModel(modelId,parameters,time)`, `modelDefaults(modelId)`, and `sanitizeModelParameters(modelId,input)`.
- Preserves legacy `evaluate(family,...)` until final cleanup.

- [x] **Step 1: Write independent analytic tests**

```ts
expect(value(evaluateModel('waves',{frequency:2,wavelength:3},0),'speed')).toBeCloseTo(6);
expect(value(evaluateModel('optics',{focalLength:.1,objectDistance:.2},0),'imageDistance')).toBeCloseTo(.2);
expect(value(evaluateModel('relativity',{beta:.6},0),'gamma')).toBeCloseTo(1.25);
expect(value(evaluateModel('atomic',{n:2},0),'energyEv')).toBeCloseTo(-3.4);
expect(value(evaluateModel('nuclear',{initial:100,halfLife:2},4),'remaining')).toBeCloseTo(25);
```

Also test ideal-gas `PV=nRT`, Coulomb inverse-square scaling, normalized finite quantum samples, decreasing tunneling with barrier width, the energy-momentum invariant, Fermi-Dirac half occupancy at `E=mu`, Stefan-Boltzmann luminosity, and linear Hubble-law scaling.

- [x] **Step 2: Verify failure**

Run: `npm test -- tests/advanced-physics.test.ts`
Expected: FAIL because advanced models do not exist.

- [x] **Step 3: Implement each focused model**

Use: `v=fλ`; `PV=nRT`; `E=kq/r²`; `1/f=1/d_o+1/d_i`; `γ=1/sqrt(1-β²)`; normalized Gaussian probability and `T≈exp(-2κa)`; `E_n=-13.6/n² eV`; `N=N₀2^{-t/t_half}`; `E²=(pc)²+(mc²)²`; Fermi-Dirac occupancy; `L=4πR²σT⁴`; and `v=H₀d`.

Bound exponential inputs, clamp parameters, state classroom approximations, and return finite deterministic output for all boundaries.

- [x] **Step 4: Register models and verify**

Run: `npm test -- tests/advanced-physics.test.ts tests/physics.test.ts tests/scene.test.ts`
Expected: PASS.

- [x] **Step 5: Document and commit**

Document equations, SI units, parameter bounds, and model limitations.

```bash
git add src/physics tests/advanced-physics.test.ts CHANGELOG.md
git commit -m "feat: add modern physics simulation models"
git push origin main
```

### Task 6: Thirteen starter course packs

**Files:**
- Create: `src/learning/courses/classical-mechanics.ts`
- Create: `src/learning/courses/waves-sound.ts`
- Create: `src/learning/courses/thermodynamics.ts`
- Create: `src/learning/courses/electromagnetism.ts`
- Create: `src/learning/courses/optics.ts`
- Create: `src/learning/courses/relativity.ts`
- Create: `src/learning/courses/quantum.ts`
- Create: `src/learning/courses/atomic-molecular.ts`
- Create: `src/learning/courses/nuclear.ts`
- Create: `src/learning/courses/particle.ts`
- Create: `src/learning/courses/condensed-matter.ts`
- Create: `src/learning/courses/astrophysics.ts`
- Create: `src/learning/courses/cosmology-frontiers.ts`
- Create: `tests/starter-courses.test.ts`
- Modify: `src/learning/catalog.ts`, `docs/SOURCES.md`, `docs/CURRICULUM.md`, `CHANGELOG.md`

**Interfaces:**
- Consumes course contracts, math layers, models, and assessment helpers.
- Produces thirteen `CourseDefinition` exports.

- [x] **Step 1: Write failing completeness tests**

Require five normal missions plus one checkpoint per new course, three to seven steps per mission, a scored check per mission, a simulation per course, two authoritative course references, original explanations, limitations, and review date `2026-09-09`.

- [x] **Step 2: Verify failure**

Run: `npm test -- tests/starter-courses.test.ts`
Expected: FAIL because course packs do not exist.

- [x] **Step 3: Author classical through optics**

Use these exact five-mission paths:

- Classical Mechanics: frames and motion; force diagrams; rotation; fluids and pressure; chaos and limits.
- Waves and Sound: oscillation; traveling waves; superposition; resonance; sound and spectra.
- Thermodynamics: microscopic temperature; ideal gas; first law; entropy; engines and limits.
- Electromagnetism: charge and field; potential; current; magnetic force; Maxwell's synthesis.
- Optics: reflection; refraction; lenses; interference; photons and imaging.

Classical may reuse existing models. The remaining courses reference their same-named advanced model.

- [x] **Step 4: Author relativity through particle physics**

- Relativity: events and frames; light-clock dilation; length and simultaneity; energy-momentum; curved spacetime.
- Quantum Physics: light quanta; build a wavefunction; measurement probabilities; uncertainty; tunneling.
- Atomic and Molecular: spectra; Bohr scale; orbitals; bonds; lasers.
- Nuclear Physics: binding; decay; half-life; fission; fusion.
- Particle Physics: relativistic particles; quantum fields; symmetries; Standard Model; neutrinos and open questions.

Quantum's first mission is directly selectable. Predictive quantum formalism is `established`; interpretations are `interpretation`.

- [x] **Step 5: Author condensed matter through frontiers**

- Condensed Matter: lattices; bands; Fermi statistics; semiconductors; superconductivity.
- Astrophysics: stellar light; hydrostatic balance; fusion; stellar evolution; compact objects.
- Cosmology and Frontiers: expansion; cosmic background; dark matter evidence; dark energy evidence; tested knowledge versus proposals.

Mark string theory, loop quantum gravity, multiverse scenarios, and other unconfirmed frameworks `speculative`.

- [x] **Step 6: Validate and commit**

Run: `npm test -- tests/starter-courses.test.ts tests/learning-catalog.test.ts tests/mission-content.test.ts tests/content.test.ts`
Expected: PASS with 14 open courses and 89 normal missions: 24 Foundations plus 65 starter missions.

```bash
git add src/learning/courses src/learning/catalog.ts tests/starter-courses.test.ts docs/SOURCES.md docs/CURRICULUM.md CHANGELOG.md
git commit -m "feat: add thirteen interactive starter courses"
git push origin main
```

### Task 7: Hash router, three-destination shell, Explore, and Course Path

**Files:**
- Create: `src/app/router.ts`, `src/app/AppShell.tsx`
- Create: `src/pages/ExplorePage.tsx`, `src/pages/CoursePathPage.tsx`
- Create: `tests/router.test.ts`, `tests/e2e/navigation.spec.ts`
- Modify: `src/App.tsx`, `src/main.tsx`, `CHANGELOG.md`

**Interfaces:**
- Produces: `parseHash(hash): AppRoute`, `toHash(route): string`, `ExplorePage`, and `CoursePathPage`.

- [x] **Step 1: Write failing route and browser tests**

Test Explore default, course/mission paths, invalid ID recovery, Continue, Quantum first, three nav destinations, and absence of legacy lesson tabs.

```ts
expect(parseHash('#/course/quantum')).toEqual({page:'course',courseId:'quantum'});
expect(parseHash('#/mission/quantum/quantum-wavefunction')).toEqual({
 page:'mission',courseId:'quantum',missionId:'quantum-wavefunction'
});
```

- [x] **Step 2: Verify failure**

Run: `npm test -- tests/router.test.ts`
Expected: FAIL because the new router does not exist.

- [x] **Step 3: Implement routes and shell**

Persistent navigation contains Explore, Learn, and Progress only. Course and mission back buttons are contextual. Invalid routes replace the hash with `#/explore` and announce recovery.

- [x] **Step 4: Implement Explore**

Show one Continue hero, filter chips, and all 14 cards with level, mission count, time, scope, and progress. Every card is open. Quantum routes to `#/course/quantum`.

- [x] **Step 5: Implement Course Path**

Use an accessible ordered list under the visual path. Nodes expose complete, next, available, and checkpoint states. Every node remains operable using native tab order.

- [x] **Step 6: Verify and commit**

Run: `npm test -- tests/router.test.ts`
Run: `npx playwright test tests/e2e/navigation.spec.ts`
Expected: PASS.

```bash
git add src/app src/pages/ExplorePage.tsx src/pages/CoursePathPage.tsx src/App.tsx src/main.tsx tests/router.test.ts tests/e2e/navigation.spec.ts CHANGELOG.md
git commit -m "feat: add gamified course discovery and paths"
git push origin main
```

### Task 8: Focused mission player and layered math

**Files:**
- Create: `src/pages/MissionPage.tsx`
- Create: `src/components/mission/MissionPlayer.tsx`, `ObserveStep.tsx`, `AssessmentStep.tsx`, `MathStep.tsx`, `ExplainStep.tsx`, `RecapStep.tsx`, `DeepDive.tsx`
- Create: `tests/math-layer.test.tsx`, `tests/e2e/mission.spec.ts`
- Modify: `src/components/Equation.tsx`, `CHANGELOG.md`

**Interfaces:**
- Consumes mission reducer, math layers, assessment checking, and progress events.
- Produces one-step-at-a-time `MissionPlayer` and `MathStep`.

- [x] **Step 1: Write failing math component tests**

```tsx
render(<MathStep step={mathStep} state={state} dispatch={dispatch}/>);
expect(screen.getByText(mathStep.layer.quick.summary)).toBeVisible();
expect(screen.queryByText(mathStep.layer.foundation.title)).not.toBeVisible();
await user.click(screen.getByRole('button',{name:/teach me the math/i}));
expect(screen.getByText(mathStep.layer.foundation.title)).toBeVisible();
```

Also assert symbol definitions, visual, sequential worked steps, assessment, nested prerequisite return, and focus restoration.

- [x] **Step 2: Verify failure**

Run: `npm test -- tests/math-layer.test.tsx`
Expected: FAIL because mission components do not exist.

- [x] **Step 3: Implement MissionPlayer**

Show close, progress, current step, one primary action, and optional back. Persist outside the reducer. Keep resume state without a blocking unload dialog.

- [x] **Step 4: Implement MathStep**

Quick mode shows equation, purpose, and symbols. “Teach me the math” expands in place to concepts, plain-language operations, interactive visual, worked steps revealed one at a time, and a check. Closing returns to the same physics step.

- [x] **Step 5: Implement recap and Deep Dive**

Recap awards one-time XP and stars, then offers Continue, Replay, and Deep Dive. Deep Dive contains derivation, full explanation, sources, limitations, and experiments without tabs.

- [x] **Step 6: Verify and commit**

Run: `npm test -- tests/math-layer.test.tsx tests/mission-engine.test.ts tests/assessment.test.ts`
Run: `npx playwright test tests/e2e/mission.spec.ts`
Expected: PASS through Foundations and Quantum missions, including expanded math.

```bash
git add src/pages/MissionPage.tsx src/components/mission src/components/Equation.tsx tests/math-layer.test.tsx tests/e2e/mission.spec.ts CHANGELOG.md
git commit -m "feat: add bite-sized mission player"
git push origin main
```

### Task 9: Shared simulations and reduced visual mode

**Files:**
- Create: `src/components/simulation/SimulationStep.tsx`, `SimulationBoundary.tsx`
- Move: `src/components/Lab.tsx` to `src/components/simulation/Lab.tsx`
- Move: `src/components/Scene.tsx` to `src/components/simulation/Scene.tsx`
- Move: `src/components/GraphView.tsx` to `src/components/simulation/GraphView.tsx`
- Create: `tests/simulation-boundary.test.tsx`, `tests/e2e/simulations.spec.ts`
- Modify: `CHANGELOG.md`

**Interfaces:**
- Produces `SimulationStep` for any `ModelId` and `SimulationBoundary` that preserves nonvisual interaction after WebGL failure.

- [x] **Step 1: Write failing fallback tests**

Force the scene renderer to throw. Assert that controls, numerical observations, graph, table, model description, and recovery copy remain. Test sliders and numeric input by keyboard.

- [x] **Step 2: Verify failure**

Run: `npm test -- tests/simulation-boundary.test.tsx`
Expected: FAIL because the boundary does not exist.

- [x] **Step 3: Generalize the lab**

Replace `Family` assumptions with `ModelId`. Show at most three essential controls before “Explore further.” Preserve play, pause, reset, step, speed, and live time.

- [x] **Step 4: Implement reduced visual mode**

Catch dynamic import, WebGL context, and render errors. Keep the pure model loop active and render a 2D schematic or textual state, observations, graph, and data table.

- [x] **Step 5: Verify and commit**

Run: `npm test -- tests/simulation-boundary.test.tsx tests/scene.test.ts tests/physics.test.ts tests/advanced-physics.test.ts`
Run: `npx playwright test tests/e2e/simulations.spec.ts`
Expected: PASS for representative missions from all 14 courses and forced fallback.

```bash
git add src/components/simulation src/components/Lab.tsx src/components/Scene.tsx src/components/GraphView.tsx tests/simulation-boundary.test.tsx tests/e2e/simulations.spec.ts CHANGELOG.md
git commit -m "feat: integrate mission simulations and fallbacks"
git push origin main
```

### Task 10: Progress page, rewards, settings, and celebrations

**Files:**
- Create: `src/pages/ProgressPage.tsx`
- Create: `src/components/rewards/XpBar.tsx`, `StreakCard.tsx`, `MasteryRing.tsx`, `BadgeShelf.tsx`, `Celebration.tsx`
- Create: `tests/rewards.test.tsx`, `tests/e2e/progress-v2.spec.ts`
- Modify: `CHANGELOG.md`

**Interfaces:**
- Consumes `LearnerProgressV2`.
- Produces accessible reward visuals, settings, and backup actions.

- [x] **Step 1: Write failing reward UI tests**

Cover singular/plural copy, one-time XP, star states, streak 0/1/many, goals 1/3/5, sound off, reduced motion, celebrations off, import, and reset preserving settings.

- [x] **Step 2: Verify failure**

Run: `npm test -- tests/rewards.test.tsx`
Expected: FAIL because reward components do not exist.

- [x] **Step 3: Implement Progress and rewards**

Derive level as `Math.floor(totalXp/500)+1`. Give mastery SVGs text equivalents. Badge names describe checkpoint achievements. Recent activity comes from validated ledger events.

- [x] **Step 4: Add restrained celebration**

Use a short CSS/SVG burst on completion. Disable it through either the in-app preference or `prefers-reduced-motion`. Sound defaults off and makes no network request.

- [x] **Step 5: Verify and commit**

Run: `npm test -- tests/rewards.test.tsx tests/progress-v2.test.ts`
Run: `npx playwright test tests/e2e/progress-v2.spec.ts`
Expected: PASS.

```bash
git add src/pages/ProgressPage.tsx src/components/rewards tests/rewards.test.tsx tests/e2e/progress-v2.spec.ts CHANGELOG.md
git commit -m "feat: add mastery rewards and progress"
git push origin main
```

### Task 11: Balanced Science Adventure visual system

**Files:**
- Create: `src/styles/tokens.css`, `shell.css`, `explore.css`, `path.css`, `mission.css`, `progress.css`, `simulation.css`, `responsive.css`
- Modify: `src/styles.css`
- Modify: `tests/e2e/navigation.spec.ts`, `tests/e2e/mission.spec.ts`
- Modify: `CHANGELOG.md`

**Interfaces:**
- Produces semantic tokens for surfaces, text, journey, mastery, rewards, feedback, focus, and motion.

- [x] **Step 1: Add failing browser assertions**

At 320×700, 768×1024, and 1440×900 assert no page overflow, one prominent mission action, 44-pixel primary targets, visible focus, mobile bottom nav, and no legacy sidebar or lesson tabs. Emulate reduced motion and assert celebration duration is zero.

- [x] **Step 2: Verify failure**

Run: `npx playwright test tests/e2e/navigation.spec.ts tests/e2e/mission.spec.ts`
Expected: FAIL on missing or legacy styling.

- [x] **Step 3: Implement visual tokens**

Use warm off-white surfaces, navy text, violet journey emphasis, mint mastery, gold rewards, and coral feedback. Use rounded cards, original CSS/SVG science art, strong hierarchy, and matching dark-mode semantics.

- [x] **Step 4: Implement responsive behavior**

Use a compact desktop top bar and three-item mobile bottom bar. Keep the path readable as an ordered list without connector lines. Apply both media-query and data-setting reduced motion.

- [x] **Step 5: Verify and commit**

Run: `npx playwright test tests/e2e/navigation.spec.ts tests/e2e/mission.spec.ts tests/e2e/progress-v2.spec.ts`
Expected: PASS at every viewport and motion setting.

```bash
git add src/styles.css src/styles tests/e2e CHANGELOG.md
git commit -m "feat: apply balanced science adventure design"
git push origin main
```

### Task 12: Legacy cleanup, documentation, release, and deployment

**Files:**
- Delete after replacement verification: `src/components/MathModal.tsx`, `src/components/AssessmentCard.tsx`
- Modify: `src/App.tsx`, `tests/e2e/learning.spec.ts`, `tests/e2e/release.spec.ts`
- Modify: `README.md`, `docs/ARCHITECTURE.md`, `docs/AUTHORING.md`, `docs/CURRICULUM.md`, `docs/IMPLEMENTATION.md`, `docs/SCIENTIFIC_VALIDATION.md`, `docs/SOURCES.md`, `CHANGELOG.md`

**Interfaces:**
- Produces the final application with no imports of retired shell components.
- Preserves import/export and scientific documentation.

- [x] **Step 1: Replace release browser tests**

Cover: first visit Explore; open Quantum; finish its first mission with expanded math; earn XP once; replay without duplicate XP; view path and Progress; switch to Foundations; migrate version-1 progress; force a 3D failure; export version 2; recover from an unknown route; reload at the Pages subpath.

- [x] **Step 2: Verify old assumptions fail**

Run: `npm run test:e2e`
Expected before cleanup: FAIL where legacy tests expect Laboratory, Curriculum, Math tabs, or 24 cards on one page.

- [x] **Step 3: Remove retired UI**

Remove the old sidebar, four-item navigation, lesson tabs, math modal, and legacy Progress screen only after replacements pass. Keep reusable Equation and math visual logic.

- [x] **Step 4: Update guides**

Document mission authoring, 14 courses, layered math, science-status labels, progress v2, model registration, fallback behavior, and static deployment. State that Foundations is complete and other courses are starter paths.

- [x] **Step 5: Run clean-install verification**

```bash
npm ci
npm audit --omit=dev
npm run check
npm run test:e2e
```

Expected: zero production dependency vulnerabilities; all type, lint, unit, content, and scientific checks pass; all Chromium journeys pass; Vite emits `dist/index.html`.

- [x] **Step 6: Run exact Pages-subpath smoke**

Serve `dist` at `/Physics-Teacher-Interactive/`. Open `#/mission/quantum/quantum-light-quanta`, wait for heading and simulation, expand math, reload, and assert no console errors or failed chunks.

- [x] **Step 7: Review and release**

Run `git diff --check`, inspect every tracked/untracked file, request code review, fix all Important findings, rerun affected checks, and complete the 0.2.0 changelog.

```bash
git add .
git commit -m "feat: release gamified multi-course physics adventure"
git push origin main
```

- [x] **Step 8: Verify Actions and live Pages**

Wait for CI and Deploy Pages on the exact SHA. Inspect job steps and logs on failure. Verify the live URL loads Explore, Quantum, a mission, its lazy simulation chunk, and refresh-safe routing.

- [x] **Step 9: Give account architecture advice without implementing it**

Research current official documentation and prices. Explain practical SSO/registration providers, per-user progress storage, database, hosting, observability, backups, privacy duties, and realistic monthly cost bands. Create no cloud account, credential, backend, analytics, or paid resource.
