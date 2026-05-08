/**
 * P2-PERF-NEW-5 — Suspense boundary for /admin/*.
 *
 * Без loading.tsx Next App Router показывает белый экран до полной
 * загрузки server-rendered HTML (admin tools data RSC fetch). На
 * холодной 3G это 1-2 секунды visual nothingness. Skeleton-paint
 * через loading.tsx даёт мгновенный feedback и измеримое улучшение
 * FCP / LCP на навигациях из главной в админку.
 */
export default function AdminLoading() {
  return (
    <main style={{
      padding: 24,
      fontFamily: 'var(--font-body)',
      maxWidth: 1200,
      margin: '0 auto',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}>
        <div style={skelBar(220, 28)} />
        <div style={skelBar(420, 14, 0.6)} />
        <div style={{ height: 24 }} />
        <div style={skelCard(120)} />
        <div style={skelCard(80)} />
        <div style={skelCard(80)} />
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
