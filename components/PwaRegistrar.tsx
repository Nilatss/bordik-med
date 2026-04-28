'use client';

import { useEffect, useState, useCallback } from 'react';

/**
 * Registers the Serwist-generated service worker and manages its lifecycle.
 *
 * Flow:
 *  1. On mount → register /sw.js (only in production, only on https or localhost).
 *  2. Periodically (every hour) check for a new SW version.
 *  3. When a waiting SW is detected → show a non-intrusive toast offering
 *     "Обновить". Clicking it sends SKIP_WAITING to activate the new SW and
 *     reloads the page so users pick up the freshest build.
 *  4. Listens for `controllerchange` — fires when a new SW takes over.
 */
export default function PwaRegistrar() {
  const [waitingSW, setWaitingSW] = useState<ServiceWorker | null>(null);

  const applyUpdate = useCallback(() => {
    if (!waitingSW) return;
    waitingSW.postMessage({ type: 'SKIP_WAITING' });
    setWaitingSW(null);
  }, [waitingSW]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    // Serwist disables SW in dev — nothing to register
    if (process.env.NODE_ENV !== 'production') return;

    let checkInterval: ReturnType<typeof setInterval> | null = null;

    const onReady = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });

        // If there's a waiting worker right now (page reload while new SW is ready)
        if (reg.waiting) setWaitingSW(reg.waiting);

        // Listen for new SWs being installed
        reg.addEventListener('updatefound', () => {
          const installing = reg.installing;
          if (!installing) return;
          installing.addEventListener('statechange', () => {
            if (
              installing.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // A new SW is waiting
              setWaitingSW(installing);
            }
          });
        });

        // Hourly background check
        checkInterval = setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
      } catch (err) {
        // SW registration failed — app still works, just no offline cache
        console.warn('[PwaRegistrar] registration failed', err);
      }
    };

    // Reload once when new SW takes over
    let didRefresh = false;
    const onControllerChange = () => {
      if (didRefresh) return;
      didRefresh = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    // P1-SEC-8 — admin kill-switch echoes a RELOAD message to every
    // controlled tab. Reload immediately, no toast, no UI.
    const onMessage = (ev: MessageEvent) => {
      if (ev.data?.type === 'RELOAD') {
        if (didRefresh) return;
        didRefresh = true;
        window.location.reload();
      }
    };
    navigator.serviceWorker.addEventListener('message', onMessage);

    // Wait for the page to finish loading before kicking off SW registration
    // — keeps the critical render path clean.
    if (document.readyState === 'complete') {
      onReady();
    } else {
      window.addEventListener('load', onReady, { once: true });
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      navigator.serviceWorker.removeEventListener('message', onMessage);
    };
  }, []);

  if (!waitingSW) return null;

  // Non-intrusive update prompt — bottom-right toast
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 9998,
        background: '#FFFFFF',
        borderRadius: 12,
        padding: '12px 14px 12px 16px',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.18)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        maxWidth: 360,
        fontFamily: 'var(--font-body, system-ui, -apple-system, sans-serif)',
      }}
      role="status"
    >
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: '#ECFDF5', color: '#059669',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 13, fontWeight: 600, color: '#1A1A1A',
          margin: 0, lineHeight: 1.3,
        }}>
          Доступно обновление
        </p>
        <p style={{
          fontSize: 12, color: '#6B7280',
          margin: '2px 0 0 0', lineHeight: 1.3,
        }}>
          Перезагрузите страницу для применения
        </p>
      </div>
      <button
        onClick={applyUpdate}
        style={{
          padding: '6px 12px',
          borderRadius: 8,
          background: '#1A1A1A',
          color: '#FFFFFF',
          border: 'none',
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: 600,
          fontFamily: 'inherit',
          flexShrink: 0,
          transition: 'background 150ms',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#000000'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#1A1A1A'; }}
      >
        Обновить
      </button>
    </div>
  );
}
