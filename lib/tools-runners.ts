/**
 * Клинические инструменты — working implementations.
 * Each tool has either a SCORE definition (criteria + interpretation)
 * or a CALCULATOR definition (inputs + formula).
 *
 * Реализация опирается на международные стандарты (ACC/AHA, ESC, WHO, NICE, KDIGO, AHA, и т.д.)
 */

export type InputType = 'number' | 'checkbox' | 'select';

export interface ToolInput {
  id: string;
  label: string;
  type: InputType;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  /** For 'checkbox': points awarded when checked */
  points?: number;
  /** For 'select': options */
  options?: { value: string | number; label: string; points?: number }[];
  /** Help hint */
  hint?: string;
  /** Quick-pick values rendered as chips below a number input */
  quickValues?: number[];
}

export interface ScoreBand {
  min: number;
  max: number;
  label: string;
  color: string;
  description: string;
  /** Longer narrative shown under the headline when this band is hit */
  details?: string;
  /** Recommended clinical actions for this band */
  actions?: string[];
}

export interface Preset {
  /** Short label shown on the chip — e.g. "♂ 30 лет, 70 кг" */
  label: string;
  /** Values to apply to each input by id */
  values: Record<string, number | boolean | string>;
}

export interface ScoreTool {
  kind: 'score';
  inputs: ToolInput[];
  bands: ScoreBand[];
  /** Max possible score — for progress display */
  maxScore: number;
  /** Reference / formula note */
  reference: string;
  /** Long-form clinical article in Markdown — rendered under the calculator */
  info?: string;
  /** Optional quick-fill examples */
  presets?: Preset[];
  /** Countries / regions where the tool is commonly used. Pre-formatted string, e.g. "Международный" or "США · ЕС · РФ" */
  countries?: string;
  /** Tool-level caveats shown in the result card regardless of band */
  caveats?: string[];
  /** Related tool IDs shown as navigation chips under the result */
  related?: { id: string; title: string }[];
  /**
   * Related courses where this tool is used or discussed. Max 3.
   * Only populate when the connection is genuine — not as filler.
   * `id` matches a course id from `lib/curriculum.ts` (e.g. "100.2").
   */
  relatedCourses?: { id: string; title: string }[];
}

/**
 * Optional rich-result extras. Any of these fields, when present on a
 * calculator (or a score band), are rendered as additional sections below
 * the main result headline. They let a tool explain the number rather than
 * just print it — visual severity scale, recommended actions, differential
 * breakdown, caveats and so on.
 *
 * Everything is optional and backwards-compatible.
 */
export interface ResultScaleSegment {
  /** Inclusive lower bound */
  min: number;
  /** Inclusive upper bound (use Infinity for open-ended) */
  max: number;
  label: string;
  color: string;
}

export interface ResultExtras {
  /** Longer narrative shown under the headline */
  details?: string;
  /** Bulleted next steps / clinical recommendations */
  actions?: string[];
  /** Free-form differential / mnemonic unpack (e.g. MUDPILES) */
  differential?: { term: string; desc: string }[];
  /** Caveats, pitfalls, when the number is unreliable */
  caveats?: string[];
  /** Horizontal band scale. `current` is the numeric position for the marker. */
  scale?: {
    segments: ResultScaleSegment[];
    current: number;
    unit?: string;
  };
  /** Related tools shown as small navigation chips */
  related?: { id: string; title: string }[];
  /**
   * Related courses where this tool appears or is taught. Max 3.
   * Only populate when the connection is genuine — not as filler.
   */
  relatedCourses?: { id: string; title: string }[];
}

export interface CalculatorResult extends ResultExtras {
  value: string;
  unit?: string;
  interpretation: string;
  color: string;
}

export interface CalculatorTool {
  kind: 'calculator';
  inputs: ToolInput[];
  /** Compute function — returns headline + optional rich extras */
  compute: (values: Record<string, number | boolean | string>) => CalculatorResult;
  reference: string;
  /** Long-form clinical article in Markdown — rendered under the calculator */
  info?: string;
  /** Optional quick-fill examples */
  presets?: Preset[];
  /** Countries / regions where the tool is commonly used */
  countries?: string;
}

export type ToolRunner = ScoreTool | CalculatorTool;

/* ═══════════════════════════════════════════════
   Utility helpers
   ═══════════════════════════════════════════════ */

/** Sum points from checkbox + select inputs */
function sumScore(
  inputs: ToolInput[],
  values: Record<string, number | boolean | string>
): number {
  let total = 0;
  for (const inp of inputs) {
    if (inp.type === 'checkbox' && values[inp.id] === true && inp.points) {
      total += inp.points;
    } else if (inp.type === 'select' && inp.options) {
      const selVal = values[inp.id];
      const opt = inp.options.find((o) => String(o.value) === String(selVal));
      if (opt?.points) total += opt.points;
    } else if (inp.type === 'number' && typeof values[inp.id] === 'number' && inp.points) {
      // Numeric criterion (rare, usually via select)
      if (values[inp.id] === 1) total += inp.points;
    }
  }
  return total;
}

/** Find band by score */
export function findBand(bands: ScoreBand[], score: number): ScoreBand {
  for (const b of bands) {
    if (score >= b.min && score <= b.max) return b;
  }
  return bands[0];
}

/* ═══════════════════════════════════════════════
   Реестр рабочих инструментов
   ═══════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════
   Runner registry has moved to ./runners/
   Each runner now lives in its own file lib/runners/<id>.ts and is loaded
   lazily via dynamic import. The legacy synchronous getRunner() and
   TOOL_RUNNERS exports have been removed — use loadRunner() from
   lib/runners/index.ts instead.
   ═══════════════════════════════════════════════ */

export { loadRunner, getCachedRunner, hasRunner, RUNNER_LOADERS } from './runners';
