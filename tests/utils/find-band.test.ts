/**
 * Tests for the shared `findBand` utility used by every score-kind
 * calculator (GCS, APGAR, Wells, CHA₂DS₂-VASc, HAS-BLED, etc.).
 *
 * `findBand` maps a numeric score to one of an ordered list of bands
 * with [min, max] inclusive ranges. A bug here (off-by-one, wrong fallthrough)
 * would silently misclassify every score-kind calc on the platform.
 */
import { describe, it, expect } from 'vitest';
import { findBand, type ScoreBand } from '@/lib/tools-runners';

const wellsDvtBands: ScoreBand[] = [
  { min: -2, max: 0, label: 'Низкий',  color: '#22C55E', description: 'low risk' },
  { min: 1,  max: 2, label: 'Средний', color: '#F59E0B', description: 'moderate risk' },
  { min: 3,  max: 9, label: 'Высокий', color: '#EF4444', description: 'high risk' },
];

describe('findBand', () => {
  it('returns lowest band on the low boundary', () => {
    expect(findBand(wellsDvtBands, -2).label).toBe('Низкий');
    expect(findBand(wellsDvtBands, 0).label).toBe('Низкий');
  });

  it('switches to moderate at the gap boundary (+1)', () => {
    expect(findBand(wellsDvtBands, 1).label).toBe('Средний');
    expect(findBand(wellsDvtBands, 2).label).toBe('Средний');
  });

  it('switches to high at +3', () => {
    expect(findBand(wellsDvtBands, 3).label).toBe('Высокий');
    expect(findBand(wellsDvtBands, 9).label).toBe('Высокий');
  });

  it('falls back to first band for unmapped values', () => {
    // No band covers 10; we return the first band as a safe-by-default
    // sentinel rather than throwing — the UI can show a warning but
    // the calculator never crashes.
    expect(findBand(wellsDvtBands, 10).label).toBe('Низкий');
  });

  it('handles a single-band list', () => {
    const single: ScoreBand[] = [{
      min: 0, max: 100, label: 'one', color: '#000', description: '',
    }];
    expect(findBand(single, 50).label).toBe('one');
  });

  it('treats max boundary inclusively (≤ max)', () => {
    expect(findBand(wellsDvtBands, 0).label).toBe('Низкий');
    expect(findBand(wellsDvtBands, 2).label).toBe('Средний');
  });
});
