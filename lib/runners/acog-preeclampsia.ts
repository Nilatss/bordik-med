/** Runner: acog-preeclampsia - критерии преэклампсии (ACOG 2020, ISSHP 2018/2021) */
import type {
  CalculatorTool,
  ToolInput,
  ScoreBand,
  Preset,
  CalculatorResult,
  ResultExtras,
  ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'htn',
      label: 'АД ≥ 140/90 после 20 нед (2 измерения с интервалом ≥ 4 ч)',
      type: 'select',
      options: [
        { value: 'no', label: 'Нет' },
        { value: 'yes', label: 'Да' },
      ],
    },
    {
      id: 'severeBp',
      label: 'АД ≥ 160/110 (severe range)',
      type: 'select',
      options: [
        { value: 'no', label: 'Нет' },
        { value: 'yes', label: 'Да' },
      ],
    },
    {
      id: 'proteinuria',
      label: 'Протеинурия ≥ 300 мг/24ч или П/К ≥ 0.3',
      type: 'select',
      options: [
        { value: 'no', label: 'Нет' },
        { value: 'yes', label: 'Да' },
      ],
    },
    {
      id: 'endOrgan',
      label: 'Поражение органов-мишеней',
      type: 'select',
      options: [
        { value: 'none', label: 'Нет' },
        { value: 'plt', label: 'Тромбоциты < 100 000' },
        { value: 'cr', label: 'Креатинин > 1.1 мг/дл или 2× базового' },
        { value: 'ast', label: 'АСТ/АЛТ > 2× верх. границы' },
        { value: 'lung', label: 'Отёк лёгких' },
        { value: 'neuro', label: 'Головная боль / нарушение зрения' },
      ],
    },
  ],
  compute: (v) => {
    const htn = v.htn === 'yes';
    const severeBp = v.severeBp === 'yes';
    const proteinuria = v.proteinuria === 'yes';
    const endOrgan = v.endOrgan && v.endOrgan !== 'none';
    let dx = '';
    let color = '';
    let severe = false;
    if (!htn && !severeBp) {
      dx = 'Нет критериев преэклампсии';
      color = '#22C55E';
    } else if ((htn || severeBp) && (proteinuria || endOrgan)) {
      dx = 'Преэклампсия';
      color = '#F59E0B';
      if (severeBp || endOrgan) {
        dx = 'Преэклампсия с тяжёлыми признаками';
        color = '#DC2626';
        severe = true;
      }
    } else if (htn || severeBp) {
      dx = 'Гестационная гипертензия';
      color = '#F59E0B';
    }
    const actions = severe
      ? [
          'Госпитализация в отделение высокого риска',
          'MgSO₄ 4-6 г в/в нагрузка, затем 1-2 г/ч - профилактика эклампсии',
          'Антигипертензивная терапия: лабеталол, нифедипин, гидралазин (цель < 160/110)',
          'Родоразрешение при ≥ 34+0 нед; при < 34 - кортикостероиды + экспектация при стабильности',
          'Мониторинг: плод (КТГ), диурез, рефлексы, печёночные ферменты, тромбоциты',
        ]
      : dx.startsWith('Преэклампсия')
        ? [
            'Амбулаторное или стационарное наблюдение в зависимости от ГВ и стабильности',
            'Родоразрешение в 37+0 нед при стабильной преэклампсии без тяжёлых признаков',
            'Контроль АД, анализы (CBC, АСТ/АЛТ, креатинин, протеинурия) 1-2 раза в неделю',
            'Оценка плода: КТГ, УЗИ, допплерометрия',
          ]
        : ['Наблюдение, контроль АД, оценка факторов риска'];
    return {
      value: dx,
      unit: '',
      interpretation: dx,
      color,
      details:
        'ACOG 2020: диагноз устанавливается при новой гипертензии после 20 нед + протеинурия ИЛИ один из маркёров поражения органов-мишеней. Тяжёлые признаки определяют тактику и срок родоразрешения.',
      actions,
      caveats: [
        'MgSO₄ - для профилактики эклампсии (не лечение гипертензии)',
        'ИАПФ/АРА противопоказаны при беременности',
        'Аспирин 81-150 мг/сут с 12-16 нед у пациенток высокого риска - профилактика ПЭ',
        'HELLP - вариант тяжёлой ПЭ (см. калькулятор HELLP)',
      ],
      related: [
        { id: 'hellp', title: 'HELLP' },
        { id: 'pierce', title: 'fullPIERS' },
        { id: 'sflt', title: 'sFlt-1/PlGF' },
      ],
      relatedCourses: [
        { id: '302.2', title: 'Акушерство' },
        { id: '301.4', title: 'Кардиология' },
      ],
    };
  },
  reference:
    'ACOG Practice Bulletin 222 (2020): Gestational Hypertension and Preeclampsia. ISSHP 2018/2021 - Brown MA et al., Hypertension 2018;72:24.',
  countries: 'Международный (ACOG, ISSHP, РОАГ)',
  presets: [
    {
      label: 'Тяжёлая ПЭ',
      values: { htn: 'yes', severeBp: 'yes', proteinuria: 'yes', endOrgan: 'plt' },
    },
    {
      label: 'ПЭ без тяжёлых признаков',
      values: { htn: 'yes', severeBp: 'no', proteinuria: 'yes', endOrgan: 'none' },
    },
    {
      label: 'Гестационная АГ',
      values: { htn: 'yes', severeBp: 'no', proteinuria: 'no', endOrgan: 'none' },
    },
  ],
  caveats: [
    'Не путать с хронической гипертензией (до 20 нед)',
    'Протеинурия не обязательна для диагноза - достаточно поражения органов-мишеней',
  ],
  related: [
    { id: 'hellp', title: 'HELLP' },
    { id: 'pierce', title: 'fullPIERS' },
    { id: 'sflt', title: 'sFlt-1/PlGF' },
  ],
  relatedCourses: [
    { id: '302.2', title: 'Акушерство' },
    { id: '301.4', title: 'Кардиология' },
  ],
  info: `### Критерии диагноза (ACOG 2020)
**Гестационная гипертензия:** АД ≥ 140/90 дважды с интервалом ≥ 4 ч после 20 нед без протеинурии и поражения органов.

**Преэклампсия:** АГ + один из:
- Протеинурия ≥ 300 мг/24 ч, протеин/креатинин ≥ 0.3, или тест-полоска 2+
- Тромбоциты < 100 000
- Креатинин > 1.1 мг/дл или ×2 от базового
- АСТ/АЛТ > 2× верх. границы
- Отёк лёгких
- Головная боль de novo, нарушения зрения

### Тяжёлые признаки
- АД ≥ 160/110 (×2 с интервалом ≥ 4 ч, или однократно требующее терапии)
- Тромбоциты < 100 000
- Нарушение функции печени (АСТ/АЛТ > 2×, или постоянная боль в правом подреберье)
- Креатинин > 1.1 мг/дл или ×2 от базового
- Отёк лёгких
- Цефалгия de novo, зрительные нарушения

### Тактика
| Срок | Тактика |
|---|---|
| < 34 нед, без тяжёлых | Экспектация, контроль, кортикостероиды |
| < 34 нед, тяжёлая | Стабилизация + кортикостероиды + родоразрешение |
| 34-36+6 нед, тяжёлая | Родоразрешение |
| ≥ 37+0 нед, любая ПЭ | Родоразрешение |

### Источники
ACOG PB 222 (2020). ISSHP (Brown MA, Hypertension 2018;72:24).`,
};

export default runner;
