# 3D laboratory rendering

The renderer is a presentation layer over the existing SI models. No scientific
model, parameter range, course prerequisite, assessment, or graph calculation
changed in this visual upgrade.

## Visual system

- A beveled laboratory deck, inset grid, illuminated edge strips, fasteners,
  and three directional light sources establish a consistent instrument setting.
- A deterministic 128 × 128 repeating brushed-metal bump/roughness texture is
  generated locally and disposed with its scene. No remote textures, HDR
  environments, or mesh downloads.
- Standard PBR materials retain Three.js lighting and tone mapping. An analytic
  object-space surface shader adds variation without swimming when the camera
  moves. Astronomy markers have a Fresnel halo and a single-draw static star field.
  These surface effects are illustrative.
- Foundations use solid vector shafts, a measuring bar, beveled ramps and carts,
  wheel hubs, spring guide supports, and a pendulum stand and rod. Body positions
  still come directly from the existing trajectory transform. Marker sizes and
  apparatus thicknesses are schematic.

## Advanced displays

| Model | Display and interpretation |
| --- | --- |
| Waves | Two wavelengths sampled by the existing wave evaluator, displacement beads, highlighted center sample. Axes normalized; high frequencies can alias at display refresh rates. |
| Thermal | Equilibrium chamber with decorative stationary molecules and temperature dial. No molecular dynamics. |
| Electromagnetism | Charge sign and radial direction spokes; zero charge removes the spokes. Arrow lengths are not field magnitudes. |
| Optics | Lens apparatus and existing signed image-distance readout, including image at infinity. Not an additional ray solver. |
| Relativity | Coordinate/proper-time clocks (one revolution per 60 seconds) and normalized parallel length bars. |
| Quantum | All 121 model-supplied probability bins, normalized to their peak for display, and the model's barrier estimate. Not an electron trajectory. |
| Atomic | Selected hydrogen level relative to zero-energy ionization line. Not an electron orbit. |
| Nuclear | Expected remaining population fraction, including zero initial population. Not individual stochastic events. |
| Particle | Energy components normalized to total energy. |
| Condensed | Single-state mean occupancy dial, not a band-structure model. |
| Astrophysics | Illustrative blackbody sphere with luminosity/radius readout. Texture and color are not atmosphere or spectrum calculations. |
| Cosmology | Fixed-epoch distance/recession readout, not a time-evolving galaxy simulation. |

Static models remain static during playback. Waves, clock hands, and foundation
apparatus follow simulation time; there are no decorative animation loops.
Play, pause, step, reset, scrub, graph/data, and WebGL fallback are preserved.

## Rendering budget

- Demand rendering stops when the scene and camera are unchanged.
- Initial device pixel ratio is capped at 1 on narrow screens or devices reporting
  four or fewer logical cores, and 1.5 elsewhere.
- After 90 consecutive active frame samples averaging more than 28 ms, resolution
  steps down by 0.25, to a minimum of 0.75. Long idle gaps are excluded. The reduced
  resolution persists across parent updates; there is no automatic up/down cycle.
- Probability bins use one instanced draw call. Geometry subdivisions are bounded.
  No bloom, SSAO, real-time shadow maps, transmission targets, or external assets.
- Camera framing reacts to viewport aspect ratio, including narrow phones and
  fullscreen. Camera orbit remains user-controlled between resizes.
- Canvas data attributes expose the last frame's draw calls, triangles, and pixel
  ratio for browser regression checks. These are diagnostics, not an FPS guarantee.

## Verification

Run npm run check and npm run test:e2e. If system Chrome is available instead of
Playwright's bundled browser, set PLAYWRIGHT_CHANNEL=chrome.

The simulation suite exercises every model plus projectile and pendulum variants:
actual WebGL presence, no browser/shader errors, fewer than 100 draw calls and
100,000 triangles, desktop-to-phone resizing, stepping, playback controls, graph
fallback, and 320px high-DPI phone pixel-ratio bounds. Mobile screenshots are
written to the ignored test-results directory for inspection.

Browser viewport tests do not certify frame rates on every physical device.
The existing graph/data fallback remains available where WebGL is unsupported.
