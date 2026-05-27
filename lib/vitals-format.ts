/**
 * Formats a Core Web Vitals metric value into a human-readable string.
 *
 * CLS (Cumulative Layout Shift) is a dimensionless score between 0 and 1,
 * NOT milliseconds. Using Math.round() collapses all CLS values < 0.5 to
 * "0ms" in Sentry titles, making the actual score invisible.
 *
 * All other metrics (LCP, FCP, TTFB, INP) are in milliseconds and should
 * be rounded to the nearest integer.
 */
export function formatVitalsMessage(name: string, rating: string, value: number): string {
  if (name === 'CLS') {
    return `web-vitals · ${name} ${rating} (${value.toFixed(3)})`;
  }
  return `web-vitals · ${name} ${rating} (${Math.round(value)}ms)`;
}

/**
 * Formats a metric value for use in breadcrumb messages.
 * Same CLS-aware logic as formatVitalsMessage.
 */
export function formatVitalsBreadcrumb(name: string, value: number, rating: string): string {
  if (name === 'CLS') {
    return `${name}: ${value.toFixed(3)} (${rating})`;
  }
  return `${name}: ${Math.round(value)} (${rating})`;
}
