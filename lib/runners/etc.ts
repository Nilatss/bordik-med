/** Runner: etc - European Trauma Course (ERC) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'module',
      label: 'Модуль ETC',
      type: 'select',
      options: [
        { value: 'horizontal', label: 'Horizontal approach (team, parallel tasks)' },
        { value: 'crm', label: 'Crew Resource Management' },
        { value: 'primary', label: 'Primary survey (ABCDE adapted)' },
        { value: 'haemorrhage', label: 'Haemorrhage control / DCR' },
        { value: 'handover', label: 'Handover (ATMIST / IMIST-AMBO)' },
      ],
    },
  ],
  compute: (v) => {
    const m = String(v.module);
    const map: Record<string, { title: string; c: string; details: string; actions: string[] }> = {
      horizontal: {
        title: 'Horizontal approach',
        c: '#4B8DF5',
        details: 'ETC подчёркивает параллельный (не последовательный) подход: команда из 4-6 специалистов работает одновременно, лидер координирует.',
        actions: [
          'Team leader - hands-off, видит всю картину, принимает решения',
          'Airway doctor - дыхательные пути + c-spine',
          'Procedure doctor - доступы, chest drain, FAST',
          'Scribe - фиксирует события, таймер',
          'Nurse leader - лекарства, катетеры',
          'Параллельные задачи в первые 5 мин: ABCDE оценка + доступы + монитор + labs + imaging',
        ],
      },
      crm: {
        title: 'Crew Resource Management',
        c: '#17E56C',
        details: 'Нетехнические навыки: communication, situational awareness, decision-making, leadership/followership, task management.',
        actions: [
          'Closed-loop communication: "dai 1 г TXA" → "даю 1 г TXA" → "дано"',
          'Briefing до прибытия пациента (role assignment, план)',
          'Speak-up culture: любой член команды может озвучить проблему',
          'Regular reassessment каждые 5-10 мин',
          'Debriefing после случая (hot / cold)',
        ],
      },
      primary: {
        title: 'Primary Survey (ETC)',
        c: '#EF4444',
        details: 'ETC использует модифицированный ABCDE с акцентом на catastrophic haemorrhage (cABCDE) и параллельную работу.',
        actions: [
          'c - catastrophic external haemorrhage (tourniquet, pressure)',
          'A - Airway + c-spine (MILS, jaw thrust, airway adjuncts)',
          'B - Breathing (SpO₂, CO₂, симметрия, chest drain при необходимости)',
          'C - Circulation (2 доступа, blood products, TXA, pelvic binder)',
          'D - Disability (GCS, pupils, glucose, limb function)',
          'E - Exposure (undress, log-roll, prevent hypothermia)',
        ],
      },
      haemorrhage: {
        title: 'Haemorrhage control / DCR',
        c: '#991B1B',
        details: 'Damage Control Resuscitation - ERC/ETC подход к массивному кровотечению: permissive hypotension + balanced ratio + hemostatic adjuncts + rapid surgical control.',
        actions: [
          'Tourniquet / direct pressure / haemostatic dressing (Combat Gauze)',
          'Pelvic binder на ВЕРТЕЛЫ (не crista iliaca) при pelvic ring injury',
          'Permissive hypotension SBP 80-90 (не при ЧМТ)',
          'Balanced transfusion 1:1:1 или whole blood',
          'TXA 1 г IV < 3 ч → 1 г × 8 ч',
          'Damage control surgery / REBOA при non-compressible torso haemorrhage',
          'Avoid lethal triad: hypothermia < 35, acidosis pH < 7.2, coagulopathy INR > 1.5',
        ],
      },
      handover: {
        title: 'Handover - ATMIST / IMIST-AMBO',
        c: '#F59E0B',
        details: 'Стандартизированная структура передачи пациента от догоспитального этапа бригаде стационара.',
        actions: [
          'A - Age + sex',
          'T - Time of incident',
          'M - Mechanism of injury',
          'I - Injuries found / suspected',
          'S - Signs (vitals, GCS)',
          'T - Treatments given (TXA, fluids, airway, splints)',
          'AMBO (расширенный IMIST): Allergies · Medications · Background · Other (беременность, инфекции)',
          'Длительность ≤ 30 с, без перебивания; вопросы - после',
        ],
      },
    };
    const r = (map[m] || map.horizontal)!;
    return {
      value: r.title,
      unit: '',
      interpretation: r.details,
      color: r.c,
      details: r.details,
      actions: r.actions,
      caveats: [
        'ETC - курс-первоисточник horizontal team approach, в отличие от вертикального ATLS',
        'CRM-принципы важнее технических навыков в экстренной медицине (данные NHS/ACS audits)',
        'Pelvic binder на ВЕРТЕЛЫ - на crista iliaca не работает',
        'Не задерживать перевод в OR для дополнительной визуализации при явном внутреннем кровотечении',
      ],
      related: [
        { id: 'atls', title: 'ATLS 10th ed' },
        { id: 'phtls-nm', title: 'PHTLS / ITLS' },
        { id: 'tccc-17', title: 'TCCC' },
        { id: 'erc', title: 'ERC Guidelines' },
        { id: 'bls-acls', title: 'BLS / ACLS' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Неотложная помощь' },
        { id: '302.1', title: 'Хирургия' },
      ],
    };
  },
  reference: 'European Resuscitation Council & European Society for Trauma and Emergency Surgery. European Trauma Course Manual. 4th ed. ERC, 2020. Spahn DR et al. Management of bleeding and coagulopathy following major trauma: 5th European guideline. Crit Care 2019;23:98.',
  countries: 'ERC / ESTES (Европа, ≥ 30 стран)',
  presets: [
    { label: 'Horizontal approach', values: { module: 'horizontal' } },
    { label: 'CRM', values: { module: 'crm' } },
    { label: 'Primary survey', values: { module: 'primary' } },
    { label: 'Haemorrhage / DCR', values: { module: 'haemorrhage' } },
    { label: 'ATMIST handover', values: { module: 'handover' } },
  ],
  info: `### Для чего используется
**European Trauma Course (ETC)** - курс ERC + ESTES для междисциплинарного ведения тяжёлой травмы в первые часы. Отличается от ATLS горизонтальным (team-based) подходом.

### Ключевые отличия ETC vs ATLS
- **Horizontal** (параллельно, команда) vs **vertical** (одно лицо, последовательно)
- Акцент на CRM (crew resource management)
- cABCDE - catastrophic external haemorrhage первым
- Интеграция догоспитального этапа (ATMIST / IMIST-AMBO)

### CRM (нетехнические навыки)
- Communication (closed-loop)
- Situational awareness
- Decision-making
- Leadership / followership
- Task management

### ATMIST handover
**A**ge · **T**ime · **M**echanism · **I**njuries · **S**igns · **T**reatment

### Damage Control Resuscitation
- Permissive hypotension (SBP 80-90)
- Balanced transfusion 1:1:1
- TXA < 3 ч
- Hemostatic adjuncts + rapid surgical control

### Источники
ERC & ESTES. European Trauma Course Manual, 4th ed, 2020.
Spahn DR et al. 5th European trauma bleeding guideline. *Crit Care* 2019.
`,
};

export default runner;
