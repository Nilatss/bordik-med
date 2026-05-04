/**
 * CSP violation report sink (P1-SEC-1, plus Sentry pipeline).
 *
 * Browsers POST a JSON body in one of two formats:
 *   - legacy `application/csp-report` { "csp-report": { … } }
 *   - new    `application/reports+json`   [ { "type": "csp-violation", "body": { … } } ]
 *
 * Each report is:
 *   1. Sanitised + length-capped (defends against an attacker stuffing
 *      megabytes of garbage into log fields).
 *   2. Logged to console (Vercel Runtime Logs picks it up).
 *   3. Captured in Sentry as a `warning` event so violations surface in
 *      the Sentry dashboard alongside JS errors. Tags: `csp.directive`,
 *      `csp.disposition`, `csp.blocked-host`, `csp.suspicious`. Filter
 *      by these in Sentry to triage which CSP directive needs widening.
 *
 * Never reflect untrusted data back to the caller — return 204
 * unconditionally regardless of report content.
 *
 * Also rate-limit by IP-hash so a misbehaving extension can't drown
 * our log stream OR our Sentry quota.
 */
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { makeRateLimiter, identifyRequest } from '@/lib/rate-limit';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// 60 reports / minute / source — enough for an honest browser, blocks
// pathological loops.
const reportLimiter = makeRateLimiter({ capacity: 60, refillPerSec: 1 });

interface CspReport {
  'document-uri'?: string;
  'violated-directive'?: string;
  'effective-directive'?: string;
  'blocked-uri'?: string;
  'source-file'?: string;
  'line-number'?: number;
  'script-sample'?: string;
  disposition?: string;
}

export async function POST(req: Request) {
  const ident = await identifyRequest(req, null);
  const decision = reportLimiter(ident);
  if (!decision.ok) {
    return new NextResponse(null, { status: 429, headers: { 'Retry-After': String(decision.retryAfter) } });
  }

  const ct = req.headers.get('content-type') ?? '';
  if (!ct.includes('csp-report') && !ct.includes('reports+json') && !ct.includes('json')) {
    return new NextResponse(null, { status: 415 });
  }

  let raw: unknown;
  try { raw = await req.json(); }
  catch { return new NextResponse(null, { status: 400 }); }

  // Normalise both shapes into a flat array of report bodies.
  let reports: CspReport[] = [];
  if (Array.isArray(raw)) {
    // Reporting-API format
    reports = (raw as Array<{ type?: string; body?: CspReport }>)
      .filter((r) => r?.type === 'csp-violation' && r.body)
      .map((r) => r.body!) as CspReport[];
  } else if (typeof raw === 'object' && raw !== null) {
    // legacy `report-uri` format
    const r = (raw as { 'csp-report'?: CspReport })['csp-report'];
    if (r) reports = [r];
  }

  for (const r of reports) {
    // Truncate long fields so a malicious report cannot inflate logs.
    const safe = {
      doc:       (r['document-uri']        ?? '').slice(0, 500),
      violated:  (r['violated-directive']  ?? '').slice(0, 200),
      effective: (r['effective-directive'] ?? '').slice(0, 200),
      blocked:   (r['blocked-uri']         ?? '').slice(0, 500),
      sourceFile:(r['source-file']         ?? '').slice(0, 500),
      line:      typeof r['line-number'] === 'number' ? r['line-number'] : null,
      sample:    (r['script-sample']       ?? '').slice(0, 200),
      disp:      r.disposition,
    };
    console.warn('[csp-report]', JSON.stringify(safe));

    // Mirror the same report into Sentry so violations are searchable
    // alongside our regular error stream.
    captureToSentry(safe);
  }

  return new NextResponse(null, { status: 204 });
}

/**
 * Bucket the directive into a short, stable tag so the Sentry "Issues"
 * view groups violations by their actionable type rather than fanning
 * out one issue per `document-uri`.
 */
function classifyDirective(violated: string, effective: string): string {
  const d = effective || violated;
  // The directive value usually looks like "script-src 'self' ..." — we
  // just want the first token.
  const head = d.split(/\s+/)[0]?.toLowerCase() ?? 'unknown';
  return head || 'unknown';
}

/**
 * Heuristic for "this looks like a real attack, not a misconfigured
 * allowlist". Inline-script violations with a non-empty
 * `script-sample`, or blocked-uri pointing at a script with the word
 * `eval` / `javascript:` / `data:` lift the severity.
 */
function looksSuspicious(safe: { blocked: string; sample: string; violated: string }): boolean {
  const u = safe.blocked.toLowerCase();
  if (u.startsWith('javascript:') || u.startsWith('data:text/html')) return true;
  if (u === 'inline' && /eval|new Function|atob/i.test(safe.sample)) return true;
  if (/script-src/i.test(safe.violated) && safe.sample.length > 0) return true;
  return false;
}

function captureToSentry(safe: {
  doc: string; violated: string; effective: string;
  blocked: string; sourceFile: string; line: number | null;
  sample: string; disp?: string | undefined;
}) {
  const directive = classifyDirective(safe.violated, safe.effective);
  const suspicious = looksSuspicious(safe);
  // The blocked-uri host is a stable grouping signal — different
  // sub-paths on the same origin all collapse into one issue.
  let blockedHost = '';
  try { blockedHost = new URL(safe.blocked).host; }
  catch { blockedHost = safe.blocked.slice(0, 64); }

  const message = `CSP ${safe.disp ?? 'violation'}: ${directive} blocked ${blockedHost || safe.blocked.slice(0, 64) || 'inline'}`;

  Sentry.captureMessage(message, {
    level: suspicious ? 'error' : 'warning',
    tags: {
      'csp.directive': directive,
      'csp.disposition': safe.disp ?? 'unknown',
      'csp.suspicious': suspicious ? 'yes' : 'no',
      'csp.blocked-host': blockedHost,
    },
    extra: {
      documentUri: safe.doc,
      violatedDirective: safe.violated,
      effectiveDirective: safe.effective,
      blockedUri: safe.blocked,
      sourceFile: safe.sourceFile,
      lineNumber: safe.line,
      scriptSample: safe.sample,
    },
    // Stable fingerprint so identical violations from different users
    // land in one Sentry issue instead of fanning out per-session.
    fingerprint: ['csp', directive, blockedHost],
  });
}

// Browsers may probe with OPTIONS; keep the surface tight.
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: { Allow: 'POST, OPTIONS' },
  });
}
