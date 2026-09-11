import { starterCourse, up } from './shared';
export const nuclearCourse = starterCourse({
  id: 'nuclear',
  title: 'Nuclear Physics',
  group: 'modern',
  color: '#df8d55',
  model: 'nuclear',
  description: 'Account for nuclear binding, probabilistic decay, half-life, and energy in fission and fusion.',
  sources: [up(3, '10-2-nuclear-binding-energy'), up(3, '10-3-radioactive-decay'), up(3, '10-5-fission'), up(3, '10-6-nuclear-fusion')],
  limitations: ['The lab gives expected ensemble counts for one decay channel, not individual decay events, reaction chains, radiation transport, reactors, or fusion dynamics.'],
  missions: [
        {
    id: 'binding',
    title: 'Binding',
    summary: 'A bound nucleus has less rest mass than its separated constituent nucleons.',
    body: ['Binding energy is the energy needed to separate a nucleus into specified free protons and neutrons. Because energy contributes to rest mass, the bound system’s mass is smaller than their separated sum.', 'A positive mass defect corresponds to positive binding energy. Atomic masses include electrons, so consistent electron bookkeeping is required when using tabulated atomic rather than nuclear masses.'],
    equation: 'B=\\Delta m c^2',
    symbols: [['B', 'binding energy, J'], ['\\Delta m', 'separated minus bound mass, kg'], ['c', 'vacuum light speed, m/s'], ['^2', 'square the light speed']],
    math: 'scientific-notation',
    mathNotes: ['Find the positive mass difference first, then multiply by c squared. This converts mass difference to energy without implying that mass is a material fuel that vanishes without conservation.'],
    example: {
      question: 'Using c=3×10⁸ m/s, find B for Δm=1×10⁻²⁹ kg.',
      steps: ['Square c to get 9×10¹⁶ m²/s².', 'Multiply by 10⁻²⁹ kg.'],
      answer: '9×10⁻¹³ J.'
            },
    calculation: ['Using c=3e8 m/s and Δm=2e-29 kg, find binding energy.', 1.8e-12, 'J', 'The binding energy is 2×10⁻²⁹×9×10¹⁶=1.8×10⁻¹² J.'],
    predict: ['A bound nucleus is lighter than its separated nucleons by what?', ['Binding energy divided by c²', 'Its entire mass'], 0, 'The rest-mass deficit equals the energy released in binding divided by c².'],
    check: ['Can a half-life alone determine binding energy?', ['Yes', 'No'], 1, 'Half-life concerns a decay rate; binding energy requires mass differences or equivalent energy data.'],
    lab: 'Vary half-life in the decay lab and note that the initial expected count stays fixed. There is no mass-defect input, so binding energy must come from the separate mass calculation rather than from the decay curve.',
    takeaway: 'Use a consistent mass reference when computing binding energy.',
    limitation: 'No isotope masses or binding-energy curve are computed by this single-channel decay model.'
        },
        {
    id: 'decay',
    title: 'Decay',
    summary: 'Radioactive decay predicts ensemble rates while individual decay times remain random.',
    body: ['For an unstable nucleus in the single-channel exponential model, the chance to decay in a short interval does not depend on how long it has survived. An ensemble can therefore have a predictable mean curve.', 'Activity counts expected decay events per second. More remaining nuclei produce greater activity at the same decay constant; activity is not the energy or biological effect of emitted radiation.'],
    equation: 'A=\\lambda N',
    symbols: [['A', 'activity, Bq or decays/s'], ['\\lambda', 'decay constant, s⁻¹'], ['N', 'expected number of undecayed nuclei']],
    math: 'rates',
    mathNotes: ['Multiply the count by probability rate per nucleus. The rate λ is not a wavelength in this context; one becquerel means one decay per second.'],
    example: {
      question: 'Find activity for N=1000 and λ=0.01 s⁻¹.',
      steps: ['Identify the number remaining, not the number already decayed.', 'Multiply 1000×0.01.'],
      answer: '10 Bq.'
            },
    calculation: ['N=200 and λ=0.05 s⁻¹. Find activity.', 10, 'Bq', 'Expected activity is λN=0.05×200=10 decays per second.'],
    predict: ['Can this law predict the exact next nucleus to decay?', ['No', 'Yes'], 0, 'It predicts ensemble statistics, not a particular random event.'],
    check: ['At fixed λ, halving N does what to activity?', ['Halves it', 'Leaves it unchanged'], 0, 'Activity is directly proportional to the remaining population.'],
    lab: 'At a fixed half-life, compare initial counts 100 and 200 at the same time. Record activity and remaining count. Explain why fractional expected counts are valid averages rather than fractions of an actual nucleus.',
    takeaway: 'Separate expected population, activity, and individual random events.',
    limitation: 'The continuous lab excludes stochastic fluctuations, daughter decay chains, and detector response.'
        },
        {
    id: 'half-life',
    title: 'Half-life',
    summary: 'Each half-life removes half of the nuclei still present, not half of the original count every time.',
    body: ['The same survival fraction applies during equal time intervals in an exponential decay. After one half-life half remains; after two, half of that half remains.', 'A half-life is a population statistic. It does not assign each nucleus an appointment to decay, and a surviving nucleus does not become overdue in this memoryless model.'],
    equation: 'N=N_0\\,2^{-t/t_{1/2}}',
    symbols: [['N', 'expected remaining count'], ['N_0', 'initial count'], ['t', 'elapsed time, s'], ['t_{1/2}', 'half-life, s'], ['2^{-x}', 'one divided by two raised to x']],
    math: 'powers',
    mathNotes: ['Divide elapsed time by half-life to count half-life intervals. For whole intervals, repeatedly divide the remaining count by two.'],
    example: {
      question: 'Starting with 80 nuclei, what expected count remains after three half-lives?',
      steps: ['Halve successively: 80→40→20→10.', 'Equivalently divide 80 by 2³=8.'],
      answer: '10 nuclei expected.'
            },
    calculation: ['Start with 120 nuclei. What expected count remains after two half-lives?', 30, 'nuclei', 'Two half-lives leave one quarter: 120/4=30.'],
    predict: ['After two half-lives, what fraction remains?', ['One quarter', 'Zero'], 0, 'Each interval halves what remains, producing 1/2×1/2=1/4.'],
    check: ['Does surviving one half-life make an individual nucleus overdue?', ['Yes', 'No'], 1, 'The exponential model has a constant decay probability rate for every surviving nucleus.'],
    lab: 'Set initial count 80 and half-life 2 s. Inspect times 0, 2, 4, and 6 s and compare with 80, 40, 20, and 10. The curve reports an ensemble expectation, not a sequence of sampled events.',
    takeaway: 'Count repeated fractional survival using elapsed half-lives.',
    limitation: 'A numerical floor prevents extreme underflow and must not be interpreted as a physical permanently surviving population.'
        },
        {
    id: 'fission',
    title: 'Fission',
    summary: 'Splitting some heavy nuclei can release energy when the products have lower total rest energy.',
    body: ['In fission, a heavy nucleus divides into fragments, often with emitted neutrons and radiation. The energy budget compares all initial and final particles, not just two named fragments.', 'A chain reaction depends on whether emitted neutrons trigger further fissions before escaping or being absorbed. A single exponential radioactive-decay curve cannot determine that multiplication.'],
    equation: 'Q=(m_i-m_f)c^2',
    symbols: [['Q', 'reaction energy release, J'], ['m_i', 'total initial rest mass, kg'], ['m_f', 'total final rest mass, kg'], ['c', 'vacuum light speed, m/s'], ['-', 'subtract complete final mass from initial']],
    math: 'signed-numbers',
    mathNotes: ['Include every particle on each side, including incident and emitted neutrons. A positive Q means the reaction can release energy into product motion and radiation.'],
    example: {
      question: 'An illustrative reaction has mass decrease 3×10⁻²⁸ kg. Use c²=9×10¹⁶.',
      steps: ['Take the complete initial-minus-final mass difference.', 'Multiply 3×10⁻²⁸ by 9×10¹⁶.'],
      answer: '2.7×10⁻¹¹ J released.'
            },
    calculation: ['With total mass decrease 1e-28 kg and c=3e8 m/s, find Q.', 9e-12, 'J', 'The complete rest-mass decrease gives Q=10⁻²⁸×9×10¹⁶=9×10⁻¹² J.'],
    predict: ['Does any split of a nucleus necessarily release energy?', ['No, compare complete masses', 'Yes, splitting always releases energy'], 0, 'The sign of the complete reaction energy balance determines whether energy is released or required.'],
    check: ['Can a single-channel decay lab predict neutron multiplication?', ['Yes', 'No'], 1, 'Neutron transport and induced reaction probabilities are absent from an independent-decay model.'],
    lab: 'Compare a decay curve’s monotonic decrease with a hypothetical multiplying chain reaction described in words. Change half-life to see that the lab only changes loss rate; it never creates a population of triggering neutrons.',
    takeaway: 'Balance all reaction products and distinguish decay from induced multiplication.',
    limitation: 'The toy energy calculation gives no reactor design, chain-reaction dynamics, or isotope-specific yield prediction.'
        },
        {
    id: 'fusion',
    title: 'Fusion',
    summary: 'Light nuclei can release energy by forming more tightly bound products, but repulsion creates a reaction barrier.',
    body: ['Two positively charged nuclei repel electrically before the short-range nuclear interaction can bind them. A favorable final energy does not imply a large reaction rate at room temperature.', 'In stars, thermal distributions and quantum tunneling jointly enable some fusion reactions. Energy conservation sets the release, while cross sections, density, and temperature govern the rate.'],
    equation: 'E_{total}=N_r Q',
    symbols: [['E_{total}', 'energy released by completed reactions, J'], ['N_r', 'number of reactions'], ['Q', 'energy released per reaction, J']],
    math: 'scientific-notation',
    mathNotes: ['Multiply the number of completed reactions by the per-reaction energy. This is total energy, not power; divide by duration only if a rate is known.'],
    example: {
      question: 'If 10⁶ toy reactions each release 3×10⁻¹² J, find total energy.',
      steps: ['Multiply coefficients 1×3.', 'Combine 10⁶×10⁻¹²=10⁻⁶.'],
      answer: '3×10⁻⁶ J.'
            },
    calculation: ['Four million reactions each release 2e-12 J. Find total energy.', 8e-6, 'J', 'Multiply 4×10⁶ by 2×10⁻¹² to obtain 8×10⁻⁶ J.'],
    predict: ['Does positive reaction energy guarantee a rapid reaction?', ['Yes', 'No'], 1, 'Reaction barriers and probabilities control the rate independently of the net energy release.'],
    check: ['What additional information turns total energy into average power?', ['Elapsed duration', 'Only a new mass label'], 0, 'Average power is energy released divided by the duration of release.'],
    lab: 'Inspect how changing half-life changes a decay rate at fixed initial population. Use this as a rate-versus-total-count comparison only: a fusion rate needs collision and tunneling physics that this decay lab does not contain.',
    takeaway: 'Keep fusion energy per event separate from the rate of events.',
    limitation: 'The lab does not calculate fusion cross sections, plasma confinement, stellar reaction rates, or net power.'
        },
    ],
});
