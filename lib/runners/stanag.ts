// @ts-nocheck
/** Runner: stanag — NATO STANAG 2879 military triage */
import type {
  ScoreTool,
  ToolInput,
  ScoreBand,
  Preset,
} from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 4,
  inputs: [
    {
      id: 'cat',
      label: 'Категория STANAG 2879',
      type: 'select',
      options: [
        { value: '1', label: 'T1 Immediate (красный) — жизнеспасающая помощь немедленно', points: 1 },
        { value: '2', label: 'T2 Delayed (жёлтый) — помощь в пределах часов', points: 2 },
        { value: '3', label: 'T3 Minimal (зелёный) — лёгкие, ходячие', points: 3 },
        { value: '4', label: 'T4 Expectant (синий/чёрный) — нежизнеспособные при дефиците ресурсов', points: 4 },
      ],
    },
  ],
  bands: [
    {
      min: 1, max: 1,
      label: 'T1 Immediate (красный)',
      color: '#DC2626',
      description: 'Жизнеугрожающее повреждение, устранимое быстрой хирургией или реанимацией (< 60 мин до операции).',
      details: 'Обширное наружное кровотечение, напряжённый пневмоторакс, обструкция ДП, декомпенсированный шок, открытая травма груди, массивная кровопотеря.',
      actions: [
        'MARCH: Massive hemorrhage → Airway → Respiration → Circulation → Hypothermia',
        'Жгут CAT, тампонада, NPA/крико, декомпрессия, TXA 1 г',
        'Приоритет CASEVAC — «urgent» (<1 ч) / «urgent surgical» (<2 ч)',
      ],
    },
    {
      min: 2, max: 2,
      label: 'T2 Delayed (жёлтый)',
      color: '#FACC15',
      description: 'Серьёзные повреждения без угрозы жизни в ближайшие часы, вмешательство можно отложить до 6 ч.',
      details: 'Закрытые переломы крупных костей, стабильные ранения брюшной полости, ожоги 15–40%, стабильная ЧМТ средней тяжести.',
      actions: [
        'Обезболивание (кетамин, морфин, OTFC), иммобилизация',
        'Переоценка каждые 30 мин — может перейти в T1',
        'CASEVAC priority / routine, 2–6 ч',
      ],
    },
    {
      min: 3, max: 3,
      label: 'T3 Minimal (зелёный)',
      color: '#22C55E',
      description: 'Лёгкие ранения — «walking wounded», возвращаются в строй после минимального лечения.',
      actions: [
        'Перевязка, обезболивание OTFC',
        'Самостоятельная эвакуация / попутный транспорт',
        'Возможно возвращение к обязанностям',
      ],
    },
    {
      min: 4, max: 4,
      label: 'T4 Expectant (синий)',
      color: '#1E3A8A',
      description: 'Повреждения, несовместимые с жизнью при текущих ресурсах (массивная ЧМТ с размозжением, ожоги > 80% + ингаляция, агония).',
      details: 'Категория применяется ТОЛЬКО при превышении числа пострадавших над возможностями. При изменении ресурсов возможен возврат в T1.',
      actions: [
        'Обезболивание, седация, комфортные условия',
        'Документация (время, обстоятельства, свидетели)',
        'Переоценка при подходе подкреплений',
      ],
    },
  ],
  caveats: [
    'STANAG 2879 — NATO Allied Medical Publication AMedP-1.10',
    'T4 Expectant присваивается ТОЛЬКО при непоколебимом дефиците ресурсов; в мирной клинике не применяется',
    'В военной медицине порядок эвакуации синхронизируется с 9-Line MEDEVAC',
    'Tactical Combat Casualty Care (TCCC) использует те же 4 категории с MARCH-PAWS',
  ],
  related: [
    { id: 'start-civ', title: 'START / SALT (civilian)' },
    { id: 'sieve-sort', title: 'SIEVE + SORT (UK)' },
    { id: 'mchs-russia', title: 'МЧС РФ 4-цветная' },
    { id: 'rts', title: 'RTS' },
  ],
  relatedCourses: [
    { id: '300.4', title: 'Неотложная помощь' },
  ],
  reference: 'NATO STANAG 2879 / AMedP-1.10 — Allied Medical Publication on the Use of Triage in NATO Medical Support Operations. NATO Standardization Office, 2019.',
  countries: 'NATO (альянс)',
  presets: [
    { label: 'T1 Immediate', values: { cat: '1' } },
    { label: 'T2 Delayed', values: { cat: '2' } },
    { label: 'T3 Minimal', values: { cat: '3' } },
    { label: 'T4 Expectant', values: { cat: '4' } },
  ],
  info: `### Для чего используется
**NATO STANAG 2879 (AMedP-1.10)** — стандарт альянса по военной медицинской сортировке. Унифицирован для всех стран NATO и используется при совместных операциях.

### Четыре категории
| Код | Название | Цвет | Приоритет |
|---|---|---|---|
| T1 | Immediate | красный | 1 (жизнеспасающая помощь немедленно) |
| T2 | Delayed | жёлтый | 2 (часы) |
| T3 | Minimal | зелёный | 3 (лёгкие, в строй) |
| T4 | Expectant | синий | отсрочка при дефиците |

### Связь с TCCC и MARCH
Tactical Combat Casualty Care использует те же категории. Алгоритм помощи:
- **M**assive hemorrhage (жгут CAT)
- **A**irway (NPA, крико)
- **R**espiration (декомпрессия, окклюзионная повязка)
- **C**irculation (TXA, инфузия, шок)
- **H**ypothermia / Head injury

### CASEVAC priorities (9-Line MEDEVAC)
| Приоритет | Время | Категория |
|---|---|---|
| Urgent | < 1 ч | T1 |
| Urgent surgical | < 2 ч | T1 с хирургией |
| Priority | < 4 ч | T2 |
| Routine | < 24 ч | T3 |
| Convenience | по возможности | T3 (walking) |

### Отличия T4 Expectant
Присваивается только при **mass casualty** с непоколебимым дефицитом ресурсов. При появлении подкреплений — возврат в T1.

### Источники
- STANAG 2879 / AMedP-1.10, NATO STO 2019
- Joint Trauma System Clinical Practice Guideline: Triage in Tactical Combat Casualty Care
`,
};

export default runner;
