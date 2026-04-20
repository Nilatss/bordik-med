// @ts-nocheck
/** Runner: fibrotest — FibroTest / ActiTest (BioPredictive) */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'a2m', label: 'α2-макроглобулин', type: 'number', unit: 'г/л', min: 0.5, max: 6, step: 0.01, quickValues: [1.5, 2.0, 2.5, 3.5] },
    { id: 'hapto', label: 'Гаптоглобин', type: 'number', unit: 'г/л', min: 0, max: 5, step: 0.01, quickValues: [0.5, 1.0, 1.5, 2.0] },
    { id: 'apoa1', label: 'Аполипопротеин A1', type: 'number', unit: 'г/л', min: 0.5, max: 3, step: 0.01, quickValues: [1.0, 1.3, 1.6] },
    { id: 'bili', label: 'Билирубин общий', type: 'number', unit: 'мкмоль/л', min: 3, max: 500, quickValues: [10, 20, 50, 150] },
    { id: 'ggt', label: 'ГГТ', type: 'number', unit: 'Ед/л', min: 5, max: 2000, quickValues: [30, 80, 200, 500] },
    { id: 'alt', label: 'АЛТ', type: 'number', unit: 'Ед/л', min: 5, max: 2000, quickValues: [25, 60, 120] },
    { id: 'age', label: 'Возраст', type: 'number', unit: 'лет', min: 18, max: 100, quickValues: [30, 50, 65] },
    { id: 'sex', label: 'Пол', type: 'select', options: [
      { value: 'm', label: 'Мужской' },
      { value: 'f', label: 'Женский' },
    ] },
  ],
  compute: (v) => {
    // Simplified surrogate of the proprietary BioPredictive model — educational only.
    // Real FibroTest requires a licensed algorithm from BioPredictive / FibroSURE.
    const a2m = Number(v.a2m) || 0;
    const hapto = Math.max(0.01, Number(v.hapto) || 0.01);
    const apoa1 = Math.max(0.01, Number(v.apoa1) || 0.01);
    const bili = Number(v.bili) || 0;
    const ggt = Number(v.ggt) || 0;
    const alt = Number(v.alt) || 1;
    const age = Number(v.age) || 40;
    const sex = v.sex === 'm' ? 1 : 0;

    // Educational approximation, 0..1
    let ft =
      0.18 * Math.log(a2m + 0.5)
      + 0.12 * Math.log(bili / 17.1 + 0.5)
      + 0.10 * Math.log(ggt + 1)
      - 0.15 * Math.log(hapto + 0.2)
      - 0.18 * Math.log(apoa1 + 0.2)
      + 0.006 * age
      + 0.05 * sex
      - 0.35;
    ft = Math.max(0, Math.min(1, ft));

    let stage = 'F0', activity = 'A0';
    if (ft >= 0.75) stage = 'F4';
    else if (ft >= 0.59) stage = 'F3';
    else if (ft >= 0.49) stage = 'F2';
    else if (ft >= 0.32) stage = 'F1';
    else if (ft >= 0.22) stage = 'F0–F1';

    // ActiTest approximation from ALT
    const at = Math.max(0, Math.min(1, Math.log10(alt + 1) / 3));
    if (at >= 0.63) activity = 'A3';
    else if (at >= 0.53) activity = 'A2';
    else if (at >= 0.37) activity = 'A1';

    let color = '#22C55E';
    if (stage === 'F4') color = '#EF4444';
    else if (stage === 'F3') color = '#F97316';
    else if (stage === 'F2') color = '#F59E0B';

    return {
      value: ft.toFixed(2),
      unit: `${stage} / ${activity}`,
      interpretation: `Фиброз ${stage}, активность ${activity}`,
      color,
      details: `**FibroTest** оценивает фиброз (F0–F4 METAVIR) по 5 биомаркерам + возраст + пол. **ActiTest** — активность (A0–A3) по АЛТ + те же маркеры.
Значение нормализуется на 0–1; cut-off: 0,22 (F0), 0,49 (F2), 0,59 (F3), 0,75 (F4).`,
      actions: [
        stage === 'F3' || stage === 'F4' ? 'Гепатолог + эластометрия для подтверждения' : null,
        stage === 'F4' ? 'Скрининг ГЦК (УЗИ + АФП q6 мес) + ЭГДС на варикозы' : null,
        activity === 'A2' || activity === 'A3' ? 'Высокая воспалительная активность — оценить этиологию и начать терапию' : null,
        'Исключить острый гепатит, гемолиз (↓гаптоглобин), синдром Жильбера (билирубин), цистит (α2-МГ)',
        'Для окончательного заключения использовать **лицензированный тест FibroTest/FibroSURE** (BioPredictive)',
      ].filter(Boolean),
      caveats: [
        'ВНИМАНИЕ: это ОБРАЗОВАТЕЛЬНАЯ аппроксимация, НЕ лицензированный тест. BioPredictive-алгоритм запатентован',
        'Клинически использовать только сертифицированный FibroTest / FibroSURE от лицензированной лаборатории',
        'Ложно-высокие: синдром Жильбера, внепечёночный холестаз, гемолиз (↓гаптоглобин)',
        'Ложно-низкие: острое воспаление (↑гаптоглобин как APP), алкоголь + активное питьё',
        'Биопсия или фиброэластография — подтверждающие исследования',
      ],
      scale: {
        segments: [
          { min: 0, max: 0.32, label: 'F0–F1', color: '#22C55E' },
          { min: 0.32, max: 0.59, label: 'F2', color: '#F59E0B' },
          { min: 0.59, max: 0.75, label: 'F3', color: '#F97316' },
          { min: 0.75, max: 1.0, label: 'F4', color: '#EF4444' },
        ],
        current: Number(ft.toFixed(2)),
        unit: 'FT',
      },
      relatedCourses: [
        { id: '301.3', title: 'Гепатология' },
        { id: '304.1', title: 'Лаб. диагностика' },
      ],
      related: [
        { id: 'fib4-lab', title: 'FIB-4' },
        { id: 'nafld-fs', title: 'NAFLD FS' },
        { id: 'apri-hep', title: 'APRI' },
      ],
    };
  },
  reference: 'Imbert-Bismut F et al. Lancet 2001;357:1069. Poynard T. Clin Biochem 2010;43:1315. BioPredictive SAS.',
  countries: 'Международный (лицензирован BioPredictive, Франция)',
  presets: [
    { label: 'F0 норма', values: { a2m: 1.5, hapto: 1.5, apoa1: 1.5, bili: 10, ggt: 25, alt: 25, age: 30, sex: 'f' } },
    { label: 'F2', values: { a2m: 2.5, hapto: 0.8, apoa1: 1.1, bili: 20, ggt: 80, alt: 80, age: 50, sex: 'm' } },
    { label: 'F4 цирроз', values: { a2m: 4.0, hapto: 0.3, apoa1: 0.8, bili: 60, ggt: 300, alt: 120, age: 65, sex: 'm' } },
  ],
  info: `### Для чего используется
**FibroTest** (за пределами США — **FibroSURE**) — лицензированный запатентованный биохимический индекс фиброза печени (F0–F4 METAVIR). Совместно с **ActiTest** (активность A0–A3) — первая линия неинвазивной оценки при HCV, HBV, MASLD, алкогольной ХБП.

### Состав (6 биомаркеров)
| Маркер | Значение |
|---|---|
| α2-макроглобулин | Острофазный; ↑ при фиброзе |
| Гаптоглобин | ↓ при гемолизе и фиброзе |
| Аполипопротеин A1 | ↓ при прогрессии фиброза |
| Билирубин общий | ↑ при цирротической дисфункции |
| ГГТ | ↑ при холестазе / алкоголе |
| АЛТ (только ActiTest) | Отражает активность |
+ **возраст + пол** корректируют.

### Интерпретация (METAVIR)
| FT (0–1) | F-стадия |
|---|---|
| 0,00–0,21 | F0 |
| 0,22–0,31 | F0–F1 |
| 0,32–0,48 | F1–F2 |
| 0,49–0,58 | F2 |
| 0,59–0,74 | F3 |
| 0,75–1,00 | F4 (цирроз) |

### Показания
- Хр. гепатит C (первая линия в Франции с 2006 г.)
- Хр. гепатит B
- MASLD / NAFLD
- Алкогольная ХБП
- ВИЧ / HCV коинфекция

### Преимущества
- Неинвазивный
- Работает при коагулопатии и асците
- Повторяем каждые 6–12 мес
- Валидирован в > 100 клинических исследований

### Ограничения / ложные результаты
| Ситуация | Эффект |
|---|---|
| Синдром Жильбера | Ложно-высокий (↑билирубин) |
| Гемолиз | Ложно-высокий (↓гаптоглобин) |
| Острая инфекция | Ложно-низкий (↑гаптоглобин как APP) |
| Экстрагепатический холестаз | Ложно-высокий |

### Правовое
**FibroTest / FibroSURE — лицензированный продукт BioPredictive SAS (Франция).** Алгоритм запатентован и требует сертифицированной лаборатории для клинического применения. Этот инструмент — образовательная аппроксимация.`,
};

export default runner;
