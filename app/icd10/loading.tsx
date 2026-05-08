/**
 * P2-PERF-NEW-5 — Suspense boundary for /icd10.
 *
 * ICD-10 / -11 banks ~3-5MB через IDB + Web Worker. Холодная загрузка
 * — заметная пауза, заполняем skeleton-ом.
 */
export default function Icd10Loading() {
  return (
    <main style={{
      padding: 24,
      fontFamily: 'var(--font-body)',
      maxWidth: 1100,
      margin: '0 auto',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={skelBar(180, 28)} />
        <div style={skelBar(420, 14, 0.6)} />
        <div style={{ height: 12 }} />
        <div style={skelBar(680, 44)} />
        <div style={{ height: 8 }} />
        <div style={skelCard(56)} />
        <div style={skelCard(56)} />
        <div style={skelCard(56)} />
        <div style={skelCard(56)} />
      </div>
    </main>
  );
}

function skelBar(w: number, h: number, opacity = 1): React.CSSProperties {
  return {
    width: w,
    height: h,
    background: '#E5E7EB',
    borderRadius: 6,
    opacity,
    animation: 'skeleton-pulse 1.6s ease-in-out infinite',
  };
}

function skelCard(h: number): React.CSSProperties {
  return {
    height: h,
    background: '#F3F4F6',
    borderRadius: 12,
    animation: 'skeleton-pulse 1.6s ease-in-out infinite',
  };
}
