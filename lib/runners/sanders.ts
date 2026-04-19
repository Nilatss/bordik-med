// @ts-nocheck
/** Runner: sanders — Sanders CT classification of calcaneus fractures (1993) */
import type { ScoreTool } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 4,
  inputs: [
    {
      id: 'type',
      label: 'Тип по КТ (коронарная проекция задней суставной фасетки)',
      type: 'select',
      options: [
        { value: '1', label: 'I — несмещённый (< 2 мм), независимо от числа линий', points: 1 },
        { value: '2', label: 'II — 2-фрагментный (A, B или C по положению линии)', points: 2 },
        { value: '3', label: 'III — 3-фрагментный (AB, AC, BC)', points: 3 },
        { value: '4', label: 'IV — 4-фрагментный оскольчатый', points: 4 },
      ],
    },
  ],
  bands: [
    {
      min: 1, max: 1, label: 'Sanders I', color: '#22C55E',
      description: 'Несмещённый (< 2 мм). Консервативное лечение.',
      actions: [
        'Иммобилизация без нагрузки 8–12 нед',
        'Elevation, ice, компрессия первые 2 нед',
        'Ранняя ROM голеностопа / подтаранного сустава',
        'Постепенная нагрузка с 8 нед',
      ],
    },
    {
      min: 2, max: 2, label: 'Sanders II', color: '#84CC16',
      description: '2-фрагментный: линия проходит через латеральную (A), среднюю (B) или медиальную (C) треть.',
      details: 'IIA — наружная линия; IIB — центральная; IIC — медиальная (ближе к sustentaculum tali).',
      actions: [
        'ORIF через расширенный латеральный доступ или sinus tarsi (минимально инвазивный)',
        'Восстановление Böhler angle (20–40°) и Gissane angle (100–130°)',
        'Хорошие функциональные результаты (~80%)',
      ],
    },
    {
      min: 3, max: 3, label: 'Sanders III', color: '#F59E0B',
      description: '3-фрагментный (AB, AC, BC). Более сложная репозиция.',
      actions: [
        'ORIF с реконструкцией задней суставной фасетки',
        'Латеральная пластина + subchondral screws',
        'Возможна артроскопическая ассистенция',
        'Функциональные результаты ~60–70%',
      ],
    },
    {
      min: 4, max: 4, label: 'Sanders IV', color: '#EF4444',
      description: '4-фрагментный оскольчатый. Высокая частота subtalar ОА.',
      details: 'Рассмотреть первичный подтаранный артродез, особенно у курильщиков / диабетиков / при impaction.',
      actions: [
        'ORIF + первичный подтаранный артродез (primary subtalar fusion) — лучший функциональный исход по Buckley',
        'У высокого риска (диабет, курение, open) — минимально инвазивный или только артродез',
        'Функциональные результаты ~30–50% без артродеза',
      ],
    },
  ],
  caveats: [
    'Essex-Lopresti (1952) — 2 типа: tongue-type (горизонтальная линия) и joint depression (задняя фасетка продавлена) — используется параллельно',
    'Böhler angle норма 20–40°; Gissane angle 100–130°',
    'Open fracture, компартмент-синдром стопы, blistering кожи — показания к внешней фиксации / отсрочке ORIF',
    'Wound complications при ELA доступе — 10–25%; sinus tarsi approach снижает до < 5%',
    'Курение и диабет — значительные факторы риска несращения и инфекции',
    'Билатеральные переломы пяточной кости — поиск перелома позвоночника (до 10%, особенно L1)',
  ],
  related: [
    { id: 'hawkins', title: 'Hawkins (таранная)' },
    { id: 'weber', title: 'Weber (лодыжка)' },
    { id: 'ao-ota', title: 'AO/OTA' },
  ],
  relatedCourses: [
    { id: '302.2', title: 'Травматология' },
    { id: '300.4', title: 'Неотложная помощь' },
  ],
  reference: 'Sanders R, Fortin P, DiPasquale T, Walling A. Operative treatment in 120 displaced intraarticular calcaneal fractures. Results using a prognostic computed tomography scan classification. Clin Orthop Relat Res 1993;290:87–95. Essex-Lopresti P. The mechanism, reduction technique, and results in fractures of the os calcis. Br J Surg 1952;39:395.',
  countries: 'Международный',
  presets: [
    { label: 'Падение с высоты, несмещённый', values: { type: '1' } },
    { label: 'Joint depression, 2 фрагмента', values: { type: '2' } },
    { label: '3-фрагментный, impaction задней фасетки', values: { type: '3' } },
    { label: 'Оскольчатый + пациент-курильщик → primary fusion', values: { type: '4' } },
  ],
  info: `### Для чего используется
**Sanders (1993)** — **КТ-классификация** переломов пяточной кости, определяющая число фрагментов задней суставной фасетки и прогноз. Коронарная проекция — ключевая.

### Как считать фрагменты
На коронарном срезе через самую широкую часть задней фасетки проведите линии:
- **A** — латеральная треть
- **B** — центральная треть
- **C** — медиальная треть (ближе к sustentaculum tali)

Число и положение линий даёт тип:
| Тип | Фрагменты |
|---|---|
| **I** | Несмещённый (< 2 мм), любое число линий |
| **II** | 2 части: IIA, IIB, IIC |
| **III** | 3 части: IIIAB, IIIAC, IIIBC |
| **IV** | ≥ 4 части (оскольчатый) |

### Essex-Lopresti (1952) — исторически
- **Tongue-type** — горизонтальная линия через tuber + задняя фасетка (фрагмент «язык» вверх)
- **Joint depression** — вертикальная линия, задняя фасетка продавлена в тело
Современно используется вместе с Sanders, особенно для выбора доступа.

### Ключевые углы (рентгенометрия)
- **Böhler angle** (20–40°) — уменьшение = impaction
- **Gissane angle / crucial angle** (100–130°) — увеличение = impaction
- **Высота пяточной** — укорочение приводит к hindfoot varus

### Хирургические доступы
- **ELA (Extended Lateral Approach)** — золотой стандарт, но 10–25% wound complications
- **Sinus tarsi (STA)** — минимально инвазивный, снижает осложнения до < 5%, лучше при blistering
- **Percutaneous / balloon reduction** — простые tongue-type

### Показания к первичному подтаранному артродезу
- Sanders IV
- Диабет, курение, пожилой возраст
- Impaction задней фасетки > 50%
- Buckley RCT (2014): при Sanders IV — primary fusion даёт лучший функциональный исход

### Ассоциированные повреждения
- Перелом позвоночника (L1 классически) — до 10%, особенно при билатеральных
- Контралатеральный calcaneus
- Компартмент-синдром стопы (центральный компартмент) — 10%

### Осложнения
- Subtalar ОА — 40–50% (III–IV)
- Wound breakdown — см. доступ
- Sural nerve injury (ELA)
- Chronic heel pain, peroneal tendon impingement

### Источник
Sanders R et al. *Clin Orthop Relat Res* 1993;290:87. Essex-Lopresti P. *Br J Surg* 1952;39:395.
`,
};

export default runner;
