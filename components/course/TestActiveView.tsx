'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TestQuestion } from '@/lib/quiz';
import { formatTimer } from '@/lib/quiz';
import TestGuard from './TestGuard';

interface TestActiveViewProps {
  questions: TestQuestion[];
  timeLimit?: number;  // ms - undefined → defaults to 1 hour (3 600 000 ms)
  onComplete: (answers: number[], violations: number) => void;
  onCancel: () => void;
  testLabel: string;   // e.g. "Тест 2" or "Финальный тест модуля"
}

const DEFAULT_TIME_LIMIT_MS = 60 * 60 * 1000; // 1 hour

export default function TestActiveView({ questions, timeLimit, onComplete, onCancel, testLabel }: TestActiveViewProps) {
  const effectiveTimeLimit = timeLimit ?? DEFAULT_TIME_LIMIT_MS;
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    Array(questions.length).fill(null)
  );
  const [violations, setViolations] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(effectiveTimeLimit);
  const [confirmExit, setConfirmExit] = useState(false);
  const completedRef = useRef(false);

  // Countdown timer (always active — 1 hour default)
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const next = prev - 1000;
        if (next <= 0) {
          clearInterval(interval);
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-submit on timer expiry
  useEffect(() => {
    if (timeRemaining <= 0 && !completedRef.current) {
      completedRef.current = true;
      onComplete(selectedAnswers.map((a) => a ?? -1), violations);
    }
  }, [timeRemaining, selectedAnswers, violations, onComplete]);

  const handleViolation = useCallback(() => {
    setViolations((v) => v + 1);
  }, []);

  const handleForceSubmit = useCallback(() => {
    if (!completedRef.current) {
      completedRef.current = true;
      onComplete(selectedAnswers.map((a) => a ?? -1), violations + 1);
    }
  }, [selectedAnswers, violations, onComplete]);

  const selectOption = useCallback((idx: number) => {
    setSelectedAnswers((prev) => {
      const next = [...prev];
      next[currentQ] = idx;
      return next;
    });
  }, [currentQ]);

  const nextQuestion = useCallback(() => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((q) => q + 1);
    } else {
      // Submit
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete(selectedAnswers.map((a) => a ?? -1), violations);
      }
    }
  }, [currentQ, questions.length, selectedAnswers, violations, onComplete]);

  const prevQuestion = useCallback(() => {
    setCurrentQ((q) => Math.max(0, q - 1));
  }, []);

  const q = questions[currentQ];
  const selected = selectedAnswers[currentQ];
  const isLast = currentQ === questions.length - 1;

  return (
    <TestGuard
      active={true}
      onViolation={handleViolation}
      onForceSubmit={handleForceSubmit}
      violationCount={violations}
    >
      {/* Fullscreen overlay during test attempt — hides the course header,
           TOC sidebar and any other navigation. The only way out is the
           "Прервать" confirmation modal that re-uses onCancel. */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: '#FFFFFF',
        overflowY: 'auto',
        padding: '24px clamp(16px, 4vw, 48px) 32px',
      }}>
      <div style={{
        maxWidth: 840, margin: '0 auto',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {/* Header panel - matches TestPanel "Прогресс обучения" */}
        <div style={{
          padding: '20px 24px',
          background: '#F5F6F8',
          borderRadius: 14,
          color: '#1A1A1A',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
                color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
                marginBottom: 4,
              }}>
                {testLabel}
              </p>
              <h3 style={{
                fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
                color: '#1A1A1A', margin: 0, letterSpacing: '-0.01em',
              }}>
                Вопрос {currentQ + 1} из {questions.length}
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700,
                color: timeRemaining < 60_000 ? '#B91C1C' : timeRemaining < 300_000 ? '#D97706' : '#1A1A1A',
                animation: timeRemaining < 60_000 ? 'bordik-timer-pulse 1s ease-in-out infinite' : undefined,
              }}>
                {formatTimer(timeRemaining)}
              </span>
              {violations > 0 && (
                <span style={{
                  padding: '3px 8px', borderRadius: 999,
                  background: '#FEF2F2', color: '#B91C1C',
                  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.04em', textTransform: 'uppercase',
                }}>
                  {violations} нар.
                </span>
              )}
              <button
                onClick={() => setConfirmExit(true)}
                aria-label="Прервать тест"
                title="Прервать тест"
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: '#9CA3AF',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 180ms, color 180ms',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FEF2F2';
                  e.currentTarget.style.color = '#B91C1C';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#9CA3AF';
                }}
              >
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth={2.5}
                  strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
          {/* Progress bar */}
          <div style={{
            height: 6, background: '#E2E4EA', borderRadius: 999,
          }}>
            <div style={{
              height: '100%',
              width: `${((currentQ + 1) / questions.length) * 100}%`,
              background: 'linear-gradient(90deg, #10B981 0%, #34D399 100%)',
              borderRadius: 999,
              transition: 'width 400ms ease',
            }} />
          </div>
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.05, 0.7, 0.1, 1] }}
            style={{
              background: '#F5F6F8',
              borderRadius: 14,
              padding: '22px 24px',
            }}
          >
            <h4 style={{
              fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700,
              color: '#1A1A1A', marginBottom: 18,
              lineHeight: 1.45, letterSpacing: '-0.01em',
            }}>
              {q.question}
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {q.options.map((option, idx) => {
                const isSelected = selected === idx;
                const letter = String.fromCharCode(65 + idx);
                return (
                  <button
                    key={idx}
                    onClick={() => selectOption(idx)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 16px',
                      borderRadius: 10,
                      // Soft blue tint when selected — same accent as Next
                      // button, far less aggressive than the previous black ring.
                      background: isSelected ? '#F0F7FF' : '#FFFFFF',
                      boxShadow: isSelected
                        ? '0 0 0 1.5px #3B82F6, 0 1px 2px rgba(59,130,246,0.08)'
                        : '0 1px 2px rgba(16,24,40,0.04)',
                      border: 'none',
                      cursor: 'pointer', textAlign: 'left', width: '100%',
                      transition: 'box-shadow 180ms, background 180ms',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.boxShadow = '0 1px 2px rgba(16,24,40,0.06), 0 2px 8px rgba(16,24,40,0.06)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.boxShadow = '0 1px 2px rgba(16,24,40,0.04)';
                    }}
                  >
                    <span style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: isSelected ? '#3B82F6' : '#F0F1F5',
                      color: isSelected ? '#FFFFFF' : '#666',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700,
                      transition: 'background 180ms',
                    }}>
                      {isSelected ? (
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth={3}
                          strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      ) : letter}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500,
                      color: '#1A1A1A', lineHeight: 1.5,
                    }}>
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 24px',
          background: '#F5F6F8',
          borderRadius: 14,
        }}>
          <button
            onClick={prevQuestion}
            disabled={currentQ === 0}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px',
              borderRadius: 10,
              background: 'transparent',
              color: currentQ === 0 ? '#C7CAD1' : '#6B7280',
              border: 'none',
              cursor: currentQ === 0 ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
              transition: 'color 180ms',
            }}
            onMouseEnter={(e) => { if (currentQ !== 0) e.currentTarget.style.color = '#1A1A1A'; }}
            onMouseLeave={(e) => { if (currentQ !== 0) e.currentTarget.style.color = '#6B7280'; }}
          >
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12,19 5,12 12,5" />
            </svg>
            Назад
          </button>
          <button
            onClick={nextQuestion}
            disabled={selected === null}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 20px',
              borderRadius: 10,
              background: selected !== null ? '#3B82F6' : '#E2E4EA',
              color: selected !== null ? '#FFFFFF' : '#9CA3AF',
              border: 'none',
              cursor: selected !== null ? 'pointer' : 'not-allowed',
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
              transition: 'background 180ms',
            }}
            onMouseEnter={(e) => { if (selected !== null) e.currentTarget.style.background = '#2563EB'; }}
            onMouseLeave={(e) => { if (selected !== null) e.currentTarget.style.background = '#3B82F6'; }}
          >
            {isLast ? 'Завершить тест' : 'Далее'}
            {selected !== null && (
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12,5 19,12 12,19" />
              </svg>
            )}
          </button>
        </div>
      </div>
      </div>

      {/* Exit confirmation */}
      <AnimatePresence>
        {confirmExit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              background: 'rgba(15, 23, 42, 0.55)',
              backdropFilter: 'blur(2px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 24,
            }}
            onClick={() => setConfirmExit(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.22, ease: [0.05, 0.7, 0.1, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#FFFFFF',
                borderRadius: 16,
                padding: '28px 28px 22px',
                maxWidth: 400,
                width: '100%',
                boxShadow: '0 24px 48px rgba(15,23,42,0.24)',
              }}
            >
              <h3 style={{
                fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
                color: '#1A1A1A', margin: '0 0 8px 0', letterSpacing: '-0.01em',
              }}>
                Прервать тест?
              </h3>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 400,
                color: '#6B7280', lineHeight: 1.5, margin: '0 0 22px 0',
              }}>
                Прогресс не сохранится. Ответы на {selectedAnswers.filter(a => a !== null).length} из {questions.length} вопросов будут потеряны.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setConfirmExit(false)}
                  style={{
                    padding: '10px 18px', borderRadius: 10,
                    background: '#F5F6F8', color: '#1A1A1A',
                    border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                    transition: 'background 180ms',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#E2E4EA'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#F5F6F8'; }}
                >
                  Продолжить тест
                </button>
                <button
                  onClick={() => { setConfirmExit(false); onCancel(); }}
                  style={{
                    padding: '10px 18px', borderRadius: 10,
                    background: '#B91C1C', color: '#FFFFFF',
                    border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                    transition: 'background 180ms',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#991B1B'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#B91C1C'; }}
                >
                  Прервать
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes bordik-timer-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }
      `}</style>
    </TestGuard>
  );
}
