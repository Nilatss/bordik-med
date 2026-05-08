'use client';

/**
 * Real-User-Metrics reporter — pipes Core Web Vitals into Sentry.
 *
 * Why this exists alongside Sentry's auto-tracing
 * -----------------------------------------------
 * `@sentry/nextjs`'s `browserTracingIntegration` already records LCP /
 * CLS / FID / INP / FCP / TTFB on the pageload transaction. Two
 * problems with relying on that alone:
 *
 *   1. Transactions count against the Sentry trace quota; with our
 *      `tracesSampleRate: 0.1` we capture only 10 % of pageloads.
 *      For a low-traffic platform that's a thin sample to draw any
 *      regression conclusions from.
 *
 *   2. Transaction events also carry the entire request waterfall and
 *      span tree, which is overkill if all we want to know is "did
 *      the p75 LCP move this week?".
 *
 * This component fixes both: it taps the `web-vitals` package's
 * callbacks (which fire exactly once per metric per pageload) and
 * forwards each measurement as:
 *   - a Sentry breadcrumb (cheap, free, attached to whatever event is
 *     captured next on this page — useful for correlating "this user
 *     hit a JS error AND had a 5-second LCP")
 *   - a sampled `captureMessage` (5 % of "good" / "needs-improvement"
 *     plus 100 % of "poor" — so the Issues feed surfaces real-user
 *     regressions without drowning in green-grade noise)
 *
 * Tags written on every event so the Sentry dashboard can slice by:
 *   - `vital`       (LCP / CLS / INP / FCP / TTFB)
 *   - `vital.rating` (good / needs-improvement / poor)
 *   - `device`      (mobile / desktop)
 *   - `connection`  (effectiveType from navigator.connection: 4g / 3g / etc.)
 *   - `route`       (pathname only — search params stripped to keep
 *                    cardinality bounded)
 *
 * The reporter is mounted lazily via next/dynamic({ ssr: false }) so
 * the `web-vitals` chunk doesn't enter the SSR'd payload.
 */
import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { onLCP, onCLS, onINP, onFCP, onTTFB, type Metric } from 'web-vitals';

// Sample rate for "good" + "needs-improvement" ratings; "poor" always
// captures. 0.05 → ~5 % of healthy metrics get a Sentry message; the
// rest still leave a breadcrumb. 100 % "poor" because regressions are
// the actionable signal.
const HEALTHY_SAMPLE_RATE = 0.05;

// P3-PERF-NEW-2 — 3-tier device breakpoint вместо binary mobile/desktop.
// Раньше в Sentry смешивались маленькие телефоны (iPhone SE) и большие
// планшеты (iPad Pro) под "mobile". p75-LCP на этих устройствах
// различается в 2-3 раза → агрегированный график даёт fake regression
// signal. Делим на:
//   - mobile  (<= 600px) — телефоны
//   - tablet  (601-1024px) — планшеты, foldables
//   - desktop (>= 1025px)
// Breakpoint'ы выровнены с Tailwind sm/md → позже sliceability.
function deviceCategory(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  if (window.matchMedia('(max-width: 600px)').matches) return 'mobile';
  if (window.matchMedia('(max-width: 1024px)').matches) return 'tablet';
  return 'desktop';
}

function effectiveConnection(): string {
  try {
    const nav = navigator as Navigator & {
      connection?: { effectiveType?: string };
    };
    return nav.connection?.effectiveType ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

function reportMetric(metric: Metric) {
  const route = typeof window !== 'undefined'
    ? window.location.pathname || '/'
    : '/';
  const tags = {
    vital: metric.name,
    'vital.rating': metric.rating,
    device: deviceCategory(),
    connection: effectiveConnection(),
    route,
  };

  // Breadcrumbs are essentially free and stay with the session — every
  // future Sentry event from this pageload will carry the metric in
  // its breadcrumb trail.
  Sentry.addBreadcrumb({
    category: 'web-vitals',
    type: 'info',
    level: metric.rating === 'poor' ? 'warning' : 'info',
    message: `${metric.name}: ${Math.round(metric.value)} (${metric.rating})`,
    data: {
      value: metric.value,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
    },
  });

  // Sampling: always capture poor; small fraction of healthy.
  const shouldCapture =
    metric.rating === 'poor' || Math.random() < HEALTHY_SAMPLE_RATE;
  if (!shouldCapture) return;

  Sentry.captureMessage(
    `web-vitals · ${metric.name} ${metric.rating} (${Math.round(metric.value)}ms)`,
    {
      level: metric.rating === 'poor' ? 'warning' : 'info',
      tags,
      extra: {
        value: metric.value,
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
      },
      // Group identical regression signals together — one Sentry issue
      // per (metric, rating, route) combo, regardless of session.
      fingerprint: ['web-vitals', metric.name, metric.rating, route],
    },
  );
}

export default function WebVitalsReporter() {
  useEffect(() => {
    // Only enable in production; dev builds emit synthetic vitals via
    // HMR / fast refresh that pollute the Sentry feed.
    if (process.env.NODE_ENV !== 'production') return;

    onLCP(reportMetric);
    onCLS(reportMetric);
    onINP(reportMetric);
    onFCP(reportMetric);
    onTTFB(reportMetric);
  }, []);

  return null;
}
