/**
 * P2-PERF-NEW-5 — Suspense boundary for /drugs.
 *
 * Drugs-page загружает 2.5MB drug-interactions JSON через
 * StaleWhileRevalidate. На первой навигации без cache паузу
 * закрываем skeleton-ом.
 */
export default function DrugsLoading() {
  return (
    <main style={{
      padding: 24,
      fontFamily: 'var(--font-body)',
      maxWidth: 1100,
      margin: '0 auto',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={skelBar(220, 28)} />
        <div style={skelBar(380, 14, 0.6)} />
        <div style={{ height: 12 }} />
        <div style={skelCard(64)} />
        <div style={skelCard(48)} />
        <div style={skelCard(48)} />
        <div style={skelCard(48)} />
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
