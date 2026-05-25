/**
 * buildSmokeDefaults — construct a "plausible default" input map for a
 * calculator/score runner so the auto-generated smoke tests can actually
 * invoke compute() (rather than only asserting shape).
 *
 * Priority for each input value:
 *   1. A preset — if the runner ships `presets[0].values`, start from a
 *      clone of it. Presets are author-validated clinical inputs, so they
 *      are the most reliable seed and avoid div-by-zero / NaN edge cases.
 *   2. Per-input fallback for any id the preset doesn't cover:
 *        - number   → first `quickValues` entry, else `min` (when finite
 *                     and > 0), else 1. Non-zero by design so formulas that
 *                     divide by an input don't produce Infinity/NaN.
 *        - select   → the first option's `value`.
 *        - checkbox → false.
 *
 * This is a behavioural SMOKE seed, not a clinical fixture — it proves
 * compute() runs end-to-end and returns a defined `value`. Domain
 * correctness is covered by hand-written golden tests.
 *
 * NOTE: lives outside the `*.test.ts` glob so vitest never collects it as
 * a test file.
 */

type InputType = 'number' | 'checkbox' | 'select';

interface ToolInputLike {
  id: string;
  type: InputType;
  min?: number;
  max?: number;
  quickValues?: number[];
  options?: { value: string | number }[];
}

interface PresetLike {
  values?: Record<string, unknown>;
}

export type SmokeValue = number | boolean | string;

function defaultForInput(input: ToolInputLike): SmokeValue {
  switch (input.type) {
    case 'checkbox':
      return false;
    case 'select': {
      const first = input.options?.[0]?.value;
      // Fall back to empty string if a select somehow has no options — the
      // runner will then take its default branch rather than crash here.
      return first ?? '';
    }
    case 'number':
    default: {
      const qv = input.quickValues?.[0];
      if (typeof qv === 'number' && Number.isFinite(qv)) return qv;
      if (typeof input.min === 'number' && Number.isFinite(input.min) && input.min > 0) {
        return input.min;
      }
      // Non-zero default avoids div-by-zero in ratio/index formulas.
      return 1;
    }
  }
}

/**
 * Build a `{ [inputId]: value }` map suitable for calling `runner.compute()`.
 *
 * @param inputs  runner.inputs (loosely typed — only id/type/min/quickValues/options are read)
 * @param presets runner.presets (optional) — preferred seed when present
 */
export function buildSmokeDefaults(
  inputs: unknown,
  presets?: unknown,
): Record<string, SmokeValue> {
  const out: Record<string, SmokeValue> = {};

  // Seed from the first preset, if any. Only copy primitive values of the
  // expected union; ignore anything exotic so a malformed preset can't
  // poison the map.
  const presetArr = Array.isArray(presets) ? (presets as PresetLike[]) : [];
  const seed = presetArr[0]?.values;
  if (seed && typeof seed === 'object') {
    for (const [k, v] of Object.entries(seed)) {
      if (typeof v === 'number' || typeof v === 'boolean' || typeof v === 'string') {
        out[k] = v;
      }
    }
  }

  // Fill any inputs the preset didn't set.
  const inputArr = Array.isArray(inputs) ? (inputs as ToolInputLike[]) : [];
  for (const input of inputArr) {
    if (!input || typeof input.id !== 'string') continue;
    if (Object.prototype.hasOwnProperty.call(out, input.id)) continue;
    out[input.id] = defaultForInput(input);
  }

  return out;
}
