// @ts-nocheck
/** Runner: phtls - PHTLS / ITLS Prehospital Trauma Life Support */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'step',
      label: 'Шаг primary survey',
      type: 'select',
      options: [
        { value: 'x', label: 'X - Exsanguinating hemorrhage (критическое кровотечение)' },
        { value: 'a', label: 'A - Airway + C-spine protection' },
        { value: 'b', label: 'B - Breathing (дыхание)' },
        { value: 'c', label: 'C - Circulation' },
        { value: 'd', label: 'D - Disability (неврология)' },
        { value: 'e', label: 'E - Exposure / Environment' },
      ],
    },
  ],
  compute: (v) => {
    const step = String(v.step);
    const map: Record<string, { title: string; c: string; actions: string[]; details: string }> = {
      x: {
        title: 'X - Exsanguinating hemorrhage',
        c: '#991B1B',
        actions: [
          'Найти и остановить массивное наружное кровотечение ДО оценки airway',
          'Tourniquet (CAT, SOFTT-W) на конечность',
          'Wound packing с Combat Gauze (QuikClot) + прямое давление',
          'Junctional tourniquet при паховых/подмышечных ранениях',
          'Pelvic binder при подозрении на перелом таза',
        ],
        details: 'X добавлен в PHTLS-9 (2020) перед A - война научила, что exsanguinating bleed убивает быстрее, чем airway. Приоритет массивного кровотечения.',
      },
      a: {
        title: 'A - Airway + C-spine',
        c: '#F59E0B',
        actions: [
          'Manual in-line stabilization (MILS) при подозрении на травму шеи',
          'Chin lift / jaw thrust (NOT head tilt при травме)',
          'OPA (если без рвотного рефлекса) / NPA',
          'Suction при необходимости',
          'Supraglottic airway (iGel, King LT)',
          'ETT (RSI) при опытном операторе',
          'Cricothyroidotomy (surgical или needle) при невозможности',
          'C-collar + spine board только при показаниях (NEXUS, Canadian C-spine)',
        ],
        details: 'Приоритет проходимости дыхательных путей при защите шейного отдела. ITLS/PHTLS 9th ed (2020): selective spinal immobilization (не рутинно).',
      },
      b: {
        title: 'B - Breathing',
        c: '#F59E0B',
        actions: [
          'Осмотр: частота, глубина, симметрия, деформация грудной клетки',
          'Пальпация: крепитация, нестабильность, подкожная эмфизема',
          'Аускультация: двухстороннее дыхание',
          'Игольная декомпрессия 14G × 8 см при напряжённом пневмотораксе',
          'Chest seal (vented) при открытой ране груди',
          'Finger thoracostomy / chest tube - advanced providers',
          'Supplemental O₂ 15 L/min NRB',
        ],
        details: '6 смертельных состояний груди (ATOM-FC): Airway obstruction, Tension pneumothorax, Open pneumothorax, Massive hemothorax, Flail chest, Cardiac tamponade.',
      },
      c: {
        title: 'C - Circulation',
        c: '#EF4444',
        actions: [
          'Контроль наружного кровотечения (повтор X)',
          '2 × 18G IV / IO (при невозможности IV)',
          'TXA 1 г IV за 10 мин (в первые 3 ч от травмы)',
          'Permissive hypotension: SBP 80-90 мм рт.ст. (при черепно-мозговой ≥ 110)',
          'Кристаллоиды 500 мл болюс, затем кровь по возможности',
          'Whole blood / RBC + FFP 1:1 в Role 2/3',
          'Кальция глюконат 1 г после первой единицы крови',
          'Оценка шока: класс I-IV (ATLS)',
          'FAST US в Role 2',
        ],
        details: 'Shock Index (HR/SBP) > 1 - предиктор massive transfusion. ABC-TASH score для MT активации.',
      },
      d: {
        title: 'D - Disability',
        c: '#4B8DF5',
        actions: [
          'GCS (Glasgow Coma Scale) или AVPU',
          'Зрачки - размер, симметрия, реакция на свет',
          'Двигательная активность в 4 конечностях',
          'Проверка глюкозы (исключить гипогликемию)',
          'TBI bundle: SBP ≥ 110, SpO₂ ≥ 90, нормокапния, elevate head 30°',
          'GCS ≤ 8 - интубация с RSI',
        ],
        details: 'Гипогликемия имитирует TBI - всегда проверить глюкозу. TBI: избегать "трёх Н" - hypoxia, hypotension, hypercapnia.',
      },
      e: {
        title: 'E - Exposure / Environment',
        c: '#9CA3AF',
        actions: [
          'Полное раздевание для осмотра (front и back)',
          'Log-roll при подозрении на spine trauma',
          'Предотвращение гипотермии: одеяла, тёплые растворы',
          'Осмотр подмышек, промежности, спины, скальпа',
          'HPMK / space blanket',
          'Остановить время на сцене - 10 min Platinum / Golden Hour',
        ],
        details: 'Гипотермия + ацидоз + коагулопатия - "lethal triad" травмы. < 35 °C удваивает mortality.',
      },
    };
    const r = map[step] || map.x;
    return {
      value: r.title,
      unit: '',
      interpretation: r.details,
      color: r.c,
      details: r.details,
      actions: r.actions,
      caveats: [
        'PHTLS (NAEMT, 1983) и ITLS (ITLS International, 1985) - два американских стандарта',
        'PHTLS-9 (2020) ввёл X-ABCDE (eXsanguinating) перед A',
        'Platinum 10 min - время на сцене, Golden Hour - до definitive care',
        'Selective spinal immobilization - не рутинно (NEXUS, Canadian C-Spine)',
      ],
      related: [
        { id: 'tccc', title: 'TCCC' },
        { id: 'tecc', title: 'TECC' },
        { id: 'march-paws', title: 'MARCH-PAWS' },
        { id: 'gcs', title: 'GCS' },
        { id: 'fast-us', title: 'FAST US' },
        { id: 'can-cspine', title: 'Canadian C-Spine' },
        { id: 'shock-index', title: 'Shock Index' },
        { id: 'mtp', title: 'MTP' },
      ],
      relatedCourses: [
        { id: '308.2', title: 'Тактическая медицина' },
        { id: '300.4', title: 'Неотложная помощь' },
      ],
    };
  },
  reference: 'PHTLS: Prehospital Trauma Life Support. 9th ed. NAEMT/Jones & Bartlett 2020. ITLS: International Trauma Life Support for Emergency Care Providers. 9th ed. Pearson 2020. Campbell JE, Alson RL (eds).',
  countries: 'США, международный (NAEMT, ITLS International)',
  presets: [
    { label: 'X - Exsanguinating', values: { step: 'x' } },
    { label: 'A - Airway + C-spine', values: { step: 'a' } },
    { label: 'B - Breathing', values: { step: 'b' } },
    { label: 'C - Circulation', values: { step: 'c' } },
    { label: 'D - Disability', values: { step: 'd' } },
    { label: 'E - Exposure', values: { step: 'e' } },
  ],
  info: `### Для чего используется
**PHTLS** (Prehospital Trauma Life Support, NAEMT) и **ITLS** (International Trauma Life Support) - международные стандарты догоспитальной помощи при травме. Гражданский эквивалент ATLS на догоспитальном этапе.

### X-ABCDE (PHTLS-9 2020)
| Шаг | Значение | Основное |
|---|---|---|
| **X** | eXsanguinating hemorrhage | Tourniquet, wound packing |
| **A** | Airway + C-spine | Jaw thrust, OPA/NPA, cric |
| **B** | Breathing | Needle decompression, chest seal |
| **C** | Circulation | IV/IO, TXA, permissive hypotension |
| **D** | Disability | GCS, pupils, glucose |
| **E** | Exposure | Раздеть, предотвратить гипотермию |

### Golden Hour / Platinum 10
- **Platinum 10 min** - время на сцене (scene time)
- **Golden Hour** - от травмы до definitive care (часто хирургия)

### Spine immobilization (selective)
**NEXUS low-risk**:
1. No posterior midline tenderness
2. No intoxication
3. Normal alertness
4. No focal neuro deficit
5. No painful distracting injury

**Canadian C-Spine Rule** - более чувствительный.

### Показания к RSI в поле
- GCS ≤ 8
- Невозможность защиты дыхательных путей
- Гипоксия несмотря на O₂
- Ожог дыхательных путей / травма лица

### 6 смертельных состояний груди (ATOM-FC)
- **A** Airway obstruction
- **T** Tension pneumothorax
- **O** Open pneumothorax
- **M** Massive hemothorax
- **F** Flail chest
- **C** Cardiac tamponade

### Источники
PHTLS 9th ed. NAEMT 2020. ITLS 9th ed. 2020. ACS-COT ATLS 10th ed 2018.
`,
};

export default runner;
