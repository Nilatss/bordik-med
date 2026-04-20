// @ts-nocheck
/** Runner: complete-anatomy — Complete Anatomy (Elsevier 3D app) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Ирландия / Международный (3D4Medical, часть Elsevier)',
  reference: 'Complete Anatomy (3D4Medical, Elsevier). https://3d4medical.com/apps/complete-anatomy (> 17 000 3D структур; используется > 1 млн студентов и специалистов)',
  inputs: [
    {
      id: 'region',
      label: 'Анатомическая область / режим',
      type: 'select',
      options: [
        { value: 'msk', label: 'Опорно-двигательная система' },
        { value: 'nervous', label: 'Нервная система' },
        { value: 'cardiovascular', label: 'Сердечно-сосудистая система' },
        { value: 'respiratory', label: 'Дыхательная система' },
        { value: 'digestive', label: 'Пищеварительная система' },
        { value: 'female', label: 'Женская репродуктивная' },
        { value: 'microscopic', label: 'Microscopic / Histology' },
        { value: 'female-model', label: 'Female full model (добавлена 2020)' },
      ],
    },
  ],
  presets: [
    { label: 'Опорно-двигательная', values: { region: 'msk' } },
    { label: 'Нервная', values: { region: 'nervous' } },
    { label: 'ССС', values: { region: 'cardiovascular' } },
  ],
  compute: (v) => {
    const r = String(v.region || 'msk');
    const map: Record<string, { title: string; features: string; use: string }> = {
      msk: { title: 'Опорно-двигательная система', features: 'Скелет + мышцы + связки + суставы с interactive motion (angles of flexion/extension). Muscle Premium функция — показывает mouvement mythological связи.', use: 'Spinal motion studies, joint biomechanics, surgical planning for orthopedics' },
      nervous: { title: 'Нервная система', features: 'Brain structure (lobes, deep nuclei, ventricles), cranial nerves individually, spinal cord + peripheral nerves. Включает cross-sections мозга.', use: 'Neuroanatomy teaching, stroke territories visualization, cranial nerve exam teaching' },
      cardiovascular: { title: 'Сердечно-сосудистая система', features: 'Heart 3D с beating animation, conduction system highlighted, coronary circulation. Arteries/veins body-wide toggle.', use: 'Cardiac catheterization teaching, coronary anatomy, vascular surgery planning visualization' },
      respiratory: { title: 'Дыхательная система', features: 'Lungs bronchopulmonary segments, pleural cavities, diaphragm motion animation', use: 'Lobectomy planning visualization, pleural anatomy for thoracocentesis teaching' },
      digestive: { title: 'Пищеварительная система', features: 'GI tract end-to-end, liver segments (Couinaud), peritoneal relationships, biliary tree', use: 'Hepatic surgery teaching, Couinaud segments, peritoneal dialysis anatomy' },
      female: { title: 'Женская репродуктивная система', features: 'Uterus, ovaries, tubes 3D. Pregnancy model (добавлено в Female Full Model)', use: 'ObGyn teaching, IUD placement visualization, pregnancy anatomy' },
      microscopic: { title: 'Microscopic / Histology', features: 'Clinical histology slides + interactive tissue layers (skin, vessels, GI mucosa, etc.)', use: 'Histology teaching combining 3D и микропрепараты' },
      'female-model': { title: 'Female Full Model (добавлен 2020)', features: 'Complete Anatomy исторически имел только male full body; female full model добавлен 2020 после критики gender representation.', use: 'Gender-appropriate anatomy teaching, female-specific clinical applications' },
    };
    const e = map[r];
    return {
      value: e.title,
      unit: 'Complete Anatomy',
      color: '#6B7280',
      interpretation: `Complete Anatomy: ${e.title}`,
      details: `**Область:** ${e.title}\n\n**Возможности:** ${e.features}\n\n**Применение:** ${e.use}\n\n**Complete Anatomy key features:**\n- **3D rotate / zoom / slice** — любая структура, любая плоскость\n- **Layer toggle** — skin → superficial fascia → muscles → deep structures\n- **Annotations** — создавать свои метки на модели\n- **Recordings** — записать видео lecture с voice-over (для teaching)\n- **Quizzes** — встроенные + создавать свои\n- **Courses** — курсы для студентов с progress tracking\n- **Cross-sections** — CT-like axial/coronal/sagittal\n- **Micro zoom** — drill down до клеточного уровня в некоторых структурах\n- **Pathology models** — некоторые (cardiac defects, fractures) в премиум\n- **AR (Augmented Reality)** — project на стол через iPad camera\n\n**Образовательные курсы (Courses feature):**\n- Для educators: создать курс + assignments → раздать студентам\n- Built-in courses от Complete Anatomy + университетов-партнёров\n- Student progress dashboards для инструкторов`,
      actions: [
        'Скачать Complete Anatomy (iOS, iPadOS, macOS, Windows, Android)',
        'Создать бесплатный аккаунт — ограниченный просмотр + 7-дн trial premium',
        'Premium подписка: ~$25-50/мес или $130-250/год (Student discount)',
        'Университетская лицензия — во многих мед школах (проверить через деканат)',
        'Partnership с Netter\'s Atlas — Netter plates доступны в 3D режиме (совместный продукт)',
        'Export screenshots / video recordings для презентаций (авторские права — проверить)',
      ],
      caveats: [
        'Требует подписку — бесплатная версия очень ограничена',
        'iPad Pro — оптимальный опыт (Apple Pencil для annotations, AR mode)',
        'Для русского — UI переведён частично; anatomical terms только на английском/латыни (можно toggle)',
        'Не заменяет cadaver dissection — 3D модели идеализированы',
        'Pathology models — limited; для клинической патологии использовать specialized atlases',
        'Ценовая политика Elsevier — цены росли с 2019 acquisition',
      ],
      related: [
        { id: 'netter', title: 'Netter\'s Atlas' },
        { id: 'gray-anatomy', title: 'Gray\'s Anatomy' },
        { id: 'osmosis', title: 'Osmosis (анатомия видео)' },
      ],
      relatedCourses: [
        { id: '312.1', title: 'Медицинское образование' },
        { id: '302.1', title: 'Общая врачебная практика' },
      ],
    };
  },
  info: `### Для чего используется
**Complete Anatomy** (3D4Medical, часть Elsevier с 2019) — флагманское **3D приложение анатомии человека**. > 17 000 интерактивных 3D структур, используется > 1 млн студентов и профессионалов в 500+ мед школах.

### Платформы
- iOS / iPadOS (optimized для iPad Pro + Apple Pencil)
- macOS (native)
- Windows 10/11
- Android
- Apple Vision Pro (2024) — spatial computing AR

### Ключевые возможности
- **3D interactive models** — вращение, zoom, cross-section в любой плоскости
- **Layer toggle** — от кожи к глубоким структурам послойно
- **Muscle Premium** — motion animations с vector forces
- **Female full body model** (добавлен 2020)
- **Microscopic zoom** — некоторые структуры до клеточного уровня
- **Pathology models** — fractures, cardiac defects, tumors
- **AR mode** — проекция на физическую поверхность через camera
- **Record & Share** — видео с voice-over для teaching

### Educational features
- **Courses** — built-in + educator-created
- **Quizzes** — самотестирование и для классов
- **Progress tracking** — для инструкторов с student dashboards
- **Annotations** — собственные метки на модели

### Партнёрство с Netter
С 2023 Complete Anatomy включает **Netter's plates** в 3D режиме — точная синхронизация с классическим атласом.

### Ценообразование
- **Free** — очень ограничено (base visibility)
- **Student** — ~$25-30/мес или $130/год (с student verification)
- **Professional** — ~$50/мес или $250/год
- **Institutional** — университетская лицензия (variable pricing)
- **Vision Pro** — отдельная подписка`,
};
export default runner;
