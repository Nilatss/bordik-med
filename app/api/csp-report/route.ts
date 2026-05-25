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
 *   3. Captured in Sentry with a structured severity ladder so the
 *      dashboard stays signal-rich as traffic grows:
 *        - `error`   real injection attempt (looksSuspicious)
 *        - `info`    known-benign noise — browser-extension / browser-
 *                    chrome injected scripts that no first-party CSP can
 *                    allow (looksKnownBenign); tagged `csp.known-benign`
 *        - `warning` a genuine violation worth triaging
 *      Tags: `csp.directive`, `csp.disposition`, `csp.blocked-host`,
 *      `csp.suspicious`, `csp.known-benign`. Filter by these in Sentry to
 *      triage which CSP directive needs widening (and to hide the
 *      extension noise behind `csp.known-benign:no`).
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
import { classifyDirective, severityFor, extractSafeFields, type RawCspReport } from '@/lib/csp-report-classify';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

// 60 reports / minute / source — enough for an honest browser, blocks
// pathological loops.
const reportLimiter = makeRateLimiter({ capacity: 60, refillPerSec: 1 });

// RawCspReport (both wire formats) + extractSafeFields live in
// lib/csp-report-classify.ts (pure + unit-tested).
type CspReport = RawCspReport;

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
    // Read either wire format (kebab from report-uri, camel from the
    // Reporting API) into a flat, length-capped shape.
    const safe = extractSafeFields(r);

    // Skip reports with no actionable data — bots and some browser
    // extensions POST empty report bodies that only set `disposition`.
    // Forwarding them to Sentry produces a meaningless "unknown blocked
    // inline" issue that floods the dashboard (232 users, 235 events).
    if (!safe.doc && !safe.violated && !safe.effective && !safe.blocked && !safe.sourceFile) {
      console.warn('[csp-report] skipping empty report (no actionable fields)');
      continue;
    }

    console.warn('[csp-report]', JSON.stringify(safe));

    // Mirror the same report into Sentry so violations are searchable
    // alongside our regular error stream.
    captureToSentry(safe);
  }

  return new NextResponse(null, { status: 204 });
}

// classifyDirective / looksSuspicious / severityFor live in
// lib/csp-report-classify.ts (pure + unit-tested).

function captureToSentry(safe: {
  doc: string; violated: string; effective: string;
  blocked: string; sourceFile: string; line: number | null;
  sample: string; disp?: string | undefined;
}) {
  const directive = classifyDirective(safe.violated, safe.effective);
  // Noise filter: a structured severity ladder. Real injection attempts
  // → `error`; known-benign browser-extension / browser-chrome injections
  // → `info` (kept in Sentry for completeness but demoted so the warning
  // stream stays signal-rich as real traffic grows); everything else →
  // `warning`. Tagged `csp.known-benign` so the dashboard can filter.
  const { level, suspicious, benign } = severityFor(safe);
  // The blocked-uri host is a stable grouping signal — different
  // sub-paths on the same origin all collapse into one issue.
  let blockedHost = '';
  try { blockedHost = new URL(safe.blocked).host; }
  catch { blockedHost = safe.blocked.slice(0, 64); }

  const message = `CSP ${safe.disp ?? 'violation'}: ${directive} blocked ${blockedHost || safe.blocked.slice(0, 64) || 'inline'}`;

  Sentry.captureMessage(message, {
    level,
    tags: {
      'csp.directive': directive,
      'csp.disposition': safe.disp ?? 'unknown',
      'csp.suspicious': suspicious ? 'yes' : 'no',
      'csp.known-benign': benign ? 'yes' : 'no',
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
    // land in one Sentry issue instead of fanning out per-session. All
    // known-benign noise collapses into a single per-directive issue
    // (extension ids vary per user, so we drop blockedHost for those).
    fingerprint: benign
      ? ['csp', 'known-benign', directive]
      : ['csp', directive, blockedHost],
  });
}

// Browsers may probe with OPTIONS; keep the surface tight.
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: { Allow: 'POST, OPTIONS' },
  });
}
