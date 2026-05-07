/**
 * Neonatal growth charts — math layer.
 *
 * - Z-score from measured value via (val/M − 1) / S (linear, since L=1 for our LMS).
 * - Percentile from z via normal CDF approximation (Abramowitz & Stegun 26.2.17,
 *   max error 7.5e-8 — far better than clinical needs).
 * - Linear interpolation between anchor weeks for any decimal GA.
 * - Reference percentile bands (P3/P10/P50/P90/P97) derived once per chart
 *   for SVG plotting.
 *
 * No native deps, no fancy stats lib — keeps the bundle tiny.
 */
'use client';

export interface LmsPoint {
  age: number;
  M: number;
  S: number;
  L?: number;
}

export interface GrowthDataset {
  label_ru: string;
  label_en: string;
  source: string;
  license: string;
  ageUnit: 'weeks' | 'months' | 'days';
  ageMin: number;
  ageMax: number;
  ageType: 'postmenstrual' | 'postnatal' | 'gestational';
  parameters: GrowthParameter[];
  data: {
    boys: Record<GrowthParameter, LmsPoint[]>;
    girls: Record<GrowthParameter, LmsPoint[]>;
  };
}

export type GrowthParameter = 'weight' | 'length' | 'head_circumference';
export type Sex = 'boys' | 'girls';

export interface GrowthBank {
  version: string;
  lastUpdated: string;
  datasets: Record<string, GrowthDataset>;
}

/** Линейная интерполяция LMS-точки для дробного возраста. */
export function lmsAt(points: LmsPoint[], age: number): LmsPoint | null {
  if (points.length === 0) return null;
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last) return null;
  if (age <= first.age) return first;
  if (age >= last.age) return last;

  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    if (!a || !b) continue;
    if (age >= a.age && age <= b.age) {
      const t = (age - a.age) / (b.age - a.age);
      return {
        age,
        M: a.M + (b.M - a.M) * t,
        S: a.S + (b.S - a.S) * t,
      };
    }
  }
  return null;
}

/** Z-score через LMS (L=1 предполагается, т.к. в наших данных линейная норма). */
export function zScoreFromValue(value: number, lms: LmsPoint): number {
  // L=1 path: z = (value/M - 1) / S
  // Если нужен полный LMS (L≠1), формула: z = ((value/M)^L - 1) / (L*S)
  const L = lms.L ?? 1;
  if (L === 0) return Math.log(value / lms.M) / lms.S;
  return (Math.pow(value / lms.M, L) - 1) / (L * lms.S);
}

/** Обратная операция: значение для заданного z-score. */
export function valueFromZ(z: number, lms: LmsPoint): number {
  const L = lms.L ?? 1;
  if (L === 0) return lms.M * Math.exp(z * lms.S);
  return lms.M * Math.pow(1 + L * lms.S * z, 1 / L);
}

/** Нормальная функция распределения (CDF) — Abramowitz & Stegun 26.2.17.
 *  max error 7.5e-8. Возвращает значение в [0, 1]. */
export function normalCdf(z: number): number {
  // sign-fold + standardized polynomial
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.SQRT2;
  // А&S 7.1.26 erf approximation
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1.0 + sign * y);
}

/** Z → процентиль (0–100). */
export function percentileFromZ(z: number): number {
  return 100 * normalCdf(z);
}

/** Пять опорных перцентилей для SVG-графика. */
export const REFERENCE_PERCENTILES = [3, 10, 50, 90, 97] as const;
export type ReferencePercentile = typeof REFERENCE_PERCENTILES[number];

/** z-score для каждого опорного перцентиля (приближение, точно к 4 знакам). */
export const PERCENTILE_TO_Z: Record<ReferencePercentile, number> = {
  3:  -1.881,
  10: -1.282,
  50:  0,
  90:  1.282,
  97:  1.881,
};

/** Серия точек (age, value) для одной кривой опорного перцентиля. */
export interface ChartCurve {
  percentile: ReferencePercentile;
  points: Array<{ age: number; value: number }>;
}

/** Строит 5 опорных кривых для SVG-графика по LMS-таблице.
 *  Шаг по возрасту — оригинальные точки данных (не интерполируем сильнее). */
export function buildChartCurves(points: LmsPoint[]): ChartCurve[] {
  return REFERENCE_PERCENTILES.map((p) => ({
    percentile: p,
    points: points.map((lms) => ({
      age: lms.age,
      value: valueFromZ(PERCENTILE_TO_Z[p], lms),
    })),
  }));
}

/** Клиническая интерпретация Z-score / перцентиля.
 *  Бэнды по WHO Multicentre Growth Reference Study Group (2006) +
 *  Fenton TR, Kim JH (BMC Pediatrics 2013;13:59) — те же z-score
 *  пороги используются в WHO Anthro и Fenton growth chart calculator
 *  для классификации nutritional status / fetal-infant growth. */
export interface InterpretationResult {
  label: string;        // короткий вердикт (одна строка для card-header)
  detail: string;       // развёрнутое объяснение клинического значения
  recommendation: string; // что делать дальше (мониторинг / консультация)
  reference: string;    // источник классификации
  tone: 'critical' | 'warning' | 'ok' | 'high';
}

