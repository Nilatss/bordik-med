/**
 * Golden tests for neonatal bilirubin nomogram (AAP 2022).
 *
 * Source: Kemper AR, Newman TB, Slaughter JL, et al. Clinical Practice
 *   Guideline Revision: Management of Hyperbilirubinemia in the Newborn
 *   Infant 35 or More Weeks of Gestation. Pediatrics 2022;150(3):e2022058859.
 *
 * Tests cover the math + decision layer in lib/neonatal-bilirubin.ts:
 *   - thresholdAt: linear interpolation between hour-anchors
 *   - classifyStratum: GA + risk-factors → low/medium/high
 *   - decide: 5-tier clinical recommendation
 *   - convert: mg/dL ↔ µmol/L (factor 17.1)
 */
import { describe, it, expect } from 'vitest';
import {
  thresholdAt,
  classifyStratum,
  decide,
  convert,
  type ThresholdPoint,
} from '@/lib/neonatal-bilirubin';

const PT_CURVE: ThresholdPoint[] = [
  { hour: 0,   tsb: 8.0 },
  { hour: 24,  tsb: 12.0 },
  { hour: 48,  tsb: 15.0 },
  { hour: 72,  tsb: 17.0 },
  { hour: 168, tsb: 21.5 },
];

const EX_CURVE: ThresholdPoint[] = [
  { hour: 0,   tsb: 19.0 },
  { hour: 48,  tsb: 22.5 },
  { hour: 168, tsb: 24.5 },
];

describe('thresholdAt — interpolation', () => {
  it('returns first tsb if hour <= min', () => {
    expect(thresholdAt(PT_CURVE, 0)).toBe(8.0);
    expect(thresholdAt(PT_CURVE, -10)).toBe(8.0);
  });

  it('returns last tsb if hour >= max', () => {
    expect(thresholdAt(PT_CURVE, 168)).toBe(21.5);
    expect(thresholdAt(PT_CURVE, 500)).toBe(21.5);
  });

  it('interpolates linearly between anchors', () => {
    // 12 ч = halfway between 0 (8.0) и 24 (12.0)
    expect(thresholdAt(PT_CURVE, 12)).toBeCloseTo(10.0, 6);
    // 36 ч = halfway between 24 (12.0) и 48 (15.0)
    expect(thresholdAt(PT_CURVE, 36)).toBeCloseTo(13.5, 6);
  });

  it('returns null on empty curve', () => {
    expect(thresholdAt([], 24)).toBeNull();
  });

  it('produces monotonically non-decreasing values for AAP curves', () => {
    for (let h = 0; h <= 168; h += 6) {
      const v1 = thresholdAt(PT_CURVE, h);
      const v2 = thresholdAt(PT_CURVE, h + 6);
      if (v1 != null && v2 != null && h < 168) {
        expect(v2).toBeGreaterThanOrEqual(v1);
      }
    }
  });
});

describe('classifyStratum — GA + risk factors → AAP стратификация', () => {
  it('GA ≥38 без рисков → ge38_norisk', () => {
    expect(classifyStratum(40, [])).toBe('ge38_norisk');
    expect(classifyStratum(38, [])).toBe('ge38_norisk');
    expect(classifyStratum(42, ['ga_lt_38'])).toBe('ge38_norisk'); // ga_lt_38 ignored если GA≥38
  });

  it('GA ≥38 с любым non-GA фактором → medium', () => {
    expect(classifyStratum(40, ['isoimmune'])).toBe('ge38_risk_or_3537_norisk');
    expect(classifyStratum(38, ['g6pd'])).toBe('ge38_risk_or_3537_norisk');
    expect(classifyStratum(40, ['sepsis', 'albumin_low'])).toBe('ge38_risk_or_3537_norisk');
  });

  it('GA <38 без non-GA рисков → medium (35–37 без рисков)', () => {
    expect(classifyStratum(36, [])).toBe('ge38_risk_or_3537_norisk');
    expect(classifyStratum(35, ['ga_lt_38'])).toBe('ge38_risk_or_3537_norisk');
  });

  it('GA <38 с non-GA рисками → high (35–37 с рисками)', () => {
    expect(classifyStratum(36, ['ga_lt_38', 'isoimmune'])).toBe('lt38_risk');
    expect(classifyStratum(35, ['g6pd'])).toBe('lt38_risk');
    expect(classifyStratum(37, ['sepsis'])).toBe('lt38_risk');
  });
});

