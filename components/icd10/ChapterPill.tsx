/**
 * P1-CR-3 (Icd10Lookup split, step 2/6) — chapter filter pill button.
 *
 * Обычный F5F6F8 чип с count-бейджем; активный — синий 2563EB.
 * Hover state через inline onMouseEnter (не CSS), консистентно с
 * остальным проектом до P1-CR-4 (inline-styles → Tailwind migration).
 */
interface ChapterPillProps {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}

export function ChapterPill({ label, count, active, onClick }: ChapterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '7px 12px',
        // Активная — синяя (тон совпадает с soft-blue badge номера
        // главы), неактивная — стандартный серый F5F6F8 чип.
        background: active ? '#2563EB' : '#F5F6F8',
        color: active ? '#FFFFFF' : '#374151',
        border: '1px solid transparent',
        borderColor: active ? '#2563EB' : 'transparent',
        borderRadius: 999,
        cursor: 'pointer',
        fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
        whiteSpace: 'nowrap',
        transition: 'background 180ms, color 180ms, border-color 180ms',
        boxShadow: active ? '0 1px 2px rgba(37,99,235,0.18)' : 'none',
      }}
      onMouseEnter={(e) => {
        if (active) e.currentTarget.style.background = '#1D4ED8';
        else e.currentTarget.style.background = '#EFF1F4';
      }}
      onMouseLeave={(e) => {
        if (active) e.currentTarget.style.background = '#2563EB';
        else e.currentTarget.style.background = '#F5F6F8';
      }}
    >
      <span>{label}</span>
      <span style={{
        fontFamily: 'var(--font-mono, ui-monospace)',
        fontSize: 10, fontWeight: 700,
        color: active ? 'rgba(255,255,255,0.78)' : '#9CA3AF',
        letterSpacing: '0.02em',
      }}>
        {count}
      </span>
    </button>
  );
}
