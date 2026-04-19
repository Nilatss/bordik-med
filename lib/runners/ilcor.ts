// @ts-nocheck
/** Runner: ilcor — ILCOR CoSTR (Consensus on Science with Treatment Recommendations) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'tf',
      label: 'Task Force ILCOR',
      type: 'select',
      options: [
        { value: 'bls', label: 'BLS — Basic Life Support' },
        { value: 'als', label: 'ALS — Advanced Life Support' },
        { value: 'peds', label: 'Paediatric Life Support' },
        { value: 'neo', label: 'Neonatal Life Support' },
        { value: 'eit', label: 'EIT — Education, Implementation, Teams' },
        { value: 'fa', label: 'First Aid' },
      ],
    },
  ],
  compute: (v) => {
    const t = String(v.tf);
    const map: Record<string, { title: string; c: string; details: string; actions: string[] }> = {
      bls: {
        title: 'ILCOR BLS Task Force',
        c: '#EF4444',
        details: 'Международный консенсус по базовой жизнеподдержке. Координирует: качество компрессий, AED, compression-only, диспетчер-ассистированную СЛР.',
        actions: [
          'Компрессии 100–120/мин, глубина 5–6 см',
          'Компрессионная фракция ≥60%',
          'AED в общественных местах (PAD programs)',
          'T-CPR (telephone CPR) — рекомендуется диспетчерам',
          'Compression-only CPR приемлем для непрофессионалов',
        ],
      },
      als: {
        title: 'ILCOR ALS Task Force',
        c: '#991B1B',
        details: 'Продвинутая жизнеподдержка: лекарства, airway, post-ROSC. 2024 обновления по ECPR, DSED, головному TTM.',
        actions: [
          'Эпинефрин 1 мг IV/IO каждые 3–5 мин (ранний при нешокабельных)',
          'Амиодарон 300→150 мг / лидокаин как альтернатива',
          'Капнография обязательна',
          'ECPR (веновенозная ЭКМО-СЛР) — рассмотреть в отобранных случаях',
          'TTM 32–36 °C или нормотермия ≤37.7 °C (CoSTR 2024)',
        ],
      },
      peds: {
        title: 'ILCOR Paediatric Task Force',
        c: '#DC2626',
        details: 'Педиатрическая жизнеподдержка (1 день – пубертат). Координирует глубину компрессий, FiO₂, дозы препаратов.',
        actions: [
          'Компрессии ~1/3 AP диаметра грудной клетки',
          '15:2 при 2 спасателях, 30:2 при 1',
          'Эпинефрин 0.01 мг/кг IV/IO (макс 1 мг), каждые 3–5 мин',
          'Дефибрилляция 4 Дж/кг (эскалация до 8 Дж/кг)',
          'Ранний airway + оксигенация (чаще асфиксическая остановка)',
        ],
      },
      neo: {
        title: 'ILCOR Neonatal Task Force',
        c: '#7C2D12',
        details: 'Реанимация новорождённых. Координирует NRP (AAP), ERC Neonatal, HBB. Золотая минута, FiO₂ 21% (термин), 21–30% (преждевременные).',
        actions: [
          'Golden Minute: просушить, стимулировать, оценить дыхание/ЧСС',
          'PPV при апноэ / ЧСС <100 — в течение 60 с',
          'Компрессии 3:1 при ЧСС <60 после 30 с эффективной PPV',
          'Эпинефрин 0.01–0.03 мг/кг IV / 0.05–0.1 мг/кг ETT',
          'Pulse oximetry на правой руке (preductal) в первые минуты',
        ],
      },
      eit: {
        title: 'ILCOR EIT Task Force',
        c: '#4B8DF5',
        details: 'Education, Implementation, Teams: обучение, внедрение, командная работа. Дебрифинг, симуляция, feedback-устройства.',
        actions: [
          'Дебрифинг после реанимации — улучшает качество',
          'Симуляционное обучение с манекенами и feedback',
          'Ретрейнинг BLS каждые 3–6 мес',
          'Team-based подход (CRM crew resource management)',
        ],
      },
      fa: {
        title: 'ILCOR First Aid Task Force',
        c: '#22C55E',
        details: 'Первая помощь: гипогликемия, инсульт, кровотечение, ожоги, анафилаксия — до прибытия EMS.',
        actions: [
          'FAST-распознавание инсульта (Face/Arm/Speech/Time)',
          'Гипогликемия в сознании — глюкоза PO 15–20 г',
          'Жгут при массивном кровотечении конечности',
          'Ожог — охлаждать проточной водой 20 мин',
          'Анафилаксия — эпинефрин автоинъектор IM',
        ],
      },
    };
    const r = map[t] || map.bls;
    return {
      value: r.title,
      unit: '',
      interpretation: r.details,
      color: r.c,
      details: r.details,
      actions: r.actions,
      caveats: [
        'ILCOR = консенсус, не протокол — национальные советы адаптируют',
        'CoSTR публикуется ежегодно (continuous evidence evaluation)',
        'Члены: AHA, ERC, HSFC, RCSA, ANZCOR, IAHF, InterAmerican Heart Foundation',
      ],
      related: [
        { id: 'bls-acls', title: 'AHA BLS/ACLS' },
        { id: 'erc', title: 'ERC Guidelines' },
        { id: 'anzcor', title: 'ANZCOR' },
        { id: 'nrp', title: 'AAP NRP' },
        { id: 'epals', title: 'EPALS' },
        { id: 'hbb', title: 'Helping Babies Breathe' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Неотложная помощь' },
        { id: '301.1', title: 'Анестезиология-реаниматология' },
      ],
    };
  },
  reference: 'International Liaison Committee on Resuscitation (ILCOR). 2020 International Consensus on CPR and ECC Science with Treatment Recommendations. Circulation 2020;142(16_suppl_1). Annual CoSTR updates 2021–2024.',
  countries: 'Международный (AHA, ERC, ANZCOR, HSFC, RCSA, IAHF, InterAmerican HF)',
  presets: [
    { label: 'BLS', values: { tf: 'bls' } },
    { label: 'ALS', values: { tf: 'als' } },
    { label: 'Paediatric', values: { tf: 'peds' } },
    { label: 'Neonatal', values: { tf: 'neo' } },
    { label: 'EIT', values: { tf: 'eit' } },
    { label: 'First Aid', values: { tf: 'fa' } },
  ],
  info: `### Для чего используется
**ILCOR (International Liaison Committee on Resuscitation)** — международный консенсус-орган, объединяющий AHA, ERC, HSFC (Канада), ANZCOR (Австралия/НЗ), RCSA (ЮА), IAHF, InterAmerican HF. Публикует **CoSTR** — Consensus on Science with Treatment Recommendations.

### 6 Task Forces
1. BLS
2. ALS
3. Paediatric Life Support (PLS)
4. Neonatal Life Support (NLS)
5. Education, Implementation, Teams (EIT)
6. First Aid

### Методология
- PICO-вопросы → систематический обзор (GRADE)
- CoSTR draft → public comment → publication
- Национальные советы (AHA, ERC) публикуют свои guidelines на базе CoSTR

### 2024 обновления (избранное)
- Нормотермия ≤37.7 °C vs TTM 32–36 (обе приемлемы, TTM2)
- ECPR в отобранных случаях OHCA/IHCA
- DSED (Double Sequential External Defibrillation) — в рамках исследований
- Раннее введение эпинефрина при нешокабельных

### Источники
Wyckoff MH et al. ILCOR CoSTR 2024. *Resuscitation* / *Circulation* 2024.
`,
};

export default runner;
