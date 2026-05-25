/**
 * Plain-text rendering of a calculator result for copy-to-clipboard.
 * Clinicians routinely paste a score + interpretation into notes, e.g.
 * "4 балла - высокий риск инсульта" or "Garden IV - смещённый".
 *
 * Pure (no React) so it is unit-testable in node-env.
 */
export function formatResultForCopy(r: {
  value: string | number;
  unit?: string | undefined;
  interpretation?: string | undefined;
}): string {
  const head = `${r.value ?? ''}${r.unit ? ` ${r.unit}` : ''}`.trim();
  const interp = (r.interpretation ?? '').trim();
  if (head && interp) return `${head} - ${interp}`;
  return head || interp;
}
