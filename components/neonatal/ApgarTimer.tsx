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
    } catch { /* swallow audio errors */ }
  }, [ensureAudioCtx]);

  const triggerHaptic = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate?.([200, 100, 200, 100, 200]); } catch { /* ignore */ }
    }
  }, []);

  const triggerMark = useCallback((markSec: number) => {
    triggerHaptic();
    // Different beep frequency for each mark for distinguishability
    if (markSec === 60) beep(880, 250);       // A5
    else if (markSec === 180) beep(660, 200); // E5
    else if (markSec === 300) beep(880, 350); // A5 longer
    else if (markSec === 600) {
      beep(880, 200);
      setTimeout(() => beep(1100, 400), 250); // C#6 climbing
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
      navigator.clipboard?.writeText(text).catch(() => { /* ignore */ });
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
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: '#0F172A',
        color: '#FFFFFF',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        overflow: 'auto',
      }}
    >
      {/* Top bar — close button + tab title */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
      }}>
        <h2 id={titleId} style={{
          fontFamily: 'var(--font-display)',
          fontSize: 18, fontWeight: 700,
          letterSpacing: '-0.01em',
          margin: 0,
        }}>
          Apgar Timer — оценка новорождённого
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть Apgar Timer"
          style={{
            padding: '8px 14px',
            background: 'rgba(255,255,255,0.12)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
            fontFamily: 'inherit',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
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
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
      }}>
        <div
          role="timer"
          aria-live="off"
          aria-atomic="true"
          aria-label={`Прошло ${Math.floor(elapsed / 60)} минут ${elapsed % 60} секунд`}
          style={{
            fontSize: 'clamp(96px, 25vw, 220px)',
            fontWeight: 700,
            fontFamily: 'var(--font-mono, monospace)',
            lineHeight: 1,
            letterSpacing: '-0.04em',
            color: running ? '#FFFFFF' : '#94A3B8',
            transition: 'color 200ms',
          }}
        >
          {formatTime(elapsed)}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={handleStart}
            aria-pressed={running}
            aria-label={running ? 'Пауза таймера' : (elapsed === 0 ? 'Старт таймера' : 'Продолжить таймер')}
            style={{
              padding: '14px 32px',
              background: running ? '#EF4444' : '#10B981',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 12,
              cursor: 'pointer',
              fontSize: 18,
              fontWeight: 700,
              fontFamily: 'inherit',
              minWidth: 140,
            }}
          >
            {running ? 'Пауза' : (elapsed === 0 ? 'Старт' : 'Продолжить')}
          </button>
          <button
            type="button"
            onClick={handleReset}
            aria-label="Сбросить таймер и оценки"
            style={{
              padding: '14px 28px',
              background: 'rgba(255,255,255,0.12)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 12,
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 500,
              fontFamily: 'inherit',
            }}
          >
            Сброс
          </button>
        </div>

        {/* Mark indicators */}
        <div
          role="group"
          aria-label="Отметки оценки Apgar"
          style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginTop: 12,
          }}
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
            return (
              <button
                key={m.sec}
                type="button"
                onClick={() => m.minute && openScoringForm(m.minute)}
                disabled={!m.minute}
                aria-label={ariaLabel}
                aria-current={active ? 'time' : undefined}
                style={{
                  padding: '12px 16px',
                  background: active ? '#FACC15' : (reached ? 'rgba(16,185,129,0.18)' : 'rgba(255,255,255,0.08)'),
                  color: active ? '#0F172A' : '#FFFFFF',
                  border: active ? '2px solid #FACC15' : '2px solid transparent',
                  borderRadius: 10,
                  cursor: m.minute ? 'pointer' : 'default',
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  minWidth: 110,
                }}
              >
                <span aria-hidden="true" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.05em', opacity: 0.7 }}>
                  {m.label.toUpperCase()}
                </span>
                {reading && intent ? (
                  <span aria-hidden="true" style={{
                    fontSize: 18,
                    color: intent.color,
                    fontWeight: 700,
                  }}>
                    {reading.total}/10
                  </span>
                ) : (
                  <span aria-hidden="true" style={{ fontSize: 13, opacity: 0.7 }}>
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
            style={{
              marginTop: 16,
              padding: '14px 18px',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: 10,
              maxWidth: 600,
            }}
          >
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
              textTransform: 'uppercase', color: '#94A3B8',
              marginBottom: 8,
              fontFamily: 'var(--font-mono)',
            }}>
              Сводка
            </div>
            {readings.map((r) => {
              const intent = interpretApgar(r.total);
              return (
                <div
                  key={r.minute}
                  role="status"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 0',
                    fontSize: 14,
                    borderTop: r.minute === readings[0]?.minute ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <span>
                    <strong>{r.minute} мин:</strong> {r.total}/10
                    <span style={{ marginLeft: 10, color: '#94A3B8' }}>
                      A{r.score.appearance} P{r.score.pulse} G{r.score.grimace} A{r.score.activity} R{r.score.respiration}
                    </span>
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: intent.color,
                    padding: '2px 8px',
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: 4,
                  }}>
                    {intent.label.toUpperCase()}
                  </span>
                </div>
              );
            })}
            <button
              type="button"
              onClick={copySummary}
              aria-label="Копировать сводку оценок Apgar в буфер обмена"
              style={{
                marginTop: 10,
                padding: '8px 14px',
                background: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'inherit',
              }}
            >
              Копировать в буфер
            </button>
          </section>
        )}
      </div>

      {/* Footer disclaimer */}
      <div style={{
        marginTop: 16,
        padding: '10px 14px',
        fontSize: 11, color: '#94A3B8',
        textAlign: 'center',
        lineHeight: 1.45,
      }}>
        Тактильный feedback и звук на отметках 1, 3, 5, 10 мин. AAP/ACOG 2015 + NRP 8 ed. 2021.
        Apgar score не используется для решения о реанимации (использовать NRP алгоритм).
      </div>

      {/* Scoring modal */}
      <AnimatePresence>
        {scoring && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.6)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
            }}
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
              style={{
                background: '#FFFFFF',
                color: '#1A1A1A',
                borderRadius: 16,
                padding: 24,
                maxWidth: 460,
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              <h3 id={scoringTitleId} style={{
                fontFamily: 'var(--font-display)',
                fontSize: 18, fontWeight: 700,
                margin: '0 0 4px',
              }}>
                Apgar — {scoring.minute} мин
              </h3>
              <p style={{
                fontSize: 12, color: '#6B7280',
                margin: '0 0 16px',
              }}>
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
                  <div key={row.key} style={{ marginBottom: 14 }} role="radiogroup" aria-labelledby={groupId}>
                    <div id={groupId} style={{
                      fontSize: 13, fontWeight: 600,
                      marginBottom: 6,
                      color: '#374151',
                    }}>
                      {row.label}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
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
                            style={{
                              flex: 1,
                              padding: '10px 8px',
                              background: selected ? '#2563EB' : '#F5F6F8',
                              color: selected ? '#FFFFFF' : '#374151',
                              border: 'none',
                              borderRadius: 8,
                              cursor: 'pointer',
                              fontSize: 12,
                              fontWeight: 500,
                              fontFamily: 'inherit',
                              lineHeight: 1.3,
                              textAlign: 'left',
                            }}
                          >
                            <strong aria-hidden="true" style={{ fontSize: 18, display: 'block', marginBottom: 2 }}>{v}</strong>
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
                style={{
                  padding: '12px 14px',
                  background: '#EFF6FF',
                  borderRadius: 10,
                  marginBottom: 16,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 13, color: '#1E40AF', fontWeight: 600 }}>
                  Итого: {scoring.score.appearance + scoring.score.pulse + scoring.score.grimace + scoring.score.activity + scoring.score.respiration} / 10
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: interpretApgar(
                    scoring.score.appearance + scoring.score.pulse + scoring.score.grimace + scoring.score.activity + scoring.score.respiration
                  ).color,
                }}>
                  {interpretApgar(
                    scoring.score.appearance + scoring.score.pulse + scoring.score.grimace + scoring.score.activity + scoring.score.respiration
                  ).label.toUpperCase()}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setScoring(null)}
                  style={{
                    padding: '10px 20px',
                    background: '#F5F6F8',
                    color: '#374151',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500,
                    fontFamily: 'inherit',
                  }}
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={submitScoring}
                  style={{
                    padding: '10px 20px',
                    background: '#10B981',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: 'inherit',
                  }}
                >
                  Сохранить
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
