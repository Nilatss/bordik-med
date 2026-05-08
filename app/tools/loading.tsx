/**
 * P2-PERF-NEW-5 — Suspense boundary for /tools/*.
 *
 * Tool details fetch tool-meta JSON + сам runner. Skeleton поверх
 * Sidebar даёт мгновенный paint, навигация из каталога в калькулятор
 * не выглядит "залипанием".
 */
export default function ToolsLoading() {
  return (
    <main style={{
      padding: 24,
      fontFamily: 'var(--font-body)',
      maxWidth: 880,
      margin: '0 auto',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={skelBar(280, 32)} />
        <div style={skelBar(460, 14, 0.6)} />
        <div style={{ height: 12 }} />
        <div style={skelCard(180)} />
        <div style={skelCard(60)} />
        <div style={skelCard(60)} />
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
