'use client';

/**
 * Fallback shown when the user navigates to a page the service worker
 * couldn't serve from cache (e.g. fresh URL + no network).
 *
 * Intentionally minimal — zero runtime data, no external fetch.
 */
export default function OfflinePage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAFAFA',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        maxWidth: 420,
        width: '100%',
        textAlign: 'center',
        background: '#FFFFFF',
        borderRadius: 20,
        padding: '40px 32px',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16,
          background: '#FEF3C7', color: '#B45309',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
        }}>
          <svg width={32} height={32} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M16.72 11.06A10.94 10.94 0 0119 12.55" />
            <path d="M5 12.55a10.94 10.94 0 015.17-2.39" />
            <path d="M10.71 5.05A16 16 0 0122.58 9" />
            <path d="M1.42 9a15.91 15.91 0 014.7-2.88" />
            <path d="M8.53 16.11a6 6 0 016.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" />
          </svg>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display), system-ui, sans-serif',
          fontSize: 22, fontWeight: 700,
          color: '#1A1A1A', margin: '0 0 8px 0',
          letterSpacing: '-0.02em',
        }}>
          Нет соединения
        </h1>

        <p style={{
          fontSize: 14, color: '#6B7280',
          lineHeight: 1.55, margin: '0 0 24px 0',
        }}>
          Проверьте подключение к интернету. Ранее открытые инструменты и курсы доступны из кэша.
        </p>

        <button
          onClick={() => window.location.reload()}
          style={{
            width: '100%',
            padding: '12px 24px',
            borderRadius: 10,
            background: '#1A1A1A',
            color: '#FFFFFF',
            border: 'none', cursor: 'pointer',
            fontSize: 14, fontWeight: 600,
          }}
        >
          Попробовать снова
        </button>
      </div>
    </div>
  );
}
