import { describe, expect, it } from 'vitest';
import { checkAnswer } from '../src/lib/assessment';
import type { Assessment } from '../src/types';

const calculation: Assessment = {
  id: 'speed-calculation',
  kind: 'calculation',
  prompt: 'What is the speed?',
  answer: 9.81,
  tolerance: 0.01,
  unit: 'm/s',
  hints: ['Divide distance by time.'],
  explanation: 'Speed is distance divided by elapsed time.',
};

describe('checkAnswer', () => {
  it('scores a concept answer by its zero-based option index', () => {
    const assessment: Assessment = {
      ...calculation,
      id: 'force-concept',
      kind: 'concept',
      options: ['mass', 'net force', 'speed'],
      answer: 1,
    };

    expect(checkAnswer(assessment, 1)).toEqual({
      correct: true,
      message: assessment.explanation,
    });
    expect(checkAnswer(assessment, '1').correct).toBe(true);
    expect(checkAnswer(assessment, '1.0').correct).toBe(false);
    expect(checkAnswer(assessment, 3).correct).toBe(false);
  });

  it('accepts strict finite numeric input within the configured tolerance', () => {
    expect(checkAnswer(calculation, 9.805).correct).toBe(true);
    expect(checkAnswer(calculation, ' 9.80 ').correct).toBe(true);
    expect(checkAnswer(calculation, '9.82 m/s').correct).toBe(true);
    expect(checkAnswer(calculation, '9.821 m/s').correct).toBe(false);
  });

  it('accepts only the exact optional unit after trimming', () => {
    expect(checkAnswer(calculation, '9.81m/s').correct).toBe(true);
    expect(checkAnswer(calculation, '9.81   m/s   ').correct).toBe(true);
    expect(checkAnswer(calculation, '9.81 M/S').correct).toBe(false);
    expect(checkAnswer(calculation, '9.81 m / s').correct).toBe(false);
  });

  it('rejects junk, empty, and non-finite numeric input', () => {
    for (const input of ['', '9.81 metres/second', '9.81m/s extra', '0x9', 'Infinity', Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(checkAnswer(calculation, input).correct, String(input)).toBe(false);
    }
  });

  it('uses an absolute tolerance of 1e-6 when none is supplied', () => {
    const assessment = { ...calculation, tolerance: undefined, unit: undefined, answer: -2 };
    expect(checkAnswer(assessment, -2.000001).correct).toBe(true);
    expect(checkAnswer(assessment, -2.000002).correct).toBe(false);
  });
});

it('keeps explicit scientific tolerances meaningful below one SI unit', () => {
  const photonEnergy = { ...calculation, answer: 6e-19, tolerance: 9e-21, unit: 'J' };
  expect(checkAnswer(photonEnergy, '6e-19 J').correct).toBe(true);
  expect(checkAnswer(photonEnergy, '6.05e-19 J').correct).toBe(true);
  expect(checkAnswer(photonEnergy, 0).correct).toBe(false);
  expect(checkAnswer(photonEnergy, '9e-19 J').correct).toBe(false);
  expect(checkAnswer({ ...photonEnergy, answer: -6e-19 }, 6e-19).correct).toBe(false);
});
