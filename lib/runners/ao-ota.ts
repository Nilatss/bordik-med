// @ts-nocheck
/** Runner: ao-ota — AO/OTA Fracture and Dislocation Classification Compendium (2018) */
import type { CalculatorTool } from '../tools-runners';

const BONES = [
  { value: '1', label: '1 — плечевая (humerus)' },
  { value: '2', label: '2 — лучевая/локтевая (radius/ulna)' },
  { value: '3', label: '3 — бедренная (femur)' },
  { value: '4', label: '4 — большеберцовая/малоберцовая (tibia/fibula)' },
];
const SEGMENTS = [
  { value: '1', label: '1 — проксимальный сегмент' },
  { value: '2', label: '2 — диафиз' },
  { value: '3', label: '3 — дистальный сегмент' },
];
const TYPES_DIAPHYSIS = [
  { value: 'A', label: 'A — простой (simple, 1 линия)' },
  { value: 'B', label: 'B — клиновидный (wedge / butterfly)' },
  { value: 'C', label: 'C — сложный (complex / multifragmentary)' },
];
const TYPES_END = [
  { value: 'A', label: 'A — внесуставной (extra-articular)' },
  { value: 'B', label: 'B — частично внутрисуставной (partial articular)' },
  { value: 'C', label: 'C — полный внутрисуставной (complete articular)' },
];
const GROUPS = [
  { value: '1', label: '1 (наименее тяжёлый)' },
  { value: '2', label: '2' },
  { value: '3', label: '3 (наиболее тяжёлый)' },
];

