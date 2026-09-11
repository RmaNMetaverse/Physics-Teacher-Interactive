import { starterCourse, source, up } from './shared';
export const cosmologyFrontiersCourse = starterCourse({
  id: 'cosmology-frontiers',
  title: 'Cosmology and Frontiers',
  group: 'frontier',
  color: '#ba79cc',
  model: 'cosmology',
  description: 'Follow expansion and cosmic evidence, then distinguish tested models from unconfirmed proposals.',
  sources: [up(3, '11-6-the-big-bang'), source('NASA: Dark energy evidence', 'https://science.nasa.gov/mission/hubble/science/science-behind-the-discoveries/hubble-dark-energy/'), source('ESA: Planck and the cosmic microwave background', 'https://www.esa.int/Science_Exploration/Space_Science/Planck/Planck_and_the_cosmic_microwave_background'), source('NASA: Dark matter', 'https://science.nasa.gov/dark-matter/'), source('Einstein Online: Quantum gravity', 'https://www.einstein-online.info/en/complete_spotlights/')],
  limitations: ['The lab uses the fixed-epoch local linear Hubble law with proper distance. It does not fit cosmological data, evolve expansion, infer an age, or test quantum-gravity frameworks.'],
  missions: [
        {
    id: 'expansion',
    title: 'Expansion',
    summary: 'On sufficiently large nearby scales, recession velocity tends to increase with distance.',
    body: ['Cosmic expansion changes separations between freely comoving regions. It does not mean every gravitationally bound system, such as the Solar System, expands in step with the universe.', 'The local Hubble law relates recession speed and proper distance at one epoch. Peculiar velocities add scatter, and the inverse expansion rate is a characteristic timescale rather than a direct age measurement.'],
    equation: 'v=H_0d',
    symbols: [['v', 'local recession speed, m/s'], ['H_0', 'present-epoch expansion rate, s⁻¹'], ['d', 'proper distance at the stated epoch, m']],
    math: 'rates',
    mathNotes: ['Multiply inverse seconds by meters to obtain meters per second. The subscript zero labels a chosen present epoch, not zero expansion.'],
    example: {
      question: 'Use H₀=2×10⁻¹⁸ s⁻¹ and d=3×10²² m. Find v.',
      steps: ['Multiply coefficients 2×3=6.', 'Add exponents −18+22=4.'],
      answer: '6×10⁴ m/s.'
            },
    calculation: ['Use H₀=2e-18 s⁻¹ and d=5e22 m. Find v.', 1e5, 'm/s', 'The local linear law gives 2×10⁻¹⁸×5×10²²=10⁵ m/s.'],
    predict: ['Does cosmic expansion force every bound atom to grow?', ['No', 'Yes'], 0, 'Bound systems are governed by their local interactions and need not follow comoving expansion.'],
    check: ['Is 1/H₀ automatically the exact age of the universe?', ['Yes', 'No'], 1, 'The age depends on expansion history, while 1/H₀ is the inverse rate at one epoch.'],
    lab: 'Hold Hubble constant fixed and double distance. Verify recession speed doubles. Compare inverse-Hubble-time readout at two constants and label it a timescale, not an inferred cosmic age.',
    takeaway: 'Use the local expansion law with a stated epoch and distance definition.',
    limitation: 'The linear low-redshift model excludes peculiar velocities, lookback evolution, and cosmological distance conversion.'
        },
        {
    id: 'cosmic-background',
    title: 'Cosmic background',
    summary: 'The cosmic microwave background is cooled relic radiation from the early hot universe.',
    body: ['The early universe was hot and ionized, so photons scattered frequently. As neutral atoms formed, photons could travel much more freely; cosmic expansion stretched their wavelengths afterward.', 'The observed near-blackbody background and its anisotropies provide evidence for a hot early universe. In the standard expanding picture, freely propagating radiation temperature scales inversely with the scale factor.'],
    equation: 'T=T_0(1+z)',
    symbols: [['T', 'radiation temperature at redshift z, K'], ['T_0', 'present radiation temperature, K'], ['z', 'cosmological redshift, dimensionless'], ['1+z', 'wavelength-stretch ratio relative to emission']],
    math: 'ratios',
    mathNotes: ['Add one to redshift, then multiply by the present temperature. This scaling assumes cosmological expansion and adiabatically cooling background radiation.'],
    example: {
      question: 'Using T₀≈2.7 K, estimate radiation temperature at z=9.',
      steps: ['Compute 1+z=10.', 'Multiply 2.7×10.'],
      answer: '27 K.'
            },
    calculation: ['Using T₀=2.7 K, find the temperature at z=3.', 10.8, 'K', 'The factor is 1+3=4, so temperature is 2.7×4=10.8 K.'],
    predict: ['Was the background radiation hotter at earlier high redshift?', ['Yes', 'No'], 0, 'Expansion stretches wavelengths and lowers the radiation temperature over time.'],
    check: ['Does the local Hubble lab calculate a CMB anisotropy map?', ['Yes', 'No'], 1, 'It has no radiation field, recombination model, or perturbation evolution.'],
    lab: 'Inspect how the local Hubble lab relates distance and recession speed at one epoch. Contrast that single-epoch relation with the redshift-temperature scaling: no redshift or background-temperature input exists in the lab.',
    takeaway: 'Treat the background as evidence of a hot past, distinct from a local recession calculation.',
    limitation: 'The redshift scaling is a cosmological model relation; the lab cannot infer redshift from distant-universe distance or predict CMB fluctuations.'
        },
        {
    id: 'dark-matter-evidence',
    title: 'Dark matter evidence',
    summary: 'Gravitational observations indicate more gravitating matter than the luminous material alone accounts for.',
    status: 'active-research',
    body: ['Galaxy motions, gravitational lensing, and cosmic structure provide converging evidence for a missing gravitational contribution when analyzed with standard gravity. Different measurements constrain different aspects of that inference.', 'Dark matter names the inferred component; its microscopic identity remains unresolved. A spherical circular-orbit estimate can translate speed and radius into enclosed mass, but is not by itself a complete galaxy analysis.'],
    equation: 'M(<r)=v^2r/G',
    symbols: [['M(<r)', 'inferred mass enclosed within radius r, kg'], ['v', 'circular orbital speed, m/s'], ['r', 'orbital radius, m'], ['G', 'gravitational constant, m³/(kg·s²)'], ['v^2', 'speed squared']],
    math: 'powers',
    mathNotes: ['Square speed, multiply radius, and divide by G. The symbol < inside the label means mass inside the radius; it is not a separate inequality to solve.'],
    example: {
      question: 'At fixed radius, an inferred mass is M for speed v. What mass is inferred for 2v?',
      steps: ['The speed ratio enters squared.', 'Compute 2²=4.'],
      answer: '4M under the same orbital assumptions.'
            },
    calculation: ['At fixed circular speed, enclosed mass is 5 units at radius r. What is it at 2r?', 10, 'mass units', 'With speed fixed, the inferred enclosed mass is proportional to radius and doubles.'],
    predict: ['Does gravitational evidence alone identify a particular dark-matter particle?', ['Yes', 'No'], 1, 'The evidence constrains gravitating matter without uniquely fixing its microscopic identity.'],
    check: ['Which is an independent gravitational probe beyond orbital motion?', ['Lensing of background light', 'Only visible color'], 0, 'Gravitational lensing responds to the projected gravitating distribution and complements motion measurements.'],
    lab: 'Change distance in the Hubble lab and inspect recession speed. Distinguish that cosmological separation rate from orbital speed in the mass estimate: inserting Hubble recession into a galaxy rotation formula would mix incompatible models.',
    takeaway: 'Separate gravitational evidence for a component from claims about its particle identity.',
    limitation: 'The mass estimate assumes circular motion and spherical symmetry; the lab has no galaxy rotation curve or lensing calculation.'
        },
        {
    id: 'dark-energy-evidence',
    title: 'Dark energy evidence',
    summary: 'Distance and expansion-history measurements support accelerated expansion; its physical cause remains under investigation.',
    status: 'active-research',
    body: ['Distant supernova distances, combined with other cosmological observations, support late-time accelerated expansion in standard cosmological models. This concerns how expansion changes with time, not merely a nonzero present Hubble rate.', 'A cosmological constant is one model for the inferred dark-energy component. Its effective equation-of-state parameter is −1; this is a model description, not a direct identification of an unknown substance.'],
    equation: 'w=p/(\\rho c^2)',
    symbols: [['w', 'dimensionless equation-of-state parameter'], ['p', 'effective pressure, Pa'], ['\\rho', 'mass-equivalent energy density, kg/m³'], ['c', 'vacuum light speed, m/s'], ['\\rho c^2', 'energy density, J/m³']],
    math: 'signed-numbers',
    mathNotes: ['Pressure and energy density share SI dimensions, so their ratio is dimensionless. Negative pressure gives negative w when energy density is positive.'],
    example: {
      question: 'If effective pressure is minus the energy density, what is w?',
      steps: ['Write p=−ρc².', 'Divide by positive ρc².'],
      answer: '−1, the cosmological-constant value.'
            },
    calculation: ['If p=−2 units and ρc²=4 matching units, find w.', -0.5, 'ratio', 'Divide signed pressure by energy density: −2/4=−0.5.'],
    predict: ['Does a positive H₀ alone establish accelerating expansion?', ['No', 'Yes'], 0, 'Acceleration needs expansion-history information, not just the sign of the current rate.'],
    check: ['Does w=−1 uniquely identify a measured microscopic dark-energy mechanism?', ['Yes', 'No'], 1, 'It characterizes a cosmological-constant-like effective description without resolving the physical origin.'],
    lab: 'Compare two Hubble constants at fixed distance. The changed recession speed represents different fixed-epoch models, not a time history. Explain why this comparison cannot establish cosmic acceleration or fit w.',
    takeaway: 'Distinguish expansion, acceleration evidence, and proposed physical causes.',
    limitation: 'The local linear model does not solve the Friedmann equations or constrain a time-dependent dark-energy equation of state.'
        },
        {
    id: 'tested-knowledge-versus-proposals',
    title: 'Tested knowledge versus proposals',
    summary: 'A mathematically interesting framework becomes established physics through discriminating evidence.',
    status: 'speculative',
    body: ['String theory, loop quantum gravity, multiverse scenarios, and other unconfirmed frameworks are speculative in this survey. They pursue difficult questions but do not have the status of the measured expansion, quantum probabilities, or gravitational phenomena used earlier.', 'A proposal needs clear assumptions and predictions that distinguish it from alternatives. Agreement with one existing datum is not sufficient if many models fit it; uncertainty, systematic errors, and out-of-sample tests all matter.'],
    equation: 'r=(O-P)/u',
    symbols: [['r', 'signed residual in uncertainty units'], ['O', 'observed value'], ['P', 'predicted value in the same units'], ['u', 'positive stated uncertainty in those units'], ['-', 'observed minus predicted']],
    math: 'uncertainty',
    mathNotes: ['Subtract prediction from observation and divide by an uncertainty scale. This diagnostic alone is not a p-value, discovery threshold, or proof; interpreting it needs an error model and treatment of systematics.'],
    example: {
      question: 'An observation is 12 units, prediction 10, and stated uncertainty 2. Find r.',
      steps: ['Find the residual 12−10=2 units.', 'Divide by uncertainty 2 units.'],
      answer: '+1 uncertainty unit.'
            },
    calculation: ['Observation is 15, prediction 11, and positive uncertainty 2 in matching units. Find r.', 2, 'uncertainty units', 'The signed discrepancy is (15−11)/2=2 uncertainty units; this alone proves no discovery.'],
    predict: ['Does mathematical elegance alone establish a new physical framework?', ['Yes', 'No'], 1, 'Physical acceptance also requires empirical tests that can distinguish the framework from alternatives.'],
    check: ['How are string theory, loop quantum gravity, and multiverse scenarios labeled here?', ['Speculative frameworks', 'Established measurements'], 0, 'These unconfirmed frameworks are explicitly speculative, separate from tested phenomena.'],
    lab: 'Use the local Hubble model to compute a prediction for a chosen distance, then compare with the clearly hypothetical observation in the worked residual exercise. The lab tests arithmetic in a known model, not quantum gravity or a multiverse.',
    takeaway: 'Ask which observations could distinguish a proposal, and preserve honest evidence labels.',
    limitation: 'The residual exercise is hypothetical and has no discovery significance without a probability model, systematic-error analysis, and independent data.'
        },
    ],
});
