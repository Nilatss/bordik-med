'use client';

/**
 * ApgarTimer — fullscreen timer для оценки Apgar score у новорождённого
 * с тактильным feedback на ключевых отметках 60 / 300 / 600 sec
 * (1, 5, 10 мин — стандартные точки оценки по AAP/ACOG 2015 + NRP 8 ed.).
 *
 * Audit 1.9 — closes Apgar timer UI gap.
 *
 * Features:
 *   - Fullscreen mode (display:fixed) — занимает весь viewport
 *   - Большой шрифт m:ss (для visibility с расстояния)
 *   - Start/Pause/Reset controls
 *   - Tactile feedback (navigator.vibrate) at 60/180/300/600 sec
 *   - Audio beep alerts at 60/300/600 sec
 *   - Visual highlight активной mark
 *   - Quick Apgar input form для recording scores @ 1/5/10 min
 *   - Copy результатов to clipboard
 *
 * UX выровнена под standard delivery room workflow: акушерка
 * запускает таймер при рождении, на каждой отметке оценивает Apgar,
 * вводит scores, в конце копирует summary в карту.
 */

import { useState, useEffect, useRef, useCallback, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ApgarScore {
  appearance: number;  // 0-2 цвет кожи
  pulse: number;        // 0-2 ЧСС
  grimace: number;      // 0-2 рефлекс на стимуляцию
  activity: number;     // 0-2 мышечный тонус
  respiration: number;  // 0-2 дыхание
}

interface ApgarReading {
  minute: 1 | 5 | 10;
  score: ApgarScore;
  total: number;
  timestamp: number; // sec from start
}

const MARKS = [
  { sec: 60, label: '1 мин', minute: 1 as const, type: 'apgar' },
  { sec: 180, label: '3 мин (re-eval)', minute: null, type: 'reeval' },
  { sec: 300, label: '5 мин', minute: 5 as const, type: 'apgar' },
  { sec: 600, label: '10 мин', minute: 10 as const, type: 'apgar' },
];

export default function ApgarTimer({ onClose }: { onClose: () => void }) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [readings, setReadings] = useState<ApgarReading[]>([]);
  const [scoring, setScoring] = useState<{ minute: 1 | 5 | 10; score: ApgarScore } | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastBeepRef = useRef<number>(-1);
  const beepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleId = useId();
  const scoringTitleId = useId();

  // Initialize AudioContext on first user interaction
  const ensureAudioCtx = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (audioCtxRef.current) return audioCtxRef.current;
    try {
      const Ctor = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
      if (Ctor) {
        audioCtxRef.current = new Ctor();
        return audioCtxRef.current;
      }
    } catch { /* no audio support */ }
    return null;
  }, []);

  const beep = useCallback((freq: number, duration: number) => {
    const ctx = ensureAudioCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.value = 0.25;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration / 1000);
    } catch { /* Audit B-9: WebAudio API can throw if the AudioContext was
      auto-suspended by the browser (Safari pre-interaction) or the page
      lost focus. Beep is purely a UX cue — silent on failure is fine,
      Sentry log would be noise as this fails routinely. */ }
  }, [ensureAudioCtx]);

  const triggerHaptic = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate?.([200, 100, 200, 100, 200]); } catch {
        /* Audit B-9: vibrate() rejects on Permissions-Policy block or
           iOS Safari (never supported). Documented browser limitations,
           not actionable signals. */
      }
    }
  }, []);

  // Release the AudioContext on unmount. Browsers cap concurrent contexts
  // (~6 in Chrome); repeatedly opening/closing the Apgar timer in one
  // session would otherwise leak them until beeps go silent.
  // Also clear any pending delayed-beep timer so it cannot fire after unmount
  // and create a new AudioContext outside the component's lifecycle.
  useEffect(() => () => {
    if (beepTimerRef.current !== null) {
      clearTimeout(beepTimerRef.current);
      beepTimerRef.current = null;
    }
    audioCtxRef.current?.close().catch(() => { /* already closed / unsupported */ });
    audioCtxRef.current = null;
  }, []);

  const triggerMark = useCallback((markSec: number) => {
    triggerHaptic();
    // Different beep frequency for each mark for distinguishability
    if (markSec === 60) beep(880, 250);       // A5
    else if (markSec === 180) beep(660, 200); // E5
    else if (markSec === 300) beep(880, 350); // A5 longer
    else if (markSec === 600) {
      beep(880, 200);
      beepTimerRef.current = setTimeout(() => beep(1100, 400), 250); // C#6 climbing
    }
  }, [beep, triggerHaptic]);

  // Esc key closes the timer (or scoring modal first)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (scoring) {
        setScoring(null);
      } else {
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, scoring]);

  // Timer loop
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setElapsed((s) => {
          const next = s + 1;
          // Trigger haptic+audio at each mark exactly once
          for (const m of MARKS) {
            if (next === m.sec && lastBeepRef.current !== m.sec) {
              lastBeepRef.current = m.sec;
              triggerMark(m.sec);
              break;
            }
          }
          return next;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, triggerMark]);

  const handleStart = () => {
    ensureAudioCtx(); // unlock audio on user gesture
    setRunning(!running);
  };

  const handleReset = () => {
    setRunning(false);
    setElapsed(0);
    lastBeepRef.current = -1;
    setReadings([]);
    setScoring(null);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const openScoringForm = (minute: 1 | 5 | 10) => {
    setScoring({
      minute,
      score: { appearance: 2, pulse: 2, grimace: 2, activity: 2, respiration: 2 },
    });
  };

  const submitScoring = () => {
    if (!scoring) return;
    const { minute, score } = scoring;
    const total = score.appearance + score.pulse + score.grimace + score.activity + score.respiration;
    const reading: ApgarReading = { minute, score, total, timestamp: elapsed };
    setReadings((prev) => [...prev.filter((r) => r.minute !== minute), reading].sort((a, b) => a.minute - b.minute));
    setScoring(null);
  };

  const copySummary = useCallback(() => {
    const lines = readings.map((r) => `Apgar ${r.minute} мин = ${r.total}/10 (A${r.score.appearance} P${r.score.pulse} G${r.score.grimace} A${r.score.activity} R${r.score.respiration})`);
    const text = `Apgar — оценка новорождённого\n${lines.join('\n')}`;
    if (typeof navigator !== 'undefined' && 'clipboard' in navigator) {
      // Audit B-9: clipboard.writeText() is denied without secure context
      // or when document is not focused. The fallback would be a "select +
      // Ctrl+C" hint, but the typical NICU clinician copies manually if it
      // fails — silent is fine, no Sentry value.
      navigator.clipboard?.writeText(text).catch(() => { /* docs: silent ok */ });
    }
  }, [readings]);

  const interpretApgar = (total: number): { color: string; label: string } => {
    if (total >= 7) return { color: '#10B981', label: 'нормальная' };
    if (total >= 4) return { color: '#F59E0B', label: 'умеренная депрессия' };
    return { color: '#DC2626', label: 'тяжёлая депрессия' };
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 bg-[#0F172A] text-white z-[9999] flex flex-col p-6 overflow-auto"
    >
      {/* Top bar — close button + tab title */}
      <div className="flex justify-between items-center mb-5">
        <h2 id={titleId} className="font-[var(--font-display)] text-lg font-bold tracking-[-0.01em] m-0">
          Apgar Timer — оценка новорождённого
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть Apgar Timer"
          className="py-2 px-3.5 bg-white/10 text-white border-none rounded-lg cursor-pointer text-[13px] font-medium font-[inherit] inline-flex items-center gap-1.5"
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true" focusable="false">
            <line x1={18} y1={6} x2={6} y2={18} />
            <line x1={6} y1={6} x2={18} y2={18} />
          </svg>
          Закрыть
        </button>
      </div>

      {/* Main timer display */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div
          role="timer"
          aria-live="off"
          aria-atomic="true"
          aria-label={`Прошло ${Math.floor(elapsed / 60)} минут ${elapsed % 60} секунд`}
          className={`text-[clamp(96px,25vw,220px)] font-bold font-[var(--font-mono,monospace)] leading-none tracking-[-0.04em] transition-colors duration-200 ${running ? 'text-white' : 'text-[#94A3B8]'}`}
        >
          {formatTime(elapsed)}
        </div>

        {/* Controls */}
        <div className="flex gap-3 flex-wrap justify-center">
          <button
            type="button"
            onClick={handleStart}
            aria-pressed={running}
            aria-label={running ? 'Пауза таймера' : (elapsed === 0 ? 'Старт таймера' : 'Продолжить таймер')}
            className={`py-[14px] px-8 text-white border-none rounded-[12px] cursor-pointer text-lg font-bold font-[inherit] min-w-[140px] ${running ? 'bg-[#EF4444]' : 'bg-[#10B981]'}`}
          >
            {running ? 'Пауза' : (elapsed === 0 ? 'Старт' : 'Продолжить')}
          </button>
          <button
            type="button"
            onClick={handleReset}
            aria-label="Сбросить таймер и оценки"
            className="py-[14px] px-7 bg-white/10 text-white border-none rounded-[12px] cursor-pointer text-base font-medium font-[inherit]"
          >
            Сброс
          </button>
        </div>

        {/* Mark indicators */}
        <div
          role="group"
          aria-label="Отметки оценки Apgar"
          className="flex gap-2.5 flex-wrap justify-center mt-3"
        >
          {MARKS.map((m) => {
            const reached = elapsed >= m.sec;
            const active = elapsed === m.sec;
            const reading = m.minute ? readings.find((r) => r.minute === m.minute) : null;
            const intent = reading ? interpretApgar(reading.total) : null;
            const ariaLabel = m.minute
              ? (reading
                ? `${m.label}: оценка ${reading.total} из 10, ${interpretApgar(reading.total).label}. Нажмите чтобы изменить.`
                : `${m.label}: ввести оценку Apgar`)
              : `${m.label}: повторная оценка состояния`;
            const markStateClass = active
              ? 'bg-[#FACC15] text-[#0F172A] border-2 border-[#FACC15]'
              : reached
                ? 'bg-[rgba(16,185,129,0.18)] text-white border-2 border-transparent'
                : 'bg-white/[0.08] text-white border-2 border-transparent';
            return (
              <button
                key={m.sec}
                type="button"
                onClick={() => m.minute && openScoringForm(m.minute)}
                disabled={!m.minute}
                aria-label={ariaLabel}
                aria-current={active ? 'time' : undefined}
                className={`py-3 px-4 rounded-[10px] ${m.minute ? 'cursor-pointer' : 'cursor-default'} text-[13px] font-semibold font-[inherit] flex flex-col items-center gap-1 min-w-[110px] ${markStateClass}`}
              >
                <span aria-hidden="true" className="font-[var(--font-mono)] text-[11px] tracking-[0.05em] opacity-70">
                  {m.label.toUpperCase()}
                </span>
                {reading && intent ? (
                  <span
                    aria-hidden="true"
                    className="text-lg font-bold text-[var(--apgar-intent-color)]"
                    // eslint-disable-next-line react/forbid-dom-props -- dynamic intent color
                    style={{ ['--apgar-intent-color' as string]: intent.color }}
                  >
                    {reading.total}/10
                  </span>
                ) : (
                  <span aria-hidden="true" className="text-[13px] opacity-70">
                    {m.minute ? 'tap для ввода' : 're-eval'}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Apgar interpretation */}
        {readings.length > 0 && (
          <section
            aria-label="Сводка оценок Apgar"
            aria-live="polite"
            className="mt-4 py-[14px] px-[18px] bg-white/[0.06] rounded-[10px] max-w-[600px]"
          >
            <div className="text-[11px] font-bold tracking-[0.06em] uppercase text-[#94A3B8] mb-2 font-[var(--font-mono)]">
              Сводка
            </div>
            {readings.map((r, idx) => {
              const intent = interpretApgar(r.total);
              return (
                <div
                  key={r.minute}
                  role="status"
                  className={`flex justify-between items-center py-1.5 text-sm ${idx === 0 ? 'border-t-0' : 'border-t border-white/[0.08]'}`}
                >
                  <span>
                    <strong>{r.minute} мин:</strong> {r.total}/10
                    <span className="ml-2.5 text-[#94A3B8]">
                      A{r.score.appearance} P{r.score.pulse} G{r.score.grimace} A{r.score.activity} R{r.score.respiration}
                    </span>
                  </span>
                  <span
                    className="inline-flex items-center py-1 px-[var(--space-2)] rounded-[var(--md-sys-shape-corner-full)] bg-white/[0.10] font-[var(--font-mono)] text-[0.625rem] font-semibold uppercase tracking-[0.04em] whitespace-nowrap text-[var(--apgar-intent-color)]"
                    // eslint-disable-next-line react/forbid-dom-props -- dynamic intent color
                    style={{ ['--apgar-intent-color' as string]: intent.color }}
                  >
                    {intent.label.toUpperCase()}
                  </span>
                </div>
              );
            })}
            <button
              type="button"
              onClick={copySummary}
              aria-label="Копировать сводку оценок Apgar в буфер обмена"
              className="mt-2.5 py-2 px-3.5 bg-[#2563EB] text-white border-none rounded-lg cursor-pointer text-xs font-semibold font-[inherit]"
            >
              Копировать в буфер
            </button>
          </section>
        )}
      </div>

      {/* Footer disclaimer */}
      <div className="mt-4 py-2.5 px-3.5 text-[11px] text-[#94A3B8] text-center leading-[1.45]">
        Тактильный feedback и звук на отметках 1, 3, 5, 10 мин. AAP/ACOG 2015 + NRP 8 ed. 2021.
        Apgar score не используется для решения о реанимации (использовать NRP алгоритм).
      </div>

      {/* Scoring modal */}
      <AnimatePresence>
        {scoring && (() => {
          const total = scoring.score.appearance + scoring.score.pulse + scoring.score.grimace + scoring.score.activity + scoring.score.respiration;
          const intent = interpretApgar(total);
          return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[10000] flex items-center justify-center p-4"
            onClick={() => setScoring(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={scoringTitleId}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white text-[#1A1A1A] rounded-[16px] p-6 max-w-[460px] w-full max-h-[90vh] overflow-y-auto"
            >
              <h3 id={scoringTitleId} className="font-[var(--font-display)] text-lg font-bold mt-0 mb-1 mx-0">
                Apgar — {scoring.minute} мин
              </h3>
              <p className="text-xs text-[#6B7280] mt-0 mb-4 mx-0">
                Выберите 0/1/2 для каждого критерия
              </p>

              {([
                { key: 'appearance', label: 'Внешний вид (цвет кожи)', options: ['Бледный/синюшный', 'Розовый туловище, синюшный конечности', 'Полностью розовый'] },
                { key: 'pulse', label: 'Пульс / ЧСС', options: ['Отсутствует', '< 100/мин', '≥ 100/мин'] },
                { key: 'grimace', label: 'Гримаса (реакция на стимуляцию)', options: ['Нет', 'Гримаса', 'Кашель / чихание / крик'] },
                { key: 'activity', label: 'Активность (мышечный тонус)', options: ['Дряблый', 'Лёгкое сгибание', 'Активные движения'] },
                { key: 'respiration', label: 'Дыхание', options: ['Отсутствует', 'Нерегулярное / слабый крик', 'Хороший громкий крик'] },
              ] as const).map((row) => {
                const groupId = `apgar-${row.key}-group`;
                return (
                  <div key={row.key} className="mb-[14px]" role="radiogroup" aria-labelledby={groupId}>
                    <div id={groupId} className="text-[13px] font-semibold mb-1.5 text-[#374151]">
                      {row.label}
                    </div>
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((v) => {
                        const selected = scoring.score[row.key] === v;
                        return (
                          <button
                            key={v}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            aria-label={`${v} баллов: ${row.options[v]}`}
                            onClick={() => setScoring({
                              ...scoring,
                              score: { ...scoring.score, [row.key]: v },
                            })}
                            className={`flex-1 py-2.5 px-2 border-none rounded-lg cursor-pointer text-xs font-medium font-[inherit] leading-[1.3] text-left ${selected ? 'bg-[#2563EB] text-white' : 'bg-[#F5F6F8] text-[#374151]'}`}
                          >
                            <strong aria-hidden="true" className="text-lg block mb-0.5">{v}</strong>
                            <span aria-hidden="true">{row.options[v]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Total preview */}
              <div
                role="status"
                aria-live="polite"
                className="py-3 px-[14px] bg-[#EFF6FF] rounded-[10px] mb-4 flex justify-between items-center"
              >
                <span className="text-[13px] text-[#1E40AF] font-semibold">
                  Итого: {total} / 10
                </span>
                <span
                  className="text-[11px] font-bold text-[var(--apgar-intent-color)]"
                  // eslint-disable-next-line react/forbid-dom-props -- dynamic intent color
                  style={{ ['--apgar-intent-color' as string]: intent.color }}
                >
                  {intent.label.toUpperCase()}
                </span>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setScoring(null)}
                  className="py-2.5 px-5 bg-[#F5F6F8] text-[#374151] border-none rounded-lg cursor-pointer text-[13px] font-medium font-[inherit]"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={submitScoring}
                  className="py-2.5 px-5 bg-[#10B981] text-white border-none rounded-lg cursor-pointer text-[13px] font-semibold font-[inherit]"
                >
                  Сохранить
                </button>
              </div>
            </motion.div>
          </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
