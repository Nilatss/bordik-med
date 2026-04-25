'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, getHighestPassedLevel, isModuleTestUnlocked } from '@/lib/store';
import {
  type TestLevel, type TestQuestion,
  QUESTIONS_PER_TEST, PASS_THRESHOLD_TEST, MODULE_TEST_QUESTIONS,
  PASS_THRESHOLD_MODULE, MODULE_TEST_TIME_MS, MAX_TEST_LEVELS,
  TEST_LEVEL_NAMES, getCooldownRemaining, formatCooldown,
} from '@/lib/quiz';
import { getTestQuestions, getModuleTestQuestions } from '@/lib/questions';
import { getModuleForCourse } from '@/lib/curriculum';
import { Check } from '@/components/icons';
import TestActiveView from './TestActiveView';
import TestStartConsent from './TestStartConsent';

interface TestPanelProps {
  courseId: string;
}

type PendingTest = { type: 'course'; level: TestLevel } | { type: 'module'; moduleId: number } | null;
type ActiveTest = { type: 'course'; level: TestLevel } | { type: 'module'; moduleId: number } | null;

const LOCKOUT_MS = 48 * 60 * 60 * 1000; // 48 hours

function lockoutKey(type: 'course' | 'module', a: string | number, b?: number): string {
  return type === 'course' ? `bordik:test-lockout:course:${a}:${b}` : `bordik:test-lockout:module:${a}`;
}

function getLockout(key: string): number {
  if (typeof window === 'undefined') return 0;
  const raw = window.localStorage.getItem(key);
  if (!raw) return 0;
  const until = Number(raw);
  if (!Number.isFinite(until) || until <= Date.now()) {
    window.localStorage.removeItem(key);
    return 0;
  }
  return until;
}

function setLockout(key: string): number {
  const until = Date.now() + LOCKOUT_MS;
  if (typeof window !== 'undefined') window.localStorage.setItem(key, String(until));
  return until;
}

function formatHours(ms: number): string {
  const hours = Math.ceil(ms / 3_600_000);
  return `${hours} ч`;
}

interface TestResult {
  score: number;
  total: number;
  passed: boolean;
  questions: TestQuestion[];
  answers: number[];
}

