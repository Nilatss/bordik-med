# Runner Implementation Template

This guide defines the consistent structure every new clinical tool runner
must follow. Agents implementing batches of runners in
`lib/tools-runners.ts` must follow this verbatim — deviation breaks the
shared display contract enforced by `components/tools/ToolView.tsx`.

## Two runner kinds

### Calculator (formula-based)

```ts
'tool-id': {
  kind: 'calculator',
  inputs: [
    { id: 'weight', label: 'Вес', type: 'number', unit: 'кг',
      min: 1, max: 500, step: 0.1,
      quickValues: [50, 60, 70, 80, 90, 100] },
    { id: 'sex', label: 'Пол', type: 'select',
      options: [{ value: 'm', label: 'Мужской' }, { value: 'f', label: 'Женский' }] },
  ],
  compute: (v) => {
    // 1. Derive numerical result
    const result = /* formula */;
    // 2. Branch interpretation, color, and ALL rich extras per result band
    let interpretation = '', color = '';
    let details = '';
    let actions: string[] = [];
    if (result < THRESHOLD_A) {
      interpretation = '…'; color = '#3B82F6';
      details = '1–3 sentences of Russian clinical context.';
      actions = ['Шаг 1', 'Шаг 2', 'Шаг 3'];
    } else if (result < THRESHOLD_B) {
      // ...
    }
    // 3. Always-on fields
    return {
      value: result.toFixed(1), unit: 'ед',
      interpretation, color,
      details, actions,
      caveats: [
        'Краткое замечание 1 о применимости',
        'Замечание 2 — когда формула не работает',
      ],
      scale: {
        segments: [
          { min: 0,           max: THRESHOLD_A, label: 'Норма',    color: '#22C55E' },
          { min: THRESHOLD_A, max: THRESHOLD_B, label: 'Пограничн.', color: '#F59E0B' },
          { min: THRESHOLD_B, max: 100,         label: 'Высокий',  color: '#EF4444' },
        ],
        current: Number(result.toFixed(1)),
        unit: 'ед',
      },
      related: [{ id: 'xxx', title: 'Название' }],          // 2–3 items
      relatedCourses: [{ id: '301.4', title: 'Эндокринология' }], // 0–3 items
    };
  },
  reference: 'Источник (год). Краткая нота.',
  countries: 'Международный',
  presets: [
    { label: 'Норма',        values: { weight: 70, sex: 'm' } },
    { label: 'Погранично',   values: { weight: 90, sex: 'm' } },
  ],
  info: `### Для чего используется
Параграф с объяснением инструмента.

### Формула
\`FORMULA = inputs...\`

### Классификация / Интерпретация
| Диапазон | Значение |
|---|---|
| … | … |

### Ограничения / Когда не использовать
- Пункт 1
- Пункт 2

### Тактика
- Действие при нормальном значении
- Действие при пороговом
- Действие при высоком

### Источник
Автор, журнал, год — плюс валидирующие исследования.
`,
},
```

### Score (point-based)

```ts
'score-id': {
  kind: 'score',
  inputs: [
    { id: 'age75', label: 'Возраст ≥ 75 лет', type: 'checkbox', points: 2 },
    { id: 'sex', label: 'Пол', type: 'select', options: [
      { value: 'm', label: 'Мужской', points: 0 },
      { value: 'f', label: 'Женский', points: 1 },
    ] },
  ],
  bands: [
    { min: 0, max: 0, label: '0 баллов', color: '#22C55E',
      description: 'Низкий риск · ~0.2 % в год',
      details: 'Клинический контекст — 1–2 предложения.',
      actions: ['Шаг 1', 'Шаг 2'] },
    { min: 1, max: 1, label: '1 балл',   color: '#F59E0B',
      description: 'Промежуточный риск · ~0.6 % в год' },
    { min: 2, max: 9, label: '≥2 баллов',color: '#EF4444',
      description: 'Высокий риск · ≥2.2 % в год',
      details: '…', actions: ['…','…'] },
  ],
  maxScore: 9,
  reference: 'Автор Журнал ГОД.',
  countries: 'Международный (ESC/AHA)',
  caveats: [
    'Tool-level ограничение 1',
    'Ограничение 2',
  ],
  related: [{ id: 'xxx', title: 'Название' }],
  relatedCourses: [{ id: '301.1', title: 'Кардиология' }],
  info: `...` // same structure as calculator
},
```

## Required clinical fields

Every runner must include at minimum:

1. **`reference`** — citation of the original validation / guideline
2. **`info`** — markdown article with the sections:
   - `### Для чего используется`
   - `### Формула` OR `### Критерии`
   - `### Интерпретация` or `### Бэнды / Классификация`
   - `### Ограничения`
   - `### Тактика`
   - `### Источник`
3. **`caveats`** — 2–4 items; pitfalls, validation limits
4. **`related`** — 2–3 related tool ids (see valid list in agent brief)
5. **`relatedCourses`** — 0–3 course ids; skip if no genuine link

## Result card rendering rules

The `ResultCard` automatically renders sections in this order. Runners
must supply data in line with that order:

1. Headline (value + unit + interpretation) — mandatory
2. Scale — when clinical cut-offs exist
3. `details` — longer narrative
4. `actions` — next clinical steps
5. `differential` — only if well-known mnemonic (MUDPILES, DANISH, etc.)
6. `caveats` — always
7. `related` (tools) — almost always
8. `relatedCourses` — when a real course covers the topic

## Legal / clinical correctness

- **Never invent values.** Every cut-off, range, dose must match the cited source.
- Если инструмент подразумевает региональные различия (азиатские пороги
  BMI, европейские vs американские цели LDL) — это должно быть в
  `caveats` или в ветвях `details`.
- При наличии смертельно опасных клинических ситуаций (DKA, анионный
  разрыв > 20, QTc > 500) `actions` обязаны включать экстренные меры.
- Все доli, концентрации и скорости инфузий — по опубликованным
  рекомендациям (UpToDate, BMJ Best Practice, национальные гайдлайны).

## ESLint / TypeScript

- Run `npx tsc --noEmit` after every batch. No new errors.
- Ignore the pre-existing `TabbedLessonViewer` error if reported.
- All string literals in Russian must use `’` (не апостроф) — but double
  quotes in JSON-like objects remain ASCII.

## Examples to reference

Look at these already-implemented runners before writing new ones:

- **Simple formula + scale:** `bmi` (~line 170), `anion-gap` (~line 739)
- **Complex branching:** `ckd-epi`, `meld`, `cockcroft`
- **Score with bands:** `chads-vasc`, `has-bled`, `wells-dvt`, `sofa`
- **Pediatric:** `apgar`, `schwartz`, `holliday-segar`
- **Conversion:** (none yet — first conversion should set the pattern)
