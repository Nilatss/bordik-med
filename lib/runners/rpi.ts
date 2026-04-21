// @ts-nocheck
/** Runner: rpi — Reticulocyte Production Index */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'retic', label: 'Ретикулоциты', type: 'number', unit: '%', min: 0, max: 40, step: 0.1, quickValues: [0.5, 1.0, 2.0, 5.0, 10] },
    { id: 'hct', label: 'Гематокрит', type: 'number', unit: '%', min: 10, max: 55, step: 0.1, quickValues: [20, 30, 36, 45] },
    { id: 'hct_norm', label: 'Норма HCT', type: 'number', unit: '%', min: 35, max: 50, step: 0.1, quickValues: [40, 42, 45] },
  ],
  compute: (v) => {
    const retic = Number(v.retic) || 0;
    const hct = Number(v.hct) || 1;
    const hctNorm = Number(v.hct_norm) || 45;

    // Maturation factor based on HCT
    let mat = 1.0;
    if (hct < 15) mat = 2.5;
    else if (hct < 25) mat = 2.0;
    else if (hct < 35) mat = 1.5;

    const correctedRetic = retic * (hct / hctNorm);
    const rpi = correctedRetic / mat;

    let interpretation = 'Адекватный ответ';
    let color = '#22C55E';
    if (rpi < 2) { interpretation = 'Гипопролиферация'; color = '#F59E0B'; }
    else if (rpi > 3) { interpretation = 'Гемолиз / кровопотеря'; color = '#F97316'; }

    return {
      value: rpi.toFixed(2),
      unit: 'RPI',
      interpretation,
      color,
      details: `RPI = (Ретик % × HCT/HCTнорма) / фактор созревания.
Фактор созревания: HCT ≥ 35 → 1,0; 25–34 → 1,5; 15–24 → 2,0; < 15 → 2,5.
Скорректированный ретикулоцит: ${correctedRetic.toFixed(2)} %. Фактор созревания: ${mat.toFixed(1)}.`,
      actions: [
        rpi < 2 ? 'Гипопролиферативная анемия: проверить железо/В12/фолат/ТТГ/креатинин/ЭПО; костный мозг при отсутствии явной причины' : null,
        rpi > 3 ? 'Гиперпролиферация: оценить гемолиз (ЛДГ, гаптоглобин, непрямой билирубин, Coombs) или скрытое кровотечение' : null,
        rpi >= 2 && rpi <= 3 ? 'Пограничный ответ — повторить через 3–5 дней, оценить динамику' : null,
        'Учесть: терапия железом / В12 / ЭПО вызывает ретикулоцитарный криз к 5–7 дню',
      ].filter(Boolean),
      caveats: [
        'Формула Hillman-Finch учитывает сдвиг ретикулоцитов в кровь при тяжёлой анемии',
        'Фактор созревания — приближение; точнее использовать IRF (immature reticulocyte fraction) на автоанализаторе',
        'Ручной подсчёт имеет CV 20–25 %; автоанализатор — 3–5 %',
        'Переливание эритроцитов искажает HCT и ложно снижает RPI',
      ],
      scale: {
        segments: [
          { min: 0, max: 2, label: 'Гипопролиф.', color: '#F59E0B' },
          { min: 2, max: 3, label: 'Адекват.', color: '#22C55E' },
          { min: 3, max: 15, label: 'Гиперпролиф.', color: '#F97316' },
        ],
        current: Math.min(rpi, 15),
        unit: 'RPI',
      },
      relatedCourses: [
        { id: '303.1', title: 'Гематология' },
        { id: '304.1', title: 'Лаб. диагностика' },
      ],
      related: [
        { id: 'wintrobe', title: 'Индексы Винтроба' },
        { id: 'tibc', title: 'TIBC/ферритин' },
      ],
    };
  },
  reference: 'Hillman RS, Finch CA. Red Cell Manual 7th ed. 1996. CLSI H44-A2. Perkins SL. In: Wintrobe\'s Clinical Hematology 14th ed.',
  countries: 'Международный',
  presets: [
    { label: 'Норма', values: { retic: 1.0, hct: 42, hct_norm: 45 } },
    { label: 'Гипопролиф. анемия', values: { retic: 1.5, hct: 25, hct_norm: 45 } },
    { label: 'Гемолиз', values: { retic: 8.0, hct: 28, hct_norm: 45 } },
  ],
  info: `### Для чего используется
**Reticulocyte Production Index (RPI)** — корректированный ретикулоцитарный индекс, разделяющий анемии на **гипо-** и **гиперпролиферативные**. Ключевой шаг диагностического алгоритма анемий.

### Формула
**RPI = (Ретикулоциты % × HCT пациента / HCT норма) / Фактор созревания**

### Фактор созревания (Hillman-Finch)
| HCT (%) | Фактор |
|---|---|
| ≥ 35 | 1,0 |
| 25–34 | 1,5 |
| 15–24 | 2,0 |
| < 15 | 2,5 |

Причина: при тяжёлой анемии ЭПО выталкивает в кровь незрелые ретикулоциты, которые созревают дольше (1 → 2,5 дня) — это завышает % и требует поправки.

### Интерпретация
| RPI | Интерпретация | Примеры |
|---|---|---|
| < 2 | Гипопролиферация | ЖДА, B12-дефицит, апластическая, хр. почечная, хр. заболеваний |
| 2–3 | Пограничный | Ранний ответ на терапию |
| > 3 | Гиперпролиферация | Гемолиз, острая кровопотеря, ответ на железо/B12 |

### Алгоритм анемии (Wintrobe)
1. Hb ↓ → анемия?
2. MCV → микро / нормо / макро
3. **RPI** → гипо- или гиперпролиферативная
4. Гипопролиф → ферритин, B12, фолат, креатинин, ТТГ
5. Гиперпролиф → ЛДГ, гаптоглобин, билирубин непрямой, Coombs

### Абсолютные ретикулоциты (альтернатива)
Normал 25–75 × 10⁹/л. > 100 → гиперпролиферативный ответ.

### IRF (immature reticulocyte fraction)
Современные автоанализаторы (Sysmex XN) выдают IRF — долю незрелых ретикулоцитов. Ранний маркер восстановления эритропоэза (повышается до роста абсолютных ретикулоцитов).

### Ограничения
- Трансфузии искажают HCT
- Терапия ЭПО/железом — ретикулоцитарный криз на 5–7 день
- Гиперспленизм → секвестрация ретикулоцитов → заниженный RPI
- Ручной подсчёт имеет высокий CV`,
};

export default runner;
