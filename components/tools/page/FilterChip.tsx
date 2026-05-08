/**
 * FilterChip — selected-filter pill with X-remove button.
 * Used in the active-filters strip beneath the search bar.
 *
 * P1-CR-3 step 5/6 — extracted from ToolsPage.tsx.
 */
import { useT } from '@/lib/i18n';

export function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  const t = useT();
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 6px 5px 12px',
      background: '#EEF2FF',
      color: '#1E3A8A',
      border: 'none', borderRadius: 999,
      fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500,
    }}>
      {label}
      <button
        onClick={onRemove}
        style={{
          background: 'transparent', border: 'none', padding: 0,
          cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: '#4F46E5',
          width: 16, height: 16, borderRadius: '50%',
          transition: 'background 150ms',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#C7D2FE'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        aria-label={t('tools.remove')}
      >
        <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
          <line x1={18} y1={6} x2={6} y2={18}/><line x1={6} y1={6} x2={18} y2={18}/>
        </svg>
      </button>
    </span>
  );
}