export default function TestPanel({ courseId }: TestPanelProps) {
  const store = useAppStore();
  const { testAttempts, courseTestProgress, moduleTestAttempts, completedModules, submitTest, submitModuleTest } = store;

  const mod = getModuleForCourse(courseId);
  const moduleId = mod?.id;
  const highestPassed = courseTestProgress[courseId] || 0;
  const moduleUnlocked = moduleId !== undefined ? isModuleTestUnlocked(store, moduleId) : false;
  const modulePassed = moduleId !== undefined ? completedModules.includes(moduleId) : false;

  const [pendingTest, setPendingTest] = useState<PendingTest>(null);
  const [activeTest, setActiveTest] = useState<ActiveTest>(null);
  const [result, setResult] = useState<TestResult | null>(null);

  // Cooldown timers (update every minute) + forces re-read of localStorage lockouts
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(interval);
  }, []);

  const startCourseTest = useCallback((level: TestLevel) => {
    // Lockout gate
    const until = getLockout(lockoutKey('course', courseId, level));
    if (until > 0) return;
    setResult(null);
    setPendingTest({ type: 'course', level });
  }, [courseId]);

  const startModuleTest = useCallback(() => {
    if (moduleId === undefined) return;
    const until = getLockout(lockoutKey('module', moduleId));
    if (until > 0) return;
    setResult(null);
    setPendingTest({ type: 'module', moduleId });
  }, [moduleId]);

  const confirmStart = useCallback(() => {
    if (!pendingTest) return;
    setActiveTest(pendingTest);
    setPendingTest(null);
  }, [pendingTest]);

  const declineStart = useCallback(() => {
    setPendingTest(null);
  }, []);

  const handleComplete = useCallback((answers: number[], violations: number) => {
    if (!activeTest) return;

    // Set 48h lockout if test ends with a violation penalty (>= MAX violations)
    if (violations >= 3) {
      const key = activeTest.type === 'course'
        ? lockoutKey('course', courseId, activeTest.level)
        : lockoutKey('module', activeTest.moduleId);
      setLockout(key);
    }

    if (activeTest.type === 'course') {
      const questions = getTestQuestions(courseId, activeTest.level);
      const res = submitTest(courseId, activeTest.level, answers, questions, violations);
      setResult({ ...res, questions, answers });
    } else {
      const questions = getModuleTestQuestions(activeTest.moduleId);
      const res = submitModuleTest(activeTest.moduleId, answers, questions, 0, violations);
      setResult({ ...res, questions, answers });
    }
    setActiveTest(null);
  }, [activeTest, courseId, submitTest, submitModuleTest]);

  const handleCancel = useCallback(() => {
    setActiveTest(null);
  }, []);

  // ═══ CONSENT SCREEN (before active test) ═══
  if (pendingTest) {
    const questions = pendingTest.type === 'course'
      ? getTestQuestions(courseId, pendingTest.level)
      : getModuleTestQuestions(pendingTest.moduleId);
    const timeLimit = pendingTest.type === 'module' ? MODULE_TEST_TIME_MS : 60 * 60 * 1000;
    const label = pendingTest.type === 'course'
      ? TEST_LEVEL_NAMES[pendingTest.level]
      : 'Финальный тест модуля';

    return (
      <TestStartConsent
        testLabel={label}
        questionCount={questions.length}
        timeMinutes={Math.round(timeLimit / 60_000)}
        onAccept={confirmStart}
        onDecline={declineStart}
      />
    );
  }

  // ═══ ACTIVE TEST VIEW ═══
  if (activeTest) {
    const questions = activeTest.type === 'course'
      ? getTestQuestions(courseId, activeTest.level)
      : getModuleTestQuestions(activeTest.moduleId);
    const timeLimit = activeTest.type === 'module' ? MODULE_TEST_TIME_MS : undefined;
    const label = activeTest.type === 'course'
      ? TEST_LEVEL_NAMES[activeTest.level]
      : 'Финальный тест модуля';

    return (
      <TestActiveView
        questions={questions}
        timeLimit={timeLimit}
        onComplete={handleComplete}
        onCancel={handleCancel}
        testLabel={label}
      />
    );
  }

  // ═══ RESULT VIEW ═══
  if (result) {
    return (
      <div style={{
        background: '#FFFFFF',
        borderRadius: 'var(--md-sys-shape-corner-extra-large)',
        padding: 'var(--space-6)',
      }}>
        {/* Score */}
        <div style={{
          textAlign: 'center', marginBottom: 'var(--space-6)',
          padding: 'var(--space-5)',
          borderRadius: 'var(--md-sys-shape-corner-large)',
          background: result.passed ? 'var(--md-sys-color-primary-container)' : 'var(--md-sys-color-error-container)',
        }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700,
            color: result.passed ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-error)',
            marginBottom: 'var(--space-1)',
          }}>
            {result.score} / {result.total}
          </div>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 500,
            color: result.passed ? 'var(--md-sys-color-on-primary-container)' : 'var(--md-sys-color-on-error-container)',
          }}>
            {result.passed ? 'Тест пройден!' : 'Не пройден. Попробуйте через 24 часа.'}
          </p>
        </div>

        {/* Per-question breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-5)', maxHeight: 400, overflowY: 'auto' }}>
          {result.questions.map((q, i) => {
            const userAnswer = result.answers[i];
            const isCorrect = userAnswer === q.correctIndex;
            return (
              <div key={q.id} style={{
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--md-sys-shape-corner-medium)',
                background: isCorrect
                  ? 'color-mix(in srgb, var(--md-sys-color-primary) 6%, transparent)'
                  : 'color-mix(in srgb, var(--md-sys-color-error) 6%, transparent)',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
                    color: isCorrect ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-error)',
                    fontWeight: 600, flexShrink: 0,
                  }}>
                    {isCorrect ? '✓' : '✗'}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)',
                    color: 'var(--md-sys-color-on-surface)', lineHeight: 1.4,
                  }}>
                    {q.question}
                  </span>
                </div>
                {!isCorrect && userAnswer >= 0 && (
                  <div style={{ marginLeft: 'var(--space-4)', marginTop: 2, fontFamily: 'var(--font-body)', fontSize: '0.625rem', lineHeight: 1.4 }}>
                    <span style={{ color: 'var(--md-sys-color-error)' }}>Ваш: {q.options[userAnswer]}</span>
                    {' · '}
                    <span style={{ color: 'var(--md-sys-color-primary)', fontWeight: 500 }}>Верный: {q.options[q.correctIndex]}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button onClick={() => setResult(null)} style={{
          display: 'block', margin: '0 auto',
          padding: '0 var(--space-6)', height: 40,
          borderRadius: 'var(--md-sys-shape-corner-full)',
          background: 'var(--md-sys-color-primary)',
          color: 'var(--md-sys-color-on-primary)',
          border: 'none', cursor: 'pointer',
          fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontWeight: 600,
        }}>
          Закрыть
        </button>
      </div>
    );
  }

  // ═══ TEST CARDS (IDLE) ═══
  const levels: TestLevel[] = [1, 2, 3, 4, 5];
  const passedCount = Math.min(highestPassed, MAX_TEST_LEVELS);
  const totalProgress = Math.round((passedCount / MAX_TEST_LEVELS) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Header panel */}
      <div style={{
        padding: '20px 24px',
        background: '#F5F6F8',
        borderRadius: 16,
        color: '#1A1A1A',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <p style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
              color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
              marginBottom: 4,
            }}>
              Тестирование курса
            </p>
            <h3 style={{
              fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700,
              color: '#1A1A1A', margin: 0, letterSpacing: '-0.01em',
            }}>
              Прогресс обучения
            </h3>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{
              fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700,
              color: '#1A1A1A', lineHeight: 1,
            }}>
              {passedCount}<span style={{ color: '#C4C7CD', fontSize: 18 }}>/{MAX_TEST_LEVELS}</span>
            </p>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 11, color: '#888', marginTop: 2,
            }}>
              {totalProgress}% завершено
            </p>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{
          height: 6, background: '#E2E4EA', borderRadius: 999,
        }}>
          <div style={{
            height: '100%',
            width: `${totalProgress}%`,
            background: 'linear-gradient(90deg, #10B981 0%, #34D399 100%)',
            borderRadius: 999,
            transition: 'width 400ms ease',
          }} />
        </div>
      </div>

      {/* 5 course test rows */}
      {levels.map((level, idx) => {
        const key = `${courseId}-${level}`;
        const attempts = testAttempts[key] || [];
        const isPassed = highestPassed >= level;
        const isUnlocked = level === 1 || highestPassed >= level - 1;
        const baseCooldown = !isPassed ? getCooldownRemaining(attempts) : 0;
        const lockoutUntil = !isPassed ? getLockout(lockoutKey('course', courseId, level)) : 0;
        const lockoutCooldown = lockoutUntil > 0 ? lockoutUntil - Date.now() : 0;
        const cooldown = Math.max(baseCooldown, lockoutCooldown);
        const isLockedByViolation = lockoutCooldown > 0;
        const bestScore = attempts.length > 0 ? Math.max(...attempts.map((a) => a.score)) : null;
        const isCurrent = !isPassed && isUnlocked && cooldown <= 0;

        // Map state → status (Active / Trial / Cancelled / Past Due / Paused)
        const status: TestStatus = isPassed
          ? 'passed'
          : isLockedByViolation
            ? 'violation'
            : cooldown > 0
              ? 'cooldown'
              : isCurrent
                ? 'available'
                : 'locked';

        const statusDetail = isLockedByViolation
          ? `Доступно через ${formatHours(cooldown)}`
          : cooldown > 0
            ? `Доступно через ${formatCooldown(cooldown)}`
            : !isUnlocked
              ? 'Пройдите предыдущий уровень'
              : isCurrent
                ? `${QUESTIONS_PER_TEST} вопросов · порог ${PASS_THRESHOLD_TEST}/${QUESTIONS_PER_TEST}`
                : null;

        return (
          <TestRow
            key={level}
            index={idx}
            title={TEST_LEVEL_NAMES[level]}
            kind="Уровень"
            status={status}
            rightInfo={isPassed && bestScore !== null
              ? `${bestScore}/${QUESTIONS_PER_TEST}`
              : `${QUESTIONS_PER_TEST} вопр.`}
            detailRows={[
              { label: 'Вопросов', value: String(QUESTIONS_PER_TEST) },
              { label: 'Порог', value: `${PASS_THRESHOLD_TEST}/${QUESTIONS_PER_TEST}` },
              { label: bestScore !== null ? 'Лучший' : 'Попыток', value: bestScore !== null ? `${bestScore}/${QUESTIONS_PER_TEST}` : String(attempts.length) },
              { label: 'Статус', value: STATUS_META[status].label },
            ]}
            description={statusDetail ?? undefined}
            actionLabel={isPassed ? 'Повторить' : isCurrent ? 'Начать тест' : null}
            actionVariant={isPassed ? 'secondary' : 'primary'}
            onAction={() => startCourseTest(level)}
            disabled={!isCurrent && !isPassed}
          />
        );
      })}

      {/* Module final test row */}
      {moduleId !== undefined && (() => {
        const moduleLockoutUntil = getLockout(lockoutKey('module', moduleId));
        const moduleLockedByViolation = moduleLockoutUntil > Date.now();
        const moduleLockoutLeft = moduleLockoutUntil - Date.now();

        const moduleStatus: TestStatus = modulePassed
          ? 'passed'
          : moduleLockedByViolation
            ? 'violation'
            : moduleUnlocked
              ? 'available'
              : 'locked';

        const moduleDetail = moduleLockedByViolation
          ? `Доступно через ${formatHours(moduleLockoutLeft)}`
          : modulePassed
            ? 'Модуль полностью пройден'
            : moduleUnlocked
              ? `${MODULE_TEST_QUESTIONS} вопросов · 3 часа · ${PASS_THRESHOLD_MODULE}% порог`
              : 'Откроется после прохождения всех 5 тестов по каждому курсу модуля';

        return (
          <TestRow
            index={5}
            title="Финальный тест модуля"
            kind="Модуль"
            status={moduleStatus}
            rightInfo={`${MODULE_TEST_QUESTIONS} вопр.`}
            detailRows={[
              { label: 'Вопросов', value: String(MODULE_TEST_QUESTIONS) },
              { label: 'Время', value: '3 часа' },
              { label: 'Порог', value: `${PASS_THRESHOLD_MODULE}%` },
              { label: 'Статус', value: STATUS_META[moduleStatus].label },
            ]}
            description={moduleDetail}
            actionLabel={moduleUnlocked && !modulePassed && !moduleLockedByViolation ? 'Начать тест' : null}
            actionVariant="primary"
            onAction={startModuleTest}
            disabled={!moduleUnlocked || modulePassed || moduleLockedByViolation}
            highlight
          />
        );
      })()}

      </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Expandable test row (subscription-card style).
   Each test → one row; click to expand full detail panel + action.
   ════════════════════════════════════════════════════════════════ */

