'use client';

/**
 * Last-resort error boundary that wraps the entire `<html>` tree.
 * Used when the root layout itself throws (rare — typically a metadata
 * generator throwing or a bad provider).
 *
 * MUST render its own <html> + <body>; the parent layout never ran.
 */
import { useEffect } from 'react';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.error('[global.error]', {
      digest: error.digest ?? null,
      message: error.message?.slice(0, 200) ?? null,
    });
  }, [error]);

  return (
    <html lang="ru">
      <body style={{
        margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif',
        background: '#FAFAFA', color: '#1A1A1A',
        minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ maxWidth: 480, padding: 24, textAlign: 'center' }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>
            Что-то пошло не так
          </h1>
          <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
            Произошла серьёзная ошибка. Мы уже об этом узнали.
            {error.digest ? <><br /><span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, opacity: 0.6 }}>id: {error.digest}</span></> : null}
          </p>
          <a
            href="/"
            style={{
              display: 'inline-block',
              padding: '10px 18px', borderRadius: 10,
              background: '#3B82F6', color: '#FFFFFF',
              textDecoration: 'none', fontSize: 13, fontWeight: 600,
            }}
          >
            На главную
          </a>
        </div>
      </body>
    </html>
  );
}
