// @ts-nocheck
/** Runner: frykman — Frykman classification of distal radius fractures (1967) */
import type { ScoreTool } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 8,
  inputs: [
    {
      id: 'type',
      label: 'Тип перелома дистального отдела лучевой кости',
      type: 'select',
      options: [
        { value: '1', label: 'I — внесуставной, без перелома шиловидного отростка локтевой', points: 1 },
        { value: '2', label: 'II — внесуставной + перелом шиловидного локтевой', points: 2 },
        { value: '3', label: 'III — внутрисуставной (радиокарпальный), без локтевой', points: 3 },
        { value: '4', label: 'IV — радиокарпальный + шиловидный локтевой', points: 4 },
        { value: '5', label: 'V — внутрисуставной (радиоульнарный, DRUJ), без локтевой', points: 5 },
        { value: '6', label: 'VI — радиоульнарный + шиловидный локтевой', points: 6 },
        { value: '7', label: 'VII — оба сустава (RC+RU), без локтевой', points: 7 },
        { value: '8', label: 'VIII — оба сустава + шиловидный локтевой', points: 8 },
      ],
    },
  ],
  bands: [
    {
      min: 1, max: 2, label: 'I–II (внесуставные)', color: '#22C55E',
      description: 'Extra-articular. Лучший прогноз.',
      details: 'Классические Colles (разгибательный) или Smith (сгибательный). Тип II — плюс перелом шиловидного локтевой (ulnar styloid).',
      actions: [
        'Закрытая репозиция под гематом-блокадой',
        'Короткая гипсовая лонгета (Colles cast) 6 нед',
        'Контроль рентгена через 1, 2, 6 нед',
        'При вторичном смещении → чрескожная фиксация (K-wires) или ORIF volar plate',
      ],
    },
    {
      min: 3, max: 4, label: 'III–IV (радиокарпальный)', color: '#84CC16',
      description: 'Внутрисуставной, линия в лучезапястный сустав.',
      actions: [
        'КТ для детальной оценки',
        'Ступенька/щель > 2 мм → ORIF volar locking plate',
        'Частичная иммобилизация 2 нед, затем ранняя ROM',
      ],
    },
    {
      min: 5, max: 6, label: 'V–VI (радиоульнарный)', color: '#F59E0B',
      description: 'Внутрисуставной с вовлечением DRUJ. Риск пост-травматической нестабильности DRUJ.',
      actions: [
        'ORIF volar plate',
        'Оценка DRUJ стабильности интраоперационно (ballottement test)',
        'При нестабильности DRUJ → иммобилизация супинации 6 нед или фиксация спицей',
      ],
    },
    {
      min: 7, max: 8, label: 'VII–VIII (оба сустава)', color: '#EF4444',
      description: 'Наиболее сложные, часто оскольчатые. Худший функциональный прогноз.',
      details: 'Тип VIII с переломом ulnar styloid имеет наибольший риск DRUJ нестабильности и хронической боли.',
      actions: [
        'КТ обязательна',
        'ORIF volar + иногда dorsal plate (fragment-specific fixation)',
        'Артроскопия для оценки TFCC, scapholunate',
        'Реабилитация 3–6 мес',
      ],
    },
  ],
  caveats: [
    'Чётные типы (II, IV, VI, VIII) = сопутствующий перелом шиловидного локтевой',
    'Низкая inter-observer reliability (κ 0.3–0.4), ограниченное клиническое применение',
    'Современные альтернативы: AO/OTA 2R3, Fernandez (по механизму), Melone (lunate facet)',
    'Значение ulnar styloid: отрыв у основания > 2 мм смещения → риск DRUJ нестабильности',
    'TFCC (triangular fibrocartilage complex) часто повреждён при типах V–VIII',
  ],
  related: [
    { id: 'ao-ota', title: 'AO/OTA' },
    { id: 'mason-mayo', title: 'Mason (головка луча)' },
    { id: 'salter-harris', title: 'Salter-Harris (детские)' },
  ],
  relatedCourses: [
    { id: '302.2', title: 'Травматология' },
    { id: '300.4', title: 'Неотложная помощь' },
  ],
  reference: 'Frykman G. Fracture of the distal radius including sequelae—shoulder-hand-finger syndrome, disturbance in the distal radio-ulnar joint and impairment of nerve function. Acta Orthop Scand 1967;Suppl 108:1–153.',
  countries: 'Международный (исторический)',
  presets: [
    { label: 'Типичный Colles (пожилая, падение на руку)', values: { type: '1' } },
    { label: 'Colles + отрыв ulnar styloid', values: { type: '2' } },
    { label: 'Внутрисуставной с вовлечением DRUJ', values: { type: '5' } },
    { label: 'Сложный оскольчатый, оба сустава', values: { type: '8' } },
  ],
  info: `### Для чего используется
**Frykman (1967)** — классическая классификация переломов **дистального отдела лучевой кости**. Определяет вовлечение радиокарпального и радиоульнарного суставов + наличие перелома ulnar styloid.

### Логика классификации
**4 пары (I–II, III–IV, V–VI, VII–VIII)**, каждая пара различается только наличием перелома шиловидного локтевой:
- **Нечётные** — без ulnar styloid
- **Чётные** — с ulnar styloid

| Тип | RC сустав | RU сустав (DRUJ) | Ulnar styloid |
|---|---|---|---|
| I / II | — | — | — / + |
| III / IV | + | — | — / + |
| V / VI | — | + | — / + |
| VII / VIII | + | + | — / + |

### Альтернативные классификации
- **AO/OTA 2R3**: A (внесуставные), B (частично суставные), C (полностью суставные)
- **Fernandez (1993)**: по механизму (сгибание, сжатие, сдвиг, отрыв, комбинированный)
- **Melone (1984)**: фокус на lunate facet

### Хирургические показания (модифицированные Graham, Koval)
- Ступенька суставной поверхности > 2 мм
- Угол dorsal tilt > 10° (норма volar tilt 11°)
- Укорочение лучевой > 3 мм (radial shortening)
- Radial inclination < 15° (норма 22°)
- DRUJ нестабильность

### Типы имплантов
- **Volar locking plate (VLP)** — золотой стандарт
- **External fixator** — при сильной оскольчатости
- **Fragment-specific** — комбинированный dorsal + volar + radial styloid
- **K-wires** — простые внесуставные
- **Артроскопически-ассистированная редукция** — при суставных

### Осложнения
- CRPS (Sudeck) — 5–10%
- Median nerve (carpal tunnel) — 5%
- EPL rupture (1–2%, dorsal Lister tubercle)
- Пост-травматический ОА DRUJ / радиокарпального
- Malunion (dorsal angulation)

### Источник
Frykman G. *Acta Orthop Scand* 1967;Suppl 108:1.
`,
};

export default runner;
