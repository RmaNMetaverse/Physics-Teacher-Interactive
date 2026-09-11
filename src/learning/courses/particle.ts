import { starterCourse, source, up } from './shared';
export const particleCourse = starterCourse({
  id: 'particle',
  title: 'Particle Physics',
  group: 'modern',
  color: '#6fa1ed',
  model: 'particle',
  description: 'Connect relativistic particles, quantum fields, conservation laws, the Standard Model, and neutrino questions.',
  sources: [up(3, '5-9-relativistic-energy'), up(3, '11-2-particle-conservation-laws'), source('CERN: The Standard Model', 'https://home.web.cern.ch/science/physics/standard-model/'), source('CERN Yellow Reports: Neutrino Physics', 'https://e-publishing.cern.ch/index.php/CYR/article/view/434')],
  limitations: ['The model evaluates free-particle energy from invariant mass and momentum magnitude; it has no quantum fields, collisions, interactions, oscillations, or event detector.'],
  missions: [
        {
    id: 'relativistic-particles',
    title: 'Relativistic particles',
    summary: 'Energy and momentum fit one invariant relationship for both massive and massless free particles.',
    body: ['Momentum and energy change with the observing inertial frame, while rest mass is invariant. The energy-momentum relation connects all three without requiring a rest frame for a massless particle.', 'For zero mass, energy equals pc. For a massive particle at rest, energy is mc²; this remains even when momentum is zero.'],
    equation: 'E^2=(pc)^2+(mc^2)^2',
    symbols: [['E', 'total energy, J'], ['p', 'momentum magnitude, kg·m/s'], ['m', 'invariant mass, kg'], ['c', 'vacuum light speed, m/s'], ['^2', 'square each complete term'], ['+', 'add squared energy contributions']],
    math: 'geometry',
    mathNotes: ['Treat pc and mc² like the two legs of a right triangle in energy units. Square them, add them, and take the positive square root to find E.'],
    example: {
      question: 'If pc=3 J and mc²=4 J, find total energy.',
      steps: ['Square and add: 3²+4²=9+16=25 J².', 'Take √25.'],
      answer: '5 J.'
            },
    calculation: ['If pc=6 J and mc²=8 J, find total energy.', 10, 'J', 'The positive square root of 6²+8²=100 J² is 10 J.'],
    predict: ['Can a massless particle have nonzero energy?', ['Yes', 'No'], 0, 'At zero mass, the relation becomes E=pc and nonzero momentum gives nonzero energy.'],
    check: ['At zero momentum, a massive particle has what total energy?', ['Zero', 'mc²'], 1, 'The rest-energy term remains when the momentum term vanishes.'],
    lab: 'Compare zero and nonzero mass at fixed momentum, then set momentum to zero for a massive particle. Read total, rest, and kinetic energy separately and verify the limiting cases.',
    takeaway: 'Use the invariant relation without giving photons an impossible rest frame.',
    limitation: 'The model represents one free particle; it does not calculate interactions or a multiparticle invariant mass from vector momenta.'
        },
        {
    id: 'quantum-fields',
    title: 'Quantum fields',
    summary: 'Particle states are excitations of quantum fields, with interactions transferring energy and other conserved quantities.',
    body: ['A quantum field assigns quantum degrees of freedom throughout space. Particles appear as quantized excitations; that statement is richer than imagining tiny classical balls moving through a material medium.', 'For a free bosonic mode, adding one quantum increases energy by hf. The field’s dynamics and interactions require more mathematics than this starter’s discrete energy bookkeeping.'],
    equation: '\\Delta E=hf',
    symbols: [['\\Delta E', 'energy change when adding one free-mode quantum, J'], ['h', 'Planck constant, J·s'], ['f', 'mode frequency, Hz'], ['\\Delta', 'difference between adjacent occupation energies']],
    math: 'ratios',
    mathNotes: ['An energy difference cancels any common reference offset. Multiply frequency by h to obtain the spacing; the equation does not specify an interaction probability.'],
    example: {
      question: 'A mode has spacing 2 energy units. How much energy is added by three quanta?',
      steps: ['Each extra quantum adds the same 2 units.', 'Multiply 3×2.'],
      answer: '6 energy units.'
            },
    calculation: ['A free bosonic mode gains 5 quanta with spacing 3 units each. Find the energy increase.', 15, 'energy units', 'Five equally spaced excitation increments add 5×3=15 units.'],
    predict: ['Does the free-particle dispersion lab simulate an interacting quantum field?', ['No', 'Yes'], 0, 'A relation among energy, mass, and momentum contains no field interactions or scattering amplitudes.'],
    check: ['Does adding a field quantum create energy without a source?', ['Yes', 'No'], 1, 'Excitation energy must be supplied through an interaction or external preparation.'],
    lab: 'Set mass to zero and vary momentum in the particle lab. Observe the linear energy relation E=pc for free quanta. Explain that this gives dispersion information but not field amplitudes, creation events, or interaction dynamics.',
    takeaway: 'Distinguish free excitation energy from a full quantum-field calculation.',
    limitation: 'The mode example is bosonic and free; it is not a derivation of field quantization or an occupation rule for fermions.'
        },
        {
    id: 'symmetries',
    title: 'Symmetries',
    summary: 'Conservation laws constrain possible reactions before a detailed interaction calculation begins.',
    body: ['A symmetry describes a change in description or configuration that leaves the physical laws unchanged. Continuous symmetries connect to conserved quantities under the conditions of Noether’s theorem.', 'Electric charge conservation requires the same total charge before and after a reaction. Passing this test is necessary but not sufficient: energy, momentum, and other quantum numbers still constrain the process.'],
    equation: 'Q_{before}=Q_{after}',
    symbols: [['Q_{before}', 'sum of incoming electric charges, C'], ['Q_{after}', 'sum of outgoing electric charges, C']],
    math: 'signed-numbers',
    mathNotes: ['Add signed charges on each side. In examples, charge units e mean multiples of the positive elementary charge, not energy electron volts.'],
    example: {
      question: 'Initial charge is +1e. One outgoing particle has +2e. What charge must the other carry?',
      steps: ['Require outgoing charges to sum to +1e.', 'Compute +1e−2e.'],
      answer: '−1e.'
            },
    calculation: ['Incoming charge is 0e and one outgoing charge is +1e. Find the other charge in units of e.', -1, 'e', 'The outgoing sum must be zero, so the partner must carry −1e.'],
    predict: ['Does charge conservation alone guarantee an allowed reaction?', ['Yes', 'No'], 1, 'Other conservation laws and interaction dynamics must also be satisfied.'],
    check: ['Which statement is a symmetry claim?', ['The laws are unchanged by a specified transformation', 'Every collision has the same outcome'], 0, 'Symmetry is invariance of laws, not identity of individual outcomes.'],
    lab: 'Vary momentum in the free-particle lab and record energy. Use the readouts to form a separate energy-budget constraint for a hypothetical reaction. No charge input exists, so charge conservation must be checked with the authored charge exercise.',
    takeaway: 'Treat conservation tests as necessary constraints, not complete reaction predictions.',
    limitation: 'Noether’s theorem is introduced qualitatively; the lab neither assigns particle charge nor decides which interactions are allowed.'
        },
        {
    id: 'standard-model',
    title: 'Standard Model',
    summary: 'The Standard Model organizes quarks, leptons, and interactions while leaving gravity outside its scope.',
    body: ['Quarks and leptons form the matter families. Gauge fields describe strong, electromagnetic, and weak interactions; the Higgs field participates in the mass-generation mechanism for elementary particles.', 'A proton is a composite state, not an elementary entry. Its two up and one down valence quarks give its net charge, while much of its mass reflects strong-interaction energy rather than the sum of bare quark masses.'],
    equation: 'Q_p=2Q_u+Q_d',
    symbols: [['Q_p', 'proton charge'], ['Q_u', 'up-quark charge, +2e/3'], ['Q_d', 'down-quark charge, −e/3'], ['e', 'positive elementary charge'], ['2', 'two up valence quarks'], ['+', 'sum constituent charges']],
    math: 'fractions',
    mathNotes: ['Use a common denominator of three to add quark charges. This valence charge bookkeeping does not claim that a proton contains only three noninteracting objects.'],
    example: {
      question: 'Find the proton charge from two up quarks and one down quark.',
      steps: ['Add the up contributions: 2×(2/3)e=4e/3.', 'Add −e/3 to get 3e/3.'],
      answer: '+e.'
            },
    calculation: ['A neutron has one up and two down valence quarks. Find its net charge in units of e.', 0, 'e', 'The sum is 2/3−1/3−1/3=0.'],
    predict: ['Is gravity included in the Standard Model of particle physics?', ['No', 'Yes'], 0, 'The Standard Model describes strong, weak, and electromagnetic interactions, while gravity needs additional theory.'],
    check: ['Is a proton an elementary particle in the Standard Model?', ['Yes', 'No'], 1, 'A proton is a strongly interacting composite state built from quarks, gluons, and their dynamics.'],
    lab: 'Compare two prescribed masses at equal momentum in the particle lab. Note that the model accepts mass as an input; it cannot explain the Higgs mechanism, proton binding, or a particle’s place in the Standard Model.',
    takeaway: 'Distinguish elementary particles, composite particles, and the model’s interaction scope.',
    limitation: 'The lab is not a Standard Model solver; mass inputs do not identify particle species or predict scattering cross sections.'
        },
        {
    id: 'neutrinos-and-open-questions',
    title: 'Neutrinos and open questions',
    summary: 'Neutrino flavor changes are observed; the full origin and pattern of neutrino masses remain research questions.',
    status: 'active-research',
    body: ['Neutrinos produced with one flavor can later be detected with another. Established oscillation evidence requires nontrivial mixing and mass-squared differences, extending the minimal massless-neutrino Standard Model.', 'A simple two-flavor approximation gives an oscillating transition probability. The absolute mass scale, ordering details, and whether neutrinos are their own antiparticles are distinct questions, not reasons to label the observed oscillation effect speculative.'],
    equation: 'P=\\sin^2(2\\theta)\\sin^2\\phi',
    symbols: [['P', 'two-flavor transition probability'], ['\\theta', 'mixing angle'], ['\\phi', 'dimensionless propagation phase'], ['\\sin^2 z', 'take sine of z and square the result']],
    math: 'sine',
    mathNotes: ['Each squared sine lies between zero and one. Multiply the mixing factor by the phase factor; this path supplies factors numerically rather than deriving the phase from masses and baseline.'],
    example: {
      question: 'If the mixing factor is 0.8 and the phase factor 0.5, find P.',
      steps: ['Identify the two nonnegative probability factors.', 'Multiply 0.8×0.5.'],
      answer: '0.4.'
            },
    calculation: ['Mixing and phase factors are 0.6 and 0.5. Find transition probability.', 0.3, 'probability', 'The two-flavor illustration gives 0.6×0.5=0.3.'],
    predict: ['Does observed flavor change mean the absolute neutrino mass is fully known?', ['Yes', 'No'], 1, 'Oscillations constrain mixing and mass-squared differences, not the entire absolute mass scale.'],
    check: ['What evidence label fits observed neutrino oscillation?', ['Established effect', 'Speculative proposal'], 0, 'The effect is experimentally established even while its deeper mass mechanism remains under study.'],
    lab: 'Use a very small nonzero mass in the free-particle lab and compare total energy with pc at large momentum. This illustrates relativistic kinematics only; no flavor labels, mass-state mixing, or oscillation baseline are modeled.',
    takeaway: 'Separate measured oscillation phenomena from unresolved mass mechanisms.',
    limitation: 'The two-flavor formula omits three-flavor interference and matter effects; the lab does not calculate oscillation probabilities.'
        },
    ],
});
