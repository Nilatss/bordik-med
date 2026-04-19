// @ts-nocheck
/** Runner: neer — Neer 4-part classification of proximal humerus fractures (1970) */
import type { ScoreTool } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 5,
  inputs: [
    {
      id: 'parts',
      label: 'Количество смещённых частей (смещение > 1 см или угловое > 45°)',
      type: 'select',
      options: [
        { value: '1', label: '1-part — несмещённый (или все смещения < 1 см / 45°)', points: 1 },
        { value: '2', label: '2-part — один фрагмент смещён', points: 2 },
        { value: '3', label: '3-part — два фрагмента смещены', points: 3 },
        { value: '4', label: '4-part — все 4 фрагмента смещены', points: 4 },
        { value: '5', label: 'Fracture-dislocation — перелом + вывих', points: 5 },
      ],
    },
  ],
  bands: [
    {
      min: 1, max: 2, label: '1-part', color: '#22C55E',
      description: '80% всех переломов проксимального отдела плеча. Несмещённый/минимально смещённый.',
      actions: [
        'Консервативное ведение: слинг 2–3 нед + ранняя пассивная ROM',
        'Рентген-контроль на 1-й и 2-й неделе (риск вторичного смещения)',
        'Функциональная реабилитация с 2–4 нед',
      ],
    },
    {
      min: 2, max: 3, label: '2-part', color: '#84CC16',
      description: 'Смещён один фрагмент. Чаще surgical neck или greater tuberosity.',
      actions: [
        'Хирургический шеечный 2-part: ORIF с пластиной/винтами или intramedullary nail',
        'Greater tuberosity > 5 мм смещения — ORIF винтами или cerclage',
        'У пожилых с низкими требованиями — консервативно',
      ],
    },
    {
      min: 3, max: 4, label: '3-part', color: '#F59E0B',
      description: 'Два смещённых фрагмента. Повышенный риск аваскулярного некроза головки (~25%).',
      actions: [
        'ORIF фиксированной угловой пластиной (locking plate)',
        'Ревезная артропластика (RSA) у пожилых с плохим качеством кости',
        'КТ для планирования',
      ],
    },
    {
      min: 4, max: 4, label: '4-part', color: '#EF4444',
      description: 'Все 4 фрагмента смещены. Риск AVN 35–50%.',
      details: 'Valgus-impacted 4-part — особый подтип с лучшим прогнозом (AVN ~10%) за счёт сохранённых medial periosteal soft tissues.',
      actions: [
        'Молодые (<65): ORIF с попыткой сохранить головку',
        'Пожилые (>65): reverse total shoulder arthroplasty (RSA) — предпочтительнее гемиартропластики по PROFHER',
        'Valgus-impacted — попытка ORIF даже у пожилых',
      ],
    },
    {
      min: 5, max: 5, label: 'Fracture-dislocation', color: '#991B1B',
      description: 'Перелом + вывих головки плечевой кости (передний > задний).',
      actions: [
        'Редукция вывиха обязательна',
        'ORIF при молодом пациенте; RSA при пожилом / 4-part',
        'Осмотр аксиллярного нерва (наиболее частое повреждение)',
      ],
    },
  ],
  caveats: [
    'Критерии Neer: смещение > 1 см или углообразование > 45° между фрагментами — иначе считается несмещённым',
    'Inter-observer reliability низкая (κ 0.3–0.5) — КТ улучшает',
    'Аксиллярный нерв повреждается в 30% случаев fracture-dislocation',
    'У пожилых RSA (reverse shoulder) показал лучшие функциональные результаты по сравнению с hemiarthroplasty',
    'PROFHER trial (JAMA 2015) — у пожилых смещённых 2-4 part консервативное = хирургии по исходу через 2 года',
  ],
  related: [
    { id: 'ao-ota', title: 'AO/OTA (11A/B/C)' },
    { id: 'rockwood', title: 'Rockwood (AC joint)' },
    { id: 'gustilo', title: 'Gustilo (если открытый)' },
  ],
  relatedCourses: [
    { id: '302.2', title: 'Травматология' },
    { id: '300.4', title: 'Неотложная помощь' },
  ],
  reference: 'Neer CS. Displaced proximal humeral fractures. I. Classification and evaluation. J Bone Joint Surg Am 1970;52:1077–89. Codman EA. The Shoulder: Rupture of the Supraspinatus Tendon and Other Lesions in or about the Subacromial Bursa. Boston: Thomas Todd, 1934.',
  countries: 'Международный',
  presets: [
    { label: 'Несмещённый проксимальный плечевой (1-part)', values: { parts: '1' } },
    { label: 'Смещённый greater tuberosity (2-part)', values: { parts: '2' } },
    { label: '4-part у пожилого → RSA', values: { parts: '4' } },
    { label: 'Передний вывих + перелом', values: { parts: '5' } },
  ],
  info: `### Для чего используется
**Neer (1970)** — классификация переломов **проксимального отдела плечевой кости**, основанная на анатомии Codman (1934). Определяет количество смещённых фрагментов и выбор между консервативным лечением, ORIF и артропластикой.

### 4 сегмента Codman
1. **Анатомическая шейка** (головка)
2. **Большой бугорок** (greater tuberosity) — место фиксации supraspinatus, infraspinatus, teres minor
3. **Малый бугорок** (lesser tuberosity) — subscapularis
4. **Хирургическая шейка** (метадиафизарная)

### Критерии смещения (Neer)
Фрагмент считается смещённым, если:
- Смещение > 1 см ИЛИ
- Угол между фрагментами > 45°

### Типы
| Тип | Смещённых частей | Частота | AVN |
|---|---|---|---|
| **1-part** | 0 | 80% | <5% |
| **2-part** | 1 | 10% | 5–10% |
| **3-part** | 2 | ~5% | 25% |
| **4-part** | 3 | ~3% | 35–50% (10% при valgus-impacted) |
| **Fracture-dislocation** | — | ~2% | — |

### 2-part подтипы
- Surgical neck (самый частый)
- Greater tuberosity (> 5 мм = ORIF)
- Lesser tuberosity (ассоциирован с задним вывихом!)
- Anatomical neck (редкий, высокий AVN)

### Факторы риска AVN
- 4-part (не valgus-impacted)
- Медиальный hinge / calcar < 8 мм
- Угловое смещение головки
- Связь с плохим исходом ORIF

### Обследование
- AP, scapular-Y, axillary views
- **КТ** для всех 3–4-part и fracture-dislocation
- ЭМГ при подозрении на повреждение axillary / plexus brachialis

### Тактика (BESS 2018, PROFHER 2015)
| Сценарий | Лечение |
|---|---|
| 1-part | Консервативно + ранняя ROM |
| 2-part surgical neck смещ. | ORIF locking plate / IMN |
| 2-part greater tuberosity >5 мм | ORIF |
| 3-part | ORIF (< 65) или RSA (> 65 с плохой костью) |
| 4-part не-valgus | RSA у пожилых, ORIF у молодых |
| Valgus-impacted 4-part | ORIF (relative AVN-sparing) |
| Fracture-dislocation | Redукция + ORIF или RSA |

### PROFHER Trial (JAMA 2015)
У пожилых со смещёнными 2–4-part переломами консервативное лечение показало эквивалентные функциональные исходы через 2 года по сравнению с хирургическим.

### Источник
Neer CS. *J Bone Joint Surg Am* 1970;52:1077. Codman EA. *The Shoulder* (1934).
`,
};

export default runner;
