'use client';

import { useState } from 'react';

export default function SwKillClient() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function trigger() {
    if (busy) return;
    setBusy(true);
    setMsg(null);
    try {
      if (!('serviceWorker' in navigator)) {
        setMsg('Service Worker API недоступен в этом браузере.');
        return;
      }
      const reg = await navigator.serviceWorker.getRegistration();
      const target = reg?.waiting ?? reg?.active ?? reg?.installing;
      if (!target) {
        setMsg('Активного SW не найдено — нечего убивать.');
        return;
      }
      // Listen for the SW echo so we can confirm it took the message.
      const ack = new Promise<void>((resolve) => {
        const h = (ev: MessageEvent) => {
          if (ev.data?.type === 'RELOAD') {
            navigator.serviceWorker.removeEventListener('message', h);
            resolve();
          }
        };
        navigator.serviceWorker.addEventListener('message', h);
        setTimeout(resolve, 3000);                      // safety fallback
      });
      target.postMessage({ type: 'FORCE_UPDATE_AND_RELOAD' });
      await ack;
      setMsg('Сигнал отправлен. Эта вкладка перезагрузится через 1 секунду.');
      setTimeout(() => location.reload(), 1000);
    } catch (err) {
      setMsg('Ошибка: ' + (err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={trigger}
        disabled={busy}
        style={{
          padding: '12px 22px', borderRadius: 10,
          background: busy ? '#9CA3AF' : '#DC2626', color: '#FFFFFF',
          border: 'none', cursor: busy ? 'not-allowed' : 'pointer',
          fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700,
        }}
      >
        {busy ? 'Отправляю…' : 'Активировать kill-switch'}
      </button>
      {msg ? (
        <p style={{
          marginTop: 16, padding: 12, borderRadius: 8,
          background: '#F3F4F6', fontSize: 13, color: '#1A1A1A',
        }}>
          {msg}
        </p>
      ) : null}
    </div>
  );
}
