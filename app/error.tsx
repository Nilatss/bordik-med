'use client';

/**
 * Route segment error boundary. Catches errors thrown in any nested
 * page / layout below `app/`, except the root `<html>` (that's the
 * job of global-error.tsx).
 */
import { useEffect } from 'react';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log only the digest (non-PII server-correlation id) and a short
    // message — never the full error object (could contain user data
    // from form bodies in stack frames).
    console.error('[route.error]', {
      digest: error.digest ?? null,
      message: error.message?.slice(0, 200) ?? null,
    });
  }, [error]);

  return (
    <main style={{
      minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: 'var(--font-body)',
    }}>
      <div style={{ maxWidth: 480, textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
          Что-то пошло не так
        </h1>
        <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
          Произошла непредвиденная ошибка. Попробуйте обновить страницу или вернуться на главную.
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
            href="/"
            style={{
              padding: '10px 18px', borderRadius: 10,
              background: 'transparent', color: '#1A1A1A',
              border: '1px solid #E5E7EB', textDecoration: 'none',
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center',
            }}
          >
            На главную
          </a>
        </div>
      </div>
    </main>
  );
}
