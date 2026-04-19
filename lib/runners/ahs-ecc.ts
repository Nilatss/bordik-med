// @ts-nocheck
/** Runner: ahs-ecc — AHA ECC / ERC / SAMU / HEMS dispatch */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'system',
      label: 'Система',
      type: 'select',
      options: [
        { value: 'mpds', label: 'MPDS / ProQA dispatch (AMPDS)' },
        { value: 'samu', label: 'SAMU (Франция) — регулируемый' },
        { value: 'hems', label: 'HEMS dispatch criteria' },
        { value: 'onboard', label: 'In-flight medical emergency (onboard)' },
        { value: 'dispatch-cpr', label: 'T-CPR (telephone-CPR)' },
      ],
    },
  ],
  compute: (v) => {
    const s = String(v.system);
    const map: Record<string, { title: string; c: string; details: string; actions: string[] }> = {
      mpds: {
        title: 'MPDS / AMPDS dispatch',
        c: '#4B8DF5',
        details: 'Medical Priority Dispatch System (IAED/MPDS, ProQA) — стандартизированный протокол обработки 911/112 вызовов с triage по 33 главам (Chief Complaint).',
        actions: [
          'Case entry: address, callback, nature of problem, age, consciousness, breathing',
          'Key questions (по главе CC): chest pain, breathing problems, unconscious, traffic, etc.',
          'Определение Priority: E (Echo) → D → C → B → A → O (Omega)',
          'PAI (Post-dispatch / Pre-arrival Instructions): T-CPR, Heimlich, contraceptive bleeding, childbirth',
          'Response determinant: паравозрата EMS (ALS/BLS, lights-sirens) по determinant code',
          'Documentation: все ответы заносятся в ProQA',
        ],
      },
      samu: {
        title: 'SAMU régulation (Франция)',
        c: '#17E56C',
        details: 'SAMU-Centre 15: физиционный triage звонков. Врач-регулятор решает об отправке SMUR (ALS), pompiers (BLS+rescue), ambulance privée или conseil médical.',
        actions: [
          'PARM (permanencier auxiliaire) — первичная обработка, идентификация ресурсов',
          'Médecin régulateur — клиническая оценка по телефону',
          'Ответ: SMUR (врач+медсестра+водитель, реанимобиль), pompiers (VSAV), ambulance privée, conseil',
          'Code envoi: P0 (vital) → P1 → P2 → P3',
          'Continuum: pre-hospital регулятор ведёт пациента до bed-side в стационаре',
          'Télérégulation: телемедицинская консультация для отдалённых пациентов',
        ],
      },
      hems: {
        title: 'HEMS dispatch criteria',
        c: '#F59E0B',
        details: 'Критерии активации санавиации (Helicopter EMS). Варьируются по стране/региону, общие принципы — time-sensitive condition + time/distance advantage.',
        actions: [
          'Physiology: SBP < 90, ЧДД < 10 или > 29, GCS ≤ 13, airway compromise',
          'Anatomy: penetrating head/neck/torso, flail, amputation proximal wrist/ankle, pelvic fx, spinal cord, burns + airway',
          'Mechanism: high-energy MVC, fall > 6 м, ejection, entrapment > 20 мин, pedestrian thrown',
          'Special: pregnancy ≥ 20 нед с травмой, paediatric trauma, STEMI > 90 мин до PCI, stroke outside thrombolysis window by ground',
          'Time/distance: ground transport > 30 мин до Level I, HEMS сокращает > 15 мин',
          'Weather / daylight permitting; двойная активация (ground + air) при сомнении',
        ],
      },
      onboard: {
        title: 'In-flight medical emergency',
        c: '#EF4444',
        details: 'Помощь на борту коммерческого рейса. Частота ≈ 1 на 604 вылета (Peterson NEJM 2013). Большинство — vasovagal, respiratory, cardiac.',
        actions: [
          'Представиться cabin crew, показать медицинский документ',
          'Использовать on-board kit: EMK (Emergency Medical Kit) — 30+ items, FAA/ICAO стандарт',
          'AED на борту (FAA обязует с 2004)',
          'Связь через MedLink / MedAire / STAT-MD — ground-based physician consult',
          'Pulse oximeter, BP cuff, glucometer в EMK',
          'Решение о diversion — командир, по рекомендации ground-based MD',
          'Типичные: vasovagal (supine, legs up, fluids) → respiratory (O₂, bronchodilator) → cardiac (ASA 325 mg PO, nitro, AED если VF/VT)',
          'Документация + Good Samaritan protection (Aviation Medical Assistance Act 1998)',
        ],
      },
      'dispatch-cpr': {
        title: 'T-CPR (telephone CPR)',
        c: '#991B1B',
        details: 'Dispatcher-assisted CPR по телефону — критический компонент chain of survival. AHA 2019 recommendation: dispatcher должен распознать OHCA и инструктировать caller начать компрессии.',
        actions: [
          'Распознавание OHCA: unresponsive + not breathing normally (включая agonal gasping)',
          'Dispatcher verbally guides: hands-only compressions (без вентиляции для lay rescuer)',
          'Метрика: компрессии 100–120/мин, центр груди, глубина 5–6 см',
          'Счёт "1, 2, 3..." или музыкальный метроном (Stayin\' Alive)',
          'AED location: спросить, направить помощника',
          'Continuous coaching до прибытия EMS',
          'Квартальный metronome — audio files используются ведущими dispatch centers',
        ],
      },
    };
    const r = map[s] || map.mpds;
    return {
      value: r.title,
      unit: '',
      interpretation: r.details,
      color: r.c,
      details: r.details,
      actions: r.actions,
      caveats: [
        'MPDS — проприетарная система IAED (лицензирование); ESO/NAEMT предлагают альтернативы',
        'SAMU — физиционная модель, редкая вне Франции / франкофонных стран',
        'HEMS эффективен только при существенном time advantage > 15 мин',
        'T-CPR: agonal breathing часто принимается за "дышит" и задерживает CPR — обучать dispatchers',
        'In-flight: Good Samaritan protection не абсолютен, требует добросовестных действий',
      ],
      related: [
        { id: 'bls-acls', title: 'BLS / ACLS AHA' },
        { id: 'erc', title: 'ERC Guidelines' },
        { id: 'ilcor', title: 'ILCOR CoSTR' },
        { id: 'phtls-nm', title: 'PHTLS / ITLS' },
        { id: 'ru-skoraya', title: 'СМП РФ (№388н)' },
        { id: 'ems-assess', title: 'EMS mnemonics' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Неотложная помощь' },
        { id: '301.1', title: 'Анестезиология-реаниматология' },
      ],
    };
  },
  reference: 'Clawson JJ, Dernocoeur KB. Principles of Emergency Medical Dispatch. 6th ed. IAED, 2019. Panchal AR et al. Part 3: Adult BLS/ACLS. Circulation 2020;142:S366. Peterson DC et al. Outcomes of medical emergencies on commercial airline flights. NEJM 2013;368:2075.',
  countries: 'AHA (США), ERC (Европа), IAED/MPDS (60+ стран), SAMU (Франция)',
  presets: [
    { label: 'MPDS dispatch', values: { system: 'mpds' } },
    { label: 'SAMU (France)', values: { system: 'samu' } },
    { label: 'HEMS dispatch', values: { system: 'hems' } },
    { label: 'In-flight', values: { system: 'onboard' } },
    { label: 'T-CPR', values: { system: 'dispatch-cpr' } },
  ],
  info: `### Для чего используется
Обзор систем диспетчеризации и обработки медицинских вызовов / ресурсов экстренной помощи.

### MPDS / AMPDS
Medical Priority Dispatch System (IAED) — 33 главы Chief Complaint, priority codes E/D/C/B/A/O, PAI (pre-arrival instructions).

### SAMU
Французская модель: **médecin régulateur** решает об отправке SMUR / pompiers / ambulance, сохраняет continuum до bed-side.

### HEMS criteria
Physiology · Anatomy · Mechanism · Special populations · Time-distance advantage.

### In-flight EME
- Частота ≈ 1 / 604 вылета
- EMK + AED обязательны (FAA/ICAO)
- Ground consult: MedLink / MedAire / STAT-MD
- Diversion decision — командир

### T-CPR (AHA 2019)
Распознавание → hands-only compressions coaching → metronome → AED guidance.

### Источники
Clawson JJ. *Principles of EMD* 6th ed, 2019.
Peterson DC. *NEJM* 2013;368:2075.
AHA 2020 Guidelines.
`,
};

export default runner;
