import { starterCourse, up } from './shared';
export const quantumCourse = starterCourse({
  id: 'quantum',
  title: 'Quantum Physics',
  group: 'modern',
  color: '#aa79ee',
  model: 'quantum',
  description: 'Start immediately with photons, amplitudes, probabilities, uncertainty, and a carefully bounded tunneling model.',
  sources: [up(3, '6-2-photoelectric-effect'), up(3, '7-1-wave-functions'), up(3, '7-2-the-heisenberg-uncertainty-principle'), up(3, '7-6-the-quantum-tunneling-of-particles-through-potential-barriers')],
  limitations: ['The Gaussian probability illustration and electron rectangular-barrier attenuation are separate examples, not a coupled wave-packet scattering solver or particle trajectory.'],
  missions: [
        {
    id: 'light-quanta',
    title: 'Light quanta',
    summary: 'Light exchanges energy in photon-sized amounts determined by frequency.',
    body: ['A light detector transfers energy in discrete events. For monochromatic light, raising intensity raises the photon arrival rate while raising frequency raises each photon’s energy.', 'The photoelectric effect distinguishes those changes: below a material’s threshold frequency, increasing ordinary low-intensity illumination does not free electrons through the single-photon process. This evidence motivates energy quantization.'],
    equation: 'E=hf',
    symbols: [['E', 'photon energy, J'], ['h', 'Planck constant, 6.62607015×10⁻³⁴ J·s'], ['f', 'frequency, Hz']],
    math: 'scientific-notation',
    mathNotes: ['Multiply frequency by a fixed conversion constant h. In scientific notation multiply coefficients and add powers of ten; this mission needs no prior quantum course.'],
    example: {
      question: 'Using h≈6.63×10⁻³⁴, estimate energy at 6×10¹⁴ Hz.',
      steps: ['Multiply 6.63 by 6 to get 39.78.', 'Combine 10⁻³⁴ and 10¹⁴, then normalize notation.'],
      answer: '3.978×10⁻¹⁹ J.'
            },
    calculation: ['At fixed frequency one photon has 3e-19 J. Find the energy of two photons.', 6e-19, 'J', 'Two identical photon energies add to 6×10⁻¹⁹ J.'],
    predict: ['At fixed frequency, brighter monochromatic light changes what?', ['Energy per photon', 'Photon arrival rate'], 1, 'Frequency fixes energy per photon while intensity can change photon number per time.'],
    check: ['Which change raises photon energy?', ['Increasing frequency', 'Only adding more photons'], 0, 'The relation E=hf ties per-photon energy to frequency.'],
    lab: 'Inspect the quantum lab’s energy input in joules and vary it below a fixed barrier. This energy belongs to an electron in the barrier illustration, not a simulated photon: compare the energy scale without confusing the particle species.',
    takeaway: 'Separate photon number from energy per photon.',
    limitation: 'The lab does not simulate photoemission; multiphoton processes and detailed material work functions are outside this single-photon introduction.'
        },
        {
    id: 'build-a-wavefunction',
    title: 'Build a wavefunction',
    summary: 'A wavefunction encodes probability amplitudes; it is not a hidden drawing of a particle’s path.',
    body: ['An amplitude may carry a sign or complex phase. For a real amplitude, squaring its value gives a nonnegative probability density; for a complex amplitude use the squared magnitude.', 'The lab supplies a Gaussian position distribution with a chosen center and width. Its sampled bins are normalized to total probability one. Different phases can share that position distribution, so a density alone does not specify the full quantum state.'],
    equation: '\\rho(x)=|\\psi(x)|^2',
    symbols: [['\\rho(x)', 'position probability density in one dimension, m⁻¹'], ['\\psi(x)', 'wavefunction amplitude, m⁻¹/²'], ['x', 'position, m'], ['| |', 'magnitude; for a real value, ignore its sign'], ['^2', 'square the magnitude']],
    math: 'powers',
    mathNotes: ['For a real amplitude multiply it by itself: a negative amplitude still gives positive density. A density must be multiplied by a small bin width to approximate bin probability. Complex phase is introduced conceptually; complex arithmetic is not required in this path.'],
    example: {
      question: 'In a chosen consistent unit system, a real amplitude is −2 m⁻¹/². Find density.',
      steps: ['Take the magnitude, 2 m⁻¹/².', 'Square it: 2×2.'],
      answer: '4 m⁻¹, a density rather than a probability.'
            },
    calculation: ['A real amplitude is 3 m⁻¹/². Find its probability density.', 9, 'm⁻¹', 'Density is squared magnitude: |3|²=9 m⁻¹, not a probability of nine.'],
    predict: ['Can a negative real amplitude give negative probability density?', ['No', 'Yes'], 0, 'The squared magnitude is nonnegative regardless of an amplitude’s sign.'],
    check: ['Does the position density alone determine all wavefunction phases?', ['Yes', 'No'], 1, 'Different phases can produce the same squared magnitude and different other predictions.'],
    lab: 'Shift the Gaussian center and then change sigma. Inspect normalized bin probabilities, noting how the peak moves or spreads. The lab specifies the position density only; it does not reconstruct a unique phase or evolve a wavefunction.',
    takeaway: 'Distinguish amplitude, density, and bin probability.',
    limitation: 'The lab represents a normalized finite set of Gaussian position bins, not a full complex wavefunction or time evolution.'
        },
        {
    id: 'measurement-probabilities',
    title: 'Measurement probabilities',
    summary: 'A probability model predicts frequencies across repeated preparations, not the next individual outcome.',
    body: ['Prepare the same state repeatedly and measure position. The Born rule connects squared amplitude with the relative frequencies expected across those measurements, while an individual outcome remains probabilistic.', 'For mutually exclusive position bins, add their probabilities to predict membership in a larger region. Evidence label: interpretation — collapse narratives and many-worlds accounts describe what the formalism means; they are distinct from the established probability rule used here.'],
    equation: 'P(A)=\\sum_{i\\in A}p_i',
    symbols: [['P(A)', 'probability of landing in region A'], ['p_i', 'probability in bin i, dimensionless'], ['\\sum', 'add the listed contributions'], ['i\\in A', 'include bins belonging to region A']],
    math: 'accumulation',
    mathNotes: ['The large sigma is an addition instruction, not the Gaussian width sigma. Each bin contributes once; mutually exclusive bins have no overlapping outcomes to double-count.'],
    example: {
      question: 'A region includes bins with probabilities 0.2 and 0.3. Find its probability.',
      steps: ['Confirm the bins do not overlap.', 'Add 0.2+0.3.'],
      answer: '0.5, or 50%.'
            },
    calculation: ['Three disjoint bins have probabilities 0.1, 0.2, and 0.4. Find their union probability.', 0.7, 'probability', 'Mutually exclusive probabilities add: 0.1+0.2+0.4=0.7.'],
    predict: ['Does a 70% region probability guarantee the next outcome lies there?', ['Yes', 'No'], 1, 'Probability predicts ensemble frequencies and does not guarantee one particular outcome.'],
    check: ['Are alternative narratives about measurement identical to the tested Born rule?', ['No; label them interpretation', 'Yes; all are independently established observations'], 0, 'Interpretive accounts must be distinguished from the shared predictive formalism and experimental frequencies.'],
    lab: 'Inspect the normalized Gaussian bins on each side of its center. Sum a chosen set of bin probabilities or compare symmetric bins. There is no random measurement generator here; all displayed probabilities are deterministic expectations.',
    takeaway: 'Add exclusive outcomes and separate predictive rules from interpretations.',
    limitation: 'Finite displayed bins approximate a continuous distribution; the simulator neither chooses a measurement outcome nor adjudicates interpretations.'
        },
        {
    id: 'uncertainty',
    title: 'Uncertainty',
    summary: 'Position and momentum spreads cannot both be made arbitrarily small in one quantum state.',
    body: ['Quantum uncertainty concerns statistical spreads across identically prepared systems. It is not merely a claim that a clumsy instrument pushes a particle during measurement.', 'The product of position and momentum standard deviations has a lower bound. A Gaussian with suitable phase can reach that bound; a position-density plot alone cannot prove that a state has minimum momentum spread.'],
    equation: '\\Delta x\\,\\Delta p\\geq\\hbar/2',
    symbols: [['\\Delta x', 'position standard deviation, m'], ['\\Delta p', 'momentum standard deviation, kg·m/s'], ['\\hbar', 'h/(2π), approximately 1.055×10⁻³⁴ J·s'], ['\\geq', 'greater than or equal to'], ['\\Delta', 'statistical spread here, not a time difference']],
    math: 'algebra',
    mathNotes: ['Divide the bound by positive Δx to obtain Δp≥ℏ/(2Δx). The inequality gives a minimum possible spread, not an exact value for every state.'],
    example: {
      question: 'Estimate the minimum Δp if Δx=1×10⁻⁹ m.',
      steps: ['Use ℏ≈1.055×10⁻³⁴ J·s.', 'Divide by 2×10⁻⁹ m.'],
      answer: 'At least 5.275×10⁻²⁶ kg·m/s.'
            },
    calculation: ['If the minimum momentum spread is 8 units, what is the new minimum after doubling position spread?', 4, 'same momentum units', 'The lower bound is inversely proportional to position spread, so doubling it halves the minimum.'],
    predict: ['Halving Δx changes the minimum allowed Δp how?', ['Doubles it', 'Halves it'], 0, 'The product bound forces the minimum momentum spread upward when position spread shrinks.'],
    check: ['Does uncertainty describe only instrument mistakes?', ['Yes', 'No'], 1, 'It constrains the quantum state’s statistical spreads even for ideal measurements.'],
    lab: 'Halve sigma in the Gaussian position lab and observe the narrower distribution. Calculate the corresponding lower bound on momentum spread separately. The lab supplies no momentum distribution or phase, so it cannot show saturation of the bound.',
    takeaway: 'Interpret uncertainty as a state constraint on statistical spreads.',
    limitation: 'Sigma is the position width here; the lab does not calculate a Fourier transform or establish a minimum-uncertainty state.'
        },
        {
    id: 'tunneling',
    title: 'Tunneling',
    summary: 'A quantum amplitude can penetrate a finite barrier even when its energy lies below the barrier height.',
    body: ['A classical particle below a barrier cannot cross it without added energy. A quantum wave can have nonzero amplitude on the far side, giving a nonzero transmission probability without borrowing energy.', 'For an opaque rectangular barrier, a leading exponential estimate captures how transmission falls with width. Matching the wave at both interfaces adds a prefactor and corrections; the lab intentionally omits that exact scattering calculation.'],
    equation: 'T\\approx\\exp(-2\\kappa a)',
    symbols: [['T', 'estimated transmission probability'], ['\\kappa', 'positive attenuation coefficient inside barrier, m⁻¹'], ['a', 'barrier width, m'], ['\\exp(z)', 'e raised to z, where e≈2.718'], ['\\approx', 'approximately equal to'], ['-', 'negative exponent means decay']],
    math: 'powers',
    mathNotes: ['Multiply κ by width to get a dimensionless number, then multiply by −2 and exponentiate. exp(−z)=1/exp(z), so a larger positive κa gives a smaller transmission estimate.'],
    example: {
      question: 'Estimate transmission when κa=1, using exp(−2)≈0.1353.',
      steps: ['Form exponent −2κa=−2.', 'Use the supplied exponential value.'],
      answer: '0.1353, about 13.5%.'
            },
    calculation: ['If an exponential model gives T=0.2 at one width, what does it give at twice that width with κ fixed?', 0.04, 'probability', 'Doubling width doubles the negative exponent, so the estimate squares: 0.2²=0.04.'],
    predict: ['At fixed energy below the barrier, making it wider does what?', ['Raises transmission', 'Lowers transmission'], 1, 'The negative attenuation exponent grows in magnitude as width increases.'],
    check: ['Does tunneling require temporarily violating energy conservation?', ['No', 'Yes'], 0, 'Stationary quantum tunneling preserves energy; transmission follows wave boundary conditions.'],
    lab: 'Keep electron energy below barrier height and double width from 1e-10 m to 2e-10 m. Compare transmission with the square of the first value. At or above the barrier the lab uses T=1 as a classroom approximation, not exact quantum transmission.',
    takeaway: 'Use exponential attenuation as a limited estimate and preserve energy conservation.',
    limitation: 'The omitted interface prefactor matters; above-barrier reflection is omitted, and the displayed Gaussian is not coupled to the barrier.'
        },
    ],
});
