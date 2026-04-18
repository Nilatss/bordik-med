/* ═══════════════════════════════════════════
   IronMed Academy — Test System Types & Logic
   ═══════════════════════════════════════════ */

export type TestLevel = 1 | 2 | 3 | 4 | 5;

export interface TestQuestion {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
}

export interface TestAttempt {
  courseId: string;
  testLevel: TestLevel;
  answers: number[];
  score: number;
  total: number;
  passed: boolean;
  timestamp: number;
  violations: number;
}

export interface ModuleTestAttempt {
  moduleId: number;
  answers: number[];
  score: number;
  total: number;
  passed: boolean;
  timestamp: number;
  timeUsedMs: number;
  violations: number;
}

/* ═══ Constants ═══ */

export const QUESTIONS_PER_TEST = 20;
export const PASS_THRESHOLD_TEST = 18;          // 90% of 20
export const MODULE_TEST_QUESTIONS = 100;
export const PASS_THRESHOLD_MODULE = 90;         // 90% of 100
export const MODULE_TEST_TIME_MS = 3 * 60 * 60 * 1000; // 3 hours
export const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours
export const MAX_TEST_LEVELS = 5;
export const MAX_VIOLATIONS = 3;

export const TEST_LEVEL_NAMES: Record<TestLevel, string> = {
  1: 'Тест 1 — Основы',
  2: 'Тест 2 — Углублённый',
  3: 'Тест 3 — Применение',
  4: 'Тест 4 — Анализ',
  5: 'Тест 5 — Экспертный',
};

/* ═══ Grading ═══ */

export function gradeTest(
  questions: TestQuestion[],
  answers: number[]
): { score: number; total: number; passed: boolean } {
  let score = 0;
  for (let i = 0; i < questions.length; i++) {
    if (answers[i] === questions[i].correctIndex) score++;
  }
  const total = questions.length;
  return { score, total, passed: score >= PASS_THRESHOLD_TEST };
}

export function gradeModuleTest(
  questions: TestQuestion[],
  answers: number[]
): { score: number; total: number; passed: boolean } {
  let score = 0;
  for (let i = 0; i < questions.length; i++) {
    if (answers[i] === questions[i].correctIndex) score++;
  }
  const total = questions.length;
  return { score, total, passed: score >= PASS_THRESHOLD_MODULE };
}

/* ═══ Cooldown ═══ */

/** Returns ms remaining, or 0 if no cooldown. Only triggers on last-attempt FAILURE. */
export function getCooldownRemaining(attempts: TestAttempt[] | ModuleTestAttempt[]): number {
  if (attempts.length === 0) return 0;
  const last = attempts[attempts.length - 1];
  if (last.passed) return 0;
  const elapsed = Date.now() - last.timestamp;
  return Math.max(0, COOLDOWN_MS - elapsed);
}

/** Format cooldown ms to Russian string */
export function formatCooldown(ms: number): string {
  if (ms <= 0) return '';
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const mins = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  if (hours > 0) return `${hours} ч ${mins} мин`;
  return `${mins} мин`;
}

/** Format time remaining for module test timer */
export function formatTimer(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const h = Math.floor(ms / (60 * 60 * 1000));
  const m = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  const s = Math.floor((ms % (60 * 1000)) / 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
