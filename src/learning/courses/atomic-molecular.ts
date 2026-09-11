import { starterCourse, up } from './shared';
export const atomicMolecularCourse = starterCourse({
  id: 'atomic-molecular',
  title: 'Atomic and Molecular',
  group: 'modern',
  color: '#d275b7',
  model: 'atomic',
  description: 'Read spectral energy differences, the hydrogen scale, orbitals, chemical bonds, and stimulated emission.',
  sources: [up(3, '6-4-bohrs-model-of-the-hydrogen-atom'), up(3, '8-1-the-hydrogen-atom'), up(3, '8-5-atomic-spectra-and-x-rays'), up(3, '8-6-lasers'), up(3, '9-1-types-of-molecular-bonds')],
  limitations: ['The lab gives isolated hydrogen levels using a rounded 13.6 eV scale. It has no orbital shapes, many-electron interactions, molecules, or laser dynamics.'],
  missions: [
        {
    id: 'spectra',
    title: 'Spectra',
    summary: 'A spectral line records an energy difference between allowed atomic states.',
    body: ['Atoms absorb or emit photons at specific energy differences. The photon energy identifies a transition, rather than the absolute energy of either state by itself.', 'In emission, the atom ends in a lower-energy state and the positive photon energy is the initial minus final atomic energy. Absorption reverses that transfer.'],
    equation: 'E_\\gamma=E_i-E_f',
    symbols: [['E_\\gamma', 'emitted photon energy, J'], ['E_i', 'initial atomic energy, J'], ['E_f', 'final atomic energy, J'], ['-', 'subtract signed final energy']],
    math: 'signed-numbers',
    mathNotes: ['Bound-state energies are negative relative to an ionized reference. Subtracting a more negative final value gives a positive emitted energy.'],
    example: {
      question: 'An atom falls from −2 J to −5 J in a toy energy diagram. Find emitted energy.',
      steps: ['Use initial minus final: −2−(−5).', 'Subtracting a negative adds 5.'],
      answer: '3 J; these toy energies illustrate signs, not atomic scales.'
            },
    calculation: ['A toy level falls from −3 energy units to −7. Find the emitted energy.', 4, 'energy units', 'The released energy is −3−(−7)=4 positive energy units.'],
    predict: ['Emission leaves the atom in which state?', ['Lower energy', 'Higher energy'], 0, 'The emitted photon takes energy away from the atom.'],
    check: ['A line measures what directly in the level model?', ['A difference between levels', 'The entire atomic rest energy'], 0, 'Photon energy corresponds to the transition difference, not an absolute state energy.'],
    lab: 'Record hydrogen energy in joules for n=2 and n=1. Subtract the latter from the former to obtain the positive 2→1 emission energy. The lab lists levels but does not generate a spectrum.',
    takeaway: 'Use signed level differences to infer photon energies.',
    limitation: 'Not every imaginable level pair gives a strong allowed line; selection rules and intensities are beyond the level-only model.'
        },
        {
    id: 'bohr-scale',
    title: 'Bohr scale',
    summary: 'Hydrogen’s negative energies crowd together as the principal quantum number increases.',
    body: ['The principal quantum number labels an energy family in isolated hydrogen. Bound levels sit below the zero assigned to a separated electron and proton at rest.', 'The inverse-square energy scale reproduces the leading hydrogen spectrum. Bohr’s historical orbit picture is not a literal description of an electron trajectory in modern quantum theory.'],
    equation: 'E_n=-13.6\\,\\mathrm{eV}/n^2',
    symbols: [['E_n', 'hydrogen level energy relative to ionization'], ['n', 'positive integer principal quantum number'], ['eV', 'electron volt; 1 eV=1.602176634×10⁻¹⁹ J'], ['n^2', 'n multiplied by itself'], ['-', 'bound energy below the reference']],
    math: 'powers',
    mathNotes: ['Square the positive integer n before dividing the negative scale. Convert to joules by multiplying the eV value by the joules-per-eV conversion.'],
    example: {
      question: 'Find the n=2 hydrogen energy on this rounded scale.',
      steps: ['Square n: 2²=4.', 'Divide −13.6 eV by 4.'],
      answer: '−3.4 eV, about −5.45×10⁻¹⁹ J.'
            },
    calculation: ['Using the rounded scale, find the n=4 energy in eV.', -0.85, 'eV', 'The denominator is 4²=16, so the energy is −13.6/16=−0.85 eV.'],
    predict: ['As n increases, bound energy approaches what?', ['Zero from below', 'Negative infinity'], 0, 'The denominator grows while the negative energy magnitude shrinks.'],
    check: ['Does the model’s n specify a measured circular electron orbit?', ['Yes', 'No'], 1, 'It labels an energy level; modern stationary states are not classical trajectories.'],
    lab: 'Compare n=1, 2, and 4 in both energy and ionization-energy readouts. Verify that level energy stays negative while energy needed to reach zero stays positive.',
    takeaway: 'Read bound energies relative to a stated ionization reference.',
    limitation: 'The rounded hydrogen formula omits fine structure, reduced mass, external fields, and many-electron atoms.'
        },
        {
    id: 'orbitals',
    title: 'Orbitals',
    summary: 'An orbital is a spatial quantum state, not a track followed by an electron.',
    body: ['An orbital provides probability amplitudes across space. Its density predicts where repeated position measurements are likely, while nodal regions can have zero density.', 'Equal probability in two regions means equal expected counts across repeated preparations. It does not mean one electron is split into two classical fragments or that a single measurement reveals a continuous cloud.'],
    equation: 'P(A)+P(B)=1',
    symbols: [['P(A)', 'probability in region A'], ['P(B)', 'probability in complementary region B'], ['+', 'add mutually exclusive alternatives'], ['1', 'certainty across all space']],
    math: 'fractions',
    mathNotes: ['A and B must be disjoint and cover all possible outcomes. Subtract one probability from one to obtain the other.'],
    example: {
      question: 'If region A has probability 0.7 and B is its complement, find P(B).',
      steps: ['All outcomes have total probability one.', 'Compute 1−0.7.'],
      answer: '0.3.'
            },
    calculation: ['An orbital has probability 0.4 in region A. Find the probability outside A.', 0.6, 'probability', 'The complement has probability 1−0.4=0.6.'],
    predict: ['Is an orbital a sharply defined classical path?', ['No', 'Yes'], 0, 'An orbital supplies amplitudes and probabilities, not a trajectory.'],
    check: ['Can n alone specify a complete orbital shape?', ['Yes', 'No'], 1, 'Additional angular quantum numbers are needed; n alone mainly labels the hydrogen energy family.'],
    lab: 'Hold n fixed in the hydrogen lab and inspect the energy readout. Note that there are no angular-state controls. Use that absence to explain why equal energy information does not identify an orbital’s spatial shape.',
    takeaway: 'Distinguish an orbital’s probability structure from a classical orbit.',
    limitation: 'Orbital angular functions and their calculus are not required here; the hydrogen lab does not compute spatial orbitals.'
        },
        {
    id: 'bonds',
    title: 'Bonds',
    summary: 'A stable bond has lower energy than the same separated atoms in the stated reference states.',
    body: ['As atoms approach, electronic and nuclear interactions change the total energy. A stable molecular separation balances attractive and repulsive effects near an energy minimum.', 'Breaking a bond requires energy relative to that bound state. Real molecular energies depend on electronic structure and vibrational state, so isolated hydrogen levels cannot predict a general molecule’s bond strength.'],
    equation: 'D=E_{separated}-E_{bound}',
    symbols: [['D', 'dissociation energy, J'], ['E_{separated}', 'energy of separated fragments in stated states, J'], ['E_{bound}', 'energy of initial bound molecule, J'], ['-', 'energy difference']],
    math: 'signed-numbers',
    mathNotes: ['Choose the same energy reference for both terms. A bound state below the separated energy yields positive dissociation energy.'],
    example: {
      question: 'On a toy diagram, separated atoms have 0 units and the molecule −5 units. Find D.',
      steps: ['Keep the separated reference at zero.', 'Compute 0−(−5).'],
      answer: '5 energy units required.'
            },
    calculation: ['Separated fragments have 0 units and a bound state −8 units. Find dissociation energy.', 8, 'energy units', 'Reaching the separated reference requires 0−(−8)=8 units.'],
    predict: ['Does forming a lower-energy bond release energy overall?', ['Yes, if that energy is transferred away', 'No, a lower state needs added energy'], 0, 'The energy drop must be carried away, for example through radiation or collisions.'],
    check: ['Can the isolated-hydrogen n control predict a molecular bond energy?', ['Yes', 'No'], 1, 'Bonding needs interacting atoms and electronic structure absent from the isolated-atom model.'],
    lab: 'Read hydrogen ionization energy as a related example of energy needed to unbind a system. Compare it with negative level energy. Explain why this atomic binding analogy does not calculate a molecular dissociation energy.',
    takeaway: 'Measure bond strength against explicitly specified separated fragments.',
    limitation: 'The toy example is energy bookkeeping, not a computed molecular potential or a chemical reaction prediction.'
        },
        {
    id: 'lasers',
    title: 'Lasers',
    summary: 'Stimulated emission can amplify a suitable optical mode when an externally maintained population inversion supplies energy.',
    body: ['An incoming resonant field can stimulate an excited atom to emit into the same optical mode. Absorption competes with this process, so net gain requires a suitable population inversion and continued pumping.', 'A resonator selects modes and feeds light back through the gain medium. Photon energy still equals the transition energy; stimulated emission does not create energy from nothing.'],
    equation: 'N_2>N_1',
    symbols: [['N_2', 'upper-level population in an ideal equal-degeneracy two-level comparison'], ['N_1', 'lower-level population in that comparison'], ['>', 'strictly greater than']],
    math: 'arithmetic',
    mathNotes: ['Compare counts, not the numerical level labels. This simplified inversion inequality assumes equal statistical weights; actual lasers often use three or four effective levels.'],
    example: {
      question: 'Upper and lower populations are 60 and 40 in an equal-degeneracy toy medium. Is it inverted?',
      steps: ['Compare 60 with 40.', 'The upper population exceeds the lower by 20.'],
      answer: 'Yes; inversion excess is 20 particles.'
            },
    calculation: ['A toy medium has 80 upper-level and 30 lower-level particles. Find the inversion excess N₂−N₁.', 50, 'particles', 'The excess is 80−30=50 particles in this equal-degeneracy comparison.'],
    predict: ['Where does the energy of sustained laser output come from?', ['A pumping source', 'Nothing; stimulation creates it'], 0, 'External pumping restores excited populations and supplies output energy.'],
    check: ['Is a hydrogen energy-level gap by itself a working laser?', ['Yes', 'No'], 1, 'A working laser needs a gain mechanism, population dynamics, losses, and usually optical feedback.'],
    lab: 'Choose two hydrogen levels and calculate their positive gap as a possible transition energy. Identify the missing ingredients—populations, pumping, transition strengths, and cavity loss—that prevent this level-only lab from predicting laser operation.',
    takeaway: 'Separate transition energy from the conditions for optical gain.',
    limitation: 'The inversion criterion is a simplified equal-degeneracy comparison; no hydrogen laser or laser rate equations are simulated.'
        },
    ],
});
