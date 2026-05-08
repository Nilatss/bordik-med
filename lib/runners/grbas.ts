/** Runner: grbas - GRBAS perceptual voice evaluation */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const opts = [
  { value: 0, label: '0 — норма' },
  { value: 1, label: '1 — лёгкая' },
  { value: 2, label: '2 — умеренная' },
  { value: 3, label: '3 — тяжёлая' },
];

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'g', label: 'G — Grade (общая степень дисфонии)', type: 'select', options: opts },
    { id: 'r', label: 'R — Roughness (хриплость)', type: 'select', options: opts },
    { id: 'b', label: 'B — Breathiness (придыхание)', type: 'select', options: opts },
    { id: 'a', label: 'A — Asthenia (астеничность)', type: 'select', options: opts },
    { id: 's', label: 'S — Strain (напряжённость)', type: 'select', options: opts },
  ],
  compute: (v) => {
    const g = Number(v.g) || 0;
    const r = Number(v.r) || 0;
    const b = Number(v.b) || 0;
    const a = Number(v.a) || 0;
    const s = Number(v.s) || 0;
    const total = g + r + b + a + s;

    let band = '', color = '#22C55E', details = '';
    if (g === 0) { band = 'Норма'; color = '#22C55E'; details = 'Голос без перцептуальных отклонений.'; }
    else if (g === 1) { band = 'Лёгкая дисфония'; color = '#84CC16'; details = 'Лёгкие отклонения, обычно не влияют на профессиональный голос.'; }
    else if (g === 2) { band = 'Умеренная дисфония'; color = '#F59E0B'; details = 'Заметное нарушение — показана ларингоскопия и голосовая терапия.'; }
    else { band = 'Тяжёлая дисфония'; color = '#EF4444'; details = 'Выраженная дисфония — комплексное обследование, фонохирургия при органике.'; }

    const dominant: string[] = [];
    if (r >= 2) dominant.push(`R=${r} (неровность складок)`);
    if (b >= 2) dominant.push(`B=${b} (утечка воздуха — парез/неполное смыкание)`);
    if (a >= 2) dominant.push(`A=${a} (гипофункция)`);
    if (s >= 2) dominant.push(`S=${s} (гиперфункция/MTD)`);

    return {
      value: `G${g}R${r}B${b}A${a}S${s}`,
      unit: `сумма ${total}/15`,
      interpretation: band,
      color,
      details: `${details}${dominant.length ? ' Доминирующие параметры: ' + dominant.join('; ') + '.' : ''}`,
      actions: [
        'Стандартизировать материал: устойчивая /a/, чтение текста, спонтанная речь',
        g >= 2 ? 'Видеоларингостробоскопия для поиска органической патологии' : 'Гигиена голоса; повторная оценка через 4-6 недель',
        b >= 2 ? 'Оценить паралич/парез (ЭМГ гортани), неполное смыкание' : '',
        s >= 2 ? 'MTD (muscle tension dysphonia) — мануальная терапия гортани, миорелаксация' : '',
        'Дополнить объективной акустикой: jitter, shimmer, HNR, MPT',
        'Рекомендуется оценка двумя независимыми экспертами (межэкспертная надёжность)',
      ].filter(Boolean),
      caveats: [
        'Перцептуальная оценка — субъективна, требует обучения оценщиков',
        'Межэкспертная надёжность κ 0.5-0.8 (лучше всего для G и B)',
        'Альтернатива: CAPE-V (Consensus Auditory-Perceptual Evaluation of Voice) с VAS',
        'Не оценивает качество жизни — дополнять VHI-30/V-RQOL',
        'Стандарт Japan Society of Logopedics and Phoniatrics (Hirano 1981)',
      ],
      scale: {
        segments: [
          { min: 0, max: 0, label: 'G0 норма', color: '#22C55E' },
          { min: 1, max: 1, label: 'G1 лёгкая', color: '#84CC16' },
          { min: 2, max: 2, label: 'G2 умер.', color: '#F59E0B' },
          { min: 3, max: 3, label: 'G3 тяжёлая', color: '#EF4444' },
        ],
        current: g,
        unit: 'Grade',
      },
      related: [
        { id: 'vhi', title: 'VHI-30' },
      ],
      relatedCourses: [{ id: '314.3', title: 'Оториноларингология' }],
    };
  },
  reference: 'Hirano M. Clinical Examination of Voice. Springer-Verlag, 1981. Japan Society of Logopedics and Phoniatrics.',
  countries: 'Международный (ELS / JSLP)',
  presets: [
    { label: 'Норма', values: { g: 0, r: 0, b: 0, a: 0, s: 0 } },
    { label: 'Парез складки', values: { g: 2, r: 1, b: 3, a: 2, s: 0 } },
    { label: 'MTD (напряжение)', values: { g: 2, r: 1, b: 0, a: 0, s: 3 } },
  ],
  info: `### Для чего используется
**GRBAS (Hirano 1981)** — стандартизированная **перцептуальная** оценка голоса клиницистом. Каждый из 5 параметров оценивается по шкале 0-3.

### Параметры
| Код | Значение | Отражает |
|---|---|---|
| **G** | Grade — общая тяжесть | интегральная оценка |
| **R** | Roughness — хриплость | неровность вибрации складок |
| **B** | Breathiness — придыхание | утечка воздуха (парез/щель) |
| **A** | Asthenia — слабость | гипофункция, слабый голос |
| **S** | Strain — напряжённость | гиперфункция, MTD |

### Шкала 0-3
- 0 — норма
- 1 — лёгкая
- 2 — умеренная
- 3 — тяжёлая

### Применение
- Первичная оценка дисфонии
- Мониторинг голосовой терапии / фонохирургии
- Комплементарна к VHI (самоотчёт) и акустике (jitter/shimmer)

### Надёжность
- Межэкспертная κ: G ~ 0.7, B ~ 0.6-0.7, R ~ 0.5, A/S ниже
- Рекомендуется 2 независимых оценщика

### Альтернатива
**CAPE-V (ASHA 2003)** — использует VAS 100 мм вместо 0-3, более чувствительна к изменениям.

### Источник
Hirano M. Clinical Examination of Voice. Springer, 1981.`,
};

export default runner;
