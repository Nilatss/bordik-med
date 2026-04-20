// @ts-nocheck
/** Runner: orads */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'modality',
      label: 'Модальность',
      type: 'select',
      options: [
        { value: 'us', label: 'УЗИ (O-RADS US)' },
        { value: 'mri', label: 'МРТ (O-RADS MRI)' },
      ],
    },
    {
      id: 'category',
      label: 'O-RADS категория',
      type: 'select',
      options: [
        { value: '0', label: '0 — неполное исследование' },
        { value: '1', label: '1 — норма (физиологическое образование/premenopausal)' },
        { value: '2', label: '2 — почти точно доброкачественное (< 1% риск)' },
        { value: '3', label: '3 — низкий риск малигнизации (1-10%)' },
        { value: '4', label: '4 — промежуточный риск (10-50%)' },
        { value: '5', label: '5 — высокий риск (≥ 50%)' },
      ],
    },
    {
      id: 'size',
      label: 'Максимальный размер (см)',
      type: 'number',
      min: 0,
      max: 40,
      step: 0.1,
    },
  ],
  compute: (v) => {
    const mod = String(v.modality);
    const cat = String(v.category);
    const size = Number(v.size) || 0;

    const map: Record<string, { color: string; risk: string; action: string; num: number }> = {
      '0': { color: '#94A3B8', risk: 'Неполное', action: 'Повторить УЗИ на 5-10 день цикла / МРТ с контрастом', num: 0 },
      '1': { color: '#22C55E', risk: '~0%', action: 'Никаких действий; физиологическое образование', num: 1 },
      '2': { color: '#22C55E', risk: '< 1%', action: 'Наблюдение или выписка; при симптомах — повтор УЗИ через 1 год', num: 2 },
      '3': { color: '#F59E0B', risk: '1-10%', action: 'МРТ с контрастом или консультация гинеколога-онколога', num: 3 },
      '4': { color: '#EF4444', risk: '10-50%', action: 'Консультация гинеколога-онколога; МРТ / хирургическая оценка', num: 4 },
      '5': { color: '#7F1D1D', risk: '≥ 50%', action: 'Срочная консультация онколога; стадирование + хирургия', num: 5 },
    };

    const entry = map[cat] || map['0'];

    return {
      value: `O-RADS ${cat}`,
      unit: mod === 'us' ? 'US' : 'MRI',
      interpretation: `O-RADS ${cat} — риск малигнизации: ${entry.risk}`,
      color: entry.color,
      details: `Категория O-RADS ${cat} (${mod === 'us' ? 'УЗИ' : 'МРТ'}). Размер: ${size} см. Рекомендация: ${entry.action}.`,
      actions: [
        entry.action,
        Number(cat) >= 3 ? 'СА-125 + HE4 + ROMA индекс у постменопаузальных женщин' : '',
        Number(cat) >= 4 ? 'Мультидисциплинарный консилиум (гинеколог-онколог)' : '',
        size >= 10 && Number(cat) >= 3 ? 'Большой размер (≥ 10 см) — учесть риск перекрута, биопсия НЕ рекомендуется' : '',
        'Документировать: солидные компоненты, васкуляризация (Color Score 1-4), асцит',
      ].filter(Boolean),
      caveats: [
        'ACR O-RADS US v2022 и O-RADS MRI (2021) — стандарты для образований яичников',
        'Применим только для НЕ-беременных женщин (отдельный алгоритм для беременности)',
        'Color Score 4 (выраженная васкуляризация) повышает подозрение в US',
        'ADNEX модель — альтернатива O-RADS US (IOTA group)',
        'Биопсия кист яичника НЕ рекомендуется (риск обсеменения брюшины)',
        'Постменопаузальные образования → чаще O-RADS 4-5 даже при малом размере',
      ],
      scale: {
        segments: [
          { min: 0, max: 1, label: '0', color: '#94A3B8' },
          { min: 1, max: 3, label: '1-2', color: '#22C55E' },
          { min: 3, max: 4, label: '3', color: '#F59E0B' },
          { min: 4, max: 5, label: '4', color: '#EF4444' },
          { min: 5, max: 6, label: '5', color: '#7F1D1D' },
        ],
        current: entry.num,
        unit: 'O-RADS',
      },
      related: [
        { id: 'birads', title: 'BI-RADS' },
        { id: 'lirads', title: 'LI-RADS' },
        { id: 'tirads', title: 'TI-RADS' },
        { id: 'pirads', title: 'PI-RADS' },
      ],
      relatedCourses: [
        { id: '311.1', title: 'Лучевая диагностика' },
        { id: '309.1', title: 'Основы онкологии' },
      ],
    };
  },
  reference: 'Andreotti RF, Timmerman D, Strachowski LM et al. O-RADS US Risk Stratification and Management System: A Consensus Guideline from the ACR Ovarian-Adnexal Reporting and Data System Committee. Radiology 2020;294:168-185.',
  countries: 'Международный (ACR)',
  presets: [
    { label: 'O-RADS 2 киста', values: { modality: 'us', category: '2', size: 4 } },
    { label: 'O-RADS 4 МРТ', values: { modality: 'mri', category: '4', size: 7 } },
    { label: 'O-RADS 5 US', values: { modality: 'us', category: '5', size: 12 } },
  ],
  info: `### Для чего используется
**ACR O-RADS (Ovarian-Adnexal Reporting and Data System)** — стандартизированная система отчётности для образований яичников и придатков на УЗИ (O-RADS US v2022) и МРТ (O-RADS MRI 2021).

### Категории
| Кат. | Риск малигнизации | Тактика |
|---|---|---|
| **0** | Неполное | Повторить исследование |
| **1** | ~ 0% (норма) | Наблюдение не требуется |
| **2** | < 1% | Выписка / УЗИ через 1 год при симптомах |
| **3** | 1-10% | МРТ / гинеколог-онколог |
| **4** | 10-50% | Консультация онколога + стадирование |
| **5** | ≥ 50% | Хирургия + стадирование |

### Ключевые дескрипторы УЗИ
- **Солидные компоненты** (papillary projections, irregular walls)
- **Септации** (тонкие < 3 мм / толстые ≥ 3 мм)
- **Color Score** (1 — нет потока, 4 — выраженный)
- **Асцит**, перитонеальные импланты

### Ключевые МРТ-находки
- **DWI / ADC** — рестрикция диффузии → подозрительно
- **T2 dark solid tissue** — O-RADS MRI 2
- **Time-intensity curve (TIC)** — type 3 (washout) → подозрительно
- **Фиброзная ткань** (T2 dark) — доброкачественная

### СА-125 + HE4 + ROMA
- **ROMA ≥ 11.4% (пременопауза)** или **≥ 29.9% (постменопауза)** → высокий риск
- Дополняет O-RADS, особенно при категории 3-4

### Ограничения
- Не применяется при беременности (отдельный алгоритм)
- Эндометриоз, decidualized эндометриома — могут имитировать O-RADS 4
- Оператор-зависим (УЗИ)
- Для детей / подростков отдельные критерии`,
};
export default runner;
