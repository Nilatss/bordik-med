// @ts-nocheck
/** Runner: lirads */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'size',
      label: 'Размер очага (мм)',
      type: 'number',
      min: 1,
      max: 200,
      step: 1,
      unit: 'мм',
    },
    {
      id: 'aphe',
      label: 'Артериальное фазовое гиперусиление (APHE)',
      type: 'select',
      options: [
        { value: 'none', label: 'Нет / минимальное' },
        { value: 'rim', label: 'Кольцевидное (rim APHE — признак LR-M)' },
        { value: 'nonrim', label: 'Нерим-тип (non-rim APHE)' },
      ],
    },
    {
      id: 'washout',
      label: 'Вымывание (washout) в венозной / отсроченной фазе',
      type: 'select',
      options: [
        { value: 'none', label: 'Нет' },
        { value: 'nonperipheral', label: 'Неперифер. вымывание' },
        { value: 'peripheral', label: 'Перифер. вымывание (признак LR-M)' },
      ],
    },
    {
      id: 'capsule',
      label: 'Усиливающаяся капсула',
      type: 'checkbox',
      points: 0,
    },
    {
      id: 'threshold',
      label: 'Пороговый рост (≥ 50% за ≤ 6 мес)',
      type: 'checkbox',
      points: 0,
    },
    {
      id: 'tiv',
      label: 'Опухолевый тромб в вене (TIV)',
      type: 'checkbox',
      points: 0,
    },
  ],
  compute: (v) => {
    const size = Number(v.size);
    const aphe = String(v.aphe);
    const wash = String(v.washout);
    const capsule = v.capsule === true || v.capsule === 'true';
    const threshold = v.threshold === true || v.threshold === 'true';
    const tiv = v.tiv === true || v.tiv === 'true';

    let category = '';
    let catNum = 0;
    let color = '';
    let details = '';
    let actions: string[] = [];

    if (tiv) {
      category = 'LR-TIV';
      catNum = 6;
      color = '#450A0A';
      details = 'Опухолевый тромб в вене — специфический признак HCC (LR-5 эквивалент по агрессивности).';
      actions = ['Стадирование BCLC — обычно BCLC C (advanced)', 'Системная терапия (atezolizumab + bevacizumab, lenvatinib, sorafenib)', 'Паллиативное / локорегиональное лечение по показаниям'];
    } else if (aphe === 'rim' || wash === 'peripheral') {
      category = 'LR-M';
      catNum = 5;
      color = '#7F1D1D';
      details = 'Вероятно НЕ-HCC злокачественная опухоль (iCCA, комбинированный HCC-CC, метастазы). Rim APHE или периферическое washout.';
      actions = ['Биопсия обязательна', 'Исключить intrahepatic cholangiocarcinoma', 'Стадирование с учётом конкретной нозологии'];
    } else if (aphe === 'nonrim' && size >= 20 && (wash === 'nonperipheral' || capsule || threshold)) {
      category = 'LR-5';
      catNum = 5;
      color = '#7F1D1D';
      details = 'Определённо HCC (≥ 20 мм + non-rim APHE + ≥ 1 дополнительный признак). Биопсия НЕ требуется.';
      actions = ['Лечение без биопсии (достаточно визуализации + ХЛ)', 'BCLC стадирование', 'MDT консилиум: резекция / трансплантация / аблация / TACE / системная'];
    } else if (aphe === 'nonrim' && size >= 10 && size < 20 && ((wash === 'nonperipheral' && (capsule || threshold)) || (capsule && threshold))) {
      category = 'LR-5';
      catNum = 5;
      color = '#7F1D1D';
      details = 'Определённо HCC (10-19 мм + non-rim APHE + ≥ 2 дополнительных признака).';
      actions = ['Лечение без биопсии', 'BCLC стадирование', 'MDT консилиум'];
    } else if (aphe === 'nonrim' && (wash === 'nonperipheral' || capsule || threshold)) {
      category = 'LR-4';
      catNum = 4;
      color = '#EF4444';
      details = 'Вероятно HCC. Показана биопсия или краткосрочный контроль.';
      actions = ['Обсудить биопсию или повтор МРТ/КТ через 3 мес', 'MDT консилиум'];
    } else if (aphe === 'nonrim' || wash === 'nonperipheral' || capsule) {
      category = 'LR-3';
      catNum = 3;
      color = '#F59E0B';
      details = 'Промежуточная вероятность малигнизации. Повтор визуализации через 3-6 мес.';
      actions = ['Контроль мпМРТ / КТ с 4-фазным контрастированием через 3-6 мес', 'Альтернатива — биопсия при высокой клинической подозрительности'];
    } else if (size < 10 && aphe === 'none') {
      category = 'LR-2';
      catNum = 2;
      color = '#84CC16';
      details = 'Вероятно доброкачественное (регенераторный узел, малый гипердиспластический).';
      actions = ['Рутинный скрининг HCC (УЗИ + АФП каждые 6 мес)'];
    } else {
      category = 'LR-1';
      catNum = 1;
      color = '#22C55E';
      details = 'Определённо доброкачественное (киста, гемангиома, очаговое жировое).';
      actions = ['Рутинный скрининг HCC (УЗИ + АФП каждые 6 мес)'];
    }

    return {
      value: category,
      unit: `${size} мм`,
      interpretation: `LI-RADS: ${category}`,
      color,
      details,
      actions,
      caveats: [
        'LI-RADS v2018 (CT/MRI) — для пациентов с циррозом / хроническим гепатитом B / HCC в анамнезе',
        'Не применяется без факторов риска HCC',
        'Ключевые признаки: non-rim APHE, non-peripheral washout, enhancing capsule, threshold growth',
        'LR-M (probably non-HCC malignancy): rim APHE, peripheral washout, targetoid',
        'LR-TIV — патогномоничный признак инвазии в портальные/печёночные вены',
        'Для CEUS есть отдельная CEUS LI-RADS (v2017)',
      ],
      scale: {
        segments: [
          { min: 1, max: 2, label: 'LR-1', color: '#22C55E' },
          { min: 2, max: 3, label: 'LR-2', color: '#84CC16' },
          { min: 3, max: 4, label: 'LR-3', color: '#F59E0B' },
          { min: 4, max: 5, label: 'LR-4', color: '#EF4444' },
          { min: 5, max: 6, label: 'LR-5/M', color: '#7F1D1D' },
          { min: 6, max: 7, label: 'LR-TIV', color: '#450A0A' },
        ],
        current: catNum,
        unit: 'LI-RADS',
      },
      related: [
        { id: 'birads', title: 'BI-RADS' },
        { id: 'tirads', title: 'TI-RADS' },
        { id: 'meld', title: 'MELD' },
        { id: 'tnm', title: 'TNM' },
      ],
      relatedCourses: [
        { id: '311.1', title: 'Лучевая диагностика' },
        { id: '309.1', title: 'Основы онкологии' },
      ],
    };
  },
  reference: 'American College of Radiology. CT/MRI LI-RADS v2018 Core. Reston, VA: ACR; 2018. Chernyak V et al. Liver Imaging Reporting and Data System (LI-RADS) Version 2018. Radiology 2018;289:816-830.',
  countries: 'Международный (ACR / AASLD)',
  presets: [
    { label: 'LR-5 (25мм HCC)', values: { size: 25, aphe: 'nonrim', washout: 'nonperipheral', capsule: true, threshold: false, tiv: false } },
    { label: 'LR-3 (12мм APHE только)', values: { size: 12, aphe: 'nonrim', washout: 'none', capsule: false, threshold: false, tiv: false } },
    { label: 'LR-M (rim APHE)', values: { size: 30, aphe: 'rim', washout: 'peripheral', capsule: false, threshold: false, tiv: false } },
  ],
  info: `### Для чего используется
**ACR LI-RADS v2018 (Liver Imaging Reporting and Data System)** — стандартизированная категоризация очаговых образований печени на КТ/МРТ у пациентов **высокого риска HCC** (цирроз, хронический HBV, HCC в анамнезе). Позволяет диагностировать HCC без биопсии.

### Категории
| Кат. | Интерпретация |
|---|---|
| **LR-1** | Определённо доброкачественное |
| **LR-2** | Вероятно доброкачественное |
| **LR-3** | Промежуточная вероятность |
| **LR-4** | Вероятно HCC |
| **LR-5** | Определённо HCC (биопсия не нужна) |
| **LR-M** | Вероятно не-HCC малигнизация (iCCA, комб. HCC-CC) |
| **LR-TIV** | Опухолевый тромб в вене |
| **LR-NC** | Non-categorizable (неоценимое исследование) |

### Главные признаки HCC
1. **Non-rim APHE** — нерим-тип артериального фазового гиперусиления
2. **Non-peripheral washout** — неперифер. вымывание в венозной / отсроченной фазе
3. **Enhancing capsule** — усиливающаяся капсула
4. **Threshold growth** — рост ≥ 50% за ≤ 6 мес

### Критерии LR-5
| Размер | Требуется |
|---|---|
| **≥ 20 мм** | Non-rim APHE + ≥ 1 дополнительный признак |
| **10-19 мм** | Non-rim APHE + ≥ 2 доп. признака |

### Признаки LR-M (non-HCC)
- **Rim APHE** (кольцевидное усиление)
- **Peripheral washout**
- **Targetoid appearance**
- **Delayed central enhancement**

### Стадирование после LI-RADS
- **BCLC** (Barcelona Clinic Liver Cancer) — 0, A, B, C, D
- Учитывает: размер/число очагов, ECOG, Child-Pugh, инвазию в сосуды/метастазы

### Тактика по стадиям
| Стадия | Первая линия |
|---|---|
| **BCLC 0/A** (ранняя) | Резекция, трансплантация, RFA/MWA |
| **BCLC B** (промежуточная) | TACE, TARE |
| **BCLC C** (распространённая) | Atezolizumab + bevacizumab, lenvatinib, sorafenib |
| **BCLC D** (терминальная) | Best supportive care |

### Скрининг HCC
- **УЗИ + АФП каждые 6 мес** у пациентов с циррозом или хроническим HBV
- Чувствительность УЗИ: 60-85%
- AFP ≥ 20 нг/мл — повышение подозрения

### Альтернативы
- **EASL / AASLD** критерии — упрощённые (APHE + washout в цирротической печени)
- **OPTN** — для трансплантационного листа
- **CEUS LI-RADS** — для УЗИ с контрастом

### Ограничения
- Только для пациентов высокого риска
- Не заменяет биопсию при LR-M или атипичных находках
- Не применяется на МРТ с гадолиниевыми гепатоспецифичными контрастами без адаптации`,
};
export default runner;
