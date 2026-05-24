/**
 * Tests for the CSP-report noise filter (lib/csp-report-classify.ts).
 *
 * The severity ladder keeps the Sentry dashboard signal-rich:
 *   - error   real injection attempt
 *   - info    known-benign browser-extension / browser-chrome noise
 *   - warning a genuine first-party CSP violation worth triaging
 *
 * Suspicious must always win over benign so a crafted attack that happens
 * to share a benign shape is never silently demoted.
 */
import { describe, it, expect } from 'vitest';
import {
  classifyDirective,
  looksSuspicious,
  looksKnownBenign,
  severityFor,
  extractSafeFields,
  type CspSafeFields,
} from '@/lib/csp-report-classify';

const base: CspSafeFields = { blocked: '', sample: '', violated: '', sourceFile: '' };
const make = (o: Partial<CspSafeFields>): CspSafeFields => ({ ...base, ...o });

describe('extractSafeFields · dual wire format', () => {
  it('reads legacy report-uri kebab-case keys', () => {
    const r = {
      'document-uri': 'https://bordik.app/',
      'violated-directive': 'script-src-elem',
      'effective-directive': 'script-src-elem',
      'blocked-uri': 'chrome-extension://abc/x.js',
      'source-file': 'https://bordik.app/a.js',
      'line-number': 42,
      'script-sample': 'eval(1)',
      disposition: 'enforce',
    };
    const s = extractSafeFields(r);
    expect(s.doc).toBe('https://bordik.app/');
    expect(s.violated).toBe('script-src-elem');
    expect(s.blocked).toBe('chrome-extension://abc/x.js');
    expect(s.sourceFile).toBe('https://bordik.app/a.js');
    expect(s.line).toBe(42);
    expect(s.sample).toBe('eval(1)');
    expect(s.disp).toBe('enforce');
  });

  it('reads Reporting-API camelCase keys (modern Chromium)', () => {
    const r = {
      documentURL: 'https://bordik.app/',
      violatedDirective: 'script-src-elem',
      effectiveDirective: 'script-src-elem',
      blockedURL: 'moz-extension://uuid/content.js',
      sourceFile: 'moz-extension://uuid/content.js',
      lineNumber: 7,
      sample: 'foo',
      disposition: 'report',
    };
    const s = extractSafeFields(r);
    // The camelCase keys must NOT be dropped (the bug this fix addresses).
    expect(s.blocked).toBe('moz-extension://uuid/content.js');
    expect(s.violated).toBe('script-src-elem');
    expect(s.doc).toBe('https://bordik.app/');
    expect(s.line).toBe(7);
    expect(s.disp).toBe('report');
  });

  it('a camelCase extension report classifies as known-benign → info', () => {
    const s = extractSafeFields({ blockedURL: 'chrome-extension://x/y.js', violatedDirective: 'script-src' });
    expect(severityFor(s).level).toBe('info');
    expect(severityFor(s).benign).toBe(true);
  });

  it('truncates over-long fields (log-inflation defence)', () => {
    const long = 'a'.repeat(2000);
    const s = extractSafeFields({ blockedURL: long, sample: long });
    expect(s.blocked.length).toBe(500);
    expect(s.sample.length).toBe(200);
  });

  it('handles an empty report without throwing', () => {
    const s = extractSafeFields({});
    expect(s.blocked).toBe('');
    expect(s.line).toBeNull();
    expect(s.disp).toBeUndefined();
  });
});

describe('classifyDirective', () => {
  it('takes the first token of the effective directive', () => {
    expect(classifyDirective("script-src 'self'", "script-src-elem 'self' https://x")).toBe('script-src-elem');
  });
  it('falls back to the violated directive when effective is empty', () => {
    expect(classifyDirective("img-src 'self'", '')).toBe('img-src');
  });
  it('returns "unknown" for empty input', () => {
    expect(classifyDirective('', '')).toBe('unknown');
  });
});

describe('looksKnownBenign · browser-extension noise', () => {
  it('flags chrome-extension blocked-uri', () => {
    expect(looksKnownBenign(make({ blocked: 'chrome-extension://abcdef/inject.js' }))).toBe(true);
  });
  it('flags moz-extension source-file', () => {
    expect(looksKnownBenign(make({ sourceFile: 'moz-extension://uuid/content.js' }))).toBe(true);
  });
  it('flags Safari masked extension url', () => {
    expect(looksKnownBenign(make({ blocked: 'webkit-masked-url://hidden/' }))).toBe(true);
  });
  it('flags safari-web-extension', () => {
    expect(looksKnownBenign(make({ blocked: 'safari-web-extension://X/Y.js' }))).toBe(true);
  });
  it('flags about: / chrome: chrome injections', () => {
    expect(looksKnownBenign(make({ blocked: 'about:blank' }))).toBe(true);
    expect(looksKnownBenign(make({ sourceFile: 'chrome://browser/content/x.js' }))).toBe(true);
  });
  it('is case-insensitive and trims', () => {
    expect(looksKnownBenign(make({ blocked: '  CHROME-EXTENSION://X/Y.js' }))).toBe(true);
  });
  it('does NOT flag a first-party inline or https violation', () => {
    expect(looksKnownBenign(make({ blocked: 'inline' }))).toBe(false);
    expect(looksKnownBenign(make({ blocked: 'https://evil.example/x.js' }))).toBe(false);
    expect(looksKnownBenign(make({ blocked: '' }))).toBe(false);
  });
});

describe('severityFor · ladder', () => {
  it('extension injection → info + benign flag', () => {
    const s = severityFor(make({ blocked: 'chrome-extension://x/inject.js', violated: "script-src 'self'" }));
    expect(s).toEqual({ level: 'info', suspicious: false, benign: true });
  });

  it('javascript: blocked-uri → error (suspicious wins)', () => {
    const s = severityFor(make({ blocked: 'javascript:alert(1)', violated: "script-src 'self'" }));
    expect(s.level).toBe('error');
    expect(s.suspicious).toBe(true);
    expect(s.benign).toBe(false);
  });

  it('inline script with eval sample → error', () => {
    const s = severityFor(make({ blocked: 'inline', sample: 'eval(atob("..."))' }));
    expect(s.level).toBe('error');
  });

  it('genuine first-party violation → warning', () => {
    const s = severityFor(make({ blocked: 'https://cdn.thirdparty.com/widget.js', violated: "script-src 'self'" }));
    expect(s.level).toBe('warning');
    expect(s.suspicious).toBe(false);
    expect(s.benign).toBe(false);
  });

  it('suspicious extension-shaped report is NOT demoted to info', () => {
    // A data:text/html payload that also somehow references an extension —
    // suspicion must take precedence over the benign downgrade.
    const s = severityFor(make({
      blocked: 'data:text/html,<script>evil</script>',
      sourceFile: 'chrome-extension://x/y.js',
      violated: "script-src 'self'",
    }));
    expect(s.suspicious).toBe(true);
    expect(s.benign).toBe(false);
    expect(s.level).toBe('error');
  });
});
