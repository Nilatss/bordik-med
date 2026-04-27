'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { MAX_VIOLATIONS } from '@/lib/quiz';

interface TestGuardProps {
  active: boolean;
  onViolation: () => void;
  onForceSubmit: () => void;
  violationCount: number;
  children: React.ReactNode;
}

const GRACE_MS = 5_000;

/* Keys that indicate "leaving" the test surface — screenshot, devtools,
 * print, copy, save-page, alt-tab. Pressing any of them counts as an
 * immediate violation (no grace period — the action already happened). */
function isViolationKey(e: KeyboardEvent): boolean {
  // PrintScreen / Snipping-tool win+shift+s
  if (e.key === 'PrintScreen') return true;
  // F12 (devtools)
  if (e.key === 'F12') return true;
  // Ctrl/Cmd + (C copy, P print, S save, U view-source, A select-all)
  const mod = e.ctrlKey || e.metaKey;
  if (mod && ['c', 'p', 's', 'u', 'a'].includes(e.key.toLowerCase())) return true;
  // Ctrl+Shift+(I devtools, J devtools-console, C inspect, S full-page-screenshot)
  if (mod && e.shiftKey && ['I', 'J', 'C', 'S'].includes(e.key.toUpperCase())) return true;
  // Alt+Tab / Cmd+Tab — these usually generate a window blur instead, but
  // we also catch them here as a safety net in case the OS surfaces them.
  if ((e.altKey || e.metaKey) && e.key === 'Tab') return true;
  return false;
}

/**
 * Anti-cheat wrapper for active tests.
 *
 * Flow:
 *  1. `visibilitychange` / window `blur` → start grace countdown (5 s) and
 *     show "away" overlay with timer.
 *  2. Forbidden keypress (PrintScreen / F12 / Ctrl-C / Ctrl-P / etc.)
 *     → instant violation, no grace.
 *  3. If the user returns before 5 s elapse → cancel timer, no violation.
 *  4. If 5 s elapse away → increment violationCount and show modal.
 *  5. At MAX_VIOLATIONS (3) → call onForceSubmit (test ends with penalty).
 *
 * We intentionally do NOT try to go fullscreen in the new design — it clashed
 * with the consent flow and was easy to exit anyway.
 */
