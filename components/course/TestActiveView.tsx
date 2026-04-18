'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TestQuestion } from '@/lib/quiz';
import { formatTimer } from '@/lib/quiz';
import TestGuard from './TestGuard';

interface TestActiveViewProps {
  questions: TestQuestion[];
  timeLimit?: number;  // ms — undefined for course tests, 3h for module test
  onComplete: (answers: number[], violations: number) => void;
  onCancel: () => void;
  testLabel: string;   // e.g. "Тест 2" or "Финальный тест модуля"
}

export default function TestActiveView({ questions, timeLimit, onComplete, onCancel, testLabel }: TestActiveViewProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    Array(questions.length).fill(null)
  );
  const [violations, setViolations] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit ?? 0);
  const completedRef = useRef(false);

  // Timer for module tests
  useEffect(() => {
    if (!timeLimit) return;
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
  }, [timeLimit]);

  // Auto-submit on timer expiry
  useEffect(() => {
    if (timeLimit && timeRemaining <= 0 && !completedRef.current) {
      completedRef.current = true;
      onComplete(selectedAnswers.map((a) => a ?? -1), violations);
    }
  }, [timeLimit, timeRemaining, selectedAnswers, violations, onComplete]);

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Header panel — matches TestPanel "Прогресс обучения" */}
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
              {timeLimit && (
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700,
                  color: timeRemaining < 600_000 ? '#B91C1C' : '#1A1A1A',
                }}>
                  {formatTimer(timeRemaining)}
                </span>
              )}
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
                      background: isSelected ? '#FFFFFF' : '#FFFFFF',
                      boxShadow: isSelected
                        ? '0 0 0 2px #1A1A1A, 0 2px 8px rgba(0,0,0,0.06)'
                        : '0 1px 2px rgba(16,24,40,0.04)',
                      border: 'none',
                      cursor: 'pointer', textAlign: 'left', width: '100%',
                      transition: 'box-shadow 180ms, transform 180ms',
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
                      background: isSelected ? '#1A1A1A' : '#F0F1F5',
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
          <button onClick={onCancel} style={{
            padding: '8px 16px',
            borderRadius: 10,
            background: 'transparent',
            color: '#6B7280',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
            transition: 'color 180ms',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#1A1A1A'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#6B7280'; }}
          >
            Отменить
          </button>
          <button
            onClick={nextQuestion}
            disabled={selected === null}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '10px 20px',
              borderRadius: 10,
              background: selected !== null ? '#1A1A1A' : '#E2E4EA',
              color: selected !== null ? '#FFFFFF' : '#9CA3AF',
              border: 'none',
              cursor: selected !== null ? 'pointer' : 'not-allowed',
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
              transition: 'background 180ms',
            }}
            onMouseEnter={(e) => { if (selected !== null) e.currentTarget.style.background = '#000000'; }}
            onMouseLeave={(e) => { if (selected !== null) e.currentTarget.style.background = '#1A1A1A'; }}
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
    </TestGuard>
  );
}
