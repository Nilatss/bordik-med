/** Runner: outerbridge - Outerbridge (1961) + ICRS (2000) chondral defect classification */
import type { ScoreTool } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 4,
  inputs: [
    {
      id: 'grade',
      label: 'Степень хондрального повреждения',
      type: 'select',
      options: [
        { value: '0', label: '0 - нормальный хрящ', points: 0 },
        { value: '1', label: 'I - размягчение и отёк (softening/swelling)', points: 1 },
        { value: '2', label: 'II - частичная толщина, фиссуры < 1.5 см, не достигают субхондральной кости', points: 2 },
        { value: '3', label: 'III - фиссуры до субхондральной кости, площадь > 1.5 см', points: 3 },
        { value: '4', label: 'IV - обнажённая субхондральная кость', points: 4 },
      ],
    },
  ],
  bands: [
    {
      min: 0, max: 0, label: 'Grade 0', color: '#22C55E',
      description: 'Нормальный хрящ.',
      actions: [
        'Нет показаний к вмешательству',
        'Профилактика: контроль веса, укрепление квадрицепса',
      ],
    },
    {
      min: 1, max: 1, label: 'Grade I', color: '#84CC16',
      description: 'Chondromalacia - размягчение и отёк. Реверсибельно.',
      actions: [
        'Консервативно: НПВС, физиотерапия, укрепление квадрицепса',
        'VMO (vastus medialis obliquus) retraining при patellofemoral',
        'При персистенции - МРТ-контроль через 6 мес',
      ],
    },
    {
      min: 2, max: 2, label: 'Grade II', color: '#FACC15',
      description: 'Частичная толщина, фиссуры, не достигают кости.',
      actions: [
        'Консервативно 3-6 мес: физиотерапия, НПВС, hyaluronic acid',
        'Внутрисуставные инъекции (PRP, HA) - опц.',
        'Хирургия при неуспехе: дебридмент, microfracture (малые дефекты)',
      ],
    },
    {
      min: 3, max: 3, label: 'Grade III', color: '#F59E0B',
      description: 'Фиссуры до субхондральной кости. Active лечение.',
      actions: [
        'Microfracture (Steadman) для малых дефектов < 2 см² у молодых активных',
        'OATS / mosaicplasty - автоген для 1-4 см²',
        'ACI / MACI (autologous chondrocyte implantation) - 2-10 см²',
        'Hyaluronic acid / PRP - симптоматика',
      ],
    },
    {
      min: 4, max: 4, label: 'Grade IV', color: '#EF4444',
      description: 'Обнажённая субхондральная кость. Полнослойный дефект.',
      actions: [
        'Focal defect: OATS, ACI/MACI, osteochondral allograft (> 4 см²)',
        'Diffuse osteoarthritis: TKA / UKA / HTO в зависимости от возраста и алайнмента',
        'Biologics (stem cells, BMAC) - исследовательская зона',
        'PRP / HA - симптоматика у non-surgical candidates',
      ],
    },
  ],
  caveats: [
    'Outerbridge (1961) - изначально для пателлофеморальной chondromalacia, экстраполирован на все суставы',
    'ICRS (International Cartilage Repair Society, 2000) - современный стандарт, сопоставим 1:1 с Outerbridge, но учитывает глубину и площадь отдельно',
    'Inter-observer reliability умеренная (κ 0.4-0.6), зависит от артроскописта / МРТ-радиолога',
    'МРТ (T2 mapping, dGEMRIC, sodium imaging) даёт количественную оценку, но артроскопия - золотой стандарт',
    'При выборе лечения учитывайте: возраст, ИМТ, алайнмент (varus/valgus), стабильность связок (ACL), meniscal status',
    'Grade IV в патофеморальном с maltracking → TTO (tibial tubercle osteotomy) + cartilage procedure',
  ],
  related: [
    { id: 'kellgren', title: 'Kellgren-Lawrence (OA рентген)' },
    { id: 'schatzker', title: 'Schatzker (tibial plateau)' },
    { id: 'ao-ota', title: 'AO/OTA' },
  ],
  relatedCourses: [
    { id: '302.2', title: 'Травматология' },
    { id: '201.3', title: 'Ревматология' },
  ],
  reference: 'Outerbridge RE. The etiology of chondromalacia patellae. J Bone Joint Surg Br 1961;43:752-7. Brittberg M, Winalski CS. Evaluation of cartilage injuries and repair. J Bone Joint Surg Am 2003;85(Suppl 2):58. ICRS Cartilage Injury Evaluation Package 2000.',
  countries: 'Международный',
  presets: [
    { label: 'Молодая, передняя боль, МРТ - softening patella', values: { grade: '1' } },
    { label: 'Артроскопия: фиссуры patella 1 см', values: { grade: '2' } },
    { label: 'Фокальный дефект медиального мыщелка 2 см², до кости', values: { grade: '3' } },
    { label: 'Exposed bone medial femoral condyle 3 см²', values: { grade: '4' } },
  ],
  info: `### Для чего используется
**Outerbridge (1961)** - классическая артроскопическая/МРТ классификация **хондральных повреждений**. **ICRS (2000)** - современный международный стандарт, совместимый с Outerbridge.

### Outerbridge (1961)
| Степень | Описание |
|---|---|
| **0** | Нормальный хрящ |
| **I** | Размягчение, отёк (chondromalacia) |
| **II** | Частичная толщина, фиссуры < 1.5 см, не достигают кости |
| **III** | Фиссуры до субхондральной кости, диаметр > 1.5 см |
| **IV** | Обнажённая субхондральная кость |

### ICRS (2000)
| Степень | Описание |
|---|---|
| **0** | Нормальный |
| **1** | Поверхностные изменения (1a - soft indentation, 1b - superficial fissures) |
| **2** | Abnormal: lesion extending < 50% depth |
| **3** | Severely abnormal: > 50% depth (3a, 3b, 3c, 3d по глубине) |
| **4** | Severely abnormal: полнослойный + кость (4a - calcified layer, 4b - subchondral bone) |

### Размер и площадь (важно для тактики)
- **Small**: < 2 см²
- **Medium**: 2-4 см²
- **Large**: > 4 см²

### Алгоритм лечения (по размеру + степени)
| Размер | Grade III/IV (focal) | Технология |
|---|---|---|
| < 2 см² | Microfracture | Marrow stimulation (Steadman) |
| 2-4 см² | OATS / mosaicplasty | Autologous plugs |
| 2-10 см² | ACI / MACI | Cultured chondrocytes |
| > 4-6 см² | Osteochondral allograft | Donor |
| Diffuse (OA) | HTO / UKA / TKA | В зависимости от возраста |

### Фокус на pателлофеморальный
- **VMO weakness**, maltracking, trochlear dysplasia - factors
- **Q-angle** > 20° женщины, > 15° мужчины - patellar lateral tracking
- **TT-TG distance** > 20 мм на КТ - TTO показан
- **MPFL reconstruction** при recurrent dislocation

### Клиническая оценка
- **Knee**: catch, give way, effusion, grinding
- **МРТ**: T2 mapping, dGEMRIC (proteoglycan content), sodium imaging - advanced
- **Артроскопия**: ICRS probe для глубины, размер измеряется caliper

### Ключевые сопутствующие факторы
- **Alignment**: varus/valgus - корреция HTO / DFO
- **Meniscal status**: meniscectomized → accelerated chondral wear; consider meniscal allograft transplant (MAT)
- **Ligament stability**: ACL reconstruction с cartilage procedure
- **ИМТ > 30** - снижает результаты всех cartilage procedures

### Post-op реабилитация
| Процедура | NWB | ROM |
|---|---|---|
| Microfracture | 6-8 нед | Ранняя CPM |
| OATS | 4-6 нед | Ранняя ROM |
| ACI/MACI | 6 нед partial | CPM с 1 дня |

### Источник
Outerbridge RE. *J Bone Joint Surg Br* 1961;43:752. Brittberg M, Winalski CS. *J Bone Joint Surg Am* 2003;85(Suppl 2):58.
`,
};

export default runner;