export default function TestGuard({ active, onViolation, onForceSubmit, violationCount, children }: TestGuardProps) {
  const [showViolation, setShowViolation] = useState(false);
  const [graceLeft, setGraceLeft] = useState(0);   // seconds remaining, 0 = not running
  const [justReturned, setJustReturned] = useState(false);
  const graceTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const graceStartRef = useRef<number>(0);

  // Stop grace countdown helper
  const stopGrace = useCallback(() => {
    if (graceTickRef.current) {
      clearInterval(graceTickRef.current);
      graceTickRef.current = null;
    }
    setGraceLeft(0);
    graceStartRef.current = 0;
  }, []);

  useEffect(() => {
    if (!active) return;

    const startGrace = () => {
      if (graceTickRef.current) return; // already running
      graceStartRef.current = Date.now();
      setGraceLeft(Math.ceil(GRACE_MS / 1000));

      graceTickRef.current = setInterval(() => {
        const elapsed = Date.now() - graceStartRef.current;
        const secondsLeft = Math.max(0, Math.ceil((GRACE_MS - elapsed) / 1000));
        setGraceLeft(secondsLeft);
        if (elapsed >= GRACE_MS) {
          // Grace expired → real violation
          if (graceTickRef.current) clearInterval(graceTickRef.current);
          graceTickRef.current = null;
          setGraceLeft(0);
          onViolation();
          setShowViolation(true);
        }
      }, 200);
    };

    const cancelGrace = () => {
      if (!graceTickRef.current) return;
      clearInterval(graceTickRef.current);
      graceTickRef.current = null;
      setGraceLeft(0);
      graceStartRef.current = 0;
      // brief "you returned" banner
      setJustReturned(true);
      setTimeout(() => setJustReturned(false), 3000);
    };

    // Switching tabs / minimising the window / losing focus is now an
    // instant violation — no grace countdown. The user explicitly asked
    // that tab-switching count toward the cheat counter immediately.
    const fireVisibilityViolation = () => {
      if (graceTickRef.current) {
        clearInterval(graceTickRef.current);
        graceTickRef.current = null;
        setGraceLeft(0);
        graceStartRef.current = 0;
      }
      onViolation();
      setShowViolation(true);
    };
    const handleVisibility = () => {
      if (document.hidden) fireVisibilityViolation();
    };
    const handleBlur = () => {
      fireVisibilityViolation();
    };
    const handleFocus = () => {
      // returning to the tab no longer cancels anything — the violation
      // already fired the moment the user left.
    };

    // Forbidden-key listener — instant violation, no grace.
    const handleKeydown = (e: KeyboardEvent) => {
      if (!isViolationKey(e)) return;
      e.preventDefault();
      // If a grace countdown is running, cancel it first so this key doesn't
      // double-count alongside the imminent timer expiry.
      if (graceTickRef.current) {
        clearInterval(graceTickRef.current);
        graceTickRef.current = null;
        setGraceLeft(0);
        graceStartRef.current = 0;
      }
      onViolation();
      setShowViolation(true);
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('keydown', handleKeydown, true); // capture phase

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('keydown', handleKeydown, true);
      stopGrace();
    };
  }, [active, onViolation, stopGrace]);

  // Force submit after max violations
  useEffect(() => {
    if (active && violationCount >= MAX_VIOLATIONS) {
      onForceSubmit();
    }
  }, [active, violationCount, onForceSubmit]);

  const dismiss = useCallback(() => setShowViolation(false), []);

  return (
    <>
      {children}

      {/* Grace-period countdown: user has left, must return before timer ends */}
      {active && graceLeft > 0 && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(15, 20, 30, 0.65)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
          animation: 'bordik-dropdown-fadein 200ms ease-out',
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: 20,
            padding: '32px 36px',
            maxWidth: 440, width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', borderRadius: 999,
              background: '#FEF2F2', color: '#B91C1C',
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              marginBottom: 18,
            }}>
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" />
              </svg>
              Вернитесь в окно теста
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 52, fontWeight: 700,
              color: graceLeft <= 3 ? '#B91C1C' : '#1A1A1A',
              lineHeight: 1, marginBottom: 12,
              letterSpacing: '-0.04em',
              animation: graceLeft <= 3 ? 'bordik-timer-pulse 1s ease-in-out infinite' : undefined,
            }}>
              {graceLeft}
            </div>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 14,
              color: '#6B7280', lineHeight: 1.5,
              maxWidth: 340, margin: '0 auto',
            }}>
              Если вы не вернётесь за {graceLeft} сек - нарушение будет засчитано.
              Снимки экрана, devtools, копирование и закрытие вкладки тоже считаются нарушением.
            </p>
          </div>
        </div>
      )}

      {/* The old "Вернулись" toast was removed — tab switching now counts
           as an instant violation, so there's no "return" event to greet. */}

      {/* Real violation modal (after grace expired) */}
      {showViolation && active && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(15,20,30,0.55)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
          animation: 'bordik-dropdown-fadein 200ms ease-out',
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: 20,
            padding: '32px 36px',
            maxWidth: 440, width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.12)',
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', borderRadius: 999,
              background: violationCount >= MAX_VIOLATIONS ? '#FEF2F2' : '#FFFBEB',
              color: violationCount >= MAX_VIOLATIONS ? '#B91C1C' : '#B45309',
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              marginBottom: 18,
            }}>
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              {violationCount >= MAX_VIOLATIONS ? 'Тест завершается' : 'Нарушение зафиксировано'}
            </div>

            <h3 style={{
              fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
              color: '#1A1A1A', marginBottom: 8,
              letterSpacing: '-0.02em',
            }}>
              Вы покинули окно теста
            </h3>

            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 14,
              color: '#6B7280', lineHeight: 1.55,
              marginBottom: 20,
              maxWidth: 340, marginLeft: 'auto', marginRight: 'auto',
            }}>
              Вы либо покинули окно теста дольше чем на {Math.round(GRACE_MS / 1000)} секунд, либо нажали запрещённое сочетание клавиш (PrintScreen, F12, Ctrl+C / P / S и т.п.). Нарушение засчитано.
            </p>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 10, marginBottom: 24,
            }}>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
                color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                Нарушений
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                {Array.from({ length: MAX_VIOLATIONS }).map((_, i) => {
                  const filled = i < violationCount;
                  return (
                    <span key={i} style={{
                      width: 10, height: 10, borderRadius: '50%',
                      background: filled
                        ? (violationCount >= MAX_VIOLATIONS ? '#EF4444' : '#F59E0B')
                        : '#E5E7EB',
                      transition: 'background 200ms',
                    }} />
                  );
                })}
              </div>
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
                color: violationCount >= MAX_VIOLATIONS ? '#B91C1C' : '#1A1A1A',
              }}>
                {violationCount} / {MAX_VIOLATIONS}
              </span>
            </div>

            {violationCount >= MAX_VIOLATIONS ? (
              <div style={{
                padding: '12px 16px',
                background: '#FEF2F2',
                borderRadius: 10,
                fontFamily: 'var(--font-body)', fontSize: 13,
                color: '#B91C1C', fontWeight: 600,
              }}>
                Максимум нарушений. Тест завершён. Повторная попытка через 48 часов.
              </div>
            ) : (
              <button onClick={dismiss} style={{
                width: '100%',
                padding: '12px 24px',
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
                Продолжить тест
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
