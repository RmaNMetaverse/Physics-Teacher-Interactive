import { starterCourse, up } from './shared';
export const classicalMechanicsCourse = starterCourse({
  id: 'classical-mechanics',
  title: 'Classical Mechanics',
  group: 'classical',
  color: '#ed9157',
  model: 'motion',
  description: 'Compare frames, balance forces, turn objects, support fluids, and recognize prediction limits.',
  sources: [up(1, '4-5-relative-motion-in-one-and-two-dimensions'), up(1, '10-6-torque'), up(1, '14-1-fluids-density-and-pressure'), up(1, '15-1-simple-harmonic-motion')],
  limitations: ['Newtonian classroom models assume speeds well below light speed; the reused labs do not solve fluid flow, rigid-body rotation, or chaotic dynamics.'],
  missions: [
        {
    id: 'frames-and-motion',
    title: 'Frames and motion',
    summary: 'A walking passenger can have different velocities relative to a train and a platform.',
    body: ['A frame supplies an origin, axes, and a clock. Position and velocity depend on that choice; an event remains the same meeting of an object and a time.', 'At everyday speeds, subtract the frame velocity to describe the same motion from a moving observer. A constant-velocity change of frame leaves acceleration unchanged.'],
    equation: "v'=v-u",
    symbols: [["v'", 'velocity relative to the moving frame, m/s'], ['v', 'velocity in the original frame, m/s'], ['u', 'moving-frame velocity, m/s'], ['-', 'subtract signed values']],
    math: 'signed-numbers',
    mathNotes: ['The prime is a label for a different frame, not multiplication. Choose rightward as positive before subtracting velocities.'],
    example: {
      question: 'A train moves at 12 m/s; a passenger moves at 14 m/s relative to the platform. Find the passenger velocity on the train.',
      steps: ['Use the same positive direction for both velocities.', 'Subtract 14 − 12 = 2.'],
      answer: '2 m/s forward on the train.'
            },
    calculation: ['A frame moves at 4 m/s and an object at 7 m/s. What is its velocity in that frame?', 3, 'm/s', 'Subtract the frame velocity: 7 − 4 = 3 m/s.'],
    predict: ['Can a seated passenger be moving relative to the platform?', ['Yes, if the train moves', 'No, sitting means absolute rest'], 0, 'Rest describes motion relative to a chosen frame.'],
    check: ['What stays unchanged between frames with constant relative velocity?', ['Position', 'Acceleration'], 1, 'Subtracting a constant velocity does not change its rate of change.'],
    lab: 'Use constant-velocity motion. Compare the reported displacement at two times, then subtract an observer traveling 2 m each second on paper. This lab shows the platform frame only.',
    takeaway: 'Always name the frame attached to a velocity.',
    limitation: 'Galilean velocity subtraction fails near light speed.'
        },
        {
    id: 'force-diagrams',
    title: 'Force diagrams',
    summary: 'Choose one object and name every external interaction before adding forces.',
    model: 'forces',
    body: ['A force diagram belongs to one object. Weight is Earth acting on it; the normal force is the surface acting on it. Their reaction partners act on other objects.', 'Opposing forces can cancel on the chosen object even while it moves. Acceleration follows the signed net force, rather than the largest individual arrow.'],
    equation: 'a=F_{net}/m',
    symbols: [['a', 'acceleration, m/s²'], ['F_{net}', 'signed sum of external forces, N'], ['m', 'positive mass, kg']],
    math: 'vectors',
    mathNotes: ['Add force components on each axis, keeping their signs. Divide the resulting net force by mass; a zero numerator gives zero acceleration.'],
    example: {
      question: 'A 3 kg cart receives 10 N right and 4 N left. Find acceleration.',
      steps: ['The net rightward force is 10 − 4 = 6 N.', 'Divide 6 N by 3 kg.'],
      answer: '2 m/s² rightward.'
            },
    calculation: ['An 8 kg cart has 24 N net force. Find acceleration.', 3, 'm/s²', 'Newton’s second law gives 24/8 = 3 m/s².'],
    predict: ['Equal opposite forces on the same object imply what?', ['Zero acceleration', 'Zero velocity'], 0, 'Balanced forces imply zero acceleration, including steady motion.'],
    check: ['Where does the reaction to the surface normal act?', ['On the object again', 'On the surface'], 1, 'An action–reaction pair acts on two different objects.'],
    lab: 'In the force lab set slope and friction to zero. Double the applied force at fixed mass, then double mass. Compare the acceleration observations and explain both ratios.',
    takeaway: 'Sum forces on one object before applying Newton’s second law.',
    limitation: 'The incline lab uses equal static and kinetic friction coefficients and does not model surface deformation.'
        },
        {
    id: 'rotation',
    title: 'Rotation',
    summary: 'A force changes rotation most effectively when applied far from the axis and perpendicular to the lever.',
    model: 'vectors',
    body: ['Torque measures how a force tends to turn an object about a specified axis. A push through the axis can exert a large force while producing zero torque about that axis.', 'For a perpendicular push, torque is the force times its lever arm. Predicting angular acceleration also needs the moment of inertia, which records how mass is distributed.'],
    equation: '\\tau=rF_{\\perp}',
    symbols: [['\\tau', 'torque magnitude, N·m'], ['r', 'distance from axis, m'], ['F_{\\perp}', 'force component perpendicular to radius, N']],
    math: 'ratios',
    mathNotes: ['The perpendicular subscript labels the sideways component. At fixed force, doubling the lever arm doubles torque. Torque and energy share units but describe different physical quantities.'],
    example: {
      question: 'A 20 N perpendicular push acts 0.3 m from a hinge. Find torque.',
      steps: ['Choose the hinge as the rotation axis.', 'Multiply 0.3 × 20.'],
      answer: '6 N·m.'
            },
    calculation: ['A 12 N perpendicular force acts at 0.5 m. Find torque.', 6, 'N·m', 'Multiply force by lever arm: 12 × 0.5 = 6 N·m.'],
    predict: ['With the same perpendicular push, which handle gives more torque?', ['A longer handle', 'A shorter handle'], 0, 'A longer lever arm multiplies the same perpendicular force by a larger distance.'],
    check: ['A force directed through the axis has what torque about that axis?', ['Maximum torque', 'Zero torque'], 1, 'Its perpendicular lever arm is zero, so it produces no turning effect about that axis.'],
    lab: 'Use the vector lab to resolve an arrow into components. Interpret its perpendicular component as a force direction on paper, then calculate torque for a chosen lever arm. The lab itself displays displacement vectors, not a rotating rigid body.',
    takeaway: 'State an axis and lever arm when discussing torque.',
    limitation: 'The vector analogy does not calculate angular acceleration or rotational inertia.'
        },
        {
    id: 'fluids-and-pressure',
    title: 'Fluids and pressure',
    summary: 'A fluid at rest supports the weight above it through a pressure difference.',
    model: 'forces',
    body: ['Pressure is normal force per unit area. At the same depth in a connected, stationary fluid, pressure is equal even when the container changes shape.', 'A deeper fluid layer must support more weight per unit area. For nearly constant density, the pressure increase is density times gravitational acceleration times depth.'],
    equation: '\\Delta P=\\rho gh',
    symbols: [['\\Delta P', 'pressure increase, Pa'], ['\\rho', 'density, kg/m³'], ['g', 'gravitational acceleration, m/s²'], ['h', 'depth below reference level, m'], ['\\Delta', 'change from the reference value']],
    math: 'ratios',
    mathNotes: ['Multiply the three positive factors. This gives pressure above the reference pressure; add atmospheric pressure separately for absolute pressure.'],
    example: {
      question: 'Use water density 1000 kg/m³ and g=10 m/s². Find the pressure increase 2 m down.',
      steps: ['Insert density, gravity, and depth in SI units.', 'Multiply 1000 × 10 × 2.'],
      answer: '20000 Pa above the surface pressure.'
            },
    calculation: ['For density 1000 kg/m³ and g=10 m/s², find the pressure increase at 3 m.', 30000, 'Pa', 'Hydrostatic pressure increase is 1000 × 10 × 3 = 30000 Pa.'],
    predict: ['Where is pressure greater in still water?', ['Near the surface', 'At greater depth'], 1, 'The lower layer supports more overlying fluid weight per unit area.'],
    check: ['Does this formula alone give absolute pressure?', ['No, it gives an increase', 'Yes, always'], 0, 'Add the pressure at the reference surface to obtain absolute pressure.'],
    lab: 'On a horizontal force-lab surface, vary mass and record the normal force. Divide by an imagined 1 m² area to connect supported weight with pressure. A real hydrostatic column is explained here but is not simulated.',
    takeaway: 'Separate pressure increase from absolute pressure.',
    limitation: 'The relation assumes constant density, uniform gravity, and a fluid at rest; the lab is only a force-balance analogy.'
        },
        {
    id: 'chaos-and-limits',
    title: 'Chaos and limits',
    summary: 'Deterministic laws can amplify uncertainty; predictable does not mean perfectly measurable.',
    model: 'oscillations',
    body: ['Chaotic motion can follow deterministic laws while nearby initial states separate rapidly. A long-range forecast then needs more initial precision than an experiment can supply.', 'The undamped linear oscillator is a useful contrast: doubling its initial amplitude doubles displacement without changing period. It is not chaotic, so it must not be used as evidence of chaotic divergence.'],
    equation: 'd_n=2^n d_0',
    symbols: [['d_n', 'illustrative separation after n intervals'], ['d_0', 'initial separation in the same units'], ['n', 'number of intervals'], ['2^n', 'multiply by two n times']],
    math: 'powers',
    mathNotes: ['A subscript labels a stage. This doubling rule illustrates error growth, not a universal chaos law. At n=0 the multiplier is one.'],
    example: {
      question: 'A hypothetical separation starts at 1 mm and doubles three times. Find the separation.',
      steps: ['Compute 2³ = 2 × 2 × 2 = 8.', 'Multiply the starting 1 mm by 8.'],
      answer: '8 mm, or 0.008 m.'
            },
    calculation: ['A 0.002 m illustrative separation doubles four times. Find the result.', 0.032, 'm', 'Four doublings multiply by 16: 0.002 × 16 = 0.032 m.'],
    predict: ['Must deterministic motion be accurately predictable indefinitely?', ['Yes', 'No'], 1, 'Finite initial precision can be amplified by sensitive dynamics.'],
    check: ['What does the linear oscillator establish about chaos?', ['Nothing directly; it is a nonchaotic comparison', 'All periodic motion is chaotic'], 0, 'The linear oscillator lacks the sensitive divergence used to diagnose chaos.'],
    lab: 'Compare the spring lab at two nearby amplitudes with unchanged mass and stiffness. Note the unchanged period and bounded displacement difference. Use that regular behavior as a contrast to the doubling example, not as a chaos simulation.',
    takeaway: 'Separate deterministic laws from the reliability horizon of a forecast.',
    limitation: 'The doubling example is illustrative; no Lyapunov exponent or chaotic trajectory is computed by this course.'
        },
    ],
});
