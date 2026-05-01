/**
 * P2-SEO-1 — Default Open Graph image, generated at build time.
 *
 * Used when a page doesn't define its own og:image. Driven by Next.js's
 * built-in `next/og` ImageResponse — server-rendered SVG-to-PNG, ~10 KB
 * output, no asset pipeline needed.
 *
 * Runtime selection
 * -----------------
 * No `runtime = 'edge'` export. We deliberately keep this at the default
 * Node runtime because:
 *   1. The Sentry SDK pushes our app's bundle past Vercel Hobby's 1 MB
 *      Edge Function limit (we hit 1.04 MB after wiring up Sentry, which
 *      is what surfaced this fix). Node functions cap at 50 MB.
 *   2. With Node runtime, Next can statically generate the OG image at
 *      build time, so social-media bots fetch a static PNG asset
 *      instead of triggering a per-request render.
 *   3. `next/og` ImageResponse has supported the Node runtime since
 *      Next 14; the previous `edge` export was leftover from when only
 *      edge worked.
 *
 * Satori (the SVG-to-PNG engine behind `next/og`) is strict about CSS
 * compatibility: every <div> with more than one child must declare
 * `display: 'flex' | 'contents' | 'none'` explicitly. The previous
 * version relied on edge-runtime leniency and broke the moment we tried
 * to switch off edge. All multi-child divs now set display.
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
        {/* Header: logo + wordmark */}
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
            display: 'flex',
            fontSize: 22, fontWeight: 600,
            letterSpacing: '0.02em', color: 'rgba(255,255,255,0.85)',
          }}>
            Bordik
          </div>
        </div>

        {/* Hero: title + subtitle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/*
            Two text spans wrapped in a flex column instead of `text + <br />
            + text`. Avoids satori's "div with multiple children needs
            display:flex" rule and renders identically.
          */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: '#FFFFFF',
          }}>
            <span>Платформа</span>
            <span>медицинского обучения</span>
          </div>
          <div style={{
            display: 'flex',
            fontSize: 22,
            color: 'rgba(255,255,255,0.65)',
            lineHeight: 1.4,
            maxWidth: 800,
          }}>
            Курсы, тесты, клинические калькуляторы и шкалы — для студентов и врачей.
          </div>
        </div>

        {/* Footer: domain */}
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
