// @ts-nocheck
/** Runner: ots - Ocular Trauma Score (6-month visual prognosis) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'va', label: 'Исходная VA', type: 'select', options: [
      { value: 'nlp', label: 'NLP (0 баллов) — 60' },
      { value: 'lp-hm', label: 'LP / HM — 70' },
      { value: '1-19', label: '1/200 – 19/200 — 80' },
      { value: '20-200-100', label: '20/200 – 20/50 — 90' },
      { value: 'ge-20-40', label: '≥ 20/40 — 100' },
    ] },
    { id: 'rupture', label: 'Глобальный разрыв (globe rupture)', type: 'checkbox' },
    { id: 'endoph', label: 'Эндофтальмит', type: 'checkbox' },
    { id: 'perforating', label: 'Перфорирующее ранение', type: 'checkbox' },
    { id: 'rd', label: 'Отслойка сетчатки', type: 'checkbox' },
    { id: 'rapd', label: 'Афферентный зрачковый дефект (RAPD)', type: 'checkbox' },
  ],
  compute: (v) => {
    const vaMap: Record<string, number> = {
      'nlp': 60, 'lp-hm': 70, '1-19': 80, '20-200-100': 90, 'ge-20-40': 100,
    };
    let raw = vaMap[String(v.va || 'ge-20-40')] ?? 100;
    if (v.rupture) raw -= 23;
    if (v.endoph) raw -= 17;
    if (v.perforating) raw -= 14;
    if (v.rd) raw -= 11;
    if (v.rapd) raw -= 10;

    let category = 5;
    if (raw <= 44) category = 1;
    else if (raw <= 65) category = 2;
    else if (raw <= 80) category = 3;
    else if (raw <= 91) category = 4;
    else category = 5;

    // Probabilities of final VA at 6 months (OTS study)
    const probs: Record<number, string> = {
      1: 'NLP 74% / LP-HM 15% / 1/200-19/200 7% / 20/200-20/50 3% / ≥20/40 1%',
      2: 'NLP 27% / LP-HM 26% / 1/200-19/200 18% / 20/200-20/50 15% / ≥20/40 15%',
      3: 'NLP 2% / LP-HM 11% / 1/200-19/200 15% / 20/200-20/50 28% / ≥20/40 44%',
      4: 'NLP 1% / LP-HM 2% / 1/200-19/200 2% / 20/200-20/50 21% / ≥20/40 74%',
      5: 'NLP 0% / LP-HM 1% / 1/200-19/200 2% / 20/200-20/50 5% / ≥20/40 92%',
    };

    const colors = ['#EF4444', '#F97316', '#F59E0B', '#84CC16', '#22C55E'];
    const bands = ['Очень плохой', 'Плохой', 'Средний', 'Хороший', 'Отличный'];

    return {
      value: String(category),
      unit: `/5 (raw ${raw})`,
      interpretation: `OTS ${category} — ${bands[category - 1]} прогноз`,
      color: colors[category - 1],
      details: `6-мес прогноз: ${probs[category]}.`,
      actions: [
        category <= 2 ? 'Срочная витреоретинальная консультация' : '',
        'Первичное закрытие раны ≤ 24 ч, системные антибиотики',
        'Профилактика столбняка',
        category <= 3 ? 'Протокол эндофтальмита (интравитреально ванкомицин + цефтазидим при подозрении)' : '',
        'CT орбиты без контраста (MRI противопоказан при подозрении на интраокулярный металл)',
        'Повторная оценка через 5-14 дней (PPV при необходимости)',
      ].filter(Boolean),
      caveats: [
        'Рассчитывается при ПЕРВИЧНОМ осмотре, до хирургии',
        'Не применим у детей < 1 года и при химических ожогах',
        'MRI ПРОТИВОПОКАЗАН при подозрении на металлический IOFB',
        'OTS не учитывает локализацию (зона Kuhn I-III)',
      ],
      scale: {
        segments: [
          { min: 1, max: 2, label: 'OTS 1', color: '#EF4444' },
          { min: 2, max: 3, label: 'OTS 2', color: '#F97316' },
          { min: 3, max: 4, label: 'OTS 3', color: '#F59E0B' },
          { min: 4, max: 5, label: 'OTS 4', color: '#84CC16' },
          { min: 5, max: 6, label: 'OTS 5', color: '#22C55E' },
        ],
        current: category,
        unit: 'OTS',
      },
      related: [{ id: 'snellen', title: 'Snellen' }, { id: 'seidel', title: 'Seidel' }],
      relatedCourses: [{ id: '315.1', title: 'Офтальмология' }],
    };
  },
  reference: 'Kuhn F, Maisiak R, Mann L, et al. The Ocular Trauma Score. Ophthalmol Clin North Am 2002;15:163-165.',
  countries: 'Международный (BETT / AAO)',
  presets: [
    { label: 'Закрытая травма, VA 20/40', values: { va: 'ge-20-40', rupture: false, endoph: false, perforating: false, rd: false, rapd: false } },
    { label: 'Разрыв + NLP', values: { va: 'nlp', rupture: true, endoph: false, perforating: false, rd: true, rapd: true } },
    { label: 'Средняя тяжесть', values: { va: '1-19', rupture: false, endoph: false, perforating: true, rd: false, rapd: false } },
  ],
  info: `### Для чего используется
**OTS (Ocular Trauma Score)** прогнозирует остроту зрения через **6 месяцев** после открытой / закрытой травмы глаза.

### Расчёт
Стартовый балл по исходной VA:
| VA | Баллы |
|---|---|
| NLP | 60 |
| LP / HM | 70 |
| 1/200–19/200 | 80 |
| 20/200–20/50 | 90 |
| ≥ 20/40 | 100 |

Вычитается за:
- Globe rupture: −23
- Эндофтальмит: −17
- Перфорирующее ранение: −14
- Отслойка сетчатки: −11
- RAPD: −10

### Категории
| Raw | OTS | Прогноз NLP / ≥20/40 |
|---|---|---|
| 0-44 | 1 | 74% / 1% |
| 45-65 | 2 | 27% / 15% |
| 66-80 | 3 | 2% / 44% |
| 81-91 | 4 | 1% / 74% |
| 92-100 | 5 | 0% / 92% |

### Применение
- Консультирование пациентов / семьи
- Планирование витреоретинальной хирургии
- Не применяется у детей < 1 года и при химических ожогах

### Источник
Kuhn F, Ophthalmol Clin N Am 2002.`,
};

export default runner;
