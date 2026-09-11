import { starterCourse, up } from './shared';
export const electromagnetismCourse = starterCourse({
  id: 'electromagnetism',
  title: 'Electromagnetism',
  group: 'classical',
  color: '#e9bd45',
  model: 'electromagnetism',
  description: 'Move from point charges and voltage to currents, magnetic forces, and electromagnetic waves.',
  sources: [up(2, '5-4-electric-field'), up(2, '7-2-electric-potential-and-potential-difference'), up(2, '11-3-motion-of-a-charged-particle-in-a-magnetic-field'), up(2, '16-1-maxwells-equations-and-electromagnetic-waves')],
  limitations: ['The numerical lab is a single static point charge in vacuum, with zero potential at infinity. It computes no circuits, magnetic fields, or electromagnetic wave propagation.'],
  missions: [
        {
    id: 'charge-and-field',
    title: 'Charge and field',
    summary: 'A field assigns a possible force per unit positive test charge to each point.',
    body: ['The electric field describes what a small positive test charge would experience, without requiring that test charge to remain in place. A negative test charge feels a force opposite the field.', 'For an isolated point source, radial field strength falls with the square of distance. The source sign determines whether the field points outward or inward.'],
    equation: 'E_r=kq/r^2',
    symbols: [['E_r', 'signed outward radial field, N/C'], ['k', 'Coulomb constant, approximately 8.99×10⁹ N·m²/C²'], ['q', 'source charge, C'], ['r', 'positive distance, m'], ['r^2', 'distance multiplied by itself']],
    math: 'powers',
    mathNotes: ['Square the distance before dividing. A negative charge gives a negative radial field, meaning inward; the square in the denominator stays positive.'],
    example: {
      question: 'Using k≈9×10⁹, find the field at 1 m from +1 nC.',
      steps: ['Convert 1 nC to 10⁻⁹ C.', 'Compute 9×10⁹ × 10⁻⁹ / 1².'],
      answer: '9 N/C outward.'
            },
    calculation: ['A point-charge field is 12 N/C at r. What is its magnitude at 2r?', 3, 'N/C', 'Doubling distance divides the inverse-square field by four: 12/4=3.'],
    predict: ['What happens to field direction if the source charge changes sign?', ['It reverses', 'It stays unchanged'], 0, 'Field is proportional to signed source charge, so reversing q reverses its radial direction.'],
    check: ['Which charge defines the direction of an electric field?', ['A negative test charge', 'A positive test charge'], 1, 'Field direction is the force direction for a positive test charge.'],
    lab: 'Compare +1e-9 C and −1e-9 C at 1 m, then compare 1 m and 2 m with charge fixed. Record signed field values and verify both the direction reversal and inverse-square ratio.',
    takeaway: 'Keep the sign and distance dependence of the field separate.',
    limitation: 'The point-charge formula excludes r=0 and ignores other charges, finite source size, and material polarization.'
        },
        {
    id: 'potential',
    title: 'Potential',
    summary: 'Electric potential measures potential energy per unit charge relative to a chosen reference.',
    body: ['Voltage compares energy per unit charge between locations. A high electric potential is not automatically a high potential energy: the sign and amount of the charge also matter.', 'For one point charge with potential zero at infinity, potential falls as one over distance. Field falls faster, as inverse distance squared; the two quantities have different units.'],
    equation: 'V=kq/r',
    symbols: [['V', 'electric potential relative to infinity, V or J/C'], ['k', 'Coulomb constant, N·m²/C²'], ['q', 'source charge, C'], ['r', 'distance, m']],
    math: 'ratios',
    mathNotes: ['Divide kq by distance, without squaring this time. The symbol V here names potential, while volume used the same letter in a different context.'],
    example: {
      question: 'Using k≈9×10⁹, find potential 2 m from +2 nC.',
      steps: ['Compute kq=9×10⁹ × 2×10⁻⁹=18 V·m.', 'Divide 18 by 2.'],
      answer: '9 V.'
            },
    calculation: ['Potential is 20 V at r. Find it at 4r for the same isolated charge.', 5, 'V', 'Point-charge potential is inverse distance: 20/4=5 V.'],
    predict: ['Does doubling distance halve this point-charge potential?', ['Yes', 'No, it quarters it'], 0, 'Potential scales as 1/r; the field instead scales as 1/r².'],
    check: ['What does one volt mean?', ['One joule per coulomb', 'One newton per kilogram'], 0, 'Voltage is potential energy per unit charge, measured in J/C.'],
    lab: 'At a fixed positive charge, double distance and compare potential and electric-field ratios. Explain why one halves and the other quarters. Then reverse charge and inspect both signs.',
    takeaway: 'Potential is energy per charge and depends on a stated reference.',
    limitation: 'An additive reference shift changes V but not voltage differences or physical electric fields.'
        },
        {
    id: 'current',
    title: 'Current',
    summary: 'Current counts how much signed charge crosses a section per unit time.',
    body: ['A wire can be almost electrically neutral while carrying a current because mobile charges drift through an opposite stationary background. Current is a transport rate, not a stockpile of charge.', 'Conventional current points in the direction positive charges would move. In a metal, electron drift is opposite to that direction. An electric field helps drive the drift but does not alone specify resistance.'],
    equation: 'I=\\Delta Q/\\Delta t',
    symbols: [['I', 'average current, A'], ['\\Delta Q', 'net charge crossing the section, C'], ['\\Delta t', 'elapsed time, s'], ['\\Delta', 'change over the specified interval']],
    math: 'rates',
    mathNotes: ['Divide transferred charge by the time interval. A coulomb per second is an ampere; this is an average when the flow varies.'],
    example: {
      question: 'Three coulombs cross a wire section in 2 s. Find average current.',
      steps: ['Identify transferred charge rather than charge stored on the wire.', 'Divide 3 C by 2 s.'],
      answer: '1.5 A.'
            },
    calculation: ['Find average current for 8 C transferred in 4 s.', 2, 'A', 'Current is charge per time, so 8/4=2 A.'],
    predict: ['Can a nearly neutral wire carry current?', ['No', 'Yes'], 1, 'Charge transport can occur while positive and negative charge densities almost balance.'],
    check: ['Electron drift in a metal is directed how relative to conventional current?', ['Opposite', 'Always the same'], 0, 'Electrons are negative, so their drift is opposite the positive-charge current convention.'],
    lab: 'Vary the source charge in the electrostatic lab and observe the field at a fixed point. Use that to reason about force direction on positive and negative carriers. This lab has no wire or moving charges, so it does not output current.',
    takeaway: 'Distinguish charge stored from charge transported per second.',
    limitation: 'The average-current equation does not supply a circuit law, drift speed, or material conductivity.'
        },
        {
    id: 'magnetic-force',
    title: 'Magnetic force',
    summary: 'A magnetic field bends a moving charge without doing work through the magnetic force alone.',
    body: ['The magnetic part of the Lorentz force is perpendicular to both particle velocity and magnetic field. A parallel-moving charge experiences no magnetic force.', 'For perpendicular motion its magnitude is |q|vB. The force changes the direction of velocity; because it is perpendicular to motion, it cannot change kinetic energy by itself.'],
    equation: 'F=|q|vB',
    symbols: [['F', 'force magnitude for perpendicular motion, N'], ['|q|', 'magnitude of charge, C'], ['v', 'speed, m/s'], ['B', 'magnetic field magnitude, T'], ['| |', 'absolute value removes the sign']],
    math: 'vectors',
    mathNotes: ['This equation applies at a right angle. Multiply positive magnitudes; determine direction separately. For parallel motion the force is zero.'],
    example: {
      question: 'For perpendicular motion, use |q|=2×10⁻⁶ C, v=3×10³ m/s, B=0.5 T.',
      steps: ['Multiply charge magnitude by speed: 0.006 C·m/s.', 'Multiply by 0.5 T.'],
      answer: '0.003 N.'
            },
    calculation: ['For perpendicular motion with |q|=1e-6 C, v=2000 m/s and B=1 T, find force.', 0.002, 'N', 'Multiplying the three magnitudes gives 0.002 N.'],
    predict: ['Does magnetic force alone increase a particle’s speed?', ['Yes', 'No'], 1, 'The magnetic force is perpendicular to velocity and does no work.'],
    check: ['A charge moving parallel to a magnetic field experiences what magnetic force?', ['Zero', 'The maximum'], 0, 'The perpendicular component of velocity is zero for parallel motion.'],
    lab: 'Inspect how reversing charge reverses the electric field of the source in the available lab. Contrast a radial electric force with the perpendicular magnetic-force rule on paper. This electrostatic model supplies no magnetic-force measurement.',
    takeaway: 'Separate magnetic bending from changes in kinetic energy.',
    limitation: 'The displayed magnitude formula assumes perpendicular motion; general directions need the vector cross product, introduced here qualitatively.'
        },
        {
    id: 'maxwells-synthesis',
    title: "Maxwell's synthesis",
    summary: 'Electric and magnetic fields belong to one theory that permits waves traveling at light speed in vacuum.',
    body: ['Maxwell’s equations connect fields with charge, current, and each other’s time variation. Their vacuum wave solutions identify light as an electromagnetic disturbance.', 'In a plane vacuum wave, field magnitudes satisfy E=cB. A static point charge is another solution family, but its field is not a radiating wave and cannot demonstrate propagation.'],
    equation: 'E=cB',
    symbols: [['E', 'electric field magnitude in a vacuum plane wave, V/m'], ['c', 'vacuum light speed, approximately 3×10⁸ m/s'], ['B', 'magnetic field magnitude, T']],
    math: 'scientific-notation',
    mathNotes: ['Multiply powers of ten by adding exponents. E=cB is a relation for a plane wave, not a universal relation for static fields.'],
    example: {
      question: 'Estimate E for a plane wave with B=2×10⁻⁸ T.',
      steps: ['Multiply coefficients 3 × 2 = 6.', 'Combine powers 10⁸ × 10⁻⁸ = 1.'],
      answer: '6 V/m.'
            },
    calculation: ['Using c=3e8 m/s, find E when a vacuum plane wave has B=1e-8 T.', 3, 'V/m', 'For the plane wave E=cB=3×10⁸×10⁻⁸=3 V/m.'],
    predict: ['Does a static charge’s electric field prove it is radiating?', ['No', 'Yes'], 0, 'A static Coulomb field and a propagating electromagnetic wave are different solutions.'],
    check: ['Where can an electromagnetic wave propagate?', ['Only in material', 'In vacuum as well as suitable materials'], 1, 'Maxwell’s vacuum equations support electromagnetic waves without a material medium.'],
    lab: 'Change distance in the point-charge lab and record the inverse-square field. Contrast that static spatial profile with the plane-wave E=cB relationship; do not infer radiation or magnetic fields from the Coulomb readout.',
    takeaway: 'Recognize light as an electromagnetic wave while naming the solution’s assumptions.',
    limitation: 'The starter gives a qualitative synthesis, not a derivation or numerical solver for Maxwell’s differential equations.'
        },
    ],
});
