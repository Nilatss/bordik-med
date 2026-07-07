/**
 * Golden tests for START (Simple Triage And Rapid Treatment) — mass
 * casualty triage.
 *
 * Regression coverage for a bug where START was modelled as an additive
 * score+bands calculator: "can walk" contributed 3 points, which fell
 * inside the Red {1,3} band, making the Green ("Minor / walking wounded")
 * band mathematically unreachable for ANY input. A patient who can walk
 * unassisted with normal breathing/pulse/mental status (textbook
 * Green/Minor) was shown "Красный - Immediate". The runner is now a
 * decision tree (compute()) mirroring the real RPM (Respiration /
 * Perfusion / Mental status) algorithm: walking wins outright, then each
 * vital sign is checked independently.
 */
import { describe, it, expect } from 'vitest';
import runner from '@/lib/runners/start';

const compute = (runner as {
  compute: (v: Record<string, number | boolean | string>) => { value: unknown; interpretation: string };
}).compute;

function values(overrides: Partial<Record<string, string>> = {}) {
  return {
    ambulatory: '0',
    breathing: '0',
    perfusion: '0',
    mental: '0',
    minor_override: '0',
    ...overrides,
  };
}

describe('start · triage decision tree', () => {
  it('walking wounded with no other findings → Green (Minor)', () => {
    const r = compute(values({ ambulatory: '3' }));
    expect(r.interpretation).toMatch(/Зелёный/);
  });

  it('walking wounded with a severe wound override → Yellow (Delayed), not Green', () => {
    const r = compute(values({ ambulatory: '3', minor_override: '-1' }));
    expect(r.interpretation).toMatch(/Жёлтый/);
  });

  it('cannot walk, everything else normal → Yellow (Delayed)', () => {
    const r = compute(values());
    expect(r.interpretation).toMatch(/Жёлтый/);
  });

  it('abnormal respiratory rate alone → Red (Immediate)', () => {
    const r = compute(values({ breathing: '1' }));
    expect(r.interpretation).toMatch(/Красный/);
  });

  it('no radial pulse alone → Red (Immediate)', () => {
    const r = compute(values({ perfusion: '1' }));
    expect(r.interpretation).toMatch(/Красный/);
  });

  it('two simultaneously-abnormal vitals → still Red, never mistaken for Green', () => {
    const r = compute(values({ breathing: '1', perfusion: '1' }));
    expect(r.interpretation).toMatch(/Красный/);
  });

  it('apnea after airway opening → Black (Deceased/Expectant)', () => {
    const r = compute(values({ breathing: '4' }));
    expect(r.interpretation).toMatch(/Чёрный/);
  });

  it('every shipped preset resolves to a defined, non-throwing result', () => {
    const presets = (runner as { presets?: { label: string; values: Record<string, string> }[] }).presets ?? [];
    expect(presets.length).toBeGreaterThan(0);
    for (const preset of presets) {
      const r = compute(preset.values);
      expect(r.value).toBeDefined();
    }
  });
});
