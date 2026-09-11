import { starterCourse, source, up } from './shared';
export const astrophysicsCourse = starterCourse({
  id: 'astrophysics',
  title: 'Astrophysics',
  group: 'space',
  color: '#758ce2',
  model: 'astrophysics',
  description: 'Use stellar light to connect gravity, fusion, stellar life histories, and compact remnants.',
  sources: [source('OpenStax Astronomy 2e: stellar radiation', 'https://openstax.org/books/astronomy-2e/pages/5-2-the-electromagnetic-spectrum'), source('OpenStax Astronomy 2e: the solar interior', 'https://openstax.org/books/astronomy-2e/pages/16-3-the-solar-interior-theory'), source('OpenStax Astronomy 2e: evolution from the main sequence', 'https://openstax.org/books/astronomy-2e/pages/22-1-evolution-from-the-main-sequence-to-red-giants'), up(1, '13-7-einsteins-theory-of-gravity')],
  limitations: ['The stellar lab treats a uniform spherical blackbody with a prescribed effective temperature and radius. It does not solve spectra, internal structure, evolution, or relativistic remnants.'],
  missions: [
        {
    id: 'stellar-light',
    title: 'Stellar light',
    summary: 'A star’s luminosity depends on both emitting surface area and effective temperature.',
    body: ['Luminosity is total power emitted, while apparent brightness is the power received per area at a distance. A faint-looking star can be intrinsically luminous but far away.', 'The blackbody approximation gives surface power per area proportional to temperature to the fourth power. Multiplying by spherical area relates effective temperature and radius to total luminosity.'],
    equation: 'L=4\\pi R^2\\sigma T^4',
    symbols: [['L', 'luminosity, W'], ['R', 'stellar radius, m'], ['\\sigma', 'Stefan–Boltzmann constant, W/(m²·K⁴)'], ['T', 'effective temperature, K'], ['\\pi', 'circle constant, about 3.14159'], ['R^2,T^4', 'radius squared and temperature raised to the fourth power']],
    math: 'powers',
    mathNotes: ['At fixed temperature, radius enters twice as a factor. At fixed radius, temperature enters four times, so doubling T multiplies luminosity by sixteen.'],
    example: {
      question: 'At fixed radius, how does luminosity change when temperature doubles?',
      steps: ['Form the temperature ratio 2.', 'Raise it to the fourth power: 2×2×2×2.'],
      answer: 'Sixteen times the original luminosity.'
            },
    calculation: ['At fixed temperature, radius triples. Find the luminosity multiplier.', 9, 'ratio', 'Surface area and luminosity scale with R², so the multiplier is 3²=9.'],
    predict: ['Does a star’s apparent brightness equal its luminosity?', ['No', 'Yes'], 0, 'Distance and intervening material affect received brightness while luminosity is intrinsic total power.'],
    check: ['At fixed radius, doubling effective temperature multiplies luminosity by what?', ['2', '16'], 1, 'The fourth power gives 2⁴=16, not a linear temperature response.'],
    lab: 'Hold radius fixed and double temperature; compare luminosity. Then restore temperature and double radius. Verify factors of sixteen and four, and keep total luminosity distinct from surface flux.',
    takeaway: 'Separate intrinsic luminosity, surface flux, and received brightness.',
    limitation: 'Effective temperature is a radiative description; a real stellar spectrum need not be a perfect blackbody.'
        },
        {
    id: 'hydrostatic-balance',
    title: 'Hydrostatic balance',
    summary: 'A long-lived star supports each layer against gravity with a pressure gradient.',
    body: ['Pressure inside a nearly steady star is greater deeper down. A small layer receives more outward push on its inner face than inward push on its outer face, balancing the layer’s weight.', 'The gradient, rather than pressure alone, supplies that support. A local planar estimate gives the required pressure drop across a thin layer when density and gravity vary little across it.'],
    equation: '\\Delta P=-\\rho g\\Delta r',
    symbols: [['\\Delta P', 'outward pressure change across a thin layer, Pa'], ['\\rho', 'local mass density, kg/m³'], ['g', 'local inward gravitational acceleration magnitude, m/s²'], ['\\Delta r', 'small positive outward distance, m'], ['-', 'pressure decreases outward']],
    math: 'signed-numbers',
    mathNotes: ['Multiply the layer properties and thickness, then attach a negative sign for outward change. The full stellar problem lets density and gravity vary with radius.'],
    example: {
      question: 'For density 2 kg/m³, g=10 m/s² and outward thickness 3 m, find ΔP.',
      steps: ['Compute the magnitude 2×10×3=60 Pa.', 'Apply the negative sign for moving outward.'],
      answer: '−60 Pa.'
            },
    calculation: ['For density 4 kg/m³, g=5 m/s², and outward thickness 2 m, find ΔP.', -40, 'Pa', 'Hydrostatic balance gives −4×5×2=−40 Pa across this local layer.'],
    predict: ['In a supported stellar layer, pressure usually changes how outward?', ['Decreases', 'Increases'], 0, 'A larger inward-side pressure supplies the outward support needed against gravity.'],
    check: ['Does a surface luminosity formula prove hydrostatic equilibrium?', ['Yes', 'No'], 1, 'Surface radiation does not determine the internal pressure and gravity balance.'],
    lab: 'Change the radius in the stellar luminosity lab while holding temperature fixed. Note that no pressure or density profile is produced; use this to separate a surface-radiation calculation from the internal force-balance equation.',
    takeaway: 'Use a pressure gradient to explain support against gravity.',
    limitation: 'The thin-layer estimate assumes locally constant density and gravity and does not solve a whole star’s structure.'
        },
        {
    id: 'fusion',
    title: 'Fusion',
    summary: 'Nuclear reactions can supply stellar luminosity by converting part of the reactants’ rest energy into other forms.',
    body: ['In a main-sequence star, fusion changes nuclear composition and supplies energy. The released energy reaches the surface only after transport through the interior; some reaction energy can also leave as neutrinos.', 'An efficiency factor can summarize the fraction of processed rest mass released as energy in a simplified budget. This estimate does not determine the reaction rate or claim that all stellar matter is available fuel.'],
    equation: 'E=\\epsilon mc^2',
    symbols: [['E', 'released nuclear energy, J'], ['\\epsilon', 'dimensionless released rest-energy fraction'], ['m', 'mass actually processed, kg'], ['c', 'vacuum light speed, m/s']],
    math: 'fractions',
    mathNotes: ['Compute mc², then take the fraction ε. For hydrogen-to-helium bookkeeping ε is roughly 0.007, but usable fuel fraction and losses need separate accounting.'],
    example: {
      question: 'Use ε=0.007, m=1 kg, and c=3×10⁸ m/s.',
      steps: ['The rest energy is 9×10¹⁶ J.', 'Multiply by 0.007.'],
      answer: 'Approximately 6.3×10¹⁴ J released.'
            },
    calculation: ['At the same efficiency, processing 2 kg rather than 1 kg with 6.3e14 J yield gives what energy?', 1.26e15, 'J', 'The simple fuel budget is linear in processed mass, so the yield doubles.'],
    predict: ['Does the luminosity model calculate a fusion reaction rate?', ['No', 'Yes'], 0, 'Its prescribed surface radius and temperature determine emitted power, not nuclear reaction kinetics.'],
    check: ['Does m mean the entire stellar mass automatically?', ['Yes', 'No; it is the mass actually processed'], 1, 'Only a portion of a star’s material may be accessible to a given burning stage.'],
    lab: 'Read a star’s modeled luminosity in watts. Divide the worked energy yield by that luminosity to form an illustrative duration. State that this assumes constant power and already-known usable fuel, neither of which the lab evolves.',
    takeaway: 'Account for processed fuel, efficiency, and energy transport separately.',
    limitation: 'The approximate energy fraction omits detailed reaction chains, neutrino losses, and evolving stellar fuel access.'
        },
        {
    id: 'stellar-evolution',
    title: 'Stellar evolution',
    summary: 'A star’s changing fuel and structure alter its radius, temperature, and luminosity over its life.',
    body: ['A main-sequence star balances gravity, pressure, and energy flow while consuming core fuel. Exhaustion changes the structure; later burning stages and mass loss depend strongly on initial mass and composition.', 'Fuel divided by luminosity gives a rough energy-limited duration, not a complete evolutionary track. More massive stars can shine so much more strongly that they use their available fuel faster despite having more of it.'],
    equation: 't\\approx E_{fuel}/L',
    symbols: [['t', 'rough duration, s'], ['E_{fuel}', 'available radiated energy budget, J'], ['L', 'assumed constant luminosity, W or J/s'], ['\\approx', 'estimate under stated assumptions']],
    math: 'rates',
    mathNotes: ['Dividing joules by joules per second gives seconds. If luminosity changes substantially, one fixed denominator is inadequate.'],
    example: {
      question: 'A toy energy budget is 10³⁰ J and luminosity 10²⁰ W. Estimate duration.',
      steps: ['Use the same energy units in numerator and power.', 'Divide powers: 10³⁰/10²⁰.'],
      answer: '10¹⁰ s.'
            },
    calculation: ['An available energy budget is 6e30 J and assumed luminosity 2e20 W. Estimate duration.', 3e10, 's', 'The constant-power budget gives 6×10³⁰/(2×10²⁰)=3×10¹⁰ s.'],
    predict: ['Does having more mass necessarily guarantee a longer stellar lifetime?', ['Yes', 'No'], 1, 'Luminosity can grow faster than available fuel, shortening the lifetime.'],
    check: ['What is missing from a single fuel-over-power estimate?', ['Changes in structure, fuel access, and luminosity', 'The definition of division'], 0, 'Evolution changes the quantities treated as fixed in the rough budget.'],
    lab: 'Compare a compact hot star and a larger cooler configuration in the blackbody lab. Record their luminosities. Treat them as two prescribed snapshots, not successive times on a calculated evolutionary track.',
    takeaway: 'Use energy-over-power as a budget estimate while preserving evolutionary uncertainty.',
    limitation: 'The simulator neither ages a star nor determines which radius-temperature combinations are physically realized.'
        },
        {
    id: 'compact-objects',
    title: 'Compact objects',
    summary: 'White dwarfs, neutron stars, and black holes require different support and spacetime descriptions.',
    body: ['White dwarfs and neutron stars can resist gravity through quantum-degenerate matter, with important interaction and relativistic corrections. A black hole instead has an event horizon; it is not a solid surface.', 'For an isolated nonrotating uncharged black hole, the Schwarzschild radius gives the horizon scale. A blackbody stellar luminosity equation cannot turn that radius into a realistic compact-object model.'],
    equation: 'r_s=2GM/c^2',
    symbols: [['r_s', 'Schwarzschild horizon radius, m'], ['G', 'gravitational constant, m³/(kg·s²)'], ['M', 'black-hole mass, kg'], ['c', 'vacuum light speed, m/s']],
    math: 'scientific-notation',
    mathNotes: ['Multiply 2GM, then divide by c squared. This radius is proportional to mass for the specified nonrotating uncharged solution.'],
    example: {
      question: 'Using G≈6.67×10⁻¹¹, M=2×10³⁰ kg, c=3×10⁸, estimate rs.',
      steps: ['The numerator is about 2.668×10²⁰ m³/s².', 'Divide by 9×10¹⁶ m²/s².'],
      answer: 'About 2964 m, roughly 3 km.'
            },
    calculation: ['A nonrotating black hole has radius 3 km in a rounded example. Triple its mass; find the new radius in meters.', 9000, 'm', 'The Schwarzschild radius scales linearly with mass: 3×3 km=9 km=9000 m.'],
    predict: ['Is an event horizon a solid material surface?', ['No', 'Yes'], 0, 'It is a causal boundary in spacetime, not a material shell.'],
    check: ['Can the blackbody lab establish neutron-star structure?', ['Yes', 'No'], 1, 'It has no equation of state, gravity balance, or relativistic structure calculation.'],
    lab: 'Reduce radius at fixed effective temperature and observe the area-driven luminosity decrease. Explain why applying that surface formula to a black hole horizon would exceed its assumptions: an event horizon is not the stellar emitting surface modeled here.',
    takeaway: 'Choose the right physical description for each compact remnant.',
    limitation: 'The horizon formula excludes rotation and charge; the lab does not model degenerate support, accretion, or relativistic emission.'
        },
    ],
});
