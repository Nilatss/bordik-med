'use client';

/**
 * Storage / cookies notice.
 *
 * We do NOT use third-party tracking cookies, advertising pixels, or
 * cross-site analytics. The localStorage we use is strictly necessary
 * for the app to work (auth session via Supabase, Zustand persist of
 * user progress, PWA caches). Under GDPR/ePrivacy, strictly-necessary
 * storage does not require an opt-in consent banner — only a plain-
 * language disclosure.
 *
 * This banner is therefore informational, not a consent gate. It
 * appears once per device, has a single "Понятно" dismiss button, and
 * stores the dismissal in localStorage (which itself is the thing we
 * disclose — meta but acceptable).
 *
 * If we ever add non-essential analytics (PostHog, Plausible cloud,
 * Sentry session-replay, etc.), this becomes a real consent banner
 * with allow/deny + integration into the consent_records table.
 */
import { useEffect, useState } from 'react';

const KEY = 'bordik-storage-notice-dismissed';

export function StorageBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY) !== '1') setShow(true);
    } catch {/* private mode / no storage — banner stays hidden */}
  }, []);

  if (!show) return null;

  return (
    <div
      role="region"
      aria-label="Уведомление о хранении данных"
      style={{
        position: 'fixed', left: 12, right: 12, bottom: 12, zIndex: 9999,
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
        Bordik использует <strong>localStorage</strong> и кэш браузера для
        хранения вашего прогресса, сессии входа и офлайн-доступа. Мы{' '}
        <strong>не используем</strong> рекламные cookie или трекеры.{' '}
        <a href="/privacy" style={{ color: '#93C5FD', textDecoration: 'underline' }}>
          Политика конфиденциальности
        </a>
        .
      </div>
      <button
        type="button"
        onClick={() => {
          try { localStorage.setItem(KEY, '1'); } catch {/* */}
          setShow(false);
        }}
        style={{
          flex: '0 0 auto',
          padding: '8px 14px',
          background: '#3B82F6', color: '#FFFFFF',
          border: 'none', borderRadius: 10,
          fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Понятно
      </button>
    </div>
  );
}
