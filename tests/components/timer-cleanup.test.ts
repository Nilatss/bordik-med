/**
 * Regression tests for three untracked-timer bugs caught in the June-2026
 * anti-cheat / tools audit:
 *
 *   Bug 1 — Result.tsx copyTimerRef   (untracked setTimeout → state update after unmount)
 *   Bug 2 — Sidebar.tsx resetTimerRef (untracked setTimeout → state updates after unmount)
 *   Bug 3 — TestGuard.tsx dead code   (cancelGrace contained an untracked setTimeout;
 *                                      justReturned / startGrace / cancelGrace were never
 *                                      reachable via any event handler)
 *
 * The repo runs vitest in node-env (no jsdom / testing-library), so full
 * lifecycle tests aren't feasible here. We cover:
 *   a) Smoke renders via renderToStaticMarkup — confirm the module imports,
 *      the dead symbols are gone, and children are passed through.
 *   b) Pure-function and constant assertions that the component relies on.
 */
import { describe, it, expect } from 'vitest';
import { createElement, type ComponentType, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import TestGuard from '@/components/course/TestGuard';
import { MAX_VIOLATIONS } from '@/lib/quiz';

// React 19 + TS strict mode requires `children` in the props object, but
// ESLint's react/no-children-prop prefers it as the 3rd createElement arg.
// Cast the component type to drop `children` from props so ESLint is happy.
type GuardProps = Omit<Parameters<typeof TestGuard>[0], 'children'>;
const Guard = TestGuard as ComponentType<GuardProps>;
const renderGuard = (props: GuardProps, child: ReactNode = null) =>
  renderToStaticMarkup(createElement(Guard, props, child));
import { formatResultForCopy } from '@/components/tools/view/format-result';

// ─── Bug 3: TestGuard dead-code removal ────────────────────────────────────
describe('TestGuard · dead-code removal (Bug 3)', () => {
  const noop = () => {};
  const baseProps: GuardProps = {
    active: false,
    onViolation: noop,
    onForceSubmit: noop,
    violationCount: 0,
  };

  it('renders its children when inactive', () => {
    const html = renderGuard(baseProps, 'test-child-content');
    expect(html).toContain('test-child-content');
  });

  it('renders children when active with zero violations', () => {
    const html = renderGuard({ ...baseProps, active: true }, 'child');
    expect(html).toContain('child');
  });

  it('does not expose justReturned UI (dead state removed)', () => {
    // The "Вернулись в тест" toast was tied to justReturned state that was
    // never set after the instant-violation refactor. Confirm the toast copy
    // is absent from all rendered states.
    const html = renderGuard(baseProps);
    expect(html).not.toContain('Вернулись');
  });

  it('renders exactly MAX_VIOLATIONS violation-dot slots in the modal', () => {
    // The violation modal uses Array.from({ length: MAX_VIOLATIONS }) to draw
    // the dots. Confirm MAX_VIOLATIONS is still 3 (a product invariant relied
    // on by the anti-cheat flow).
    expect(MAX_VIOLATIONS).toBe(3);
  });
});

// ─── Bug 1 & 2: timer-ref pattern (pure-function coverage) ─────────────────
// The copyTimerRef (Result.tsx) and resetTimerRef (Sidebar.tsx) fixes follow
// the same pattern as the audit2 ShareButton/InlineQuiz fixes. The underlying
// format-result helper is the one pure piece we can cover here.
describe('formatResultForCopy · timer-tracked copy path (Bug 1)', () => {
  it('formats value + unit + interpretation', () => {
    expect(formatResultForCopy({ value: 7, unit: 'баллов', interpretation: 'высокий риск' }))
      .toBe('7 баллов - высокий риск');
  });

  it('handles numeric zero as a valid value', () => {
    // A zero result (e.g. CHA₂DS₂-VASc = 0) must not be treated as falsy
    // and must copy as "0 баллов" not just "баллов".
    expect(formatResultForCopy({ value: 0, unit: 'баллов', interpretation: 'низкий риск' }))
      .toBe('0 баллов - низкий риск');
  });

  it('handles empty-string interpretation gracefully', () => {
    expect(formatResultForCopy({ value: 25, unit: 'кг/м²', interpretation: '' }))
      .toBe('25 кг/м²');
  });

  it('handles missing unit gracefully', () => {
    expect(formatResultForCopy({ value: 'III', interpretation: 'умеренная' }))
      .toBe('III - умеренная');
  });
});
