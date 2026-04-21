// @ts-nocheck
/** Runner: dmft — DMFT/dmft index (WHO caries severity) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (WHO Oral Health Surveys, 5th ed. 2013)',
  reference: 'World Health Organization. Oral Health Surveys: Basic Methods, 5th ed. Geneva: WHO; 2013. Klein H, Palmer CE, Knutson JW. Public Health Rep. 1938;53:751-765.',
  inputs: [
    { id: 'dentition', label: 'Прикус', type: 'select', options: [
      { value: 'perm', label: 'Постоянный (DMFT, 0-32)' },
      { value: 'prim', label: 'Молочный (dmft, 0-20)' },
    ]},
    { id: 'd', label: 'D/d — кариозные (decayed)', type: 'number', min: 0, max: 32, step: 1 },
    { id: 'm', label: 'M/m — удалённые (missing из-за кариеса)', type: 'number', min: 0, max: 32, step: 1 },
    { id: 'f', label: 'F/f — пломбированные (filled)', type: 'number', min: 0, max: 32, step: 1 },
  ],
  presets: [
    { label: 'Низкий DMFT (взрослый)', values: { dentition: 'perm', d: 0, m: 0, f: 2 } },
    { label: 'Высокий DMFT', values: { dentition: 'perm', d: 3, m: 2, f: 2 } },
    { label: 'Детский dmft умеренный', values: { dentition: 'prim', d: 2, m: 0, f: 1 } },
  ],
  compute: (v) => {
    const d = Number(v.d || 0), m = Number(v.m || 0), f = Number(v.f || 0);
    const total = d + m + f;
    const maxT = v.dentition === 'prim' ? 20 : 32;
    let label = 'Очень низкий', color = '#22C55E';
    if (total >= 6.6) { label = 'Очень высокий'; color = '#B91C1C'; }
    else if (total >= 4.5) { label = 'Высокий'; color = '#EF4444'; }
    else if (total >= 2.7) { label = 'Умеренный'; color = '#F59E0B'; }
    else if (total >= 1.2) { label = 'Низкий'; color = '#84CC16'; }
    return {
      value: total,
      unit: 'зубов',
      color,
      interpretation: `DMFT ${total} — тяжесть кариеса: ${label}`,
      details: `D (кариозные) = ${d}\nM (удалённые) = ${m}\nF (пломбированные) = ${f}\nВсего (DMFT) = ${total} из ${maxT}\n\nТяжесть по ВОЗ: ${label}`,
      actions: [
        'Низкий: поддерживающая профилактика, фториды',
        'Умеренный: герметизация фиссур, фторлак каждые 3-6 мес',
        'Высокий: интенсивная профилактика + санация + диетические рекомендации',
      ],
      caveats: [
        'DMFT оценивается на уровне зуба (не поверхности) — менее чувствителен чем DMFS',
        'M учитывается только при удалении из-за кариеса (не травмы/ортодонтии)',
        'Для популяционного сравнения — среднее DMFT 12-летних',
        'ICDAS и CAST более современные — учитывают ранний кариес',
      ],
      scale: {
        segments: [
          { min: 0, max: 1.2, label: 'Очень низк', color: '#22C55E' },
          { min: 1.2, max: 2.7, label: 'Низкий', color: '#84CC16' },
          { min: 2.7, max: 4.5, label: 'Умеренный', color: '#F59E0B' },
          { min: 4.5, max: 6.6, label: 'Высокий', color: '#EF4444' },
          { min: 6.6, max: 32, label: 'Очень выс', color: '#B91C1C' },
        ],
        value: total,
      },
      related: [
        { id: 'cast-icdas', title: 'ICDAS / CAST' },
        { id: 'blacks', title: 'G.V. Black classification' },
        { id: 'fdi-dent', title: 'FDI numbering' },
      ],
      relatedCourses: [
        { id: '313.1', title: 'Стоматология' },
      ],
    };
  },
  info: `### Для чего используется
**DMFT** (Decayed, Missing, Filled Teeth) — классический индекс ВОЗ для оценки кариозного опыта. Для молочных зубов — строчными буквами **dmft** (0-20), для постоянных — прописными **DMFT** (0-32).

### Интерпретация тяжести кариеса (WHO)
| DMFT | Категория |
|---|---|
| <1.2 | Очень низкая |
| 1.2-2.6 | Низкая |
| 2.7-4.4 | Умеренная |
| 4.5-6.5 | Высокая |
| >6.6 | Очень высокая |

### Ограничения
- Не учитывает ранние кариозные поражения (white spot) — используйте ICDAS
- Не учитывает причину удаления
- Популяционный indicator — среднее DMFT 12-летних (WHO goal: DMFT<1 к 2020)

### Источник
WHO Oral Health Surveys: Basic Methods, 5th ed. 2013.`,
};
export default runner;
