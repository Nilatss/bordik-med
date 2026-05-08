/** Runner: tccc-17 - Tactical Combat Casualty Care (JTS 2023) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'phase',
      label: 'Фаза TCCC',
      type: 'select',
      options: [
        { value: 'cuf', label: 'Care Under Fire (под огнём)' },
        { value: 'tfc', label: 'Tactical Field Care' },
        { value: 'tacevac', label: 'Tactical Evacuation Care (TACEVAC)' },
      ],
    },
    {
      id: 'weight',
      hint: 'Вес в кг (без одежды)',
      label: 'Масса тела (для TXA у детей)',
      type: 'number',
      unit: 'кг',
      min: 5,
      max: 200,
      step: 1,
      quickValues: [25, 50, 70, 80, 100],
    },
  ],
  compute: (v) => {
    const p = String(v.phase);
    const weight = Number(v.weight) || 80;
    // TXA dose: adult 1 g IV (или 2 g IM), peds 15 mg/kg max 1 g
    const txaAdult = 1000;
    const txaPeds = Math.min(15 * weight, 1000);

    const map: Record<string, { title: string; c: string; details: string; actions: string[] }> = {
      cuf: {
        title: 'Care Under Fire (CUF)',
        c: '#991B1B',
        details: 'Активный обмен огнём. Минимум помощи - только контроль массивного наружного кровотечения конечностей. Главное - подавление угрозы + укрытие.',
        actions: [
          'Return fire / подавить угрозу',
          'Пострадавший сам (self-aid) - укрыться, наложить tourniquet high-and-tight поверх формы',
          'Если unresponsive и rescue безопасен - быстро переместить в cover',
          'Контроль catastrophic extremity haemorrhage: CAT tourniquet 5-8 см выше раны (или high-and-tight если точка не видна)',
          'Airway management - ОТЛОЖИТЬ до TFC (кроме рта вниз у unconscious - recovery position)',
          'НЕ выполнять CPR под огнём',
        ],
      },
      tfc: {
        title: 'Tactical Field Care (TFC) - MARCH-PAWS',
        c: '#EF4444',
        details: 'После выхода из зоны активного огня. Систематическая оценка + лечение по MARCH-PAWS.',
        actions: [
          'M - Massive haemorrhage: переоценка tourniquet, junctional (SAM, CRoC, JETT), wound packing + Combat Gauze + 3 мин давление',
          'A - Airway: chin lift/jaw thrust → NPA (OPA если unconscious) → SGA (i-gel) → cricothyrotomy при maxillofacial trauma',
          'R - Respiration: occlusive chest seal (vented) на ВСЕ торакальные penetrating wounds; needle decompression 10G × 8 см по midaxillary 5th ICS (или 2nd ICS MCL), chest tube при prolonged care',
          'C - Circulation: контроль pelvic (SAM pelvic sling), IO (стернальная/проксимальная tibia) при неудаче IV; fluid: Hextend 500 мл только при altered mental status / weak pulse; whole blood > plasma > hextend',
          'H - Head injury + Hypothermia: GCS, зрачки; HPMK (hypothermia prevention kit), снять мокрую одежду',
          `TXA: ${Math.round(txaAdult)} мг IV/IO (взрослый) / ${Math.round(txaPeds)} мг (ребёнок, 15 мг/кг) < 3 ч от травмы`,
          'P - Pain: OTFC fentanyl lozenge 800 мкг (walking wounded) / ketamine 50 мг IM или 20 мг IV (severe)',
          'A - Antibiotics: moxifloxacin 400 мг PO или ertapenem 1 г IV/IM при open wounds',
          'W - Wounds: повязки, шины, жгут при ожогах (не dressing первым)',
          'S - Splinting',
        ],
      },
      tacevac: {
        title: 'TACEVAC (MEDEVAC / CASEVAC)',
        c: '#4B8DF5',
        details: 'Фаза эвакуации: переход к расширенным вмешательствам, мониторинг, подготовка к Role 2/3.',
        actions: [
          'Продвинутый мониторинг: SpO₂, EtCO₂, ECG, АД; pulse oximeter на unburned digit',
          'Airway: ETT / SGA / cricothyrotomy - поддержание',
          'Ventilator settings: TV 6-8 мл/кг IBW, PEEP 5, FiO₂ titrate to SpO₂ ≥ 90%',
          'Fluid / blood products: whole blood (low-titer O) preferred; FDP (freeze-dried plasma) при MARCH-H hypovolaemia',
          'Kalium - не давать при crush injury без labs',
          'TXA completion dose 1 г IV × 8 ч (если < 3 ч от 1-й дозы)',
          'Hypothermia prevention continued (HPMK, Ready-Heat, warmed fluids)',
          'Handover по MIST/9-line',
        ],
      },
    };
    const r = (map[p] || map.tfc)!;

    // MARCH score (checklist completion) - not a real score, but a progression indicator
    let color = r.c;
    return {
      value: r.title,
      unit: '',
      interpretation: `${r.title}. ${r.details}`,
      color,
      details: r.details,
      actions: r.actions,
      caveats: [
        'TCCC-MP (Medical Personnel) - полный протокол; TCCC-ASM (All Service Members) - базовый',
        'Tourniquet может оставаться до 6 ч без серьёзных осложнений - НЕ снимать до прибытия в стационар при prolonged field care',
        'Cricothyrotomy - предпочитается bougie-aided технике, рутинно не показан intubation при facial burns',
        'Whole blood low-titer O - gold standard; плазма и hextend - резерв',
        'Needle decompression 2-е предпочтительное место - 5th ICS AAL (не 2-е ICS MCL) по обновлениям CoTCCC 2018',
      ],
      related: [
        { id: 'tecc-17', title: 'TECC (civilian tactical)' },
        { id: 'atls', title: 'ATLS' },
        { id: 'phtls-nm', title: 'PHTLS / ITLS' },
        { id: '9-line', title: '9-line MEDEVAC' },
        { id: 'etc', title: 'European Trauma Course' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Неотложная помощь' },
        { id: '300.5', title: 'Военно-полевая медицина' },
      ],
    };
  },
  reference: 'Committee on Tactical Combat Casualty Care (CoTCCC). TCCC Guidelines for Medical Personnel. Joint Trauma System, 15 December 2023. Butler FK et al. Tactical Combat Casualty Care: beginnings. Wilderness Environ Med 2017;28(2S):S12-S17.',
  countries: 'DoD / JTS (США), NATO STANAG, международно (combat medic programs)',
  presets: [
    { label: 'Care Under Fire', values: { phase: 'cuf', weight: 80 } },
    { label: 'TFC - MARCH-PAWS', values: { phase: 'tfc', weight: 80 } },
    { label: 'TACEVAC', values: { phase: 'tacevac', weight: 80 } },
    { label: 'Ребёнок 25 кг', values: { phase: 'tfc', weight: 25 } },
  ],
  info: `### Для чего используется
**TCCC (Tactical Combat Casualty Care)** - протокол Committee on Tactical Combat Casualty Care (Joint Trauma System, DoD) для боевой травмы. Обновление декабрь 2023.

### Три фазы
1. **Care Under Fire** - только жгут, return fire, перемещение в укрытие
2. **Tactical Field Care** - MARCH-PAWS, основной объём помощи
3. **TACEVAC** - расширенные вмешательства в пути

### MARCH-PAWS
- **M** Massive haemorrhage (tourniquet, wound packing, Combat Gauze)
- **A** Airway (NPA/SGA/crico)
- **R** Respiration (chest seal, needle decompression)
- **C** Circulation (IO, whole blood, TXA)
- **H** Head injury / Hypothermia
- **P** Pain (OTFC, ketamine)
- **A** Antibiotics (moxi PO / ertapenem IV)
- **W** Wounds
- **S** Splinting

### TXA dose
- Adult: 1 г IV < 3 ч, повтор 1 г × 8 ч
- Pediatric: 15 мг/кг (макс 1 г)
- IM вариант: 2 г одной дозой (если IV недоступен)

### Источники
CoTCCC. TCCC Guidelines for Medical Personnel, 15 Dec 2023.
CRASH-2 trial - TXA.
`,
};

export default runner;
