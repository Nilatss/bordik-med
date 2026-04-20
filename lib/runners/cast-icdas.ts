// @ts-nocheck
/** Runner: cast-icdas — ICDAS II + CAST caries assessment */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (ICDAS Foundation · CAST Frencken et al.)',
  reference: 'ICDAS Coordinating Committee. ICDAS II criteria manual. 2005. Frencken JE, et al. The Caries Assessment Spectrum and Treatment (CAST) index. Community Dent Oral Epidemiol. 2011;39(6):516-21.',
  inputs: [
    { id: 'system', label: 'Система', type: 'select', options: [
      { value: 'icdas', label: 'ICDAS II (0-6)' },
      { value: 'cast', label: 'CAST (0-9)' },
    ]},
    { id: 'code', label: 'Код', type: 'select', options: [
      { value: '0', label: '0 — здоровая поверхность' },
      { value: '1', label: '1 — первое визуальное изменение (после сушки)' },
      { value: '2', label: '2 — отчётливое изменение эмали (видно на влажной)' },
      { value: '3', label: '3 — локализованное разрушение эмали (без дентина)' },
      { value: '4', label: '4 — тёмное просвечивание дентина без полости' },
      { value: '5', label: '5 — чёткая полость с видимым дентином' },
      { value: '6', label: '6 — обширная полость с явным дентином' },
      { value: '7', label: 'CAST 7 — поражение пульпы' },
      { value: '8', label: 'CAST 8 — абсцесс/свищ' },
      { value: '9', label: 'CAST 9 — потерян из-за кариеса' },
    ]},
  ],
  presets: [
    { label: 'ICDAS 2 (ранний кариес)', values: { system: 'icdas', code: '2' } },
    { label: 'ICDAS 5 (полость дентин)', values: { system: 'icdas', code: '5' } },
    { label: 'CAST 7 (пульпит)', values: { system: 'cast', code: '7' } },
  ],
  compute: (v) => {
    const code = String(v.code || '0');
    const n = Number(code);
    let treatment = 'Наблюдение, фториды', color = '#22C55E';
    if (n === 0) { treatment = 'Профилактика, фториды'; color = '#22C55E'; }
    else if (n <= 2) { treatment = 'Неоперативное: фтор-лак, реминерализация, герметизация'; color = '#84CC16'; }
    else if (n <= 4) { treatment = 'Микро-инвазивная / минимально-инвазивная реставрация'; color = '#F59E0B'; }
    else if (n <= 6) { treatment = 'Оперативная реставрация (композит/амальгама)'; color = '#EF4444'; }
    else if (n === 7) { treatment = 'Эндодонтическое лечение (пульпит)'; color = '#B91C1C'; }
    else if (n === 8) { treatment = 'Эндодонтия + дренаж абсцесса или удаление'; color = '#7F1D1D'; }
    else if (n === 9) { treatment = 'Зуб потерян — протезирование/имплантация'; color = '#4B5563'; }
    return {
      value: n,
      unit: String(v.system || 'icdas').toUpperCase(),
      color,
      interpretation: `${String(v.system).toUpperCase()} код ${n}: ${treatment}`,
      details: `**Код:** ${n}\n**Рекомендация:** ${treatment}\n\n**ICDAS II** — 0-6 шкала визуальной детекции (0 здоровый → 6 обширная полость).\n**CAST** расширяет до 9 (пульпит, абсцесс, потерянный зуб).`,
      actions: [
        '0-2: неоперативное — fluoride varnish 5% 2-4×/год, casein-phosphate (CPP-ACP)',
        '3-4: герметизация, ART (Atraumatic Restorative Treatment)',
        '5-6: препарирование + композит/стеклоиономер',
        '7-8: эндодонтия (ICD-10 K04.0-K04.7)',
      ],
      caveats: [
        'ICDAS требует сушки поверхности — без этого занижение кодов 1-2',
        'Высокая межоператорная согласованность при калибровке',
        'Не применяется к реставрациям (отдельный код ICDAS restoration)',
        'CAST специально для популяционных исследований в развивающихся странах',
      ],
      scale: {
        segments: [
          { min: 0, max: 1, label: '0 Здоров', color: '#22C55E' },
          { min: 1, max: 3, label: '1-2 Эмаль', color: '#84CC16' },
          { min: 3, max: 5, label: '3-4 Дентин', color: '#F59E0B' },
          { min: 5, max: 7, label: '5-6 Полость', color: '#EF4444' },
          { min: 7, max: 10, label: '7-9 Ослож', color: '#B91C1C' },
        ],
        value: n,
      },
      related: [
        { id: 'dmft', title: 'DMFT index' },
        { id: 'blacks', title: 'G.V. Black' },
      ],
      relatedCourses: [
        { id: '313.1', title: 'Стоматология' },
      ],
    };
  },
  info: `### Для чего используется
**ICDAS II** (International Caries Detection and Assessment System, 2005) — визуальная система детекции кариеса 0-6 с упором на ранние поражения.
**CAST** (Caries Assessment Spectrum and Treatment, Frencken 2011) — расширяет ICDAS до 9 (пульпит, абсцесс, потеря).

### ICDAS II коды
| Код | Описание |
|---|---|
| 0 | Здоровая поверхность |
| 1 | Первое изменение эмали (сушка) |
| 2 | Изменение на влажной |
| 3 | Локальное разрушение эмали |
| 4 | Тень дентина под эмалью |
| 5 | Полость с видимым дентином |
| 6 | Обширная полость |

### CAST дополнительно
| Код | Описание |
|---|---|
| 7 | Пульпит |
| 8 | Абсцесс / свищ |
| 9 | Потерян из-за кариеса |

### Лечение
- 0-2: non-operative (fluoride, sealants)
- 3-4: micro-invasive (ART, sealants)
- 5-6: operative restoration
- 7-9: endodontic / extraction / prosthesis

### Источник
ICDAS Foundation 2005; Frencken JE et al. Community Dent Oral Epidemiol 2011.`,
};
export default runner;
