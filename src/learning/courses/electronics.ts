import { source, starterCourse, up } from './shared';

const references = [up(2, '9-4-ohms-law'), up(2, '10-2-resistors-in-series-and-parallel'), up(2, '10-3-kirchhoffs-rules'), source('Arduino built-in circuit examples', 'https://docs.arduino.cc/built-in-examples/')];

export const electronicsCourse = starterCourse({
  id: 'electronics', title: 'Electronics', group: 'classical', color: '#ef9c65', model: 'circuits', reviewedAt: '2026-09-15',
  description: 'Read schematics, wire a breadboard, and reason about resistors, LEDs, switches, and DC circuits.',
  sources: references,
  limitations: ['Labs solve four ideal DC circuit templates, not arbitrary user-drawn netlists. Capacitors, transistors, AC behavior, component tolerances and thermal failure are taught conceptually but not numerically simulated.'],
  missions: [
    {
      id: 'voltage-current-resistance', title: 'Voltage, current, resistance', summary: 'A closed resistor loop links voltage, current and resistance.',
      body: ['Voltage is energy transferred per unit charge between two points, while current is charge flowing per second through a branch. Resistance describes how a component opposes current.', 'Wire a source, switch and resistor in one closed loop. Double the resistance while keeping the voltage fixed and the ideal current halves. The switch opens the path rather than creating a mysterious negative current.'],
      equation: 'I=\\frac{V}{R}', symbols: [['I', 'current, A'], ['V', 'potential difference, V'], ['R', 'resistance, Ω']], math: 'ratios', mathNotes: ['Divide voltage by resistance; V/Ω gives amperes. This relation assumes an ohmic resistor.'],
      example: { question: 'What current flows through 1 kΩ at 9 V?', steps: ['Convert 1 kΩ to 1000 Ω.', 'Divide 9 V by 1000 Ω.'], answer: '0.009 A = 9 mA.' },
      calculation: ['A 5 V source drives a 500 Ω resistor. Find current in A.', .01, 'A', 'Divide the supply voltage by resistance: I=5/500=0.01 A.'],
      predict: ['At fixed voltage, doubling an ohmic resistor does what to current?', ['Halves it', 'Doubles it'], 0, 'I=V/R, so doubling R halves I.'],
      check: ['What does an open ideal switch do to the loop current?', ['It makes it zero', 'It doubles it'], 0, 'An ideal open switch breaks the only conductive path.'],
      lab: 'Use the circuit workbench resistor template. Toggle the switch, then compare 330 Ω and 660 Ω at the same supply voltage. Read both the schematic and breadboard-style view; these show the same ideal closed loop.',
      preset: { mode: 0, voltage: 5, resistance: 330 }, takeaway: 'Use V, I and R with a closed path and consistent units.', limitation: 'Ohm’s law here describes an ideal resistor, not every nonlinear electronic component.'
    },
    {
      id: 'schematics-and-breadboards', title: 'Schematics and breadboards', summary: 'A schematic represents electrical connections, not physical distances.',
      body: ['A wire connects all points on the same node. A schematic draws source, switch and component symbols to emphasize connectivity; wire length and neat right-angle corners are usually irrelevant to the ideal calculation.', 'On a breadboard, each connected row of holes is one node, and the center trench separates the two sides. A resistor must span different nodes to be in the path. Before powering a real circuit, check the actual breadboard rail layout because some rails are split.'],
      equation: 'V_\\mathrm{s}=V_{R_1}+V_{R_2}', symbols: [['V_s', 'supply voltage, V'], ['V_{R_1}', 'drop on first resistor, V'], ['V_{R_2}', 'drop on second resistor, V']], math: 'algebra', mathNotes: ['Follow a closed loop and add potential drops; a redraw of the same nodes does not change the sum.'],
      example: { question: 'A 9 V source has two series drops, 3 V and an unknown. Find the unknown.', steps: ['Write 9=3+V₂.', 'Subtract 3 V from both sides.'], answer: 'V₂=6 V.' },
      calculation: ['A 12 V source has one series drop of 5 V. Find the other drop.', 7, 'V', 'Kirchhoff’s loop rule gives 12−5=7 V.'],
      predict: ['If you redraw the same circuit with longer wires, does ideal current change?', ['No', 'Yes'], 0, 'Ideal wire geometry is not resistance; connectivity is what matters.'],
      check: ['A resistor connected with both ends in the same breadboard node is best described as?', ['Bypassed', 'In series'], 0, 'A same-node connection has no intended voltage drop across that resistor.'],
      lab: 'Switch the workbench between schematic and breadboard views while testing a two-resistor series loop. Trace each node from source through switch, R1 and R2. Compare the voltage across R1 with the supply.',
      preset: { mode: 1, voltage: 9, resistance: 1000, resistance2: 2000 }, takeaway: 'Identify nodes and components before calculating a circuit.', limitation: 'Breadboard rows and rails are diagrams of a typical board, not a guarantee of every physical product’s rail continuity.'
    },
    {
      id: 'series-and-parallel', title: 'Series and parallel', summary: 'Series branches share current; parallel branches share voltage.',
      body: ['In series, every charge carrier passes through both resistors, so their resistances add and the current is the same in each. The source voltage is divided between the components.', 'In parallel, each resistor connects to the same pair of nodes and receives the full source voltage. Branch currents add at the junction. The smaller equivalent resistance draws more source current than either branch alone.'],
      equation: '\\frac{1}{R_\\mathrm{eq}}=\\frac{1}{R_1}+\\frac{1}{R_2}', symbols: [['R_eq', 'equivalent parallel resistance, Ω'], ['R_1', 'first resistor, Ω'], ['R_2', 'second resistor, Ω']], math: 'fractions', mathNotes: ['Add reciprocals for parallel branches. For series branches, add the resistances directly.'],
      example: { question: 'Find the equivalent resistance of 1 kΩ and 1 kΩ in parallel.', steps: ['Write 1/R_eq=1/1000+1/1000=2/1000.', 'Invert the result.'], answer: '500 Ω.' },
      calculation: ['Find the equivalent resistance of 1000 Ω and 1000 Ω in parallel.', 500, 'Ω', 'Two equal parallel resistors have half the resistance of one.'],
      predict: ['Adding a second ideal parallel resistor at fixed voltage does what to total current?', ['Increases it', 'Decreases it'], 0, 'A new branch adds positive branch current.'],
      check: ['Which quantity is the same across both parallel resistors?', ['Voltage', 'Current in general'], 0, 'Parallel branches connect to the same two nodes.'],
      lab: 'Compare the series and parallel circuit templates at 9 V with 1 kΩ and 2 kΩ resistors. Inspect total current and both branch readouts. The visual wiring changes with the topology; there is no arbitrary netlist solver.',
      preset: { mode: 2, voltage: 9, resistance: 1000, resistance2: 2000 }, takeaway: 'Use shared current for series and shared voltage for parallel.', limitation: 'The formulas assume ideal fixed resistances and ideal wires; mixed networks require more careful node analysis.'
    },
    {
      id: 'led-and-polarity', title: 'LEDs, polarity and components', summary: 'A diode needs correct polarity and a current-limiting path.',
      body: ['An LED is a diode: in its intended forward direction, it emits light when current flows. Unlike a resistor, its current is not obtained by simply applying V/R across the LED itself.', 'Put a resistor in series with the LED to use the remaining supply voltage. Resistors and switches are passive components; a capacitor stores charge, and a transistor can control a larger current with a signal. The lab numerically models only the resistor and a fixed LED forward drop.'],
      equation: 'I=\\frac{V_\\mathrm{s}-V_\\mathrm{LED}}{R}', symbols: [['I', 'LED loop current, A'], ['V_s', 'source voltage, V'], ['V_LED', 'approximate forward LED drop, V'], ['R', 'series resistor, Ω']], math: 'algebra', mathNotes: ['Subtract the assumed LED drop before dividing by the resistor. If the supply is below the assumed drop, this simplified model returns zero current.'],
      example: { question: 'Estimate LED current at 5 V, 2 V drop and 300 Ω.', steps: ['Resistor gets 5−2=3 V.', 'Divide 3 V by 300 Ω.'], answer: '0.01 A = 10 mA.' },
      calculation: ['Estimate current for 5 V, a 2 V LED drop and a 600 Ω series resistor.', .005, 'A', 'Subtract the assumed LED drop first: I=(5−2)/600=0.005 A.'],
      predict: ['Removing the LED series resistor from a real 5 V loop is safe?', ['No', 'Yes'], 0, 'An LED does not inherently limit current to a safe value.'],
      check: ['For this forward-drop model, a 1 V supply and 2 V LED drop produce?', ['Zero current', 'A large current'], 0, 'The model clamps the unavailable resistor voltage to zero.'],
      lab: 'Choose the LED circuit and open or close the switch. Vary the series resistor and LED drop, then inspect estimated current and LED state. The fixed-drop LED is a classroom approximation, so use a real component datasheet for physical builds.',
      preset: { mode: 3, voltage: 5, resistance: 330, ledDrop: 2 }, takeaway: 'Always distinguish a nonlinear LED from its series resistor.', limitation: 'Real LED forward voltage varies with current and temperature; the lab has no current rating or reverse-bias failure model.'
    },
    {
      id: 'power-and-measurement', title: 'Power and measurements', summary: 'Current and voltage together determine electrical power.',
      body: ['Power measures energy transferred each second. For a DC circuit with one ideal source, source power is the supply voltage times total current. Individual resistor power is the voltage across that resistor times its own current.', 'A voltmeter goes across two nodes; an ammeter goes in the intended current path. Real meters have finite input properties. The virtual readouts are derived from the ideal model and should be checked against conservation of power for resistor-only loops.'],
      equation: 'P=VI', symbols: [['P', 'electrical power, W'], ['V', 'potential difference, V'], ['I', 'current, A']], math: 'ratios', mathNotes: ['A volt times an ampere is a watt. Match voltage and current to the same component or source.'],
      example: { question: 'What power does a 9 V source supply at 10 mA?', steps: ['Convert 10 mA to 0.010 A.', 'Multiply 9 V by 0.010 A.'], answer: '0.09 W.' },
      calculation: ['A 5 V source supplies 0.01 A. Find source power.', .05, 'W', 'Multiply the source voltage by its current: P=5×0.01=0.05 W.'],
      predict: ['Where does an ideal voltmeter go to measure a resistor drop?', ['Across its two ends', 'Only in series with it'], 0, 'Voltage is a difference between nodes.'],
      check: ['If supply voltage stays fixed and circuit current doubles, source power?', ['Doubles', 'Halves'], 0, 'At fixed supply voltage, P=VI makes power double with current.'],
      lab: 'Use the resistor, series and parallel templates and read supply power. Calculate V×I independently, then trace the current path and voltage drops in the schematic before applying these quantities to any physical prototype.',
      preset: { mode: 0, voltage: 5, resistance: 500 }, takeaway: 'Measure the appropriate branch and check power with P=VI.', limitation: 'The lab does not simulate meter loading, resistor heating, energy storage or source internal resistance.'
    }
  ]
});
