/**
 * Tests for `createDepartureGate` (lib/test-guard-departure.ts).
 *
 * Bug: TestGuard.tsx listens for both `visibilitychange` (hidden) and
 * window `blur` to detect a proctored-test tab-switch. A single Ctrl+Tab /
 * Alt+Tab fires BOTH events, and each independently called onViolation(),
 * so one real departure was counted as two violations — reaching
 * MAX_VIOLATIONS (3) and force-submitting the test with a 48h retake
 * lockout after only two real tab-switches.
 */
import { describe, it, expect } from 'vitest';
import { createDepartureGate } from '@/lib/test-guard-departure';

describe('createDepartureGate', () => {
  it('counts a single departure exactly once even if both events fire', () => {
    const gate = createDepartureGate();
    // Simulates visibilitychange(hidden) then blur firing for the SAME
    // physical tab-switch, back to back.
    expect(gate.depart()).toBe(true);  // visibilitychange fires first — counts
    expect(gate.depart()).toBe(false); // blur fires moments later — swallowed
  });

  it('counts a second departure after the user actually returns', () => {
    const gate = createDepartureGate();
    expect(gate.depart()).toBe(true);
    expect(gate.depart()).toBe(false);
    gate.returned(); // user comes back (focus / visibilitychange visible)
    expect(gate.depart()).toBe(true); // next real departure counts again
  });

  it('reproduces the original bug scenario: 2 real tab-switches should yield 2 violations, not 4', () => {
    const gate = createDepartureGate();
    let violations = 0;
    const onViolation = () => { violations++; };

    // Tab-switch #1: visibilitychange(hidden) + blur fire together.
    if (gate.depart()) onViolation();
    if (gate.depart()) onViolation();
    gate.returned();

    // Tab-switch #2: same pair fires again.
    if (gate.depart()) onViolation();
    if (gate.depart()) onViolation();
    gate.returned();

    expect(violations).toBe(2);
  });

  it('redundant returned() calls are a no-op', () => {
    const gate = createDepartureGate();
    gate.returned();
    gate.returned();
    expect(gate.depart()).toBe(true);
  });
});
