'use client';

/**
 * P1-UX-4 — Custom install-prompt UX.
 *
 * Browsers fire `beforeinstallprompt` on PWA-eligible visits. The
 * default Chrome install bar is small and shy; a deliberate, dismissable
 * banner gets meaningfully better install conversion (especially for
 * UZ-rural where homescreen presence drives retention).
 *
 * Heuristics for showing:
 *   - browser already fired beforeinstallprompt (PWA criteria met)
 *   - user has used the app for at least one session (sessionStorage
 *     marker; this guards against showing it on the very first paint)
 *   - user hasn't dismissed it before (localStorage marker, 30-day TTL)
 *   - app is not already installed (display-mode standalone)
 */
import { useEffect, useState } from 'react';
import { log } from '@/lib/log';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'bordik-install-dismissed-at';
const DISMISS_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const SESSION_MARKER = 'bordik-session-active';

function recentlyDismissed(): boolean {
  try {
    const ts = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
    if (!ts) return false;
    return Date.now() - ts < DISMISS_TTL_MS;
  } catch { return false; }
}

function isStandalone(): boolean {
  try {
    if (typeof matchMedia !== 'function') return false;
    if (matchMedia('(display-mode: standalone)').matches) return true;
    // iOS Safari uses navigator.standalone
    return Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  } catch { return false; }
}

export function InstallPrompt() {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return;

    const onBeforePrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
      // Only show after user has been browsing for ≥1 session.
      try {
        if (sessionStorage.getItem(SESSION_MARKER) === '1') {
          setShow(true);
        } else {
          // Mark this session and wait until they navigate again.
          sessionStorage.setItem(SESSION_MARKER, '1');
        }
      } catch {
        setShow(true);  // private mode — show eagerly
      }
    };

    const onInstalled = () => {
      setShow(false);
      setEvt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforePrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforePrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!show || !evt) return null;

  async function install() {
    if (!evt) return;
    try {
      await evt.prompt();
      const { outcome } = await evt.userChoice;
      if (outcome === 'dismissed') {
        try { localStorage.setItem(DISMISS_KEY, String(Date.now())); }
        catch (e) {
          // Audit B-9: localStorage quota or privacy mode rejection.
          // Banner re-appears next session — annoying but not broken.
          log.warn({ event: 'install_prompt_dismiss_persist_failed', error: String(e).slice(0, 200) });
        }
      }
    } catch (e) {
      // Audit B-9: BeforeInstallPromptEvent.prompt() rejected — could be
      // user cancelled, or browser blocked. Either way, the banner closes.
      log.warn({ event: 'install_prompt_failed', error: String(e).slice(0, 200) });
    }
    setShow(false);
    setEvt(null);
  }

  function dismiss() {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); }
    catch (e) {
      // Audit B-9.
      log.warn({ event: 'install_prompt_dismiss_persist_failed', error: String(e).slice(0, 200) });
    }
    setShow(false);
  }

  return (
    <div
      role="dialog"
      aria-label="Установить Bordik"
      className="fixed right-4 bottom-[130px] z-[9998] max-w-[380px] py-[14px] px-4 bg-[#1A1A1A] text-white rounded-[14px] border border-white/[0.12] shadow-[0_12px_32px_rgba(0,0,0,0.30)] flex items-center gap-3 font-[var(--font-body)] text-[13px] leading-[1.55]"
    >
      <div className="flex-1 min-w-0">
        <strong>Установить Bordik</strong> на главный экран — быстрый офлайн-доступ
        к курсам и калькуляторам.
      </div>
      <button
        type="button"
        onClick={install}
        className="flex-[0_0_auto] py-2 px-3.5 bg-[#3B82F6] text-white border-none rounded-[10px] text-[13px] font-semibold cursor-pointer"
      >
        Установить
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Скрыть"
        className="flex-[0_0_auto] py-2 px-2.5 bg-transparent text-white/60 border-none cursor-pointer text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}
