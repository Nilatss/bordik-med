'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TestQuestion } from '@/lib/quiz';
import { formatTimer } from '@/lib/quiz';
import TestGuard from './TestGuard';
import Proctoring from './Proctoring';

/* Abort callback signature — TestPanel wants the partial answers and the
   current violation count so it can persist a Прервать attempt with the
   user's progress at abort time. */
interface TestActiveViewProps {
  questions: TestQuestion[];
  timeLimit?: number;  // ms - undefined → defaults to 1 hour (3 600 000 ms)
  onComplete: (answers: number[], violations: number) => void;
  onCancel: (partialAnswers: (number | null)[], violations: number) => void;
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
  const [proctorReady, setProctorReady] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [violationModal, setViolationModal] = useState<{ reason: string; message: string; count: number } | null>(null);
  const warningTimerRef = useRef<number | null>(null);
  const violationTimerRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  // Countdown timer — only starts after proctoring is ready (camera/mic
  // permissions granted) so the user isn't penalised by time spent on the
  // permission prompt.
  useEffect(() => {
    if (!proctorReady) return;
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
  }, [proctorReady]);

  // Auto-submit on timer expiry
  useEffect(() => {
    if (timeRemaining <= 0 && !completedRef.current) {
      completedRef.current = true;
      onComplete(selectedAnswers.map((a) => a ?? -1), violations);
    }
  }, [timeRemaining, selectedAnswers, violations, onComplete]);

  const handleViolation = useCallback((reason?: string) => {
    setViolations((v) => {
      const next = v + 1;
      const messageMap: Record<string, string> = {
        'audio-loud': 'Слишком громкий звук — крик, разговор или громкая музыка.',
        'camera-covered': 'Камера закрыта или направлена в темноту.',
        'camera-blurry': 'Камера резко потеряла фокус — её задели или закрыли.',
        'face-multiple': 'В кадре больше одного человека.',
        'face-turned': 'Голова повёрнута в сторону — смотрите прямо в камеру.',
        'face-pitch':  'Голова сильно наклонена вверх или вниз — держите лицо фронтально.',
        'eye-gaze':    'Глаза смотрят не в экран — сосредоточьтесь на тесте.',
        'lip-movement': 'Замечено повторное движение губ — вы что-то проговариваете.',
        'object-cell phone': 'В кадре обнаружен телефон. Уберите его из поля камеры.',
        'object-book':       'В кадре обнаружена книга или блокнот.',
        'object-laptop':     'В кадре обнаружен ноутбук.',
        'object-tv':         'В кадре обнаружен монитор или экран.',
        'object-keyboard':   'В кадре обнаружена внешняя клавиатура.',
        'tab-hidden':        'Вы переключились на другую вкладку или окно.',
        'window-blur':       'Окно теста потеряло фокус (Alt+Tab или клик в другое приложение).',
        'devtools':          'Открытие DevTools запрещено во время теста.',
        'copy':              'Копирование вопросов или ответов запрещено.',
        'screenshot':        'Скриншоты и печать страницы запрещены.',
        'alt-tab':           'Переключение окна (Alt+Tab) запрещено.',
        'forbidden-key':     'Использована запрещённая комбинация клавиш.',
        'camera-stopped':    'Вы отключили камеру — тест завершается.',
        'microphone-stopped': 'Вы отключили микрофон — тест завершается.',
        'media-stopped':     'Доступ к камере или микрофону прекращён.',
      };
      const reasonStr = reason ?? '';
      const msg = messageMap[reasonStr]
        ?? (reasonStr.startsWith('object-') ? 'В кадре обнаружен запрещённый предмет.'
        :   'Зафиксировано нарушение регламента теста.');
      setViolationModal({ reason: reasonStr, message: msg, count: next });
      if (violationTimerRef.current) window.clearTimeout(violationTimerRef.current);
      violationTimerRef.current = window.setTimeout(() => setViolationModal(null), 5000);
      return next;
    });
  }, []);

  const handleForceSubmit = useCallback(() => {
    if (!completedRef.current) {
      completedRef.current = true;
      onComplete(selectedAnswers.map((a) => a ?? -1), violations + 1);
    }
  }, [selectedAnswers, violations, onComplete]);

