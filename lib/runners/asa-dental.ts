/** Runner: asa-dental — ASA Physical Status for dental anesthesia */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (ASA 2014/2020) · ADA adaptation',
  reference: 'American Society of Anesthesiologists. ASA Physical Status Classification System. Updated December 2020. Malamed SF. Medical Emergencies in the Dental Office. 8th ed.',
  inputs: [
    { id: 'class', label: 'ASA класс', type: 'select', options: [
      { value: '1', label: 'ASA I — здоровый пациент' },
      { value: '2', label: 'ASA II — лёгкое системное заболевание (контролируемая АГ, диабет)' },
      { value: '3', label: 'ASA III — тяжёлое системное заболевание (неконтрол. диабет, ХСН)' },
      { value: '4', label: 'ASA IV — угрожающее жизни (нестабильная ИБС, MI <3 мес)' },
      { value: '5', label: 'ASA V — моренд (не выживет без операции)' },
    ]},
    { id: 'emergency', label: 'Экстренность', type: 'checkbox' },
    { id: 'bisphosphonates', label: 'Бисфосфонаты (IV или >3 лет PO)', type: 'checkbox' },
    { id: 'anticoag', label: 'Антикоагулянты (Варфарин / DOAC)', type: 'checkbox' },
  ],
  presets: [
    { label: 'Здоровый (ASA I)', values: { class: '1', emergency: false, bisphosphonates: false, anticoag: false } },
    { label: 'АГ + DOAC (II+AC)', values: { class: '2', emergency: false, bisphosphonates: false, anticoag: true } },
    { label: 'ИБС + бисфосфонаты', values: { class: '3', emergency: false, bisphosphonates: true, anticoag: false } },
  ],
  compute: (v) => {
    const cls = String(v.class || '1');
    const emergency = Boolean(v.emergency);
    const bp = Boolean(v.bisphosphonates);
    const ac = Boolean(v.anticoag);
    const n = Number(cls);
    const suffix = emergency ? 'E' : '';
    const color = n === 1 ? '#22C55E' : n === 2 ? '#84CC16' : n === 3 ? '#F59E0B' : n === 4 ? '#EF4444' : '#7F1D1D';
    const setting: Record<number, string> = {
      1: 'Амбулаторно, без ограничений',
      2: 'Амбулаторно, осторожно; мониторинг АД/ЧСС',
      3: 'Амбулаторно с premedication; консультация врача',
      4: 'Стационар, анестезиолог, только экстренные вмешательства',
      5: 'Только жизнеспасательные вмешательства в стационаре',
    };
    const concerns: string[] = [];
    if (bp) concerns.push('MRONJ risk (бисфосфонаты) — избегать экстракций, CTx test опциональна');
    if (ac) concerns.push('Bleeding risk — INR на день экстракции 2.0-3.5 OK, DOAC skip 24ч для big surgery');
    return {
      value: `ASA ${['I','II','III','IV','V'][n-1]}${suffix}`,
      unit: 'ASA',
      color,
      interpretation: `ASA ${['I','II','III','IV','V'][n-1]}${suffix} — ${setting[n]}`,
      details: `Класс: ASA ${['I','II','III','IV','V'][n-1]}${suffix}\nУсловия: ${setting[n]}\n${bp ? '\n⚠ **Бисфосфонаты:** MRONJ risk, избегать экстракций / имплантации' : ''}${ac ? '\n⚠ **Антикоагулянты:** локальный гемостаз, tranexamic acid rinse' : ''}`,
      actions: [
        'ASA I-II: рутинные процедуры без ограничений',
        'ASA III: premedication (benzodiazepines), O₂ supplementation, медконсультация',
        'ASA IV-V: отложить электив; экстренные — в стационаре с анестезиологом',
        ac ? 'АК: не отменять варфарин для рутинной экстракции (INR ≤3.5); DOAC — локальный гемостаз' : 'Оценить необходимость АК-скрининга',
        bp ? 'MRONJ: избегать экстракций; при невозможности — антибиотикопрофилактика + минимальная травма' : '',
      ].filter(Boolean),
      caveats: [
        'ASA оценивается клинически, не только по диагнозу',
        'E (emergency) добавляется при экстренных вмешательствах (ASA IIE, IIIE)',
        'MRONJ риск высок при IV zoledronate (онкология); низок при PO alendronate <3 лет',
        'INR >3.5 — отложить экстракцию, консультация',
      ],
      scale: {
        segments: [
          { min: 0.5, max: 1.5, label: 'I здоров', color: '#22C55E' },
          { min: 1.5, max: 2.5, label: 'II легкий', color: '#84CC16' },
          { min: 2.5, max: 3.5, label: 'III тяжел', color: '#F59E0B' },
          { min: 3.5, max: 4.5, label: 'IV угроз', color: '#EF4444' },
          { min: 4.5, max: 5.5, label: 'V моренд', color: '#7F1D1D' },
        ],
        value: n,
      },
      related: [
        { id: 'mets', title: 'METs (функц. ёмкость)' },
        { id: 'rcri', title: 'Revised Cardiac Risk Index' },
      ],
      relatedCourses: [
        { id: '313.1', title: 'Стоматология' },
        { id: '305.1', title: 'Анестезиология' },
      ],
    };
  },
  info: `### Для чего используется
**ASA Physical Status** (American Society of Anesthesiologists) — 6-уровневая оценка физического статуса пациента для анестезии и хирургии. Адаптация для стоматологии учитывает специфические риски (MRONJ, кровотечение).

### Классы
| ASA | Описание | Стомат. тактика |
|---|---|---|
| I | Здоров | Без ограничений |
| II | Лёгкое сист. заболевание (АГ контр., DM2) | Рутина + мониторинг |
| III | Тяжёлое сист. заболевание | Premedication, медконсультация |
| IV | Угроза жизни | Стационар, только экстр. |
| V | Моренд | Жизнеспасательные |
| VI | Мозговая смерть | Донорство |

### E (Emergency)
Добавляется к классу при экстренных вмешательствах (ASA IIE, IIIE).

### Стомат. специфика
- **MRONJ** (Medication-Related Osteonecrosis of the Jaw) при bisphosphonates (IV > PO), denosumab, antiangiogenic
- **Bleeding**: INR ≤3.5 для экстракции OK; DOAC — локальный гемостаз + TXA rinse

### Источник
ASA Physical Status Classification, 2020.`,
};
export default runner;