type TestStatus = 'passed' | 'available' | 'locked' | 'cooldown' | 'violation';

const STATUS_META: Record<TestStatus, {
  label: string;
  bg: string;
  fg: string;
  iconColor: string;
  rowAccent: string; // subtle row tint
  icon: 'check' | 'play' | 'lock' | 'clock' | 'alert';
}> = {
  passed:    { label: 'Пройден',     bg: '#DCFCE7', fg: '#166534', iconColor: '#16A34A', rowAccent: '#F0FDF4', icon: 'check' },
  available: { label: 'Доступен',    bg: '#DBEAFE', fg: '#1E40AF', iconColor: '#2563EB', rowAccent: '#F5F8FF', icon: 'play' },
  locked:    { label: 'Закрыто',     bg: '#F3F4F6', fg: '#6B7280', iconColor: '#9CA3AF', rowAccent: '#F8F9FB', icon: 'lock' },
  cooldown:  { label: 'Перезарядка', bg: '#FEF3C7', fg: '#92400E', iconColor: '#D97706', rowAccent: '#FFFBEB', icon: 'clock' },
  violation: { label: 'Нарушение',   bg: '#FEE2E2', fg: '#991B1B', iconColor: '#DC2626', rowAccent: '#FEF2F2', icon: 'alert' },
};

