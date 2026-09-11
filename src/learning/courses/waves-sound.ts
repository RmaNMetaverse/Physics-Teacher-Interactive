import { starterCourse, up } from './shared';
export const wavesSoundCourse = starterCourse({
  id: 'waves-sound',
  title: 'Waves and Sound',
  group: 'classical',
  color: '#30b9c1',
  model: 'waves',
  description: 'Follow repeating motion into traveling waves, interference, resonance, and sound spectra.',
  sources: [up(1, '15-1-simple-harmonic-motion'), up(1, '16-2-mathematics-of-waves'), up(1, '16-5-interference-of-waves'), up(1, '17-3-sound-intensity')],
  limitations: ['The lab is one prescribed sinusoidal wave in a uniform nondispersive medium; it has no boundaries, damping, spectrum analyzer, or interference solver.'],
  missions: [
        {
    id: 'oscillation',
    title: 'Oscillation',
    summary: 'A period counts time per cycle; frequency counts cycles per second.',
    body: ['A vibrating point repeatedly passes through its equilibrium position. Amplitude describes how far it reaches, while period describes how long one complete repetition takes.', 'Counting cycles for a measured time gives frequency. The same rhythm can be expressed as seconds per cycle or cycles per second; these are reciprocal quantities.'],
    equation: 'T=1/f',
    symbols: [['T', 'period, s'], ['f', 'frequency, Hz'], ['1', 'one complete cycle']],
    math: 'fractions',
    mathNotes: ['Reciprocal means one divided by a number. A larger frequency gives a smaller time per cycle.'],
    example: {
      question: 'What period corresponds to 4 Hz?',
      steps: ['Four cycles fill one second.', 'Divide 1 s by 4.'],
      answer: '0.25 s.'
            },
    calculation: ['Find the period of a 5 Hz oscillation.', 0.2, 's', 'The reciprocal of 5 cycles per second is 0.2 seconds per cycle.'],
    predict: ['If frequency doubles, what happens to period?', ['It halves', 'It doubles'], 0, 'Twice as many cycles fit into the same second, so each takes half as long.'],
    check: ['Which quantity describes the maximum displacement?', ['Frequency', 'Amplitude'], 1, 'Amplitude measures excursion from equilibrium, independently of repetition rate.'],
    lab: 'Set frequency to 2 Hz and then 4 Hz, holding amplitude fixed. Compare the period readout and displacement at one position. The moving pattern and the local oscillation are different descriptions.',
    takeaway: 'Convert between period and frequency using a reciprocal.',
    limitation: 'Changing the prescribed frequency does not model how a physical driver supplies energy.'
        },
        {
    id: 'traveling-waves',
    title: 'Traveling waves',
    summary: 'One wavelength travels past a point in one period.',
    body: ['A traveling wave moves a recognizable phase, such as a crest, through space. Material points can oscillate near their equilibrium while the pattern travels a long distance.', 'Wave speed is frequency multiplied by wavelength. In a fixed nondispersive medium, changing the driving frequency therefore changes wavelength rather than freely changing the medium speed.'],
    equation: 'v=f\\lambda',
    symbols: [['v', 'phase speed, m/s'], ['f', 'frequency, Hz'], ['\\lambda', 'wavelength, m']],
    math: 'ratios',
    mathNotes: ['Multiply cycles per second by meters per cycle. The cycle units cancel, leaving meters per second.'],
    example: {
      question: 'Find speed for f=3 Hz and wavelength 2 m.',
      steps: ['Each cycle spans 2 m.', 'Multiply 3 × 2.'],
      answer: '6 m/s.'
            },
    calculation: ['A 4 Hz wave has wavelength 0.5 m. Find phase speed.', 2, 'm/s', 'The pattern speed is fλ = 4 × 0.5 = 2 m/s.'],
    predict: ['Does a crest speed necessarily equal the speed of the medium particles?', ['Yes', 'No'], 1, 'Phase travels through the medium while particles oscillate locally.'],
    check: ['At fixed wave speed, doubling frequency does what to wavelength?', ['Halves it', 'Doubles it'], 0, 'The product fλ must remain constant in this comparison.'],
    lab: 'Compare frequency 2 Hz and wavelength 3 m with frequency 4 Hz and wavelength 1.5 m. Check that both give 6 m/s. The controls can also prescribe other media speeds, so keep the product fixed for this comparison.',
    takeaway: 'Distinguish phase travel from local particle motion.',
    limitation: 'The model prescribes f and wavelength independently; it does not derive a medium dispersion relation.'
        },
        {
    id: 'superposition',
    title: 'Superposition',
    summary: 'Overlapping small waves add their signed displacements, allowing reinforcement or cancellation.',
    body: ['In a linear medium, the total displacement at a point is the sum of the displacements each wave would produce separately. A positive crest and negative trough can cancel at that instant.', 'Cancellation of displacement at one point does not mean energy has vanished. A full interference field redistributes energy, and wave energy is not proportional to signed displacement alone.'],
    equation: 'y=y_1+y_2',
    symbols: [['y', 'total displacement, m'], ['y_1', 'first wave displacement, m'], ['y_2', 'second wave displacement, m'], ['+', 'add signed values']],
    math: 'signed-numbers',
    mathNotes: ['The subscripts identify the two contributions, not multiplication. Keep the signs when adding crests and troughs.'],
    example: {
      question: 'At a point, waves contribute +0.3 m and −0.2 m. Find the total.',
      steps: ['Use the same upward-positive axis.', 'Add 0.3 + (−0.2).'],
      answer: '+0.1 m.'
            },
    calculation: ['Add displacements +0.4 m and −0.1 m.', 0.3, 'm', 'Signed superposition gives 0.4 − 0.1 = 0.3 m.'],
    predict: ['Equal opposite displacements give what instantaneous total?', ['Zero', 'Double amplitude'], 0, 'Equal magnitudes with opposite signs add to zero.'],
    check: ['Does zero displacement at a point prove zero wave energy everywhere?', ['Yes', 'No'], 1, 'Interference redistributes a field; one displacement sample cannot establish total energy.'],
    lab: 'Pause a wave at a chosen time and record displacement at a position. Repeat at a point half a wavelength away, then add the two readings on paper. The simulator displays one wave at a time, so the sum is your prediction.',
    takeaway: 'Add displacements with signs before reasoning about interference.',
    limitation: 'Linear superposition can fail for large nonlinear disturbances, and the lab does not evolve a combined wave.'
        },
        {
    id: 'resonance',
    title: 'Resonance',
    summary: 'A periodic push can transfer energy efficiently when timed near a system’s natural rhythm.',
    body: ['A resonator has natural frequencies set by its structure. Driving near one of them can build a large response because repeated pushes add energy at favorable phases.', 'Damping removes energy and limits a real response. For a stretched string fixed at both ends, a fundamental standing wave fits half a wavelength along the string.'],
    equation: 'f_1=v/(2L)',
    symbols: [['f_1', 'fundamental frequency, Hz'], ['v', 'wave speed, m/s'], ['L', 'string length, m'], ['2', 'two half-lengths per wavelength']],
    math: 'algebra',
    mathNotes: ['A fixed-end fundamental needs wavelength 2L. Substitute that length into f=v/λ. This predicts a frequency, not a response amplitude.'],
    example: {
      question: 'A 1 m fixed-end string has wave speed 20 m/s. Find its fundamental.',
      steps: ['The fundamental wavelength is 2 × 1 = 2 m.', 'Divide speed 20 by wavelength 2.'],
      answer: '10 Hz.'
            },
    calculation: ['For speed 30 m/s and length 1.5 m, find the fundamental.', 10, 'Hz', 'The wavelength is 3 m, so the frequency is 30/3 = 10 Hz.'],
    predict: ['What limits the amplitude of a steadily driven real resonator?', ['Damping and other losses', 'The label on its frequency'], 0, 'Energy losses balance input in a finite steady response.'],
    check: ['For fixed speed, a string twice as long has what fundamental?', ['Twice the frequency', 'Half the frequency'], 1, 'The denominator 2L doubles, so the fundamental halves.'],
    lab: 'Use wavelength 2 m and frequency 10 Hz to read a speed of 20 m/s. Treat that wave as the ingredient for a 1 m fixed-end standing wave on paper. The lab has no fixed boundaries and does not simulate resonant buildup.',
    takeaway: 'Match driving rhythm to natural frequency while accounting for damping.',
    limitation: 'The fixed-end formula assumes an ideal uniform string; resonance curves and damping are outside this simulator.'
        },
        {
    id: 'sound-and-spectra',
    title: 'Sound and spectra',
    summary: 'A complex sound contains several frequencies, while intensity measures energy flow per area.',
    body: ['Pitch relates strongly to repetition frequency, while timbre depends on the mixture of frequency components and how they change with time. A pure sinusoid has one frequency.', 'Sound level is logarithmic: a tenfold intensity ratio adds ten decibels. Equal increases in decibels therefore mean equal intensity ratios, not equal added intensities.'],
    equation: '\\beta=10\\log_{10}(I/I_0)',
    symbols: [['\\beta', 'sound intensity level, dB'], ['I', 'intensity, W/m²'], ['I_0', 'reference intensity, 10⁻¹² W/m²'], ['\\log_{10}', 'power of ten needed to produce its argument']],
    math: 'powers',
    mathNotes: ['Divide two intensities first to obtain a dimensionless ratio. log₁₀(100)=2 because 10²=100; multiply that exponent by ten.'],
    example: {
      question: 'Find the level for intensity 100 times the reference.',
      steps: ['The ratio is 100 = 10², so its base-ten logarithm is 2.', 'Multiply 10 × 2.'],
      answer: '20 dB.'
            },
    calculation: ['What level corresponds to I/I₀=1000?', 30, 'dB', 'Since 1000=10³, the level is 10 × 3 = 30 dB.'],
    predict: ['Does doubling frequency alone guarantee double sound intensity?', ['Yes', 'No'], 1, 'Intensity also depends on amplitude and the medium; frequency alone is insufficient.'],
    check: ['A 10 dB increase means what intensity ratio?', ['Tenfold', 'Twofold'], 0, 'Ten decibels represent one extra power of ten in intensity ratio.'],
    lab: 'Compare 100 Hz and 200 Hz at the same prescribed amplitude. Record period and local displacement. These are pure-wave components you could combine into a spectrum; this transverse lab neither plays sound nor computes acoustic intensity.',
    takeaway: 'Separate frequency content from logarithmic intensity level.',
    limitation: 'Perceived loudness depends on frequency and the listener; decibels here refer to physical intensity rather than perceived loudness.'
        },
    ],
});
