// @ts-nocheck
/** Runner: tirads */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'composition',
      label: 'Состав (composition)',
      type: 'select',
      options: [
        { value: '0', label: 'Кистозный / почти полностью кистозный (0)' },
        { value: '0_spong', label: 'Спонгиформный (0)' },
        { value: '1', label: 'Смешанный кистозно-солидный (1)' },
        { value: '2', label: 'Солидный / почти полностью солидный (2)' },
      ],
    },
    {
      id: 'echogenicity',
      label: 'Эхогенность',
      type: 'select',
      options: [
        { value: '0', label: 'Анэхогенный (0)' },
        { value: '1', label: 'Гипер- / изоэхогенный (1)' },
        { value: '2', label: 'Гипоэхогенный (2)' },
        { value: '3', label: 'Выраженно гипоэхогенный (3)' },
      ],
    },
    {
      id: 'shape',
      label: 'Форма',
      type: 'select',
      options: [
        { value: '0', label: 'Шире, чем выше (0)' },
        { value: '3', label: 'Выше, чем шире (3)' },
      ],
    },
    {
      id: 'margin',
      label: 'Края / граница',
      type: 'select',
      options: [
        { value: '0', label: 'Гладкие / плохо определяются (0)' },
        { value: '2', label: 'Лобулированные / неровные (2)' },
        { value: '3', label: 'Экстратиреоидальное распространение (3)' },
      ],
    },
    {
      id: 'foci',
      label: 'Эхогенные фокусы',
      type: 'select',
      options: [
        { value: '0', label: 'Нет / артефакт "хвоста кометы" (0)' },
        { value: '1', label: 'Крупные кальцинаты (1)' },
        { value: '2', label: 'Периферические кальцинаты (2)' },
        { value: '3', label: 'Пунктирные эхогенные фокусы (3)' },
      ],
    },
    {
      id: 'size',
      label: 'Максимальный размер узла (мм)',
      type: 'number',
      min: 1,
      max: 100,
      step: 1,
      unit: 'мм',
    },
  ],
  compute: (v) => {
    const comp = String(v.composition);
    const cpoints = comp === '0' || comp === '0_spong' ? 0 : comp === '1' ? 1 : 2;
    const e = Number(v.echogenicity);
    const sh = Number(v.shape);
    const mg = Number(v.margin);
    const f = Number(v.foci);
    const size = Number(v.size);

    const total = cpoints + e + sh + mg + f;

    let tr = 1;
    let label = '';
    let color = '';
    let risk = '';
    let fnaThreshold = 0;

    if (total === 0 || comp === '0' || comp === '0_spong') {
      tr = 1;
      label = 'TR1 — benign';
      color = '#22C55E';
      risk = 'Доброкачественный (< 1%)';
      fnaThreshold = Infinity;
    } else if (total <= 2) {
      tr = 2;
      label = 'TR2 — not suspicious';
      color = '#84CC16';
      risk = 'Не подозрительный (< 3%)';
      fnaThreshold = Infinity;
    } else if (total === 3) {
      tr = 3;
      label = 'TR3 — mildly suspicious';
      color = '#F59E0B';
      risk = 'Низкое подозрение (~ 5%)';
      fnaThreshold = 25;
    } else if (total <= 6) {
      tr = 4;
      label = 'TR4 — moderately suspicious';
      color = '#EF4444';
      risk = 'Умеренное подозрение (~ 5-20%)';
      fnaThreshold = 15;
    } else {
      tr = 5;
      label = 'TR5 — highly suspicious';
      color = '#7F1D1D';
      risk = 'Высокое подозрение (> 20%)';
      fnaThreshold = 10;
    }

    const followThreshold = tr === 3 ? 15 : tr === 4 ? 10 : tr === 5 ? 5 : Infinity;

    let recommendation = '';
    if (tr <= 2) {
      recommendation = 'FNA не показана. Нет наблюдения.';
    } else if (size >= fnaThreshold) {
      recommendation = `FNA показана (узел ≥ ${fnaThreshold} мм).`;
    } else if (size >= followThreshold) {
      recommendation = `УЗИ-контроль через 1-2 года (узел ${size} мм, ≥ ${followThreshold} мм).`;
    } else {
      recommendation = `Наблюдение не требуется (узел ${size} мм < ${followThreshold} мм).`;
    }

    return {
      value: label,
      unit: `${total} очков`,
      interpretation: `${label} — ${risk}`,
      color,
      details: `Сумма баллов: ${total}. ${risk}. ${recommendation}`,
      actions: [
        recommendation,
        tr >= 4 ? 'Обсудить с эндокринологом / эндокрино-хирургом' : '',
        tr >= 3 ? 'При ТАБ — Bethesda classification (I-VI)' : '',
        'Оценить шейные ЛУ (подозрительные → FNA)',
        'Сравнить с предыдущими УЗИ при наблюдении',
      ].filter(Boolean),
      caveats: [
        'ACR TI-RADS (2017) — отличается от EU-TIRADS и K-TIRADS',
        'Спонгиформные узлы сразу TR1 (независимо от других характеристик)',
        'Кистозные узлы с артефактом "хвоста кометы" — TR1',
        'FNA по Bethesda: I (нед), II (benign), III (AUS/FLUS), IV (SFN), V (подозр.), VI (malignant)',
        'Молекулярные тесты (Afirma, ThyroSeq) — для Bethesda III-IV',
        'Педиатрические пациенты и при семейной МЭН / анамнезе облучения — порог FNA ниже',
      ],
      scale: {
        segments: [
          { min: 1, max: 2, label: 'TR1', color: '#22C55E' },
          { min: 2, max: 3, label: 'TR2', color: '#84CC16' },
          { min: 3, max: 4, label: 'TR3', color: '#F59E0B' },
          { min: 4, max: 5, label: 'TR4', color: '#EF4444' },
          { min: 5, max: 6, label: 'TR5', color: '#7F1D1D' },
        ],
        current: tr,
        unit: 'TR level',
      },
      related: [
        { id: 'birads', title: 'BI-RADS' },
        { id: 'lirads', title: 'LI-RADS' },
        { id: 'tnm', title: 'TNM' },
      ],
      relatedCourses: [
        { id: '311.1', title: 'Лучевая диагностика' },
        { id: '309.1', title: 'Основы онкологии' },
      ],
    };
  },
  reference: 'Tessler FN et al. ACR Thyroid Imaging, Reporting and Data System (TI-RADS): White Paper of the ACR TI-RADS Committee. J Am Coll Radiol 2017;14:587-595.',
  countries: 'Международный (ACR)',
  presets: [
    { label: 'TR1 кистозный', values: { composition: '0', echogenicity: '0', shape: '0', margin: '0', foci: '0', size: 12 } },
    { label: 'TR3 (3 очка) 20 мм', values: { composition: '2', echogenicity: '1', shape: '0', margin: '0', foci: '0', size: 20 } },
    { label: 'TR5 с пункт. кальц.', values: { composition: '2', echogenicity: '3', shape: '3', margin: '2', foci: '3', size: 11 } },
  ],
  info: `### Для чего используется
**ACR TI-RADS (Thyroid Imaging Reporting and Data System, 2017)** — система стратификации риска узлов щитовидной железы на УЗИ и определение показаний к **тонкоигольной аспирационной биопсии (ТАБ/FNA)**.

### 5 категорий (по 5 признакам)
| Признак | Максимум баллов |
|---|---|
| **Состав** | 0 (кистозный) / 0 (спонгиформный) / 1 (смешанный) / 2 (солидный) |
| **Эхогенность** | 0 (анэхо) / 1 (гипер-/изо) / 2 (гипо) / 3 (выраженно гипо) |
| **Форма** | 0 (шире) / 3 (выше, чем шире) |
| **Края** | 0 (гладкие) / 2 (лобулированные) / 3 (экстратиреоидальное распр.) |
| **Эхогенные фокусы** | 0 / 1 (крупные кальц.) / 2 (перифер.) / 3 (пунктирные) |

### Уровни TR
| Сумма | TR | Категория | Риск малигнизации |
|---|---|---|---|
| 0 | **TR1** | Benign | < 1% |
| 2 | **TR2** | Not suspicious | < 3% |
| 3 | **TR3** | Mildly suspicious | ~ 5% |
| 4-6 | **TR4** | Moderately suspicious | ~ 5-20% |
| ≥ 7 | **TR5** | Highly suspicious | > 20% |

### Показания к FNA / контролю
| Уровень | FNA если | Контроль УЗИ если |
|---|---|---|
| **TR1, TR2** | Не показана | Не требуется |
| **TR3** | ≥ 25 мм | 15-24 мм → 1, 3, 5 лет |
| **TR4** | ≥ 15 мм | 10-14 мм → 1, 2, 3, 5 лет |
| **TR5** | ≥ 10 мм | 5-9 мм → ежегодно × 5 лет |

### Bethesda классификация ТАБ
| Кат. | Интерпретация | Риск рака | Тактика |
|---|---|---|---|
| **I** | Недиагностический | 5-10% | Повторная ТАБ |
| **II** | Benign | < 3% | Наблюдение |
| **III** | AUS / FLUS | 10-30% | Повтор / молек. тест |
| **IV** | SFN / HCN | 25-40% | Лобэктомия / молек. тест |
| **V** | Подозрительный | 50-75% | Хирургия |
| **VI** | Malignant | 97-99% | Тиреоидэктомия |

### Молекулярные тесты
- **Afirma GSC** — "rule out" для Bethesda III/IV
- **ThyroSeq** — rule in/out, мутационный профиль (BRAF, RAS, RET/PTC)
- Особенно полезны для снижения необоснованных резекций

### Альтернативы
- **EU-TIRADS** (ESBR 2017) — другая шкала, 5 категорий
- **K-TIRADS** (Korean) — упрощённая
- **ATA** (American Thyroid Association) — описательная, не бальная

### Ограничения
- Не заменяет клиническую оценку (семейный анамнез, облучение в детстве)
- В детской и подростковой практике пороги ниже
- Межнаблюдательская вариабельность ~ 15-25%
- Не применяется при диффузных заболеваниях (Хашимото, Graves)

### Источник
Tessler FN et al. **ACR Thyroid Imaging, Reporting and Data System (TI-RADS): White Paper of the ACR TI-RADS Committee.** *J Am Coll Radiol* 2017;14:587-595.`,
};
export default runner;
