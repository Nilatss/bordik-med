'use client';

/**
 * P2-CR-6 — Segment-level error boundary for /tools/*.
 *
 * Tools-роуты — это runtime-вычислители (calculator runners). Падение
 * здесь часто означает: неверный input при URL-restore, отсутствие
 * tool-meta в bundle, fetch к /public/tool-meta.json вернул не-JSON.
 * Корневой error.tsx уведёт пользователя на главную, что плохо для
 * "сохранить вычисление по ссылке"-flow. Этот boundary остаётся в
 * /tools и предлагает вернуться в каталог.
 */
import { useEffect } from 'react';
import { log } from '@/lib/log';

export default function ToolsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    log.error({
      event: 'tools_segment_error',
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
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
          Не удалось открыть калькулятор
        </h1>
        <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
          Возможно ID инструмента в ссылке устарел или произошла ошибка
          при загрузке формулы. Попробуйте повторить или вернитесь к каталогу.
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
            href="/tools"
            style={{
              padding: '10px 18px', borderRadius: 10,
              background: 'transparent', color: '#1A1A1A',
              border: '1px solid #E5E7EB', textDecoration: 'none',
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center',
            }}
          >
            Каталог инструментов
          </a>
        </div>
      </div>
    </main>
  );
}
