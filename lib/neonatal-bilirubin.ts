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
  label_ru: string;          // короткий вердикт для card-header
  detail_ru: string;         // развёрнутое клиническое объяснение
  rationale_ru: string;      // почему именно так — ссылка на критерий AAP
  reference: string;         // источник классификации
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

/**
 * Принимает решение по AAP 2022 алгоритму.
 *
 * `tsb`/`ptThreshold`/`exThreshold` are always mg/dL internally (that's
 * the unit AAP thresholds are tabulated in). `displayUnit`+`fmtValue`
 * only control how those same mg/dL numbers are *rendered* inside the
 * returned Russian explanation text — pass the caller's active display
 * unit (e.g. µmol/L) so the guidance text doesn't silently keep
 * printing mg/dL numbers/labels while the rest of the UI has switched
 * units, which would read as mismatched numbers in the same panel.
 */
export function decide(
  tsb: number,
  ptThreshold: number,
  exThreshold: number,
  displayUnit: string = 'mg/dL',
  fmtValue: (v: number) => string = (v) => v.toFixed(1),
): Recommendation {
  const marginToPt = ptThreshold - tsb;
  const marginToEx = exThreshold - tsb;
  const REF = 'AAP 2022 — Kemper AR, Newman TB, Slaughter JL, et al. Pediatrics 2022;150(3):e2022058859';
  const u = (v: number) => `${fmtValue(v)} ${displayUnit}`;

  let decision: Decision;
  let label_ru: string;
  let detail_ru: string;
  let rationale_ru: string;
  let tone: Recommendation['tone'];

  if (tsb >= exThreshold) {
    decision = 'exchange';
    label_ru = 'Обменное переливание';
    detail_ru = `Срочно: интенсивная фототерапия (двойная/тройная лампа, расстояние ≤30 см, прозрачный кювет) + подготовка к обменному переливанию (двойной объёмный обмен ОЦК ~160 мл/кг). Перевод в ОРИТН. Контроль TSB через 2 ч после начала интенсивной ФТ; если снижение менее 1–2 mg/dL/ч — выполнять обменное.`;
    rationale_ru = `TSB ${u(tsb)} ≥ порога обменного переливания ${u(exThreshold)}. Согласно AAP 2022 (Table 1, Figure 4), достижение exchange threshold = острый risk билирубиновой энцефалопатии (ОБЭ); intensive PT + обмен показаны без отлагательств.`;
    tone = 'critical';
  } else if (tsb >= exThreshold - 2) {
    decision = 'intensive';
    label_ru = 'Интенсивная фототерапия';
    detail_ru = `Двойная/тройная фототерапия ≥30 µW/cm²/nm на участке кожи, IV-гидратация при необходимости. Повторить TSB через 2–3 ч. Готовиться к обменному переливанию (group&match, типирование, согласие родителей), если рост TSB сохраняется или снижение менее 0.5 mg/dL/ч.`;
    rationale_ru = `TSB ${u(tsb)} в пределах ${u(2)} до обменного переливания (порог ${u(exThreshold)}). AAP 2022 рекомендует escalation в intensive PT при достижении этой зоны "escalation-of-care threshold".`;
    tone = 'critical';
  } else if (tsb >= ptThreshold) {
    decision = 'phototherapy';
    label_ru = 'Начать фототерапию';
    detail_ru = `Стандартная фототерапия — голубой свет 460–490 nm, ≥8–10 µW/cm²/nm, расстояние 30–50 см от кожи. Раздеть до подгузника, защитить глаза. Повторить TSB через 4–6 ч после начала, далее каждые 6–12 ч до устойчивого снижения. Прекратить, когда TSB < порога фототерапии минус 2 mg/dL.`;
    rationale_ru = `TSB ${u(tsb)} ≥ порога фототерапии ${u(ptThreshold)} для текущего страта риска. AAP 2022 (Figure 2) — phototherapy threshold для предотвращения нарастания TSB к exchange-уровню.`;
    tone = 'warning';
  } else if (marginToPt <= 3) {
    decision = 'monitor';
    label_ru = 'Близко к порогу — наблюдение';
    detail_ru = `До фототерапии ${u(marginToPt)}. Повторить TSB через 4–6 ч (или раньше при клиническом ухудшении); оценить динамику нарастания (rate-of-rise: > 0.3 mg/dL/ч после 24 ч жизни — предиктор пересечения порога), пересмотреть факторы риска нейротоксичности.`;
    rationale_ru = `TSB ${u(tsb)} в пределах ${u(3)} ниже порога фототерапии (${u(ptThreshold)}). Зона "active monitoring" по AAP 2022 — недостаточно для лечения, но требует усиленного контроля.`;
    tone = 'monitor';
  } else {
    decision = 'clear';
    label_ru = 'Ниже порога — рутинное наблюдение';
    detail_ru = `До фототерапии ${u(marginToPt)} — комфортный запас. Повторное измерение по клинической ситуации (при выписке — TcB или TSB перед уходом домой; при риске — повторно через 24–48 ч после выписки).`;
    rationale_ru = `TSB ${u(tsb)} более чем на ${u(3)} ниже порога фототерапии (${u(ptThreshold)}). Это безопасная зона по AAP 2022 для текущего страта риска.`;
    tone = 'ok';
  }

  return {
    decision,
    label_ru,
    detail_ru,
    rationale_ru,
    reference: REF,
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
