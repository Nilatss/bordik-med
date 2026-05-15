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
        className={`py-3 px-[22px] rounded-[10px] ${busy ? 'bg-[#9CA3AF] cursor-not-allowed' : 'bg-[#DC2626] cursor-pointer'} text-white border-none font-[var(--font-body)] text-[14px] font-bold`}
      >
        {busy ? 'Отправляю…' : 'Активировать kill-switch'}
      </button>
      {msg ? (
        <p className="mt-4 p-3 rounded-lg bg-[#F3F4F6] text-[13px] text-[#1A1A1A]">
          {msg}
        </p>
      ) : null}
    </div>
  );
}
