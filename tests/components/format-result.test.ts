/**
 * Tests for the copy-to-clipboard result formatter (components/tools/view/
 * format-result.ts) — backs the "Копировать" button on a calculator result.
 */
import { describe, it, expect } from 'vitest';
import { formatResultForCopy } from '@/components/tools/view/format-result';

describe('formatResultForCopy', () => {
  it('joins value, unit and interpretation', () => {
    expect(formatResultForCopy({ value: 4, unit: 'балла', interpretation: 'высокий риск' }))
      .toBe('4 балла - высокий риск');
  });

  it('omits the unit when absent', () => {
    expect(formatResultForCopy({ value: 'Garden IV', interpretation: 'смещённый перелом' }))
      .toBe('Garden IV - смещённый перелом');
  });

  it('returns just the value+unit when there is no interpretation', () => {
    expect(formatResultForCopy({ value: 22, unit: 'кг/м²', interpretation: '' }))
      .toBe('22 кг/м²');
  });

  it('returns just the interpretation when there is no value', () => {
    expect(formatResultForCopy({ value: '', interpretation: 'см. примечание' }))
      .toBe('см. примечание');
  });
});
