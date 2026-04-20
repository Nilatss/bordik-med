// @ts-nocheck
/** Runner: breslow - Breslow thickness + T stage for melanoma */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'thickness', label: 'Breslow thickness (мм)', type: 'number', min: 0, max: 20, step: 0.1, quickValues: [0.5, 0.8, 1.0, 2.0, 4.0, 6.0] },
    { id: 'ulceration', label: 'Изъязвление (ulceration)', type: 'checkbox' },
    { id: 'mitosis', label: 'Митозы ≥ 1/мм² (только для T1)', type: 'checkbox' },
    { id: 'clark', label: 'Clark level (устаревший, по запросу)', type: 'select', options: [
      { value: '', label: 'Не оценивается' },
      { value: '1', label: 'I — in situ' },
      { value: '2', label: 'II — papillary dermis' },
      { value: '3', label: 'III — papillary-reticular junction' },
      { value: '4', label: 'IV — reticular dermis' },
      { value: '5', label: 'V — subcutaneous fat' },
    ] },
  ],
  compute: (v) => {
    const t = Number(v.thickness || 0);
    const ulc = !!v.ulceration;

    let T = 'Tis', stage5y = 99;
    if (t === 0) { T = 'Tis'; stage5y = 99; }
    else if (t < 0.8) { T = ulc ? 'T1b' : 'T1a'; stage5y = ulc ? 93 : 99; }
    else if (t < 1.0) { T = 'T1b'; stage5y = 93; }
    else if (t <= 2.0) { T = ulc ? 'T2b' : 'T2a'; stage5y = ulc ? 82 : 94; }
    else if (t <= 4.0) { T = ulc ? 'T3b' : 'T3a'; stage5y = ulc ? 68 : 88; }
    else { T = ulc ? 'T4b' : 'T4a'; stage5y = ulc ? 54 : 75; }

    let color = '#22C55E', band = '';
    if (t < 0.8 && !ulc) { color = '#22C55E'; band = 'Тонкая (T1a)'; }
    else if (t <= 1.0) { color = '#84CC16'; band = 'Тонкая (T1)'; }
    else if (t <= 2.0) { color = '#F59E0B'; band = 'Средняя (T2)'; }
    else if (t <= 4.0) { color = '#F97316'; band = 'Толстая (T3)'; }
    else { color = '#EF4444'; band = 'Очень толстая (T4)'; }

    // Determine margin recommendation
    let margin = '';
    if (t === 0) margin = '0.5 см (in situ)';
    else if (t <= 1.0) margin = '1 см';
    else if (t <= 2.0) margin = '1-2 см';
    else margin = '2 см';

    // SLNB recommendation
    let slnb = '';
    if (t >= 1.0) slnb = 'Рекомендована (T2+)';
    else if (t >= 0.8 || ulc) slnb = 'Обсудить (T1b)';
    else slnb = 'Не рутина (T1a, риск < 5%)';

    return {
      value: T,
      unit: `(${t} мм, 5-yr ~${stage5y}%)`,
      interpretation: `${band} — ${T}${ulc ? ' с изъязвлением' : ''}`,
      color,
      details: `AJCC 8. Примерная 5-летняя выживаемость на стадии I-II: ~${stage5y}%. Рекомендуемый край иссечения: ${margin}. SLNB: ${slnb}.`,
      actions: [
        `Wide local excision с краем ${margin} до мышечной фасции`,
        slnb !== 'Не рутина (T1a, риск < 5%)' ? 'Sentinel lymph node biopsy (SLNB) для стадирования — при T1b+' : '',
        t >= 1.0 ? 'Полный физикальный осмотр лимфоузлов + УЗИ региональных ЛУ' : '',
        t >= 2.0 ? 'Базовое обследование: LDH, CT/PET-CT грудной клетки / живота / таза, MRI головы (stage IIB+)' : '',
        t >= 2.0 ? 'Молекулярное тестирование: BRAF V600 (таргетная терапия при IV стадии)' : '',
        t >= 4.0 || ulc ? 'Адъювантная терапия при stage IIB-III: анти-PD-1 (пембролизумаб, ниволумаб) 1 год' : '',
        'Фотопротекция SPF 50+, осмотр кожи 1× в 3-6 мес × 2 года, затем 1× в 6-12 мес',
      ].filter(Boolean),
      caveats: [
        'AJCC 8 (2018): изменены пороги T1 на 0.8 мм (вместо 1.0)',
        'Митозы удалены из AJCC 8 как критерий T1 (больше не определяют T1b)',
        'Clark level устарел, не входит в AJCC 8',
        'Breslow измеряется от зернистого слоя эпидермиса до глубочайшей опухолевой клетки',
        'SLNB рекомендуется при T1b и выше (риск метастаза в SLN > 5%)',
        'Регрессия, перитуморальная лимфоцитарная инфильтрация, LVI, микросателлиты — дополнительные факторы',
      ],
      scale: {
        segments: [
          { min: 0, max: 0.8, label: 'T1a', color: '#22C55E' },
          { min: 0.8, max: 1.0, label: 'T1b', color: '#84CC16' },
          { min: 1.0, max: 2.0, label: 'T2', color: '#F59E0B' },
          { min: 2.0, max: 4.0, label: 'T3', color: '#F97316' },
          { min: 4.0, max: 20, label: 'T4', color: '#EF4444' },
        ],
        current: t,
        unit: 'мм',
      },
      related: [{ id: 'abcde', title: 'ABCDE' }, { id: 'posas', title: 'POSAS' }],
      relatedCourses: [{ id: '317.1', title: 'Дерматология' }],
    };
  },
  reference: 'Breslow A. Thickness, cross-sectional areas and depth of invasion in the prognosis of cutaneous melanoma. Ann Surg 1970;172:902-908. AJCC Cancer Staging Manual 8th ed. (2017).',
  countries: 'Международный (AJCC 8 / NCCN)',
  presets: [
    { label: 'T1a (0.5 мм)', values: { thickness: 0.5, ulceration: false, mitosis: false, clark: '' } },
    { label: 'T2b (1.8 мм ulc)', values: { thickness: 1.8, ulceration: true, mitosis: false, clark: '' } },
    { label: 'T4b (5 мм ulc)', values: { thickness: 5.0, ulceration: true, mitosis: true, clark: '' } },
  ],
  info: `### Для чего используется
**Breslow thickness** — основной прогностический критерий **меланомы кожи** (AJCC 8, 2018).

### T-стадия (AJCC 8)
| T | Толщина | Подкатегория |
|---|---|---|
| Tis | In situ | — |
| T1a | < 0.8 мм, без ulc | — |
| T1b | < 0.8 мм с ulc ИЛИ 0.8-1.0 мм | — |
| T2a / T2b | 1.0-2.0 мм, без / с ulc | — |
| T3a / T3b | 2.0-4.0 мм | — |
| T4a / T4b | > 4.0 мм | — |

### 5-летняя выживаемость (stage I-II)
| T | Без ulc | С ulc |
|---|---|---|
| T1a | 99% | — |
| T1b | 93% | 93% |
| T2 | 94% | 82% |
| T3 | 88% | 68% |
| T4 | 75% | 54% |

### Рекомендуемый край иссечения (WLE)
| Breslow | Край |
|---|---|
| In situ | 0.5 см |
| ≤ 1 мм | 1 см |
| 1-2 мм | 1-2 см |
| > 2 мм | 2 см |

### SLNB
- T1a (< 0.8, без ulc): не рутина (риск < 5%)
- T1b: обсудить (риск 5-10%)
- ≥ T2: рекомендована

### Адъювантная терапия
Stage IIB-III: анти-PD-1 (пембролизумаб, ниволумаб) 1 год. BRAF V600: дабрафениб + траметиниб.

### Clark level (устарел)
Не входит в AJCC 8 с 2010. Использовать только если толщина не определена.

### Источник
Breslow A. Ann Surg 1970. AJCC 8 (2017).`,
};

export default runner;
