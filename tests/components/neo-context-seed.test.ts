/**
 * Tests for seedNeoContext (lib/neo-context-seed.ts) — backs the
 * PatientContextBar "enter once, auto-fill calculators" promise. Verifies
 * neo-scoping and unit-matching so a neonatal value never lands in the wrong
 * field.
 */
import { describe, it, expect } from 'vitest';
import { seedNeoContext } from '@/lib/neo-context-seed';

const ctx = { weightG: 1500, gaWeeks: 32, postnatalDay: 3 };

describe('seedNeoContext', () => {
  it('seeds weight (grams), GA (weeks) and day for a neo tool', () => {
    const inputs = [
      { id: 'weight', type: 'number', unit: 'г' },
      { id: 'ga', type: 'number', unit: 'нед' },
      { id: 'day', type: 'number', unit: 'сут' },
    ];
    expect(seedNeoContext('neo-fluid', inputs, ctx)).toEqual({ weight: 1500, ga: 32, day: 3 });
  });

  it('does nothing for a non-neo tool', () => {
    const inputs = [{ id: 'weight', type: 'number', unit: 'кг' }];
    expect(seedNeoContext('bmi', inputs, ctx)).toEqual({});
  });

  it('does NOT seed a weight input in the wrong unit (kg, not grams)', () => {
    const inputs = [{ id: 'weight', type: 'number', unit: 'кг' }];
    expect(seedNeoContext('neo-something', inputs, ctx)).toEqual({});
  });

  it('skips context fields that are unset (0)', () => {
    const inputs = [{ id: 'weight', type: 'number', unit: 'г' }];
    expect(seedNeoContext('neo-fluid', inputs, { weightG: 0, gaWeeks: 0, postnatalDay: 0 })).toEqual({});
  });

  it('ignores non-number inputs', () => {
    const inputs = [
      { id: 'weight', type: 'checkbox', unit: 'г' },
      { id: 'ga', type: 'select', unit: 'нед' },
    ];
    expect(seedNeoContext('neo-x', inputs, ctx)).toEqual({});
  });
});
