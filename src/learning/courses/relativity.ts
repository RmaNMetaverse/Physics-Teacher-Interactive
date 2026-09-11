import { starterCourse, up } from './shared';
export const relativityCourse = starterCourse({
  id: 'relativity',
  title: 'Relativity',
  group: 'modern',
  color: '#5c9bdf',
  model: 'relativity',
  description: 'Compare events, clock readings, lengths, relativistic energy, and the meaning of spacetime curvature.',
  sources: [up(3, '5-1-invariance-of-physical-laws'), up(3, '5-3-time-dilation'), up(3, '5-4-length-contraction'), up(1, '13-7-einsteins-theory-of-gravity')],
  limitations: ['The lab compares inertial frames in flat spacetime at subluminal velocity; it has no acceleration history, gravity, or spacetime-curvature solver.'],
  missions: [
        {
    id: 'events-and-frames',
    title: 'Events and frames',
    summary: 'An event has a location and a time; observers assign different coordinates to the same event.',
    body: ['Two observers can disagree about the coordinates of a flash without disagreeing that it happened. Each inertial observer uses a network of clocks and rulers to assign those coordinates.', 'The speed ratio beta compares relative velocity with vacuum light speed. Massive observers require a magnitude below one; a photon has no inertial rest frame.'],
    equation: '\\beta=v/c',
    symbols: [['\\beta', 'signed dimensionless velocity ratio'], ['v', 'relative velocity along one axis, m/s'], ['c', 'vacuum light speed, 299792458 m/s']],
    math: 'ratios',
    mathNotes: ['Dividing two velocities with the same units leaves a pure number. Negative beta changes direction, while its magnitude describes how close the speed is to c.'],
    example: {
      question: 'Using c≈3×10⁸ m/s, find beta at v=1.8×10⁸ m/s.',
      steps: ['Divide velocity by c.', 'Compute 1.8/3 with matching powers of ten.'],
      answer: '0.6.'
            },
    calculation: ['Using c=3e8 m/s, find beta for v=1.5e8 m/s.', 0.5, 'ratio', 'The relative velocity is half the speed of light, so beta=0.5.'],
    predict: ['Does changing an event’s coordinates change the event itself?', ['No', 'Yes'], 0, 'Coordinates depend on the chosen frame while the physical event is shared.'],
    check: ['Can a massive observer have a rest frame moving at c?', ['Yes', 'No'], 1, 'Inertial frames for massive observers are related by strictly subluminal relative speeds.'],
    lab: 'Compare beta +0.6 and −0.6. Inspect signed velocity and the Lorentz factor. Direction reverses while gamma remains equal, because the clock and length factors depend on speed magnitude.',
    takeaway: 'Describe events with a named frame and dimensionless speed ratio.',
    limitation: 'The model does not transform arbitrary event coordinates or construct a photon rest frame.'
        },
        {
    id: 'light-clock-dilation',
    title: 'Light-clock dilation',
    summary: 'A moving light clock follows a longer light path between ticks in the laboratory frame.',
    body: ['Imagine light bouncing between mirrors perpendicular to the clock’s motion. In the clock frame it travels straight between mirrors; in the laboratory its path is diagonal.', 'Both observers measure light speed c, so the longer laboratory path requires more laboratory time. Proper time is read by the clock present at both tick events, not by an arbitrary distant clock.'],
    equation: '\\gamma=1/\\sqrt{1-\\beta^2}',
    symbols: [['\\gamma', 'Lorentz factor, dimensionless'], ['\\beta', 'relative velocity divided by c'], ['\\beta^2', 'beta multiplied by itself'], ['\\sqrt{}', 'positive square root'], ['-', 'subtract from one']],
    math: 'powers',
    mathNotes: ['Square beta, subtract it from one, take the positive square root, then take the reciprocal. Laboratory elapsed time is gamma times the moving clock’s proper time.'],
    example: {
      question: 'Find gamma for beta=0.6.',
      steps: ['Compute 1−0.6²=0.64 and √0.64=0.8.', 'Take 1/0.8.'],
      answer: '1.25.'
            },
    calculation: ['At gamma=1.25, what laboratory interval corresponds to 4 s of moving-clock proper time?', 5, 's', 'Laboratory time equals gamma times proper time: 1.25×4=5 s.'],
    predict: ['At nonzero relative speed, gamma is what?', ['Less than one', 'Greater than one'], 1, 'The square-root denominator is positive and smaller than one.'],
    check: ['Which clock measures proper time between these ticks?', ['The clock present at both ticks', 'Any distant synchronized clock'], 0, 'Proper time follows the clock’s own worldline between the events.'],
    lab: 'Set beta=0.6 and laboratory time to 5 s. Compare the reported proper time with 4 s and gamma with 1.25. Repeat at zero beta to recover matching clocks.',
    takeaway: 'Distinguish proper time from a frame’s coordinate-time interval.',
    limitation: 'This constant-velocity comparison is not a complete twin-paradox trip with acceleration and reunion.'
        },
        {
    id: 'length-and-simultaneity',
    title: 'Length and simultaneity',
    summary: 'Measuring length requires recording both endpoints at the same time in the measuring frame.',
    body: ['A ruler’s proper length is measured in its rest frame. A frame in which the ruler moves measures a shorter length along the motion when both endpoints are recorded simultaneously there.', 'Different inertial frames disagree about which separated endpoint events are simultaneous. Contraction is therefore a coordinate measurement rule, not a claim that motion mechanically crushes the ruler.'],
    equation: 'L=L_0/\\gamma',
    symbols: [['L', 'parallel length in moving measurement frame, m'], ['L_0', 'rest-frame proper length, m'], ['\\gamma', 'Lorentz factor, at least one']],
    math: 'fractions',
    mathNotes: ['The subscript zero labels the rest value. Divide by gamma; transverse lengths are not contracted by this rule.'],
    example: {
      question: 'A 10 m rest-length rod is seen with gamma=1.25. Find its parallel length.',
      steps: ['Use measurements simultaneous in the observing frame.', 'Divide 10 by 1.25.'],
      answer: '8 m.'
            },
    calculation: ['A 12 m rod has gamma=2 relative to an observer. Find its parallel length.', 6, 'm', 'The measured simultaneous endpoint separation is 12/2=6 m.'],
    predict: ['Must endpoint measurements be simultaneous in the measuring frame?', ['Yes', 'No'], 0, 'Otherwise endpoint motion between measurements mixes into the inferred length.'],
    check: ['Does this contraction rule shorten a transverse ruler?', ['Yes', 'No'], 1, 'Only the component parallel to the relative velocity contracts in this inertial comparison.'],
    lab: 'At beta=0.6 read the length ratio 1/gamma. Multiply it by a hypothetical 10 m rest length and compare with the worked example. State the simultaneity requirement because the lab does not display endpoint event clocks.',
    takeaway: 'Specify simultaneity and direction when comparing lengths.',
    limitation: 'The lab reports a parallel length ratio, not a visual photograph including light-travel-time effects.'
        },
        {
    id: 'energy-momentum',
    title: 'Energy-momentum',
    summary: 'Rest energy is part of total energy, and momentum grows without a massive particle reaching c.',
    body: ['Relativistic total energy includes the rest-energy contribution mc². Multiplying it by the Lorentz factor gives total energy for a free massive particle in an inertial frame.', 'Kinetic energy is the excess over rest energy, not all of gamma mc². At low speed the excess approaches the familiar one-half mv².'],
    equation: 'E=\\gamma mc^2',
    symbols: [['E', 'total energy, J'], ['\\gamma', 'Lorentz factor'], ['m', 'invariant rest mass, kg'], ['c^2', 'light speed multiplied by itself, m²/s²']],
    math: 'powers',
    mathNotes: ['Compute rest energy mc² first, then multiply by gamma. Subtract mc² from E if kinetic energy is requested.'],
    example: {
      question: 'A particle has rest energy 8 J and gamma=1.25. Find total and kinetic energy.',
      steps: ['Total energy is 1.25×8=10 J.', 'Subtract rest energy: 10−8.'],
      answer: '10 J total; 2 J kinetic.'
            },
    calculation: ['Rest energy is 4 J and gamma=2. Find total energy.', 8, 'J', 'Total relativistic energy is gamma times rest energy: 2×4=8 J.'],
    predict: ['Is all of total energy kinetic energy?', ['Yes', 'No'], 1, 'Total energy includes rest energy in addition to kinetic energy.'],
    check: ['What happens to gamma as a massive object approaches c?', ['It grows without bound', 'It approaches zero'], 0, 'The positive denominator approaches zero while the numerator remains one.'],
    lab: 'Compare gamma at beta=0, 0.6, and 0.9. Multiply each by a hypothetical fixed rest energy. This converts the lab’s kinematic factor into an energy comparison without changing mass.',
    takeaway: 'Keep total, rest, and kinetic energy distinct.',
    limitation: 'The gamma-times-mass form assumes nonzero rest mass; photons require E=pc rather than an undefined rest frame.'
        },
        {
    id: 'curved-spacetime',
    title: 'Curved spacetime',
    summary: 'Gravity changes clock comparisons, and tidal effects reveal spacetime curvature.',
    body: ['General relativity describes freely falling bodies through spacetime geometry. Nearby freely falling paths can converge or separate, producing tidal effects that cannot be removed throughout a finite region by one frame choice.', 'For stationary clocks separated slightly in a weak approximately uniform gravitational field, the higher clock runs faster by about gh/c² as a fractional rate. This is a limited approximation, not the full field equation.'],
    equation: '\\delta=gh/c^2',
    symbols: [['\\delta', 'approximate fractional higher-clock rate excess'], ['g', 'local gravitational acceleration, m/s²'], ['h', 'small upward height separation, m'], ['c', 'vacuum light speed, m/s']],
    math: 'scientific-notation',
    mathNotes: ['Multiply g and h, then divide by c squared. The result is dimensionless and very small near Earth for laboratory heights.'],
    example: {
      question: 'Estimate the fractional excess for g=10 m/s², h=90 m, c=3×10⁸ m/s.',
      steps: ['Compute gh=900 m²/s² and c²=9×10¹⁶ m²/s².', 'Divide 900 by 9×10¹⁶.'],
      answer: '1×10⁻¹⁴.'
            },
    calculation: ['Using g=10, h=9 m, and c=3e8 m/s, estimate the fractional rate excess.', 1e-15, 'fraction', 'The weak-field estimate is 90/(9×10¹⁶)=10⁻¹⁵.'],
    predict: ['Which stationary clock runs faster in this weak-field height comparison?', ['The higher clock', 'The lower clock'], 0, 'The higher gravitational potential gives a slightly larger clock rate in this comparison.'],
    check: ['Can the special-relativity lab calculate gravitational clock shifts?', ['Yes', 'No'], 1, 'Its beta control describes inertial relative motion and contains no gravitational potential.'],
    lab: 'Set beta to zero and confirm equal kinematic clock rates. Compare that with the nonzero gravitational estimate for different heights on paper: the absence of a gravitational input shows why the lab cannot answer that question.',
    takeaway: 'Separate inertial motion effects from gravity and tidal curvature.',
    limitation: 'The gh/c² estimate assumes a weak field, small height change, and stationary clocks; no general-relativity simulation is supplied.'
        },
    ],
});
