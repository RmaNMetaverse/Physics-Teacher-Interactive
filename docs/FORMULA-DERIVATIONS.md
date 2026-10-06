# Formula teaching

Every released mission equation and prerequisite math tutorial has a companion entry in `src/learning/formula-reasoning.ts` or `src/learning/starter-formula-reasoning.ts`. A lesson names its starting assumption or definition, walks through the mathematical steps, and only then displays the compact equation. Harder ideas have an expandable explanation.

Physics is empirical. Algebra cannot prove Coulomb's law, the Born rule, Hooke's law, or a material coefficient from nothing. The app identifies such laws and model assumptions as starting points, then derives the displayed consequences under their stated conditions. Approximations such as no-drag projectile range, thin lenses, the small-angle pendulum, and two-state neutrino oscillation explicitly state their limits.

For example, the projectile lesson resolves the initial speed into perpendicular components, applies constant-acceleration motion on a shared time axis, solves the equal-height landing equation for its nonzero root, and substitutes that time into horizontal displacement. The double-angle identity shortens the final expression. Initial height above the landing level requires solving the full vertical quadratic instead.

New published missions must have a matching derivation entry. `tests/formula-reasoning.test.tsx` checks published curriculum coverage; `tests/e2e/mission.spec.ts` checks that the reasoning appears before the equation and stays usable at phone, tablet, and desktop widths.

## Optional detailed proofs

All 99 published missions and 17 math tutorials also have an authored entry in `src/learning/detailed-formula-proofs.ts`, backed by the Foundations and starter proof modules. The **Detailed proof, step by step** disclosure is collapsed by default in Explain, Math, optional refresher, and Deep Dive views. It has no quiz or completion requirement. Its equations render only when expanded; long expressions use the same accessible horizontal viewport as other formulas.

Each entry states a starting point, at least three intermediate steps, and the assumptions or limits of the conclusion. Calculus, operator algebra, and statistical arguments are included where needed. Technical models begin from explicitly named physical postulates or model equations: this does not claim that empirical laws or a complete interacting quantum-field theory can be proved from arithmetic alone.

Advanced derivations link primary teaching references, including [OpenStax kinetic theory](https://openstax.org/books/university-physics-volume-2/pages/2-2-pressure-temperature-and-rms-speed), [OpenStax Maxwell equations](https://openstax.org/books/university-physics-volume-2/pages/16-1-maxwells-equations-and-electromagnetic-waves), [Rutgers BCS notes](https://www.physics.rutgers.edu/grad/621/lectures/L20_BCS_Path_Integral.pdf), and [Sean Carroll’s Schwarzschild derivation](https://ned.ipac.caltech.edu/level5/March01/Carroll3/Carroll7.html). Mission source lists remain available in Deep Dive.

New formula entries must include a corresponding detailed proof. Tests check complete coverage and KaTeX validity, while browser checks verify disclosure with Enter/Space and layout from 280px through desktop.
