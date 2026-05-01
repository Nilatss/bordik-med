/**
 * P2-SEO-1 — Default Open Graph image, generated at build time.
 *
 * Used when a page doesn't define its own og:image. Driven by Next.js's
 * built-in `next/og` ImageResponse — server-rendered SVG-to-PNG, ~10 KB
 * output, no asset pipeline needed.
 *
 * Runs at build time (default Node runtime, no `edge` export). The
 * generated PNG is cached as a static asset, so social media bots
 * never trigger a runtime render. The previous `runtime = 'edge'` was
 * leftover from when next/og only supported edge — Next 14+ supports
 * Node runtime for ImageResponse, which unlocks static generation and
 * removes the "edge runtime disables static generation" warning.
 *
 * For per-tool / per-course images, drop an `opengraph-image.tsx` in
 * the matching route segment — Next will pick that up automatically.
 */
import { ImageResponse } from 'next/og';

// Image metadata
export const alt = 'Bordik Med — медицинское обучение';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)',
          color: '#FFFFFF',
          padding: '64px 72px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 40, height: 40,
              borderRadius: 12,
              background: '#3B82F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
              fontWeight: 800,
              color: '#FFFFFF',
            }}
          >
            B
          </div>
          <div style={{
            fontSize: 22, fontWeight: 600,
            letterSpacing: '0.02em', color: 'rgba(255,255,255,0.85)',
          }}>
            Bordik
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: '#FFFFFF',
          }}>
            Платформа
            <br />
            медицинского обучения
          </div>
          <div style={{
            fontSize: 22,
            color: 'rgba(255,255,255,0.65)',
            lineHeight: 1.4,
            maxWidth: 800,
          }}>
            Курсы, тесты, клинические калькуляторы и шкалы — для студентов и врачей.
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          fontSize: 18,
          color: 'rgba(255,255,255,0.55)',
          fontFamily: 'ui-monospace, monospace',
        }}>
          <span>bordik-med.vercel.app</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
