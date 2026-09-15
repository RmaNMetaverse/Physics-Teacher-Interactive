import { defineModel, observation as o, parameter as p, state } from './shared';

/** Ideal DC topologies. The LED is a deliberately simple fixed-forward-drop component. */
export const circuits = defineModel('circuits', 'Circuit workbench', 'Build and compare a switchable resistor, series pair, parallel pair, or LED loop.', [
  p('mode', 'Circuit', '', 0, 3, 1, 0),
  p('voltage', 'Supply voltage', 'V', 0, 12, .1, 5),
  p('resistance', 'R1', 'Ω', 100, 10000, 10, 330),
  p('resistance2', 'R2', 'Ω', 100, 10000, 10, 1000),
  p('switchClosed', 'Switch', '', 0, 1, 1, 1),
  p('ledDrop', 'LED forward drop', 'V', 1, 3.5, .1, 2),
], 20, (input, time) => {
  const { mode, voltage, resistance: r1, resistance2: r2, switchClosed, ledDrop } = input;
  const equivalent = mode === 1 ? r1 + r2 : mode === 2 ? 1 / (1 / r1 + 1 / r2) : r1;
  const available = mode === 3 ? Math.max(0, voltage - ledDrop) : voltage;
  const current = switchClosed ? available / equivalent : 0;
  const branch1 = mode === 2 ? (switchClosed ? voltage / r1 : 0) : current;
  const branch2 = mode === 2 ? (switchClosed ? voltage / r2 : 0) : mode === 1 ? current : 0;
  const resistorDrop = mode === 3 ? current * r1 : mode === 1 ? current * r1 : switchClosed ? voltage : 0;
  return state(time, 'Ideal DC wires, ideal voltage source and constant resistors. Open switch blocks current. LED uses a fixed forward drop and has no reverse-bias, temperature, or current rating model. This is not a general circuit solver.', [
    o('totalCurrent', 'Total current', current, 'A'),
    o('equivalentResistance', 'Equivalent resistance', equivalent, 'Ω'),
    o('branch1Current', 'R1 branch current', branch1, 'A'),
    o('branch2Current', 'R2 branch current', branch2, 'A'),
    o('resistorDrop', 'Voltage across R1', resistorDrop, 'V'),
    o('power', 'Supply power', voltage * current, 'W'),
    o('ledOn', 'LED conducting', mode === 3 && current > 0 ? 1 : 0, ''),
  ]);
});
