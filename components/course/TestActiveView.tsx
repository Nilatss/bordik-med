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
      <div className={`test-active fixed inset-0 z-50 bg-white overflow-y-auto pt-[clamp(14px,3vw,32px)] px-[clamp(12px,4vw,48px)] pb-[clamp(20px,4vw,32px)] ${proctorReady ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className="max-w-[840px] mx-auto flex flex-col gap-2.5">
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
              className="py-2.5 px-3.5 bg-[#FFFBEB] border border-[#FCD34D] text-[#92400E] rounded-[10px] font-[var(--font-body)] text-[13px] font-semibold flex items-center gap-2.5"
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"
                className="shrink-0">
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
              className="py-[14px] px-4 bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] rounded-[12px] font-[var(--font-body)] text-[13.5px] flex items-start gap-3 shadow-[0_6px_16px_rgba(220,38,38,0.10)]"
            >
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"
                className="shrink-0 mt-px">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div className="min-w-0 flex-1">
                <div className="font-[var(--font-mono)] text-[10.5px] font-bold tracking-[0.08em] uppercase text-[#B91C1C] mb-1">
                  Нарушение #{violationModal.count} из 3
                </div>
                <div className="font-semibold leading-[1.5]">
                  {violationModal.message}
                </div>
                {violationModal.count >= 3 && (
                  <div className="font-[var(--font-body)] text-xs font-semibold text-[#7F1D1D] mt-1.5">
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
                className="w-6 h-6 rounded-md bg-transparent border-none cursor-pointer text-[#991B1B] inline-flex items-center justify-center shrink-0"
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
        <div className="test-active__head py-[clamp(14px,3vw,20px)] px-[clamp(14px,3vw,24px)] bg-[#F5F6F8] rounded-[14px] text-[#1A1A1A]">
          <div className="test-active__head-row flex items-center justify-between gap-2.5 flex-wrap mb-3">
            <div className="min-w-0">
              <p className="font-[var(--font-mono)] text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-[0.08em] mb-1">
                {testLabel}
              </p>
              <h3 className="font-[var(--font-display)] text-[clamp(15px,4vw,18px)] font-bold text-[#1A1A1A] m-0 tracking-[-0.01em] whitespace-nowrap">
                Вопрос {currentQ + 1} из {questions.length}
              </h3>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <span className={`font-[var(--font-mono)] text-base font-bold ${
                timeRemaining < 60_000
                  ? 'text-[#B91C1C] animate-[bordik-timer-pulse_1s_ease-in-out_infinite]'
                  : timeRemaining < 300_000
                    ? 'text-[#D97706]'
                    : 'text-[#1A1A1A]'
              }`}>
                {formatTimer(timeRemaining)}
              </span>
              {violations > 0 && (
                <span className="py-[3px] px-2 rounded-full bg-[#FEF2F2] text-[#B91C1C] font-[var(--font-mono)] text-[10px] font-bold tracking-[0.04em] uppercase">
                  {violations} нар.
                </span>
              )}
              <button
                onClick={() => setConfirmExit(true)}
                aria-label="Прервать тест"
                title="Прервать тест"
                className="w-8 h-8 rounded-lg bg-transparent hover:bg-[#FEF2F2] text-[#9CA3AF] hover:text-[#B91C1C] border-none cursor-pointer inline-flex items-center justify-center transition-colors duration-[180ms]"
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
          <div className="h-1.5 bg-[#E2E4EA] rounded-full">
            <div
              className="h-full bg-gradient-to-r from-[#10B981] to-[#34D399] rounded-full transition-[width] duration-[400ms] ease w-[var(--progress)]"
              // eslint-disable-next-line react/forbid-dom-props -- dynamic progress %
              style={{ ['--progress' as string]: `${((currentQ + 1) / questions.length) * 100}%` }}
            />
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
            className="bg-[#F5F6F8] rounded-[14px] py-[clamp(16px,3vw,22px)] px-[clamp(16px,3vw,24px)]"
          >
            <h4 className="font-[var(--font-display)] text-[clamp(14px,3.6vw,16px)] font-bold text-[#1A1A1A] mb-[18px] leading-[1.45] tracking-[-0.01em]">
              {q.question}
            </h4>

            <div className="flex flex-col gap-2">
              {q.options.map((option, idx) => {
                const isSelected = selected === idx;
                const letter = String.fromCharCode(65 + idx);
                return (
                  <button
                    key={idx}
                    onClick={() => selectOption(idx)}
                    className={`flex items-center gap-3 py-[clamp(10px,2.6vw,12px)] px-[clamp(12px,3vw,16px)] rounded-[10px] border-none cursor-pointer text-left w-full transition-[box-shadow,background] duration-[180ms] ${
                      isSelected
                        ? 'bg-[#F0F7FF] shadow-[0_0_0_1.5px_#3B82F6,0_1px_2px_rgba(59,130,246,0.08)]'
                        : 'bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_8px_rgba(16,24,40,0.06)]'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center font-[var(--font-display)] text-xs font-bold transition-colors duration-[180ms] ${
                      isSelected ? 'bg-[#3B82F6] text-white' : 'bg-[#F0F1F5] text-[#666]'
                    }`}>
                      {isSelected ? (
                        <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth={3}
                          strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      ) : letter}
                    </span>
                    <span className="font-[var(--font-body)] text-[clamp(13px,3.2vw,14px)] font-medium text-[#1A1A1A] leading-[1.5]">
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center gap-2 py-[clamp(12px,3vw,14px)] px-[clamp(14px,3vw,24px)] bg-[#F5F6F8] rounded-[14px]">
          <button
            onClick={prevQuestion}
            disabled={currentQ === 0}
            className={`inline-flex items-center gap-1.5 py-2 px-4 rounded-[10px] bg-transparent border-none font-[var(--font-body)] text-[13px] font-semibold transition-colors duration-[180ms] ${
              currentQ === 0
                ? 'text-[#C7CAD1] cursor-not-allowed'
                : 'text-[#6B7280] hover:text-[#1A1A1A] cursor-pointer'
            }`}
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
            className={`inline-flex items-center gap-1.5 py-2.5 px-5 rounded-[10px] border-none font-[var(--font-body)] text-[13px] font-semibold transition-colors duration-[180ms] ${
              selected !== null
                ? 'bg-[#3B82F6] hover:bg-[#2563EB] text-white cursor-pointer'
                : 'bg-[#E2E4EA] text-[#9CA3AF] cursor-not-allowed'
            }`}
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
            className="fixed inset-0 z-[1000] bg-[rgba(15,23,42,0.55)] backdrop-blur-[2px] flex items-center justify-center p-6"
            onClick={() => setConfirmExit(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.22, ease: [0.05, 0.7, 0.1, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[16px] pt-7 px-7 pb-[22px] max-w-[400px] w-full shadow-[0_24px_48px_rgba(15,23,42,0.24)]"
            >
              <h3 className="font-[var(--font-display)] text-lg font-bold text-[#1A1A1A] mt-0 mb-2 mx-0 tracking-[-0.01em]">
                Прервать тест?
              </h3>
              <p className="font-[var(--font-body)] text-sm font-normal text-[#6B7280] leading-[1.5] mt-0 mb-[14px] mx-0">
                Прогресс не сохранится. Ответы на {selectedAnswers.filter(a => a !== null).length} из {questions.length} вопросов будут потеряны.
              </p>
              <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-[12px] py-3 px-3.5 mt-0 mb-[22px] mx-0 flex items-start gap-2.5">
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
                  stroke="#B91C1C" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                  className="shrink-0 mt-px">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div className="font-[var(--font-body)] text-[13px] leading-[1.5] text-[#991B1B]">
                  <strong className="font-bold">Тест будет заблокирован на 12 часов.</strong>
                  {' '}Перезайти и пройти этот тест заново можно будет только после окончания этого срока.
                </div>
              </div>
              <div className="flex gap-2.5 justify-end">
                <button
                  onClick={() => setConfirmExit(false)}
                  className="py-2.5 px-[18px] rounded-[10px] bg-[#F5F6F8] hover:bg-[#E2E4EA] text-[#1A1A1A] border-none cursor-pointer font-[var(--font-body)] text-[13px] font-semibold transition-colors duration-[180ms]"
                >
                  Продолжить тест
                </button>
                <button
                  onClick={() => { setConfirmExit(false); onCancel(selectedAnswers, violations); }}
                  className="py-2.5 px-[18px] rounded-[10px] bg-[#B91C1C] hover:bg-[#991B1B] text-white border-none cursor-pointer font-[var(--font-body)] text-[13px] font-semibold transition-colors duration-[180ms]"
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
