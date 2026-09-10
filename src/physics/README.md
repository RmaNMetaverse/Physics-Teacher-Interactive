# Physics models

All exports in `index.ts` are independent of React, Three.js, the browser, and mutable simulation clocks. Positions and body radii are meters, velocities are meters per second, time is seconds, mass is kilograms. Coordinates use +x right, +y up, z=0. Renderers may transform these coordinates; observations remain physical values. The gravity marker radii are explicitly illustrative.

## API and validation

- `simulations[family]` supplies controls, duration and `evaluate(parameters, time)`.
- `defaults(family)` returns a new parameter object.
- `sanitizeParameters(family, parameters)` discards unknown keys, substitutes defaults for missing/non-finite values and clamps finite inputs to the documented control interval. The integer `mode` is rounded; continuous physical quantities are not quantized to slider steps.
- `evaluate(family, parameters, time)` and the definition evaluator apply the same validation. Negative finite times clamp to zero; NaN and infinities reset to zero; finite times beyond the duration clamp to the duration.
- Ground impact can end motion/energy earlier. Those states freeze at the event time and retain the velocity immediately before impact. No impact/bounce model is implied. At the configured duration, other models return `ended: true`.
- Inputs and outputs are ordinary data. Each evaluation depends only on its arguments, so reset, seeking, playback speed, table output and graph sampling use the same calculations.

## Models and approximation limits

| Family | Governing model | Boundary and limitations |
| --- | --- | --- |
| Measurement | Converted value and uncertainty multiply by the same scale; relative uncertainty is 100δL/L. | Positive measured length; uncertainty is a stated absolute interval estimate without an assumed probability distribution. 100 display units per meter means centimeters. |
| Vectors | A=(A cos θ,A sin θ), R=A+B. | Cartesian planar displacement vectors; degree controls are converted to radians internally. The origin, A endpoint, and resultant endpoint support head-to-tail display. |
| Motion | x=v₀ₓt+at²/2; y=h+v₀ᵧt−gt²/2. | Modes 0 velocity, 1 horizontal constant acceleration, 2 drop from rest, 3 projectile. Only modes 2–3 include vertical gravity. No drag, spin or bounce; first ground contact solved analytically. |
| Forces | N=mg cos θ; driving force=F+mg sin θ. Friction balances drive up to μN, then opposes incipient motion with magnitude μN. | Starts from rest on unlimited incline, force parallel to slope. Equal static and kinetic coefficients are an explicit simplification. Negative applied forces and up-slope motion are supported. |
| Energy | Along-slope a=max(0,g(sin θ−μ cos θ)); K=mv²/2, U=mgh, thermal=μmg cos θ·s. | Released from rest, no rolling; same static/kinetic coefficient. Ground state is immediately before impact. At 90° this reduces to free fall. |
| Collisions | Analytic contact time from center separation 6 m minus combined radius .6 m. Post-impact velocities solve momentum conservation and v₂′−v₁′=e(v₁−v₂). | One-dimensional, isolated, instantaneous contact. Coefficient e from 0 to 1; 0 sticks, 1 conserves kinetic energy. Separating or equally moving bodies never collide. Impulse is the change in momentum of A. |
| Gravity | Fixed central point mass μ=GM, tangential initial speed q√(μ/r₀), a=r₀/(2−q²), e=abs(q²−1). | q=.75–1.2 restricts the model to well-conditioned ellipses with e≤.44. No physical collision surface, atmosphere, other bodies, finite central-body recoil or relativistic effects. |
| Oscillations | Spring x=A cos(√(k/m)t). Pendulum arc displacement s=Lθ₀ cos(√(g/L)t). | Undamped, released from rest. Pendulum uses sin θ≈θ and angles ≤15°; the bob is positioned on the circular string geometry, but potential energy consistently uses mg s²/(2L), not the exact nonlinear pendulum energy. |

Gravity solves Kepler's equation E−e sin E=M by 12 Newton iterations from M. The closed ellipse and analytic derivative supply positions and velocities, so there is no accumulated time-stepping drift. Starting anomaly is 0 for an initial periapsis (q≥1) and π for an initial apoapsis (q<1); coordinates are rotated to start on +x moving toward +y. The gravitational constant is 6.67430×10⁻¹¹ m³ kg⁻¹ s⁻². Central mass defaults to 5.972×10²⁴ kg, without claiming that the point-mass marker is a solid Earth surface.

## Verification and sources

`tests/physics.test.ts` uses independent hand-calculated examples, mass-independent free fall, static friction balance, work/energy accounting, equal/unequal-mass collisions, non-collision motion, orbit energy/angular momentum, spring quarter-period behavior, pendulum geometry and time/input boundary checks. Tests were observed failing against unimplemented models before implementation.

