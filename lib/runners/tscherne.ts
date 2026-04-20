// @ts-nocheck
/** Runner: tscherne - Tscherne-Oestern classification of soft tissue injury (1982) */
import type { ScoreTool } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 7,
  inputs: [
    {
      id: 'grade',
      label: 'Степень повреждения мягких тканей',
      type: 'select',
      options: [
        { value: '0', label: 'C0 - закрытый, минимальные повреждения мягких тканей', points: 0 },
        { value: '1', label: 'C1 - закрытый, поверхностная ссадина/ушиб от отломка', points: 1 },
        { value: '2', label: 'C2 - закрытый, глубокий ушиб кожи/мышцы, угроза компартмент-синдрома', points: 2 },
        { value: '3', label: 'C3 - закрытый, обширное размозжение, decollement, manifest compartment syndrome / сосудистое повреждение', points: 3 },
        { value: '4', label: 'O1 - открытый, прокол изнутри, минимальная контаминация', points: 4 },
        { value: '5', label: 'O2 - открытый, рана >1 снаружи, умеренная контузия мягких тканей', points: 5 },
        { value: '6', label: 'O3 - открытый, тяжёлое повреждение мягких тканей + сосудов/нервов', points: 6 },
        { value: '7', label: 'O4 - открытый, субтотальная/тотальная ампутация', points: 7 },
      ],
    },
  ],
  bands: [
    {
      min: 0, max: 1, label: 'C0', color: '#22C55E',
      description: 'Закрытый перелом, минимальное повреждение мягких тканей (чаще непрямой механизм, simple fracture pattern).',
      actions: ['Ранняя окончательная остеосинтез, как правило без задержки'],
    },
    {
      min: 1, max: 2, label: 'C1', color: '#84CC16',
      description: 'Поверхностная ссадина/ушиб кожи от костного фрагмента изнутри. Умеренная тяжесть перелома.',
      actions: ['Возможна ранняя внутренняя фиксация при стабильном status мягких тканей (симптом «морщин»)'],
    },
    {
      min: 2, max: 3, label: 'C2', color: '#F59E0B',
      description: 'Глубокий, загрязнённый ушиб кожи или мышц от прямой травмы. Риск компартмент-синдрома.',
      actions: [
        'Мониторинг компартмент-давлений',
        'Отсрочка внутренней фиксации до спадения отёка (чаще ≥ 7-10 дней)',
        'Рассмотреть временный external fixation',
      ],
    },
    {
      min: 3, max: 3, label: 'C3', color: '#EF4444',
      description: 'Обширное размозжение / decollement / manifest компартмент-синдром / сосудистое повреждение. Высокая энергия.',
      details: 'Staged management по принципу damage control orthopedics.',
      actions: [
        'Фасциотомия при компартмент-синдроме',
        'External fixation + отсроченная внутренняя фиксация',
        'Pulse check, ABI, при необходимости CT-ангиография',
      ],
    },
    {
      min: 4, max: 5, label: 'O1', color: '#F59E0B',
      description: 'Открытый, «inside-out», < 1 см рана, минимальная контаминация. Аналог Gustilo I.',
      actions: ['Цефазолин, ХО, возможна ранняя внутренняя фиксация'],
    },
    {
      min: 5, max: 6, label: 'O2', color: '#F97316',
      description: 'Открытый, > 1 см, умеренный ушиб окружающих тканей. Аналог Gustilo II.',
      actions: ['Цефазолин, ХО в течение 24 ч, наружная или окончательная фиксация по состоянию тканей'],
    },
    {
      min: 6, max: 7, label: 'O3', color: '#EF4444',
      description: 'Обширное повреждение кожи/мышц + сосудов/нервов. Аналог Gustilo IIIA/IIIB.',
      actions: ['Цеф + гентамицин', 'Срочная ХО, внешняя фиксация', 'Совместно с пластиками, оценка реваскуляризации'],
    },
    {
      min: 7, max: 7, label: 'O4', color: '#991B1B',
      description: 'Субтотальная / тотальная ампутация. Аналог Gustilo IIIC + ампутационный уровень.',
      actions: ['Реплантация vs ампутация по MESS', 'Массивная трансфузия, trauma team activation'],
    },
  ],
  caveats: [
    'Оценка ретроспективная после полного осмотра (часто окончательно - в операционной)',
    'Для открытых переломов чаще используется Gustilo-Anderson; Tscherne - единственная валидная для ЗАКРЫТЫХ',
    'C3 - показание к damage control: external fix → delayed ORIF',
    'Комбинация с AO/OTA - Tscherne описывает мягкие ткани, AO - кость',
  ],
  related: [
    { id: 'gustilo', title: 'Gustilo-Anderson (открытые)' },
    { id: 'ao-ota', title: 'AO/OTA 2018' },
    { id: 'iss', title: 'ISS' },
  ],
  relatedCourses: [
    { id: '302.2', title: 'Травматология' },
    { id: '300.4', title: 'Неотложная помощь' },
  ],
  reference: 'Tscherne H, Oestern HJ. A new classification of soft tissue damage in open and closed fractures. Unfallheilkunde 1982;85:111-5. Oestern HJ, Tscherne H. Pathophysiology and classification of soft tissue injuries associated with fractures. In: Fractures with Soft Tissue Injuries. Springer, 1984.',
  countries: 'Европа (Германия, Австрия, Швейцария - стандарт)',
  presets: [
    { label: 'Простой закрытый перелом лодыжки', values: { grade: '0' } },
    { label: 'Закрытый перелом б/б с риском компартмента', values: { grade: '2' } },
    { label: 'Открытый перелом с сосудистым повреждением', values: { grade: '6' } },
  ],
  info: `### Для чего используется
**Tscherne-Oestern (1982)** - классификация **повреждения мягких тканей** при переломах. В отличие от Gustilo (только открытые), охватывает КАК закрытые, ТАК и открытые травмы. Используется для выбора тактики (ранняя внутренняя vs staged external fixation → ORIF).

### Закрытые переломы (Geschlossene Fraktur)
| Степень | Описание |
|---|---|
| **C0** | Минимальное повреждение мягких тканей, непрямой механизм, простой перелом |
| **C1** | Поверхностный abrasion от внутреннего фрагмента, лёгкий-умеренный перелом |
| **C2** | Глубокий ушиб кожи/мышцы, прямой механизм, сегментарный или оскольчатый перелом. Риск компартмент-синдрома |
| **C3** | Обширное размозжение, decollement, манифестный компартмент-синдром, сосудистое повреждение, subcutaneous avulsion. High-energy |

### Открытые переломы (Offene Fraktur)
| Степень | Gustilo-эквивалент | Описание |
|---|---|---|
| **O1** | I | Прокол изнутри, < 1 см, минимальная контаминация |
| **O2** | II | Рана > 1 см, умеренный ушиб окружающих тканей |
| **O3** | IIIA/B | Обширное повреждение, отслойка, сосуд/нерв |
| **O4** | IIIC + | Субтотальная/тотальная ампутация |

### Клинические подсказки
- **Симптом морщин (wrinkle sign)** - возврат морщин кожи → отёк спал → можно оперировать (обычно 7-10 дней для C2)
- **Fracture blisters** (filled vs haemorrhagic) - противопоказание к разрезу через этот участок
- **Компартмент-давление ΔP < 30 мм рт. ст. от ДАД** → фасциотомия

### Стратегия
| Tscherne | Тактика |
|---|---|
| C0-C1 | Раннее окончательное ORIF |
| C2 | External fix → отсрочка 7-14 дней → ORIF |
| C3, O3, O4 | Damage control: external fix + soft tissue management → ORIF/flap |

### Источник
Tscherne H, Oestern HJ. *Unfallheilkunde* 1982;85:111.
`,
};

export default runner;
