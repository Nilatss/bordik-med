// @ts-nocheck
/** Runner: gap-ild */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'sex', label: 'Пол (G — Gender)', type: 'select', options: [
      { value: 'f', label: 'Женский — 0 баллов' },
      { value: 'm', label: 'Мужской — 1 балл' },
    ] },
    { id: 'age', label: 'Возраст (A — Age)', type: 'select', options: [
      { value: 'le60', label: '≤ 60 лет — 0 баллов' },
      { value: '61_65', label: '61-65 лет — 1 балл' },
      { value: 'gt65', label: '> 65 лет — 2 балла' },
    ] },
    { id: 'fvc', label: 'ФЖЕЛ (% предск.)', type: 'select', options: [
      { value: 'gt75', label: '> 75 % — 0 баллов' },
      { value: '50_75', label: '50-75 % — 1 балл' },
      { value: 'lt50', label: '< 50 % — 2 балла' },
    ] },
    { id: 'dlco', label: 'DLCO (% предск.)', type: 'select', options: [
      { value: 'gt55', label: '> 55 % — 0 баллов' },
      { value: '36_55', label: '36-55 % — 1 балл' },
      { value: 'le35', label: '≤ 35 % — 2 балла' },
      { value: 'na', label: 'Невозможно — 3 балла' },
    ] },
  ],
  compute: (v) => {
    const sexPts = v.sex === 'm' ? 1 : 0;
    const agePts = v.age === 'gt65' ? 2 : v.age === '61_65' ? 1 : 0;
    const fvcPts = v.fvc === 'lt50' ? 2 : v.fvc === '50_75' ? 1 : 0;
    const dlcoPts = v.dlco === 'na' ? 3 : v.dlco === 'le35' ? 2 : v.dlco === '36_55' ? 1 : 0;
    const score = sexPts + agePts + fvcPts + dlcoPts;

    let stage = '', color = '', interp = '', surv = '';
    if (score <= 3) {
      stage = 'Стадия I';
      color = '#10B981';
      interp = 'Стадия I GAP. 1-летняя смертность ~ 6 %, 3-летняя ~ 16 %.';
      surv = '1-год: 94 %, 3-года: 84 %';
    } else if (score <= 5) {
      stage = 'Стадия II';
      color = '#F59E0B';
      interp = 'Стадия II GAP. 1-летняя смертность ~ 16 %, 3-летняя ~ 42 %.';
      surv = '1-год: 84 %, 3-года: 58 %';
    } else {
      stage = 'Стадия III';
      color = '#EF4444';
      interp = 'Стадия III GAP. 1-летняя смертность ~ 39 %, 3-летняя ~ 77 %.';
      surv = '1-год: 61 %, 3-года: 23 %';
    }

    return {
      value: stage + ' (' + score + ' баллов)',
      interpretation: interp,
      color,
      details: `Пол: ${sexPts} • Возраст: ${agePts} • ФЖЕЛ: ${fvcPts} • DLCO: ${dlcoPts}. Выживаемость: ${surv}.`,
      actions: [
        'Антифибротическая терапия: пирфенидон или нинтеданиб (независимо от стадии при ИЛФ)',
        score >= 4 ? 'Раннее направление в трансплантологический центр' : 'Обсуждение трансплантации при прогрессии',
        'Кислородотерапия при SpO₂ ≤ 88 % в покое или при нагрузке',
        'Лёгочная реабилитация, вакцинация, нутритивная поддержка',
        'Паллиативная помощь при стадии III',
      ],
      caveats: [
        'Разработан для ИЛФ (идиопатический лёгочный фиброз); применим к некоторым другим ИЗЛ',
        'Не заменяет MDD (мультидисциплинарное обсуждение)',
        'ILD-GAP — модификация с учётом типа ИЗЛ (HP, CTD-ILD)',
        'При невозможности DLCO — присваивается 3 балла',
      ],
      scale: {
        segments: [
          { min: 0, max: 3, label: 'стадия I', color: '#10B981' },
          { min: 4, max: 5, label: 'стадия II', color: '#F59E0B' },
          { min: 6, max: 8, label: 'стадия III', color: '#EF4444' },
        ],
        current: score,
        unit: 'балл.',
      },
      related: [
        { id: 'mmrc', title: 'mMRC' },
        { id: 'gold', title: 'GOLD' },
        { id: 'gli', title: 'GLI' },
      ],
      relatedCourses: [
        { id: '301.2', title: 'Пульмонология' },
      ],
    };
  },
  reference: 'Ley B et al. GAP index for IPF. Ann Intern Med 2012;156(10):684-91.',
  countries: 'Международный (ATS/ERS/JRS/ALAT)',
  presets: [
    { label: 'Стадия I (2 балла)', values: { sex: 'f', age: '61_65', fvc: 'gt75', dlco: '36_55' } },
    { label: 'Стадия II (5 баллов)', values: { sex: 'm', age: 'gt65', fvc: '50_75', dlco: '36_55' } },
    { label: 'Стадия III (7 баллов)', values: { sex: 'm', age: 'gt65', fvc: 'lt50', dlco: 'le35' } },
  ],
  info: `### Для чего используется
**GAP index (Gender-Age-Physiology)** — прогностическая шкала смертности при **идиопатическом лёгочном фиброзе (ИЛФ / IPF)** и ряде других ИЗЛ.

### Компоненты
| Параметр | Баллы |
|---|---|
| **G** — Gender (мужской) | 0-1 |
| **A** — Age (≤ 60 / 61-65 / > 65) | 0 / 1 / 2 |
| **P1** — ФЖЕЛ % предск. (> 75 / 50-75 / < 50) | 0 / 1 / 2 |
| **P2** — DLCO % предск. (> 55 / 36-55 / ≤ 35 / невозможно) | 0 / 1 / 2 / 3 |

**Сумма 0-8 баллов.**

### Стадии и выживаемость
| Баллы | Стадия | 1-год | 2-года | 3-года |
|---|---|---|---|---|
| 0-3 | I | 94 % | 89 % | 84 % |
| 4-5 | II | 84 % | 70 % | 58 % |
| 6-8 | III | 61 % | 35 % | 23 % |

### Клиническое значение
- Стратификация риска на диагнозе
- Обсуждение прогноза и целей лечения
- Решение о направлении на трансплантацию (обычно при GAP II-III)
- Выбор времени начала паллиативной помощи

### ILD-GAP (расширенная версия)
Модификация Ryerson 2014: добавляет «тип ИЗЛ» для HP (-2), CTD (-2), IPF (0), nonIPF/unclassifiable (0).

### Антифибротическая терапия
- **Пирфенидон** и **нинтеданиб** — одобрены при ИЛФ независимо от стадии
- Нинтеданиб также одобрен при прогрессирующей PF-ILD и SSc-ILD

### Ограничения
- Популяционная модель — не индивидуальное предсказание
- Не заменяет MDD для диагностики ИЗЛ
- Не учитывает темп прогрессии (важнее, чем абсолютное значение)

### Источник
Ley B et al. Ann Intern Med 2012;156(10):684-91.`,
};

export default runner;
