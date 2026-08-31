/**
 * Unit tests for createViolationCoalescer — the de-dupe guard used by
 * TestGuard to stop a single tab switch from being counted as 2
 * violations (both `visibilitychange` and window `blur` fire for the
 * same action in every mainstream browser).
 *
 * This test imports the REAL factory TestGuard.tsx uses — no local
 * re-implementation — so it actually guards the shipped behaviour.
 */
import { describe, it, expect } from 'vitest';
import { createViolationCoalescer } from '@/lib/violation-coalesce';

describe('createViolationCoalescer', () => {
  it('lets the first call through', () => {
    const shouldFire = createViolationCoalescer(100, () => 0);
    expect(shouldFire()).toBe(true);
  });

  it('blocks a second call within the coalesce window (the actual bug: blur + visibilitychange firing together)', () => {
    let t = 0;
    const shouldFire = createViolationCoalescer(100, () => t);
    expect(shouldFire()).toBe(true); // visibilitychange fires
    t = 5;
    expect(shouldFire()).toBe(false); // blur fires 5ms later — same tab switch, must not count again
  });

  it('lets a later, genuinely separate tab switch through once the window elapses', () => {
    let t = 0;
    const shouldFire = createViolationCoalescer(100, () => t);
    expect(shouldFire()).toBe(true);
    t = 5;
    expect(shouldFire()).toBe(false); // coalesced
    t = 250; // well past the 100ms window — a real second switch
    expect(shouldFire()).toBe(true);
  });

  it('each coalescer instance tracks its own state independently', () => {
    const t = 0;
    const a = createViolationCoalescer(100, () => t);
    const b = createViolationCoalescer(100, () => t);
    expect(a()).toBe(true);
    expect(b()).toBe(true); // independent instance, not affected by `a`
  });
});
