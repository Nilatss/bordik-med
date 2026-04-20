// @ts-nocheck
/** Runner: kdigo */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'cr_base', label: 'Креатинин базовый', type: 'number', unit: 'мкмоль/л', min: 20, max: 2000, step: 1, quickValues: [70, 90, 110, 150] },
    { id: 'cr_now', label: 'Креатинин текущий', type: 'number', unit: 'мкмоль/л', min: 20, max: 3000, step: 1, quickValues: [150, 200, 300, 450] },
    { id: 'uo', label: 'Диурез', type: 'number', unit: 'мл/кг/ч', min: 0, max: 5, step: 0.05, quickValues: [0.2, 0.4, 0.5, 0.8] },
    { id: 'uo_hours', label: 'Длительность олигурии', type: 'number', unit: 'ч', min: 0, max: 48, step: 1, quickValues: [6, 12, 24] },
    { id: 'rrt', label: 'Начата ЗПТ (диализ)', type: 'checkbox' },
  ],
  compute: (v) => {
    const base = Number(v.cr_base);
    const now = Number(v.cr_now);
    const uo = Number(v.uo);
    const hrs = Number(v.uo_hours);
    const rrt = v.rrt === true;
    const ratio = base > 0 ? now / base : 1;
    const rise = now - base;

    let crStage = 0;
    if (ratio >= 3.0 || now >= 354 || rrt) crStage = 3;
    else if (ratio >= 2.0) crStage = 2;
    else if (ratio >= 1.5 || rise >= 26.5) crStage = 1;

    let uoStage = 0;
    if (uo < 0.3 && hrs >= 24) uoStage = 3;
    else if (hrs === 0 && uo === 0) uoStage = 3; // анурия >=12
    else if (uo < 0.5 && hrs >= 12) uoStage = 2;
    else if (uo < 0.5 && hrs >= 6) uoStage = 1;

    const stage = Math.max(crStage, uoStage);
    const stageLabel = stage === 0 ? 'Нет ОПП' : `AKI ${stage}`;

    let color = '#22C55E', interpretation = 'Нет критериев ОПП';
    if (stage === 1) { color = '#F59E0B'; interpretation = 'AKI 1 — лёгкая'; }
    else if (stage === 2) { color = '#EF4444'; interpretation = 'AKI 2 — умеренная'; }
    else if (stage === 3) { color = '#991B1B'; interpretation = 'AKI 3 — тяжёлая'; }

    const details = stage === 0
      ? 'Критерии KDIGO 2012 не выполнены. Продолжить наблюдение, устранять факторы риска.'
      : `Стадия AKI ${stage} по KDIGO. Основано на: отношение креатинина ${ratio.toFixed(2)}×, прирост ${rise.toFixed(0)} мкмоль/л, диурез ${uo} мл/кг/ч × ${hrs} ч${rrt ? ', ЗПТ' : ''}.`;

    const actions = stage === 0
      ? ['Мониторинг креатинина и диуреза', 'Избегать нефротоксиков (НПВС, аминогликозиды, контраст)']
      : stage === 1
        ? ['Найти и устранить причину (гиповолемия, нефротоксики, сепсис, обструкция)',
           'Оптимизация гемодинамики, изоволемия',
           'Коррекция доз препаратов; отмена НПВС/иАПФ на время',
           'Контроль K⁺, ацидоза; мониторинг каждые 12 ч']
        : stage === 2
          ? ['Консультация нефролога',
             'Избегать контраста; пересмотреть все препараты',
             'Контроль волемии, электролитов, pH ежедневно',
             'Рассмотреть показания к ЗПТ']
          : ['Срочная консультация нефролога/реаниматолога',
             'Показания к ЗПТ: рефрактерная гиперкалиемия, перегрузка жидкостью, уремия, тяжёлый ацидоз',
             'Полный пересмотр препаратов с дозированием для анурии',
             'Мониторинг ЭКГ, газов крови, K⁺'];

    return {
      value: String(stage),
      unit: stageLabel,
      interpretation,
      color,
      details,
      actions,
      caveats: [
        'Базовый креатинин — за 7 дней до эпизода; при неизвестном — оценить по MDRD при eGFR 75',
        'Прирост ≥26.5 мкмоль/л должен произойти за ≤48 ч',
        'Не применимо у детей <18 лет (см. pRIFLE / KDIGO педиатрический)',
        'При анурии >12 ч — автоматически стадия 3',
      ],
      scale: {
        segments: [
          { min: 0, max: 1, label: 'Нет ОПП', color: '#22C55E' },
          { min: 1, max: 2, label: 'AKI 1', color: '#F59E0B' },
          { min: 2, max: 3, label: 'AKI 2', color: '#EF4444' },
          { min: 3, max: 4, label: 'AKI 3', color: '#991B1B' },
        ],
        current: stage,
        unit: 'стадия',
      },
      relatedCourses: [
        { id: '301.3', title: 'Нефрология' },
        { id: '301.4', title: 'Урология' },
      ],
      related: [
        { id: 'ckd-epi', title: 'CKD-EPI' },
        { id: 'fena', title: 'FENa' },
        { id: 'kdigo-ckd', title: 'KDIGO ХБП' },
      ],
    };
  },
  reference: 'KDIGO Clinical Practice Guideline for AKI, 2012.',
  countries: 'Международный (KDIGO)',
  presets: [
    { label: 'Нет ОПП', values: { cr_base: 80, cr_now: 90, uo: 1, uo_hours: 0, rrt: false } },
    { label: 'AKI 1', values: { cr_base: 80, cr_now: 130, uo: 0.4, uo_hours: 6, rrt: false } },
    { label: 'AKI 2', values: { cr_base: 80, cr_now: 180, uo: 0.4, uo_hours: 12, rrt: false } },
    { label: 'AKI 3', values: { cr_base: 80, cr_now: 360, uo: 0.2, uo_hours: 24, rrt: false } },
  ],
  info: `### Для чего используется
**KDIGO 2012 AKI criteria** — стандарт диагностики и стадирования острого повреждения почек.

### Критерии ОПП
- Прирост креатинина ≥26.5 мкмоль/л за 48 ч, **или**
- Креатинин ×1.5 от базового за 7 дней, **или**
- Диурез <0.5 мл/кг/ч ≥6 ч.

### Стадии
| Стадия | Креатинин | Диурез |
|---|---|---|
| 1 | ×1.5–1.9 или +26.5 | <0.5 мл/кг/ч, 6–12 ч |
| 2 | ×2.0–2.9 | <0.5 мл/кг/ч, ≥12 ч |
| 3 | ×≥3.0 или ≥354 мкмоль/л или ЗПТ | <0.3 мл/кг/ч ≥24 ч или анурия ≥12 ч |`,
};
export default runner;
