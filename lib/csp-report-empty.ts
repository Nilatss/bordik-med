/**
 * isEmptyCspReport — guard for the CSP report sink (POST /api/csp-report).
 *
 * Bots and some browser extensions POST CSP reports with every actionable
 * field empty (only `disposition` set). Forwarding them to Sentry produces
 * a meaningless "unknown blocked inline" issue that floods the dashboard
 * (audit: 235 events / 232 users). The route drops a report when this
 * predicate returns true.
 *
 * Lives in its own tiny pure module (no Sentry / edge-runtime imports) so
 * it stays trivially unit-testable in node-env vitest, and is imported by
 * BOTH `app/api/csp-report/route.ts` and its test — no re-implementation.
 */
export function isEmptyCspReport(safe: {
  doc: string;
  violated: string;
  effective: string;
  blocked: string;
  sourceFile: string;
}): boolean {
  return !safe.doc && !safe.violated && !safe.effective && !safe.blocked && !safe.sourceFile;
}
