/**
 * Unit tests for computeModuleTestGate — the module-final-test cooldown
 * gate in TestPanel.
 *
 * Bug: the module-final-test row (the 100-question, 3-hour "boss fight")
 * only checked the violation-based 48h lockout. It never called
 * `getCooldownRemaining()` on the attempt history the way the 5
 * per-level course-test rows do, so a user who failed the exam normally
 * — or aborted it — could retry immediately with zero cooldown, bypassing
 * the app's 24h-failed / 12h-aborted anti-gaming cooldown.
 *
 * This test imports the REAL gate function TestPanel.tsx uses — no local
 * re-implementation — so it actually guards the shipped behaviour.
 */
import { describe, it, expect } from 'vitest';
import { computeModuleTestGate } from '@/lib/module-test-gate';
import { COOLDOWN_MS, ABORT_COOLDOWN_MS, type ModuleTestAttempt } from '@/lib/quiz';

// getCooldownRemaining() (used internally by computeModuleTestGate) reads
// the real Date.now() rather than an injectable clock, so NOW must track
// the real clock too — captured once so all assertions in this file are
// consistent with each other (drift while the test runs is sub-ms).
const NOW = Date.now();

function attempt(overrides: Partial<ModuleTestAttempt>): ModuleTestAttempt {
  return {
    moduleId: 1,
    answers: [],
    score: 50,
    total: 100,
    passed: false,
    timestamp: NOW,
    timeUsedMs: 0,
    violations: 0,
    ...overrides,
  };
}

describe('computeModuleTestGate', () => {
  it('is locked when the module is not yet unlocked', () => {
    const gate = computeModuleTestGate({
      attempts: [],
      lockoutUntil: 0,
      modulePassed: false,
      moduleUnlocked: false,
      now: NOW,
    });
    expect(gate.status).toBe('locked');
    expect(gate.current).toBe(false);
  });

  it('is available with no attempts and the module unlocked', () => {
    const gate = computeModuleTestGate({
      attempts: [],
      lockoutUntil: 0,
      modulePassed: false,
      moduleUnlocked: true,
      now: NOW,
    });
    expect(gate.status).toBe('available');
    expect(gate.current).toBe(true);
  });

  it('the actual bug: a failed attempt 1 minute ago must NOT be immediately retryable', () => {
    const gate = computeModuleTestGate({
      attempts: [attempt({ passed: false, timestamp: NOW - 60_000 })],
      lockoutUntil: 0,
      modulePassed: false,
      moduleUnlocked: true,
      now: NOW,
    });
    expect(gate.status).toBe('cooldown');
    expect(gate.current).toBe(false);
    expect(gate.cooldownMs).toBeGreaterThan(0);
    expect(gate.cooldownMs).toBeCloseTo(COOLDOWN_MS - 60_000, -2);
  });

  it('an aborted attempt uses the shorter 12h cooldown, not the 24h failed cooldown', () => {
    const gate = computeModuleTestGate({
      attempts: [attempt({ passed: false, aborted: true, timestamp: NOW - 60_000 })],
      lockoutUntil: 0,
      modulePassed: false,
      moduleUnlocked: true,
      now: NOW,
    });
    expect(gate.status).toBe('cooldown');
    expect(gate.cooldownMs).toBeCloseTo(ABORT_COOLDOWN_MS - 60_000, -2);
  });

  it('becomes available again once the cooldown window has fully elapsed', () => {
    const gate = computeModuleTestGate({
      attempts: [attempt({ passed: false, timestamp: NOW - COOLDOWN_MS - 1 })],
      lockoutUntil: 0,
      modulePassed: false,
      moduleUnlocked: true,
      now: NOW,
    });
    expect(gate.status).toBe('available');
    expect(gate.current).toBe(true);
    expect(gate.cooldownMs).toBe(0);
  });

  it('a violation lockout takes priority over status even after the base cooldown elapses', () => {
    const gate = computeModuleTestGate({
      attempts: [attempt({ passed: false, timestamp: NOW - COOLDOWN_MS - 1 })],
      lockoutUntil: NOW + 40 * 60 * 60 * 1000, // 40h violation lockout still active
      modulePassed: false,
      moduleUnlocked: true,
      now: NOW,
    });
    expect(gate.status).toBe('violation');
    expect(gate.current).toBe(false);
  });

  it('a passed module is always "passed" and never gated by history', () => {
    const gate = computeModuleTestGate({
      attempts: [attempt({ passed: false, timestamp: NOW - 1 })], // failed just now
      lockoutUntil: NOW + 1000,
      modulePassed: true, // but a later attempt passed
      moduleUnlocked: true,
      now: NOW,
    });
    expect(gate.status).toBe('passed');
    expect(gate.current).toBe(false);
  });
});
