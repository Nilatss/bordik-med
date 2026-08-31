import { getCooldownRemaining, type ModuleTestAttempt } from './quiz';

/**
 * computeModuleTestGate — cooldown/lockout gate for the module final test
 * row in TestPanel.
 *
 * Bug: the 5 per-level course-test rows compute
 * `Math.max(getCooldownRemaining(attempts), lockoutCooldown)` to gate
 * retries, but the module-final-test row only checked the violation-based
 * 48h lockout — it never called `getCooldownRemaining()` on
 * `moduleTestAttempts`. A user who failed the 100-question module exam
 * normally, or aborted it, could immediately retry with zero cooldown,
 * bypassing the anti-gaming/anti-fatigue cooldown every other test in the
 * app enforces.
 *
 * Pure function (no store/i18n imports) so it stays trivially testable,
 * and is imported by BOTH TestPanel.tsx and its test.
 */
export type ModuleTestStatus = 'passed' | 'violation' | 'cooldown' | 'available' | 'locked';

export interface ModuleTestGate {
  status: ModuleTestStatus;
  /** ms remaining before a retry is allowed; 0 once available. */
  cooldownMs: number;
  /** true iff the user can start a fresh module-test attempt right now. */
  current: boolean;
}

export function computeModuleTestGate(params: {
  attempts: ModuleTestAttempt[];
  /** ms epoch of the violation lockout, or 0 if none set. */
  lockoutUntil: number;
  modulePassed: boolean;
  moduleUnlocked: boolean;
  now?: number;
}): ModuleTestGate {
  const { attempts, lockoutUntil, modulePassed, moduleUnlocked } = params;
  const now = params.now ?? Date.now();

  const baseCooldown = !modulePassed ? getCooldownRemaining(attempts) : 0;
  const lockoutCooldown = !modulePassed && lockoutUntil > 0 ? lockoutUntil - now : 0;
  const cooldownMs = Math.max(baseCooldown, lockoutCooldown);
  const lockedByViolation = lockoutCooldown > 0;
  const current = !modulePassed && moduleUnlocked && cooldownMs <= 0;

  const status: ModuleTestStatus = modulePassed
    ? 'passed'
    : lockedByViolation
      ? 'violation'
      : cooldownMs > 0
        ? 'cooldown'
        : moduleUnlocked
          ? 'available'
          : 'locked';

  return { status, cooldownMs, current };
}
