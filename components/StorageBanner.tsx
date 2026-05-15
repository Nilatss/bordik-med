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

/**
 * SSR-safe two-phase mount:
 *   - First render (server + client first paint): show=false → return null.
 *     Both sides agree, no hydration mismatch.
 *   - useEffect after mount: read localStorage and flip show=true if not
 *     yet dismissed.
 *
 * The previous synchronous-init pattern broke hydration in production
 * (Next 16 + Turbopack flagged the role/aria-label drift as a
 * Recoverable Error). The LCP cost we were trying to avoid is moot —
 * StorageBanner is bottom-right and never the LCP element anyway.
 */
export function StorageBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(KEY) !== '1') setShow(true);
    } catch { /* localStorage may be blocked */ }
  }, []);

  if (!show) return null;

  return (
    <div
      role="region"
      aria-label="Уведомление о хранении данных"
      aria-live="polite"
      data-banner="storage"
      className="fixed right-4 bottom-4 z-[9999] max-w-[380px] py-[14px] px-4 bg-[#1A1A1A] text-white rounded-[14px] border border-white/[0.12] shadow-[0_12px_32px_rgba(0,0,0,0.30)] flex items-center gap-3 font-[var(--font-body)] text-[13px] leading-[1.55]"
    >
      <div className="flex-1 min-w-0">
        Bordik использует <strong>localStorage</strong> и кэш браузера для
        хранения вашего прогресса, сессии входа и офлайн-доступа. Мы{' '}
        <strong>не используем</strong> рекламные cookie или трекеры.{' '}
        <a href="/privacy" className="text-[#93C5FD] underline">
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
        className="flex-[0_0_auto] py-2 px-3.5 bg-[#3B82F6] text-white border-none rounded-[10px] font-[var(--font-body)] text-[13px] font-semibold cursor-pointer"
      >
        Понятно
      </button>
    </div>
  );
}
