/**
 * CSP violation report sink (P1-SEC-1, prep for Report-Only → Enforce).
 *
 * Browsers POST a JSON body in one of two formats:
 *   - legacy `application/csp-report` { "csp-report": { … } }
 *   - new    `application/reports+json`   [ { "type": "csp-violation", "body": { … } } ]
 *
 * We accept both, sanitize, and log to console (Vercel Logs / Sentry
 * pipeline picks them up). Never reflect untrusted data back to the
 * caller — return 204 unconditionally.
 *
 * Also rate-limit by IP-hash so a misbehaving extension can't drown
 * our log stream.
 */
import { NextResponse } from 'next/server';
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
  }

  return new NextResponse(null, { status: 204 });
}

// Browsers may probe with OPTIONS; keep the surface tight.
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: { Allow: 'POST, OPTIONS' },
  });
}
