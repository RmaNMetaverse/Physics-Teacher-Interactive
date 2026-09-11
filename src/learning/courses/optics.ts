import { starterCourse, up } from './shared';
export const opticsCourse = starterCourse({
  id: 'optics',
  title: 'Optics',
  group: 'classical',
  color: '#a184e8',
  model: 'optics',
  description: 'Trace reflection and refraction, form lens images, and connect interference to photon detection.',
  sources: [up(3, '1-2-the-law-of-reflection'), up(3, '1-3-refraction'), up(3, '2-4-thin-lenses'), up(3, '3-1-youngs-double-slit-interference')],
  limitations: ['The lab models a paraxial thin converging lens and real object. It excludes aberrations, diffraction, photon counting, and material dispersion.'],
  missions: [
        {
    id: 'reflection',
    title: 'Reflection',
    summary: 'Angles of incidence and reflection are measured from the surface normal.',
    body: ['A normal is an imaginary line perpendicular to a surface at the point where a ray meets it. Measuring both ray angles from that line makes the reflection rule unambiguous.', 'A smooth mirror preserves an organized image because neighboring surface normals are aligned. A rough surface still reflects locally but sends neighboring rays in many directions.'],
    equation: '\\theta_r=\\theta_i',
    symbols: [['\\theta_r', 'reflected angle from normal'], ['\\theta_i', 'incident angle from normal']],
    math: 'geometry',
    mathNotes: ['Equal angles must use the same angular unit and the same normal. A right angle is 90 degrees or π/2 radians.'],
    example: {
      question: 'A ray arrives 30° from the normal. Find its reflected angle.',
      steps: ['Use the normal as the reference.', 'Apply equal incident and reflected angles.'],
      answer: '30° from the normal.'
            },
    calculation: ['A ray arrives 40 degrees from the normal. Find its reflected angle in degrees.', 40, 'degrees', 'The reflection law gives the same angle, 40 degrees from the normal.'],
    predict: ['A ray 20° from the surface is how far from the normal?', ['20°', '70°'], 1, 'The surface and normal are perpendicular, so the complementary angle is 90−20=70°.'],
    check: ['Does rough reflection violate the local reflection law?', ['No', 'Yes'], 0, 'Different local normals scatter rays while each small patch obeys reflection.'],
    lab: 'Use a lens image at twice the focal length as a contrast: its negative magnification means inversion by refraction, not mirror reflection. Record image distance and avoid describing every image-forming device as a mirror.',
    takeaway: 'Name the normal before measuring a ray angle.',
    limitation: 'The simulation is a lens comparison and contains no mirror or rough-surface ray tracer.'
        },
        {
    id: 'refraction',
    title: 'Refraction',
    summary: 'A change in wave speed can change a ray’s direction at a boundary.',
    body: ['Refractive index compares vacuum light speed with phase speed in a material. Frequency stays the same across a stationary interface, while wavelength and direction can change.', 'Snell’s law relates angles measured from the normal. Entering a higher-index material bends a transmitted ray toward the normal unless it arrives exactly along that normal.'],
    equation: 'n_1\\sin\\theta_1=n_2\\sin\\theta_2',
    symbols: [['n_1,n_2', 'dimensionless refractive indices'], ['\\theta_1,\\theta_2', 'ray angles from the normal'], ['\\sin', 'opposite side divided by hypotenuse in a right triangle']],
    math: 'trigonometry',
    mathNotes: ['Use sine to turn each angle into a side ratio. Divide n₁ sinθ₁ by n₂ to obtain sinθ₂; recovering an angle uses the inverse-sine operation.'],
    example: {
      question: 'Light enters n₂=1.5 from n₁=1 at 30°. Find sinθ₂.',
      steps: ['Use sin30°=0.5.', 'Divide 1×0.5 by 1.5.'],
      answer: '1/3; θ₂ is about 19.5°.'
            },
    calculation: ['For n₁=1, n₂=2, and sinθ₁=0.6, find sinθ₂.', 0.3, 'ratio', 'Snell’s law gives sinθ₂=1×0.6/2=0.3.'],
    predict: ['Into a higher-index medium, an oblique transmitted ray bends where?', ['Toward the normal', 'Away from the normal'], 0, 'The sine of the transmitted angle decreases as refractive index increases.'],
    check: ['Which stays unchanged at a stationary transparent interface?', ['Frequency', 'Wavelength always'], 0, 'The oscillation frequency matches across the interface; wavelength adjusts to phase speed.'],
    lab: 'Vary the lens focal length at fixed object distance and note how image position changes. Surface refraction is condensed into focal length here; the lab does not expose refractive indices or calculate Snell angles.',
    takeaway: 'Relate bending to index while conserving frequency across a stationary boundary.',
    limitation: 'Snell’s law here assumes transparent uniform isotropic media and geometrical rays; dispersion and total internal reflection require additional care.'
        },
        {
    id: 'lenses',
    title: 'Lenses',
    summary: 'A thin converging lens makes a real image outside its focal distance and a virtual image inside it.',
    body: ['A focal length describes where parallel paraxial rays meet. A real object beyond that distance can form an inverted real image on a screen on the far side.', 'Inside the focal distance, outgoing rays diverge and their backward extensions form a virtual image. At the focal plane, outgoing rays are parallel: there is no finite image distance.'],
    equation: '1/d_i=1/f-1/d_o',
    symbols: [['d_i', 'signed image distance, m; negative means virtual'], ['d_o', 'positive real-object distance, m'], ['f', 'positive converging focal length, m'], ['1/d', 'reciprocal distance, m⁻¹'], ['-', 'subtract reciprocal distances']],
    math: 'fractions',
    mathNotes: ['Subtract reciprocals before taking the reciprocal of the result. A zero result means an image at infinity; do not divide by zero.'],
    example: {
      question: 'Find the image for f=0.1 m and do=0.2 m.',
      steps: ['Compute 1/di=10−5=5 m⁻¹.', 'Take the reciprocal, di=1/5 m.'],
      answer: '+0.2 m, a real image.'
            },
    calculation: ['For f=0.2 m and do=0.4 m, find di.', 0.4, 'm', 'The reciprocal image distance is 5−2.5=2.5 m⁻¹, so di=0.4 m.'],
    predict: ['At do=f, where is the ideal image?', ['At a finite large distance', 'At infinity'], 1, 'The reciprocal image distance becomes zero, corresponding to parallel outgoing rays.'],
    check: ['A negative image distance in this convention means what?', ['Virtual image', 'An invalid negative length input'], 0, 'Signed image distance labels which side the ray extensions meet; negative is virtual.'],
    lab: 'With focal length 0.1 m compare object distances 0.2, 0.1, and 0.05 m. Record real, infinite, and virtual outcomes; at infinity the model omits undefined image distance and magnification.',
    takeaway: 'Compute with signed reciprocal distances and handle the focal-plane singularity.',
    limitation: 'Thin-lens predictions apply near the optical axis and omit finite thickness and aberrations.'
        },
        {
    id: 'interference',
    title: 'Interference',
    summary: 'Path differences set relative phase and can create bright and dark fringes.',
    body: ['Coherent waves maintain a stable phase relationship. If two equal-frequency paths differ by a whole number of wavelengths, their crests can arrive together and reinforce.', 'A half-wavelength additional path shifts a sinusoid by half a cycle, allowing cancellation for equal amplitudes. Real fringe visibility also depends on coherence, polarization, and unequal intensities.'],
    equation: '\\Delta L=m\\lambda',
    symbols: [['\\Delta L', 'path difference for constructive interference, m'], ['m', 'integer fringe order'], ['\\lambda', 'wavelength, m'], ['\\Delta', 'difference of two path lengths']],
    math: 'ratios',
    mathNotes: ['Multiply wavelength by an integer to count full cycles of path difference. This constructive condition assumes sources initially in phase.'],
    example: {
      question: 'For wavelength 500 nm, find a constructive path difference at order 2.',
      steps: ['Convert 500 nm to 5×10⁻⁷ m.', 'Multiply by 2.'],
      answer: '1×10⁻⁶ m.'
            },
    calculation: ['For wavelength 4e-7 m and order 3, find constructive path difference.', 1.2e-6, 'm', 'Three full wavelengths give 3×4×10⁻⁷=1.2×10⁻⁶ m.'],
    predict: ['Equal in-phase waves with half a wavelength path difference tend to do what?', ['Cancel', 'Reinforce'], 0, 'Half a cycle shifts a crest onto a trough for equal-amplitude coherent waves.'],
    check: ['Does a geometrical lens image include diffraction fringes in this lab?', ['Yes', 'No'], 1, 'The paraxial lens equation maps image positions without evolving optical phase.'],
    lab: 'Form an image in the lens lab and change object distance. Notice that the model reports image location, not fringe structure. Calculate a wavelength-scale path difference separately to identify information a wave-optics model would need.',
    takeaway: 'Count path difference in wavelengths before predicting interference.',
    limitation: 'The condition assumes coherent initially in-phase waves; no interference intensity pattern is simulated.'
        },
        {
    id: 'photons-and-imaging',
    title: 'Photons and imaging',
    summary: 'A lens forms an image geometrically, while a detector records discrete energy transfers.',
    body: ['Light propagates with interference behavior but transfers energy in photon-sized events. At one frequency each photon has the same energy, while increasing photon number increases delivered energy.', 'Imaging also has finite resolution: diffraction and photon statistics matter even when a ray diagram gives a sharp point. Magnification alone does not recover missing spatial detail.'],
    equation: 'E=hf',
    symbols: [['E', 'energy per photon, J'], ['h', 'Planck constant, 6.62607015×10⁻³⁴ J·s'], ['f', 'frequency, Hz']],
    math: 'scientific-notation',
    mathNotes: ['Multiply the frequency by h; seconds cancel. Total energy for N identical photons is N times this per-photon energy.'],
    example: {
      question: 'Using h≈6.63×10⁻³⁴, find photon energy at 5×10¹⁴ Hz.',
      steps: ['Multiply coefficients 6.63×5=33.15.', 'Combine powers 10⁻³⁴×10¹⁴=10⁻²⁰.'],
      answer: '3.315×10⁻¹⁹ J.'
            },
    calculation: ['A photon has energy 2e-19 J. What energy do three such photons deliver?', 6e-19, 'J', 'Independent photon energies add: 3×2×10⁻¹⁹=6×10⁻¹⁹ J.'],
    predict: ['At fixed frequency, doubling photon count changes what?', ['Energy of each photon', 'Total delivered energy'], 1, 'Per-photon energy stays hf while the total scales with photon number.'],
    check: ['Does larger magnification guarantee finer resolved detail?', ['No', 'Yes'], 0, 'Diffraction, sampling, and photon statistics limit detail independently of geometric magnification.'],
    lab: 'Change object distance to increase the lens magnification magnitude. Record image distance too, and explain why these geometric outputs do not predict detector noise or diffraction-limited resolution.',
    takeaway: 'Distinguish photon energy, photon count, magnification, and resolution.',
    limitation: 'The lens lab contains neither diffraction nor a photon detector and makes no resolution or noise prediction.'
        },
    ],
});
