/**
 * Pure predicate functions for Sentry's beforeSend hook.
 *
 * Extracted so they can be unit-tested without mocking the Sentry SDK.
 * All functions return `true` when the event should be DROPPED.
 *
 * Issues fixed:
 *   JAVASCRIPT-NEXTJS-1F / NEXTJS-19 — MetaMask inpage.js extension errors
 *   JAVASCRIPT-NEXTJS-12             — Serwist SW registration "Rejected"
 */

interface SentryFrame {
  filename?: string | null | undefined;
}
interface SentryException {
  value?: string;
  stacktrace?: { frames?: SentryFrame[] };
}
export interface SentryEventLike {
  exception?: { values?: SentryException[] };
}

/** Collect all stack frames across all exception values in an event. */
function allFrames(event: SentryEventLike): SentryFrame[] {
  return event.exception?.values?.flatMap((v) => v.stacktrace?.frames ?? []) ?? [];
}

/**
 * Returns true if every stack frame in the event originates from a
 * browser-extension injected script (MetaMask's inpage.js).
 *
 * Sentry encodes the page origin as `app:///` and extension frames keep
 * the original path — `inpage.js` is MetaMask's universal content-script
 * filename. Any event where 100 % of frames come from that file is an
 * extension bug, not an app bug.
 *
 * Matches: `app:///inpage.js`, `app:///scripts/inpage.js`,
 *          `chrome-extension://<id>/inpage.js`, etc.
 */
export function isExtensionScriptError(event: SentryEventLike): boolean {
  const frames = allFrames(event);
  if (frames.length === 0) return false;
  return frames.every(
    (f) =>
      f.filename?.includes('inpage.js') ||
      f.filename?.startsWith('chrome-extension://') ||
      f.filename?.startsWith('moz-extension://'),
  );
}

/**
 * Returns true for the unhandled "Error: Rejected" that fires when
 * navigator.serviceWorker.register() is denied (incognito mode, CSP,
 * quota exhausted). The rejection propagates through @serwist/window
 * before our PwaRegistrar try/catch can catch it.
 *
 * We identify it by: single exception, message === "Rejected", and at
 * least one frame from @serwist/window.
 */
export function isSwRejectionError(event: SentryEventLike): boolean {
  const exceptions = event.exception?.values ?? [];
  if (exceptions.length !== 1) return false;
  if (exceptions[0]?.value !== 'Rejected') return false;
  const frames = allFrames(event);
  return frames.some(
    (f) =>
      f.filename?.includes('@serwist/window') ||
      f.filename?.includes('@serwist') ||
      f.filename?.includes('serwist/window'),
  );
}
