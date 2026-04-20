'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
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

interface TestPanelProps {
  courseId: string;
}

type ActiveTest = { type: 'course'; level: TestLevel } | { type: 'module'; moduleId: number } | null;

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

  const [activeTest, setActiveTest] = useState<ActiveTest>(null);
  const [result, setResult] = useState<TestResult | null>(null);

  // Cooldown timers (update every minute)
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(interval);
  }, []);

  const startCourseTest = useCallback((level: TestLevel) => {
    setResult(null);
    setActiveTest({ type: 'course', level });
  }, []);

  const startModuleTest = useCallback(() => {
    if (moduleId === undefined) return;
    setResult(null);
    setActiveTest({ type: 'module', moduleId });
  }, [moduleId]);

  const handleComplete = useCallback((answers: number[], violations: number) => {
    if (!activeTest) return;

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

      {/* 5 course test cards */}
      {levels.map((level) => {
        const key = `${courseId}-${level}`;
        const attempts = testAttempts[key] || [];
        const isPassed = highestPassed >= level;
        const isUnlocked = level === 1 || highestPassed >= level - 1;
        const cooldown = !isPassed ? getCooldownRemaining(attempts) : 0;
        const bestScore = attempts.length > 0 ? Math.max(...attempts.map((a) => a.score)) : null;
        const isCurrent = !isPassed && isUnlocked && cooldown <= 0;

        // States: passed (green), current (neutral), locked (muted), cooldown (amber)
        let cardBg = '#F5F6F8';
        let cardBorder = 'none';
        let accentColor = '#6B7280';
        if (isPassed) {
          cardBg = 'linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)';
          cardBorder = '1px solid #A7F3D0';
          accentColor = '#059669';
        } else if (isCurrent) {
          cardBg = '#F5F6F8';
          cardBorder = 'none';
          accentColor = '#374151';
        } else if (cooldown > 0) {
          cardBg = '#F5F6F8';
          cardBorder = 'none';
          accentColor = '#6B7280';
        } else if (!isUnlocked) {
          cardBg = '#F5F6F8';
          cardBorder = 'none';
          accentColor = '#9CA3AF';
        }

        return (
          <motion.div
            key={level}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: level * 0.04, ease: [0.05, 0.7, 0.1, 1] }}
            style={{
              background: cardBg,
              borderRadius: 14,
              padding: '14px 20px',
              display: 'flex', alignItems: 'center', gap: 16,
              border: cardBorder,
              opacity: !isUnlocked ? 0.65 : 1,
              boxShadow: 'none',
              transition: 'all 200ms ease',
            }}
          >
            {/* Status icon */}
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: isPassed
                ? '#10B981'
                : isCurrent
                  ? '#FFFFFF'
                  : cooldown > 0
                    ? '#FFFFFF'
                    : '#F3F4F6',
              boxShadow: (isCurrent || cooldown > 0) ? '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: isPassed ? '#FFFFFF' : accentColor,
            }}>
              {isPassed ? (
                <Check size={20} color="#FFFFFF" />
              ) : !isUnlocked ? (
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth={1.8}
                  strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              ) : cooldown > 0 ? (
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth={1.8}
                  strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12,6 12,12 16,14" />
                </svg>
              ) : (
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: 16,
                  fontWeight: 700,
                }}>
                  {level}
                </span>
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
              }}>
                <h4 style={{
                  fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
                  color: isPassed ? '#064E3B' : isCurrent ? '#1A1A1A' : !isUnlocked ? '#9CA3AF' : '#1A1A1A',
                  margin: 0,
                }}>
                  {TEST_LEVEL_NAMES[level]}
                </h4>
                {isPassed && (
                  <span style={{
                    padding: '2px 8px', borderRadius: 999,
                    background: '#10B981', color: '#FFFFFF',
                    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                    letterSpacing: '0.04em', textTransform: 'uppercase',
                  }}>
                    Пройден
                  </span>
                )}
                {isCurrent && (
                  <span style={{
                    padding: '2px 8px', borderRadius: 999,
                    background: '#E2E4EA', color: '#374151',
                    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                    letterSpacing: '0.04em', textTransform: 'uppercase',
                  }}>
                    Текущий
                  </span>
                )}
              </div>
              <div style={{
                fontFamily: 'var(--font-body)', fontSize: 13,
                color: isPassed ? '#065F46' : !isUnlocked ? '#9CA3AF' : '#6B7280',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                {isPassed && bestScore !== null ? (
                  <>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontWeight: 600, color: '#059669' }}>{bestScore}</span>
                      <span style={{ color: '#A7F3D0' }}>/</span>
                      <span>{QUESTIONS_PER_TEST}</span>
                    </span>
                    <span style={{ color: '#A7F3D0' }}>·</span>
                    <span>Лучший результат</span>
                  </>
                ) : !isUnlocked ? (
                  'Пройдите предыдущий тест для разблокировки'
                ) : cooldown > 0 ? (
                  `Доступно через ${formatCooldown(cooldown)}`
                ) : (
                  <>
                    <span>{QUESTIONS_PER_TEST} вопросов</span>
                    <span style={{ color: '#D1D5DB' }}>·</span>
                    <span>{PASS_THRESHOLD_TEST}/{QUESTIONS_PER_TEST} для прохождения</span>
                  </>
                )}
              </div>
            </div>

            {/* Action */}
            <div style={{ flexShrink: 0 }}>
              {isPassed ? (
                <button onClick={() => startCourseTest(level)} style={{
                  padding: '8px 16px',
                  borderRadius: 10,
                  background: 'transparent', border: '1px solid #D1FAE5',
                  color: '#059669',
                  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 150ms',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#ECFDF5'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  Повторить
                </button>
              ) : isCurrent ? (
                <button onClick={() => startCourseTest(level)} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '10px 18px',
                  borderRadius: 10,
                  background: '#1A1A1A',
                  color: '#FFFFFF',
                  border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                  transition: 'background 180ms',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#000000'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#1A1A1A'; }}
                >
                  Начать
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12,5 19,12 12,19" />
                  </svg>
                </button>
              ) : null}
            </div>
          </motion.div>
        );
      })}

      {/* Module final test card */}
      {moduleId !== undefined && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.3, ease: [0.05, 0.7, 0.1, 1] }}
          style={{
            background: '#F5F6F8',
            borderRadius: 14,
            padding: '14px 20px',
            display: 'flex', alignItems: 'center', gap: 16,
            border: 'none',
            opacity: moduleUnlocked ? 1 : 0.65,
            marginTop: 4,
          }}
        >
          {/* Icon badge - matches other test cards */}
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            background: modulePassed ? '#22C55E' : '#FFFFFF',
            boxShadow: !modulePassed ? '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: modulePassed ? '#FFFFFF' : moduleUnlocked ? '#374151' : '#9CA3AF',
          }}>
            {modulePassed ? (
              <Check size={20} color="#FFFFFF" />
            ) : !moduleUnlocked ? (
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={1.8}
                strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            ) : (
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={1.8}
                strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12,2 15,8.5 22,9.5 17,14.5 18.5,21.5 12,18 5.5,21.5 7,14.5 2,9.5 9,8.5" />
              </svg>
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
            }}>
              <h4 style={{
                fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
                color: !moduleUnlocked ? '#9CA3AF' : '#1A1A1A',
                margin: 0,
              }}>
                Финальный тест модуля
              </h4>
              {moduleUnlocked && !modulePassed && (
                <span style={{
                  padding: '2px 8px', borderRadius: 999,
                  background: '#E2E4EA', color: '#374151',
                  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.04em', textTransform: 'uppercase',
                }}>
                  Доступно
                </span>
              )}
              {modulePassed && (
                <span style={{
                  padding: '2px 8px', borderRadius: 999,
                  background: '#22C55E', color: '#FFFFFF',
                  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.04em', textTransform: 'uppercase',
                }}>
                  Завершён
                </span>
              )}
            </div>
            <div style={{
              fontFamily: 'var(--font-body)', fontSize: 13,
              color: !moduleUnlocked ? '#9CA3AF' : '#6B7280',
              display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
            }}>
              {modulePassed
                ? 'Модуль полностью пройден'
                : moduleUnlocked
                  ? (
                    <>
                      <span>{MODULE_TEST_QUESTIONS} вопросов</span>
                      <span style={{ color: '#D1D5DB' }}>·</span>
                      <span>3 часа</span>
                      <span style={{ color: '#D1D5DB' }}>·</span>
                      <span>{PASS_THRESHOLD_MODULE}% для прохождения</span>
                    </>
                  )
                  : 'Откроется после прохождения всех 5 тестов по каждому курсу модуля'}
            </div>
          </div>

          {/* Action */}
          <div style={{ flexShrink: 0 }}>
            {moduleUnlocked && !modulePassed && (
              <button onClick={startModuleTest} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '10px 18px',
                borderRadius: 10,
                background: '#1A1A1A',
                color: '#FFFFFF',
                border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                transition: 'background 180ms',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#000000'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#1A1A1A'; }}
              >
                Начать
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12,5 19,12 12,19" />
                </svg>
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
