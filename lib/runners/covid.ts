// @ts-nocheck
/** Runner: covid — 4C Mortality + ISARIC + WHO clinical progression */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'age',
hint: 'Возраст в годах', label: 'Возраст', type: 'number', unit: 'лет', min: 0, max: 120, quickValues: [40, 55, 65, 75, 85] },
    { id: 'sex', label: 'Пол', type: 'select', options: [
      { value: 'm', label: 'Мужской' }, { value: 'f', label: 'Женский' },
    ]},
    { id: 'comorb', label: 'Сопутствующих заболеваний (из 10: ХСН, ХОБЛ, астма, СД, ХБП, цирроз, онко, деменция, ВИЧ, ревматологические)', type: 'select', options: [
      { value: '0', label: '0', points: 0 },
      { value: '1', label: '1', points: 1 },
      { value: '2', label: '≥ 2', points: 2 },
    ]},
    { id: 'rr',
hint: 'ЧДД, в минуту. Норма: 12-20', label: 'ЧДД', type: 'number', unit: '/мин', min: 8, max: 60, quickValues: [16, 20, 24, 30, 36] },
    { id: 'spo2',
hint: 'SpO₂, %. Норма: ≥95% на воздухе', label: 'SpO₂ на комнатном воздухе', type: 'number', unit: '%', min: 50, max: 100, quickValues: [88, 92, 94, 96, 98] },
    { id: 'gcs', label: 'GCS < 15', type: 'checkbox' },
    { id: 'urea',
hint: 'Мочевина. Норма: 2.5-7.5 ммоль/л', label: 'Мочевина', type: 'number', unit: 'ммоль/л', min: 1, max: 50, quickValues: [5, 7, 10, 14, 20] },
    { id: 'crp',
hint: 'СРБ. Норма: <5 мг/л', label: 'СРБ', type: 'number', unit: 'мг/л', min: 0, max: 500, quickValues: [20, 50, 100, 150, 250] },
  ],
  compute: (v) => {
    const age = Number(v.age) || 0;
    const isMale = v.sex === 'm';
    const comorb = Number(v.comorb) || 0;
    const rr = Number(v.rr) || 0;
    const spo2 = Number(v.spo2) || 100;
    const gcs = Boolean(v.gcs);
    const urea = Number(v.urea) || 0;
    const crp = Number(v.crp) || 0;

    let pts = 0;
    // Age
    if (age >= 80) pts += 7;
    else if (age >= 70) pts += 6;
    else if (age >= 60) pts += 4;
    else if (age >= 50) pts += 2;
    // Sex
    if (isMale) pts += 1;
    // Comorbidities
    pts += comorb;
    // RR
    if (rr >= 30) pts += 2;
    else if (rr >= 20) pts += 1;
    // SpO2
    if (spo2 < 92) pts += 2;
    // GCS
    if (gcs) pts += 2;
    // Urea mmol/L: 7–14 = 1, >14 = 3
    if (urea > 14) pts += 3;
    else if (urea > 7) pts += 1;
    // CRP
    if (crp >= 100) pts += 2;
    else if (crp >= 50) pts += 1;

    let mortality = '1,2 %';
    let risk = 'Низкий';
    let disposition = 'Амбулаторно';
    let color = '#22C55E';

    if (pts <= 3) { mortality = '1,2 %'; risk = 'Низкий'; disposition = 'Амбулаторно, при возможности'; color = '#22C55E'; }
    else if (pts <= 8) { mortality = '9,9 %'; risk = 'Промежуточный'; disposition = 'Стационар (палата)'; color = '#F59E0B'; }
    else if (pts <= 14) { mortality = '31,4 %'; risk = 'Высокий'; disposition = 'Стационар, мониторинг'; color = '#F97316'; }
    else { mortality = '61,5 %'; risk = 'Очень высокий'; disposition = 'ICU/палата интенсивной терапии'; color = '#EF4444'; }

    // WHO progression rough estimate
    let who = '3 (амбулаторно, без O₂)';
    if (spo2 < 90) who = '6–7 (тяжёлый, O₂/НИВЛ)';
    else if (spo2 < 94) who = '5 (O₂ маской/канюлями)';
    else if (rr >= 30 || gcs) who = '5 (госпитализация)';
    else who = '3–4 (лёгкий/средний)';

    return {
      value: `${pts} б.`,
      unit: '4C',
      interpretation: `4C Mortality: ${mortality} (${risk}). WHO OS ~${who}. → ${disposition}`,
      color,
      details: `ISARIC 4C Mortality Score — валидирован на 35 463 пациентах UK. Диапазон 0–21. WHO Clinical Progression Scale: 0 (невозможно) … 10 (смерть). ISARIC отдельно прогнозирует нужду в инвазивной вентиляции.`,
      actions: [
        spo2 < 94 ? 'O₂-терапия: цель SpO₂ 92–96 % (у ХОБЛ 88–92 %)' : null,
        spo2 < 90 ? 'Рассмотреть НИВЛ / высокопоточный O₂ (HFNC)' : null,
        pts >= 9 ? 'Дексаметазон 6 мг/сут × 10 дн (при потребности в O₂)' : null,
        pts >= 9 ? 'Ремдесивир × 5 дн при ранней госпитализации (< 7 дн симптомов)' : null,
        pts >= 12 ? 'Тоцилизумаб или барицитиниб при прогрессии на O₂/ИВЛ + ↑ СРБ' : null,
        'ВТЭ-профилактика: эноксапарин 40 мг п/к (терапевтическая при тяжёлой)',
        'Мониторинг D-димер, ферритин, ЛДГ, лимфоциты',
      ].filter(Boolean),
      caveats: [
        '4C разработан до вакцинации и Omicron — реальная смертность ниже в 2023+',
        'У вакцинированных и иммунокомпетентных завышает риск',
        'Не учитывает длительность симптомов (окно ремдесивира < 7 дн)',
        'WHO OS — ретроспективная шкала прогрессии, не прогностическая',
      ],
      scale: {
        segments: [
          { min: 0, max: 3, label: 'Низкий', color: '#22C55E' },
          { min: 3, max: 8, label: 'Промеж.', color: '#F59E0B' },
          { min: 8, max: 14, label: 'Высокий', color: '#F97316' },
          { min: 14, max: 21, label: 'Оч. высокий', color: '#EF4444' },
        ],
        current: Math.min(pts, 21),
        unit: 'балл',
      },
      relatedCourses: [
        { id: '305.1', title: 'Инфекции' },
        { id: '300.4', title: 'Неотложная помощь' },
      ],
      related: [
        { id: 'curb65', title: 'CURB-65' },
        { id: 'news2', title: 'NEWS2' },
        { id: 'pf-ratio', title: 'P/F ratio' },
      ],
    };
  },
  reference: 'Knight SR et al. BMJ 2020;370:m3339 (ISARIC 4C Mortality Score). WHO Clinical Progression Scale (Lancet ID 2020).',
  countries: 'Международный (ISARIC/WHO)',
  presets: [
    { label: 'Лёгкий (50 лет, SpO₂ 97 %)', values: { age: 50, sex: 'f', comorb: '0', rr: 18, spo2: 97, gcs: false, urea: 5, crp: 20 } },
    { label: 'Средний (70 лет, SpO₂ 93 %)', values: { age: 70, sex: 'm', comorb: '1', rr: 24, spo2: 93, gcs: false, urea: 8, crp: 80 } },
    { label: 'Тяжёлый (82 года, SpO₂ 86 %)', values: { age: 82, sex: 'm', comorb: '2', rr: 32, spo2: 86, gcs: true, urea: 16, crp: 180 } },
  ],
  info: `### Для чего используется
**ISARIC 4C Mortality Score** — внутрибольничная смертность при COVID-19, валидирован на 35 463 пациентах UK (Knight 2020). Переменные: возраст, пол, сопутствующие, ЧДД, SpO₂, GCS, мочевина, СРБ.

### Интерпретация (0–21 балл)
| Баллы | Смертность | Риск |
|---|---|---|
| 0–3 | 1,2 % | Низкий |
| 4–8 | 9,9 % | Промежуточный |
| 9–14 | 31,4 % | Высокий |
| ≥ 15 | 61,5 % | Очень высокий |

### WHO Clinical Progression Scale (0–10)
| Балл | Состояние |
|---|---|
| 0 | Невосприимчив (нет инфекции) |
| 1–2 | Амбулаторно, без ограничений / с ограничениями |
| 3 | Госпит., без O₂ |
| 4 | Госпит., O₂ маской |
| 5 | Госпит., O₂ HFNC/НИВЛ |
| 6 | Интубация + ИВЛ |
| 7–9 | ИВЛ + вазопрессоры / ЭКМО / полиорганная |
| 10 | Смерть |

### Терапия (NIH / WHO living guidelines)
| Тяжесть | Рекомендация |
|---|---|
| Лёгкая (без O₂) | Нирматрелвир/ритонавир при ≥ 1 ФР, < 5 дн симптомов |
| Средняя (на O₂) | Дексаметазон + ремдесивир |
| Тяжёлая (HFNC/НИВЛ) | + Тоцилизумаб или барицитиниб |
| Критическая (ИВЛ) | Дексаметазон + барицитиниб; ЭКМО при рефрактерной гипоксемии |

### Ограничения
- Разработан до вакцинации / Omicron — завышает риск в 2023+
- Не учитывает окно противовирусной терапии (< 5–7 дн)
- У иммунокомпрометированных течение атипичное`,
};

export default runner;
