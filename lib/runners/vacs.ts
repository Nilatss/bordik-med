// @ts-nocheck
/** Runner: vacs — Veterans Aging Cohort Study index (HIV) */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'age', label: 'Возраст', type: 'number', unit: 'лет', min: 18, max: 100, quickValues: [35, 45, 55, 65, 75] },
    { id: 'cd4', label: 'CD4', type: 'number', unit: 'кл/мкл', min: 0, max: 2000, quickValues: [50, 150, 300, 500, 800] },
    {
      id: 'vl',
      label: 'ВН ВИЧ (HIV-RNA)',
      type: 'select',
      options: [
        { value: '0', label: '< 500 копий/мл' },
        { value: '1', label: '500–99 999' },
        { value: '2', label: '≥ 100 000' },
      ],
    },
    { id: 'hb', label: 'Гемоглобин', type: 'number', unit: 'г/дл', min: 4, max: 20, step: 0.1, quickValues: [9, 11, 12, 13, 14] },
    { id: 'fib4', label: 'FIB-4', type: 'number', unit: '', min: 0, max: 20, step: 0.1, quickValues: [0.5, 1.3, 2.0, 3.25, 5.0] },
    { id: 'egfr', label: 'eGFR', type: 'number', unit: 'мл/мин/1,73м²', min: 5, max: 150, quickValues: [30, 45, 60, 90, 110] },
    { id: 'hcv', label: 'HCV-Ab +', type: 'checkbox' },
  ],
  compute: (v) => {
    const age = Number(v.age) || 0;
    const cd4 = Number(v.cd4) || 0;
    const vl = Number(v.vl) || 0;
    const hb = Number(v.hb) || 0;
    const fib4 = Number(v.fib4) || 0;
    const egfr = Number(v.egfr) || 0;
    const hcv = Boolean(v.hcv);

    let pts = 0;
    // Age
    if (age >= 65) pts += 27;
    else if (age >= 55) pts += 18;
    else if (age >= 50) pts += 12;
    // CD4
    if (cd4 < 50) pts += 29;
    else if (cd4 < 100) pts += 23;
    else if (cd4 < 200) pts += 17;
    else if (cd4 < 350) pts += 11;
    else if (cd4 < 500) pts += 5;
    // HIV-RNA
    if (vl === 2) pts += 7;
    else if (vl === 1) pts += 2;
    // Hb
    if (hb < 10) pts += 38;
    else if (hb < 12) pts += 22;
    else if (hb < 14) pts += 10;
    // FIB-4
    if (fib4 > 3.25) pts += 25;
    else if (fib4 >= 1.45) pts += 10;
    // eGFR
    if (egfr < 30) pts += 26;
    else if (egfr < 45) pts += 13;
    else if (egfr < 60) pts += 7;
    // HCV
    if (hcv) pts += 5;

    // Approximate 5-yr mortality
    let mortality = 5;
    let color = '#22C55E';
    let risk = 'Низкий';
    if (pts < 25) { mortality = 2; risk = 'Низкий'; color = '#22C55E'; }
    else if (pts < 50) { mortality = 8; risk = 'Умеренный'; color = '#84CC16'; }
    else if (pts < 75) { mortality = 18; risk = 'Повышенный'; color = '#F59E0B'; }
    else if (pts < 100) { mortality = 35; risk = 'Высокий'; color = '#F97316'; }
    else { mortality = 55; risk = 'Очень высокий'; color = '#EF4444'; }

    return {
      value: `${pts} б.`,
      unit: 'VACS',
      interpretation: `~${mortality} % 5-летняя смертность (${risk} риск)`,
      color,
      details: `VACS Index (Justice 2013) — первая шкала общей смертности для людей, живущих с ВИЧ на ART. Комбинирует возраст, ВИЧ-показатели (CD4, ВН) и не-ВИЧ биомаркёры (Hb, печень, почки, HCV). Валидирован в > 30 когортах.`,
      actions: [
        'Оптимизация ART — вирусная супрессия (ВН < 50 копий/мл)',
        fib4 > 3.25 ? 'Гепатолог: фиброэластография, HCV/HBV DAA-терапия' : null,
        egfr < 60 ? 'Нефрология: избегать TDF, переход на TAF/ABC; АПФ-и/АРБ при протеинурии' : null,
        hb < 12 ? 'Исследовать анемию: железо, B12, фолат, ретикулоциты, Kubn-тест' : null,
        hcv ? 'DAA-терапия HCV (софосбувир/велпатасвир × 12 нед)' : null,
        'Оптимизация не-ВИЧ ФР: артериальное давление, липиды, диабет, отказ от курения',
        'Онко-скрининг (рак печени при цирроз, лимфомы, анальный рак у МСМ)',
      ].filter(Boolean),
      caveats: [
        'Валидирован в когортах на ART — не для ART-наивных',
        'VACS 2.0 добавляет альбумин, WBC, BMI — улучшенная точность',
        'Не заменяет оценку отдельных органов (сердце, мозг)',
        '5-летняя смертность — оценка, реальный риск зависит от индивидуальных факторов',
      ],
      scale: {
        segments: [
          { min: 0, max: 25, label: 'Низкий', color: '#22C55E' },
          { min: 25, max: 50, label: 'Умеренный', color: '#84CC16' },
          { min: 50, max: 75, label: 'Повышенный', color: '#F59E0B' },
          { min: 75, max: 100, label: 'Высокий', color: '#F97316' },
          { min: 100, max: 164, label: 'Оч. высокий', color: '#EF4444' },
        ],
        current: Math.min(pts, 164),
        unit: 'балл',
      },
      relatedCourses: [
        { id: '305.1', title: 'Инфекции' },
        { id: '305.4', title: 'ВИЧ / ART' },
      ],
      related: [
        { id: 'hiv-who', title: 'WHO HIV staging' },
        { id: 'apri-hep', title: 'APRI / FIB-4' },
      ],
    };
  },
  reference: 'Justice AC et al. AIDS 2013;27:563 (VACS Index). Tate JP et al. AIDS 2013 (recalibrated).',
  countries: 'Международный (VA Cohort)',
  presets: [
    { label: '40 лет, CD4 600, supp.', values: { age: 40, cd4: 600, vl: '0', hb: 14, fib4: 0.8, egfr: 100, hcv: false } },
    { label: '55 лет, CD4 250, HCV+', values: { age: 55, cd4: 250, vl: '1', hb: 12, fib4: 2.5, egfr: 60, hcv: true } },
    { label: '68 лет, CD4 80, ХБП', values: { age: 68, cd4: 80, vl: '2', hb: 9, fib4: 4.0, egfr: 35, hcv: true } },
  ],
  info: `### Для чего используется
**VACS Index (Veterans Aging Cohort Study)** — прогноз 5-летней смертности у людей с ВИЧ на ART. Учитывает возраст, ВИЧ-показатели и поражение внепечёночных органов.

### Компоненты
| Переменная | Макс. баллы |
|---|---|
| Возраст | 27 |
| CD4 | 29 |
| HIV-RNA | 7 |
| Hb | 38 |
| FIB-4 (печень) | 25 |
| eGFR | 26 |
| HCV | 5 |
| Раса (в оригинале) | 5 |
| **Итого** | ~164 |

### Интерпретация (приблизительная)
| Баллы | 5-летняя смертность |
|---|---|
| < 25 | ~ 2 % |
| 25–49 | ~ 8 % |
| 50–74 | ~ 18 % |
| 75–99 | ~ 35 % |
| ≥ 100 | > 50 % |

### Клиническое применение
- Выбор интенсивности наблюдения
- Принятие решений о скрининге онкологии и кардиоваскулярных рисков
- Оценка до трансплантации
- Исследовательский инструмент

### FIB-4 формула
**FIB-4** = Возраст × АСТ / (Тромбоциты × √АЛТ)
- < 1,45 — низкий риск фиброза
- 1,45–3,25 — серая зона
- > 3,25 — высокий риск F3–F4

### Ограничения
- Только для ART-получающих
- VACS 2.0 (2018) добавляет альбумин, WBC, BMI
- Раса-компонент критиковали — в VACS 2.0 убран
- 5-летние оценки — приблизительные

### Источник
Justice AC et al. *Predictive accuracy of the Veterans Aging Cohort Study index for mortality with HIV infection: a North American cross cohort analysis.* JAIDS 2013;62(2):149-63.`,
};

export default runner;
