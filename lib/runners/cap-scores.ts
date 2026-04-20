// @ts-nocheck
/** Runner: cap-scores — PSI/PORT + ATS minor + SCAP for CAP */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'age', label: 'Возраст', type: 'number', unit: 'лет', min: 0, max: 120, quickValues: [40, 55, 65, 75, 85] },
    { id: 'sex', label: 'Пол', type: 'select', options: [
      { value: 'm', label: 'Мужской' }, { value: 'f', label: 'Женский' },
    ]},
    { id: 'nursing', label: 'Дом престарелых', type: 'checkbox' },
    { id: 'neoplasm', label: 'Онкология (активная)', type: 'checkbox' },
    { id: 'liver', label: 'Заболевание печени', type: 'checkbox' },
    { id: 'chf', label: 'ХСН', type: 'checkbox' },
    { id: 'cva', label: 'ОНМК в анамнезе', type: 'checkbox' },
    { id: 'renal', label: 'ХБП', type: 'checkbox' },
    { id: 'mental', label: 'Изменение сознания', type: 'checkbox' },
    { id: 'rr', label: 'ЧДД ≥ 30/мин', type: 'checkbox' },
    { id: 'sbp', label: 'САД < 90 мм рт.ст.', type: 'checkbox' },
    { id: 'temp', label: 'Температура < 35 или ≥ 40 °C', type: 'checkbox' },
    { id: 'pulse', label: 'ЧСС ≥ 125/мин', type: 'checkbox' },
    { id: 'bun', label: 'BUN > 30 mg/dL (мочевина > 10,7 ммоль/л)', type: 'checkbox' },
    { id: 'na', label: 'Натрий < 130 ммоль/л', type: 'checkbox' },
    { id: 'glucose', label: 'Глюкоза > 13,9 ммоль/л', type: 'checkbox' },
    { id: 'hct', label: 'Гематокрит < 30 %', type: 'checkbox' },
    { id: 'pao2', label: 'PaO₂ < 60 или SpO₂ < 90 %', type: 'checkbox' },
    { id: 'effusion', label: 'Плевральный выпот', type: 'checkbox' },
  ],
  compute: (v) => {
    const age = Number(v.age) || 0;
    const isFemale = v.sex === 'f';
    let pts = isFemale ? age - 10 : age;
    if (v.nursing) pts += 10;
    if (v.neoplasm) pts += 30;
    if (v.liver) pts += 20;
    if (v.chf) pts += 10;
    if (v.cva) pts += 10;
    if (v.renal) pts += 10;
    if (v.mental) pts += 20;
    if (v.rr) pts += 20;
    if (v.sbp) pts += 20;
    if (v.temp) pts += 15;
    if (v.pulse) pts += 10;
    if (v.bun) pts += 20;
    if (v.na) pts += 20;
    if (v.glucose) pts += 10;
    if (v.hct) pts += 10;
    if (v.pao2) pts += 10;
    if (v.effusion) pts += 10;

    let psiClass = 'II';
    let mortality = '0,6 %';
    let disposition = 'Амбулаторно';
    let color = '#22C55E';

    if (age < 50 && !v.neoplasm && !v.chf && !v.cva && !v.renal && !v.liver
        && !v.mental && !v.rr && !v.sbp && !v.temp && !v.pulse) {
      psiClass = 'I';
      mortality = '0,1 %';
      disposition = 'Амбулаторно';
      color = '#22C55E';
      pts = 0;
    } else if (pts <= 70) {
      psiClass = 'II'; mortality = '0,6 %'; disposition = 'Амбулаторно'; color = '#22C55E';
    } else if (pts <= 90) {
      psiClass = 'III'; mortality = '2,8 %'; disposition = 'Кратк. стационар или амбулаторно'; color = '#84CC16';
    } else if (pts <= 130) {
      psiClass = 'IV'; mortality = '8,2 %'; disposition = 'Стационар (палата)'; color = '#F59E0B';
    } else {
      psiClass = 'V'; mortality = '29,2 %'; disposition = 'ICU'; color = '#EF4444';
    }

    // ATS minor criteria (subset)
    let minor = 0;
    if (v.rr) minor++;
    if (v.pao2) minor++;
    if (v.effusion) minor++;
    if (v.mental) minor++;
    if (v.bun) minor++;
    if (v.sbp) minor++;
    if (v.temp) minor++;

    const icuByAts = minor >= 3;

    return {
      value: `Class ${psiClass}`,
      unit: `(${pts} б.)`,
      interpretation: `PSI/PORT: ${mortality} 30-дн смертность → ${disposition}`,
      color,
      details: `PSI классы I–V (Fine 1997). ATS minor criteria: ${minor}/7 (≥3 → ICU по IDSA/ATS 2019). PSI точнее CURB-65, но требует больше переменных.`,
      actions: [
        psiClass === 'I' || psiClass === 'II' ? 'Амоксициллин 1 г × 3, или доксициклин, или макролид (если резистентность < 25 %)' : null,
        psiClass === 'III' ? 'β-лактам + макролид или респираторный фторхинолон' : null,
        psiClass === 'IV' ? 'Стационар: β-лактам + макролид ИЛИ фторхинолон, O₂ к SpO₂ 92–96 %' : null,
        psiClass === 'V' ? 'ICU: цефтриаксон + азитромицин или фторхинолон; при MRSA — ванкомицин/линезолид; при P. aeruginosa — пиперациллин-тазобактам + фторхинолон' : null,
        icuByAts ? `ATS minor ≥ 3 (${minor}) — рассмотреть ICU независимо от класса PSI` : null,
        'Гемокультуры × 2, антигены мочи (пневмококк, легионелла) при тяжёлой',
        'Вакцинация PCV20 / PPSV23 + грипп + COVID-19 после выздоровления',
      ].filter(Boolean),
      caveats: [
        'PSI переоценивает риск у пожилых без реальной тяжести (возраст — главный вклад)',
        'Не учитывает социальные факторы (возможность приёма АБ дома)',
        'SMART-COP точнее для предсказания ИВЛ/вазопрессоров',
        'Не валидизирован для нозокомиальной и аспирационной пневмонии',
      ],
      scale: {
        segments: [
          { min: 0, max: 70, label: 'I–II', color: '#22C55E' },
          { min: 70, max: 90, label: 'III', color: '#84CC16' },
          { min: 90, max: 130, label: 'IV', color: '#F59E0B' },
          { min: 130, max: 250, label: 'V', color: '#EF4444' },
        ],
        current: Math.min(pts, 250),
        unit: 'балл',
      },
      relatedCourses: [
        { id: '305.1', title: 'Инфекции' },
        { id: '307.2', title: 'Микробиология' },
      ],
      related: [
        { id: 'curb65', title: 'CURB-65' },
        { id: 'qsofa', title: 'qSOFA' },
        { id: 'ssc', title: 'SSC Hour-1' },
      ],
    };
  },
  reference: 'Fine MJ et al. N Engl J Med 1997;336:243 (PSI/PORT). IDSA/ATS 2019 CAP guidelines.',
  countries: 'Международный (IDSA/ATS)',
  presets: [
    { label: '45 лет, без ФР (Class I)', values: { age: 45, sex: 'm' } },
    { label: '70 лет, ХСН + спутанность', values: { age: 70, sex: 'f', chf: true, mental: true } },
    { label: 'Тяжёлая ВП (Class V)', values: { age: 78, sex: 'm', neoplasm: true, rr: true, sbp: true, bun: true, pao2: true } },
  ],
  info: `### Для чего используется
**PSI/PORT (Pneumonia Severity Index, Fine 1997)** — оценка 30-дневной смертности от внебольничной пневмонии и выбор места лечения. Точнее CURB-65, но требует 20 переменных.

### Классы PSI
| Класс | Баллы | Смертность | Тактика |
|---|---|---|---|
| I | 0 (возраст <50, нет ФР) | 0,1 % | Амбулаторно |
| II | ≤ 70 | 0,6 % | Амбулаторно |
| III | 71–90 | 2,8 % | Краткосрочно стационар или амбулаторно |
| IV | 91–130 | 8,2 % | Стационар |
| V | > 130 | 29,2 % | ICU |

### ATS minor criteria (IDSA/ATS 2019) — ≥ 3 → ICU
ЧДД ≥ 30, PaO₂/FiO₂ ≤ 250, мультилобарные инфильтраты, confusion, BUN ≥ 20 mg/dL, лейкопения, тромбоцитопения, гипотермия, гипотензия требующая инфузии.

### Major criteria (≥ 1 → ICU)
- Септический шок с вазопрессорами
- Механическая вентиляция

### Ограничения
- PSI сильно зависит от возраста — переоценивает у пожилых без реальной тяжести
- Социальные факторы не учтены
- SMART-COP лучше для предсказания вентиляционной/вазопрессорной поддержки
- Не для нозокомиальной пневмонии

### Источник
Metlay JP et al. *Diagnosis and Treatment of Adults with Community-acquired Pneumonia. IDSA/ATS Guideline.* Am J Respir Crit Care Med 2019;200(7):e45-e67.`,
};

export default runner;