function StatusIcon({ name, color, size = 11 }: { name: TestStatus; color: string; size?: number }) {
  const meta = STATUS_META[name];
  const sw = 2.4;
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none' as const, stroke: color, strokeWidth: sw, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (meta.icon) {
    case 'check': return <svg {...common}><polyline points="20 6 9 17 4 12" /></svg>;
    case 'play': return <svg {...common} fill={color} stroke="none"><polygon points="6 4 20 12 6 20 6 4" /></svg>;
    case 'lock': return <svg {...common}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>;
    case 'clock': return <svg {...common}><circle cx={12} cy={12} r={10} /><polyline points="12 6 12 12 16 14" /></svg>;
    case 'alert': return <svg {...common}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1={12} y1={9} x2={12} y2={13} /><line x1={12} y1={17} x2={12.01} y2={17} /></svg>;
  }
}

function StatusBadge({ status }: { status: TestStatus }) {
  const m = STATUS_META[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px',
      borderRadius: 999,
      background: m.bg, color: m.fg,
      fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600,
      flexShrink: 0,
    }}>
      <StatusIcon name={status} color={m.iconColor} />
      {m.label}
    </span>
  );
}

interface TestRowProps {
  index: number;
  title: string;
  kind: string;
  status: TestStatus;
  rightInfo: string;
  detailRows: { label: string; value: string }[];
  description?: string;
  actionLabel: string | null;
  actionVariant: 'primary' | 'secondary';
  onAction?: () => void;
  disabled?: boolean;
  highlight?: boolean; // module test gets a slight emphasis
}

