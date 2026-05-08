/** Runner: rosacea — Rosacea phenotypic classification */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'erythema', label: 'Стойкая центрофациальная эритема (0-3)', type: 'number', min: 0, max: 3, step: 1 },
    { id: 'pp', label: 'Папулы/пустулы (0-3)', type: 'number', min: 0, max: 3, step: 1 },
    { id: 'phyma', label: 'Фиматозные изменения (0-3)', type: 'number', min: 0, max: 3, step: 1 },
    { id: 'telang', label: 'Телеангиэктазии (0-3)', type: 'number', min: 0, max: 3, step: 1 },
    { id: 'ocular', label: 'Окулярные проявления (0-3)', type: 'number', min: 0, max: 3, step: 1 },
    { id: 'flush', label: 'Эпизоды flushing (0-3)', type: 'number', min: 0, max: 3, step: 1 },
  ],
  compute: (v) => {
    const e = Number(v.erythema || 0);
    const pp = Number(v.pp || 0);
    const ph = Number(v.phyma || 0);
    const t = Number(v.telang || 0);
    const o = Number(v.ocular || 0);
    const f = Number(v.flush || 0);
    const total = e + pp + ph + t + o + f;
    const phenotypes: string[] = [];
    if (e >= 2 || t >= 2) phenotypes.push('Эритематотелеангиэктатический (ETR)');
    if (pp >= 2) phenotypes.push('Папулопустулёзный (PPR)');
    if (ph >= 1) phenotypes.push('Фиматозный');
    if (o >= 1) phenotypes.push('Окулярный');
    let color = '#22C55E', interp = 'Лёгкое течение';
    if (total >= 12) { color = '#EF4444'; interp = 'Тяжёлое течение'; }
    else if (total >= 6) { color = '#F59E0B'; interp = 'Среднетяжёлое'; }
    return {
      value: String(total),
      unit: '/18',
      interpretation: `${interp}. Фенотипы: ${phenotypes.join(', ') || 'нет доминирующих'}.`,
      color,
      details: `Классификация 2017 г. (ROSCO global panel) по фенотипам. Диагностические критерии: стойкая центрофациальная эритема или фиматозные изменения. Major (≥ 2 из них = диагноз): flushing, папулы/пустулы, телеангиэктазии, окулярные.`,
      actions: [
        'Фотопротекция SPF 30+, мягкое очищение, избегание триггеров (алкоголь, острое, жара)',
        e >= 2 || f >= 2 ? 'Эритема / flushing — бримонидин 0,33 % гель местно, окси­метазолин 1 %' : '',
        pp >= 1 ? 'Папулы/пустулы — метронидазол 0,75 % / ивермектин 1 % крем; доксициклин 40 мг/сут modified-release' : '',
        t >= 2 ? 'Телеангиэктазии — IPL или pulsed dye laser (PDL 595 нм)' : '',
        ph >= 2 ? 'Фима — изотретиноин 0,3-0,5 мг/кг/сут, хирургия / CO2-лазер / электрокоагуляция' : '',
        o >= 1 ? 'Окулярные — теплые компрессы, искусственная слеза, доксициклин п/о, консультация офтальмолога' : '',
      ].filter(Boolean),
      caveats: [
        'Классификация ROSCO 2017 — фенотипическая (а не по подтипам I-IV)',
        'У одного пациента часто несколько фенотипов одновременно',
        'Демодекоз коррелирует с PPR — ивермектин показан патогенетически',
        'Окулярная розацеа часто недооценивается — спрашивайте про сухость, жжение, блефарит',
      ],
      scale: {
        segments: [
          { min: 0, max: 6, label: 'Лёгкая', color: '#22C55E' },
          { min: 6, max: 12, label: 'Средняя', color: '#F59E0B' },
          { min: 12, max: 19, label: 'Тяжёлая', color: '#EF4444' },
        ],
        current: total,
        unit: 'Rosacea score',
      },
      related: [{ id: 'pasi', title: 'PASI' }, { id: 'dlqi', title: 'DLQI' }],
      relatedCourses: [{ id: '317.1', title: 'Дерматология' }],
    };
  },
  reference: 'Gallo RL et al. Standard classification and pathophysiology of rosacea: the 2017 update by the National Rosacea Society Expert Committee. J Am Acad Dermatol 2018;78:148-155.',
  countries: 'Международный (ROSCO)',
  presets: [
    { label: 'ETR лёгкий', values: { erythema:2, pp:0, phyma:0, telang:2, ocular:0, flush:1 } },
    { label: 'PPR средний', values: { erythema:2, pp:3, phyma:0, telang:1, ocular:1, flush:1 } },
    { label: 'Фиматозный', values: { erythema:2, pp:1, phyma:3, telang:2, ocular:1, flush:1 } },
  ],
  info: `### Для чего используется
**Rosacea phenotypic classification (ROSCO 2017)** — современная фенотипическая классификация розацеа вместо устаревших подтипов I-IV.

### Диагностические критерии (≥ 1)
- Стойкая центрофациальная эритема с периодическим усилением
- Фиматозные изменения

### Major (≥ 2 = диагноз без обязательных)
- Flushing (приливы)
- Папулы и пустулы
- Телеангиэктазии
- Окулярные проявления (блефарит, кератит)

### Интерпретация
| Сумма (0-18) | Тяжесть |
|---|---|
| 0-5 | Лёгкая |
| 6-11 | Средняя |
| ≥ 12 | Тяжёлая |

### Источник
Gallo RL et al. JAAD 2018.`,
};

export default runner;
