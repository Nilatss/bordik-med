// @ts-nocheck
/** Runner: scorad - SCORAD (SCORing Atopic Dermatitis) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'area', label: 'A — площадь поражения (% BSA, правило девяток)', type: 'number', min: 0, max: 100, step: 1, quickValues: [5, 15, 30, 50, 80] },
    { id: 'erythema', label: 'B1 — эритема (0-3)', type: 'number', min: 0, max: 3, step: 1 },
    { id: 'edema', label: 'B2 — отёк / папулы (0-3)', type: 'number', min: 0, max: 3, step: 1 },
    { id: 'oozing', label: 'B3 — мокнутие / корки (0-3)', type: 'number', min: 0, max: 3, step: 1 },
    { id: 'excoriation', label: 'B4 — экскориации (0-3)', type: 'number', min: 0, max: 3, step: 1 },
    { id: 'lichen', label: 'B5 — лихенификация (0-3)', type: 'number', min: 0, max: 3, step: 1 },
    { id: 'dryness', label: 'B6 — сухость (на непоражённой коже) (0-3)', type: 'number', min: 0, max: 3, step: 1 },
    { id: 'itch', label: 'C1 — зуд (0-10, VAS за 3 сут)', type: 'number', min: 0, max: 10, step: 1 },
    { id: 'sleep', label: 'C2 — потеря сна (0-10, VAS за 3 сут)', type: 'number', min: 0, max: 10, step: 1 },
  ],
  compute: (v) => {
    const A = Number(v.area || 0);
    const B = Number(v.erythema || 0) + Number(v.edema || 0) + Number(v.oozing || 0) +
              Number(v.excoriation || 0) + Number(v.lichen || 0) + Number(v.dryness || 0);
    const C = Number(v.itch || 0) + Number(v.sleep || 0);
    const total = A / 5 + (7 * B) / 2 + C;
    const score = Math.round(total * 10) / 10;

    let color = '#22C55E', band = 'Лёгкий';
    if (score >= 50) { color = '#EF4444'; band = 'Тяжёлый'; }
    else if (score >= 25) { color = '#F59E0B'; band = 'Среднетяжёлый'; }

    return {
      value: String(score),
      unit: '/103',
      interpretation: `${band} атопический дерматит`,
      color,
      details: `A=${A}%, B=${B}/18, C=${C}/20. Формула: A/5 + 7·B/2 + C = ${score}.`,
      actions: [
        'Базовая терапия: эмоленты ≥ 2×/день (250-500 г/нед у взрослых)',
        score < 25 ? 'Топические ГКС слабой/средней потенции при обострениях' : '',
        score >= 25 ? 'Топические ГКС средней/высокой потенции + ингибиторы кальциневрина (такролимус, пимекролимус) на лицо/складки' : '',
        score >= 50 ? 'Системная терапия: дупилумаб (anti-IL-4/13), трали / лебрикизумаб, JAK-i (упадацитиниб, барицитиниб, аброкитиниб), циклоспорин' : '',
        'Элиминация триггеров (шерсть, ирританты, стресс, аэроаллергены)',
        'Proactive therapy: такролимус 0,1% 2×/нед на "горячие точки"',
        'Wet-wrap при тяжёлых обострениях',
        'Фототерапия NB-UVB при score ≥ 25 и недостаточном ответе на локальную',
      ].filter(Boolean),
      caveats: [
        'oSCORAD = объективная часть (A + B), без C — для детей младше 7 лет',
        'VAS за 3 последних суток по самоотчёту / родителей',
        'EASI — альтернатива (0-72), предпочитается в клинических исследованиях',
        'POEM (0-28) — patient-reported для мониторинга',
      ],
      scale: {
        segments: [
          { min: 0, max: 25, label: 'Лёгкий', color: '#22C55E' },
          { min: 25, max: 50, label: 'Среднетяжёлый', color: '#F59E0B' },
          { min: 50, max: 103, label: 'Тяжёлый', color: '#EF4444' },
        ],
        current: score,
        unit: 'SCORAD',
      },
      related: [{ id: 'pasi', title: 'PASI' }, { id: 'uas7', title: 'UAS7' }],
      relatedCourses: [{ id: '317.1', title: 'Дерматология' }],
    };
  },
  reference: 'European Task Force on Atopic Dermatitis. Severity scoring of atopic dermatitis: the SCORAD index. Dermatology 1993;186:23-31.',
  countries: 'Европа (ETFAD / EAACI)',
  presets: [
    { label: 'Лёгкий', values: { area: 10, erythema: 1, edema: 0, oozing: 0, excoriation: 1, lichen: 0, dryness: 1, itch: 2, sleep: 1 } },
    { label: 'Среднетяжёлый', values: { area: 30, erythema: 2, edema: 1, oozing: 1, excoriation: 2, lichen: 1, dryness: 2, itch: 5, sleep: 4 } },
    { label: 'Тяжёлый', values: { area: 60, erythema: 3, edema: 2, oozing: 2, excoriation: 3, lichen: 2, dryness: 3, itch: 9, sleep: 8 } },
  ],
  info: `### Для чего используется
**SCORAD** — оценка тяжести **атопического дерматита** (0-103), основной инструмент в Европе.

### Формула
\`SCORAD = A/5 + 7·B/2 + C\`

- **A** — площадь поражения, % (правило девяток), 0-100
- **B** — сумма 6 признаков по 0-3 (эритема, отёк, мокнутие, экскориации, лихенификация, сухость), 0-18
- **C** — зуд + потеря сна по VAS 0-10, 0-20

Максимум = 103.

### Интерпретация
| SCORAD | Степень |
|---|---|
| < 25 | Лёгкий |
| 25-50 | Среднетяжёлый |
| > 50 | Тяжёлый |

### oSCORAD / EASI / POEM
- **oSCORAD** — объективная часть (A + B), для детей
- **EASI** (0-72) — в клинических испытаниях
- **POEM** (0-28) — patient-reported

### Ступенчатая терапия
1. Все: эмоленты ≥ 2×/день, элиминация триггеров
2. Лёгкий: ТГКС слабой/средней потенции
3. Среднетяжёлый: ТГКС + TCI (такролимус), NB-UVB
4. Тяжёлый: дупилумаб, тралокинумаб, JAK-i (упадацитиниб), циклоспорин

### Источник
ETFAD. Dermatology 1993.`,
};

export default runner;
