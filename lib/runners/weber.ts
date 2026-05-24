/** Runner: weber - Weber / Danis-Weber classification of ankle fractures */
import type { ScoreTool } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 3,
  inputs: [
    {
      id: 'type',
      label: 'Уровень перелома малоберцовой кости относительно синдесмоза',
      type: 'select',
      options: [
        { value: '1', label: 'A - ниже синдесмоза (below)', points: 1 },
        { value: '2', label: 'B - на уровне синдесмоза (at)', points: 2 },
        { value: '3', label: 'C - выше синдесмоза (above)', points: 3 },
      ],
    },
  ],
  bands: [
    {
      min: 1, max: 1, label: 'Weber A', color: '#22C55E',
      description: 'Перелом ниже синдесмоза. Синдесмоз интактен. Стабильный перелом.',
      details: 'Механизм: супинация-аддукция (Lauge-Hansen SA). Часто изолированный отрыв верхушки латеральной лодыжки.',
      actions: [
        'Консервативное ведение в подавляющем большинстве случаев',
        'Иммобилизация (гипс / ортез) 4-6 недель',
        'Осевая нагрузка по переносимости',
      ],
    },
    {
      min: 2, max: 2, label: 'Weber B', color: '#F59E0B',
      description: 'Перелом на уровне синдесмоза. Стабильность вариабельна - зависит от delatoid ligament и медиальной лодыжки.',
      details: 'Механизм: supination-external rotation (SER) - самый частый тип (~70% всех переломов лодыжки).',
      actions: [
        'Определить стабильность: gravity stress test или внешняя ротация под рентгеном',
        'Стабильный (изолированный Weber B без медиального повреждения): консервативно',
        'Нестабильный (bimalleolar equivalent, talar shift > 2 мм): ORIF пластиной',
      ],
    },
    {
      min: 3, max: 3, label: 'Weber C', color: '#EF4444',
      description: 'Перелом выше синдесмоза. Синдесмоз обязательно повреждён. НЕСТАБИЛЬНЫЙ перелом.',
      details: 'Механизм: пронация-внешняя ротация (PER) или пронация-абдукция (PAB). Включает Maisonneuve (высокий перелом fibula с разрывом синдесмоза).',
      actions: [
        'ORIF - пластина fibula + восстановление синдесмоза',
        'Syndesmotic screw (1-2 кортикальных винта) или TightRope',
        'Проверить проксимальный fibula - классический Maisonneuve при боли в проксимальной голени',
      ],
    },
  ],
  caveats: [
    'Weber не учитывает медиальное повреждение (deltoid ligament vs medial malleolus)',
    'Нестабильность определяется не уровнем fibula, а состоянием медиальной стороны + синдесмоза',
    'Talar shift > 2 мм на mortise view = нестабильный, показан ORIF',
    'Maisonneuve - всегда пальпировать проксимальный fibula при изолированной медиальной травме',
    'Lauge-Hansen более механистична, но сложнее в повседневной практике',
  ],
  related: [
    { id: 'ao-ota', title: 'AO/OTA (44A/B/C)' },
    { id: 'ottawa-ankle', title: 'Ottawa Ankle Rules' },
    { id: 'gustilo', title: 'Gustilo (если открытый)' },
  ],
  relatedCourses: [
    { id: '302.2', title: 'Травматология' },
    { id: '300.4', title: 'Неотложная помощь' },
  ],
  reference: 'Weber BG. Die Verletzungen des oberen Sprunggelenkes. Bern: Hans Huber, 1966. Danis R. Les fractures malléolaires. In: Théorie et pratique de l’ostéosynthèse. Liège: Desoer, 1949. Lauge-Hansen N. Fractures of the ankle. II. Combined experimental-surgical and experimental-roentgenologic investigations. Arch Surg 1950;60:957.',
  countries: 'Международный',
  presets: [
    { label: 'Weber A - отрыв верхушки латеральной лодыжки', values: { type: '1' } },
    { label: 'Weber B с talar shift', values: { type: '2' } },
    { label: 'Maisonneuve (Weber C)', values: { type: '3' } },
  ],
  info: `### Для чего используется
**Danis-Weber (1949/1966)** - анатомическая классификация переломов лодыжек по **уровню перелома малоберцовой кости** относительно синдесмоза. Определяет вероятность повреждения синдесмоза и выбор тактики.

### Типы
| Тип | Уровень | Синдесмоз | Механизм | Стабильность |
|---|---|---|---|---|
| **A** | Ниже синдесмоза | Интактен | Supination-adduction (SA) | Стабильный |
| **B** | На уровне синдесмоза | Часто повреждён | Supination-external rotation (SER) | Вариабельна |
| **C** | Выше синдесмоза | Обязательно повреждён | Pronation-external rotation (PER) / Pronation-abduction (PAB) | НЕСТАБИЛЬНЫЙ |

### Lauge-Hansen (1950)
Кинематическая классификация: положение стопы + направление силы.
| Пара | Стадии |
|---|---|
| **SA** (supination-adduction) | I - поперечный fibula ниже plafond; II - вертикальный медиальный |
| **SER** (supination-external rotation) | I - разрыв AITFL; II - спиральный fibula; III - разрыв PITFL или задний маллеолюс; IV - медиальный маллеолюс или deltoid |
| **PAB** (pronation-abduction) | I - медиальный; II - синдесмоз; III - поперечный/оскольчатый fibula выше |
| **PER** (pronation-external rotation) | I - медиальный; II - AITFL; III - высокий fibula; IV - PITFL/задний |

### Критерии нестабильности
- Talar shift > 2 мм на mortise view
- Медиальный clear space > medial joint space
- Bimalleolar или trimalleolar
- Положительный gravity stress test
- Синдесмотический tenderness + squeeze test

### Тактика
| Тип | Тактика |
|---|---|
| Weber A | Функциональное лечение, гипс 4-6 нед |
| Weber B стабильный | Консервативно |
| Weber B нестабильный | ORIF (lag screw + neutralization plate) |
| Weber C | ORIF + восстановление синдесмоза (screw / TightRope) |
| Trimalleolar | + задний маллеолюс, если > 25% surface или talar subluxation |

### Ограничения
- Не описывает медиальное повреждение → нужна корректировка по Lauge-Hansen
- Не учитывает задний маллеолюс (Haraguchi / Bartoníček classifications)
- Maisonneuve - fibula fracture проксимально, классифицируется как Weber C с разрывом синдесмоза

### Источник
Weber BG. *Die Verletzungen des oberen Sprunggelenkes* (1966). Danis R. *Théorie et pratique de l'ostéosynthèse* (1949).
`,
};

export default runner;
