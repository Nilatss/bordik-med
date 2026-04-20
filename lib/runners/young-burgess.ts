// @ts-nocheck
/** Runner: young-burgess - Young-Burgess (1990) + Tile (1988) classification of pelvic ring injuries */
import type { ScoreTool } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 4,
  inputs: [
    {
      id: 'pattern',
      label: 'Тип повреждения тазового кольца',
      type: 'select',
      options: [
        { value: '1', label: 'LC-I - боковая компрессия, горизонтальный перелом лобковой + сакральный impaction (Tile B2)', points: 1 },
        { value: '2', label: 'APC-I - anteroposterior compression, diastasis < 2.5 см (Tile B1)', points: 1 },
        { value: '3', label: 'LC-II - LC + перелом подвздошной crescent (Tile B2)', points: 2 },
        { value: '4', label: 'APC-II - open book > 2.5 см, ASL разорван, PSL интактен (Tile B1)', points: 2 },
        { value: '5', label: 'LC-III - «windswept», LC на одной стороне + APC на другой (Tile C)', points: 3 },
        { value: '6', label: 'APC-III - все связки разорваны, полностью нестабильный (Tile C)', points: 3 },
        { value: '7', label: 'VS - vertical shear, вертикальная дислокация гемипельвиса (Tile C)', points: 4 },
        { value: '8', label: 'CM - combined mechanism (смешанный) (Tile C)', points: 4 },
      ],
    },
  ],
  bands: [
    {
      min: 1, max: 1, label: 'LC-I / APC-I (Tile B1/B2)', color: '#84CC16',
      description: 'Ротационно-нестабильный, вертикально стабильный. Минимальное повреждение.',
      actions: [
        'LC-I: обычно консервативно, частичная нагрузка 6-8 нед',
        'APC-I: тазовый bind, консервативно при < 2.5 см',
        'Рентген-контроль для исключения прогрессирования',
      ],
    },
    {
      min: 2, max: 2, label: 'LC-II / APC-II (Tile B)', color: '#F59E0B',
      description: 'Частично нестабильный. Риск геморрагии особенно при APC.',
      actions: [
        'Тазовый binder экстренно в ED',
        'Гемодинамическая стабилизация (MTP, REBOA при необходимости)',
        'ORIF: симфизиальная пластина (APC-II), crescent fracture - задние винты/пластина',
        'Angiography/embolization при продолжающейся геморрагии',
      ],
    },
    {
      min: 3, max: 3, label: 'LC-III / APC-III (Tile C)', color: '#EF4444',
      description: 'Полностью нестабильный. Высокая смертность (10-20%).',
      actions: [
        'Тазовый binder + реанимация по ATLS',
        'Массивная трансфузия (1:1:1), REBOA Zone III при шоке',
        'External fixator / pelvic C-clamp для острой стабилизации',
        'Angio-embolization или pre-peritoneal packing',
        'Definitive ORIF после стабилизации (передний + задний)',
      ],
    },
    {
      min: 4, max: 4, label: 'VS / CM (Tile C)', color: '#991B1B',
      description: 'Максимально нестабильный, вертикальное смещение. Очень высокая смертность.',
      actions: [
        'Экстренная тазовая стабилизация + ресусцитация',
        'Искать повреждения urogenital (10%+): catheter, retrograde urethrogram',
        'Ищите нейрологический дефицит (L5/S1 roots)',
        'Definitive fixation: комбинированная передняя + задняя (iliosacral screws, spinopelvic fixation)',
      ],
    },
  ],
  caveats: [
    'Tile классификация (1988): A (стабильный, авульсии / поперечные sacrum), B (ротационно нестабильный), C (ротационно + вертикально нестабильный)',
    'Young-Burgess (1990) добавляет механизм повреждения - определяет вектор и связанные повреждения',
    'Haemorrhage - main cause of death в первые часы; LC менее кровит, APC/VS - более',
    'Associated injuries: urogenital 10%, rectal 5%, нейрологический 10-15% (L5/S1)',
    'ATLS: pelvic binder в ED при hemodynamic instability, не ждать КТ',
    'Open pelvic fracture: diverting colostomy, antibiotic prophylaxis (mortality > 30%)',
  ],
  related: [
    { id: 'gustilo', title: 'Gustilo (если открытый)' },
    { id: 'iss', title: 'ISS' },
    { id: 'ao-ota', title: 'AO/OTA' },
    { id: 'pipkin', title: 'Pipkin (головка бедра)' },
  ],
  relatedCourses: [
    { id: '302.2', title: 'Травматология' },
    { id: '300.4', title: 'Неотложная помощь' },
  ],
  reference: 'Burgess AR, Eastridge BJ, Young JW et al. Pelvic ring disruptions: effective classification system and treatment protocols. J Trauma 1990;30:848-56. Tile M. Acute pelvic fractures: I. Causation and classification. J Am Acad Orthop Surg 1996;4:143. Pennal GF et al. Clin Orthop 1980;151:12.',
  countries: 'Международный',
  presets: [
    { label: 'Пешеход vs авто, боковой удар → LC-I', values: { pattern: '1' } },
    { label: 'ДТП head-on, «open book» с diastasis 4 см', values: { pattern: '4' } },
    { label: 'Падение с высоты, вертикальная дислокация', values: { pattern: '7' } },
    { label: 'Raздавление, полностью нестабильный таз', values: { pattern: '6' } },
  ],
  info: `### Для чего используется
**Young-Burgess (1990)** - классификация повреждений **тазового кольца** по механизму травмы; **Tile (1988)** - по стабильности. Определяют риск геморрагии, ассоциированные повреждения и хирургическую тактику.

### Young-Burgess - по механизму
| Паттерн | Механизм | Tile eq. |
|---|---|---|
| **LC-I** | Горизонтальный pubic + сакральный impaction | B2 |
| **LC-II** | LC + crescent (iliac) fracture | B2 |
| **LC-III** | LC с одной стороны + APC с другой («windswept») | C |
| **APC-I** | Diastasis симфиза < 2.5 см, PSL интактен | B1 |
| **APC-II** | Diastasis > 2.5 см, anterior SI разорван | B1 |
| **APC-III** | Полный разрыв SI комплекса | C |
| **VS** | Вертикальный сдвиг | C |
| **CM** | Смешанный | C |

### Tile - по стабильности
| Тип | Описание | Стабильность |
|---|---|---|
| **A** | Не затрагивает кольцо (авульсия, поперечный sacrum) | Стабильный |
| **B** | Ротационно нестабильный, вертикально стабильный | Частично |
| **C** | Ротационно + вертикально нестабильный | Полностью нестабильный |

### Ключевая анатомия стабильности
- **Posterior SI ligaments** - сильнейшие в теле, определяют вертикальную стабильность
- **Pubic symphysis** - передняя стабильность
- **Sacrospinous / sacrotuberous** - ротационная
- **Pelvic floor (pelvic diaphragm)** - вертикальная

### Геморрагический риск
| Pattern | Средняя кровопотеря | Источник |
|---|---|---|
| LC | 1-2 л | Венозный плексус |
| APC | 2-4 л | Венозный + arterial (superior gluteal, pudendal) |
| VS | 3-5+ л | Артериальный + венозный |
| Open | +30-50% | Внешний |

### ATLS / Emergency management
1. **ABC** - airway, breathing, circulation
2. **Тазовый binder** на большом вертеле (при LC - осторожно, может ухудшить)
3. **FAST / pelvic X-ray** в trauma bay
4. **Кровь**: MTP 1:1:1 если shock
5. **Источник кровотечения**:
   - Стабильный таз → ищи другой источник (абдомен)
   - Нестабильный + shock → pre-peritoneal packing ± external fixator
   - Продолжающееся кровотечение → angio-embolization
   - REBOA Zone III - временный мост при zone 3 hemorrhage
6. **Urogenital**: оценка уретры (blood at meatus, high-riding prostate → retrograde urethrogram, НЕ катетеризировать)

### Окончательная фиксация
| Pattern | Фиксация |
|---|---|
| LC-I | Консервативно |
| LC-II | Iliosacral screw / crescent ORIF |
| APC-II | Symphyseal plate |
| APC-III | Symphyseal plate + iliosacral screws |
| VS/Tile C | Передний + задний, иногда spinopelvic |

### Ассоциированные повреждения
- Urogenital: 10% (уретра у мужчин, влагалище у женщин)
- Rectal: 5% (→ diverting colostomy при open или rectal injury)
- Neurological: L5/S1 roots, sciatic - 10-15%
- Abdominal: spleen, liver, mesentery
- Thoracic aorta при high-energy

### Источник
Burgess AR et al. *J Trauma* 1990;30:848. Tile M. *J Am Acad Orthop Surg* 1996;4:143.
`,
};

export default runner;
