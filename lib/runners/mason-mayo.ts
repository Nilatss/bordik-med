/** Runner: mason-mayo - Mason (1954) + Mayo/Broberg-Morrey radial head fracture classification */
import type { ScoreTool } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 4,
  inputs: [
    {
      id: 'type',
      label: 'Тип перелома головки лучевой кости',
      type: 'select',
      options: [
        { value: '1', label: 'Mason I - несмещённый (<2 мм)', points: 1 },
        { value: '2', label: 'Mason II - смещённый < 2 мм или угол > 30°, частичный суставной', points: 2 },
        { value: '3', label: 'Mason III - оскольчатый перелом всей головки', points: 3 },
        { value: '4', label: 'Mason IV - перелом + вывих локтя (Johnston 1962)', points: 4 },
      ],
    },
  ],
  bands: [
    {
      min: 1, max: 1, label: 'Mason I', color: '#22C55E',
      description: 'Несмещённый / минимально смещённый. Консервативно.',
      actions: [
        'Слинг 2-5 дней, ранняя активная мобилизация',
        'Аспирация гематомы + лидокаин (обезболивание, улучшает ROM)',
        'Рентген-контроль через 1 и 2 нед',
        'Полная ROM обычно к 6 нед',
      ],
    },
    {
      min: 2, max: 2, label: 'Mason II', color: '#84CC16',
      description: 'Частичный суставной перелом со смещением. Решение зависит от блока движения.',
      details: 'Блок ротации/сгибания → ORIF. Без блока - консервативно или ORIF по выбору.',
      actions: [
        'Тест блока движения под анестезией / аспирация',
        'Без блока - консервативно (слинг, ранняя ROM)',
        'С блоком или смещением > 2 мм и фрагментом > 25% - ORIF (headless screws)',
        'Mayo / Broberg-Morrey оценивает стабильность и необходимость ORIF',
      ],
    },
    {
      min: 3, max: 3, label: 'Mason III', color: '#F59E0B',
      description: 'Оскольчатый перелом всей головки. Реконструкция или замена.',
      actions: [
        'Если possible reconstruction (< 3 фрагментов) - ORIF',
        'Иначе - резекция головки (изолированный) ИЛИ радиальная артропластика (при сопутствующей нестабильности)',
        'НИКОГДА не резецировать при Essex-Lopresti или вывихе локтя (без артропластики)',
      ],
    },
    {
      min: 4, max: 4, label: 'Mason IV', color: '#EF4444',
      description: 'Перелом головки + вывих локтя. «Terrible triad» при + coronoid + LCL.',
      details: 'Johnston (1962) добавил тип IV. Часто ассоциирован с terrible triad (radial head + coronoid + LCL + вывих).',
      actions: [
        'Редукция вывиха под анестезией',
        'КТ - оценка coronoid, capitellum',
        'ORIF или радиальная артропластика (если non-reconstructable)',
        'Восстановление LCL, coronoid при terrible triad',
        'Шарнирный внешний фиксатор при остаточной нестабильности',
      ],
    },
  ],
  caveats: [
    'Mayo / Broberg-Morrey (1987) - подтип Mason II: IIa (стабильный) vs IIb (нестабильный) - требует ORIF',
    'Hotchkiss (1997) модификация - наиболее применимая клинически (учитывает блок движения)',
    'Essex-Lopresti injury - перелом головки + разрыв interosseous membrane + DRUJ повреждение - НИКОГДА не резецировать головку без замены',
    'Radial head arthroplasty (RHA) - при non-reconstructable переломах, особенно при нестабильности локтя',
    'При изолированной резекции головки - риск вальгусной нестабильности и Essex-Lopresti',
  ],
  related: [
    { id: 'frykman', title: 'Frykman (дистальный луч)' },
    { id: 'ao-ota', title: 'AO/OTA' },
    { id: 'gustilo', title: 'Gustilo (если открытый)' },
  ],
  relatedCourses: [
    { id: '302.2', title: 'Травматология' },
    { id: '300.4', title: 'Неотложная помощь' },
  ],
  reference: 'Mason ML. Some observations on fractures of the head of the radius with a review of one hundred cases. Br J Surg 1954;42:123-32. Broberg MA, Morrey BF. Results of delayed excision of the radial head after fracture. J Bone Joint Surg Am 1986;68:669. Johnston GW. Ulster Med J 1962;31:51. Hotchkiss RN. J Am Acad Orthop Surg 1997;5:1.',
  countries: 'Международный',
  presets: [
    { label: 'Падение на вытянутую руку, нет смещения', values: { type: '1' } },
    { label: 'Смещение 3 мм, блок супинации', values: { type: '2' } },
    { label: 'Оскольчатый перелом всей головки', values: { type: '3' } },
    { label: 'Terrible triad локтя', values: { type: '4' } },
  ],
  info: `### Для чего используется
**Mason (1954)** - классификация переломов **головки лучевой кости**, наиболее часто повреждаемой структуры локтя у взрослых (~30% переломов локтя). **Mayo / Broberg-Morrey (1986)** и **Hotchkiss (1997)** - современные модификации, ориентированные на лечение.

### Типы (Mason + Hotchkiss)
| Тип | Описание | Лечение |
|---|---|---|
| **I** | Несмещённый < 2 мм | Консервативно |
| **II** | Смещённый > 2 мм, частичный суставной, без блока | Консервативно или ORIF |
| **II + блок** | Mechanical block ротации | ORIF |
| **III** | Оскольчатый всей головки | ORIF или артропластика |
| **IV** (Johnston) | Перелом + вывих локтя | Редукция + ORIF/RHA |

### Mayo / Broberg-Morrey (1987)
- **Тип I** - несмещённый или минимальный
- **Тип II** - смещённый, стабильный
- **Тип III** - смещённый, нестабильный (валгусная / варусная / задняя нестабильность)

### Hotchkiss (1997) - тактика
- **Тип I**: консервативно
- **Тип II**: ORIF при mechanical block или > 2 мм смещения
- **Тип III**: ORIF если реконструируемый; иначе RHA (не простая резекция при нестабильности)

### Сопутствующие повреждения
- **Terrible triad**: radial head + coronoid + LCL + задний вывих
- **Essex-Lopresti**: radial head + IOM + DRUJ
- **Monteggia-like**: radial head + ulna + radiocapitellar

### Красные флаги перед резекцией
- Вальгусная нестабильность
- DRUJ боль / нестабильность (Essex-Lopresti)
- MCL повреждение
- Coronoid перелом
→ При наличии - **радиальная артропластика вместо резекции**

### Реабилитация
- Mason I: ROM с 2-5 дня
- Mason II (post-ORIF): шина 3-5 дней, активная ROM
- Mason III-IV: защитная шина 1-2 нед, затем ROM

### Источник
Mason ML. *Br J Surg* 1954;42:123. Broberg MA, Morrey BF. *J Bone Joint Surg Am* 1986;68:669. Hotchkiss RN. *J Am Acad Orthop Surg* 1997;5:1.
`,
};

export default runner;
