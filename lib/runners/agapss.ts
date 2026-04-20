// @ts-nocheck
/** Runner: agapss — Adjusted Global Antiphospholipid Syndrome Score (aGAPSS) */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'acl', label: 'aCL IgG/IgM (антикардиолипин) средне/выс. титр', type: 'checkbox' },
    { id: 'b2gp', label: 'Анти-β2GP-I IgG/IgM', type: 'checkbox' },
    { id: 'lac', label: 'Волчаночный антикоагулянт (LAC)', type: 'checkbox' },
    { id: 'htn', label: 'Артериальная гипертензия', type: 'checkbox' },
    { id: 'lipids', label: 'Гиперлипидемия', type: 'checkbox' },
  ],
  compute: (v) => {
    let score = 0;
    if (v.acl) score += 5;
    if (v.b2gp) score += 4;
    if (v.lac) score += 4;
    if (v.htn) score += 1;
    if (v.lipids) score += 3;

    let risk = 'Низкий';
    let color = '#22C55E';
    let annual = '~ 2-3 %';
    if (score >= 11) { risk = 'Высокий'; color = '#EF4444'; annual = '~ 10-15 %'; }
    else if (score >= 7) { risk = 'Промежут.'; color = '#F59E0B'; annual = '~ 5-8 %'; }

    const actions = [];
    if (score >= 11) {
      actions.push('Антикоагуляция: варфарин INR 2-3 (при артериальном тромбозе — INR 3-4)');
      actions.push('DOAC НЕ рекомендованы при triple-positive (TRAPS trial)');
      actions.push('Гидроксихлорохин 200-400 мг/сут (дополнение)');
      actions.push('Контроль АД < 130/80, статины, отказ от курения');
      actions.push('При беременности — НМГ + низкодозная АСК');
    } else if (score >= 7) {
      actions.push('Первичная профилактика: низкодозная АСК 75-100 мг/сут');
      actions.push('Гидроксихлорохин при СКВ');
      actions.push('Агрессивная коррекция сердечно-сосудистых факторов');
    } else {
      actions.push('Мониторинг; коррекция модиф. факторов');
      actions.push('АСК индивидуально при доп. факторах риска');
    }

    return {
      value: `${score} балл${score === 1 ? '' : score < 5 ? 'а' : 'ов'}`,
      unit: 'aGAPSS',
      interpretation: `${risk} риск тромбоза/рецидива APS (ежегодно ${annual})`,
      color,
      details: `**aGAPSS (Sciascia 2013)** — интегральная оценка риска тромбоза/рецидива АФС.

Баллы: aCL IgG/IgM = 5; анти-β2GPI = 4; LAC = 4; гиперлипидемия = 3; АГ = 1. Максимум 17.

**Пороговые значения:**
- ≥ 11: высокий риск (10-15 %/год)
- 7-10: промежуточный
- < 7: низкий`,
      actions,
      caveats: [
        'aGAPSS валидизирован для пациентов с установленным АФС (Sydney criteria 2006)',
        'Triple-positive (aCL + β2GPI + LAC) — наибольший риск; DOAC противопоказаны (TRAPS 2018)',
        'LAC — самый сильный предиктор тромбоза среди трёх антител',
        'Беременность: низкодозная АСК + НМГ; Triple+ — повышенные дозы',
        'Гидроксихлорохин снижает риск тромбоза (доп. к АК)',
        'Катастрофический АФС (CAPS) — отдельная неотложная нозология (плазмообмен + АК + ГКС)',
      ],
      scale: {
        segments: [
          { min: 0, max: 7, label: 'Низкий', color: '#22C55E' },
          { min: 7, max: 11, label: 'Промежут.', color: '#F59E0B' },
          { min: 11, max: 17, label: 'Высокий', color: '#EF4444' },
        ],
        current: Math.min(score, 17),
        unit: 'балл',
      },
      relatedCourses: [
        { id: '303.2', title: 'Гематология' },
        { id: '304.1', title: 'Лаб. диагностика' },
        { id: '301.3', title: 'Ревматология' },
      ],
      related: [
        { id: '4t', title: '4T (HIT)' },
        { id: 'dic', title: 'ISTH DIC' },
      ],
    };
  },
  reference: 'Sciascia S et al. Rheumatology 2013;52:1397-403. TRAPS trial: Pengo V et al. Blood 2018;132:1365.',
  countries: 'Международный',
  presets: [
    { label: 'Низкий риск', values: { acl: false, b2gp: false, lac: true, htn: false, lipids: false } },
    { label: 'Промежут.', values: { acl: true, b2gp: false, lac: false, htn: false, lipids: false } },
    { label: 'Высокий (triple+)', values: { acl: true, b2gp: true, lac: true, htn: true, lipids: true } },
  ],
  info: `### Для чего используется
**aGAPSS (adjusted Global Antiphospholipid Syndrome Score, Sciascia 2013)** — количественная оценка риска первичного/рецидивного тромбоза у пациентов с АФС или положительными антифосфолипидными антителами.

### Компоненты
| Параметр | Баллы |
|---|---|
| aCL IgG/IgM средне/выс. титр | 5 |
| Анти-β2GPI IgG/IgM | 4 |
| Волчаночный антикоагулянт (LAC) | 4 |
| Гиперлипидемия | 3 |
| Артериальная гипертензия | 1 |

### Интерпретация
| Балл | Риск | Ежегодный риск тромбоза |
|---|---|---|
| < 7 | Низкий | 2-3 % |
| 7-10 | Промежуточный | 5-8 % |
| ≥ 11 | Высокий | 10-15 % |

### Тактика
- **Первичная профилактика** (антитела без тромбоза): АСК низкодозная при aGAPSS ≥ 7; гидроксихлорохин при СКВ
- **Вторичная профилактика** (после тромбоза): варфарин INR 2-3 (венозный) / 3-4 (артериальный, спорно — WARFASA)
- **DOAC НЕ** применять при triple-positive (TRAPS trial 2018 — остановлен досрочно из-за роста артер. тромбозов на ривароксабане)
- **Беременность**: АСК + НМГ (профилактическая доза); высокий риск → терапевтическая НМГ

### Triple-positive
LAC + aCL + β2GPI одновременно — наивысший риск тромбоза и акушерских потерь. Требует пожизненной антикоагуляции варфарином.

### Ограничения
- Не учитывает анти-PS/PT, анти-аннексин V (некритериальные антитела)
- Требует подтверждённых > 12 нед положительных антител (Sydney criteria)
- Не для катастрофического АФС (CAPS) — отдельная нозология
- Не заменяет индивидуальную клиническую оценку`,
};

export default runner;