function TestRow({
  index, title, kind, status, rightInfo, detailRows,
  description, actionLabel, actionVariant, onAction, disabled, highlight,
}: TestRowProps) {
  const [open, setOpen] = useState(false);
  const meta = STATUS_META[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: [0.05, 0.7, 0.1, 1] }}
      style={{
        background: open ? '#FFFFFF' : meta.rowAccent,
        border: open
          ? '1px solid #E5E7EB'
          : highlight ? '1px solid #E2E4EA' : '1px solid transparent',
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: open ? '0 1px 2px rgba(16,24,40,0.04), 0 4px 16px rgba(16,24,40,0.04)' : 'none',
        transition: 'background 200ms ease, border-color 200ms ease, box-shadow 200ms ease',
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 18px',
          background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
      >
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
          color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em',
          flexShrink: 0,
        }}>
          {kind}
        </span>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: 14.5, fontWeight: 600,
          color: '#1A1A1A', flexShrink: 0,
        }}>
          {title}
        </span>
        <StatusBadge status={status} />
        <span style={{ flex: 1 }} />
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
          color: '#1A1A1A', flexShrink: 0,
        }}>
          {rightInfo}
        </span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 24, height: 24, borderRadius: 6,
          background: '#F5F6F8', color: '#6B7280', flexShrink: 0,
          transition: 'transform 250ms cubic-bezier(0.2,0,0,1)',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.05, 0.7, 0.1, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: 16,
              padding: '12px 18px 14px',
              borderTop: '1px solid #F0F1F5',
            }}>
              {detailRows.map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                    color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>
                    {label}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                    color: '#1A1A1A',
                  }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
            {description && (
              <div style={{
                padding: '0 18px 14px',
                fontFamily: 'var(--font-body)', fontSize: 13, color: '#4B5563',
                lineHeight: 1.55,
              }}>
                {description}
              </div>
            )}
            {actionLabel && (
              <div style={{
                padding: '0 18px 16px',
                display: 'flex', justifyContent: 'flex-end',
              }}>
                <button
                  onClick={(e) => { e.stopPropagation(); if (!disabled && onAction) onAction(); }}
                  disabled={disabled}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '10px 18px',
                    fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600,
                    color: actionVariant === 'primary' ? '#FFFFFF' : '#1F2937',
                    background: actionVariant === 'primary' ? '#3B82F6' : '#F5F6F8',
                    border: actionVariant === 'secondary' ? '1px solid #E5E7EB' : 'none',
                    borderRadius: 999,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.5 : 1,
                    transition: 'background 180ms ease',
                  }}
                  onMouseEnter={(e) => {
                    if (disabled) return;
                    e.currentTarget.style.background = actionVariant === 'primary' ? '#2563EB' : '#EEF1F4';
                  }}
                  onMouseLeave={(e) => {
                    if (disabled) return;
                    e.currentTarget.style.background = actionVariant === 'primary' ? '#3B82F6' : '#F5F6F8';
                  }}
                >
                  {actionLabel}
                  {actionVariant === 'primary' && (
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                      <line x1={5} y1={12} x2={19} y2={12} />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
