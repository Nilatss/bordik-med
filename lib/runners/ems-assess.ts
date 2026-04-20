// @ts-nocheck
/** Runner: ems-assess - Prehospital assessment mnemonics */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'mnemonic',
      label: 'Мнемоника',
      type: 'select',
      options: [
        { value: 'opqrst', label: 'OPQRST - оценка боли' },
        { value: 'sample', label: 'SAMPLE - анамнез' },
        { value: 'dcapbtls', label: 'DCAP-BTLS - head-to-toe' },
        { value: 'avpu', label: 'AVPU - уровень сознания' },
        { value: 'chart', label: 'CHART - документация' },
      ],
    },
  ],
  compute: (v) => {
    const m = String(v.mnemonic);
    const map: Record<string, { title: string; c: string; details: string; actions: string[] }> = {
      opqrst: {
        title: 'OPQRST - pain assessment',
        c: '#F59E0B',
        details: 'Структурированная оценка боли у догоспитального пациента. Используется в EMS всего мира.',
        actions: [
          'O - Onset: когда началось? что делали? внезапно / постепенно?',
          'P - Provocation / Palliation: что усиливает? что облегчает? движение / покой / еда / нитроспрей?',
          'Q - Quality: характер? давящая / жгучая / колющая / тупая / спазматическая?',
          'R - Radiation / Region: локализация? куда иррадиирует (челюсть, плечо, спина)?',
          'S - Severity: интенсивность 0-10? хуже ли, чем обычно?',
          'T - Time / Timing: длительность? перемежающаяся / постоянная?',
        ],
      },
      sample: {
        title: 'SAMPLE - history',
        c: '#4B8DF5',
        details: 'Мнемоника для сбора медицинского анамнеза в экстренной ситуации. Дополняется OPQRST для пациентов с болью.',
        actions: [
          'S - Signs & Symptoms: что сейчас ощущает?',
          'A - Allergies: лекарства, пища, латекс',
          'M - Medications: рецептурные, OTC, БАДы, травы, наркотики; compliance',
          'P - Past medical history / Pregnancy: ИБС, СД, ХОБЛ, CVA, операции, беременность',
          'L - Last oral intake: еда, питьё, время (важно для анестезии)',
          'E - Events leading up: что случилось перед эпизодом?',
        ],
      },
      dcapbtls: {
        title: 'DCAP-BTLS - head-to-toe',
        c: '#EF4444',
        details: 'Систематический осмотр травмы по областям тела. Используется во вторичном осмотре после ABCDE/XABCDE.',
        actions: [
          'D - Deformities (деформации)',
          'C - Contusions (контузии, гематомы)',
          'A - Abrasions (ссадины)',
          'P - Punctures / Penetrations (проколы, проникающие)',
          'B - Burns (ожоги)',
          'T - Tenderness (болезненность при пальпации)',
          'L - Lacerations (рваные раны)',
          'S - Swelling (отёк)',
          'Осмотр по областям: голова → шея → грудь → живот → таз → спина (log-roll) → конечности',
        ],
      },
      avpu: {
        title: 'AVPU - level of consciousness',
        c: '#22C55E',
        details: 'Быстрая оценка уровня сознания. Проще GCS, подходит для primary survey.',
        actions: [
          'A - Alert (бодрствует, ориентирован) - оцените A&O×4: person, place, time, event',
          'V - Verbal (отвечает на голос, может быть спутан)',
          'P - Painful (отвечает только на болевой стимул - trapezius pinch / supraorbital pressure)',
          'U - Unresponsive (нет реакции)',
          'Любое <A - приоритет airway + vitals + SpO₂ + глюкоза',
          'P или U → возможная необходимость advanced airway (GCS ~8 эквивалент)',
        ],
      },
      chart: {
        title: 'CHART - documentation',
        c: '#17E56C',
        details: 'Структура рапорта / карты вызова EMS. Альтернативы: SOAP (для стационара), DCHART.',
        actions: [
          'C - Chief complaint (основная жалоба)',
          'H - History (анамнез по SAMPLE + OPQRST)',
          'A - Assessment (объективный осмотр, vitals, первичный/вторичный)',
          'R - Rx / Treatment (выполненные вмешательства, реакция)',
          'T - Transport (куда, способ, vitals при передаче)',
          'Документировать в хронологическом порядке + метки времени',
          'Не документировать то, что не делал; не стирать ошибки - перечеркнуть одной линией + инициалы',
        ],
      },
    };
    const r = map[m] || map.sample;
    return {
      value: r.title,
      unit: '',
      interpretation: r.details,
      color: r.c,
      details: r.details,
      actions: r.actions,
      caveats: [
        'Мнемоники - инструменты, не заменяют клиническое мышление',
        'OPQRST подходит для не-травматической боли; для травмы используйте DCAP-BTLS',
        'AVPU "P" примерно соответствует GCS 8 - точка принятия решения о definitive airway',
        'SAMPLE должен быть получен и от пациента, и от близких/свидетелей при altered mental status',
      ],
      related: [
        { id: 'phtls-nm', title: 'PHTLS / ITLS' },
        { id: 'atls', title: 'ATLS' },
        { id: 'gcs', title: 'Glasgow Coma Scale' },
        { id: 'avpu', title: 'AVPU detailed' },
        { id: 'tecc-17', title: 'TECC' },
        { id: 'ahs-ecc', title: 'AHA / ERC dispatch' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Неотложная помощь' },
      ],
    };
  },
  reference: 'Mistovich JJ, Karren KJ, Hafen BQ. Prehospital Emergency Care. 12th ed. Pearson, 2022. NAEMT. Prehospital Trauma Life Support. 10th ed. 2023.',
  countries: 'NAEMT / NREMT (США), стандарт EMS обучения международно',
  presets: [
    { label: 'OPQRST (pain)', values: { mnemonic: 'opqrst' } },
    { label: 'SAMPLE (history)', values: { mnemonic: 'sample' } },
    { label: 'DCAP-BTLS (head-to-toe)', values: { mnemonic: 'dcapbtls' } },
    { label: 'AVPU (LOC)', values: { mnemonic: 'avpu' } },
    { label: 'CHART (documentation)', values: { mnemonic: 'chart' } },
  ],
  info: `### Для чего используется
Базовые мнемоники EMS / догоспитальной помощи - каркас для структурированной оценки, анамнеза и документации.

### OPQRST
Оценка боли: **O**nset · **P**rovocation · **Q**uality · **R**adiation · **S**everity · **T**ime.

### SAMPLE
Анамнез: **S**igns · **A**llergies · **M**edications · **P**ast · **L**ast meal · **E**vents.

### DCAP-BTLS
Head-to-toe: **D**eformities · **C**ontusions · **A**brasions · **P**unctures · **B**urns · **T**enderness · **L**acerations · **S**welling.

### AVPU
**A**lert / **V**erbal / **P**ainful / **U**nresponsive. P ≈ GCS 8.

### CHART
Документация: **C**hief complaint · **H**istory · **A**ssessment · **R**x · **T**ransport.

### Источники
Mistovich JJ. *Prehospital Emergency Care* 12th ed, 2022.
NAEMT PHTLS 10th ed, 2023.
`,
};

export default runner;
