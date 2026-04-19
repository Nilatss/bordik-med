// @ts-nocheck
/** Runner: big — BIG score (Borgman 2011) pediatric trauma mortality */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'bd',
      label: 'Base Deficit (BD, избыток оснований × -1)',
      type: 'number',
      unit: 'ммоль/л',
      min: -20,
      max: 40,
      step: 0.1,
      quickValues: [0, 2, 4, 6, 8, 10, 15],
    },
    {
      id: 'inr',
      label: 'INR',
      type: 'number',
      unit: '',
      min: 0.5,
      max: 10,
      step: 0.01,
      quickValues: [1.0, 1.2, 1.5, 2.0, 2.5, 3.0],
    },
    {
      id: 'gcs',
      label: 'GCS (Glasgow Coma Scale)',
      type: 'number',
      unit: '',
      min: 3,
      max: 15,
      step: 1,
      quickValues: [3, 6, 8, 10, 13, 15],
    },
  ],
  compute: (v) => {
    const bd = Number(v.bd);
    const inr = Number(v.inr);
    const gcs = Number(v.gcs);
    const gcsPoints = gcs <= 7 ? 15 : 0;
    const big = bd + (2.5 * inr) + gcsPoints;
    const val = big.toFixed(1);

    let interpretation = '', color = '#22C55E', details = '', mortality = '';
    let actions: string[] = [];
    if (big < 10) {
      interpretation = 'Низкий риск смертности';
      color = '#22C55E';
      mortality = '~ 0–5%';
      details = 'BIG < 10 — низкий риск смертности (~ 0–5%). Продолжить стандартное травма-ведение, наблюдение в соответствующем уровне реанимации.';
      actions = [
        'Стандартный ATLS-подход, вторичный осмотр',
        'ICU при политравме (ISS ≥ 16)',
        'Контроль лабораторных (лактат, BD, Hb) в динамике',
      ];
    } else if (big <= 15) {
      interpretation = 'Промежуточный риск смертности';
      color = '#F59E0B';
      mortality = '~ 5–25%';
      details = 'BIG 10–15 — промежуточный риск (~ 5–25%). Требует активной ресусцитации, педиатрического травма-центра, ICU.';
      actions = [
        'Перевод в специализированный педиатрический травма-центр',
        'Damage control resuscitation: 10–20 мл/кг PRBC, 1:1:1 (RBC:FFP:PLT)',
        'Tranexamic acid 15 мг/кг (max 1 г) в течение 3 ч (CRASH-3 экстраполяция)',
        'Серийный BD/лактат, коррекция коагулопатии (FFP, cryo)',
      ];
    } else {
      interpretation = 'Высокий риск смертности';
      color = '#EF4444';
      mortality = '> 25%';
      details = 'BIG > 15 — высокий риск смертности (> 25%). Требует агрессивной ресусцитации, активации MTP, немедленного хирургического вмешательства при показаниях.';
      actions = [
        'MTP активирован, 1:1:1 balanced resuscitation',
        'TXA 15 мг/кг в первые 3 часа',
        'Ранняя хирургия / damage control при продолжающемся кровотечении',
        'Коррекция гипотермии (> 36°C), ацидоза (pH > 7,2), коагулопатии',
        'Обсуждение реалистичных целей с семьёй при BIG > 25',
      ];
    }

    return {
      value: val,
      unit: '(BIG)',
      interpretation,
      color,
      details: details + `\n\nКомпоненты: BD = ${bd.toFixed(1)}, 2,5 × INR = ${(2.5 * inr).toFixed(2)}, GCS ≤ 7 → +15 (${gcsPoints}).\nПрогноз смертности: ${mortality}.`,
      actions,
      caveats: [
        'BIG валидирован у педиатрических (< 18 лет) пациентов с травмой (Borgman 2011, derived n=723)',
        'Требует данных при поступлении: BD (ABG), INR, GCS',
        'Не учитывает возраст, тип травмы (тупая/проникающая), механизм',
        'Внешняя валидация подтверждает дискриминацию (AUC ≈ 0,90) в разных когортах',
        'Как и любой score — не замена клиническому суждению; использовать совместно с PTS, RTS',
      ],
      scale: {
        segments: [
          { min: 0, max: 10, label: 'Low', color: '#22C55E' },
          { min: 10, max: 15, label: 'Intermediate', color: '#F59E0B' },
          { min: 15, max: 40, label: 'High', color: '#EF4444' },
        ],
        current: Number(val),
        unit: '',
      },
      related: [
        { id: 'rts', title: 'RTS' },
        { id: 'triss', title: 'TRISS' },
        { id: 'iss', title: 'ISS / NISS' },
        { id: 'pecarn-cspine', title: 'PECARN C-spine' },
        { id: 'gcs', title: 'GCS' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Неотложная помощь' },
        { id: '302.2', title: 'Травматология' },
      ],
    };
  },
  reference: 'Borgman MA, Maegele M, Wade CE, Blackbourne LH, Spinella PC. Pediatric trauma BIG score: predicting mortality in children after military and civilian trauma. Pediatrics 2011;127:e892–7.',
  countries: 'Международный (derived US military + civilian)',
  presets: [
    { label: 'Лёгкая травма (BD 2, INR 1,0, GCS 15)', values: { bd: 2, inr: 1.0, gcs: 15 } },
    { label: 'Промежуточный (BD 8, INR 1,5, GCS 12)', values: { bd: 8, inr: 1.5, gcs: 12 } },
    { label: 'Тяжёлая ЧМТ + коагулопатия', values: { bd: 10, inr: 2.0, gcs: 6 } },
    { label: 'Критический (массивная кровопотеря)', values: { bd: 15, inr: 2.5, gcs: 5 } },
  ],
  info: `### Для чего используется
**BIG score (Borgman 2011)** — педиатрическая шкала прогноза **смертности при травме** на основе 3 переменных при поступлении. Простая, валидированная, применима у детей < 18 лет.

### Формула
\`BIG = BD + (2,5 × INR) + (15, если GCS ≤ 7)\`

- **BD** — base deficit (ммоль/л, из артериальной газометрии)
- **INR** — международное нормализованное отношение
- **GCS** — Glasgow Coma Scale; если ≤ 7, добавляется 15 баллов

### Интерпретация
| BIG | Риск смертности |
|---|---|
| < 10 | Низкий (~ 0–5%) |
| 10–15 | Промежуточный (~ 5–25%) |
| > 15 | Высокий (> 25%) |

### Валидация
- **Derivation (Borgman 2011)**: 723 педиатрических пациента (US military + civilian), AUC **0,89–0,91**
- **External validation**: Davis et al. 2015 (n=1722), Borgman 2013 (Europe) — AUC ≈ 0,88–0,92
- Превосходит или эквивалентен **PTS (Pediatric Trauma Score)** и **RTS**

### Применение
- При поступлении в ED / травма-центр
- Triage: нужно ли активировать MTP, ICU, перевод в higher-level центр
- Не заменяет клиническое суждение; дополняет PTS, RTS, TRISS

### Преимущества
- Только 3 переменные
- Все доступны в первые 5–10 мин (GCS при осмотре, INR/BD в первой лабораторной панели)
- Работает при военной и гражданской травме
- Не требует механизма или анатомической детализации

### Ограничения
- Нужен ABG и коагулограмма (может отсутствовать в field)
- Не учитывает возраст, вес, тип травмы
- INR до ресусцитации (после массивной инфузии кристаллоидов может исказиться)

### Практические действия
| BIG | Действия |
|---|---|
| < 10 | Стандартное ведение, наблюдение |
| 10–15 | Интенсивная ресусцитация, ICU, рассмотреть MTP |
| > 15 | Активировать MTP, damage control, рассмотреть ограничения |

### Источник
Borgman MA et al. *Pediatrics* 2011;127:e892.
`,
};

export default runner;
