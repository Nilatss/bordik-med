/**
 * ListPanel — bullet-list card for strengths / weaknesses в результате
 * адаптивного теста.
 *
 * P1-CR-3 step 2/6 — extracted from DiagnosticTest.tsx.
 *
 * Bordik palette: same #F5F6F8 surface for every card. Семантический
 * цвет (зелёный для сильных, янтарный для слабых) survives только как
 * bullet-point dot — enough signal без pastel-блока который clashes
 * с остальной платформой.
 */
export function ListPanel({ title, tone, items }: {
  title: string;
  tone: 'green' | 'amber';
  items: string[];
}) {
  const dotColor = tone === 'green' ? '#22C55E' : '#F59E0B';
  return (
    <div style={{
      padding: '14px 16px',
      background: '#F5F6F8',
      borderRadius: 14,
    }}>
      <p style={{
        margin: '0 0 10px',
        fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
        color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        {title}
      </p>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((s, i) => (
          <li key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            fontFamily: 'var(--font-body)', fontSize: 13, color: '#1A1A1A',
            lineHeight: 1.45,
          }}>
            <span style={{
              flexShrink: 0, marginTop: 6,
              width: 6, height: 6, borderRadius: '50%', background: dotColor,
            }} />
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
