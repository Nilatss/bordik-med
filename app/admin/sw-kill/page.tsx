import type { Metadata } from 'next';
import SwKillClient from './SwKillClient';

export const metadata: Metadata = {
  title: 'SW kill-switch',
  robots: { index: false, follow: false },
};

/**
 * Admin SW kill-switch.
 *
 * When a buggy service worker version reaches users, the toast-driven
 * update flow needs the user to click "Обновить" — they may not, or
 * may not be using the app for hours. This page lets an admin push a
 * single message that wipes runtime caches and reloads every live tab.
 *
 * Auth: this page just lives under /admin which the existing layout
 * gates. No additional check here — the SW message itself can't be
 * triggered without first reaching this page.
 */
export default function SwKillPage() {
  return (
    <main id="main-content" style={{
      maxWidth: 720, margin: '40px auto', padding: '0 24px',
      fontFamily: 'var(--font-body)', color: '#1A1A1A', lineHeight: 1.6,
    }}>
      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700,
        marginBottom: 12,
      }}>
        SW kill-switch
      </h1>
      <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 24 }}>
        Принудительная активация ожидающего service worker и перезагрузка
        ВСЕХ открытых вкладок. Использовать, когда баг в SW делает
        toast-flow бесполезным (пользователи не нажимают «Обновить»).
      </p>
      <div style={{
        background: '#FEF3C7', border: '1px solid #FDE68A',
        borderRadius: 12, padding: 16, marginBottom: 24,
        fontSize: 13, color: '#92400E',
      }}>
        <strong>⚠️ Действие необратимо.</strong> Вызовет перезагрузку у
        каждого пользователя, у которого открыта вкладка. Очистит все
        runtime caches Serwist (precache не пострадает).
      </div>
      <SwKillClient />
    </main>
  );
}
