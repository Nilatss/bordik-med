/**
 * Tests for lib/vitals-format.ts
 *
 * Bug: WebVitalsReporter used `${Math.round(metric.value)}ms` for all
 * metrics. CLS is a dimensionless score (0–1), not milliseconds.
 * Math.round(0.259) = 0, so every CLS event appeared as "CLS poor (0ms)"
 * in Sentry — the actual score was invisible, making the issue useless
 * for triaging regressions.
 *
 * Fix: formatVitalsMessage / formatVitalsBreadcrumb handle CLS separately,
 * showing the score with 3 decimal places and no "ms" suffix.
 */
import { describe, it, expect } from 'vitest';
import { formatVitalsMessage, formatVitalsBreadcrumb } from '@/lib/vitals-format';

describe('formatVitalsMessage', () => {
  it('formats LCP as milliseconds (whole number)', () => {
    expect(formatVitalsMessage('LCP', 'poor', 10727)).toBe('web-vitals · LCP poor (10727ms)');
  });

  it('formats FCP as milliseconds', () => {
    expect(formatVitalsMessage('FCP', 'poor', 9536.4)).toBe('web-vitals · FCP poor (9536ms)');
  });

  it('formats TTFB as milliseconds', () => {
    expect(formatVitalsMessage('TTFB', 'poor', 9181.9)).toBe('web-vitals · TTFB poor (9182ms)');
  });

  it('formats INP as milliseconds', () => {
    expect(formatVitalsMessage('INP', 'needs-improvement', 250.7)).toBe('web-vitals · INP needs-improvement (251ms)');
  });

  it('formats CLS as a dimensionless score — not milliseconds', () => {
    const result = formatVitalsMessage('CLS', 'poor', 0.259);
    expect(result).toBe('web-vitals · CLS poor (0.259)');
    expect(result).not.toContain('ms');
  });

  it('CLS score that rounds to 0 should still show meaningful value', () => {
    // The old bug: Math.round(0.259) = 0, making "CLS poor (0ms)"
    const result = formatVitalsMessage('CLS', 'poor', 0.259);
    expect(result).not.toBe('web-vitals · CLS poor (0ms)');
    expect(result).toContain('0.259');
  });

  it('formats a near-good CLS score with correct precision', () => {
    expect(formatVitalsMessage('CLS', 'good', 0.001)).toBe('web-vitals · CLS good (0.001)');
  });
});

describe('formatVitalsBreadcrumb', () => {
  it('formats LCP breadcrumb as milliseconds', () => {
    expect(formatVitalsBreadcrumb('LCP', 10727, 'poor')).toBe('LCP: 10727 (poor)');
  });

  it('formats CLS breadcrumb as dimensionless score', () => {
    const result = formatVitalsBreadcrumb('CLS', 0.259, 'poor');
    expect(result).toBe('CLS: 0.259 (poor)');
    expect(result).not.toContain('ms');
  });

  it('CLS breadcrumb should not collapse to zero for sub-0.5 scores', () => {
    const result = formatVitalsBreadcrumb('CLS', 0.259, 'poor');
    expect(result).not.toContain(': 0 ');
  });
});
