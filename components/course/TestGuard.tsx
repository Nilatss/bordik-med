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

/**
 * Anti-cheat wrapper for active tests.
 * Detects tab switches, window blur, and shows warning overlay.
 * After MAX_VIOLATIONS, forces test submission.
 */
export default function TestGuard({ active, onViolation, onForceSubmit, violationCount, children }: TestGuardProps) {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!active) return;

    const handleVisibility = () => {
      if (document.hidden) {
        onViolation();
        setShowWarning(true);
      }
    };

    const handleBlur = () => {
      onViolation();
      setShowWarning(true);
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);

    // Try fullscreen
    document.documentElement.requestFullscreen?.().catch(() => {});

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
    };
  }, [active, onViolation]);

  // Force submit after max violations
  useEffect(() => {
    if (active && violationCount >= MAX_VIOLATIONS) {
      onForceSubmit();
    }
  }, [active, violationCount, onForceSubmit]);

  const dismiss = useCallback(() => setShowWarning(false), []);

  return (
    <>
      {children}
      {showWarning && active && (
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
            {/* Severity pill */}
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

            {/* Title */}
            <h3 style={{
              fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
              color: '#1A1A1A', marginBottom: 8,
              letterSpacing: '-0.02em',
            }}>
              Вы покинули окно теста
            </h3>

            {/* Description */}
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 14,
              color: '#6B7280', lineHeight: 1.55,
              marginBottom: 20,
              maxWidth: 340, marginLeft: 'auto', marginRight: 'auto',
            }}>
              Переключение вкладок и окон во время теста запрещено.
              Вернитесь в окно и продолжите прохождение.
            </p>

            {/* Violations counter — dots */}
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
                Максимум нарушений достигнут. Тест завершится автоматически.
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
