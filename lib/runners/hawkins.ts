/** Runner: hawkins - Hawkins classification of talar neck fractures (1970) */
import type { ScoreTool } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 4,
  inputs: [
    {
      id: 'type',
      label: 'Тип перелома шейки таранной кости',
      type: 'select',
      options: [
        { value: '1', label: 'I - несмещённый (AVN 0-10%)', points: 1 },
        { value: '2', label: 'II - смещённый + подтаранный подвывих/вывих (AVN 20-50%)', points: 2 },
        { value: '3', label: 'III - тело вывихнуто из голеностопа + подтаранного (AVN 80-100%)', points: 3 },
        { value: '4', label: 'IV - III + вывих таранно-ладьевидного (AVN ~100%) [Canale & Kelly 1978]', points: 4 },
      ],
    },
  ],
  bands: [
    {
      min: 1, max: 1, label: 'Hawkins I', color: '#84CC16',
      description: 'Несмещённый. Консервативно. AVN < 10%.',
      actions: [
        'Non-weight bearing в короткой гипсовой лонгете 8-12 нед',
        'Ищите Hawkins sign (субхондральная резорбция) на 6-8 нед - маркер сохранённого кровоснабжения',
        'Рентген каждые 2-4 нед',
        'При сомнении в смещении - КТ',
      ],
    },
    {
      min: 2, max: 2, label: 'Hawkins II', color: '#F59E0B',
      description: 'Смещённый + подтаранный подвывих. AVN 20-50%.',
      actions: [
        'Срочная закрытая репозиция (часто под общей анестезией с тракцией / plantarflexion)',
        'ORIF в первые 6-24 ч (historical urgency); современно - в течение 24 ч, если мягкие ткани позволяют',
        'Передний или комбинированный medial + lateral доступ',
        'Headless compression screws, non-weight bearing 10-12 нед',
      ],
    },
    {
      min: 3, max: 3, label: 'Hawkins III', color: '#EF4444',
      description: 'Тело дислоцировано из голеностопа + подтаранного. AVN 80-100%.',
      actions: [
        'Экстренная редукция (открытая) для защиты кожи и сосудисто-нервного пучка',
        'ORIF через dual approach (medial + anterolateral)',
        'Medial malleolus osteotomy для доступа при оскольчатости',
        'Non-weight bearing 3 мес, длительное наблюдение на AVN',
      ],
    },
    {
      min: 4, max: 4, label: 'Hawkins IV', color: '#991B1B',
      description: 'III + talonavicular вывих. AVN ~100%, высокий риск skin necrosis.',
      details: 'Добавлен Canale & Kelly (1978).',
      actions: [
        'Экстренная хирургия (wound, neurovascular compromise)',
        'ORIF + восстановление talonavicular',
        'Часто требуется вторичный артродез (tibiotalar / subtalar / triple) при AVN коллапсе',
        'Пожизненное наблюдение на ОА и AVN collapse',
      ],
    },
  ],
  caveats: [
    'Hawkins sign (субхондральная линейная резорбция головки талуса на 6-8 нед) - признак СОХРАНЁННОГО кровоснабжения (негативный = плохой прогноз)',
    'МРТ через 3 мес - наиболее точный метод оценки AVN',
    'Shoemaker / Canale views (15° pronation / внутренняя ротация стопы) - лучший обзор шейки',
    'Historically - urgent reduction < 6 ч, но современные работы (Vallier 2004) показывают, что время редукции не коррелирует с AVN при смещённых',
    'Фактически определяющим является изначальная энергия и степень повреждения мягких тканей / сосудов',
    'AVN может проявиться через 6-24 мес; collapse - показание к артродезу',
  ],
  related: [
    { id: 'sanders', title: 'Sanders (пяточная)' },
    { id: 'weber', title: 'Weber (лодыжка)' },
    { id: 'ao-ota', title: 'AO/OTA' },
  ],
  relatedCourses: [
    { id: '302.2', title: 'Травматология' },
    { id: '300.4', title: 'Неотложная помощь' },
  ],
  reference: 'Hawkins LG. Fractures of the neck of the talus. J Bone Joint Surg Am 1970;52:991-1002. Canale ST, Kelly FB. Fractures of the neck of the talus. Long-term evaluation of seventy-one cases. J Bone Joint Surg Am 1978;60:143-56. Vallier HA et al. J Bone Joint Surg Am 2004;86:1616.',
  countries: 'Международный',
  presets: [
    { label: 'Aviator astragalus - падение с высоты, без смещения', values: { type: '1' } },
    { label: 'ДТП, смещение шейки + подтаранный подвывих', values: { type: '2' } },
    { label: 'High energy, тело вышло из голеностопа', values: { type: '3' } },
    { label: 'Полная дислокация всех трёх суставов', values: { type: '4' } },
  ],
  info: `### Для чего используется
**Hawkins (1970)** - классификация переломов **шейки таранной кости** (талуса), определяющая степень вывиха соседних суставов и риск AVN (аваскулярного некроза тела талуса).

### Почему AVN так часто
**Кровоснабжение тела талуса**:
- Artery of tarsal canal (ветвь a. tibialis posterior) - основной источник
- Artery of tarsal sinus (ветвь a. dorsalis pedis / a. peronea) - латерально
- Deltoid artery (ветвь posterior tibial) - медиально
- **60% поверхности покрыто хрящом**, нет мышечного прикрепления
- При вывихе тела нарушены все три источника → AVN

### Классификация
| Тип | Смещение | AVN |
|---|---|---|
| **I** | Несмещённый | 0-10% |
| **II** | + подтаранный вывих/подвывих | 20-50% |
| **III** | + вывих тела из голеностопа | 80-100% |
| **IV** | III + talonavicular вывих | ~100% |

### Hawkins sign
- Линейная субхондральная рентген-прозрачность в головке талуса на 6-8 нед
- Признак **СОХРАНЁННОГО** кровоснабжения (субхондральная резорбция невозможна без кровотока)
- Отсутствие через 8 нед → высокий риск AVN
- МРТ точнее через 3 мес

### Хирургическая тактика
- **I**: NWB гипс 8-12 нед
- **II-IV**: срочная репозиция и ORIF
- **Доступ**: dual (anteromedial + anterolateral) - avoid medial side stripping
- **Имплантаты**: headless compression screws (posterior-to-anterior или anterior-to-posterior)
- **Medial malleolus osteotomy** - при сложных для лучшего обзора

### Time to reduction
- Классическая догма: < 6 ч для снижения AVN
- Современные данные (Vallier 2004, Lindvall 2004): время редукции не влияет на AVN при смещённых (III/IV) - определяющим является изначальная энергия

### Ассоциированные повреждения
- Медиальная лодыжка (20%)
- Latеральная лодыжка
- Кожа (Hawkins III/IV - высокий риск некроза)
- Neurovascular compromise (posterior tibial bundle)

### Осложнения
- **AVN** - см. таблицу; collapse → артродез
- **Пост-травматический ОА** (tibiotalar, subtalar) - 50%+
- **Malunion** - varus в шейке → боковой перекос стопы
- **Skin necrosis** (III/IV) - 10-20%
- **Non-union** - 5-10%

### Поздние реконструкции
- Talar body AVN с collapse → tibiocalcaneal / tibiotalocalcaneal arthrodesis
- Ankle-only ОА → ankle fusion или total ankle arthroplasty (осторожно)

### Источник
Hawkins LG. *J Bone Joint Surg Am* 1970;52:991. Canale ST, Kelly FB. *J Bone Joint Surg Am* 1978;60:143.
`,
};

export default runner;
