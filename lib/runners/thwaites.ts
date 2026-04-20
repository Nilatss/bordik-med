// @ts-nocheck
/** Runner: thwaites — TB meningitis vs bacterial meningitis */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'age', label: 'Возраст', type: 'number', unit: 'лет', min: 0, max: 100, quickValues: [25, 35, 45, 55, 65] },
    { id: 'duration', label: 'Длительность симптомов', type: 'number', unit: 'дн', min: 0, max: 90, quickValues: [1, 3, 5, 7, 14, 21] },
    { id: 'wbc', label: 'Лейкоциты крови', type: 'number', unit: '×10⁹/л', min: 0.5, max: 50, step: 0.1, quickValues: [5, 8, 12, 18, 25] },
    { id: 'csf_wbc', label: 'WBC в ЦСЖ', type: 'number', unit: 'кл/мкл', min: 0, max: 5000, quickValues: [50, 200, 500, 1000, 3000] },
    { id: 'csf_neu', label: 'Доля нейтрофилов в ЦСЖ', type: 'number', unit: '%', min: 0, max: 100, quickValues: [10, 30, 50, 70, 90] },
  ],
  compute: (v) => {
    const age = Number(v.age) || 0;
    const dur = Number(v.duration) || 0;
    const wbc = Number(v.wbc) || 0;
    const csfWbc = Number(v.csf_wbc) || 0;
    const csfNeu = Number(v.csf_neu) || 0;

    // Thwaites diagnostic index (2002): sum of points for 5 features
    // Age ≥ 36 = +2, else 0
    // Duration (days) ≥ 6 = −5, else 0   (TBM has longer)
    // WBC ≥ 15 = +4, else 0
    // CSF WBC ≥ 900 = +3, else 0        (NOTE: original uses <900 for TBM)
    // CSF neutrophil% ≥ 75 = +4, else 0
    // Score ≤ 4 → TBM; Score > 4 → BM
    let pts = 0;
    if (age >= 36) pts += 2;
    if (dur < 6) pts += 0; else pts += -5;
    if (wbc >= 15) pts += 4;
    if (csfWbc >= 900) pts += 3;
    if (csfNeu >= 75) pts += 4;

    let dx = '';
    let color = '#22C55E';
    if (pts <= 4) { dx = 'TB meningitis (TBM) вероятен'; color = '#F97316'; }
    else { dx = 'Бактериальный менингит (БМ) вероятен'; color = '#EF4444'; }

    return {
      value: dx,
      unit: `(${pts} б.)`,
      interpretation: `Индекс Thwaites = ${pts}. ${dx} (cutoff 4: ≤ 4 → TBM, > 4 → BM).`,
      color,
      details: `Thwaites index (2002, Вьетнам) — различает TBM и острый БМ у взрослых. Чувствительность 97 %, специфичность 91 % для TBM при счёте ≤ 4.`,
      actions: [
        pts <= 4 ? 'ПЦР Xpert MTB/RIF Ultra в ЦСЖ (чувствительность ~ 65–70 %, выше повторными пробами)' : null,
        pts <= 4 ? 'Культура ЦСЖ на M. tuberculosis (золотой стандарт, но медленно — 2–6 нед)' : null,
        pts <= 4 ? 'Противо-ТБ терапия НЕМЕДЛЕННО при клиническом подозрении: 2HRZE / 7–10 HR (до 12 мес)' : null,
        pts <= 4 ? 'Дексаметазон 0,3–0,4 мг/кг/сут × 6–8 нед с постепенной отменой (снижает смертность, доказано Thwaites 2004)' : null,
        pts <= 4 ? 'Тест на ВИЧ (30–50 % случаев TBM в эндемичных регионах)' : null,
        pts > 4 ? 'Цефтриаксон 2 г × 2 + ванкомицин 15–20 мг/кг × 2–4 + дексаметазон 10 мг × 4 × 4 дн' : null,
        pts > 4 ? '> 50 лет / беременные — добавить ампициллин (Listeria)' : null,
        'МРТ/КТ с контрастом — менингеальное усиление, базилярное, гидроцефалия (типично для TBM)',
        'Нейрохирургия при обструктивной гидроцефалии (VP-шунт)',
      ].filter(Boolean),
      caveats: [
        'Индекс валидирован у взрослых; у детей менее точен',
        'Критерии (Marais 2010) — альтернатива для TBM (definite / probable / possible)',
        'При подозрении на TBM — не ждать подтверждения, начинать эмпирическую терапию',
        'Параллельно исключить криптококк (CrAg), HSV (ПЦР), сифилис (VDRL)',
        'Повторная LP через 48–72 ч для тенденции',
      ],
      scale: {
        segments: [
          { min: -10, max: 4, label: 'TBM', color: '#F97316' },
          { min: 4, max: 15, label: 'БМ', color: '#EF4444' },
        ],
        current: Math.max(-5, Math.min(pts, 13)),
        unit: 'балл',
      },
      relatedCourses: [
        { id: '305.1', title: 'Инфекции' },
        { id: '307.2', title: 'Микробиология' },
      ],
      related: [
        { id: 'nigrovic', title: 'Nigrovic BMS' },
        { id: 'who-tb', title: 'WHO TB regimens' },
        { id: 'gmsps', title: 'GMSPS (менингококк)' },
      ],
    };
  },
  reference: 'Thwaites GE et al. Lancet 2002;360:1287 (TBM vs BM diagnostic index).',
  countries: 'Международный (оригинал — Вьетнам, Thwaites)',
  presets: [
    { label: 'Классика TBM', values: { age: 30, duration: 14, wbc: 9, csf_wbc: 200, csf_neu: 20 } },
    { label: 'Острый БМ', values: { age: 40, duration: 2, wbc: 20, csf_wbc: 2500, csf_neu: 90 } },
    { label: 'Серая зона', values: { age: 50, duration: 5, wbc: 14, csf_wbc: 800, csf_neu: 60 } },
  ],
  info: `### Для чего используется
**Thwaites diagnostic index** — дифференциация **туберкулёзного менингита (TBM)** и **острого бактериального менингита (БМ)** у взрослых на основе 5 переменных.

### Баллы
| Переменная | Условие | Баллы |
|---|---|---|
| Возраст | ≥ 36 лет | +2 |
| Длительность симптомов | ≥ 6 дн | −5 |
| Лейкоциты крови | ≥ 15 × 10⁹/л | +4 |
| WBC в ЦСЖ | ≥ 900 кл/мкл | +3 |
| Нейтрофилы ЦСЖ | ≥ 75 % | +4 |

### Интерпретация (cutoff 4)
| Сумма | Вероятность |
|---|---|
| ≤ 4 | TBM |
| > 4 | Бактериальный менингит |

Чувствительность для TBM 97 %, специфичность 91 %.

### Типичные отличия TBM vs БМ
| Признак | TBM | БМ |
|---|---|---|
| Длительность | Недели | Часы–дни |
| ЦСЖ-WBC | 50–500, лимфоцитоз | > 1000, нейтрофилы |
| ЦСЖ белок | Высокий (> 1 г/л) | Высокий |
| ЦСЖ глюкоза | Низкая | Очень низкая |
| Нейровизуализация | Базилярный arachnoiditis, гидроцефалия, инфаркты | Менингеальное усиление |

### Терапия TBM
- **2HRZE / 7–10 HR** (9–12 мес общая)
- **Дексаметазон** 0,3–0,4 мг/кг/сут × 6–8 нед с постепенным снижением (Thwaites 2004: ↓ смертность с 41,3 % до 31,8 %)
- Хирургия при гидроцефалии

### Терапия БМ
- Цефтриаксон 2 г × 2 + ванкомицин + дексаметазон 10 мг × 4 × 4 дн
- > 50 лет: + ампициллин (Listeria)
- Пенициллин-R пневмококк: добавить ванкомицин

### Ограничения
- Валидирован у взрослых в эндемичных регионах
- У детей — Marais 2010 criteria (definite/probable/possible TBM)
- Криптококк у ВИЧ+ — отдельно (CrAg-тест)
- Длительность симптомов спорна — некоторые TBM остро манифестируют`,
};

export default runner;
