// @ts-nocheck
/** Runner: tecc-17 - Tactical Emergency Casualty Care (civilian) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'zone',
      label: 'Зона угрозы (TECC)',
      type: 'select',
      options: [
        { value: 'direct', label: 'Direct Threat Care (hot zone)' },
        { value: 'indirect', label: 'Indirect Threat Care (warm zone)' },
        { value: 'evac', label: 'Evacuation Care (cold zone)' },
      ],
    },
  ],
  compute: (v) => {
    const z = String(v.zone);
    const map: Record<string, { title: string; c: string; details: string; actions: string[] }> = {
      direct: {
        title: 'Direct Threat Care (Hot Zone)',
        c: '#991B1B',
        details: 'Активная угроза присутствует (активный стрелок, пожар, взрыв). Принцип: move to safety + stop severe bleeding. Минимум вмешательств.',
        actions: [
          'Оценка и митигация угрозы (SWAT, rescue task force, fire)',
          'Move casualty to safe area - rapid extrication (drag, carry)',
          'Stop massive bleeding: tourniquet (CAT) на конечность при exsanguinating extremity haemorrhage',
          'Instruct walking wounded to self-evacuate',
          'НЕ airway management, НЕ needle decompression, НЕ CPR в hot zone',
          'Минимизировать время в зоне - доли минут',
        ],
      },
      indirect: {
        title: 'Indirect Threat Care (Warm Zone)',
        c: '#EF4444',
        details: 'Угроза нейтрализована/контролируется, но сохраняется потенциал. Основной объём вмешательств по MARCH - civilian адаптация TCCC.',
        actions: [
          'M - Massive haemorrhage: повторная оценка tourniquet, wound packing (hemostatic gauze), pressure',
          'A - Airway: positioning (recovery position), jaw thrust, NPA/OPA, SGA при необходимости',
          'R - Respiration: chest seal (vented) на penetrating chest wounds, needle decompression при tension PTX',
          'C - Circulation: IV/IO access, контроль pelvic (SAM sling), TXA 1 г если протокол EMS разрешает',
          'H - Head injury / Hypothermia: GCS, prevent heat loss (blankets, Hypothermia Prevention Kit)',
          'Быстрый triage (START / SALT) при множественных пострадавших',
          'Подготовка к транспортировке в cold zone или casualty collection point',
        ],
      },
      evac: {
        title: 'Evacuation Care (Cold Zone)',
        c: '#4B8DF5',
        details: 'Безопасная зона, полный объём догоспитальной помощи, подготовка к транспортировке в trauma center.',
        actions: [
          'Полная переоценка MARCH',
          'Advanced airway (ETT / SGA), mechanical ventilation при необходимости',
          'Blood products (whole blood, plasma) - при доступности; иначе balanced crystalloid',
          'TXA 1 г IV < 3 ч (если не дан) + maintenance 1 г × 8 ч',
          'Pain management (fentanyl, ketamine - по протоколу)',
          'Antibiotics при open wounds',
          'Early notification trauma center + ATMIST/IMIST handover',
          'Direct transport to Level I/II trauma center (по CDC Field Triage)',
        ],
      },
    };
    const r = map[z] || map.indirect;
    return {
      value: r.title,
      unit: '',
      interpretation: r.details,
      color: r.c,
      details: r.details,
      actions: r.actions,
      caveats: [
        'TECC - гражданская адаптация TCCC Committee on Tactical Emergency Casualty Care (C-TECC)',
        'Zones of care - динамические, могут меняться по ходу инцидента',
        'Rescue Task Force модель - EMS с law enforcement escort в warm zone',
        'Stop the Bleed - публичная программа обучения tourniquet / wound packing (часть TECC philosophy)',
        'TECC-LEO для law enforcement, TECC-FR для first responders, TECC-MP для medical professionals',
      ],
      related: [
        { id: 'tccc-17', title: 'TCCC (military)' },
        { id: 'phtls-nm', title: 'PHTLS / ITLS' },
        { id: 'atls', title: 'ATLS' },
        { id: 'ems-assess', title: 'EMS assessment mnemonics' },
        { id: 'ahs-ecc', title: 'AHA / ERC dispatch' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Неотложная помощь' },
      ],
    };
  },
  reference: 'Committee for Tactical Emergency Casualty Care (C-TECC). TECC Guidelines for First Care Providers / First Responders / Medical Professionals. Updated 2023. Callaway DW et al. Tactical Emergency Casualty Care: evolution and civilian application. Prehosp Emerg Care 2011;15(4):535.',
  countries: 'C-TECC (США), международная адаптация EMS систем',
  presets: [
    { label: 'Hot zone (direct)', values: { zone: 'direct' } },
    { label: 'Warm zone (indirect)', values: { zone: 'indirect' } },
    { label: 'Cold zone (evac)', values: { zone: 'evac' } },
  ],
  info: `### Для чего используется
**TECC (Tactical Emergency Casualty Care)** - гражданская адаптация TCCC для EMS, first responders, law enforcement в условиях активной угрозы (active shooter, теракт, массовое ЧП).

### Три фазы (зоны)
| Зона | TCCC эквивалент | Описание |
|---|---|---|
| Direct Threat (hot) | Care Under Fire | Активная угроза, минимум помощи |
| Indirect Threat (warm) | Tactical Field Care | Угроза контролируется, MARCH |
| Evacuation (cold) | TACEVAC | Безопасно, полный объём |

### Rescue Task Force
EMS + law enforcement escort работают в warm zone - компромисс между безопасностью и временем до помощи.

### Stop the Bleed
Публичная программа (ACS, C-TECC, DHS) - обучение gражданских tourniquet/wound packing.

### Отличия TECC vs TCCC
- Учёт гражданских реалий (дети, беременные, пожилые, коморбидности)
- Интеграция с EMS-протоколами (не military chain of care)
- Zones вместо phases of care

### Источники
C-TECC Guidelines 2023.
Callaway DW. *Prehosp Emerg Care* 2011;15:535.
`,
};

export default runner;
