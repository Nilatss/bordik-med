'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, getHighestPassedLevel, isModuleTestUnlocked } from '@/lib/store';
import { useT } from '@/lib/i18n';
import CourseProgressBar from './CourseProgressBar';
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
  const t = useT();
  const store = useAppStore();
  const { testAttempts, courseTestProgress, moduleTestAttempts, completedModules, submitTest, submitModuleTest, abortTest, abortModuleTest } = store;

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

  const handleCancel = useCallback((partialAnswers: (number | null)[], violations: number) => {
    if (activeTest?.type === 'course') {
      abortTest(courseId, activeTest.level, partialAnswers, violations);
    } else if (activeTest?.type === 'module') {
      abortModuleTest(activeTest.moduleId, partialAnswers, 0, violations);
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
        timeLimit={timeLimit}
        onComplete={handleComplete}
        onCancel={handleCancel}
        testLabel={label}
      />
    );
  }

  // ═══ RESULT VIEW ═══
  if (result) {
    const accent = result.passed ? '#16A34A' : '#DC2626';
    const accentBg = result.passed ? '#F0FDF4' : '#FEF2F2';
    const accentBorder = result.passed ? '#BBF7D0' : '#FECACA';
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        {/* Score card — soft tint, large number, status pill style */}
        <div style={{
          textAlign: 'center',
          padding: '28px 24px',
          borderRadius: 14,
          background: accentBg,
          border: `1px solid ${accentBorder}`,
        }}>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 38, fontWeight: 700,
            color: accent,
            marginBottom: 6, letterSpacing: '-0.02em', lineHeight: 1,
          }}>
            {result.score} <span style={{ color: result.passed ? '#86EFAC' : '#FCA5A5' }}>/ {result.total}</span>
          </div>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
            color: accent,
          }}>
            {result.passed ? t('test.result.passed') : t('test.result.failed')}
          </p>
        </div>

        {/* Per-question breakdown — same row aesthetic as test list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 420, overflowY: 'auto', paddingRight: 4 }}>
          {result.questions.map((q, i) => {
            const userAnswer = result.answers[i];
            const isCorrect = userAnswer === q.correctIndex;
            return (
              <div key={q.id} style={{
                padding: '10px 14px',
                borderRadius: 10,
                background: isCorrect ? '#F5F6F8' : '#FEF2F2',
                border: isCorrect ? '1px solid transparent' : '1px solid #FECACA',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: 6,
                    background: isCorrect ? '#16A34A' : '#DC2626',
                    color: '#FFFFFF', flexShrink: 0,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700, marginTop: 1,
                  }}>
                    {isCorrect ? (
                      <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    ) : (
                      <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><line x1={18} y1={6} x2={6} y2={18}/><line x1={6} y1={6} x2={18} y2={18}/></svg>
                    )}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: 13,
                    color: '#1A1A1A', lineHeight: 1.45, fontWeight: 500,
                  }}>
                    {q.question}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 4 }}>
          <button onClick={() => setResult(null)} style={{
            padding: '11px 28px',
            borderRadius: 10,
            background: '#3B82F6',
            color: '#FFFFFF',
            border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
            transition: 'background 180ms',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#2563EB'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#3B82F6'; }}
          >
            {t('common.close')}
          </button>
        </div>
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
              {t('test.title')}
            </p>
            <h3 style={{
              fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700,
              color: '#1A1A1A', margin: 0, letterSpacing: '-0.01em',
            }}>
              {t('test.subtitle')}
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
        {/* Legacy block — kept disabled for fallback / git diff continuity */}
        {false && (<div style={{
          height: 6, background: '#E2E4EA', borderRadius: 999,
        }}>
          <div style={{
            height: '100%',
            width: `${totalProgress}%`,
            background: 'linear-gradient(90deg, #10B981 0%, #34D399 100%)',
            borderRadius: 999,
            transition: 'width 400ms ease',
          }} />
        </div>)}
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
            description={
              isPassed || isCurrent ? undefined : statusDetail ?? undefined
            }
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
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          margin: '6px 4px 2px',
        }}>
          <span style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>
            {t('test.divider.courseFinal')}
          </span>
          <span style={{ flex: 1, height: 1, background: '#E5E7EB' }} />
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
            description={
              modulePassed || (moduleUnlocked && !moduleLockedByViolation)
                ? undefined
                : moduleDetail
            }
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
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px',
      borderRadius: 8,
      background: m.bg, color: m.fg,
      fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600,
      flexShrink: 0,
      boxShadow: isWhiteChip
        ? '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)'
        : 'none',
    }}>
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: [0.05, 0.7, 0.1, 1] }}
      style={{
        // Highlight mode = the final module-test row. Gives it a soft
        // amber→cream gradient accent so it visually stands out from the
        // per-course rows above without breaking the project palette.
        background: open
          ? '#FFFFFF'
          : highlight
            ? 'linear-gradient(135deg, #FFFBEB 0%, #F5F6F8 100%)'
            : meta.rowAccent,
        border: open
          ? '1px solid #E5E7EB'
          : highlight ? '1px solid #FDE68A' : '1px solid transparent',
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: open
          ? '0 1px 2px rgba(16,24,40,0.04), 0 4px 16px rgba(16,24,40,0.04)'
          : highlight
            ? '0 1px 2px rgba(217,119,6,0.06), 0 2px 6px rgba(217,119,6,0.04)'
            : 'none',
        transition: 'background 200ms ease, border-color 200ms ease, box-shadow 200ms ease',
      }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="test-row-header"
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 18px',
          background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
          minWidth: 0,
        }}
      >
        {/* Kind tag — gold pill for the module-final row only. Per-level
            rows pass an empty `kind` and skip the tag entirely (the title
            «Тест N» already conveys the level). */}
        {highlight && kind ? (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 9px', borderRadius: 8,
            background: '#FEF3C7', color: '#92400E',
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.06em',
            flexShrink: 0,
          }}>
            <svg width={11} height={11} viewBox="0 0 24 24" fill="#D97706" stroke="none">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 16.8l-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
            </svg>
            {kind}
          </span>
        ) : null}
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: 14.5, fontWeight: 600,
          color: '#1A1A1A', flexShrink: 0,
          display: 'inline-flex', alignItems: 'center', gap: 8,
        }}>
          {title}
        </span>
        <StatusBadge status={status} />
        <span style={{ flex: 1 }} />
        <span className="test-row-info" style={{
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
            {/* Info-pill grid — matches CourseHeader Уровень/Аудитория/Объём
                so the expanded card visually rhymes with the page header. */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 10,
              padding: '14px 18px 6px',
              borderTop: '1px solid #F0F1F5',
            }}>
              {detailRows.map(({ label, value, icon }) => (
                <div key={label} style={{
                  background: '#F5F6F8',
                  borderRadius: 12,
                  padding: '12px 16px',
                  display: 'flex', flexDirection: 'column', gap: 4,
                  minWidth: 0,
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    color: '#6B7280',
                  }}>
                    {icon && <PillIconSvg name={icon} />}
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                      color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>
                      {label}
                    </span>
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                    color: '#1A1A1A', lineHeight: 1.35,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
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
              <div className="test-row-action-wrap" style={{
                padding: '0 18px 16px',
                display: 'flex', justifyContent: 'flex-end',
              }}>
                <button
                  onClick={(e) => { e.stopPropagation(); if (!disabled && onAction) onAction(); }}
                  disabled={disabled}
                  className="test-row-action-btn"
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '10px 18px',
                    fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600,
                    color: actionVariant === 'primary' ? '#FFFFFF' : '#1F2937',
                    background: actionVariant === 'primary' ? '#3B82F6' : '#F5F6F8',
                    border: actionVariant === 'secondary' ? '1px solid #E5E7EB' : 'none',
                    borderRadius: 10,
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
