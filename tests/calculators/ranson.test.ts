/**
 * Golden tests for Ranson / Glasgow-Imrie / HAPS pancreatitis severity.
 *
 * References:
 *   Ranson JH et al. Surg Gynecol Obstet. 1974;139(1):69–81.
 *   Blamey SL, Imrie CW. Gut. 1984;25(12):1340–6.
 *   Lankisch PG et al. Clin Gastroenterol Hepatol. 2009;7(6):702–5.
 *
 * The runner is a single calculator that switches behaviour based on
 * the `tool` selector — exercise each band per scoring system.
 */
import { describe, it, expect } from 'vitest';
import ranson from '@/lib/runners/ranson';

interface RResult { value: string; interpretation: string }

function call(tool: 'ranson' | 'glasgow' | 'haps', score: number): RResult {
  return (ranson.compute as unknown as (v: { tool: string; score: number }) => unknown)({
    tool, score,
  }) as RResult;
}

describe('ranson · compute', () => {
  describe('Ranson (post-48h, ≤ 11 points)', () => {
    it('≤ 2 → mild', () => {
      expect(call('ranson', 0).interpretation).toMatch(/Лёгкий/);
      expect(call('ranson', 2).interpretation).toMatch(/Лёгкий/);
    });

    it('3-4 → moderate (~15% mortality)', () => {
      expect(call('ranson', 3).interpretation).toMatch(/Умеренный/);
      expect(call('ranson', 4).interpretation).toMatch(/15%/);
    });

    it('5-6 → severe (~40%)', () => {
      expect(call('ranson', 5).interpretation).toMatch(/Тяжёлый/);
      expect(call('ranson', 6).interpretation).toMatch(/40%/);
    });

    it('7-11 → critical (~100%)', () => {
      expect(call('ranson', 7).interpretation).toMatch(/Критический/);
      expect(call('ranson', 11).interpretation).toMatch(/100%/);
    });
  });

  describe('Glasgow-Imrie (within 48h, ≤ 8 points)', () => {
    it('≤ 2 → mild', () => {
      expect(call('glasgow', 0).interpretation).toMatch(/Лёгкий/);
      expect(call('glasgow', 2).interpretation).toMatch(/Лёгкий/);
    });

    it('≥ 3 → severe (boundary)', () => {
      expect(call('glasgow', 3).interpretation).toMatch(/Тяжёлый/);
      expect(call('glasgow', 8).interpretation).toMatch(/Тяжёлый/);
    });
  });

  describe('HAPS (Harmless Acute Pancreatitis Score)', () => {
    it('0 → harmless', () => {
      const r = call('haps', 0);
      expect(r.interpretation.toLowerCase()).toMatch(/harmless|низкий/);
    });

    it('> 0 → not harmless, standard work-up', () => {
      const r = call('haps', 1);
      expect(r.interpretation.toLowerCase()).not.toMatch(/^harmless/);
    });
  });
});
