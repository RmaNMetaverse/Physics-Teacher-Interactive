# Curriculum sources and editorial scope

The released foundations course contains 24 original physics lessons and 17 original mathematics tutorials. The review date is **2026-09-09**. This is an editorial cutoff for this release, not a claim that all research published by that date has been surveyed.

The explanations, questions, numerical examples, hints, and laboratory instructions were written for this application. They do not reproduce textbook passages, illustrations, or end-of-chapter exercises. Each physics lesson provides a direct further-reading link to a consulted primary educational reference: **OpenStax, University Physics Volume 1**, by Samuel J. Ling, Jeff Sanny, and William Moebs. Section availability and attribution were checked on the review date. Source licensing and attribution terms are available on the linked pages; linking a source does not relicense its content as part of this repository.

## Lesson reference map

| Lesson | Consulted OpenStax section |
| --- | --- |
| Physical quantities and scale | [1.2 Units and Standards](https://openstax.org/books/university-physics-volume-1/pages/1-2-units-and-standards) |
| Unit conversion | [1.3 Unit Conversion](https://openstax.org/books/university-physics-volume-1/pages/1-3-unit-conversion) |
| Measurement and uncertainty | [1.6 Significant Figures](https://openstax.org/books/university-physics-volume-1/pages/1-6-significant-figures) |
| Coordinates and displacement | [2.1 Scalars and Vectors](https://openstax.org/books/university-physics-volume-1/pages/2-1-scalars-and-vectors) |
| Vector components | [2.2 Coordinate Systems and Components of a Vector](https://openstax.org/books/university-physics-volume-1/pages/2-2-coordinate-systems-and-components-of-a-vector) |
| Vector addition | [2.3 Algebra of Vectors](https://openstax.org/books/university-physics-volume-1/pages/2-3-algebra-of-vectors) |
| Constant velocity | [3.1 Position, Displacement, and Average Velocity](https://openstax.org/books/university-physics-volume-1/pages/3-1-position-displacement-and-average-velocity) |
| Constant acceleration | [3.4 Motion with Constant Acceleration](https://openstax.org/books/university-physics-volume-1/pages/3-4-motion-with-constant-acceleration) |
| Projectile motion | [4.3 Projectile Motion](https://openstax.org/books/university-physics-volume-1/pages/4-3-projectile-motion) |
| Inertia | [5.2 Newton’s First Law](https://openstax.org/books/university-physics-volume-1/pages/5-2-newtons-first-law) |
| Net force | [5.3 Newton’s Second Law](https://openstax.org/books/university-physics-volume-1/pages/5-3-newtons-second-law) |
| Friction | [6.2 Friction](https://openstax.org/books/university-physics-volume-1/pages/6-2-friction) |
| Work | [7.1 Work](https://openstax.org/books/university-physics-volume-1/pages/7-1-work) |
| Kinetic energy | [7.2 Kinetic Energy](https://openstax.org/books/university-physics-volume-1/pages/7-2-kinetic-energy) |
| Energy conservation | [8.3 Conservation of Energy](https://openstax.org/books/university-physics-volume-1/pages/8-3-conservation-of-energy) |
| Momentum | [9.1 Linear Momentum](https://openstax.org/books/university-physics-volume-1/pages/9-1-linear-momentum) |
| Impulse | [9.2 Impulse and Collisions](https://openstax.org/books/university-physics-volume-1/pages/9-2-impulse-and-collisions) |
| Collision types | [9.4 Types of Collisions](https://openstax.org/books/university-physics-volume-1/pages/9-4-types-of-collisions) |
| Circular motion | [6.3 Centripetal Force](https://openstax.org/books/university-physics-volume-1/pages/6-3-centripetal-force) |
| Universal gravitation | [13.1 Newton’s Law of Universal Gravitation](https://openstax.org/books/university-physics-volume-1/pages/13-1-newtons-law-of-universal-gravitation) |
| Orbits | [13.4 Satellite Orbits and Energy](https://openstax.org/books/university-physics-volume-1/pages/13-4-satellite-orbits-and-energy) |
| Hooke’s law | [15.2 Energy in Simple Harmonic Motion](https://openstax.org/books/university-physics-volume-1/pages/15-2-energy-in-simple-harmonic-motion) |
| Spring period | [15.1 Simple Harmonic Motion](https://openstax.org/books/university-physics-volume-1/pages/15-1-simple-harmonic-motion) |
| Pendulum | [15.4 Pendulums](https://openstax.org/books/university-physics-volume-1/pages/15-4-pendulums) |

## Scientific boundaries

- The uncertainty scene uses stated intervals, without a probability distribution or simulated instrument noise.
- Vectors use a flat Cartesian plane. Kinematic trajectories use prescribed constant acceleration or uniform gravity without air resistance.
- The incline models use equal static and kinetic friction coefficients. Real contact can have unequal, variable coefficients and stick-slip behavior.
- Energy accounts include translational kinetic energy, gravitational potential, and aggregate thermal transfer. They do not calculate temperatures or rotation.
- Collisions are instantaneous and one dimensional. Restitution is prescribed. Impulse is available, but a contact-force history or peak force is not.
- Orbits use Newtonian gravity around a fixed point mass with a tangential initial velocity. Markers have illustrative sizes; no physical surface, atmosphere, central recoil, or relativistic effect is modeled.
- Springs are linear, massless, and undamped. Pendulums use the small-angle equation and a consistent quadratic energy approximation, with angle controls limited to 15 degrees.
- Advanced classical physics, modern physics, graduate topics, and frontier surveys are planned. They are not presented as released instruction or as verified simulations in this course.

## Curriculum validation

The content test suite verifies 24 lessons across eight families; three assessment kinds per lesson; 17 available math topics; closed acyclic prerequisite references; finite answer keys; equation rendering with KaTeX in strict error mode; valid unmodified simulation presets; UTF-8 replacement-character absence; and all 24 experiment answer keys against their corresponding model observations or specified comparison ratios. Analytical reference fixtures separately check representative scientific calculations. A browser review is still necessary for visual and interaction quality and is handled in the release verification workflow.