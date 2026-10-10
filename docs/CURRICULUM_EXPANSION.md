# Expanded curriculum delivery ledger

The approved target is a self-contained path from basic mathematics through the unique material in Susskind's core, supplemental, and archived Stanford courses. Existing five-mission advanced starters do **not** satisfy this target. This document distinguishes implemented infrastructure from reviewed instructional coverage.

## First implementation increment

- Branch: `codex/complete-physics-curriculum`.
- Math Workspace: Explore entry and lesson formula handoff; MathLive entry, supported Compute Engine calculations in cancellable workers, JSXGraph function/parametric/polar/implicit/region plots, one parameter slider, accessible coordinate samples, linear/quadratic/log-linear exponential fits and residuals, notebook/CSV/SVG/PNG exports.
- Locally bundled fonts and libraries; workspace code loads on demand. Graph calculations start near the viewport and stop when it leaves. Input size, AST depth, graph sampling, notebook size and worker time are bounded, with at most two calculation workers running across a notebook. Learner expressions are interpreted through an operator allowlist, never passed to JSXGraph's scripting parser or compiled as JavaScript.
- Version-1 notebooks persist in IndexedDB independently of legacy progress. Manual signed-in notebook synchronization uses separate rows, revision-checked writes and recoverable conflict copies. It requires the new SQL migration; production database installation and live multi-account verification remain pending.
- The 99 existing mission introductions now use their authored summaries. Complete explanations are expandable in the Explain step, without automatic sentence truncation.
- The nine measurement/vector/motion lessons have additional contrasting worked examples and misconception explanations. Existing mission IDs, URLs, completion, XP, badges and streaks are unchanged. The new supplementary objective identifiers do not award completion credit.
- New content contracts and validation cover objective prerequisite closure/cycles, notation/units, derivations, two worked examples, three assessment kinds and practice variants, experiment correspondence and reciprocal lecture mappings. These are expansion contracts; the old starter catalog has **not** been certified against the expanded standard.

## Source inventory and unresolved review

`src/learning/sources/stanford-manifest.json` inventories 21 official course editions: six core, nine supplemental, six archived; 193 lecture records. `scripts/index-stanford.py` refreshes public metadata from The Theoretical Minimum. The script handles renamed course slugs and keeps video/URL lecture numbering rather than silently renumbering gaps.

Known gaps: the official 2007 Relativity index omits lecture number 3; the 2011 Cosmology and Black Holes index starts with a URL and video labeled lecture 2 even though the list displays it first. These gaps are explicitly recorded. Older YouTube playlist URLs and video ownership still need reconciliation with the Stanford channel. Some lectures have generic titles that provide no sufficient topic inventory.

All current records are **indexed**, not content-reviewed or covered. Objective mappings, derivation inventories, verified timestamps and archive deduplication require actual lecture review. An empty mapping is an unresolved item, never implicit coverage. Do not edit generated metadata to pretend review occurred; keep authored lecture review records separately when implementing the next increment.

Foundational source review also remains incomplete: The Physics Classroom tutorial blocks automated page access with HTTP 403, and the Khan physics landing page does not expose its full lesson inventory in the fetched HTML. Review accessible official course pages and the current Khan course successors before declaring these sources exhausted. Existing OpenStax citations continue to support the released foundations.

## Remaining acceptance work

| Stage | Remaining delivery |
| --- | --- |
| 1 | Full topic/derivation manifests and mappings; objective-level foundation assessment variants and investigation completion; expression-domain grading; workspace capabilities below. |
| 2 | Substantive force, energy, momentum, rotation and gravity units; supporting calculus; distinct pulley, lever and rotating-body investigations. |
| 3 | Complete fluids, thermal, oscillation, wave and sound units; fluid columns, buoyancy, pistons, resonance and standing-wave experiments. |
| 4 | Electricity, magnetism, induction, circuits and optics; field maps, ray tracing and interference; applied electronics prerequisite integration. |
| 5 | Modern physics and the advanced math bridge: complex numbers, linear algebra, probability, calculus, differential equations, Fourier methods, variation, tensors, geometry and groups. |
| 6 | Analytical mechanics, quantum mechanics, entanglement and statistical mechanics; action comparisons, phase portraits, spin experiments and ensembles. |
| 7 | Relativistic dynamics/fields, GR and cosmology; spacetime, geodesics and expansion models with explicit assumptions. |
| 8 | Remaining verified advanced quantum, particle, gauge/Higgs, unification, supersymmetry, string, black-hole and holography material; current-source review of dated claims and clear labels for unconfirmed proposals. |

Workspace follow-through: multiple curves on one board, piecewise entry, trace/root/intersection tools, tangents/derivative overlays/integral shading, logarithmic axes, additional sliders, substitution, small systems/matrix/eigenvalue helpers, numerical definite integrals and bounded differential equations. Current graph domains must be inspected around discontinuities; sampled agreement is never used to prove equivalence. A supported input parser is not a general proof system.

Before each curriculum release: verify scientific reference cases, singularities and conservation; complete mobile/tablet/desktop and fallback journeys; test progress migration for newly split objectives; run `npm run check` and browser tests; update this ledger and the changelog, commit/push, and confirm CI and Pages for the released commit. Do not call the full curriculum complete until every unique topic in the reviewed source manifest has in-app preparation, teaching and assessment.

## Notebook database setup

Run `supabase/migrations/202610100001_math_notebooks.sql` once in the Supabase SQL editor. It creates a separate table and a revision-checked function. The function verifies `auth.uid()` against the caller's owner ID; clients can only read their own rows and cannot bypass revision checks with a direct table write. No service-role key belongs in the frontend.

Signed-in learners use **Sync notebook & fetch cloud notebooks** for each notebook before switching devices. Local notebooks remain available without accounts or this migration. A conflict retains the cloud version under the original ID and saves the local version as a distinct recovered notebook. Notebook imports create a new ID and never import account or synchronization metadata. Live database/RLS verification is required before treating cloud notebook sync as production-verified.
