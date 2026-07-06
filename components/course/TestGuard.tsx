'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { MAX_VIOLATIONS } from '@/lib/quiz';
import { createDepartureGate } from '@/lib/test-guard-departure';

interface TestGuardProps {
  active: boolean;
  onViolation: (reason?: string) => void;
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
    //
    // A single physical "leave the test" action (Ctrl+Tab, Alt+Tab, clicking
    // another app) commonly fires BOTH `visibilitychange` (hidden) and
    // window `blur` back to back — they aren't independent departures.
    // `departureGate` coalesces them into one counted violation per
    // departure (see lib/test-guard-departure.ts for the bug this fixes).
    const departureGate = createDepartureGate();
    const fireVisibilityViolation = (reason: string) => {
      if (!departureGate.depart()) return;
      if (graceTickRef.current) {
        clearInterval(graceTickRef.current);
        graceTickRef.current = null;
        setGraceLeft(0);
        graceStartRef.current = 0;
      }
      onViolation(reason);
      setShowViolation(true);
    };
    const handleVisibility = () => {
      if (document.hidden) fireVisibilityViolation('tab-hidden');
      else departureGate.returned();
    };
    const handleBlur = () => {
      fireVisibilityViolation('window-blur');
    };
    const handleFocus = () => {
      // Returning to the tab doesn't cancel the violation that already
      // fired — it just re-arms the gate so the NEXT departure counts.
      departureGate.returned();
    };

    // Forbidden-key listener — instant violation, no grace.
    const handleKeydown = (e: KeyboardEvent) => {
      if (!isViolationKey(e)) return;
      e.preventDefault();
      if (graceTickRef.current) {
        clearInterval(graceTickRef.current);
        graceTickRef.current = null;
        setGraceLeft(0);
        graceStartRef.current = 0;
      }
      // Map specific keys to reason codes so the violation modal can
      // explain exactly what tripped.
      let reason = 'forbidden-key';
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && /^[ijc]$/i.test(e.key))) reason = 'devtools';
      else if (e.ctrlKey && /^[cax]$/i.test(e.key)) reason = 'copy';
      else if (e.key === 'PrintScreen' || (e.ctrlKey && /^[ps]$/i.test(e.key))) reason = 'screenshot';
      else if (e.altKey && e.key === 'Tab') reason = 'alt-tab';
      onViolation(reason);
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
        <div className="fixed inset-0 z-[9998] bg-[rgba(15,20,30,0.65)] backdrop-blur-[10px] [-webkit-backdrop-filter:blur(10px)] flex items-center justify-center p-5 animate-[bordik-dropdown-fadein_200ms_ease-out]">
          <div className="bg-white rounded-[20px] pt-8 px-9 pb-8 max-w-[440px] w-full text-center shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            <div className="inline-flex items-center gap-2 py-1.5 px-3.5 rounded-full bg-[#FEF2F2] text-[#B91C1C] font-[var(--font-mono)] text-[10px] font-bold tracking-[0.08em] uppercase mb-[18px]">
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" />
              </svg>
              Вернитесь в окно теста
            </div>
            <div className={`font-[var(--font-mono)] text-[52px] font-bold leading-none mb-3 tracking-[-0.04em] ${graceLeft <= 3 ? 'text-[#B91C1C] animate-[bordik-timer-pulse_1s_ease-in-out_infinite]' : 'text-[#1A1A1A]'}`}>
              {graceLeft}
            </div>
            <p className="font-[var(--font-body)] text-sm text-[#6B7280] leading-[1.5] max-w-[340px] mx-auto">
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
        <div className="fixed inset-0 z-[9999] bg-[rgba(15,20,30,0.55)] backdrop-blur-[8px] [-webkit-backdrop-filter:blur(8px)] flex items-center justify-center p-5 animate-[bordik-dropdown-fadein_200ms_ease-out]">
          <div className="bg-white rounded-[20px] pt-8 px-9 pb-8 max-w-[440px] w-full text-center shadow-[0_20px_60px_rgba(0,0,0,0.25),0_4px_12px_rgba(0,0,0,0.12)]">
            <div className={`inline-flex items-center gap-2 py-1.5 px-3.5 rounded-full font-[var(--font-mono)] text-[10px] font-bold tracking-[0.08em] uppercase mb-[18px] ${
              violationCount >= MAX_VIOLATIONS
                ? 'bg-[#FEF2F2] text-[#B91C1C]'
                : 'bg-[#FFFBEB] text-[#B45309]'
            }`}>
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              {violationCount >= MAX_VIOLATIONS ? 'Тест завершается' : 'Нарушение зафиксировано'}
            </div>

            <h3 className="font-[var(--font-display)] text-[22px] font-bold text-[#1A1A1A] mb-2 tracking-[-0.02em]">
              Вы покинули окно теста
            </h3>

            <p className="font-[var(--font-body)] text-sm text-[#6B7280] leading-[1.55] mb-5 max-w-[340px] mx-auto">
              Вы либо покинули окно теста дольше чем на {Math.round(GRACE_MS / 1000)} секунд, либо нажали запрещённое сочетание клавиш (PrintScreen, F12, Ctrl+C / P / S и т.п.). Нарушение засчитано.
            </p>

            <div className="flex items-center justify-center gap-2.5 mb-6">
              <span className="font-[var(--font-mono)] text-[11px] font-semibold text-[#6B7280] uppercase tracking-[0.06em]">
                Нарушений
              </span>
              <div className="flex gap-1.5">
                {Array.from({ length: MAX_VIOLATIONS }).map((_, i) => {
                  const filled = i < violationCount;
                  const dotBg = filled
                    ? (violationCount >= MAX_VIOLATIONS ? 'bg-[#EF4444]' : 'bg-[#F59E0B]')
                    : 'bg-[#E5E7EB]';
                  return (
                    <span key={i} className={`w-2.5 h-2.5 rounded-full transition-colors duration-200 ${dotBg}`} />
                  );
                })}
              </div>
              <span className={`font-[var(--font-mono)] text-xs font-bold ${violationCount >= MAX_VIOLATIONS ? 'text-[#B91C1C]' : 'text-[#1A1A1A]'}`}>
                {violationCount} / {MAX_VIOLATIONS}
              </span>
            </div>

            {violationCount >= MAX_VIOLATIONS ? (
              <div className="py-3 px-4 bg-[#FEF2F2] rounded-[10px] font-[var(--font-body)] text-[13px] text-[#B91C1C] font-semibold">
                Максимум нарушений. Тест завершён. Повторная попытка через 48 часов.
              </div>
            ) : (
              <button
                onClick={dismiss}
                className="w-full py-3 px-6 rounded-[10px] bg-[#3B82F6] hover:bg-[#2563EB] text-white border-none cursor-pointer font-[var(--font-body)] text-sm font-semibold transition-colors duration-[180ms]"
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
