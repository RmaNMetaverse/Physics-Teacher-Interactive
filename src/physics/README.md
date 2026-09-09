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
