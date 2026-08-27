/**
 * Regression test for how TestActiveView wires TestGuard's `active` prop.
 *
 * Bug: TestGuard was armed with `active={true}` unconditionally from
 * mount — before Proctoring's getUserMedia() permission prompt resolved
 * (tracked by the `proctorReady` state, already used to gate the
 * countdown timer and hide the test UI). TestGuard's window `blur`
 * handler fires an INSTANT violation with no grace period, and the
 * native camera/mic permission prompt is known to blur the browser
 * window in some browsers (observed in Firefox/Safari). So a user could
 * be charged a violation — and after two more, auto-submitted and
 * 48h-locked-out — before ever seeing a question.
 *
 * This project's test suite runs in a Node environment with no jsdom /
 * React Testing Library (see vitest.config.ts), so TestGuard's blur
 * handling can't be exercised by rendering + dispatching a real `blur`
 * event. This instead asserts against the real source that TestGuard's
 * `active` prop is bound to the same `proctorReady` flag that already
 * gates the timer and the test UI's visibility, rather than a hardcoded
 * literal — the exact shape of the regression.
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
});
