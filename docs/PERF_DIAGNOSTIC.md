# Performance diagnostic — baseline (2026-04-28)

> Снимок производительности `https://bordik-med.vercel.app/`
> на момент **до оптимизации**. См. PR'ы после этой даты для применённых
> правок и финальных метрик.

---

## Lighthouse mobile (slow-4G + 4× CPU throttle)

| Metric | Value | Score |
|---|---|---|
| **Performance** | **87/100** | 🟢 |
| TTFB | 110 ms | 100 |
| FCP | 1.2 s | 99 |
| Speed Index | 2.5 s | 98 |
| **LCP** | **3.3 s** | 70 ⚠️ |
| TTI | 3.3 s | 93 |
| **TBT** | **250 ms** | 84 ⚠️ |
| CLS | 0 | 100 |
| Total bytes | 527 KB | 100 |

LCP element: **StorageBanner** (paints at +913 ms post-FCP because of useEffect-gated render).

---

## Initial JS bundle on home

| Chunk | Raw | Gzip | Content |
|---|---|---|---|
| `app/page-*.js` | 284 KB | 70 KB | Home + Sidebar + Roadmap |
| `86511-*.js` | 227 KB | 63 KB | Next.js framework |
| `4bd1b696-*.js` | 200 KB | 64 KB | React DOM |
| `35536-*.js` | 177 KB | 50 KB | @supabase (45.9 KB unused) |
| `72088-*.js` | 135 KB | 45 KB | framer-motion + zustand |
| `polyfills-*.js` | 113 KB | 40 KB | legacy polyfills |
| Other | 92 KB | 32 KB | layout/error/etc |
| **TOTAL** | **1.23 MB** | **364 KB** | |

Lighthouse "unused JavaScript" savings: **130 KB** — primary culprit Supabase chunk (92% unused on anonymous home).

---

## Long tasks (drives TBT 250 ms)

| Duration | Source |
|---|---|
| 215 ms | Unattributable |
| 105 ms | Supabase chunk parse + execute |
| 98 ms | Next framework chunk |
| 95 ms | Initial HTML hydration |
| 86 ms | Next framework (chunk #2) |

Main thread breakdown: 423 ms script eval + 379 ms "other" + 312 ms style/layout + 88 ms parse/compile.

---

## Прогноз на слабые устройства

Мобильное 4-летнее устройство (Snapdragon 660 / Helio P22, 3 GB RAM, 3G):
- LCP × 1.5-2× = **5-6 с**
- TBT × 2-3× = **500-750 ms**
- Performance score → 65-75 (yellow zone)

---

## Headers / network — всё в норме

✅ HSTS preload, COOP/COEP/CORP, Permissions-Policy
✅ CSP nonce per-request (Report-Only mode)
✅ Vercel CDN: TTFB 110 ms
✅ Brotli/gzip on
✅ Service Worker registered (repeat visits dramatically faster)
✅ Preconnect on Supabase + Gemini
✅ No render-blocking resources
✅ CLS = 0 — layout stable

---

## Identified bottlenecks (priority order)

### P0 (high impact, low effort)

1. **StorageBanner / InstallPrompt — late render**
   useEffect-gated → paints +913 ms after FCP → becomes LCP candidate.
   **Fix**: synchronous `useState` initializer reading localStorage.

2. **Supabase chunk — 92% unused on home**
   Eager-imported via `useSupabaseSync` from `app/page.tsx`. Anonymous
   visitors don't need the auth client until sign-in click.
   **Fix**: dynamic import on first sign-in event.

3. **Polyfills 113 KB raw**
   Excessive for 2026 browser targets.
   **Fix**: tighten `.browserslistrc`.

### P1 (medium impact, more work)

4. **framer-motion in Sidebar (eager)**
   Used for one slide-in transition; pulls 80 KB raw.
   **Fix**: replace with CSS `@starting-style` (Baseline 2025).

5. **`lib/curriculum.ts` 237 KB raw**
   All 700+ courses metadata loaded on home; only sections meta needed
   for first paint.
   **Fix**: split into `curriculum-sections.ts` + lazy `curriculum-courses.ts`.

### P2 (polish)

6. Pre-render Roadmap as static SVG at build time (instant LCP)
7. Replace `@vercel/analytics` package with raw `web-vitals` beacon (-5-10 KB)
8. React 19 server components migration where possible (current setup
   has `'use client'` on root page.tsx)

---

## After optimization (2026-04-29, deploy ea4e145+dfd2ff5)

| Metric | Before (87) | After (89) | Δ |
|---|---|---|---|
| Performance score | 87 | **89** | +2 |
| FCP | 1.2 s | 1.3 s | ~same |
| LCP | 3.3 s | 3.4 s | ~same |
| **TBT** | **250 ms** | **120 ms** | **-130 ms** ✅ |
| Speed Index | 2.5 s | 3.9 s | ⚠️ regressed |
| TTI | 3.3 s | 3.5 s | ~same |
| CLS | 0 | 0.001 | ~same |
| Total bytes | 527 KB | 487 KB | -40 KB |
| Unused JS savings | 130 KB | 90 KB | -40 KB |

### Initial JS critical path

| | Before | After |
|---|---|---|
| Total raw | 1.23 MB | 826 KB |
| Home page-*.js | 270 KB | **109 KB** |
| Curriculum data | shipped eager | **lazy chunk** |
| Supabase | shipped eager | **lazy chunk** |
| framer-motion in Sidebar | shipped + runs | replaced with CSS |

### Wins
- **TBT dropped 130 ms** — hits the ≤200 ms target. On slow devices (4× CPU
  throttle) this is the single biggest UX-perceptible improvement.
- Home page chunk down by 60% (270 → 109 KB raw).
- Curriculum module data (~200 KB) and Supabase (~50 KB gz) both moved to
  lazy chunks — anonymous home loads neither.

### Remaining issues
- **LCP 3.4 s** — still above 2.5 s target. Lighthouse identifies the
  `app-main-wrap` div with 1990 ms element-render-delay. Root cause: home
  shell (sidebar + section cards) is hydrated client-side. SSR-rendering
  the section cards is the next P0 target.
- **Speed Index regressed 2.5 → 3.9 s**. Counter-intuitive but explained
  by the lazy-chunk strategy: total bytes fell, but the visual paint now
  happens across multiple async chunk arrivals → SI waits for everything
  to land. Expected to recover when section cards are SSR'd (point above).

### Next P0 target

Server-render the SectionCards. They're driven entirely by precomputed
data (SECTIONS + SECTION_TOTAL_COURSES + SECTION_COURSE_IDS) so SSR is
straightforward; the only client-only piece is the per-user
`completedCount` from Zustand, which can hydrate progressively.

Expected impact: LCP 3.4 → ≤ 2.0 s, Speed Index 3.9 → ≤ 2.0 s.
