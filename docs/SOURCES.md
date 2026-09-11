# Curriculum sources and editorial scope

Physics Teacher Interactive contains 14 open courses: the complete 24-mission Foundations course, thirteen five-mission starter courses, thirteen culminating checkpoints (102 missions total), and 17 layered mathematics tutorials. The review date is **2026-09-09**, and the comprehensive source link and reference validation audit was completed on **2026-09-11**. This defines the editorial cutoff for this release, not a claim that all research published by that date has been surveyed.

The explanations, questions, numerical examples, hints, and laboratory instructions were written for this application. They do not reproduce textbook passages, illustrations, or end-of-chapter exercises. Each physics mission provides direct further-reading links to consulted primary educational references: OpenStax (*University Physics Volumes 1, 2, and 3*, *Astronomy 2e*), CERN educational publications, NASA astrophysics databases, ESA Planck mission portals, and the Max Planck Institute Einstein Online repository. Section availability and attribution were audited on the review date; linking a source does not relicense its content as part of this repository.

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
- Thirteen bounded starter packs now accompany the complete Foundations catalog. Full advanced courses remain planned. The starter references and model boundaries below distinguish implemented calculations from conceptual comparisons and speculative proposals.

## Curriculum validation

The content test suite verifies 24 lessons across eight families; three assessment kinds per lesson; 17 available math topics; closed acyclic prerequisite references; finite answer keys; equation rendering with KaTeX in strict error mode; valid unmodified simulation presets; UTF-8 replacement-character absence; and all 24 experiment answer keys against their corresponding model observations or specified comparison ratios. Analytical reference fixtures separately check representative scientific calculations. A browser review is still necessary for visual and interaction quality and is handled in the release verification workflow.

## Starter-course references and scientific review

All starter explanations, numerical examples, questions, and lab tasks are original. References establish scientific context rather than supply copied lesson prose. The editorial content snapshot is **2026-09-09**; the source-link availability audit was performed during implementation on **2026-09-11**. Each course and mission carries its source URLs, evidence status, and limitations in `src/learning/courses/`.

| Starter | Authoritative reference coverage |
| --- | --- |
| Classical Mechanics | OpenStax University Physics 1: relative motion §4.5, torque §10.6, hydrostatics §14.1, harmonic motion §15.1. The error-doubling example is explicitly illustrative, not a chaos solver. |
| Waves and Sound | OpenStax University Physics 1: oscillations §15.1, traveling waves §16.2, interference §16.5, sound intensity §17.3. |
| Thermodynamics | OpenStax University Physics 2: ideal-gas molecular model §2.1, first law §3.3, Carnot bound §4.5, entropy §4.6. |
| Electromagnetism | OpenStax University Physics 2: fields §5.4, potential §7.2, magnetic motion §11.3, Maxwell synthesis §16.1. |
| Optics | OpenStax University Physics 3: reflection §1.2, refraction §1.3, thin lenses §2.4, interference §3.1; photon energy is also covered in the quantum references. |
| Relativity | OpenStax University Physics 3: frame invariance §5.1, dilation §5.3, length §5.4; University Physics 1: general relativity §13.7. |
| Quantum Physics | OpenStax University Physics 3: photoelectric effect §6.2, wavefunctions §7.1, uncertainty §7.2, tunneling §7.6. |
| Atomic and Molecular | OpenStax University Physics 3: Bohr scale §6.4, hydrogen states §8.1, spectra §8.5, lasers §8.6, molecular bonds §9.1. |
| Nuclear Physics | OpenStax University Physics 3: binding §10.2, decay §10.3, fission §10.5, fusion §10.6. |
| Particle Physics | OpenStax University Physics 3: relativistic energy §5.9 and conservation §11.2; [CERN Standard Model](https://home.web.cern.ch/science/physics/standard-model/) and [CERN neutrino lectures](https://e-publishing.cern.ch/index.php/CYR/article/view/434). |
| Condensed Matter | OpenStax University Physics 3: crystals §9.3, free electrons §9.4, bands §9.5, devices §9.7, superconductivity §9.8. |
| Astrophysics | OpenStax Astronomy 2e: radiation §5.2, solar structure §16.3, stellar evolution §22.1; University Physics 1: relativistic gravity §13.7. |
| Cosmology and Frontiers | OpenStax University Physics 3 §11.6; [NASA dark-matter evidence](https://science.nasa.gov/dark-matter/), [NASA expansion-history evidence](https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-dark-energy/), [ESA Planck background radiation](https://www.esa.int/Science_Exploration/Space_Science/Planck/Planck_and_the_cosmic_microwave_background), and [Max Planck Institute Einstein Online quantum-gravity spotlights](https://www.einstein-online.info/en/complete_spotlights/). |

### Limits that accompany the starters

- Every starter includes at least two distinct authoritative reference pages. Course-level references accompany each mission; they provide a topic map rather than imply that every page supports every sentence.
- The 12 new models remain the bounded models documented in [src/physics/README.md](../src/physics/README.md). A conceptual mission may use a comparison with its course lab, but its prompt must say what that lab does not calculate.
- Quantum position-bin probabilities are normalized and dimensionless. Probability density has inverse-length units, and amplitude has inverse-square-root-length units in one dimension. The model supplies no unique phase or momentum distribution. Predictive formalism is established; measurement narratives are labeled interpretation.
- Rectangular-barrier transmission is a leading exponential estimate, with no matching prefactor. At/above the barrier the model's T=1 is a classical approximation, not exact quantum transmission. The Gaussian and barrier are separate examples.
- Entropy Qrev/T is restricted to a reversible constant-temperature reference process. Carnot efficiency is a reversible bound between two reservoirs, not a real engine prediction.
- Hydrogen levels do not represent literal electron orbits. Molecular and laser examples are conceptual; the level model predicts neither bond potentials nor optical gain.
- Nuclear count curves are expectations, not individual events. Reaction-energy bookkeeping does not provide reaction rates, neutron multiplication, or radiation effects.
- Fermi occupancy is conditional on an available state; it does not supply a density of states, conductivity, or superconducting transition. The BCS 1.76 gap ratio is expressly limited to the conventional weak-coupling regime.
- Stellar blackbody luminosity does not solve stellar structure or evolution. The Schwarzschild radius is for a nonrotating uncharged black hole, and its event horizon is not the emitting stellar surface modeled by the lab.
- Hubble recession is distinguished from orbital velocity and expansion acceleration. Inverse Hubble rate is a timescale, not a measured age. Dark-matter identity and dark-energy cause remain active research.
- String theory, loop quantum gravity, and multiverse scenarios are speculative here. The hypothetical residual exercise is neither observational evidence for them nor a discovery significance calculation.

`tests/starter-courses.test.ts` verifies exact paths, counts, checkpoints, original distinct explanations, three scored assessments per normal mission, valid unmodified model presets, finite observations, layered math return links, review dates, and scientific-status boundaries. Existing catalog and content suites validate source syntax, equation rendering, and the closed prerequisite graph. Source URLs were additionally checked for live HTTP success; that check is an authoring audit rather than a network-dependent unit test.

Scientific grading uses an explicit relative tolerance of 1.5% for starter calculations (with a negligible 1e-40 absolute guard at zero). The shared numeric checker scales its floating-point allowance to answer magnitude, so zero does not pass tiny nonzero SI answers. Regression tests check both a photon-energy example and every authored starter answer against meaningfully incorrect alternatives.