Authoring references reviewed 2026-09-09:

- [OpenStax: conservation of energy](https://openstax.org/books/university-physics-volume-1/pages/8-3-conservation-of-energy)
- [OpenStax: conservation of linear momentum](https://openstax.org/books/university-physics-volume-1/pages/9-3-conservation-of-linear-momentum)
- [OpenStax: Kepler's laws](https://openstax.org/books/university-physics-volume-1/pages/13-5-keplers-laws-of-planetary-motion)

These sources establish the conservation laws and orbital assumptions; all code, explanations and tests here are original. Lesson-specific references supply the broader teaching context.

## Scene sampling

`sampleTrajectory(family, parameters)` from `scene.ts` returns `{points, bounds: {min, max}, duration}` in SI units. It samples 120 equal time intervals through the available physical duration, uses the exact terminal event time for ground impact, and uses one orbital period up to the gravity duration limit. Its primary path follows the first non-origin, non-central body; measurement and vectors instead return their static endpoints. Bounds include all sampled bodies (including both collision bodies), their radii and the origin. Every axis receives at least a 1 m extent so stationary scenes have usable camera bounds. These are bounds on sampled states, not a mathematical guarantee covering every point between samples; the rendering camera should retain ordinary framing padding.

Measurement observations include the symmetric SI interval `lowerBound = length − uncertainty` and `upperBound = length + uncertainty`; converting the display scale leaves those SI bounds unchanged. A large uncertainty may cross zero because the displayed interval is not silently truncated; it then includes nonphysical candidate lengths and signals that the estimate is too imprecise near the length boundary.

Additional sources reviewed 2026-09-09:

- [OpenStax: measurement uncertainty](https://openstax.org/books/college-physics/pages/1-3-accuracy-precision-and-significant-figures) supports expressing uncertainty as an absolute interval and as a percentage of the measured value.
- [OpenStax: pendulums](https://openstax.org/books/university-physics-volume-1/pages/15-4-pendulums) supplies the small-angle simple-pendulum model and its length/gravity dependence.

The finite-input audit exercises every minimum/maximum control combination in every family at initial, midpoint and terminal time, checking all observations, positions, velocities and radii. The trajectory tests cover exact projectile landing, circular closure, long-period truncation, static vector endpoints, collision framing and nondegenerate bounds.

## Expanded model API

`catalog.ts` registers all 20 `ModelId` values (eight legacy families and twelve new modules). `modelCatalog[id]` supplies title, description, controls, duration and the validated evaluator. `evaluateModel(id, input, time)`, `modelDefaults(id)`, and `sanitizeModelParameters(id, input)` share that registry with course validation. Unknown IDs throw `Unknown model`; inherited object names are not valid IDs. Existing `evaluate(family, ...)`, `defaults`, `sanitizeParameters` and `simulations` remain exported unchanged from `legacy.ts` until final migration.

Inputs and observations use SI, except explicitly marked dimensionless counts/ratios and the additional `energyEv` conversion. The new evaluator accepts an unknown input: non-record values, arrays, missing keys, non-number values and non-finite numbers use defaults. Own finite numeric values clamp to their documented interval. Unknown/inherited keys are ignored. Only principal quantum number `n` and legacy `mode` round to integers; slider steps never quantize continuous values. Returned parameter objects, states and probability arrays are independent per call. Models have no random source, mutable clock, browser, renderer or React dependency.

Time is seconds: negative times clamp to zero, non-finite times reset to zero, and times after the model duration clamp to its end. Duration is 60 s for each new model except nuclear (10¹² s). `ended` becomes true at duration. Only waves, relativity's elapsed proper time and nuclear population vary with time; other outputs are static parameter comparisons. Durations are exploration limits, not claims about physical validity. New models expose numerical states with empty `bodies`; dedicated renderers can use observations and quantum probability samples without inventing SI trajectories.

## New controls and equations

Each interval below is inclusive. Values in parentheses are defaults. Numerical bounds protect the finite arithmetic contract; many extreme corners remain mathematical idealizations rather than realistic experimental conditions.

| Model | Parameters, SI units, bounds (default) | Equation and observations |
| --- | --- | --- |
| `waves` | `frequency` Hz [0.01, 1000] (2); `wavelength` m [0.001, 100] (3); `amplitude` m [0, 10] (0.5); `position` m [−100, 100] (0) | v=fλ; y=A sin(2π(x/λ−ft)); ∂y/∂t=−2πfA cos(2π(x/λ−ft)); period=1/f. `speed` is phase speed, not material speed. |
| `thermal` | `amount` mol [0, 100] (1); `temperature` K [1, 10000] (300); `volume` m³ [10⁻⁶, 100] (1) | PV=nRT. `pressure` Pa; `pv` J. |
| `electromagnetism` | `charge` C [−10⁻³, 10⁻³] (10⁻⁹); `distance` m [10⁻⁶, 1000] (1) | E=kq/r²; V=kq/r. `electricField` N/C is positive outward, negative inward; `potential` V has zero at infinity. |
| `optics` | `focalLength` m [0.001, 10] (0.1); `objectDistance` m [0.001, 100] (0.2) | 1/dᵢ=1/f−1/dₒ; magnification=−dᵢ/dₒ. `imageVergence` m⁻¹; signed `imageDistance` m; dimensionless `magnification`. See singularity handling below. |
| `relativity` | `beta` dimensionless [−0.999999, 0.999999] (0.6) | γ=1/√(1−β²), v=βc, proper time=t/γ, parallel length/rest length=1/γ. `speed` is signed velocity in m/s. |
| `quantum` | `sigma` m [10⁻¹², 10⁻⁶] (10⁻⁹); `center` m [−10⁻⁶, 10⁻⁶] (0); `energy` J [0, 10⁻¹⁶] (1.602176634×10⁻¹⁹); `barrierHeight` J [0, 10⁻¹⁶] (3.204353268×10⁻¹⁹); `width` m [0, 10⁻⁶] (10⁻¹⁰) | Gaussian ρ(x)=exp(−(x−center)²/(2σ²))/(σ√(2π)); κ=√(2mₑ(V−E))/ℏ below barrier; T≈exp(−2κa). `kappa` m⁻¹, dimensionless `transmission` and `tunnelingRegime`; `meanPosition`/`sigma` m. |
| `atomic` | `n` integer [1, 100] (2), nearest-integer after clamping | Hydrogen Eₙ=−13.6/n² eV. `energy` J, `energyEv` eV, `ionizationEnergy` J. Input energies are not in eV. |
| `nuclear` | `initial` dimensionless nucleus count [0, 10²⁴] (100); `halfLife` s [10⁻⁶, 10¹²] (2) | N=N₀2^(−t/t_half); λ=ln(2)/t_half; activity=λN. `remaining`/`decayed` expected counts, `activity` Bq and `decayConstant` s⁻¹. |
| `particle` | `mass` kg [0, 10⁻²⁴] (9.1093837139×10⁻³¹); `momentum` kg·m/s [0, 10⁻¹⁵] (10⁻²²) | E²=(pc)²+(mc²)². `energy`, `restEnergy`, `pc`, `kinetic` all J. Momentum is a magnitude. |
| `condensed` | `energy` J [−10⁻¹⁷, 10⁻¹⁷] (0); `chemicalPotential` J [−10⁻¹⁷, 10⁻¹⁷] (0); `temperature` K [0.001, 10000] (300) | f(E)=1/(exp((E−μ)/(kBT))+1). Dimensionless `occupancy`; `energyOffset` J. |
| `astrophysics` | `radius` m [1, 10¹²] (6.957×10⁸); `temperature` K [1, 10⁶] (5772) | L=4πR²σT⁴. `luminosity` W, `surfaceFlux` W/m². |
| `cosmology` | `hubbleConstant` s⁻¹ [10⁻¹⁹, 10⁻¹⁷] (2.268545503×10⁻¹⁸); `distance` m [0, 10²⁴] (3.085677581×10²²) | v=H₀d. `recessionSpeed` m/s; `hubbleTime`=1/H₀ s is not the universe's age. Default H₀ is approximately 70 km/s/Mpc. |

## Supported interpretations and numerical limits

- **Waves:** prescribed sinusoidal transverse displacement in a uniform nondispersive medium. No boundaries, damping, interference solver or material-velocity claim.
- **Thermal:** an equilibrium ideal gas, ignoring molecular size, interactions and phase changes. Zero amount gives zero pressure. This does not simulate heat-flow dynamics or establish a real-gas validity range.
- **Electromagnetism:** a static isolated point charge in vacuum. The strictly positive radius excludes its singularity. No magnetic field, radiation, finite-size source or material response.
- **Optics:** paraxial thin converging lens with a real object. Positive image distance is real; negative is virtual. At |1/f−1/dₒ|<10⁻¹² m⁻¹, `imageAtInfinity=1` flags a collimated/unresolved image, and distance and magnification observations are omitted. Exact focal coincidence has zero vergence. Near-coincident nonzero vergence is retained without replacing an infinite/unresolved image by an arbitrary distance. No aberration or diffraction.
- **Relativity:** inertial flat-spacetime comparisons only; strictly subluminal beta. The factorization (1−β)(1+β) avoids subtracting two nearly equal squared quantities. Proper time is for the uniformly moving clock; no acceleration or gravitational time dilation.
- **Quantum:** two separate classroom illustrations, not a coupled scattering solver. `probabilitySamples` contains 121 midpoint bins across center±6σ; each `{position, probability}` holds meters and a dimensionless bin probability, not a probability density. The bin probabilities sum to one. The underlying continuous Gaussian is normalized; truncated sampled weights are renormalized. No trajectory, random measurement, wave-packet spreading or collapse interpretation is asserted. T is a leading exponential attenuation estimate for a rectangular barrier, most useful below an opaque barrier; its interface-matching prefactor is omitted. At/above the barrier the model uses the classical no-reflection value T=1, κ=0 and `tunnelingRegime=0`; this is not an exact quantum transmission coefficient. Width zero yields T=1. The electron mass is fixed, and no relativistic scattering is modeled.
- **Atomic:** isolated hydrogen using the deliberately rounded 13.6 eV binding scale. No fine structure, reduced-mass correction, spin, fields or many-electron interactions. Levels do not specify physical electron orbits.
- **Nuclear:** continuous expected ensemble counts for a single independent decay channel. Fractional populations are meaningful expectations, not partial nuclei. No chains, random individual decay events, background or detector simulation.
- **Particle:** free-particle relativistic dispersion, including E=pc at zero mass and E=0 at zero mass/momentum. `Math.hypot` evaluates total energy; kinetic energy uses (pc)²/(E+mc²) to avoid cancellation at small momentum (zero at E=0). No fields, interactions, creation or Standard Model dynamics.
- **Condensed:** equilibrium independent-fermion state occupancy with prescribed chemical potential and strictly positive temperature. No density of states, band structure, interactions, conductivity or superconductivity. A stable sign-split logistic expression avoids exponential overflow.
- **Astrophysics:** uniform spherical unit-emissivity blackbody with effective surface temperature. No stellar structure, spectra, evolution, extinction or relativistic correction. Values outside realistic stellar regimes are mathematical comparisons.
- **Cosmology:** fixed-epoch local linear Hubble law in proper distance. Bounds imply speeds below about 0.034c. No peculiar velocities, lookback evolution, redshift conversion or cosmological distance inference. The inverse rate is a characteristic timescale, not an age measurement.

Attenuation exponents clip to [0, 700], leaving an approximately 9.86×10⁻³⁰⁵ floor instead of allowing extreme underflow. Nuclear remaining population therefore floors at N₀exp(−700). Fermi occupancy may round to one in the negative extreme. These are stated numerical approximations, not residual physical populations or altered statistics. Bounds keep all returned numeric fields finite, including quantum samples and every parameter corner. Gaussian weights stay in the moderate exp(−18) to 1 range because positions are generated in normalized coordinates.

## Constants and verification sources

`models/shared.ts` uses exact SI c=299792458 m/s, kB=1.380649×10⁻²³ J/K and e=1.602176634×10⁻¹⁹ C, and R=8.31446261815324 J/(mol·K). Rounded classroom constants are mₑ=9.1093837139×10⁻³¹ kg, ℏ=1.054571817×10⁻³⁴ J·s, k=8.9875517862×10⁹ N·m²/C² and σ=5.670374419×10⁻⁸ W/(m²·K⁴). These are fixed values for deterministic exercises, not a live metrology feed.

- [NIST SI defining constants](https://www.nist.gov/pml/special-publication-330/sp-330-section-2) and [CODATA 2022 table](https://www.physics.nist.gov/cuu/pdf/wall_2022.pdf): constants and units.
- [OpenStax thin lenses](https://openstax.org/books/university-physics-volume-3/pages/2-4-thin-lenses): image sign convention and focal singularity.
- [OpenStax quantum tunneling](https://openstax.org/books/university-physics-volume-3/pages/7-6-the-quantum-tunneling-of-particles-through-potential-barriers): exponential barrier behavior and distinction from exact interface matching.

The new `tests/advanced-physics.test.ts` checks independently specified analytic values for every model, probability normalization/mean/variance, scaling laws, invalid input, all parameter corners, exponent extremes, deterministic output and legacy/course-registry integration. The 1 eV, 0.1 nm tunneling fixture was independently recomputed at 50-digit decimal precision using h/(2π), giving T≈0.3589280082836 rather than deriving the expected value from the model implementation.
