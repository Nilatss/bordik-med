/**
 * Unit tests for the CSP report empty-report guard.
 *
 * Bug: POST /api/csp-report received 235 events from bots/extensions
 * that sent reports with all fields empty (only `disposition: "report"`
 * set). The handler forwarded all of them to Sentry, producing a
 * meaningless "CSP report: unknown blocked inline" issue affecting
 * 232 users.
 *
 * Fix: skip reports where all actionable fields (doc, violated,
 * effective, blocked, sourceFile) are empty strings.
 *
 * This test imports the REAL predicate (`isEmptyCspReport`) that the
 * route uses — no local re-implementation — so it actually guards the
 * shipped behaviour.
 */
import { describe, it, expect } from 'vitest';
import { isEmptyCspReport } from '@/lib/csp-report-empty';

interface SafeReport {
  doc: string;
  violated: string;
  effective: string;
  blocked: string;
  sourceFile: string;
  line: number | null;
  sample: string;
  disp?: string;
}

const EMPTY: SafeReport = {
  doc: '', violated: '', effective: '', blocked: '', sourceFile: '',
  line: null, sample: '', disp: 'report',
};

describe('CSP report empty-report guard', () => {
  it('identifies the bot/extension pattern: all actionable fields empty', () => {
    expect(isEmptyCspReport(EMPTY)).toBe(true);
  });

  it('does not skip a report that has a document-uri', () => {
    expect(isEmptyCspReport({ ...EMPTY, doc: 'https://bordik-med.vercel.app/' })).toBe(false);
  });

  it('does not skip a report that has a violated-directive', () => {
    expect(isEmptyCspReport({ ...EMPTY, violated: "script-src 'self'" })).toBe(false);
  });

  it('does not skip a report that has an effective-directive', () => {
    expect(isEmptyCspReport({ ...EMPTY, effective: 'script-src' })).toBe(false);
  });

  it('does not skip a report that has a blocked-uri', () => {
    expect(isEmptyCspReport({ ...EMPTY, blocked: 'https://evil.com/xss.js' })).toBe(false);
  });

  it('does not skip a report that has a source-file', () => {
    expect(isEmptyCspReport({ ...EMPTY, sourceFile: 'https://bordik-med.vercel.app/app.js' })).toBe(false);
  });

  it('skips even if disp is set (the exact bot pattern seen in Sentry)', () => {
    // The Sentry event showed disposition:"report" but all other fields empty.
    const botReport: SafeReport = { ...EMPTY, disp: 'report' };
    expect(isEmptyCspReport(botReport)).toBe(true);
  });

  it('does not skip a real inline-script violation (blocked=inline, violated set)', () => {
    const real: SafeReport = {
      doc: 'https://bordik-med.vercel.app/',
      violated: "script-src 'self' 'nonce-abc'",
      effective: 'script-src',
      blocked: 'inline',
      sourceFile: '',
      line: 42,
      sample: "alert('xss')",
      disp: 'enforce',
    };
    expect(isEmptyCspReport(real)).toBe(false);
  });
});
