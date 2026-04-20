// @ts-nocheck
/** Runner: cheson */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'deauville',
      label: 'Deauville score (ПЭТ-КТ)',
      type: 'select',
      options: [
        { value: 1, label: '1 — отсутствие накопления' },
        { value: 2, label: '2 — накопление ≤ mediastinum' },
        { value: 3, label: '3 — накопление > mediastinum, но ≤ liver' },
        { value: 4, label: '4 — накопление умеренно выше печени' },
        { value: 5, label: '5 — значительно выше печени или новые очаги' },
      ],
    },
    {
      id: 'nodal',
      label: 'Изменение размеров целевых ЛУ',
      type: 'select',
      options: [
        { value: 'cr', label: 'Все регрессировали до ≤ 1.5 см по длинной оси' },
        { value: 'pr', label: 'Сумма перпендикулярных диаметров (SPD) ↓ ≥ 50%' },
        { value: 'sd', label: 'Изменение < 50% ↓ и < 50% ↑' },
        { value: 'pd', label: 'SPD ↑ ≥ 50% или новые очаги' },
      ],
    },
    {
      id: 'extranodal',
      label: 'Экстранодальные очаги / органы',
      type: 'select',
      options: [
        { value: 'cr', label: 'Нормализованы' },
        { value: 'pr', label: 'Уменьшились, но персистируют' },
        { value: 'sd', label: 'Без изменений' },
        { value: 'pd', label: 'Прогрессия или новые' },
      ],
    },
    {
      id: 'marrow',
      label: 'Костный мозг',
      type: 'select',
      options: [
        { value: 'cr', label: 'Чистый (ПЭТ- или биопсия-)' },
        { value: 'indeterminate', label: 'Неопределённый' },
        { value: 'pd', label: 'Новое поражение КМ' },
      ],
    },
  ],
  compute: (v) => {
    const deauville = Number(v.deauville);
    const nodal = String(v.nodal);
    const extranodal = String(v.extranodal);
    const marrow = String(v.marrow);

    let response = '';
    let responseNum = 0;
    let color = '';
    let details = '';

    if (nodal === 'pd' || extranodal === 'pd' || marrow === 'pd' || deauville === 5) {
      response = 'PD';
      responseNum = 4;
      color = '#991B1B';
      details = 'Прогрессия: Deauville 5 (новые очаги или ↑ SUV от baseline) или анатомическая прогрессия.';
    } else if (deauville <= 3 && nodal === 'cr' && extranodal === 'cr' && marrow === 'cr') {
      response = 'CR';
      responseNum = 1;
      color = '#22C55E';
      details = 'Полный метаболический ответ: Deauville 1-3, нормализация ЛУ и органов, чистый КМ.';
    } else if (deauville >= 4 || nodal === 'pr' || extranodal === 'pr') {
      response = 'PR';
      responseNum = 2;
      color = '#84CC16';
      details = 'Частичный ответ: остаточная активность (Deauville 4), но без прогрессии; SPD ↓ ≥ 50%.';
    } else {
      response = 'SD';
      responseNum = 3;
      color = '#F59E0B';
      details = 'Стабилизация: нет критериев CR, PR или PD.';
    }

    return {
      value: response,
      unit: `Deauville ${deauville}`,
      interpretation: `Lugano 2014: ${response} (Deauville ${deauville})`,
      color,
      details,
      actions: [
        'ПЭТ-КТ — стандарт оценки ответа FDG-авидных лимфом (HL, DLBCL, FL)',
        'Интерим-ПЭТ после 2 циклов (HL) — основа PET-адаптированной терапии',
        'Deauville 1-3 = "PET-negative", 4-5 = "PET-positive"',
        'При CR после индукции — консолидация по протоколу (± ЛТ для bulky)',
        'При PR/SD — оценка биопсией остаточной массы; рассмотреть смену линии',
        'При PD — 2-я линия: R-ICE / R-DHAP → ASCT (DLBCL); брентуксимаб / пембролизумаб (HL)',
      ],
      caveats: [
        'Lugano 2014 (Cheson) заменил IWG 2007; использует ПЭТ-КТ для FDG-авидных лимфом',
        'Не применимо к CLL (iwCLL), MM (IMWG), непрофильным лимфомам (CLL, MALT → отдельные критерии)',
        'Индолентные лимфомы (MZL, некоторые FL) могут быть PET-negative изначально',
        'LYRIC 2016 — модификация для иммунотерапии (indeterminate response, IR)',
        'Deauville оценивается с референсом на печень (scoring) и mediastinal blood pool',
      ],
      scale: {
        segments: [
          { min: 1, max: 2, label: 'CR', color: '#22C55E' },
          { min: 2, max: 3, label: 'PR', color: '#84CC16' },
          { min: 3, max: 4, label: 'SD', color: '#F59E0B' },
          { min: 4, max: 5, label: 'PD', color: '#991B1B' },
        ],
        current: responseNum,
        unit: 'response',
      },
      related: [
        { id: 'ann-arbor', title: 'Ann Arbor' },
        { id: 'recist', title: 'RECIST 1.1' },
        { id: 'percist', title: 'PERCIST' },
      ],
      relatedCourses: [
        { id: '309.1', title: 'Основы онкологии' },
      ],
    };
  },
  reference: 'Cheson BD, Fisher RI, Barrington SF et al. Recommendations for initial evaluation, staging, and response assessment of Hodgkin and non-Hodgkin lymphoma: the Lugano classification. J Clin Oncol 2014;32:3059-3068.',
  countries: 'Международный (Lugano 2014)',
  presets: [
    { label: 'CR — Deauville 2', values: { deauville: 2, nodal: 'cr', extranodal: 'cr', marrow: 'cr' } },
    { label: 'PR — Deauville 4', values: { deauville: 4, nodal: 'pr', extranodal: 'pr', marrow: 'cr' } },
    { label: 'PD — Deauville 5', values: { deauville: 5, nodal: 'pd', extranodal: 'pd', marrow: 'pd' } },
  ],
  info: `### Для чего используется
**Lugano classification / Cheson 2014** — международный стандарт оценки **ответа на терапию при лимфомах**. Основан на ПЭТ-КТ и 5-балльной шкале Deauville, заменил IWG 2007.

### Deauville 5-point scale
| Балл | Критерий |
|---|---|
| **1** | Отсутствие накопления FDG в очаге |
| **2** | Накопление ≤ medastinal blood pool |
| **3** | Накопление > mediastinum, но ≤ печени |
| **4** | Умеренно выше печени |
| **5** | Значительно выше печени (2-3×) или новые очаги |
| **X** | Новые области, не связанные с лимфомой (реактивные) |

> **1-3 = PET-negative**, **4-5 = PET-positive**

### Категории ответа (Lugano)
| Ответ | ПЭТ | Анатомия | КМ |
|---|---|---|---|
| **CR** | Deauville 1-3 | ЛУ ≤ 1.5 см | Чистый (ПЭТ- или биопсия-) |
| **PR** | Deauville 4-5 с ↓ vs baseline | SPD ↓ ≥ 50% | Остаточная активность допустима |
| **SD** | Без изменений | Изменение < 50% | Без изменений |
| **PD** | Deauville 4-5 с ↑ SUV или новые очаги | SPD ↑ ≥ 50% | Новое поражение |

### Интерим-ПЭТ (после 2-х циклов HL)
- **Deauville 1-3** → продолжить ABVD × 4 ± ЛТ (PET-адаптированная деэскалация)
- **Deauville 4-5** → эскалация на BEACOPPesc или смена схемы

### LYRIC 2016 (иммунотерапия)
Модификация для ICI с категорией **Indeterminate Response (IR)**:
- **IR-1** — увеличение ≥ 50% SPD без клинических признаков PD
- **IR-2** — появление нового очага без полноценной прогрессии
- **IR-3** — увеличение FDG без анатомических изменений

Повторная оценка через 12 недель — исключить псевдопрогресс.

### Отличия от IWG 2007
| Параметр | IWG 2007 | Lugano 2014 |
|---|---|---|
| Стадирование | КТ + биопсия КМ | ПЭТ-КТ; КМ-биопсия не обязательна для HL |
| Ответ | CT-based | PET + CT |
| Deauville | Не использовался | Обязателен |
| Новые категории | — | LYRIC (для ICI) |

### Ограничения
- Не применимо к CLL, индолентным лимфомам без FDG-авидности (ММ, малопрогрессирующие)
- Псевдопрогресс и воспаление могут давать false-positive
- Биопсия КМ всё ещё рекомендована для DLBCL при сомнениях`,
};
export default runner;
