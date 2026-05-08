'use client';

/**
 * P2-CR-6 — Segment-level error boundary for /admin/*.
 *
 * Без этого файла любая ошибка в admin-части (RLS-failure, неверный
 * fetch-payload, runtime exception в content-editor) поднимается до
 * корневого app/error.tsx, который не знает контекста "ты в админке"
 * и предлагает пользователю "На главную". Для editor'а это означает
 * потерю текущего черновика.
 *
 * Здесь:
 *   - Контекстный заголовок "Ошибка в админ-панели"
 *   - "Повторить" сохраняет URL и пытается перерендерить только
 *     сегмент, не выходя из admin-context'а
 *   - "Назад в админку" ведёт в /admin (a не /), чтобы редактор не
 *     терял текущую сессию
 *
 * Логирование — короткое, без PII (audit P3 — не дёргаем user data
 * из stack frames). Sentry уже автоматически ловит эти errors через
 * @sentry/nextjs (digest используется как correlation id).
 */
import { useEffect } from 'react';
import { log } from '@/lib/log';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    log.error({
      event: 'admin_segment_error',
      digest: error.digest ?? null,
      message: error.message?.slice(0, 200) ?? null,
    });
  }, [error]);

  return (
    <main style={{
      minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: 'var(--font-body)',
    }}>
      <div style={{ maxWidth: 520, textAlign: 'center' }}>
        <div style={{
          display: 'inline-block', marginBottom: 16,
          padding: '4px 10px', borderRadius: 999,
          background: '#FEF3C7', color: '#92400E',
          fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase',
        }}>
          Админ-панель
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
          Не удалось загрузить страницу
        </h1>
        <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
          Произошла ошибка в админ-панели. Возможные причины: устарел session-token,
          превышен rate-limit Supabase, или баг в editor-flow. Проверьте сетевые
          запросы в DevTools.
          {error.digest ? <><br /><span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, opacity: 0.6 }}>id: {error.digest}</span></> : null}
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: '10px 18px', borderRadius: 10,
              background: '#3B82F6', color: '#FFFFFF',
              border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
            }}
          >
            Повторить
          </button>
          <a
            href="/admin"
            style={{
              padding: '10px 18px', borderRadius: 10,
              background: 'transparent', color: '#1A1A1A',
              border: '1px solid #E5E7EB', textDecoration: 'none',
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center',
            }}
          >
            Назад в админку
          </a>
        </div>
      </div>
    </main>
  );
}
