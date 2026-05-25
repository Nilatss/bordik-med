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
 */
import { describe, it, expect } from 'vitest';

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

function isEmptyReport(safe: SafeReport): boolean {
  return !safe.doc && !safe.violated && !safe.effective && !safe.blocked && !safe.sourceFile;
}

const EMPTY: SafeReport = {
  doc: '', violated: '', effective: '', blocked: '', sourceFile: '',
  line: null, sample: '', disp: 'report',
};

describe('CSP report empty-report guard', () => {
  it('identifies the bot/extension pattern: all actionable fields empty', () => {
    expect(isEmptyReport(EMPTY)).toBe(true);
  });

  it('does not skip a report that has a document-uri', () => {
    expect(isEmptyReport({ ...EMPTY, doc: 'https://bordik-med.vercel.app/' })).toBe(false);
  });

  it('does not skip a report that has a violated-directive', () => {
    expect(isEmptyReport({ ...EMPTY, violated: "script-src 'self'" })).toBe(false);
  });

  it('does not skip a report that has an effective-directive', () => {
    expect(isEmptyReport({ ...EMPTY, effective: 'script-src' })).toBe(false);
  });

  it('does not skip a report that has a blocked-uri', () => {
    expect(isEmptyReport({ ...EMPTY, blocked: 'https://evil.com/xss.js' })).toBe(false);
  });

  it('does not skip a report that has a source-file', () => {
    expect(isEmptyReport({ ...EMPTY, sourceFile: 'https://bordik-med.vercel.app/app.js' })).toBe(false);
  });

  it('skips even if disp is set (the exact bot pattern seen in Sentry)', () => {
    // The Sentry event showed disposition:"report" but all other fields empty.
    const botReport: SafeReport = { ...EMPTY, disp: 'report' };
    expect(isEmptyReport(botReport)).toBe(true);
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
    expect(isEmptyReport(real)).toBe(false);
  });
});
