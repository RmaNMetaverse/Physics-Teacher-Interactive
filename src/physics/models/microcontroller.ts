import { defineModel, observation as o, parameter as p, state } from './shared';

/** Explicit behavior presets, not a firmware interpreter or hardware electrical solver. */
export const microcontroller = defineModel('microcontroller', 'Arduino / ESP32 starter board', 'Try Blink, a button input, PWM LED dimming and an analog sensor on a simplified board.', [
  p('mode', 'Example', '', 0, 3, 1, 0),
  p('board', 'Board', '', 0, 1, 1, 0),
  p('period', 'Blink period', 's', .2, 5, .1, 2),
  p('buttonPressed', 'Button', '', 0, 1, 1, 0),
  p('duty', 'PWM duty cycle', '%', 0, 100, 1, 50),
  p('analogVoltage', 'Sensor voltage', 'V', 0, 5, .1, 2.5),
  p('resistance', 'LED series resistor', 'Ω', 100, 2200, 10, 330),
], 20, (input, time) => {
  const { mode, board, period, buttonPressed, duty, analogVoltage, resistance } = input;
  const supply = board === 0 ? 5 : 3.3;
  const maxCode = board === 0 ? 1023 : 4095;
  const pinHigh = mode === 0 ? Number(time % period < period / 2) : mode === 1 ? buttonPressed : mode === 2 ? Number(time % .02 < .02 * duty / 100) : 0;
  const fraction = mode === 2 ? duty / 100 : pinHigh;
  const ledCurrent = mode === 3 ? 0 : Math.max(0, supply - 2) / resistance * fraction;
  return state(time, 'Presets emulate a digital output, a pulled button input, ideal PWM and a linearly scaled ADC. UNO R3 example uses 5 V/10-bit; generic original ESP32 example uses 3.3 V/12-bit. Real ADC calibration, pin limits, LED variation, board-specific PWM and actual sketch execution are outside this model.', [
    o('pinHigh', 'Output logic high', pinHigh, ''),
    o('ledCurrent', 'Average LED current', ledCurrent, 'A'),
    o('dutyCycle', 'PWM duty fraction', mode === 2 ? duty / 100 : fraction, ''),
    o('adcCode', 'Ideal ADC code', Math.round(Math.min(analogVoltage, supply) / supply * maxCode), ''),
    o('sensorVoltage', 'Sensor voltage used by ADC', Math.min(analogVoltage, supply), 'V'),
    o('logicVoltage', 'Board logic voltage', supply, 'V'),
  ]);
});
