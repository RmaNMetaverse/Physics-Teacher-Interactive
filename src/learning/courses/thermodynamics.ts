import { starterCourse, up } from './shared';
export const thermodynamicsCourse = starterCourse({
  id: 'thermodynamics',
  title: 'Thermodynamics',
  group: 'classical',
  color: '#f27562',
  model: 'thermal',
  description: 'Connect microscopic motion with temperature, gas pressure, heat, entropy, and engine limits.',
  sources: [up(2, '2-1-molecular-model-of-an-ideal-gas'), up(2, '3-3-first-law-of-thermodynamics'), up(2, '4-5-the-carnot-cycle'), up(2, '4-6-entropy')],
  limitations: ['The simulation evaluates equilibrium PV=nRT only. It does not simulate heat transfer, molecular trajectories, entropy production, or engine cycles.'],
  missions: [
        {
    id: 'microscopic-temperature',
    title: 'Microscopic temperature',
    summary: 'Temperature connects a macroscopic thermometer to the distribution of microscopic motion.',
    body: ['An ideal gas contains particles moving in many directions with a spread of speeds. Temperature measures a statistical property of that motion, not the speed of every particle.', 'For a classical monatomic ideal gas, mean translational kinetic energy per particle is proportional to absolute temperature. More particles increase total energy without necessarily changing temperature.'],
    equation: '\\langle K\\rangle=3k_BT/2',
    symbols: [['\\langle K\\rangle', 'mean translational energy per particle, J'], ['k_B', 'Boltzmann constant, 1.380649 × 10⁻²³ J/K'], ['T', 'absolute temperature, K'], ['\\langle\\rangle', 'average over many particles']],
    math: 'ratios',
    mathNotes: ['Multiply temperature by Boltzmann’s constant, then by three halves. Angle brackets mean an average; individual particles need not have that energy.'],
    example: {
      question: 'Using kB≈1.38×10⁻²³ J/K, find mean translational energy at 300 K.',
      steps: ['Multiply 1.38×10⁻²³ by 300 to obtain 4.14×10⁻²¹ J.', 'Multiply by 1.5.'],
      answer: '6.21×10⁻²¹ J per particle.'
            },
    calculation: ['If mean translational energy is 6 units at 300 K, what is it at 600 K?', 12, 'same energy units', 'At fixed gas assumptions, doubling absolute temperature doubles mean translational energy.'],
    predict: ['Do all particles at one temperature have exactly the same speed?', ['Yes', 'No'], 1, 'Temperature characterizes an ensemble with a distribution of particle speeds.'],
    check: ['Adding more gas at fixed temperature changes which quantity?', ['Mean energy per particle necessarily', 'Total gas energy'], 1, 'More particles add energy even when each particle’s mean energy is unchanged.'],
    lab: 'At fixed amount and volume, compare 300 K and 600 K in the gas lab. Pressure doubles as the gas becomes hotter. Interpret that macroscopic result without treating the lab as a molecular trajectory simulation.',
    takeaway: 'Use kelvin and distinguish per-particle energy from total energy.',
    limitation: 'The three-halves relation describes translational energy in a classical gas, not every internal degree of freedom.'
        },
        {
    id: 'ideal-gas',
    title: 'Ideal gas',
    summary: 'Pressure, volume, amount, and temperature constrain each other in an equilibrium ideal gas.',
    body: ['Molecules transfer momentum to container walls, producing pressure. A smaller volume at the same temperature and amount increases the collision rate per area.', 'The ideal-gas equation organizes this behavior with amount measured in moles. It is an approximation: finite molecular volume and attractive interactions matter in dense or near-condensing gases.'],
    equation: 'P=nRT/V',
    symbols: [['P', 'pressure, Pa'], ['n', 'amount, mol'], ['R', 'gas constant, 8.31446 J/(mol·K)'], ['T', 'temperature, K'], ['V', 'volume, m³']],
    math: 'algebra',
    mathNotes: ['PV=nRT becomes P=nRT/V by dividing both sides by positive volume. Use cubic meters, not liters, in this SI form.'],
    example: {
      question: 'Estimate pressure for 1 mol at 300 K in 1 m³ using R=8.31.',
      steps: ['Compute nRT = 1 × 8.31 × 300 = 2493 J.', 'Divide by 1 m³.'],
      answer: '2493 Pa.'
            },
    calculation: ['At fixed amount and temperature, pressure is 2000 Pa in 1 m³. Find pressure in 2 m³.', 1000, 'Pa', 'The product PV stays constant, so doubling volume halves pressure.'],
    predict: ['At fixed amount and temperature, compression raises what?', ['Pressure', 'Absolute temperature necessarily'], 0, 'In this comparison temperature is held fixed and pressure increases inversely with volume.'],
    check: ['Which temperature belongs in PV=nRT?', ['Degrees Celsius', 'Kelvin'], 1, 'Absolute temperature in kelvin is required for proportional gas laws.'],
    lab: 'Set amount to 1 mol and temperature to 300 K. Compare volumes 1 and 2 m³; record pressure and PV. Explain why pressure changes while their product remains constant.',
    takeaway: 'Hold two gas variables fixed before predicting a third.',
    limitation: 'No phase transition or real-gas correction is included; extreme controls are mathematical idealizations.'
        },
        {
    id: 'first-law',
    title: 'First law',
    summary: 'Heat and work are energy transfers across a chosen system boundary.',
    body: ['Internal energy belongs to the system. Heat and work describe ways energy crosses its boundary, so a gas does not contain a stored quantity called heat.', 'Choose the sign convention before calculating: heat entering is positive, and work done by the gas is positive here. Energy given to the surroundings reduces the energy left inside.'],
    equation: '\\Delta U=Q-W',
    symbols: [['\\Delta U', 'internal-energy change, J'], ['Q', 'heat entering the system, J'], ['W', 'work done by the system, J'], ['-', 'subtract energy leaving as work'], ['\\Delta', 'final minus initial']],
    math: 'signed-numbers',
    mathNotes: ['Track transfers with signs. Negative Q means heat leaves; negative W means work is done on the gas.'],
    example: {
      question: 'A gas absorbs 100 J and does 40 J of work. Find its energy change.',
      steps: ['Use Q=+100 J and W=+40 J.', 'Subtract 100 − 40.'],
      answer: '+60 J.'
            },
    calculation: ['A gas absorbs 90 J and does 30 J of work. Find ΔU.', 60, 'J', 'With work-by-system positive, ΔU=90−30=60 J.'],
    predict: ['Can work alone increase internal energy?', ['No', 'Yes, when done on the system'], 1, 'Negative work-by-system adds to internal energy even without heat transfer.'],
    check: ['What is heat in this accounting?', ['Energy in transit due to temperature difference', 'A substance stored inside matter'], 0, 'Heat names a transfer process, while internal energy is a state property.'],
    lab: 'Compare gas states at the same volume but different temperatures. Pressure changes. At fixed volume boundary work is zero, so heating can raise internal energy; this lab gives equilibrium endpoints and does not measure the heat transferred.',
    takeaway: 'Write a sign convention and conserve energy across the boundary.',
    limitation: 'Only pressure-volume boundary work is discussed; the lab does not determine a thermodynamic path or heat capacity.'
        },
        {
    id: 'entropy',
    title: 'Entropy',
    summary: 'Energy conservation alone does not tell us which direction a thermal process will run.',
    body: ['Heat flows spontaneously from hotter to colder surroundings. Energy can be conserved in the reverse transfer too, but reversing it without other changes conflicts with the second law.', 'Entropy is a state quantity. For reversible heat transfer at constant temperature its change is heat divided by temperature. Entropy can leave a subsystem; the total entropy of an isolated combination cannot decrease.'],
    equation: '\\Delta S=Q_{rev}/T',
    symbols: [['\\Delta S', 'entropy change, J/K'], ['Q_{rev}', 'heat on a reversible path, J'], ['T', 'constant absolute temperature, K'], ['rev', 'reversible reference path'], ['\\Delta', 'change in a state quantity']],
    math: 'ratios',
    mathNotes: ['Divide transferred heat by kelvin temperature. For an irreversible process, use a reversible reference path between the same states; actual Q/T is not a universal formula.'],
    example: {
      question: 'A reversible isothermal transfer adds 600 J at 300 K. Find ΔS.',
      steps: ['Identify a constant-temperature reversible path.', 'Divide 600 by 300.'],
      answer: '+2 J/K.'
            },
    calculation: ['Find ΔS for reversible heat input 900 J at constant 300 K.', 3, 'J/K', 'For this reversible isothermal transfer, ΔS=900/300=3 J/K.'],
    predict: ['Can a refrigerator decrease the entropy of its cooled contents?', ['Yes, while increasing total entropy elsewhere', 'No subsystem entropy can decrease'], 0, 'A subsystem can export entropy; the second law constrains the complete isolated combination.'],
    check: ['Can you use actual Q/T for every irreversible process?', ['Yes', 'No'], 1, 'Entropy changes require a reversible reference calculation or a full entropy balance.'],
    lab: 'Use the gas lab to choose two volumes at equal temperature. Record their pressures and note that these endpoints do not identify whether expansion was reversible. The lab cannot infer entropy production from endpoints alone.',
    takeaway: 'Apply the second law to the full system plus surroundings.',
    limitation: 'The formula shown is for reversible constant-temperature transfer, not a general irreversible entropy calculation.'
        },
        {
    id: 'engines-and-limits',
    title: 'Engines and limits',
    summary: 'A cyclic engine must reject some heat when operating between finite-temperature reservoirs.',
    body: ['An engine takes heat from a hot reservoir, delivers net work, and returns to its starting state. Because its internal energy returns to the initial value, work comes from the difference between heat input and rejected heat.', 'The Carnot efficiency is the reversible upper bound between two reservoir temperatures. Real friction, finite-temperature heat flow, and other losses reduce efficiency below that ceiling.'],
    equation: '\\eta_{max}=1-T_c/T_h',
    symbols: [['\\eta_{max}', 'maximum efficiency, dimensionless'], ['T_c', 'cold-reservoir temperature, K'], ['T_h', 'hot-reservoir temperature, K'], ['1', 'the whole input energy fraction'], ['-', 'subtract the rejected fraction']],
    math: 'fractions',
    mathNotes: ['Divide cold by hot temperature, both in kelvin, then subtract from one. Multiply the resulting fraction by 100 to express percent.'],
    example: {
      question: 'Find the ceiling for Th=600 K and Tc=300 K.',
      steps: ['Compute Tc/Th=300/600=0.5.', 'Subtract 1−0.5.'],
      answer: '0.5, or 50%.'
            },
    calculation: ['For Th=800 K and Tc=400 K, find the maximum efficiency as a fraction.', 0.5, 'fraction', 'The ratio is 400/800=0.5, so the Carnot limit is 0.5.'],
    predict: ['Can a real engine exceed the reversible limit for the same reservoirs?', ['Yes', 'No'], 1, 'The reversible engine gives the upper bound under the same reservoir conditions.'],
    check: ['Does the gas-law lab alone compute engine efficiency?', ['No, a cycle and transfers are needed', 'Yes, one pressure is enough'], 0, 'Efficiency requires net work and heat input over a cycle, not one equilibrium state.'],
    lab: 'Compare 300 K and 600 K gas states at fixed amount and volume. Use those temperatures as hypothetical reservoirs in the worked calculation. The gas lab demonstrates their equilibrium pressures, not an engine cycle.',
    takeaway: 'Distinguish a reversible efficiency ceiling from a real engine performance claim.',
    limitation: 'Carnot’s bound assumes two fixed-temperature reservoirs and a cyclic heat engine; it is not a design efficiency prediction.'
        },
    ],
});
