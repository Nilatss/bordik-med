/**
 * Regression test for how TestActiveView wires TestGuard's `active` prop
 * and mounts the question content.
 *
 * Bug 1: TestGuard was armed with `active={true}` unconditionally from
 * mount — before Proctoring's getUserMedia() permission prompt resolved
 * (tracked by the `proctorReady` state, already used to gate the
 * countdown timer and hide the test UI). TestGuard's window `blur`
 * handler fires an INSTANT violation with no grace period, and the
 * native camera/mic permission prompt is known to blur the browser
 * window in some browsers (observed in Firefox/Safari). So a user could
 * be charged a violation — and after two more, auto-submitted and
 * 48h-locked-out — before ever seeing a question.
 *
 * Bug 2 (found in review of the bug-1 fix): gating TestGuard's arming on
 * proctorReady means blur/keydown detection is off while waiting for
 * permission — but the question text and answer options were still
 * mounted in the DOM the whole time, merely hidden with
 * opacity-0/pointer-events-none. A user could stall the permission
 * prompt and read the (now-undetected) hidden content via devtools /
 * inspect-element. Fixed by not mounting that content at all until
 * proctorReady — nothing to inspect, independent of whether TestGuard
 * is armed.
 *
 * This project's test suite runs in a Node environment with no jsdom /
 * React Testing Library (see vitest.config.ts), so this can't be
 * exercised by rendering + dispatching real events. This instead
 * asserts against the real source for both fixes' exact shape.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

const SOURCE = readFileSync(
  resolve(process.cwd(), 'components/course/TestActiveView.tsx'),
  'utf-8',
);

describe('TestActiveView → TestGuard proctoring gate', () => {
  it('declares a proctorReady flag that starts false until permissions resolve', () => {
    expect(SOURCE).toMatch(/const \[proctorReady, setProctorReady\] = useState\(false\)/);
  });

  it('gates the countdown timer on proctorReady (established, unchanged behavior)', () => {
    expect(SOURCE).toMatch(/if \(!proctorReady\) return;/);
  });

  it('gates TestGuard.active on proctorReady, not a hardcoded literal', () => {
    const match = SOURCE.match(/<TestGuard[\s\S]*?active=\{([^}]+)\}/);
    expect(match, 'expected a <TestGuard active={...}> usage in TestActiveView.tsx').not.toBeNull();
    const activeExpr = match?.[1] ?? '';
    expect(activeExpr.trim()).toBe('proctorReady');
  });

  it('does not mount the question content (test-active overlay) until proctorReady', () => {
    // The fix wraps the whole overlay block in `{proctorReady && ( ... )}`
    // instead of always rendering it behind opacity-0/pointer-events-none.
    expect(SOURCE).toMatch(/\{proctorReady && \(\s*<div className="test-active /);
    // Guard against reintroducing the old always-mounted + CSS-hidden
    // pattern, which is exactly what let content leak via devtools.
    expect(SOURCE).not.toMatch(/opacity-0 pointer-events-none/);
  });
});
