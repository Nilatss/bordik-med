/**
 * DiagnosticHeader — back-button + title block для DiagnosticTest.
 *
 * P1-CR-3 step 3/6 — extracted from DiagnosticTest.tsx.
 */
export function DiagnosticHeader({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
      <button
        onClick={onClose}
        aria-label="Закрыть"
        style={{
          width: 36, height: 36, borderRadius: 10,
          background: '#F5F6F8', color: '#1A1A1A', border: 'none',
          cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 150ms',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#E8E9ED'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#F5F6F8'; }}
      >
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
      </button>
      <div style={{ flex: 1 }}>
        <p style={{
          margin: 0,
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
          color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          Диагностика
        </p>
        <h2 style={{
          margin: '2px 0 0',
          fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
          color: '#1A1A1A', letterSpacing: '-0.02em', lineHeight: 1.2,
        }}>
          Адаптивный тест уровня знаний
        </h2>
      </div>
    </div>
  );
}
