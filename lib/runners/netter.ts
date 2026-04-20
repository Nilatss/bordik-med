// @ts-nocheck
/** Runner: netter — Netter's Atlas of Human Anatomy (Elsevier) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'США / Международный (Elsevier)',
  reference: 'Netter FH. Atlas of Human Anatomy. 8th ed. Philadelphia: Elsevier; 2023. ISBN 978-0-323-79373-0. (> 550 plates медицинских иллюстраций; ~70 млн копий продано с 1989 г.)',
  inputs: [
    {
      id: 'region',
      label: 'Раздел / область тела',
      type: 'select',
      options: [
        { value: 'head', label: 'Head & Neck (Plates 1-103)' },
        { value: 'back', label: 'Back & Spinal Cord (Plates 160-189)' },
        { value: 'thorax', label: 'Thorax (Plates 190-266)' },
        { value: 'abdomen', label: 'Abdomen (Plates 267-386)' },
        { value: 'pelvis', label: 'Pelvis & Perineum (Plates 387-468)' },
        { value: 'upper', label: 'Upper Limb (Plates 469-559)' },
        { value: 'lower', label: 'Lower Limb (Plates 560-639)' },
        { value: 'cross', label: 'Cross-sectional anatomy (разделы по регионам)' },
      ],
    },
  ],
  presets: [
    { label: 'Голова/шея', values: { region: 'head' } },
    { label: 'Грудная клетка', values: { region: 'thorax' } },
    { label: 'Живот', values: { region: 'abdomen' } },
  ],
  compute: (v) => {
    const r = String(v.region || 'head');
    const map: Record<string, { title: string; plates: string; key: string; clinical: string }> = {
      head: { title: 'Head & Neck', plates: 'Plates 1-103', key: 'Plate 1: Skeleton of Head; Pl 44: Cranial nerves schema; Pl 70: Pharynx median section; Pl 86: Cervical triangles; Pl 97: Thyroid & parathyroid', clinical: 'Pl 58-66: парабульбарная анестезия; Pl 85-89: центральный венозный доступ (IJV); Pl 98: тиреоидэктомия ориентиры' },
      back: { title: 'Back & Spinal Cord', plates: 'Plates 160-189', key: 'Pl 160: vertebral column; Pl 170: muscles of back superficial; Pl 176: suboccipital triangle; Pl 184: spinal cord arteries', clinical: 'Pl 166-168: люмбальная пункция ориентиры (L3-L4); Pl 184: spinal stroke анатомия' },
      thorax: { title: 'Thorax', plates: 'Plates 190-266', key: 'Pl 210: heart chambers; Pl 216: coronary arteries; Pl 230: bronchopulmonary segments; Pl 241: azygos system', clinical: 'Pl 194: thoracocentesis зона (T7-T8 midaxillary); Pl 216: ангиография сердца; Pl 223: tube thoracostomy' },
      abdomen: { title: 'Abdomen', plates: 'Plates 267-386', key: 'Pl 267: anterior abdominal wall; Pl 290: stomach in situ; Pl 301: hepatic segments (Couinaud); Pl 326: retroperitoneum', clinical: 'Pl 272-275: paracentesis зоны; Pl 301: hepatic resection planes; Pl 320: кишечная непроходимость ориентиры' },
      pelvis: { title: 'Pelvis & Perineum', plates: 'Plates 387-468', key: 'Pl 387: bony pelvis; Pl 395: pelvic floor muscles; Pl 411: uterus & adnexa; Pl 436: male perineum', clinical: 'Pl 395: pelvic floor dysfunction; Pl 411: TVUS ориентиры; Pl 436-440: катетеризация уретры' },
      upper: { title: 'Upper Limb', plates: 'Plates 469-559', key: 'Pl 469: shoulder bones; Pl 478: rotator cuff; Pl 496: brachial plexus; Pl 528: muscles of hand', clinical: 'Pl 496: brachial plexus blocks; Pl 511: radial artery cannulation; Pl 528: hand surgery ориентиры' },
      lower: { title: 'Lower Limb', plates: 'Plates 560-639', key: 'Pl 560: hip bone; Pl 580: femoral triangle; Pl 600: popliteal fossa; Pl 622: muscles of foot', clinical: 'Pl 580: femoral vein access; Pl 600: popliteal pulse; Pl 608: saphenous vein harvesting (CABG)' },
      cross: { title: 'Cross-sectional anatomy', plates: 'Integrated with regional sections (+ additional in digital edition)', key: 'Axial CT/MRI-like sections: head (Pl 112); thorax (Pl 250); abdomen (Pl 328); pelvis (Pl 410)', clinical: 'Для корреляции с CT/MRI — используйте Netter вместе с Weir Imaging Atlas или Grainger radiology' },
    };
    const e = map[r];
    return {
      value: e.title,
      unit: 'Netter',
      color: '#6B7280',
      interpretation: `Netter Atlas: ${e.title}`,
      details: `**Раздел:** ${e.title}\n\n**Диапазон plates:** ${e.plates}\n\n**Ключевые plates:** ${e.key}\n\n**Clinical correlations:** ${e.clinical}\n\n**Frank H. Netter, MD (1906-1991):**\nАмериканский хирург и медицинский иллюстратор. Создал > 4000 иллюстраций за 45 лет. Его стиль — сочетание хирургической точности с художественной красотой — стал стандартом медицинской иллюстрации.\n\n**Netter's Atlas structure (8th edition, 2023):**\n- 7 regional sections (Head/Neck → Lower Limb)\n- > 550 full-color plates\n- Surface anatomy integration\n- Clinical tables и correlations\n- BONUS Plates — новые в 8-м изд. (напр. clinical imaging correlations)\n\n**Digital edition (ClinicalKey / Elsevier eBooks):**\n- Interactive plates с labels toggle\n- 3D видео от Netter's partnership с Complete Anatomy\n- Search by structure name\n- Quiz mode для self-testing`,
      actions: [
        'Приобрести Netter\'s Atlas 8th edition (2023) — print + bundled eBook access',
        'Digital: Elsevier eBooks (через ClinicalKey Student институциональную подписку)',
        'Netter\'s Anatomy Flash Cards — набор карточек для заучивания',
        'Netter\'s Anatomy Coloring Book — для active learning',
        'Partnership с Complete Anatomy — Netter plates доступны в 3D приложении',
        'Для русского — "Атлас анатомии человека Неттера" (ГЭОТАР-Медиа, перевод)',
      ],
      caveats: [
        'Netter — anatomical illustrations, не photographs — некоторые находят dissection photos (Rohen, Gray\'s) более реалистичными',
        'Plate numbers меняются между изданиями — сверить с текущей редакцией (8th ed. 2023)',
        'Clinical correlations — базовые; для углублённого клинического применения использовать dedicated surgical atlases',
        'Imaging atlas (CT/MRI correlation) — минимален; для радиологии использовать Weir или Grainger',
        'Digital access требует подписки (ClinicalKey Student) или code при покупке print',
      ],
      related: [
        { id: 'complete-anatomy', title: 'Complete Anatomy (3D)' },
        { id: 'gray-anatomy', title: 'Gray\'s Anatomy' },
        { id: 'rohen-atlas', title: 'Rohen Color Atlas' },
      ],
      relatedCourses: [
        { id: '312.1', title: 'Медицинское образование' },
        { id: '302.1', title: 'Общая врачебная практика' },
      ],
    };
  },
  info: `### Для чего используется
**Netter's Atlas of Human Anatomy** (Elsevier) — самый продаваемый атлас анатомии в мире, ~70 млн копий с 1989 г. **8-е издание (2023)**. > 550 иллюстраций Frank H. Netter, MD (1906-1991) + обновлённые clinical correlations.

### Структура атласа
1. **Head & Neck** (Plates 1-159)
2. **Back & Spinal Cord** (Plates 160-189)
3. **Thorax** (Plates 190-266)
4. **Abdomen** (Plates 267-386)
5. **Pelvis & Perineum** (Plates 387-468)
6. **Upper Limb** (Plates 469-559)
7. **Lower Limb** (Plates 560-639)
+ Muscle / nerve / vessel reference tables
+ Bonus clinical imaging plates (новые в 8-м изд.)

### Форматы
- **Print** — hardcover, ~$90-130
- **eBook (bundled code)** — Elsevier eBooks platform
- **Institutional** — ClinicalKey Student (через мед школу)
- **Partnership с Complete Anatomy** — Netter plates в 3D приложении

### Ключевые особенности Netter стиля
- Хирургическая точность (Netter был хирургом)
- Использование colors для разделения систем (красный артерии, синий вены, жёлтый нервы)
- Surface anatomy integration
- Orientation drawings (mini-figure в углу для локализации)

### Дополнения к Netter
- **Netter's Clinical Anatomy** (Moore's style comprehensive text)
- **Netter's Anatomy Flash Cards**
- **Netter's Anatomy Coloring Book**
- **Netter's Essential Histology**

### Русское издание
«Атлас анатомии человека Неттера» — перевод ГЭОТАР-Медиа, доступно последнее издание.

### Источник
ISBN 978-0-323-79373-0 (8th ed. 2023) · Elsevier`,
};
export default runner;
