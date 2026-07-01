'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, getHighestPassedLevel, isModuleTestUnlocked, type AppState } from '@/lib/store';
import { useT } from '@/lib/i18n';
import CourseProgressBar from './CourseProgressBar';
import {
  type TestLevel, type TestQuestion,
  QUESTIONS_PER_TEST, PASS_THRESHOLD_TEST, MODULE_TEST_QUESTIONS,
  PASS_THRESHOLD_MODULE, MODULE_TEST_TIME_MS, MAX_TEST_LEVELS,
  TEST_LEVEL_NAMES, getCooldownRemaining, formatCooldown,
} from '@/lib/quiz';
import { getTestQuestions, getModuleTestQuestions, hasRealQuestions } from '@/lib/questions';
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
  // localStorage access can THROW (private mode, sandboxed iframe, blocked
  // storage). These helpers run during render, so an unguarded throw crashes
  // the whole test panel — swallow and treat as "no lockout".
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return 0;
    const until = Number(raw);
    if (!Number.isFinite(until) || until <= Date.now()) {
      window.localStorage.removeItem(key);
      return 0;
    }
    return until;
  } catch {
    return 0;
  }
}

function setLockout(key: string): number {
  const until = Date.now() + LOCKOUT_MS;
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(key, String(until));
  } catch {
    /* storage blocked — lockout just won't persist this session */
  }
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
  const t = useT();
  // Audit P-1: atomic selectors. Pre-fix `const store = useAppStore()`
  // subscribed TestPanel to every store mutation (useStudyTimer 1×/sec,
  // tool usage, etc.) — and TestPanel renders an active test attempt
  // with frozen state, so re-renders mid-test are wasted work.
  const testAttempts = useAppStore((s) => s.testAttempts);
  const courseTestProgress = useAppStore((s) => s.courseTestProgress);
  const moduleTestAttempts = useAppStore((s) => s.moduleTestAttempts);
  const completedModules = useAppStore((s) => s.completedModules);
  const submitTest = useAppStore((s) => s.submitTest);
  const submitModuleTest = useAppStore((s) => s.submitModuleTest);
  const abortTest = useAppStore((s) => s.abortTest);
  const abortModuleTest = useAppStore((s) => s.abortModuleTest);

  const mod = getModuleForCourse(courseId);
  const moduleId = mod?.id;
  const highestPassed = courseTestProgress[courseId] || 0;
  // isModuleTestUnlocked only reads `courseTestProgress` off the state
  // — pass a minimal object so we don't need the full store reference.
  const moduleUnlocked = moduleId !== undefined
    ? isModuleTestUnlocked({ courseTestProgress } as AppState, moduleId)
    : false;
  const modulePassed = moduleId !== undefined ? completedModules.includes(moduleId) : false;

  // Don't serve fake tests: a course with no hand-written / AI / sufficient
  // (>=20) cloze questions falls back to a passable placeholder (options
  // literally labelled "Правильный ответ", correctIndex 0). Gate the whole
  // panel on real questions existing for the course.
  const hasRealTest = useMemo(() => hasRealQuestions(courseId, 1), [courseId]);

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

  const handleComplete = useCallback((answers: number[], violations: number, timeUsedMs: number) => {
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
      const res = submitModuleTest(activeTest.moduleId, answers, questions, timeUsedMs, violations);
      setResult({ ...res, questions, answers });
    }
    setActiveTest(null);
  }, [activeTest, courseId, submitTest, submitModuleTest]);

  const handleCancel = useCallback((partialAnswers: (number | null)[], violations: number, timeUsedMs: number) => {
    if (activeTest?.type === 'course') {
      abortTest(courseId, activeTest.level, partialAnswers, violations);
    } else if (activeTest?.type === 'module') {
      abortModuleTest(activeTest.moduleId, partialAnswers, timeUsedMs, violations);
    }
    setActiveTest(null);
  }, [activeTest, courseId, abortTest, abortModuleTest]);

  // ═══ CONSENT SCREEN (before active test) ═══
  if (pendingTest) {
    const questions = pendingTest.type === 'course'
      ? getTestQuestions(courseId, pendingTest.level)
      : getModuleTestQuestions(pendingTest.moduleId);
    const timeLimit = pendingTest.type === 'module' ? MODULE_TEST_TIME_MS : 60 * 60 * 1000;
    const label = pendingTest.type === 'course'
      ? TEST_LEVEL_NAMES[pendingTest.level]
      : t('test.moduleFinal');

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
      : t('test.moduleFinal');

    return (
      <TestActiveView
        questions={questions}
        {...(timeLimit !== undefined && { timeLimit })}
        onComplete={handleComplete}
        onCancel={handleCancel}
        testLabel={label}
      />
    );
  }

  // ═══ RESULT VIEW ═══
  if (result) {
    const cardClass = result.passed
      ? 'bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A]'
      : 'bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626]';
    const denomClass = result.passed ? 'text-[#86EFAC]' : 'text-[#FCA5A5]';
    return (
      <div className="flex flex-col gap-[14px]">
        {/* Score card — soft tint, large number, status pill style */}
        <div className={`text-center py-7 px-6 rounded-[14px] ${cardClass}`}>
          <div className="font-[var(--font-display)] text-[38px] font-bold mb-1.5 tracking-[-0.02em] leading-none">
            {result.score} <span className={denomClass}>/ {result.total}</span>
          </div>
          <p className="font-[var(--font-body)] text-sm font-semibold">
            {result.passed ? t('test.result.passed') : t('test.result.failed')}
          </p>
        </div>

        {/* Per-question breakdown — same row aesthetic as test list */}
        <div className="flex flex-col gap-1.5 max-h-[420px] overflow-y-auto pr-1">
          {result.questions.map((q, i) => {
            const userAnswer = result.answers[i];
            const isCorrect = userAnswer === q.correctIndex;
            return (
              <div key={q.id} className={`py-2.5 px-3.5 rounded-[10px] ${isCorrect ? 'bg-[#F5F6F8] border border-transparent' : 'bg-[#FEF2F2] border border-[#FECACA]'}`}>
                <div className="flex items-start gap-2.5">
                  <span className={`w-[18px] h-[18px] rounded-[6px] text-white shrink-0 inline-flex items-center justify-center text-[10px] font-bold mt-px ${isCorrect ? 'bg-[#16A34A]' : 'bg-[#DC2626]'}`}>
                    {isCorrect ? (
                      <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    ) : (
                      <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><line x1={18} y1={6} x2={6} y2={18}/><line x1={6} y1={6} x2={18} y2={18}/></svg>
                    )}
                  </span>
                  <span className="font-[var(--font-body)] text-[13px] text-[#1A1A1A] leading-[1.45] font-medium">
                    {q.question}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center pt-1">
          <button
            onClick={() => setResult(null)}
            className="py-[11px] px-7 rounded-[10px] bg-[#3B82F6] hover:bg-[#2563EB] text-white border-none cursor-pointer font-[var(--font-body)] text-sm font-semibold transition-colors duration-[180ms]"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    );
  }

  // ═══ NO REAL TEST — show a "preparing" state instead of fake placeholders ═══
  if (!hasRealTest) {
    return (
      <div className="py-8 px-6 bg-[#F5F6F8] rounded-[16px] text-center">
        <p className="font-[var(--font-mono)] text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-[0.08em] mb-2">
          {t('test.title')}
        </p>
        <p className="font-[var(--font-body)] text-sm text-[#6B7280] m-0 leading-[1.6]">
          Тесты для этого курса готовятся. Доступны материалы и самопроверка в уроках.
        </p>
      </div>
    );
  }

  // ═══ TEST CARDS (IDLE) ═══
  const levels: TestLevel[] = [1, 2, 3, 4, 5];
  const passedCount = Math.min(highestPassed, MAX_TEST_LEVELS);
  const totalProgress = Math.round((passedCount / MAX_TEST_LEVELS) * 100);

  return (
    <div className="flex flex-col gap-2.5">
      {/* Header panel */}
      <div className="py-5 px-6 bg-[#F5F6F8] rounded-[16px] text-[#1A1A1A]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="font-[var(--font-mono)] text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-[0.08em] mb-1">
              {t('test.title')}
            </p>
            <h3 className="font-[var(--font-display)] text-xl font-bold text-[#1A1A1A] m-0 tracking-[-0.01em]">
              {t('test.subtitle')}
            </h3>
          </div>
          <div className="text-right">
            <p className="font-[var(--font-display)] text-[28px] font-bold text-[#1A1A1A] leading-none">
              {passedCount}<span className="text-[#C4C7CD] text-lg">/{MAX_TEST_LEVELS}</span>
            </p>
            <p className="font-[var(--font-body)] text-[11px] text-[#888] mt-0.5">
              {t('test.percentComplete', { p: totalProgress })}
            </p>
          </div>
        </div>
        {/* Progress bar — striped green like CourseProgressBar */}
        <CourseProgressBar
          pct={totalProgress}
          currentLabel={t('test.row.kind.level') + ' ' + Math.max(1, passedCount)}
          endLabel={t('course.progress.ofTotal', { n: MAX_TEST_LEVELS })}
          startCaption={t('course.progress.start')}
          endCaption={t('course.progress.final')}
        />
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
          ? t('test.detail.availableInH', { time: formatHours(cooldown) })
          : cooldown > 0
            ? t('test.detail.coolingDown', { time: formatCooldown(cooldown) })
            : !isUnlocked
              ? t('test.detail.passPrev')
              : isCurrent
                ? t('test.detail.questionsLine', { n: QUESTIONS_PER_TEST, pass: PASS_THRESHOLD_TEST, total: QUESTIONS_PER_TEST })
                : null;

        return (
          <TestRow
            key={level}
            index={idx}
            title={TEST_LEVEL_NAMES[level]}
            kind=""
            status={status}
            rightInfo={isPassed && bestScore !== null
              ? `${bestScore}/${QUESTIONS_PER_TEST}`
              : t('test.row.right.questions', { n: QUESTIONS_PER_TEST })}
            detailRows={[
              { label: t('test.row.detail.questions'), value: String(QUESTIONS_PER_TEST), icon: 'list' },
              { label: t('test.row.detail.threshold'), value: `${PASS_THRESHOLD_TEST}/${QUESTIONS_PER_TEST}`, icon: 'target' },
              {
                label: bestScore !== null ? t('test.row.detail.best') : t('test.row.detail.attempts'),
                value: bestScore !== null ? `${bestScore}/${QUESTIONS_PER_TEST}` : String(attempts.length),
                icon: bestScore !== null ? 'trophy' : 'history',
              },
            ]}
            {...(!isPassed && !isCurrent && statusDetail ? { description: statusDetail } : {})}
            actionLabel={isPassed ? t('test.action.repeat') : isCurrent ? t('test.action.startTest') : null}
            actionVariant={isPassed ? 'secondary' : 'primary'}
            onAction={() => startCourseTest(level)}
            disabled={!isCurrent && !isPassed}
          />
        );
      })}

      {/* Visual divider — separates per-course tests from the module-final
          row, signals the «boss-fight» moment in the user's progression. */}
      {moduleId !== undefined && (
        <div className="flex items-center gap-3 mt-1.5 mx-1 mb-0.5">
          <span className="flex-1 h-px bg-[#E5E7EB]" />
          <span className="font-[var(--font-mono)] text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.1em]">
            {t('test.divider.courseFinal')}
          </span>
          <span className="flex-1 h-px bg-[#E5E7EB]" />
        </div>
      )}

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
          ? t('test.detail.availableInH', { time: formatHours(moduleLockoutLeft) })
          : modulePassed
            ? t('test.detail.passedFull')
            : moduleUnlocked
              ? t('test.detail.unlockedDesc', { n: MODULE_TEST_QUESTIONS, p: PASS_THRESHOLD_MODULE })
              : t('test.detail.lockedPrereq');

        return (
          <TestRow
            index={5}
            title={t('test.module.title')}
            kind={t('test.row.kind.course')}
            status={moduleStatus}
            rightInfo={t('test.row.right.questions', { n: MODULE_TEST_QUESTIONS })}
            detailRows={[
              { label: t('test.row.detail.questions'), value: String(MODULE_TEST_QUESTIONS), icon: 'list' },
              { label: t('test.row.detail.time'), value: t('test.detail.threeHours'), icon: 'clock' },
              { label: t('test.row.detail.threshold'), value: `${PASS_THRESHOLD_MODULE}%`, icon: 'target' },
            ]}
            {...(
              !(modulePassed || (moduleUnlocked && !moduleLockedByViolation)) && moduleDetail
                ? { description: moduleDetail }
                : {}
            )}
            actionLabel={moduleUnlocked && !modulePassed && !moduleLockedByViolation ? t('test.action.startTest') : null}
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

type PillIcon = 'list' | 'target' | 'trophy' | 'info' | 'clock' | 'history' | 'check' | 'lock';

function PillIconSvg({ name }: { name: PillIcon }) {
  const common = {
    width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none' as const,
    stroke: 'currentColor', strokeWidth: 2,
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  };
  switch (name) {
    case 'list': return <svg {...common}><line x1={8} y1={6} x2={21} y2={6}/><line x1={8} y1={12} x2={21} y2={12}/><line x1={8} y1={18} x2={21} y2={18}/><circle cx={4} cy={6} r={1}/><circle cx={4} cy={12} r={1}/><circle cx={4} cy={18} r={1}/></svg>;
    case 'target': return <svg {...common}><circle cx={12} cy={12} r={10}/><circle cx={12} cy={12} r={6}/><circle cx={12} cy={12} r={2}/></svg>;
    case 'trophy': return <svg {...common}><path d="M6 9H4a2 2 0 010-4h2"/><path d="M18 9h2a2 2 0 000-4h-2"/><path d="M6 5h12v6a6 6 0 01-12 0V5z"/><path d="M9 21h6"/><path d="M12 17v4"/></svg>;
    case 'info': return <svg {...common}><circle cx={12} cy={12} r={10}/><line x1={12} y1={16} x2={12} y2={12}/><line x1={12} y1={8} x2={12.01} y2={8}/></svg>;
    case 'clock': return <svg {...common}><circle cx={12} cy={12} r={10}/><polyline points="12 6 12 12 16 14"/></svg>;
    case 'history': return <svg {...common}><polyline points="1 4 1 10 7 10"/><path d="M3.51 15A9 9 0 1012 3.51"/><line x1={12} y1={7} x2={12} y2={12}/><line x1={12} y1={12} x2={15} y2={14}/></svg>;
    case 'check': return <svg {...common}><polyline points="20 6 9 17 4 12"/></svg>;
    case 'lock': return <svg {...common}><rect x={3} y={11} width={18} height={11} rx={2}/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
  }
}

const STATUS_META: Record<TestStatus, {
  label: string;
  bg: string;
  fg: string;
  iconColor: string;
  rowAccent: string; // subtle row tint
  icon: 'check' | 'play' | 'lock' | 'clock' | 'alert';
}> = {
  passed:    { label: 'Пройден',     bg: '#DCFCE7', fg: '#166534', iconColor: '#16A34A', rowAccent: '#F5F6F8', icon: 'check' },
  available: { label: 'Доступен',    bg: '#DCFCE7', fg: '#166534', iconColor: '#16A34A', rowAccent: '#F5F6F8', icon: 'play' },
  // Locked → white chip with the project-standard 2-layer shadow used on
  // course/section cards (sets the «inactive but interactive» tone).
  locked:    { label: 'Закрыто',     bg: '#FFFFFF', fg: '#6B7280', iconColor: '#9CA3AF', rowAccent: '#F5F6F8', icon: 'lock' },
  cooldown:  { label: 'Перезарядка', bg: '#FEF3C7', fg: '#92400E', iconColor: '#D97706', rowAccent: '#F5F6F8', icon: 'clock' },
  violation: { label: 'Нарушение',   bg: '#FEE2E2', fg: '#991B1B', iconColor: '#DC2626', rowAccent: '#F5F6F8', icon: 'alert' },
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
  const t = useT();
  const m = STATUS_META[status];
  const isWhiteChip = m.bg === '#FFFFFF';
  return (
    <span
      className={`inline-flex items-center gap-[5px] py-[3px] px-[9px] rounded-lg font-[var(--font-body)] text-[11px] font-semibold shrink-0 bg-[var(--status-bg)] text-[var(--status-fg)] ${isWhiteChip ? 'shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)]' : ''}`}
      // eslint-disable-next-line react/forbid-dom-props -- dynamic palette per status
      style={{ ['--status-bg' as string]: m.bg, ['--status-fg' as string]: m.fg }}
    >
      <StatusIcon name={status} color={m.iconColor} />
      {t(`test.status.${status}`)}
    </span>
  );
}

interface TestRowProps {
  index: number;
  title: string;
  kind: string;
  status: TestStatus;
  rightInfo: string;
  detailRows: { label: string; value: string; icon?: PillIcon }[];
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

  const containerClass = open
    ? 'bg-white border border-[#E5E7EB] shadow-[0_1px_2px_rgba(16,24,40,0.04),0_4px_16px_rgba(16,24,40,0.04)]'
    : highlight
      ? 'bg-[linear-gradient(135deg,#FFFBEB_0%,#F5F6F8_100%)] border border-[#FDE68A] shadow-[0_1px_2px_rgba(217,119,6,0.06),0_2px_6px_rgba(217,119,6,0.04)]'
      : 'bg-[var(--row-accent)] border border-transparent';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: [0.05, 0.7, 0.1, 1] }}
      className={`rounded-[14px] overflow-hidden transition-[background,border-color,box-shadow] duration-200 ${containerClass}`}
       
      style={{ ['--row-accent' as string]: meta.rowAccent }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="test-row-header w-full flex items-center gap-3 py-[14px] px-[18px] bg-transparent border-none cursor-pointer text-left min-w-0"
      >
        {/* Kind tag — gold pill for the module-final row only. Per-level
            rows pass an empty `kind` and skip the tag entirely (the title
            «Тест N» already conveys the level). */}
        {highlight && kind ? (
          <span className="inline-flex items-center gap-[5px] py-[3px] px-[9px] rounded-lg bg-[#FEF3C7] text-[#92400E] font-[var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.06em] shrink-0">
            <svg width={11} height={11} viewBox="0 0 24 24" fill="#D97706" stroke="none">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
            </svg>
            {kind}
          </span>
        ) : null}
        <span className="font-[var(--font-display)] text-[14.5px] font-semibold text-[#1A1A1A] shrink-0 inline-flex items-center gap-2">
          {title}
        </span>
        <StatusBadge status={status} />
        <span className="flex-1" />
        <span className="test-row-info font-[var(--font-body)] text-[13px] font-semibold text-[#1A1A1A] shrink-0">
          {rightInfo}
        </span>
        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-[6px] bg-[#F5F6F8] text-[#6B7280] shrink-0 transition-transform duration-[250ms] ease-[cubic-bezier(0.2,0,0,1)] ${open ? 'rotate-180' : ''}`}>
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
            className="overflow-hidden"
          >
            {/* Info-pill grid — matches CourseHeader Уровень/Аудитория/Объём
                so the expanded card visually rhymes with the page header. */}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2.5 pt-[14px] px-[18px] pb-1.5 border-t border-[#F0F1F5]">
              {detailRows.map(({ label, value, icon }) => (
                <div key={label} className="bg-[#F5F6F8] rounded-[12px] py-3 px-4 flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-[#6B7280]">
                    {icon && <PillIconSvg name={icon} />}
                    <span className="font-[var(--font-mono)] text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.06em]">
                      {label}
                    </span>
                  </div>
                  <span className="font-[var(--font-body)] text-[13px] font-semibold text-[#1A1A1A] leading-[1.35] overflow-hidden text-ellipsis whitespace-nowrap">
                    {value}
                  </span>
                </div>
              ))}
            </div>
            {description && (
              <div className="pt-0 px-[18px] pb-[14px] font-[var(--font-body)] text-[13px] text-[#4B5563] leading-[1.55]">
                {description}
              </div>
            )}
            {actionLabel && (
              <div className="test-row-action-wrap pt-0 px-[18px] pb-4 flex justify-end">
                <button
                  onClick={(e) => { e.stopPropagation(); if (!disabled && onAction) onAction(); }}
                  disabled={disabled}
                  className={`test-row-action-btn inline-flex items-center justify-center gap-2 py-2.5 px-[18px] font-[var(--font-body)] text-[13.5px] font-semibold rounded-[10px] transition-colors duration-[180ms] ${
                    disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer opacity-100'
                  } ${
                    actionVariant === 'primary'
                      ? 'text-white bg-[#3B82F6] hover:bg-[#2563EB] border-none'
                      : 'text-[#1F2937] bg-[#F5F6F8] hover:bg-[#EEF1F4] border border-[#E5E7EB]'
                  }`}
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
