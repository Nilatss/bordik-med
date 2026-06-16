/**
 * Tests for lib/tool-view/score-compute.ts.
 *
 * Bug #2: the score-kind result path in ToolView.tsx useMemo had no
 * try-catch, unlike the calculator-kind path which has `catch { return null }`.
 * If findBand() throws (e.g. empty bands array on a misconfigured runner),
 * the useMemo would propagate the exception and crash the ToolView component.
 *
 * Fix: the logic was extracted to `computeScoreResult`, which wraps the
 * entire computation in try-catch and returns null on any exception.
 */
import { describe, it, expect } from 'vitest';
import { computeScoreResult } from '@/lib/tool-view/score-compute';
import type { ScoreTool } from '@/lib/tools-runners';

// Minimal score runner with two bands covering 0-10
const RUNNER: ScoreTool = {
  kind: 'score',
  maxScore: 10,
  reference: 'test',
  inputs: [
    { id: 'a', label: 'Criterion A', type: 'checkbox', points: 3 },
    { id: 'b', label: 'Criterion B', type: 'checkbox', points: 5 },
    {
      id: 'c', label: 'Level', type: 'select',
      options: [
        { value: 'none', label: 'None', points: 0 },
        { value: 'mild', label: 'Mild', points: 2 },
      ],
    },
  ],
  bands: [
    { min: 0, max: 4,  label: 'Low',  color: '#22C55E', description: 'низкий риск' },
    { min: 5, max: 10, label: 'High', color: '#F87171', description: 'высокий риск' },
  ],
};

describe('computeScoreResult · correct computation', () => {
  it('returns Low band when no criteria are checked', () => {
    const r = computeScoreResult(RUNNER, { a: false, b: false, c: 'none' });
    expect(r).not.toBeNull();
    expect(r!.value).toBe('0');
    expect(r!.interpretation).toMatch(/Low/);
    expect(r!.color).toBe('#22C55E');
  });

  it('adds checkbox points correctly', () => {
    const r = computeScoreResult(RUNNER, { a: true, b: false, c: 'none' });
    expect(r!.value).toBe('3');
    expect(r!.interpretation).toMatch(/Low/);
  });

  it('adds select points correctly', () => {
    const r = computeScoreResult(RUNNER, { a: false, b: false, c: 'mild' });
    expect(r!.value).toBe('2');
    expect(r!.interpretation).toMatch(/Low/);
  });

  it('switches to High band when total >= 5', () => {
    const r = computeScoreResult(RUNNER, { a: false, b: true, c: 'none' });
    expect(r!.value).toBe('5');
    expect(r!.interpretation).toMatch(/High/);
    expect(r!.color).toBe('#F87171');
  });

  it('includes scale segments matching the bands', () => {
    const r = computeScoreResult(RUNNER, { a: false, b: false, c: 'none' });
    expect(r!.scale?.segments).toHaveLength(2);
    expect(r!.scale?.current).toBe(0);
  });

  it('includes unit строку "из maxScore"', () => {
    const r = computeScoreResult(RUNNER, { a: true, b: true, c: 'mild' });
    expect(r!.unit).toBe('из 10');
  });
});

describe('computeScoreResult · Bug #2 – returns null instead of throwing', () => {
  it('returns null when bands array is empty (would cause findBand to throw)', () => {
    // This is the regression: the old inlined path had no try-catch, so the
    // findBand("empty bands") exception propagated from useMemo to React.
    const badRunner: ScoreTool = { ...RUNNER, bands: [] };
    expect(() => computeScoreResult(badRunner, { a: false, b: false, c: 'none' })).not.toThrow();
    expect(computeScoreResult(badRunner, { a: false, b: false, c: 'none' })).toBeNull();
  });
});
