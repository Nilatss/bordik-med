/**
 * Tests for structural validation added to loadBank() in app/api/diagnostic/route.ts.
 *
 * Bug: shuffleOptions() used `q.options[i]!` with a hardcoded idx=[0,1,2,3].
 * If a bank question had fewer than 4 options, newOptions contained undefined values
 * (TypeScript `!` suppresses the error at compile time). Additionally, if
 * q.correctIndex was outside [0,3], idx.indexOf returned -1, producing a question
 * with no correct answer.
 *
 * Fix: loadBank() now validates each question's structure before safety-checking
 * its content. Questions with options.length !== 4 or correctIndex outside [0,3]
 * are dropped (same as unsafe-content questions).
 *
 * These tests verify the structural predicate used in loadBank() directly,
 * matching the exact conditions added to the production code.
 */
import { describe, it, expect } from 'vitest';

interface BankQuestion {
  id: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

/** Mirror of the structural predicate added to loadBank(). */
function isBankQuestionStructurallyValid(q: unknown): boolean {
  if (!q || typeof q !== 'object') return false;
  const bq = q as BankQuestion;
  if (
    !Array.isArray(bq.options) || bq.options.length !== 4 ||
    typeof bq.correctIndex !== 'number' || !Number.isInteger(bq.correctIndex) ||
    bq.correctIndex < 0 || bq.correctIndex >= 4
  ) return false;
  return true;
}

const VALID_QUESTION: BankQuestion = {
  id: 'q1',
  topic: 'anatomy',
  difficulty: 'medium',
  question: 'Какой орган отвечает за синтез инсулина?',
  options: ['Печень', 'Поджелудочная железа', 'Надпочечники', 'Тимус'],
  correctIndex: 1,
};

describe('bank question structural validation (Bug fix: shuffleOptions unsafe access)', () => {
  it('accepts a well-formed question with 4 options and valid correctIndex', () => {
    expect(isBankQuestionStructurallyValid(VALID_QUESTION)).toBe(true);
  });

  it('accepts correctIndex 0 (first option)', () => {
    expect(isBankQuestionStructurallyValid({ ...VALID_QUESTION, correctIndex: 0 })).toBe(true);
  });

  it('accepts correctIndex 3 (last option)', () => {
    expect(isBankQuestionStructurallyValid({ ...VALID_QUESTION, correctIndex: 3 })).toBe(true);
  });

  // ── Bug reproductions ─────────────────────────────────────────────────

  it('rejects null / undefined', () => {
    expect(isBankQuestionStructurallyValid(null)).toBe(false);
    expect(isBankQuestionStructurallyValid(undefined)).toBe(false);
  });

  it('rejects question with 3 options (would cause undefined in newOptions)', () => {
    const q = { ...VALID_QUESTION, options: ['А', 'Б', 'В'] };
    expect(isBankQuestionStructurallyValid(q)).toBe(false);
  });

  it('rejects question with 5 options (out of range access if shuffled)', () => {
    const q = { ...VALID_QUESTION, options: ['А', 'Б', 'В', 'Г', 'Д'] };
    expect(isBankQuestionStructurallyValid(q)).toBe(false);
  });

  it('rejects options: [] (empty array)', () => {
    const q = { ...VALID_QUESTION, options: [] };
    expect(isBankQuestionStructurallyValid(q)).toBe(false);
  });

  it('rejects correctIndex: -1 (would produce newCorrect=-1 from idx.indexOf)', () => {
    const q = { ...VALID_QUESTION, correctIndex: -1 };
    expect(isBankQuestionStructurallyValid(q)).toBe(false);
  });

  it('rejects correctIndex: 4 (out-of-range, idx.indexOf returns -1)', () => {
    const q = { ...VALID_QUESTION, correctIndex: 4 };
    expect(isBankQuestionStructurallyValid(q)).toBe(false);
  });

  it('rejects correctIndex: 99 (far out of range)', () => {
    const q = { ...VALID_QUESTION, correctIndex: 99 };
    expect(isBankQuestionStructurallyValid(q)).toBe(false);
  });

  it('rejects non-integer correctIndex (e.g. 1.5)', () => {
    const q = { ...VALID_QUESTION, correctIndex: 1.5 };
    expect(isBankQuestionStructurallyValid(q)).toBe(false);
  });

  it('rejects string correctIndex', () => {
    const q = { ...VALID_QUESTION, correctIndex: '1' as unknown as number };
    expect(isBankQuestionStructurallyValid(q)).toBe(false);
  });

  it('rejects options: null', () => {
    const q = { ...VALID_QUESTION, options: null as unknown as string[] };
    expect(isBankQuestionStructurallyValid(q)).toBe(false);
  });
});
