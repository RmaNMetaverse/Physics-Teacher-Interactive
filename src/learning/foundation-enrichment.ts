/** Original contrasting examples. These deepen existing objectives and do not create duplicate completion credit. */
export interface FoundationEnrichment {
  objectiveId: string;
  example: { question: string; steps: string[]; answer: string };
  misconception: { question: string; explanation: string };
}
export const foundationEnrichment: Record<string, FoundationEnrichment> = {
  'measurement-basics': {
    objectiveId: 'measurement.quantity-and-unit',
    example: { question: 'A cart covers a measured 1.8 m in 0.6 s. Describe its average speed, including units.', steps: ['Average speed is total distance divided by elapsed time: 1.8/0.6 = 3.', 'The numerator has meters and the denominator seconds, so the derived unit is m/s.'], answer: '3 m/s. This average does not tell us whether the cart changed speed during the interval.' },
    misconception: { question: 'Does a more detailed simulation make its displayed number a measurement?', explanation: 'No. A simulation calculates consequences of chosen inputs and assumptions. A measurement comes from observing a physical system with an instrument. Agreement between them is evidence about the model, not a change in the meaning of measurement.' },
  },
  'unit-conversion': {
    objectiveId: 'measurement.conversion-and-dimensions',
    example: { question: 'A rectangular sensor is 20 cm by 30 cm. Find its area in square meters.', steps: ['Convert each side: 20 cm = 0.20 m and 30 cm = 0.30 m.', 'Multiply the lengths and their units: (0.20 m)(0.30 m) = 0.060 m². Equivalently, multiply 600 cm² by (1 m/100 cm)².'], answer: '0.060 m². Both length factors change, so the area conversion factor is 1/10,000.' },
    misconception: { question: 'Why does multiplying square centimeters by 1/100 give the wrong answer?', explanation: 'A square has two length dimensions. Converting only one factor leaves units of m·cm. You must convert both sides, or square the length conversion factor, before claiming the result is in m².' },
  },
  'measurement-uncertainty': {
    objectiveId: 'measurement.interval-and-relative-uncertainty',
    example: { question: 'Two instruments report a gap as 0.40 ± 0.02 m and 0.42 ± 0.01 m, using stated bounds. Are the intervals compatible?', steps: ['The first interval runs from 0.38 to 0.42 m. The second runs from 0.41 to 0.43 m.', 'Their overlap is 0.41 to 0.42 m. The first relative uncertainty is 100(0.02/0.40) = 5%; the second is approximately 2.4%.'], answer: 'The bounds overlap, so these readings do not establish a disagreement. Overlap alone cannot identify the true value or a confidence level.' },
    misconception: { question: 'Does ±0.02 m always mean a 68% probability interval?', explanation: 'No. Here it means a stated bound. A one-standard-deviation interval has a different meaning; its approximate 68% coverage additionally assumes a normal distribution. Always identify the uncertainty convention before assigning probabilities.' },
  },
  'coordinates-displacement': {
    objectiveId: 'vectors.displacement-versus-distance',
    example: { question: 'You start at x = −2 m, walk to +3 m, then return to +1 m. Find distance and displacement.', steps: ['The two path lengths are |3 − (−2)| = 5 m and |1 − 3| = 2 m. Their sum is 7 m.', 'The endpoint change is xfinal − xinitial = 1 − (−2) = +3 m. The intermediate turn does not change this difference.'], answer: 'Distance: 7 m. Displacement: +3 m along the chosen axis.' },
    misconception: { question: 'Can changing the origin change the displacement?', explanation: 'Adding the same coordinate offset to both endpoints cancels in their difference. Reversing an axis can change component signs, but the physical start-to-end arrow is unchanged.' },
  },
  'vector-components': {
    objectiveId: 'vectors.signed-components',
    example: { question: 'A displacement of magnitude 10 m points at 150° counterclockwise from +x. Find its components.', steps: ['This direction is in quadrant II: x is negative and y positive. Using the 30° reference triangle, cos 150° = −√3/2 and sin 150° = 1/2.', 'Multiply the magnitude by each ratio: x = −5√3 m ≈ −8.66 m and y = 5 m. Check: x² + y² = 75 + 25 = 100 m².'], answer: '(−8.66, +5.00) m, to three significant figures. The reconstructed magnitude is 10 m.' },
    misconception: { question: 'Are vector components always smaller positive lengths?', explanation: 'Components are signed projections. Their magnitudes cannot exceed the magnitude of the original vector on orthogonal unit axes, but either component can be negative or zero.' },
  },
  'vector-addition': {
    objectiveId: 'vectors.component-addition',
    example: { question: 'Add displacements A = (3,4) m and B = (−3,2) m. Compare the resultant with the sum of magnitudes.', steps: ['Add matching components: A + B = (3 − 3, 4 + 2) m = (0,6) m.', 'The resultant magnitude is 6 m. Individual magnitudes are 5 m and √13 m ≈ 3.61 m, whose sum is about 8.61 m.'], answer: 'The net displacement is 6 m upward. Adding magnitudes would describe the length of two successive legs, not their resultant.' },
    misconception: { question: 'Does cancellation of x-components mean the whole vectors cancel?', explanation: 'Only the horizontal projections cancel. The vertical projections still add. Two vectors cancel completely only when every corresponding component sums to zero.' },
  },
  'constant-velocity': {
    objectiveId: 'motion.position-graph-slope',
    example: { question: 'A straight position graph passes through (t,x) = (2 s,7 m) and (5 s,1 m). Find velocity and the position at t = 0.', steps: ['The slope is (1 − 7)/(5 − 2) = −2 m/s. A negative slope means motion toward decreasing x.', 'Using x = x₀ + vt at the first point: 7 = x₀ + (−2)(2), so x₀ = 11 m.'], answer: 'v = −2 m/s and x₀ = 11 m, provided the same constant-velocity model extends back to t = 0.' },
    misconception: { question: 'Does negative velocity mean the object is slowing down?', explanation: 'No. The sign identifies direction relative to the chosen axis. Constant −2 m/s means constant speed 2 m/s. Slowing down requires the magnitude of velocity to decrease.' },
  },
  'constant-acceleration': {
    objectiveId: 'motion.constant-acceleration-limits',
    example: { question: 'A cart begins at 6 m/s and has acceleration −2 m/s². How far does it move before first coming to rest?', steps: ['Set final velocity to zero: 0 = 6 − 2t, giving t = 3 s.', 'The velocity-time graph is a triangle of base 3 s and height 6 m/s. Its area is ½ × 3 × 6 = 9 m. This agrees with 6(3) + ½(−2)(3²).'], answer: 'It moves 9 m in 3 s before stopping. If the same acceleration continues, it then reverses direction.' },
    misconception: { question: 'Can negative acceleration ever increase speed?', explanation: 'Yes. After this cart reverses, both its velocity and acceleration are negative, so its speed increases. Acceleration changes velocity; whether speed grows depends on the relationship between their directions.' },
  },
  'projectile-motion': {
    objectiveId: 'motion.projectile-unequal-heights',
    example: { question: 'Launch horizontally at 8 m/s from height 5 m above level ground. Use g = 10 m/s² and neglect drag. Find landing time and horizontal range.', steps: ['The launch vertical velocity is zero, so y(t) = 5 − ½(10)t². Setting y = 0 gives t² = 1 s²; choose the future root t = 1 s.', 'Horizontal velocity stays at 8 m/s, so x = vt = 8(1) = 8 m. The equal-height range formula cannot be used for this launch.'], answer: 'Landing time: 1 s. Horizontal range: 8 m. The ground is 5 m below the launch point.' },
    misconception: { question: 'Does a horizontal launch with sin(2θ) = 0 have zero range?', explanation: 'That result applies to returning to the same height, which happens only at the launch instant for a horizontal launch without lift. A lower landing surface allows a positive flight time; solve the vertical position equation for that surface first.' },
  },
};
