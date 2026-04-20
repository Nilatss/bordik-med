// @ts-nocheck
/** Runner: posas - POSAS (Patient and Observer Scar Assessment Scale) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'pPain', label: 'Пациент: боль (1-10)', type: 'number', min: 1, max: 10, step: 1 },
    { id: 'pItch', label: 'Пациент: зуд (1-10)', type: 'number', min: 1, max: 10, step: 1 },
    { id: 'pColor', label: 'Пациент: цвет (1-10)', type: 'number', min: 1, max: 10, step: 1 },
    { id: 'pStiff', label: 'Пациент: жёсткость (1-10)', type: 'number', min: 1, max: 10, step: 1 },
    { id: 'pThick', label: 'Пациент: толщина (1-10)', type: 'number', min: 1, max: 10, step: 1 },
    { id: 'pIrreg', label: 'Пациент: неровность (1-10)', type: 'number', min: 1, max: 10, step: 1 },
    { id: 'pOverall', label: 'Пациент: общая оценка (1-10)', type: 'number', min: 1, max: 10, step: 1 },
    { id: 'oVasc', label: 'Врач: васкуляризация (1-10)', type: 'number', min: 1, max: 10, step: 1 },
    { id: 'oPigm', label: 'Врач: пигментация (1-10)', type: 'number', min: 1, max: 10, step: 1 },
    { id: 'oThick', label: 'Врач: толщина (1-10)', type: 'number', min: 1, max: 10, step: 1 },
    { id: 'oRelief', label: 'Врач: рельеф (1-10)', type: 'number', min: 1, max: 10, step: 1 },
    { id: 'oPliab', label: 'Врач: пластичность (1-10)', type: 'number', min: 1, max: 10, step: 1 },
    { id: 'oArea', label: 'Врач: площадь (1-10)', type: 'number', min: 1, max: 10, step: 1 },
    { id: 'oOverall', label: 'Врач: общая оценка (1-10)', type: 'number', min: 1, max: 10, step: 1 },
  ],
  compute: (v) => {
    const pat = ['pPain','pItch','pColor','pStiff','pThick','pIrreg','pOverall']
      .reduce((s, k) => s + Number(v[k] || 1), 0);
    const obs = ['oVasc','oPigm','oThick','oRelief','oPliab','oArea','oOverall']
      .reduce((s, k) => s + Number(v[k] || 1), 0);
    const total = pat + obs;

    let color = '#22C55E', band = 'Хороший рубец';
    if (total >= 105) { color = '#EF4444'; band = 'Очень плохой рубец'; }
    else if (total >= 70) { color = '#F59E0B'; band = 'Среднетяжёлый'; }
    else if (total >= 35) { color = '#84CC16'; band = 'Лёгкие изменения'; }

    return {
      value: `${pat} / ${obs}`,
      unit: `(total ${total}/140)`,
      interpretation: band,
      color,
      details: `POSAS v2.0: пациент 7×1-10 = ${pat}/70, наблюдатель 7×1-10 = ${obs}/70.`,
      actions: [
        total < 35 ? 'Стандартный уход: эмоленты, фотопротекция SPF 50+ × 12 мес, силиконовые листы/гель 12-24 ч/сут на 2-3 мес' : '',
        total >= 35 && total < 70 ? 'Силиконовая терапия + компрессия 20-30 мм Hg (для хирургических/ожоговых рубцов)' : '',
        total >= 70 ? 'Интралезионно триамцинолон 10-40 мг/мл ± 5-ФУ каждые 4-6 нед (гипертрофические/келоидные)' : '',
        total >= 70 ? 'Лазерная терапия: pulsed dye (PDL) для эритемы, fractional CO2 / Er:YAG для рельефа' : '',
        total >= 105 ? 'Хирургическая ревизия + адъювантная лучевая терапия (келоиды)' : '',
        'Для педиатрических / ожоговых рубцов — ранняя компрессия и силикон в течение первых 2-6 мес',
        'Массаж рубца 5-10 мин 2-3×/день после заживления (6+ нед)',
      ].filter(Boolean),
      caveats: [
        'POSAS v2.0 (2004) — самый валидированный инструмент оценки рубца',
        'POSAS v3.0 (2022) — обновлённая, учитывает 3D-характеристики',
        'Минимальный балл = 7 (идеальная кожа), не 0',
        'Альтернатива — VSS (Vancouver Scar Scale 0-13), проще, но без мнения пациента',
        'Самооценка пациента коррелирует с качеством жизни (DLQI)',
        'Рубцы созревают до 1-2 лет — финальная оценка минимум через 12 мес',
      ],
      scale: {
        segments: [
          { min: 14, max: 35, label: 'Хороший', color: '#22C55E' },
          { min: 35, max: 70, label: 'Лёгкий', color: '#84CC16' },
          { min: 70, max: 105, label: 'Средний', color: '#F59E0B' },
          { min: 105, max: 140, label: 'Очень плохой', color: '#EF4444' },
        ],
        current: total,
        unit: 'POSAS',
      },
      related: [{ id: 'breslow', title: 'Breslow' }, { id: 'scorad', title: 'SCORAD' }],
      relatedCourses: [{ id: '317.1', title: 'Дерматология' }],
    };
  },
  reference: 'Draaijers LJ, Tempelman FR, Botman YA, et al. The Patient and Observer Scar Assessment Scale: a reliable and feasible tool for scar evaluation. Plast Reconstr Surg 2004;113:1960-1965.',
  countries: 'Международный (ISBI / EBA)',
  presets: [
    { label: 'Хороший рубец', values: { pPain:1,pItch:1,pColor:2,pStiff:2,pThick:2,pIrreg:2,pOverall:2, oVasc:2,oPigm:2,oThick:2,oRelief:2,oPliab:2,oArea:2,oOverall:2 } },
    { label: 'Гипертрофический', values: { pPain:4,pItch:6,pColor:6,pStiff:6,pThick:7,pIrreg:5,pOverall:6, oVasc:6,oPigm:5,oThick:7,oRelief:6,oPliab:6,oArea:5,oOverall:6 } },
    { label: 'Келоид тяжёлый', values: { pPain:8,pItch:9,pColor:9,pStiff:9,pThick:10,pIrreg:9,pOverall:9, oVasc:9,oPigm:8,oThick:10,oRelief:9,oPliab:9,oArea:8,oOverall:9 } },
  ],
  info: `### Для чего используется
**POSAS v2.0 (Patient and Observer Scar Assessment Scale)** — оценка качества рубца с двух сторон: пациент и наблюдатель. Валидирована для ожоговых, хирургических, травматических рубцов.

### Структура
Оба опросника по 7 параметров × 1-10 = 7-70 баллов каждый. Итого 14-140.

### Patient Scale (PSAS)
Боль, зуд, цвет, жёсткость, толщина, неровность, общее впечатление.

### Observer Scale (OSAS)
Васкуляризация, пигментация, толщина, рельеф, пластичность, площадь, общее впечатление.

### Интерпретация (условная)
| Total | Тяжесть |
|---|---|
| 14-35 | Хороший |
| 35-70 | Лёгкие изменения |
| 70-105 | Среднетяжёлый |
| > 105 | Очень плохой |

### Ключ — 1 = как здоровая кожа; 10 = максимальные отличия
Шкала не имеет нулевой точки (минимум = 7 за каждую часть).

### Альтернативы
- **VSS** (Vancouver, 0-13) — быстрее, но без мнения пациента
- **POSAS 3.0** (2022) — обновлённая версия с 3D-характеристиками
- **SBSES** (Stony Brook) — хирургические рубцы

### Терапия по тяжести
| POSAS | Тактика |
|---|---|
| < 35 | Силикон + SPF + массаж |
| 35-70 | + компрессия 20-30 mm Hg |
| 70-105 | + триамцинолон интралез. ± 5-ФУ, PDL/CO2 |
| > 105 | Хирургическая ревизия + лучевая терапия (келоиды) |

### Источник
Draaijers LJ. Plast Reconstr Surg 2004.`,
};

export default runner;
