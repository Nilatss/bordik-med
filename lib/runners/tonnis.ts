/** Runner: tonnis - Tönnis classification of hip osteoarthritis (1987) */
import type { ScoreTool } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 3,
  inputs: [
    {
      id: 'grade',
      label: 'Степень по Tönnis (стоящий AP таза)',
      type: 'select',
      options: [
        { value: '0', label: '0 - нет OA тазобедренного сустава', points: 0 },
        { value: '1', label: '1 - лёгкая: склероз головки/вертлужной впадины, лёгкое сужение щели, без потери сферичности', points: 1 },
        { value: '2', label: '2 - умеренная: мелкие кисты, умеренное сужение щели, умеренная потеря сферичности головки', points: 2 },
        { value: '3', label: '3 - тяжёлая: крупные кисты, выраженное сужение/облитерация щели, деформация головки, AVN', points: 3 },
      ],
    },
  ],
  bands: [
    {
      min: 0, max: 0, label: 'Grade 0 (нет OA)', color: '#22C55E',
      description: 'Нет рентген-признаков остеоартрита.',
      actions: [
        'Профилактика: контроль веса (BMI < 25)',
        'Аэробика с низкой ударной нагрузкой (плавание, велосипед)',
        'Оценка FAI / дисплазии у молодых с болью (alpha-angle, LCEA) - хирургическая коррекция до развития OA',
      ],
    },
    {
      min: 1, max: 1, label: 'Grade 1 (лёгкая)', color: '#84CC16',
      description: 'Склероз + лёгкое сужение щели, сферичность сохранена.',
      actions: [
        'Модификация активности, снижение веса',
        'Физиотерапия: укрепление gluteus medius, core',
        'Парацетамол / topical NSAID',
        'Рассмотреть периацетабулярную остеотомию (PAO) при дисплазии и Tönnis 0-1 у молодых',
      ],
    },
    {
      min: 2, max: 2, label: 'Grade 2 (умеренная)', color: '#F59E0B',
      description: 'Мелкие кисты, умеренное сужение, умеренная потеря сферичности.',
      actions: [
        'Oral NSAIDs (с учётом GI/CV/renal)',
        'Intraarticular steroid injections - короткий эффект',
        'Duloxetine при хронической боли',
        'PAO/остеотомии противопоказаны при Tönnis ≥ 2 - переход к обсуждению THA',
      ],
    },
    {
      min: 3, max: 3, label: 'Grade 3 (тяжёлая)', color: '#EF4444',
      description: 'Крупные кисты, облитерация щели, деформация головки. Bone-on-bone.',
      actions: [
        'Total hip arthroplasty (THA) - золотой стандарт',
        'Pre-op optimization: HbA1c < 7, BMI < 40 по возможности, smoking cessation',
        'У неоперабельных - оптимизация боли (duloxetine, tramadol ограниченно), mobility aids',
      ],
    },
  ],
  caveats: [
    'Tönnis - рентгенологическая, не учитывает симптомы (WOMAC/HOOS - отдельно)',
    'Tönnis ≥ 2 - относительное противопоказание для joint-preserving хирургии (PAO, hip arthroscopy)',
    'Необходим weight-bearing AP + false-profile / Dunn lateral для оценки переднего покрытия',
    'Альтернатива - Kellgren-Lawrence для универсальной рентген-оценки OA',
    'У пациентов с дисплазией ранняя PAO даёт лучший долгосрочный прогноз, чем позднее THA',
  ],
  related: [
    { id: 'kellgren', title: 'Kellgren-Lawrence' },
    { id: 'harris-hip', title: 'Harris Hip Score' },
    { id: 'garden', title: 'Garden (femoral neck)' },
  ],
  relatedCourses: [
    { id: '302.2', title: 'Травматология' },
    { id: '201.3', title: 'Ревматология' },
  ],
  reference: 'Tönnis D. Congenital Dysplasia and Dislocation of the Hip in Children and Adults. Springer, Berlin 1987. Busse J, Gasteiger W, Tönnis D. Eine neue Methode zur röntgenologischen Beurteilung eines Hüftgelenkes. Arch Orthop Unfallchir 1972;72:1-9.',
  countries: 'Международный',
  presets: [
    { label: 'Здоровый TBS у 30-летнего', values: { grade: '0' } },
    { label: 'Дисплазия, болевая фаза, склероз', values: { grade: '1' } },
    { label: '65 лет, bone-on-bone, AVN', values: { grade: '3' } },
  ],
  info: `### Для чего используется
**Tönnis (1987)** - рентгенологическая классификация **остеоартрита тазобедренного сустава**. Аналог Kellgren-Lawrence, но более специфична для hip. Широко используется при планировании **joint-preserving хирургии** (PAO, hip arthroscopy при FAI/дисплазии) и оценке THA.

### Степени (4 градации)
| Grade | Признаки |
|---|---|
| **0** | Нет OA |
| **1** | Лёгкая: склероз, лёгкое сужение щели, сферичность сохранена |
| **2** | Умеренная: мелкие кисты, умеренное сужение, умеренная потеря сферичности |
| **3** | Тяжёлая: крупные кисты, облитерация щели, деформация головки, AVN |

### Оптимальные проекции
- **Стоящий AP таза** (weight-bearing) - основной
- **False-profile (Lequesne)** - оценка переднего покрытия головки
- **Dunn 45°/90° lateral** - alpha-angle (cam-FAI)
- **Cross-table lateral** - при недоступности Dunn

### Клиническое значение
- **Tönnis 0-1** - кандидаты на **PAO** (при дисплазии) или **hip arthroscopy** (при FAI)
- **Tönnis ≥ 2** - относительное противопоказание для joint preservation; переход к **THA**
- Прогностический фактор исхода PAO: Tönnis > 1 → 5-летняя конверсия в THA ~30%

### Измерения на AP
| Параметр | Норма | Патология |
|---|---|---|
| LCEA (Wiberg) | 25-40° | < 20° дисплазия |
| Tönnis angle (acetabular inclination) | 0-10° | > 10° дисплазия |
| Alpha-angle (Dunn) | < 55° | > 55° cam-FAI |
| Crossover sign | нет | pincer-FAI |

### Альтернативы
- **Kellgren-Lawrence** (универсальная OA-шкала)
- **Croft** (эпидемиология)
- **OARSI atlas** (компонентная оценка сужения/остеофитов)

### Ограничения
- Рентген ↔ симптомы коррелируют слабо (до 30% Tönnis 3 без выраженной боли)
- Inter-observer reliability κ 0.5-0.7
- Не оценивает хрящ напрямую (МРТ dGEMRIC, T2-mapping - исследования)

### Источник
Tönnis D. *Congenital Dysplasia and Dislocation of the Hip*. Springer 1987.
`,
};

export default runner;
