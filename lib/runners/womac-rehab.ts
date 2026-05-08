/** Runner: womac-rehab — WOMAC (OA of knee/hip) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'pain', label: 'Боль: сумма 5 пунктов (0-20)', type: 'number', min: 0, max: 20, step: 1 },
    { id: 'stiff', label: 'Скованность: сумма 2 пунктов (0-8)', type: 'number', min: 0, max: 8, step: 1 },
    { id: 'func', label: 'Функция: сумма 17 пунктов (0-68)', type: 'number', min: 0, max: 68, step: 1 },
  ],
  compute: (v) => {
    const p = Number(v.pain || 0);
    const s = Number(v.stiff || 0);
    const f = Number(v.func || 0);
    const total = p + s + f;
    const pPct = (p / 20) * 100;
    const sPct = (s / 8) * 100;
    const fPct = (f / 68) * 100;
    const totalPct = (total / 96) * 100;
    let color = '#22C55E', interp = 'Минимальные симптомы';
    if (totalPct >= 60) { color = '#EF4444'; interp = 'Тяжёлый ОА'; }
    else if (totalPct >= 40) { color = '#F59E0B'; interp = 'Среднетяжёлый'; }
    else if (totalPct >= 20) { color = '#84CC16'; interp = 'Лёгкий'; }
    return {
      value: String(total),
      unit: `/96 (${totalPct.toFixed(0)} %)`,
      interpretation: `${interp}. Боль ${p}/20 (${pPct.toFixed(0)} %), скованность ${s}/8 (${sPct.toFixed(0)} %), функция ${f}/68 (${fPct.toFixed(0)} %).`,
      color,
      details: 'WOMAC (Western Ontario & McMaster) 24 пункта × 0-4 (или 0-100 мм VAS). 5 пунктов боль + 2 скованность + 17 функция. Макс 96 (Likert) или 2400 мм (VAS).',
      actions: [
        totalPct < 20 ? 'Образование, снижение веса, ЛФК, ацетаминофен по потребности' : '',
        totalPct >= 20 && totalPct < 60 ? 'НПВС топически/п/о, ЛФК по Otago, физиотерапия, ортезы' : '',
        totalPct >= 60 ? 'Направление к ортопеду; оценка показаний к артропластике (THR/TKR)' : '',
        'Внутрисуставные ГКС при обострении (max 3-4 × /год)',
        'Гиалуроновая кислота — слабая рекомендация (ACR 2019 conditional against)',
        'Снижение веса на 10 % → снижение WOMAC-pain на 30-50 %',
      ].filter(Boolean),
      caveats: [
        'MCID: 9-12 % для всех доменов (абс. ~9-12 мм на 100 мм VAS)',
        'PASS (Patient Acceptable Symptom State) для WOMAC-pain ≈ 31 мм / 100',
        'Не валидирован для ОА голеностопа и позвоночника',
        'Альтернатива: KOOS (более подробный), HOOS (бедро)',
      ],
      scale: {
        segments: [
          { min: 0, max: 20, label: 'Минимум', color: '#22C55E' },
          { min: 20, max: 40, label: 'Лёгкий', color: '#84CC16' },
          { min: 40, max: 60, label: 'Средний', color: '#F59E0B' },
          { min: 60, max: 101, label: 'Тяжёлый', color: '#EF4444' },
        ],
        current: Number(totalPct.toFixed(0)),
        unit: '% WOMAC',
      },
      related: [{ id: 'das28', title: 'DAS28' }, { id: 'odi', title: 'ODI' }],
      relatedCourses: [{ id: '312.1', title: 'Реабилитация' }],
    };
  },
  reference: 'Bellamy N, Buchanan WW, Goldsmith CH, Campbell J, Stitt LW. Validation study of WOMAC. J Rheumatol 1988;15:1833-1840.',
  countries: 'Международный',
  presets: [
    { label: 'Лёгкий', values: { pain: 4, stiff: 2, func: 15 } },
    { label: 'Средний', values: { pain: 10, stiff: 4, func: 30 } },
    { label: 'Тяжёлый', values: { pain: 16, stiff: 6, func: 55 } },
  ],
  info: `### Для чего используется
**WOMAC (Western Ontario & McMaster Universities OA Index)** — стандарт оценки остеоартрита коленного и тазобедренного суставов.

### Структура
| Домен | Пункты | Макс Likert | Макс VAS (мм) |
|---|---|---|---|
| Боль | 5 | 20 | 500 |
| Скованность | 2 | 8 | 200 |
| Функция | 17 | 68 | 1700 |
| **Total** | 24 | 96 | 2400 |

Каждый пункт: 0 (нет) → 4 (очень сильно) для Likert 3.1.

### Интерпретация (% от максимума)
| % | Тяжесть |
|---|---|
| < 20 | Минимум |
| 20-39 | Лёгкий |
| 40-59 | Средний |
| ≥ 60 | Тяжёлый |

### MCID
- 9-12 % для каждого домена
- Абсолютно ~12 мм на 100 мм VAS

### Источник
Bellamy N et al. J Rheumatol 1988.`,
};

export default runner;
