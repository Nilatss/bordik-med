/** Runner: 6mwt — 6-Minute Walk Test (Enright 1998) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'distance', label: 'Пройденное расстояние', type: 'number', unit: 'м', min: 0, step: 1, quickValues: [200, 300, 400, 500, 600] },
    { id: 'sex', label: 'Пол', type: 'select', options: [
      { value: 'm', label: 'Мужской' },
      { value: 'f', label: 'Женский' },
    ]},
    { id: 'age',
hint: 'Возраст в годах', label: 'Возраст', type: 'number', unit: 'лет', min: 20, max: 100, step: 1 },
    { id: 'height',
hint: 'Рост в см (без обуви)', label: 'Рост', type: 'number', unit: 'см', min: 100, max: 220, step: 1 },
    { id: 'weight',
hint: 'Вес в кг (без одежды)', label: 'Вес', type: 'number', unit: 'кг', min: 30, max: 200, step: 1 },
  ],
  compute: (v) => {
    const d = Number(v.distance || 0);
    const age = Number(v.age || 0);
    const h = Number(v.height || 0);
    const w = Number(v.weight || 0);
    const sex = v.sex || 'm';
    // Enright 1998 formulas
    const predicted = sex === 'm'
      ? (7.57 * h) - (5.02 * age) - (1.76 * w) - 309
      : (2.11 * h) - (2.29 * w) - (5.78 * age) + 667;
    const pct = predicted > 0 ? (d / predicted) * 100 : 0;
    let color = '#22C55E', interp = 'Норма';
    if (pct < 50) { color = '#EF4444'; interp = 'Выраженное снижение'; }
    else if (pct < 70) { color = '#F59E0B'; interp = 'Умеренное снижение'; }
    else if (pct < 82) { color = '#84CC16'; interp = 'Лёгкое снижение'; }
    return {
      value: `${d} м`,
      unit: `(${pct.toFixed(0)} % от пред.)`,
      interpretation: `${interp}. Предсказанное: ${predicted.toFixed(0)} м.`,
      color,
      details: 'Тест ходьбы за 6 мин по ровному коридору 30 м. Оценивает субмаксимальную толерантность к нагрузке. Формулы Enright & Sherrill 1998 для здоровых взрослых 40-80 лет.',
      actions: [
        'Измерить SpO2, ЧСС, АД до/после; оценка по Borg CR-10 (одышка + ноги)',
        d < 300 ? 'Расстояние < 300 м — плохой прогноз при ХСН/ХОБЛ, рассмотреть интенсивную реабилитацию' : '',
        pct < 70 ? 'Направление на кардиореспираторную реабилитацию' : '',
        'MCID: ~30 м (ХОБЛ), ~50 м (ХСН) — используйте для мониторинга эффекта',
        'Повторить через 8-12 нед для оценки динамики',
      ].filter(Boolean),
      caveats: [
        'Не заменяет максимальный нагрузочный тест (CPET, VO2max)',
        'Стандартизация критична: коридор 30 м, стандартные инструкции, один тестер',
        'Learning effect — второй тест обычно на 5-10 % лучше',
        'Нижняя граница нормы (LLN) ≈ predicted – 153 м (муж) / – 139 м (жен)',
      ],
      scale: {
        segments: [
          { min: 0, max: 50, label: '< 50 %', color: '#EF4444' },
          { min: 50, max: 70, label: '50-70 %', color: '#F59E0B' },
          { min: 70, max: 82, label: '70-82 %', color: '#84CC16' },
          { min: 82, max: 150, label: '≥ 82 %', color: '#22C55E' },
        ],
        current: Number(pct.toFixed(0)),
        unit: '% от предсказанного',
      },
      related: [{ id: 'borg', title: 'Borg RPE' }, { id: 'berg-balance', title: 'Berg Balance' }],
      relatedCourses: [{ id: '312.1', title: 'Реабилитация' }],
    };
  },
  reference: 'Enright PL, Sherrill DL. Reference equations for the six-minute walk in healthy adults. Am J Respir Crit Care Med 1998;158:1384-1387.',
  countries: 'Международный (ATS/ERS 2014)',
  presets: [
    { label: 'Здоровый муж', values: { distance: 600, sex: 'm', age: 50, height: 175, weight: 80 } },
    { label: 'ХОБЛ средн.', values: { distance: 350, sex: 'm', age: 65, height: 170, weight: 75 } },
    { label: 'ХСН тяж.', values: { distance: 200, sex: 'f', age: 72, height: 160, weight: 70 } },
  ],
  info: `### Для чего используется
**6-Minute Walk Test (6MWT)** — стандарт субмаксимальной оценки толерантности к физической нагрузке. Применяется при ХОБЛ, ХСН, лёгочной гипертензии, муковисцидозе, саркоидозе, ИЛФ.

### Формулы Enright 1998
**Мужчины:** predicted = 7,57×рост(см) – 5,02×возраст – 1,76×вес(кг) – 309
**Женщины:** predicted = 2,11×рост(см) – 2,29×вес – 5,78×возраст + 667

LLN (нижняя граница нормы): predicted – 153 (муж) / – 139 (жен)

### Протокол (ATS 2002)
- Коридор 30 м, ровный
- Инструкция: «Пройдите максимальное расстояние за 6 мин, разрешены остановки»
- Стандартные фразы поощрения каждую минуту
- SpO2, ЧСС, АД, Borg до и после

### Прогностическая значимость
| Патология | Пороги |
|---|---|
| ХОБЛ | < 350 м — плохой прогноз |
| ХСН | < 300 м — 3-летняя смертность ↑ |
| ЛАГ | < 332 м — показание к комбинации |

### MCID
- ХОБЛ: ~30 м
- ХСН: ~50 м

### Источник
Enright PL, Sherrill DL. AJRCCM 1998. ATS Statement 2002.`,
};

export default runner;
