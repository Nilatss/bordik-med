// @ts-nocheck
/** Runner: phtls-nm — PHTLS / ITLS NAEMT prehospital trauma */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'stage',
      label: 'Этап догоспитальной помощи',
      type: 'select',
      options: [
        { value: 'scene', label: 'Scene size-up / safety' },
        { value: 'xabcde', label: 'XABCDE primary assessment' },
        { value: 'golden', label: 'Golden hour / platinum 10' },
        { value: 'transport', label: 'Transport decision' },
        { value: 'secondary', label: 'En route secondary survey' },
      ],
    },
  ],
  compute: (v) => {
    const s = String(v.stage);
    const map: Record<string, { title: string; c: string; details: string; actions: string[] }> = {
      scene: {
        title: 'Scene size-up',
        c: '#F59E0B',
        details: 'Первое, что делает догоспитальная бригада — оценка безопасности сцены, числа пострадавших, механизма, необходимости доп. ресурсов.',
        actions: [
          'Scene safety: traffic, провода, пожар, токсичные вещества, агрессивные лица, оружие',
          'BSI / PPE (body substance isolation): перчатки, очки, маска, gown при массивной кровопотере',
          'Количество пострадавших → triage (START / SALT) при MCI',
          'Механизм травмы: high-energy (fall > 3 м/6 м, MVC > 60 км/ч, пешеход vs авто, penetrating torso)',
          'Запросить дополнительные ресурсы: HEMS, rescue, пожарные, полиция',
          'NEVER ENTER an unsafe scene — wait for law enforcement / hazmat',
        ],
      },
      xabcde: {
        title: 'XABCDE primary',
        c: '#EF4444',
        details: 'PHTLS/ITLS использует XABCDE: eXsanguinating haemorrhage контролируется ДО дыхательных путей при массивном наружном кровотечении.',
        actions: [
          'X — eXsanguinating haemorrhage: tourniquet (CAT/SOFTT-W) на конечность, haemostatic gauze + pressure (junctional)',
          'A — Airway + c-spine: manual in-line stabilization, jaw thrust, OPA/NPA, SGA при необходимости',
          'B — Breathing: expose chest, SpO₂, ЧДД, исключить tension PTX (needle decompression 2nd ICS MCL или 5th ICS AAL)',
          'C — Circulation: pulse check, capillary refill, контроль внутреннего кровотечения (pelvic binder), 2 IV/IO доступа, TXA если протокол разрешает',
          'D — Disability: AVPU или GCS, зрачки, латерализация, глюкоза',
          'E — Expose / environment: осмотр + предотвращение гипотермии (blankets, warmed IV)',
        ],
      },
      golden: {
        title: 'Golden hour / platinum 10',
        c: '#991B1B',
        details: 'Концепция PHTLS: от момента травмы до definitive care ≤ 60 мин (golden hour); время на сцене ≤ 10 мин (platinum 10) при критическом пациенте.',
        actions: [
          'Platinum 10 min on-scene для критического пациента (BSI, XABCDE, packaging, move)',
          '"Load and go" — стабилизация в машине / вертолёте, не на месте',
          'Интервенции — только те, что нельзя выполнить в движении (airway, needle chest, haemorrhage control)',
          'Early notification принимающего центра (ATMIST / IMIST)',
          'Trauma center direct transport (не ближайший ED при major trauma)',
        ],
      },
      transport: {
        title: 'Transport decision',
        c: '#4B8DF5',
        details: 'CDC Field Triage Criteria — выбор уровня стационара и режима транспортировки (HEMS / ground).',
        actions: [
          'Step 1 Physiology: GCS ≤ 13, SBP < 90, ЧДД < 10 или > 29 → Trauma center',
          'Step 2 Anatomy: penetrating head/neck/torso, flail chest, 2+ proximal long bone fx, crushed/degloved, pelvic fx, paralysis, amputation proximal wrist/ankle',
          'Step 3 Mechanism: fall > 6 м (adult) / > 3 м или 2–3× height (peds), high-risk MVC, auto vs peds > 30 км/ч',
          'Step 4 Special: возраст ≥ 55, беременность > 20 нед, антикоагулянты, burn',
          'HEMS при time-sensitive patients (по протоколу региона)',
        ],
      },
      secondary: {
        title: 'En route secondary survey',
        c: '#22C55E',
        details: 'Вторичный осмотр выполняется в пути после стабилизации ABCDE — только если состояние позволяет и время в пути > 5 мин.',
        actions: [
          'SAMPLE: Signs/Symptoms · Allergies · Medications · Past history · Last meal · Events',
          'Head-to-toe: DCAP-BTLS / TIC (Deformities, Contusions, Abrasions, Punctures/Penetrations, Burns, Tenderness, Lacerations, Swelling)',
          'Reassess ABCDE каждые 5 мин',
          'Vital signs каждые 5 мин при critical, каждые 15 мин при stable',
          'Подготовка к handover ATMIST/IMIST',
        ],
      },
    };
    const r = map[s] || map.scene;
    return {
      value: r.title,
      unit: '',
      interpretation: r.details,
      color: r.c,
      details: r.details,
      actions: r.actions,
      caveats: [
        'PHTLS/ITLS 10th ed — NAEMT + ACS-COT совместная работа',
        'XABCDE (не cABCDE) — "X" как eXsanguinating ставит массивное наружное кровотечение перед airway',
        'Platinum 10 min не применим при entrapment/extrication',
        'Needle decompression 2nd ICS MCL — эффективна < 50% случаев; 5th ICS AAL предпочтительнее у взрослых',
      ],
      related: [
        { id: 'atls', title: 'ATLS 10th ed' },
        { id: 'etc', title: 'European Trauma Course' },
        { id: 'tccc-17', title: 'TCCC' },
        { id: 'tecc-17', title: 'TECC' },
        { id: 'ems-assess', title: 'EMS assessment mnemonics' },
        { id: 'ahs-ecc', title: 'AHA / ERC dispatch' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Неотложная помощь' },
      ],
    };
  },
  reference: 'NAEMT / ACS-COT. PHTLS: Prehospital Trauma Life Support. 10th ed. Jones & Bartlett, 2023. Campbell JE. International Trauma Life Support (ITLS). 9th ed. Pearson, 2020. CDC. Guidelines for Field Triage of Injured Patients, 2021.',
  countries: 'NAEMT (США), международно — 80+ стран',
  presets: [
    { label: 'Scene size-up', values: { stage: 'scene' } },
    { label: 'XABCDE', values: { stage: 'xabcde' } },
    { label: 'Golden hour', values: { stage: 'golden' } },
    { label: 'Transport decision', values: { stage: 'transport' } },
    { label: 'Secondary', values: { stage: 'secondary' } },
  ],
  info: `### Для чего используется
**PHTLS / ITLS** — программы NAEMT/ACS-COT и ITLS International для parafeldsher/paramedic уровня. Стандарт догоспитальной помощи при травме в большинстве EMS систем мира.

### XABCDE
- **X** eXsanguinating haemorrhage
- **A** Airway + c-spine
- **B** Breathing
- **C** Circulation
- **D** Disability
- **E** Expose / environment

### Golden hour / Platinum 10
- Golden hour: травма → definitive care ≤ 60 мин
- Platinum 10: on-scene time ≤ 10 мин при critical patient

### DCAP-BTLS / TIC
Deformities · Contusions · Abrasions · Punctures · Burns · Tenderness · Lacerations · Swelling

### CDC Field Triage (2021)
- Step 1 Physiology → Trauma center
- Step 2 Anatomy → Trauma center
- Step 3 Mechanism → consider trauma center
- Step 4 Special populations

### Источники
PHTLS 10th ed, NAEMT 2023.
ITLS 9th ed, Pearson 2020.
CDC Field Triage 2021.
`,
};

export default runner;
