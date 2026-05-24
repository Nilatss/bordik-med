/**
 * Pure classifiers for CSP violation reports — extracted from
 * `app/api/csp-report/route.ts` so the noise-filtering logic is
 * unit-testable without spinning up the edge route.
 *
 * Severity ladder (highest wins):
 *   - error   — looks like a real injection attack
 *   - info    — known-benign noise (browser-extension injected scripts,
 *               translator/grammar tools, etc.) that no site CSP can or
 *               should allow. Kept in Sentry for completeness but demoted
 *               so the dashboard's warning stream stays signal-rich.
 *   - warning — a genuine CSP violation worth triaging (our allow-list
 *               probably needs widening).
 */

export interface CspSafeFields {
  blocked: string;
  sample: string;
  violated: string;
  sourceFile: string;
}

export type CspLevel = 'error' | 'warning' | 'info';

/**
 * A raw CSP report body. Two wire formats exist and the app enables BOTH
 * reporting directives (`report-uri` + `report-to`), so a report can carry
 * either key style:
 *   - legacy `report-uri`        → kebab-case (`blocked-uri`, …)
 *   - Reporting API `report-to`  → camelCase (`blockedURL`, …)
 * Modern Chromium prefers the Reporting API, so the camelCase keys are
 * increasingly the common path — reading only kebab would silently drop
 * every field from those reports (and defeat the noise filter).
 */
export interface RawCspReport {
  'document-uri'?: string;        documentURL?: string;
  'violated-directive'?: string;  violatedDirective?: string;
  'effective-directive'?: string; effectiveDirective?: string;
  'blocked-uri'?: string;         blockedURL?: string;
  'source-file'?: string;         sourceFile?: string;
  'line-number'?: number;         lineNumber?: number;
  'script-sample'?: string;       sample?: string;
  disposition?: string;
}

export interface CspExtracted {
  doc: string;
  violated: string;
  effective: string;
  blocked: string;
  sourceFile: string;
  line: number | null;
  sample: string;
  disp: string | undefined;
}

/**
 * Read a raw report (either wire format) into the flat, length-capped
 * shape the route logs + classifies. Truncates long fields so a malicious
 * report can't inflate logs / Sentry payloads.
 */
export function extractSafeFields(r: RawCspReport): CspExtracted {
  const line = typeof r['line-number'] === 'number'
    ? r['line-number']
    : typeof r.lineNumber === 'number' ? r.lineNumber : null;
  return {
    doc:       (r['document-uri']        ?? r.documentURL        ?? '').slice(0, 500),
    violated:  (r['violated-directive']  ?? r.violatedDirective  ?? '').slice(0, 200),
    effective: (r['effective-directive'] ?? r.effectiveDirective ?? '').slice(0, 200),
    blocked:   (r['blocked-uri']         ?? r.blockedURL         ?? '').slice(0, 500),
    sourceFile:(r['source-file']         ?? r.sourceFile         ?? '').slice(0, 500),
    line,
    sample:    (r['script-sample']       ?? r.sample             ?? '').slice(0, 200),
    disp:      r.disposition,
  };
}

/**
 * Bucket the directive into a short, stable tag so Sentry groups
 * violations by actionable type rather than fanning out per document-uri.
 */
export function classifyDirective(violated: string, effective: string): string {
  const d = effective || violated;
  // The directive value usually looks like "script-src 'self' ..." — we
  // just want the first token.
  const head = d.split(/\s+/)[0]?.toLowerCase() ?? 'unknown';
  return head || 'unknown';
}

/**
 * Heuristic for "this looks like a real attack, not a misconfigured
 * allowlist": inline-script violations carrying a script-sample, or a
 * blocked-uri pointing at eval / javascript: / data:text/html.
 */
export function looksSuspicious(safe: CspSafeFields): boolean {
  const u = safe.blocked.toLowerCase();
  if (u.startsWith('javascript:') || u.startsWith('data:text/html')) return true;
  if (u === 'inline' && /eval|new Function|atob/i.test(safe.sample)) return true;
  if (/script-src/i.test(safe.violated) && safe.sample.length > 0) return true;
  return false;
}

// Schemes that only ever appear when a browser extension (or the browser
// chrome itself) injected content into the page. No first-party CSP can
// allow these, and they are never an attack on us — they are the user's
// own extensions. Reported verbatim by Chromium, Firefox and Safari.
const BENIGN_SCHEMES = [
  'chrome-extension:',
  'moz-extension:',
  'safari-extension:',
  'safari-web-extension:',
  'ms-browser-extension:',
  'webkit-masked-url:', // Safari masks extension scripts behind this
  'chrome:',
  'about:',
];

/**
 * True when the violation is known-benign noise — an injection from a
 * browser extension or the browser itself, identifiable by the scheme of
 * `blocked-uri` or `source-file`. These dominate CSP report volume in the
 * wild and carry zero security signal.
 */
export function looksKnownBenign(safe: Pick<CspSafeFields, 'blocked' | 'sourceFile'>): boolean {
  const matches = (s: string): boolean => {
    const v = s.trim().toLowerCase();
    return BENIGN_SCHEMES.some((scheme) => v.startsWith(scheme));
  };
  return matches(safe.blocked) || matches(safe.sourceFile);
}

/**
 * Resolve the final Sentry severity + flags for a report. Suspicious wins
 * over benign so a crafted attack that happens to share a benign shape is
 * never silently demoted.
 */
export function severityFor(safe: CspSafeFields): {
  level: CspLevel;
  suspicious: boolean;
  benign: boolean;
} {
  const suspicious = looksSuspicious(safe);
  const benign = !suspicious && looksKnownBenign(safe);
  const level: CspLevel = suspicious ? 'error' : benign ? 'info' : 'warning';
  return { level, suspicious, benign };
}