const BONE_NAMES: Record<string, string> = { '1': 'плечевая', '2': 'radius/ulna', '3': 'бедренная', '4': 'tibia/fibula' };

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'bone', label: 'Кость', type: 'select', options: BONES },
    { id: 'segment', label: 'Сегмент', type: 'select', options: SEGMENTS },
    { id: 'type', label: 'Тип', type: 'select', options: [
      { value: 'A', label: 'A' },
      { value: 'B', label: 'B' },
      { value: 'C', label: 'C' },
    ] },
    { id: 'group', label: 'Группа', type: 'select', options: GROUPS },
  ],
  compute: (v) => {
    const bone = String(v.bone || '1');
    const segment = String(v.segment || '2');
    const type = String(v.type || 'A');
    const group = String(v.group || '1');
    const code = `${bone}${segment}-${type}${group}`;
    const boneName = BONE_NAMES[bone] ?? '';
    const segName = segment === '1' ? 'проксимальный' : segment === '2' ? 'диафизарный' : 'дистальный';

    let morph = '';
    if (segment === '2') {
      morph = type === 'A' ? 'простой' : type === 'B' ? 'клиновидный' : 'сложный (multifragmentary)';
    } else {
      morph = type === 'A' ? 'внесуставной' : type === 'B' ? 'частично внутрисуставной' : 'полный внутрисуставной';
    }

    let interpretation = ''; let color = '#22C55E'; let details = ''; let actions: string[] = [];
    if (type === 'A') {
      interpretation = `${boneName}, ${segName}, ${morph} (${code})`;
      color = '#22C55E';
      details = segment === '2'
        ? 'Простая линия перелома, один излом. В большинстве случаев — хороший прогноз.'
        : 'Внесуставной перелом. Суставная поверхность интактна.';
      actions = ['ORIF по показаниям / консерв.', 'AP + боковая рентгенограмма', 'КТ при сомнениях в суставной поверхности'];
    } else if (type === 'B') {
      interpretation = `${boneName}, ${segName}, ${morph} (${code})`;
      color = '#F59E0B';
      details = segment === '2'
        ? 'Клиновидный с фрагментом-бабочкой. После репозиции возможно восстановление кортикальных контактов.'
        : 'Частично внутрисуставной — часть суставной поверхности связана с диафизом.';
      actions = ['ORIF с минимально инвазивной техникой / LCP', 'КТ для планирования при внутрисуставном'];
    } else {
      interpretation = `${boneName}, ${segName}, ${morph} (${code})`;
      color = '#EF4444';
      details = segment === '2'
        ? 'Сложный перелом, многофрагментарный. Часто требует моста или внешней фиксации.'
        : 'Полный внутрисуставной — метафиз полностью отделён от суставной поверхности, требует анатомичной редукции.';
      actions = ['ORIF с анатомичной редукцией суставной поверхности', 'КТ обязательна', 'Staged ext-fix → ORIF при плохих мягких тканях'];
    }
    if (group === '3') {
      interpretation += ' [наиболее тяжёлая группа]';
      actions.push('Высокая степень фрагментации или смещения — планирование через 3D CT');
    }

    return {
      value: code,
      unit: 'AO/OTA',
      interpretation,
      color,
      details,
      actions,
      caveats: [
        'Полный код: [Bone][Segment]-[Type][Group].[Subgroup] — например 32-A3.2',
        'Сегмент 4 (дистальный) обозначает лодыжку для б/б (44) и трохантерный регион для бедра (31)',
        'Используется для Trauma Register, OTA research database',
        'Дополнительные qualifications: open/closed, neurovascular, skin, muscle, bone loss',
        '2018 update — расширил paediatric + spine, craniomaxillofacial, hand/foot',
      ],
      related: [
        { id: 'gustilo', title: 'Gustilo (открытые)' },
        { id: 'tscherne', title: 'Tscherne (мягкие ткани)' },
        { id: 'garden', title: 'Garden (шейка бедра)' },
        { id: 'weber', title: 'Weber (лодыжка)' },
        { id: 'schatzker', title: 'Schatzker (плато)' },
        { id: 'neer', title: 'Neer (проксим. плечевая)' },
        { id: 'salter-harris', title: 'Salter-Harris (физис)' },
      ],
      relatedCourses: [
        { id: '302.2', title: 'Травматология' },
        { id: '300.4', title: 'Неотложная помощь' },
      ],
    };
  },
  reference: 'Meinberg EG, Agel J, Roberts CS, Karam MD, Kellam JF. Fracture and Dislocation Classification Compendium—2018. J Orthop Trauma 2018;32(Suppl 1):S1–S170.',
  countries: 'Международный (AO Foundation + Orthopaedic Trauma Association)',
  presets: [
    { label: '32-A3 — простой поперечный перелом диафиза бедра', values: { bone: '3', segment: '2', type: 'A', group: '3' } },
    { label: '31-A1 — внесуставной трохантерный (вертельный)', values: { bone: '3', segment: '1', type: 'A', group: '1' } },
    { label: '43-C3 — пилон с полным внутрисуставным', values: { bone: '4', segment: '3', type: 'C', group: '3' } },
    { label: '22-B2 — предплечье, клиновидный', values: { bone: '2', segment: '2', type: 'B', group: '2' } },
    { label: '11-A1 — проксим. плечевая, 1-part Neer', values: { bone: '1', segment: '1', type: 'A', group: '1' } },
  ],
  info: `### Для чего используется
**AO/OTA Fracture and Dislocation Classification Compendium (2018)** — универсальная алфавитно-цифровая классификация переломов длинных костей. Совместная разработка AO Foundation (Швейцария) и Orthopaedic Trauma Association (США). Стандарт для научных исследований и trauma registries.

### Структура кода
\`[Кость][Сегмент]-[Тип][Группа].[Подгруппа]\`

Пример: **32-A3.2** = бедренная кость (3), диафиз (2), простой (A), поперечный (3), косой субподгруппы (.2).

### Кости
| Код | Кость |
|---|---|
| 1 | Humerus |
| 2 | Radius / Ulna |
| 3 | Femur |
| 4 | Tibia / Fibula |
| 5 | Позвоночник |
| 6 | Таз |
| 7 | Кисть |
| 8 | Стопа |
| 9 | Лицевой скелет |

### Сегменты (long bones)
| Код | Сегмент |
|---|---|
| 1 | Проксимальный (метаэпифизарный) |
| 2 | Диафиз |
| 3 | Дистальный (метаэпифизарный) |
| 4 | Лодыжечный (tibia) / трохантерный (femur) |

### Типы для ДИАФИЗА
| Тип | Название | Описание |
|---|---|---|
| A | Simple | Одна линия перелома (спиральная A1, косая A2, поперечная A3) |
| B | Wedge | Есть фрагмент-бабочка, но после редукции кортикальный контакт |
| C | Complex | Нет кортикального контакта после редукции (multifragmentary) |

### Типы для КОНЦОВ (проксим./дистал.)
| Тип | Название |
|---|---|
| A | Extra-articular |
| B | Partial articular (одна часть сустава связана с диафизом) |
| C | Complete articular (метафиз полностью отделён) |

### Группы (1–3)
Внутри каждого типа — подробная морфологическая градация от наименее к наиболее тяжёлому (винтовой, косой, поперечный для A; wedge intact/fragmented/etc.).

### Применение
- Trauma registries (NTDB, TARN, MTCR)
- Планирование ORIF (implant selection по пластинам AO)
- Клинические исследования: RCT-inclusion criteria
- Обучение в AO courses

### Ограничения
- Высокая сложность, низкая inter-observer reliability для подгрупп
- Для конкретных локализаций (шейка бедра, лодыжка, плато) практикующие хирурги используют привычные имена: Garden, Weber, Schatzker, Neer
- Не учитывает мягкие ткани (сопоставляйте с Tscherne / Gustilo)

### Источник
Meinberg EG et al. *J Orthop Trauma* 2018;32(Suppl 1):S1–S170.
`,
};

export default runner;
