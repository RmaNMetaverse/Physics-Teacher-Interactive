import { describe, expect, it } from 'vitest';
import { evaluateModel } from '../src/physics';
import { courseCatalog, courses } from '../src/learning/catalog';

const value = (id: 'circuits' | 'microcontroller', input: Record<string, number>, key: string, time = 0) =>
  evaluateModel(id, input, time).observations.find(item => item.key === key)?.value;

describe('electronics labs', () => {
  it('solves resistor, series, parallel and open-loop reference cases', () => {
    expect(value('circuits', { mode: 0, voltage: 9, resistance: 1000, switchClosed: 1 }, 'totalCurrent')).toBeCloseTo(.009);
    expect(value('circuits', { mode: 1, voltage: 9, resistance: 1000, resistance2: 2000, switchClosed: 1 }, 'totalCurrent')).toBeCloseTo(.003);
    expect(value('circuits', { mode: 2, voltage: 9, resistance: 1000, resistance2: 2000, switchClosed: 1 }, 'totalCurrent')).toBeCloseTo(.0135);
    expect(value('circuits', { mode: 0, voltage: 9, resistance: 1000, switchClosed: 0 }, 'totalCurrent')).toBe(0);
  });
  it('bounds LED current and conserves the idealized loop voltage', () => {
    expect(value('circuits', { mode: 3, voltage: 5, resistance: 300, ledDrop: 2, switchClosed: 1 }, 'totalCurrent')).toBeCloseTo(.01);
    expect(value('circuits', { mode: 3, voltage: 1, resistance: 300, ledDrop: 2, switchClosed: 1 }, 'totalCurrent')).toBe(0);
    expect(value('circuits', { mode: 3, voltage: 5, resistance: 300, ledDrop: 2, switchClosed: 1 }, 'resistorDrop')).toBeCloseTo(3);
  });
  it('models board blink, button, PWM and ADC without pretending to execute firmware', () => {
    expect(value('microcontroller', { mode: 0, period: 2 }, 'pinHigh', .25)).toBe(1);
    expect(value('microcontroller', { mode: 0, period: 2 }, 'pinHigh', 1.25)).toBe(0);
    expect(value('microcontroller', { mode: 1, buttonPressed: 1 }, 'pinHigh')).toBe(1);
    expect(value('microcontroller', { mode: 1, buttonPressed: 0 }, 'pinHigh')).toBe(0);
    expect(value('microcontroller', { mode: 2, duty: 25 }, 'dutyCycle')).toBe(.25);
    expect(value('microcontroller', { mode: 3, analogVoltage: 2.5, board: 0 }, 'adcCode')).toBe(512);
    expect(value('microcontroller', { mode: 3, analogVoltage: 2.5, board: 1 }, 'adcCode')).toBe(3102);
    expect(value('microcontroller', { mode: 3, analogVoltage: 5, board: 1 }, 'sensorVoltage')).toBe(3.3);
  });
  it('places both new paths immediately after electromagnetism', () => {
    const ids = courses.map(course => course.id);
    const index = ids.indexOf('electromagnetism');
    expect(ids.slice(index + 1, index + 3)).toEqual(['electronics', 'arduino-esp32']);
    for (const id of ['electronics', 'arduino-esp32']) {
      const course = courseCatalog.getCourse(id);
      expect(course.missions.filter(m => m.kind === 'mission')).toHaveLength(5);
      expect(course.missions.at(-1)?.kind).toBe('checkpoint');
    }
  });
});