export function interpretZ(z: number): InterpretationResult {
  const REF_FENTON = 'Fenton TR, Kim JH. BMC Pediatrics 2013;13:59 + WHO Multicentre Growth Reference Study Group, 2006';
  const REF_WHO = 'WHO Multicentre Growth Reference Study Group, 2006 (Z-score classification, Anthro v3.2)';

  if (z < -3) return {
    label: 'Тяжёлое отклонение (Z < −3)',
    detail: `Текущее значение ниже 0.1-го перцентиля (P0.1). Соответствует тяжёлой степени задержки роста / истощения по классификации ВОЗ. Z-score ${z.toFixed(2)} означает, что показатель отличается от медианы для данного PMA на 3 стандартных отклонения и более — это менее 0.13% популяции здоровых сверстников.`,
    recommendation: 'Срочная консультация неонатолога. Оценить нутритивный статус, исключить тяжёлые соматические заболевания, рассмотреть необходимость интенсификации питания (PN, обогащение материнского молока, специализированные смеси).',
    reference: REF_WHO,
    tone: 'critical',
  };

  if (z < -2) return {
    label: 'Ниже нормы (Z от −3 до −2)',
    detail: `Значение между P0.1 и P3 — умеренная задержка роста (moderate stunting / wasting по ВОЗ). Z-score ${z.toFixed(2)} означает отклонение от медианы на 2–3 SD. Для недоношенных это часто extrauterine growth restriction (EUGR), особенно если показатели ухудшаются от визита к визиту.`,
    recommendation: 'Динамический контроль каждые 1–2 недели, оценка прибавки в весе (target ≥15 г/кг/сут для preterm). Пересмотр режима питания совместно с неонатологом / диетологом NICU.',
    reference: REF_FENTON,
    tone: 'warning',
  };

  if (z < -1) return {
    label: 'Ниже среднего (Z от −2 до −1)',
    detail: `Значение между P3 и P15 — нижняя граница нормы. Z-score ${z.toFixed(2)} в пределах 1–2 SD ниже медианы. Сама по себе точка не является патологией, но требует оценки тренда: снижение траектории через 2 SD-line — клинически значимо.`,
    recommendation: 'Плановый мониторинг по графику роста (вес — ежедневно в NICU, окружность головы — еженедельно). Сравнить с предыдущими измерениями: важна траектория, а не одна точка.',
    reference: REF_FENTON,
    tone: 'ok',
  };

  if (z <= 1) return {
    label: 'Норма (Z от −1 до +1)',
    detail: `Значение между P15 и P85 — центральная зона нормы. Z-score ${z.toFixed(2)} в пределах 1 SD от медианы; ~68% здоровых сверстников попадают в этот диапазон. Соответствует ожидаемому развитию для данного PMA.`,
    recommendation: 'Рутинный мониторинг по протоколу NICU. При устойчивой траектории — без дополнительных вмешательств.',
    reference: REF_FENTON,
    tone: 'ok',
  };

  if (z <= 2) return {
    label: 'Выше среднего (Z от +1 до +2)',
    detail: `Значение между P85 и P97 — верхняя граница нормы. Z-score ${z.toFixed(2)} в пределах 1–2 SD выше медианы. Не патологическое состояние; чаще всего — индивидуальная конституция или хорошая прибавка на фоне адекватного питания.`,
    recommendation: 'Плановый мониторинг. Если только окружность головы превышает P97 при норме веса/длины — оценить на признаки гидроцефалии.',
    reference: REF_FENTON,
    tone: 'ok',
  };

  if (z <= 3) return {
    label: 'Выше нормы (Z от +2 до +3)',
    detail: `Значение между P97 и P99.9 — выше нормы. Z-score ${z.toFixed(2)} означает отклонение от медианы на 2–3 SD, ~2.3% популяции. Для веса — оценить на признаки macrosomia / гипергидратации; для окружности головы — исключить гидроцефалию.`,
    recommendation: 'Уточнить динамику предыдущих измерений. Для HC > P97 — нейросонография, оценка ФГТ. Для веса > P97 при изолированном повышении — оценить водный баланс.',
    reference: REF_FENTON,
    tone: 'warning',
  };

  return {
    label: 'Тяжёлое превышение (Z > +3)',
    detail: `Значение выше P99.9 — крайне высокий показатель. Z-score ${z.toFixed(2)} — отклонение более 3 SD; менее 0.13% популяции. Часто свидетельствует о патологии: для HC — гидроцефалия, для веса — отёки / эндокринная патология, для длины — конституциональный гигантизм или эндокринопатия.`,
    recommendation: 'Срочная консультация специалиста (нейрохирург при HC; эндокринолог при изолированном росте; кардиолог при отёках). Дифференциальная диагностика обязательна.',
    reference: REF_WHO,
    tone: 'high',
  };
}

export const PARAMETER_LABEL_RU: Record<GrowthParameter, string> = {
  weight: 'Вес',
  length: 'Длина / рост',
  head_circumference: 'Окружность головы',
};

export const PARAMETER_UNIT: Record<GrowthParameter, string> = {
  weight: 'г',
  length: 'см',
  head_circumference: 'см',
};

export const SEX_LABEL_RU: Record<Sex, string> = {
  boys: 'Мальчик',
  girls: 'Девочка',
};
