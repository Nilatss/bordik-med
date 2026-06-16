/**
 * Score-kind result computation, extracted from ToolView.tsx useMemo.
 *
 * Exported so the logic can be unit-tested independently of React.
 *
 * Bug fix (Bug #2): the inlined version had no try-catch around findBand(),
 * unlike the calculator-kind path which has `catch { return null }`. If
 * findBand throws (empty bands array on a hypothetical misconfigured runner),
 * the useMemo would throw and crash the entire ToolView component tree.
 * This function returns null on any exception, matching the calculator path.
 */
import { findBand, type ScoreTool, type CalculatorResult } from '@/lib/tools-runners';

export function computeScoreResult(
  runner: ScoreTool,
  values: Record<string, number | boolean | string>,
): CalculatorResult | null {
  try {
    let total = 0;
    for (const inp of runner.inputs) {
      if (inp.type === 'checkbox' && values[inp.id] === true && inp.points) {
        total += inp.points;
      } else if (inp.type === 'select' && inp.options) {
        const opt = inp.options.find((o) => String(o.value) === String(values[inp.id]));
        if (opt?.points) total += opt.points;
      }
    }
    const band = findBand(runner.bands, total);
    const sortedBands = [...runner.bands].sort((a, b) => a.min - b.min);
    return {
      value: String(total),
      unit: `из ${runner.maxScore}`,
      interpretation: `${band.label} · ${band.description}`,
      color: band.color,
      scale: {
        segments: sortedBands.map((b) => ({
          min: b.min,
          max: b.max,
          label: b.label,
          color: b.color,
        })),
        current: total,
        unit: `из ${runner.maxScore}`,
      },
      details: band.details,
      actions: band.actions,
      caveats: runner.caveats,
      related: runner.related,
      relatedCourses: runner.relatedCourses,
    };
  } catch {
    return null;
  }
}
