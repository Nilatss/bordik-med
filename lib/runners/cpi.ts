// @ts-nocheck
/** Runner: cpi — Community Periodontal Index (WHO) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (WHO Oral Health Surveys 5th ed., 2013)',
  reference: 'Ainamo J, et al. Development of the WHO community periodontal index of treatment needs (CPITN). Int Dent J. 1982;32(3):281-91. WHO Oral Health Surveys, 5th ed. 2013.',
  inputs: [
    { id: 'worst', label: 'Наихудший секстант (WHO probe, 0.5мм шарик)', type: 'select', options: [
      { value: '0', label: '0 — здоров' },
      { value: '1', label: '1 — кровоточивость при зондировании' },
      { value: '2', label: '2 — зубной камень / поддесневой' },
      { value: '3', label: '3 — карман 4-5 мм' },
      { value: '4', label: '4 — карман ≥6 мм' },
      { value: 'X', label: 'X — секстант исключён (<2 зубов)' },
    ]},
  ],
  presets: [
    { label: 'CPI 0 (здоров)', values: { worst: '0' } },
    { label: 'CPI 2 (камень)', values: { worst: '2' } },
    { label: 'CPI 4 (карман ≥6мм)', values: { worst: '4' } },
  ],
  compute: (v) => {
    const c = String(v.worst || '0');
    const map: Record<string, { t: string; tn: string; color: string }> = {
      '0': { t: 'Здоровый пародонт', tn: 'TN 0 — профилактика (гигиена)', color: '#22C55E' },
      '1': { t: 'Кровоточивость (гингивит)', tn: 'TN I — гигиена + мотивация', color: '#84CC16' },
      '2': { t: 'Зубной камень', tn: 'TN II — удаление камня (scaling) + гигиена', color: '#F59E0B' },
      '3': { t: 'Карман 4-5 мм', tn: 'TN II — SRP (scaling + root planing)', color: '#EF4444' },
      '4': { t: 'Глубокий карман ≥6 мм', tn: 'TN III — комплексное пародонт. лечение (включая хирургию)', color: '#B91C1C' },
      'X': { t: 'Секстант исключён', tn: '—', color: '#6B7280' },
    };
    const e = map[c];
    return {
      value: c,
      unit: 'CPI',
      color: e.color,
      interpretation: `CPI ${c} — ${e.t}`,
      details: `CPI код: ${c}\nСостояние: ${e.t}\nTreatment Need: ${e.tn}\n\nCPI оценивается по 6 секстантам (17-14, 13-23, 24-27, 37-34, 33-43, 44-47); у взрослых обследуются 10 индекс-зубов (17, 16, 11, 26, 27, 37, 36, 31, 46, 47). Регистрируется наихудший код в секстанте.`,
      actions: [
        'CPI 0-1: гигиена, контроль налёта, регулярный осмотр',
        'CPI 2: профгигиена + scaling',
        'CPI 3: SRP, мотивация, повторный осмотр 3-6 мес',
        'CPI 4: SRP + возможная пародонтальная хирургия, оценка AAP/EFP stage/grade',
      ],
      caveats: [
        'CPI с 2013 не включает код 1 в Basic Oral Health Survey (упрощён)',
        'CPI не учитывает CAL (рецессию) — только глубину зондирования',
        'Для индивидуального диагноза — AAP/EFP 2017 (Stage/Grade) точнее',
        'WHO probe (probe C) — обязателен (шарик 0.5мм, чёрная полоса 3.5-5.5мм)',
      ],
      scale: {
        segments: [
          { min: 0, max: 1, label: '0 Здоров', color: '#22C55E' },
          { min: 1, max: 2, label: '1 Кровоточ', color: '#84CC16' },
          { min: 2, max: 3, label: '2 Камень', color: '#F59E0B' },
          { min: 3, max: 4, label: '3 Карман 4-5', color: '#EF4444' },
          { min: 4, max: 5, label: '4 Карман ≥6', color: '#B91C1C' },
        ],
        value: c === 'X' ? 0 : Number(c),
      },
      related: [
        { id: 'aap-efp', title: 'AAP/EFP 2017' },
        { id: 'bop', title: 'BoP %' },
        { id: 'gingival', title: 'Gingival Index' },
      ],
      relatedCourses: [
        { id: '313.1', title: 'Стоматология' },
      ],
    };
  },
  info: `### Для чего используется
**CPI** (Community Periodontal Index, ранее CPITN) — скрининговый индекс ВОЗ для оценки состояния пародонта на популяционном уровне. Быстрый, но менее точный чем AAP/EFP.

### Коды
| Код | Состояние | Treatment Need |
|---|---|---|
| 0 | Здоров | TN 0 |
| 1 | Кровоточивость | TN I (гигиена) |
| 2 | Камень | TN II (scaling) |
| 3 | Карман 4-5 мм | TN II (SRP) |
| 4 | Карман ≥6 мм | TN III (комплексное) |
| X | Исключён (<2 зубов) | — |

### Методика
- WHO probe C (шарик 0.5 мм, полоса 3.5-5.5 мм)
- 6 секстантов, регистрируется **наихудший** код
- 10 индекс-зубов у взрослых (17, 16, 11, 26, 27, 37, 36, 31, 46, 47)

### Источник
Ainamo J et al. Int Dent J 1982;32(3):281. WHO Oral Health Surveys 5th ed. 2013.`,
};
export default runner;
