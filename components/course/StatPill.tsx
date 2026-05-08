/**
 * StatPill — small label/value pill used on the course intro screen.
 *
 * Extracted from CoursePage.tsx (P1-CR-3 god-component split). Tiny
 * presentational component, no state. Reused by the intro stat-row
 * (topics / tests / section).
 */

interface StatPillProps {
  label: string;
  value: string;
}

export default function StatPill({ label, value }: StatPillProps) {
  return (
    <div style={{
      background: '#F5F6F8',
      borderRadius: 12,
      padding: '12px 14px',
      display: 'flex', flexDirection: 'column', gap: 4,
      minWidth: 0,
    }}>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
        color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: 'var(--font-body)', fontSize: 13.5, fontWeight: 600,
        color: '#1A1A1A', lineHeight: 1.35,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {value}
      </span>
    </div>
  );
}