describe('decide — 5-tier clinical recommendation', () => {
  // Используем низкий страт — пороги PT=15 / EX=22.5 на 48 ч
  const PT = 15.0;
  const EX = 22.5;

  it('TSB << PT − 3 → clear', () => {
    const r = decide(8.0, PT, EX);
    expect(r.decision).toBe('clear');
    expect(r.tone).toBe('ok');
  });

  it('TSB в пределах 3 mg/dL ниже PT → monitor', () => {
    const r = decide(13.0, PT, EX);
    expect(r.decision).toBe('monitor');
    expect(r.tone).toBe('monitor');
  });

  it('TSB == PT → phototherapy', () => {
    const r = decide(15.0, PT, EX);
    expect(r.decision).toBe('phototherapy');
    expect(r.tone).toBe('warning');
  });

  it('TSB > PT, но > 2 mg/dL ниже EX → phototherapy', () => {
    const r = decide(18.0, PT, EX); // 18 ≥ 15 но 22.5 - 18 = 4.5 > 2
    expect(r.decision).toBe('phototherapy');
  });

  it('TSB в пределах 2 mg/dL до EX → intensive', () => {
    const r = decide(21.0, PT, EX); // 22.5 - 21 = 1.5 ≤ 2
    expect(r.decision).toBe('intensive');
    expect(r.tone).toBe('critical');
  });

  it('TSB ≥ EX → exchange', () => {
    const r = decide(22.5, PT, EX);
    expect(r.decision).toBe('exchange');
    expect(r.tone).toBe('critical');
    const r2 = decide(25.0, PT, EX);
    expect(r2.decision).toBe('exchange');
  });

  it('returns marginToPt и marginToEx правильно', () => {
    const r = decide(13.0, 15.0, 22.5);
    expect(r.marginToPt).toBeCloseTo(2.0, 5);
    expect(r.marginToEx).toBeCloseTo(9.5, 5);
    expect(r.ptThreshold).toBe(15.0);
    expect(r.exThreshold).toBe(22.5);
  });

  it('label_ru / detail_ru — non-empty для всех уровней', () => {
    for (const tsb of [5, 13, 15.5, 21, 23]) {
      const r = decide(tsb, PT, EX);
      expect(r.label_ru.length).toBeGreaterThan(0);
      expect(r.detail_ru.length).toBeGreaterThan(0);
    }
  });
});

describe('convert — mg/dL ↔ µmol/L', () => {
  const factor = 17.1;

  it('same unit → identity', () => {
    expect(convert(15.5, 'mg/dL', 'mg/dL', factor)).toBe(15.5);
    expect(convert(265, 'umol/L', 'umol/L', factor)).toBe(265);
  });

  it('mg/dL → µmol/L (× factor)', () => {
    expect(convert(15.5, 'mg/dL', 'umol/L', factor)).toBeCloseTo(265.05, 4);
  });

  it('µmol/L → mg/dL (÷ factor)', () => {
    expect(convert(265.05, 'umol/L', 'mg/dL', factor)).toBeCloseTo(15.5, 4);
  });

  it('roundtrip: mg/dL → µmol → mg/dL', () => {
    const original = 12.3;
    const r = convert(convert(original, 'mg/dL', 'umol/L', factor), 'umol/L', 'mg/dL', factor);
    expect(r).toBeCloseTo(original, 6);
  });
});

describe('integration — clinical scenarios from AAP 2022', () => {
  it('Доношенный без рисков на 24 ч с TSB=10 → clear', () => {
    const stratum = classifyStratum(40, []);
    expect(stratum).toBe('ge38_norisk');
    const pt = thresholdAt(PT_CURVE, 24);
    const ex = thresholdAt(EX_CURVE, 24);
    expect(pt).not.toBeNull();
    expect(ex).not.toBeNull();
    const r = decide(10, pt!, ex!);
    expect(r.decision).toMatch(/clear|monitor/);
  });

  it('Доношенный без рисков на 48 ч с TSB=15 → phototherapy (на пороге)', () => {
    const pt = thresholdAt(PT_CURVE, 48);
    const ex = thresholdAt(EX_CURVE, 48);
    expect(pt).toBe(15.0);
    const r = decide(15, pt!, ex!);
    expect(r.decision).toBe('phototherapy');
  });

  it('Доношенный без рисков на 48 ч с TSB=25 → exchange', () => {
    const pt = thresholdAt(PT_CURVE, 48);
    const ex = thresholdAt(EX_CURVE, 48);
    const r = decide(25, pt!, ex!);
    expect(r.decision).toBe('exchange');
  });
});