  /** Camera or microphone went away mid-test — proctoring spec requires
   *  immediate termination, no extra warnings. */
  const handleProctorForceEnd = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    // Bump violations so the cooldown side-effect in TestPanel.handleComplete
    // (which checks violations >= 3 for the 48h lockout) records this as a
    // serious event.
    onComplete(selectedAnswers.map((a) => a ?? -1), Math.max(violations + 1, 3));
  }, [selectedAnswers, violations, onComplete]);

  /** Soft warning — sustained loud audio etc. Doesn't bump the counter,
   *  just shows a transient banner so the user can correct themselves. */
  const handleProctorWarning = useCallback((_reason: string, message: string) => {
    setWarning(message);
    if (warningTimerRef.current) window.clearTimeout(warningTimerRef.current);
    warningTimerRef.current = window.setTimeout(() => setWarning(null), 4500);
  }, []);

  useEffect(() => () => {
    if (warningTimerRef.current) window.clearTimeout(warningTimerRef.current);
  }, []);

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

  // Defensive: if currentQ has somehow drifted out of range (e.g. a
  // stale persisted index against a shorter question pool), bail.
  if (!q) return null;

  return (
    <TestGuard
      active={true}
      onViolation={handleViolation}
      onForceSubmit={handleForceSubmit}
      violationCount={violations}
    >
      {/* Camera + microphone proctoring. Mounts on top of the test overlay
           — gates the test until permissions are granted, then live-monitors
           audio + camera frames for suspicious activity. */}
      <Proctoring
        active
        onReadyChange={setProctorReady}
        onViolation={handleViolation}
        onWarning={handleProctorWarning}
        onForceEnd={handleProctorForceEnd}
      />

      {/* Fullscreen overlay during test attempt — hides the course header,
           TOC sidebar and any other navigation. The only way out is the
           "Прервать" confirmation modal that re-uses onCancel. */}
      <div className="test-active" style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: '#FFFFFF',
        overflowY: 'auto',
        padding: 'clamp(14px, 3vw, 32px) clamp(12px, 4vw, 48px) clamp(20px, 4vw, 32px)',
        // While we're waiting for camera/mic permissions, dim the test so
        // the user can't peek at questions before agreeing.
        opacity: proctorReady ? 1 : 0,
        pointerEvents: proctorReady ? undefined : 'none',
      }}>
      <div style={{
        maxWidth: 840, margin: '0 auto',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {/* Soft warning banner — shows when proctoring detects a soft
             issue (loud audio etc.). Auto-dismisses after a few seconds. */}
        <AnimatePresence>
          {warning && (
            <motion.div
              key={warning}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.05, 0.7, 0.1, 1] }}
              style={{
                padding: '10px 14px',
                background: '#FFFBEB',
                border: '1px solid #FCD34D',
                color: '#92400E',
                borderRadius: 10,
                fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 10,
              }}
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"
                style={{ flexShrink: 0 }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>{warning}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HARD violation banner — red, more prominent than warning,
             explains exactly what was violated and shows the running count. */}
        <AnimatePresence>
          {violationModal && (
            <motion.div
              key={violationModal.message + violationModal.count}
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ duration: 0.22, ease: [0.05, 0.7, 0.1, 1] }}
              style={{
                padding: '14px 16px',
                background: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#991B1B',
                borderRadius: 12,
                fontFamily: 'var(--font-body)', fontSize: 13.5,
                display: 'flex', alignItems: 'flex-start', gap: 12,
                boxShadow: '0 6px 16px rgba(220,38,38,0.10)',
              }}
            >
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"
                style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  color: '#B91C1C', marginBottom: 4,
                }}>
                  Нарушение #{violationModal.count} из 3
                </div>
                <div style={{ fontWeight: 600, lineHeight: 1.5 }}>
                  {violationModal.message}
                </div>
                {violationModal.count >= 3 && (
                  <div style={{
                    fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
                    color: '#7F1D1D', marginTop: 6,
                  }}>
                    Это было третье нарушение — тест завершается, повторная попытка через 24 часа.
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  if (violationTimerRef.current) window.clearTimeout(violationTimerRef.current);
                  setViolationModal(null);
                }}
                aria-label="Закрыть"
                style={{
                  width: 24, height: 24, borderRadius: 6,
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: '#991B1B', display: 'inline-flex',
                  alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header panel - matches TestPanel "Прогресс обучения" */}
        <div className="test-active__head" style={{
          padding: 'clamp(14px, 3vw, 20px) clamp(14px, 3vw, 24px)',
          background: '#F5F6F8',
          borderRadius: 14,
          color: '#1A1A1A',
        }}>
          <div className="test-active__head-row" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 10, flexWrap: 'wrap', marginBottom: 12,
          }}>
            <div style={{ minWidth: 0 }}>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
                color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
                marginBottom: 4,
              }}>
                {testLabel}
              </p>
              <h3 style={{
                fontFamily: 'var(--font-display)', fontSize: 'clamp(15px, 4vw, 18px)', fontWeight: 700,
                color: '#1A1A1A', margin: 0, letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
              }}>
                Вопрос {currentQ + 1} из {questions.length}
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
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
              padding: 'clamp(16px, 3vw, 22px) clamp(16px, 3vw, 24px)',
            }}
          >
            <h4 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(14px, 3.6vw, 16px)', fontWeight: 700,
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
                      padding: 'clamp(10px, 2.6vw, 12px) clamp(12px, 3vw, 16px)',
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
                      fontFamily: 'var(--font-body)', fontSize: 'clamp(13px, 3.2vw, 14px)', fontWeight: 500,
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
          gap: 8,
          padding: 'clamp(12px, 3vw, 14px) clamp(14px, 3vw, 24px)',
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
                color: '#6B7280', lineHeight: 1.5, margin: '0 0 14px 0',
              }}>
                Прогресс не сохранится. Ответы на {selectedAnswers.filter(a => a !== null).length} из {questions.length} вопросов будут потеряны.
              </p>
              <div style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 12,
                padding: '12px 14px',
                margin: '0 0 22px 0',
                display: 'flex', alignItems: 'flex-start', gap: 10,
              }}>
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
                  stroke="#B91C1C" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                  style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div style={{
                  fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.5,
                  color: '#991B1B',
                }}>
                  <strong style={{ fontWeight: 700 }}>Тест будет заблокирован на 12 часов.</strong>
                  {' '}Перезайти и пройти этот тест заново можно будет только после окончания этого срока.
                </div>
              </div>
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
                  onClick={() => { setConfirmExit(false); onCancel(selectedAnswers, violations); }}
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
