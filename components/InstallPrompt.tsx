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
        try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch {/* */}
      }
    } catch {/* */}
    setShow(false);
    setEvt(null);
  }

  function dismiss() {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch {/* */}
    setShow(false);
  }

  return (
    <div
      role="dialog"
      aria-label="Установить Bordik"
      style={{
        position: 'fixed', left: 12, right: 12, bottom: 78, zIndex: 9998,
        maxWidth: 720, margin: '0 auto',
        padding: '14px 16px',
        background: '#1A1A1A', color: '#FFFFFF',
        borderRadius: 14, border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 12px 32px rgba(0,0,0,0.30)',
        display: 'flex', alignItems: 'center', gap: 12,
        fontFamily: 'var(--font-body)', fontSize: 13, lineHeight: 1.55,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <strong>Установить Bordik</strong> на главный экран — быстрый офлайн-доступ
        к курсам и калькуляторам.
      </div>
      <button
        type="button"
        onClick={install}
        style={{
          flex: '0 0 auto',
          padding: '8px 14px',
          background: '#3B82F6', color: '#FFFFFF',
          border: 'none', borderRadius: 10,
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}
      >
        Установить
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Скрыть"
        style={{
          flex: '0 0 auto',
          padding: '8px 10px',
          background: 'transparent', color: 'rgba(255,255,255,0.6)',
          border: 'none', cursor: 'pointer',
          fontSize: 18, lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  );
}
