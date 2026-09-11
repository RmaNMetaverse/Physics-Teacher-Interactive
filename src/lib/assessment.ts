import type { Assessment } from '../types';

export interface AnswerResult {
  correct: boolean;
  message: string;
}

const NUMBER_PREFIX = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/i;

function parseNumericInput(input: string | number, expectedUnit?: string): number | null {
  if (typeof input === 'number') return Number.isFinite(input) ? input : null;

  const trimmed = input.trim();
  const match = NUMBER_PREFIX.exec(trimmed);
  if (!match) return null;

  const value = Number(match[0]);
  if (!Number.isFinite(value)) return null;

  const suppliedUnit = trimmed.slice(match[0].length).trim();
  const unit = expectedUnit?.trim() ?? '';
  if (suppliedUnit !== '' && suppliedUnit !== unit) return null;

  return value;
}

function feedback(assessment: Assessment, correct: boolean): AnswerResult {
  return {
    correct,
    message: correct
      ? assessment.explanation
      : assessment.hints[0] ?? 'Review the explanation and try again.',
  };
}

export function checkAnswer(assessment: Assessment, input: string | number): AnswerResult {
  if (assessment.kind === 'concept') {
    const optionCount = assessment.options?.length ?? 0;
    const index = typeof input === 'number'
      ? input
      : /^\d+$/.test(input.trim())
        ? Number(input.trim())
        : Number.NaN;
    const correct = Number.isInteger(index)
      && index >= 0
      && index < optionCount
      && index === assessment.answer;
    return feedback(assessment, correct);
  }

  const value = parseNumericInput(input, assessment.unit);
  if (value === null || !Number.isFinite(assessment.answer)) return feedback(assessment, false);

  const tolerance = assessment.tolerance ?? 1e-6;
  if (!Number.isFinite(tolerance) || tolerance < 0) return feedback(assessment, false);
  const roundingAllowance = Number.EPSILON * Math.max(Math.abs(value), Math.abs(assessment.answer)) * 4;
  return feedback(assessment, Math.abs(value - assessment.answer) <= tolerance + roundingAllowance);
}
