# Curriculum

The first release is one complete foundations course. Its 24 lessons are arranged as eight three-lesson families, each paired with an experiment family.

| Family | Lessons | Experiment focus |
| --- | --- | --- |
| Measurement | Physical quantities and scale; SI units and conversion; measurement and uncertainty | repeated measurements and uncertainty |
| Vectors | Coordinates and direction; vector components; vector addition | component and resultant construction |
| Motion | Velocity; acceleration; projectile motion | two-dimensional kinematics |
| Forces | Inertia and free-body reasoning; net force; friction | forces and acceleration |
| Energy | Work; kinetic and potential energy; conservation of mechanical energy | energy transfer and conservation |
| Collisions | Momentum; impulse; collisions | one-dimensional collision outcomes |
| Gravity | Circular motion; universal gravitation; orbits | central-force motion |
| Oscillations | Hooke's law; spring motion; pendulum motion | periodic systems |

Every lesson follows the same learning cycle: predict, manipulate the experiment, inspect numerical evidence, connect the evidence to an equation, study a worked example, and complete three assessments. The three assessments separately test a concept, a calculation, and interpretation of experiment evidence.

## Mathematics path

The released math library supplies arithmetic, signed numbers, fractions, decimals, ratios, scientific notation, powers, algebra, coordinates, functions, geometry, trigonometry, vectors, rates, accumulation, sine, and uncertainty. Each tutorial provides an explanation, equation, worked example, interactive or stepwise exercise, and assessment.

Prerequisites must be closed and acyclic. Lesson authors may point to earlier physics lessons and available math tutorial IDs only. A validation failure means the dependent lesson is not publishable.

## Readiness routes

Learners may start from the beginning, search for a topic, or open a later lesson and follow its prerequisite guidance. Progress is guidance rather than a lock: the application identifies missing preparation without hiding the course. Completion and assessment results are stored locally and can be exported and imported.

## Deeper courses planned

Full courses beyond the five-mission starter paths below remain roadmap items and must be labeled **Planned**:

- extended classical treatments of rotation, fluids, waves, thermal physics, electricity, magnetism, and optics;
- full modern-physics courses beyond the bounded relativity, quantum, atomic/nuclear/particle, condensed-matter, astrophysics, and cosmology starters;
- selected graduate treatments and sourced surveys of active research or theoretical proposals.

Mathematics expands alongside each release. Planned and theoretical material does not count toward the released foundations course and must not be described as experimentally established when it is not.

## Open starter-course catalog

The approved multi-course redesign now has authored catalog content for **14 open courses, 89 normal missions, and 13 checkpoints**: the 24-mission complete Foundations path plus thirteen five-mission starters. Task 6 supplies the data contracts and content; the new Explore, Course Path, and Mission screens are subsequent implementation tasks. The current legacy interface remains the Foundations release until that integration is completed.

Every starter is directly addressable in `courseCatalog`, without completion gates or required earlier courses. Quantum begins at `quantum / quantum-light-quanta`. Checkpoint badges require all five normal missions, but course access and mission lookup remain open. Deeper treatments beyond these bounded starters are planned.

| Course | Exact five-mission path | Registered lab |
| --- | --- | --- |
| Classical Mechanics | Frames and motion; Force diagrams; Rotation; Fluids and pressure; Chaos and limits | motion, forces, vectors, oscillations |
| Waves and Sound | Oscillation; Traveling waves; Superposition; Resonance; Sound and spectra | waves |
| Thermodynamics | Microscopic temperature; Ideal gas; First law; Entropy; Engines and limits | thermal |
| Electromagnetism | Charge and field; Potential; Current; Magnetic force; Maxwell's synthesis | electromagnetism |
| Optics | Reflection; Refraction; Lenses; Interference; Photons and imaging | optics |
| Relativity | Events and frames; Light-clock dilation; Length and simultaneity; Energy-momentum; Curved spacetime | relativity |
| Quantum Physics | Light quanta; Build a wavefunction; Measurement probabilities; Uncertainty; Tunneling | quantum |
| Atomic and Molecular | Spectra; Bohr scale; Orbitals; Bonds; Lasers | atomic |
| Nuclear Physics | Binding; Decay; Half-life; Fission; Fusion | nuclear |
| Particle Physics | Relativistic particles; Quantum fields; Symmetries; Standard Model; Neutrinos and open questions | particle |
| Condensed Matter | Lattices; Bands; Fermi statistics; Semiconductors; Superconductivity | condensed |
| Astrophysics | Stellar light; Hydrostatic balance; Fusion; Stellar evolution; Compact objects | astrophysics |
| Cosmology and Frontiers | Expansion; Cosmic background; Dark matter evidence; Dark energy evidence; Tested knowledge versus proposals | cosmology |

Each normal starter mission has seven steps: observe, predict, simulate, explain, layered math, check, and recap. Two authored concept assessments and one authored calculation provide three scored checks. Each course ends with a four-step checkpoint that revisits three distinct mission checks. Normal missions award 60 XP and checkpoints 100 XP through the existing one-time reward contracts.

Expanded math defines the mission's notation and operations, works its own example, and links to one relevant foundational math tutorial with a return target. Those tutorials retain their existing closed, acyclic prerequisite chain. New operations such as logarithms, exponentials, summation, and inequalities are introduced locally; full calculus, complex-amplitude dynamics, field theory, and stellar-structure solvers are explicitly outside the starter scope.

A registered simulation is not a claim to model every topic in a course. Every lab prompt states its actual calculation or a bounded comparison, and explains absent physics when using an analogy. For example, the electrostatic lab cannot calculate current or magnetic force, and the decay lab cannot predict fission multiplication or fusion rates. Model controls, equations, and limits are documented in [the physics registry guide](../src/physics/README.md).

The editorial review snapshot is 2026-09-09. Quantum predictive formalism is established; the measurement lesson explicitly labels collapse/many-worlds narratives as interpretation. Neutrino mass mechanisms and the identities/causes behind dark-matter and dark-energy evidence are active research, while their measured evidence is described separately. String theory, loop quantum gravity, and multiverse scenarios are explicitly speculative in the final frontier mission. The course does not imply that matching one datum confirms such a framework.
