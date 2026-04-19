// @ts-nocheck
/** Runner: kellgren — Kellgren-Lawrence radiographic classification of osteoarthritis (1957) */
import type { ScoreTool } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 4,
  inputs: [
    {
      id: 'grade',
      label: 'Степень по Kellgren-Lawrence (стоящий рентген)',
      type: 'select',
      options: [
        { value: '0', label: '0 — нет OA', points: 0 },
        { value: '1', label: '1 — сомнительное сужение суставной щели, возможные остеофиты', points: 1 },
        { value: '2', label: '2 — определённые остеофиты, возможное сужение', points: 2 },
        { value: '3', label: '3 — умеренные остеофиты + сужение + склероз + возможная деформация', points: 3 },
        { value: '4', label: '4 — крупные остеофиты + выраженное сужение + тяжёлый склероз + деформация', points: 4 },
      ],
    },
  ],
  bands: [
    {
      min: 0, max: 0, label: 'Grade 0', color: '#22C55E',
      description: 'Нет рентген-признаков OA.',
      actions: [
        'Профилактика: контроль веса (BMI < 25), аэробная + силовая активность',
        'Избегать high-impact при рисках (family history, предыдущая травма)',
      ],
    },
    {
      min: 1, max: 1, label: 'Grade 1 (сомнительный)', color: '#84CC16',
      description: 'Doubtful narrowing, возможные остеофиты. Early OA.',
      actions: [
        'Lifestyle: вес, умеренная активность (плавание, велосипед)',
        'Укрепление quadriceps / glute для knee/hip',
        'Acetaminophen / topical NSAID первая линия',
      ],
    },
    {
      min: 2, max: 2, label: 'Grade 2 (лёгкая OA)', color: '#FACC15',
      description: 'Определённые остеофиты, возможное сужение. Mild OA.',
      actions: [
        'Физиотерапия структурированная (quadriceps, core)',
        'Oral NSAIDs (с учётом GI/CV/renal риска)',
        'Duloxetine при хронической боли',
        'Intraarticular corticosteroids при flares (короткий эффект 4–12 нед)',
        'HA injections (viscosupplementation) — варьирующие данные, рассмотреть у молодых',
      ],
    },
    {
      min: 3, max: 3, label: 'Grade 3 (умеренная OA)', color: '#F59E0B',
      description: 'Умеренные остеофиты + сужение + субхондральный склероз.',
      actions: [
        'Консервативно: НПВС, физиотерапия, ортезы (unloader brace для medial knee OA)',
        'IA corticosteroid / HA',
        'Рассмотреть HTO / UKA у молодых активных с unicompartmental OA',
        'Подготовка к TJA (если неудача конс. + выраженная disability)',
      ],
    },
    {
      min: 4, max: 4, label: 'Grade 4 (тяжёлая OA)', color: '#EF4444',
      description: 'Bone-on-bone, большие остеофиты, деформация. Severe OA.',
      actions: [
        'Total joint arthroplasty (TKA / THA) — gold standard у подходящих пациентов',
        'Unicompartmental — только при unicompartmental OA с сохранёнными compartments',
        'У неоперабельных: optimize pain (duloxetine, tramadol ограниченно), mobility aids',
        'Pre-op: optimization (HbA1c < 7, BMI идеально < 40, smoking cessation, dental clearance)',
      ],
    },
  ],
  caveats: [
    'K-L основан на СТОЯЩЕМ AP рентгене (weight-bearing) — non-WB снимки недооценивают сужение',
    'KOOS / HOOS для knee/hip дополнительно оценивают симптомы (рентген ↔ боль слабо коррелируют)',
    'МРТ-классификации (WORMS, BLOKS, MOAKS) — исследования, не рутинно',
    'Joint space narrowing < 2 мм = «definite narrowing» (медиальный knee)',
    'Rosenberg view (45° flexion PA) — более чувствительный для раннего medial joint narrowing',
    'Grade не всегда коррелирует с болью: до 30% пациентов с K-L 3–4 имеют минимальные симптомы, и наоборот',
  ],
  related: [
    { id: 'outerbridge', title: 'Outerbridge / ICRS' },
    { id: 'ao-ota', title: 'AO/OTA' },
    { id: 'schatzker', title: 'Schatzker (tibial plateau)' },
  ],
  relatedCourses: [
    { id: '302.2', title: 'Травматология' },
    { id: '201.3', title: 'Ревматология' },
  ],
  reference: 'Kellgren JH, Lawrence JS. Radiological assessment of osteo-arthrosis. Ann Rheum Dis 1957;16:494–502. Altman R et al. OARSI atlas of individual radiographic features in OA. Osteoarthritis Cartilage 2007;15(Suppl A):A1.',
  countries: 'Международный',
  presets: [
    { label: 'Здоровое колено 40 лет', values: { grade: '0' } },
    { label: 'Женщина 55 лет, лёгкая боль, маленькие остеофиты', values: { grade: '2' } },
    { label: 'Мужчина 65 лет, bone-on-bone медиально', values: { grade: '4' } },
  ],
  info: `### Для чего используется
**Kellgren-Lawrence (1957)** — наиболее используемая **рентгенологическая классификация остеоартрита** (OA). Применима к коленному, тазобедренному, плечевому, кисти, позвоночнику.

### Критерии (5 степеней)
| Grade | Признаки |
|---|---|
| **0** | Нет OA |
| **1** | Сомнительное сужение, возможные остеофиты |
| **2** | Определённые остеофиты, возможное сужение (minimal OA) |
| **3** | Умеренные остеофиты, определённое сужение, субхондральный склероз, возможная деформация (moderate OA) |
| **4** | Большие остеофиты, выраженное сужение, тяжёлый склероз, определённая деформация (severe OA) |

### Радиографические признаки OA (4 классических)
1. **Сужение суставной щели** (joint space narrowing)
2. **Остеофиты** (osteophytes)
3. **Субхондральный склероз**
4. **Субхондральные кисты**

### Альтернативы
- **OARSI atlas** (2007) — отдельные шкалы для joint space narrowing и остеофитов
- **Ahlbäck** (knee, 1968) — больше внимания сужению
- **Tönnis** (hip, 1976) — аналог для тазобедренного
- **Croft** (hip) — используется в эпидемиологии

### Оптимальные проекции
| Сустав | Проекция |
|---|---|
| **Knee** | Стоящая AP + Rosenberg (45° flexion PA) + lateral + skyline patella |
| **Hip** | Стоящая AP таза + Dunn lateral |
| **Shoulder** | True AP (Grashey) + axillary |
| **Hand** | PA оба запястья |

### Клиническая шкала OA (дополнить)
- **WOMAC**, **KOOS**, **HOOS** — pain, stiffness, function
- **VAS pain score**
- **Range of motion**
- **Deformity** (varus/valgus)

### ACR диагноз коленного OA (клиника + рентген)
Боль + ≥ 3 из:
- Возраст > 50
- Утренняя скованность < 30 мин
- Crepitus
- Костная чувствительность
- Костное увеличение
- Нет ощутимого тепла

### Лечение (OARSI 2019, AAOS 2021)
**Core (все)**: вес, упражнения, education
**Адъюнкты**: topical NSAID (knee), oral NSAID, duloxetine
**Интервенционные**: IA steroid (short-term), HA (varies)
**Хирургия**: HTO/UKA/TKA (knee), THA (hip)

**НЕ рекомендованы**: glucosamine/chondroitin (weak), opioid хронически, arthroscopic lavage/debridement у OA без mechanical symptoms

### Progression predictors
- BMI > 30
- Varus alignment (medial knee OA)
- Previous meniscal surgery
- Quadriceps weakness
- Genetics (GDF5)

### Источник
Kellgren JH, Lawrence JS. *Ann Rheum Dis* 1957;16:494. Altman R et al. *Osteoarthritis Cartilage* 2007;15(Suppl A):A1.
`,
};

export default runner;
