# Formula teaching

Every released mission equation and prerequisite math tutorial has a companion entry in `src/learning/formula-reasoning.ts` or `src/learning/starter-formula-reasoning.ts`. A lesson names its starting assumption or definition, walks through the mathematical steps, and only then displays the compact equation. Harder ideas have an expandable explanation.

Physics is empirical. Algebra cannot prove Coulomb's law, the Born rule, Hooke's law, or a material coefficient from nothing. The app identifies such laws and model assumptions as starting points, then derives the displayed consequences under their stated conditions. Approximations such as no-drag projectile range, thin lenses, the small-angle pendulum, and two-state neutrino oscillation explicitly state their limits.

For example, the projectile lesson resolves the initial speed into perpendicular components, applies constant-acceleration motion on a shared time axis, solves the equal-height landing equation for its nonzero root, and substitutes that time into horizontal displacement. The double-angle identity shortens the final expression. Initial height above the landing level requires solving the full vertical quadratic instead.

New published missions must have a matching derivation entry. `tests/formula-reasoning.test.tsx` checks published curriculum coverage; `tests/e2e/mission.spec.ts` checks that the reasoning appears before the equation and stays usable at phone, tablet, and desktop widths.
