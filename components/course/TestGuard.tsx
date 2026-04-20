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

const GRACE_MS = 10_000;

/**
 * Anti-cheat wrapper for active tests.
 *
 * Flow:
 *  1. `visibilitychange` (document.hidden) or window `blur` → start grace-period
 *     countdown (10 s) and show "away" overlay with timer.
 *  2. If the user returns before 10 s expire → cancel timer, do NOT increment
 *     violationCount. Show a brief "вернулись, больше так не делайте" banner.
 *  3. If 10 s elapse away → increment violationCount and show the violation modal.
 *  4. At MAX_VIOLATIONS (3) → call onForceSubmit to end the test with a penalty.
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

    const handleVisibility = () => {
      if (document.hidden) startGrace();
      else cancelGrace();
    };

    const handleBlur = () => {
      // window.blur → treat same as visibility hidden
      startGrace();
    };

    const handleFocus = () => {
      cancelGrace();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
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
            </p>
          </div>
        </div>
      )}

      {/* Small "you returned" toast */}
      {active && justReturned && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9997,
          padding: '10px 16px', borderRadius: 10,
          background: '#FFFBEB', color: '#B45309',
          fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          animation: 'bordik-dropdown-fadein 200ms ease-out',
        }}>
          Вернулись. Больше так не делайте - нарушение будет засчитано.
        </div>
      )}

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
              Вы не вернулись в окно за 10 секунд. Нарушение засчитано.
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
                background: '#1A1A1A',
                color: '#FFFFFF',
                border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
                transition: 'background 180ms',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#000000'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#1A1A1A'; }}
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
