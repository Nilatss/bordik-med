/**
 * AAP 2022 Bilirubin Nomogram — math + decision logic.
 *
 * Inputs:
 *   - GA в неделях (35–42+)
 *   - возраст в часах жизни (0–336)
 *   - TSB в mg/dL или μmol/L
 *   - набор risk-факторов (айдишники)
 *
 * Output:
 *   - threshold для фототерапии и обменного переливания на этот час
 *   - clinical decision (one of CLEAR / NEAR / PHOTOTHERAPY / INTENSIVE / EXCHANGE)
 *   - страт (low/medium/high) исходя из GA + risk-факторов
 *
 * Curves строятся линейной интерполяцией между опорными часами.
 */
'use client';

export interface ThresholdPoint {
  hour: number;
  tsb: number;
}

export interface BilirubinBank {
  version: string;
  lastUpdated: string;
  source: string;
  license: string;
  units: { default: 'mg/dL'; alt: 'umol/L'; conversionFactor: number };
  riskFactors: Array<{ id: string; label_ru: string; label_en: string }>;
  thresholds: {
    phototherapy: Record<RiskStratum, ThresholdPoint[]>;
    exchange: Record<RiskStratum, ThresholdPoint[]>;
  };
}

export type RiskStratum = 'ge38_norisk' | 'ge38_risk_or_3537_norisk' | 'lt38_risk';

export type Decision =
  | 'clear'           // ниже фототерапии минимум на 3 mg/dL
  | 'monitor'         // в пределах 3 mg/dL ниже фототерапии
  | 'phototherapy'    // достигли фототерапии
  | 'intensive'       // в пределах 2 mg/dL от обменного
  | 'exchange';       // достигли обменного

export interface Recommendation {
  decision: Decision;
  label_ru: string;
  detail_ru: string;
  tone: 'ok' | 'monitor' | 'warning' | 'critical';
  ptThreshold: number;
  exThreshold: number;
  marginToPt: number;
  marginToEx: number;
}

/** Линейная интерполяция значения порога на заданный час. */
export function thresholdAt(points: ThresholdPoint[], hour: number): number | null {
  if (points.length === 0) return null;
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last) return null;
  if (hour <= first.hour) return first.tsb;
  if (hour >= last.hour) return last.tsb;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    if (!a || !b) continue;
    if (hour >= a.hour && hour <= b.hour) {
      const t = (hour - a.hour) / (b.hour - a.hour);
      return a.tsb + (b.tsb - a.tsb) * t;
    }
  }
  return null;
}

/** Определяет страт риска по AAP 2022 на основе GA и активных факторов риска. */
export function classifyStratum(gaWeeks: number, riskIds: ReadonlyArray<string>): RiskStratum {
  const hasNonGaRisk = riskIds.some((id) => id !== 'ga_lt_38');
  if (gaWeeks < 38) {
    return hasNonGaRisk ? 'lt38_risk' : 'ge38_risk_or_3537_norisk';
  }
  // GA ≥ 38
  return hasNonGaRisk ? 'ge38_risk_or_3537_norisk' : 'ge38_norisk';
}

/** Принимает решение по AAP 2022 алгоритму. */
export function decide(tsb: number, ptThreshold: number, exThreshold: number): Recommendation {
  const marginToPt = ptThreshold - tsb;
  const marginToEx = exThreshold - tsb;

  let decision: Decision;
  let label_ru: string;
  let detail_ru: string;
  let tone: Recommendation['tone'];

  if (tsb >= exThreshold) {
    decision = 'exchange';
    label_ru = 'Обменное переливание';
    detail_ru = 'Срочно: интенсивная фототерапия + подготовка к обменному переливанию. Перевод в ОРИТН.';
    tone = 'critical';
  } else if (tsb >= exThreshold - 2) {
    decision = 'intensive';
    label_ru = 'Интенсивная фототерапия';
    detail_ru = 'Двойная/тройная фототерапия, повторить TSB через 2–3 ч. Готовиться к обменному, если рост сохраняется.';
    tone = 'critical';
  } else if (tsb >= ptThreshold) {
    decision = 'phototherapy';
    label_ru = 'Начать фототерапию';
    detail_ru = 'Стандартная фототерапия. Повторить TSB через 4–6 ч после начала, далее каждые 6–12 ч до устойчивого снижения.';
    tone = 'warning';
  } else if (marginToPt <= 3) {
    decision = 'monitor';
    label_ru = 'Близко к порогу — наблюдение';
    detail_ru = `До фототерапии ${marginToPt.toFixed(1)} mg/dL. Повторить TSB через 4–6 ч; оценить факторы риска повторно.`;
    tone = 'monitor';
  } else {
    decision = 'clear';
    label_ru = 'Ниже порога — рутинное наблюдение';
    detail_ru = `До фототерапии ${marginToPt.toFixed(1)} mg/dL. Повторное измерение по клинической ситуации.`;
    tone = 'ok';
  }

  return {
    decision,
    label_ru,
    detail_ru,
    tone,
    ptThreshold,
    exThreshold,
    marginToPt,
    marginToEx,
  };
}

export const STRATUM_LABEL_RU: Record<RiskStratum, string> = {
  ge38_norisk: '≥ 38 нед, без факторов риска',
  ge38_risk_or_3537_norisk: '≥ 38 нед с факторами риска ИЛИ 35–37+6 без рисков',
  lt38_risk: '35–37+6 нед с факторами риска',
};

export const STRATUM_LABEL_EN: Record<RiskStratum, string> = {
  ge38_norisk: '≥ 38 wk, no risk',
  ge38_risk_or_3537_norisk: '≥ 38 wk + risk OR 35–37+6 wk no risk',
  lt38_risk: '35–37+6 wk + risk',
};

/** Конверсия μmol/L → mg/dL и обратно. AAP пороги — в mg/dL. */
export function convert(value: number, from: 'mg/dL' | 'umol/L', to: 'mg/dL' | 'umol/L', factor: number): number {
  if (from === to) return value;
  if (from === 'umol/L' && to === 'mg/dL') return value / factor;
  if (from === 'mg/dL' && to === 'umol/L') return value * factor;
  return value;
}
