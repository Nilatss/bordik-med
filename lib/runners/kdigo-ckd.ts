// @ts-nocheck
/** Runner: kdigo-ckd */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'gfr', label: 'рСКФ (eGFR)', type: 'number', unit: 'мл/мин/1.73м²', min: 1, max: 150, step: 1, quickValues: [95, 75, 55, 38, 22, 10] },
    { id: 'acr',
hint: 'Креатинин сыворотки. Норма: М 62-115, Ж 53-97 мкмоль/л', label: 'Альбумин/креатинин мочи (UACR)', type: 'number', unit: 'мг/г', min: 0, max: 10000, step: 1, quickValues: [10, 100, 500, 1500] },
  ],
  compute: (v) => {
    const gfr = Number(v.gfr);
    const acr = Number(v.acr);

    let gStage = 'G1', gIdx = 1;
    if (gfr >= 90) { gStage = 'G1'; gIdx = 1; }
    else if (gfr >= 60) { gStage = 'G2'; gIdx = 2; }
    else if (gfr >= 45) { gStage = 'G3a'; gIdx = 3; }
    else if (gfr >= 30) { gStage = 'G3b'; gIdx = 4; }
    else if (gfr >= 15) { gStage = 'G4'; gIdx = 5; }
    else { gStage = 'G5'; gIdx = 6; }

    let aStage = 'A1', aIdx = 1;
    if (acr < 30) { aStage = 'A1'; aIdx = 1; }
    else if (acr <= 300) { aStage = 'A2'; aIdx = 2; }
    else { aStage = 'A3'; aIdx = 3; }

    // Heat-map risk (KDIGO 2012)
    // rows = G1..G5, cols = A1..A3; value 1..4
    const map = [
      [1, 2, 3], // G1
      [1, 2, 3], // G2
      [2, 3, 3], // G3a
      [3, 3, 4], // G3b
      [4, 4, 4], // G4
      [4, 4, 4], // G5
    ];
    const risk = map[gIdx - 1][aIdx - 1];
    const riskLabel = ['Низкий', 'Умеренный', 'Высокий', 'Оч. высокий'][risk - 1];
    const color = ['#22C55E', '#F59E0B', '#EF4444', '#991B1B'][risk - 1];

    const details = `ХБП: ${gStage}${aStage} (СКФ ${gfr}, ACR ${acr} мг/г). Риск прогрессии и ССО: ${riskLabel.toLowerCase()}.`;

    const actions: string[] = [];
    if (risk === 1) {
      actions.push('Ежегодный контроль СКФ и UACR при факторах риска (СД, АГ)');
      actions.push('Коррекция ССО-факторов: АД, липиды, курение');
    } else if (risk === 2) {
      actions.push('Контроль СКФ и UACR каждые 6 мес');
      actions.push('иАПФ/БРА при UACR >30 мг/г и/или АГ');
      actions.push('SGLT2-ингибитор при СД2 и UACR ≥30');
    } else if (risk === 3) {
      actions.push('Направить к нефрологу (планово)');
      actions.push('иАПФ/БРА + SGLT2 (дапаглифлозин, эмпаглифлозин)');
      actions.push('Контроль Hb, K⁺, Ca, Ph, PTH, 25(OH)D каждые 3–6 мес');
      actions.push('Избегать НПВС; коррекция доз нефротоксиков');
    } else {
      actions.push('Срочная консультация нефролога; подготовка к ЗПТ');
      actions.push('Формирование сосудистого доступа при СКФ <20');
      actions.push('Коррекция анемии, МКН-ХБП, ацидоза');
      actions.push('Рассмотреть преэмптивную трансплантацию при СКФ <20');
    }

    return {
      value: `${gStage}${aStage}`,
      unit: 'стадия',
      interpretation: `${riskLabel} риск`,
      color,
      details,
      actions,
      caveats: [
        'Стадии требуют подтверждения ≥3 мес (хроничность)',
        'При AKI эти стадии неприменимы',
        'UACR разовой порции утренней мочи; при спорных — 24-ч',
        'Цвет карты риска: зелёный / жёлтый / оранжевый / красный',
      ],
      scale: {
        segments: [
          { min: 1, max: 2, label: 'Низкий', color: '#22C55E' },
          { min: 2, max: 3, label: 'Умеренный', color: '#F59E0B' },
          { min: 3, max: 4, label: 'Высокий', color: '#EF4444' },
          { min: 4, max: 5, label: 'Оч. высокий', color: '#991B1B' },
        ],
        current: risk,
        unit: 'риск',
      },
      relatedCourses: [
        { id: '301.3', title: 'Нефрология' },
        { id: '301.4', title: 'Урология' },
      ],
      related: [
        { id: 'ckd-epi', title: 'CKD-EPI' },
        { id: 'kfre', title: 'KFRE' },
        { id: 'kdigo', title: 'KDIGO AKI' },
      ],
    };
  },
  reference: 'KDIGO 2012 CKD Heat Map (Levey AS, Kidney Int 2011).',
  countries: 'Международный (KDIGO)',
  presets: [
    { label: 'G1A1 — норма', values: { gfr: 100, acr: 10 } },
    { label: 'G3aA2', values: { gfr: 50, acr: 100 } },
    { label: 'G4A3 — высокий риск', values: { gfr: 25, acr: 800 } },
  ],
  info: `### Для чего используется
**KDIGO Heat Map** — оценка риска прогрессии ХБП и ССО по комбинации СКФ (G1–G5) и альбуминурии (A1–A3).

### Категории СКФ
| Стадия | мл/мин/1.73м² |
|---|---|
| G1 | ≥90 |
| G2 | 60–89 |
| G3a | 45–59 |
| G3b | 30–44 |
| G4 | 15–29 |
| G5 | <15 |

### Категории альбуминурии
| A | UACR (мг/г) |
|---|---|
| A1 | <30 |
| A2 | 30–300 |
| A3 | >300 |`,
};
export default runner;
