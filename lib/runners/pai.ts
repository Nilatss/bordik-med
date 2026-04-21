// @ts-nocheck
/** Runner: pai — Periapical Index (PAI) for apical periodontitis */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (Orstavik 1986)',
  reference: 'Orstavik D, Kerekes K, Eriksen HM. The periapical index: a scoring system for radiographic assessment of apical periodontitis. Endod Dent Traumatol. 1986;2(1):20-34.',
  inputs: [
    { id: 'score', label: 'PAI балл', type: 'select', options: [
      { value: '1', label: '1 — нормальная периапикальная структура' },
      { value: '2', label: '2 — небольшие изменения костной структуры' },
      { value: '3', label: '3 — изменения с потерей минерала' },
      { value: '4', label: '4 — периодонтит с четко выраженным очагом разрежения' },
      { value: '5', label: '5 — тяжёлый периодонтит с экзацербацией' },
    ]},
    { id: 'modality', label: 'Метод визуализации', type: 'select', options: [
      { value: '2d', label: '2D периапикальная рентгенограмма' },
      { value: 'cbct', label: 'CBCT (расширенный PAI, Estrela 2008)' },
    ]},
  ],
  presets: [
    { label: 'PAI 2 (здоров)', values: { score: '2', modality: '2d' } },
    { label: 'PAI 3 (легкий)', values: { score: '3', modality: '2d' } },
    { label: 'PAI 5 (тяжелый)', values: { score: '5', modality: '2d' } },
  ],
  compute: (v) => {
    const score = Number(v.score || '1');
    const healthy = score <= 2;
    const disease = score >= 3;
    const color = score === 1 ? '#22C55E' : score === 2 ? '#84CC16' : score === 3 ? '#F59E0B' : score === 4 ? '#EF4444' : '#B91C1C';
    const descs: Record<number, string> = {
      1: 'Норма — периапикальная структура без изменений',
      2: 'Небольшие изменения — unclear, но без явного разрежения',
      3: 'Изменения с потерей минерала — начальный периодонтит',
      4: 'Чёткий очаг разрежения — установленный апикальный периодонтит',
      5: 'Тяжёлый периодонтит с экзацербацией (экспансивные изменения)',
    };
    const action = healthy ? 'Без лечения, наблюдение' : score === 3 ? 'Ортоградное эндолечение' : score === 4 ? 'Эндолечение ± retreatment, CBCT' : 'Эндо-retreatment или апикальная хирургия; CBCT обязательна';
    return {
      value: score,
      unit: 'PAI',
      color,
      interpretation: `PAI ${score}: ${descs[score]}`,
      details: `PAI балл: ${score}/5\nОписание: ${descs[score]}\nТактика: ${action}\n\nПорог болезни: PAI ≥ 3 считается apical periodontitis.\nУспех лечения: PAI снижается до 1-2 через 4 года (критерий Orstavik).`,
      actions: [
        'PAI 1-2: наблюдение 6-12 мес',
        'PAI 3: качественное эндолечение (rubber dam, NaOCl, obturation)',
        'PAI 4-5: CBCT, ретроградная хирургия при persistent pathology',
        'Контроль: PAI через 1 год и 4 года после лечения',
      ],
      caveats: [
        'PAI основан на reference-картинках (Brynolf 1967) — требуется калибровка',
        'Межоператорская вариабельность 0.54-0.91 (κ)',
        'CBCT-PAI (Estrela) имеет шкалу 0-5 + expansion и destruction',
        'Малые поражения (<3 мм) могут быть не видны на 2D рентгене',
      ],
      scale: {
        segments: [
          { min: 0.5, max: 2.5, label: '1-2 норма', color: '#22C55E' },
          { min: 2.5, max: 3.5, label: '3 легкий', color: '#F59E0B' },
          { min: 3.5, max: 4.5, label: '4 средний', color: '#EF4444' },
          { min: 4.5, max: 5.5, label: '5 тяжелый', color: '#B91C1C' },
        ],
        value: score,
      },
      related: [
        { id: 'vertucci', title: 'Vertucci anatomy' },
        { id: 'fdi-dent', title: 'FDI numbering' },
      ],
      relatedCourses: [
        { id: '313.1', title: 'Стоматология' },
      ],
    };
  },
  info: `### Для чего используется
**PAI (Periapical Index, Orstavik 1986)** — стандартная шкала рентгенологической оценки apical periodontitis на шкале 1-5. Широко используется в эндодонтических исследованиях и epidemiology.

### Шкала
| PAI | Описание | Статус |
|---|---|---|
| 1 | Норма | Здоров |
| 2 | Небольшие изменения | Неопределённо |
| 3 | Изменения с потерей минерала | Болезнь |
| 4 | Периодонтит с очагом | Болезнь |
| 5 | Тяжёлый периодонтит + экзацербация | Болезнь |

### Порог
**PAI ≥ 3** = apical periodontitis.

### Расширения
- **CBCT-PAI (Estrela 2008)** — 0-5 + оценка expansion и destruction
- **Orstavik success criterion** — PAI снижается до 1-2 через 4 года

### Источник
Orstavik D, Kerekes K, Eriksen HM. Endod Dent Traumatol 1986.`,
};
export default runner;
