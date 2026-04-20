// @ts-nocheck
/** Runner: erc - ERC Guidelines 2021 / 2025 */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'phase',
      label: 'Раздел ERC',
      type: 'select',
      options: [
        { value: 'bls', label: 'Adult BLS' },
        { value: 'als', label: 'Adult ALS' },
        { value: 'post', label: 'Post-ROSC (постресусцитационная помощь)' },
        { value: 'special', label: 'Special circumstances (особые обстоятельства)' },
      ],
    },
  ],
  compute: (v) => {
    const p = String(v.phase);
    const map: Record<string, { title: string; c: string; details: string; actions: string[]; caveats: string[] }> = {
      bls: {
        title: 'ERC Adult BLS',
        c: '#EF4444',
        details: 'ERC 2021/2025: раннее распознавание, вызов EMS, качественная СЛР 30:2, ранняя дефибрилляция AED. Акцент на широкое использование надгортанных воздуховодов (SGA) спасателями.',
        actions: [
          'Оценить реакцию и дыхание одновременно (≤10 с)',
          'Вызов 112/EMS, отправить за AED',
          'Компрессии 100-120/мин, глубина 5-6 см, центр груди',
          '30 компрессий : 2 вдоха; if reluctant - compression-only CPR',
          'AED как только доступен',
          'Диспетчер-ассистированная СЛР (T-CPR) при сомнениях',
        ],
        caveats: [
          'ERC акцентирует SGA (iGel) для не-врачей - легче ETT, безопаснее',
          'Compression-only CPR допустим при нежелании делать вдохи (взрослые)',
        ],
      },
      als: {
        title: 'ERC Adult ALS',
        c: '#991B1B',
        details: 'ERC ALS 2021/2025: универсальный алгоритм - СЛР → анализ ритма каждые 2 мин → шок (если шокабельный) → препараты. Минимизация пауз, капнография, поиск 4H/4T.',
        actions: [
          'Шокабельные (VF/pVT): разряд 150-200 Дж бифазный, СЛР 2 мин сразу',
          'Эпинефрин 1 мг IV/IO: после 3-го разряда при VF/pVT, сразу при асистолии/ПЭА; затем каждые 3-5 мин',
          'Амиодарон 300 мг после 3-го разряда, 150 мг после 5-го (или лидокаин 100 мг / 50 мг)',
          'SGA (iGel) - 1-я линия airway; ETT только опытным',
          'Капнография обязательна (подтверждение ETT + качество СЛР + ROSC)',
          'Искать 4H/4T: Hypoxia, Hypovolaemia, Hypo/Hyperkalaemia+metabolic, Hypothermia; Thrombosis, Tamponade, Tension PTX, Toxins',
          'USG-POCUS для диагностики обратимых причин',
        ],
        caveats: [
          'Эпинефрин при нешокабельных - как можно раньше',
          'Двойная последовательная дефибрилляция (DSED) - только в рамках исследований',
        ],
      },
      post: {
        title: 'ERC Post-ROSC',
        c: '#4B8DF5',
        details: 'ERC/ESICM Post-Resuscitation Care 2021: ABCDE подход, коронарография, TTM 32-36 °C или активный контроль нормотермии ≤37.7 °C, нейропрогноз мультимодально ≥72 ч.',
        actions: [
          'SpO₂ 94-98%; EtCO₂ 35-45 мм рт.ст.; PaCO₂ 35-45',
          'MAP ≥65 (цель индивидуальна; лактат, диурез)',
          'TTM 32-36 °C × 24 ч ИЛИ контроль нормотермии ≤37.7 °C × 72 ч (TTM2)',
          'Срочная коронарография при STEMI; при без-STEMI - по клинике (COACT, TOMAHAWK)',
          'Нейропрогноз ≥72 ч: клиника + двусторонние N20 СЭП + ЭЭГ + NSE + МРТ/КТ',
          'Гликемия ≤10 ммоль/л, избегать гипогликемии',
          'Профилактика судорог при их возникновении (леветирацетам)',
        ],
        caveats: [
          'ERC 2021/2025 признаёт нормотермию как альтернативу TTM32-36 (TTM2 trial)',
          'Не прекращать поддержку ранее 72 ч без мультимодальных данных',
        ],
      },
      special: {
        title: 'ERC Special Circumstances',
        c: '#F59E0B',
        details: 'Особые обстоятельства: гипотермия, утопление, анафилаксия, астма, ТЭЛА, беременность, травма, электротравма, токсикология.',
        actions: [
          'Гипотермия <30 °C: ЭКМО/CPB-rewarming, ограничить эпинефрин/разряды до ≥30 °C',
          'Утопление: 5 начальных вдохов → СЛР, подозревать гипоксическую остановку',
          'Анафилаксия: эпинефрин 0.5 мг IM (0.01 мг/кг), жидкости, H1/H2, ГКС',
          'Астма: β2-агонист, магний 2 г, ИВЛ с длинным Te',
          'ТЭЛА: тромболизис (альтеплаза 50 мг болюс) при подозрении, СЛР 60-90 мин',
          'Беременность ≥20 нед: manual LUD (сдвиг матки), peri-mortem cesarean ≤5 мин',
          'Травматическая остановка: контроль кровотечения + декомпрессия + thoracotomy',
        ],
        caveats: [
          'При глубокой гипотермии - "not dead until warm and dead"',
          'Peri-mortem cesarean - улучшает исход матери и плода',
        ],
      },
    };
    const r = map[p] || map.bls;
    return {
      value: r.title,
      unit: '',
      interpretation: r.details,
      color: r.c,
      details: r.details,
      actions: r.actions,
      caveats: r.caveats,
      related: [
        { id: 'bls-acls', title: 'AHA BLS/ACLS' },
        { id: 'ilcor', title: 'ILCOR CoSTR' },
        { id: 'anzcor', title: 'ANZCOR' },
        { id: 'epals', title: 'EPALS / APLS' },
        { id: 'nrp', title: 'NRP' },
        { id: 'far-ru', title: 'ФАР РФ СЛР' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Неотложная помощь' },
        { id: '301.1', title: 'Анестезиология-реаниматология' },
      ],
    };
  },
  reference: 'Perkins GD, Graesner JT, Semeraro F, et al. European Resuscitation Council Guidelines 2021: Executive summary. Resuscitation 2021;161:1-60. ERC 2025 update.',
  countries: 'Европа (ERC member councils)',
  presets: [
    { label: 'Adult BLS', values: { phase: 'bls' } },
    { label: 'Adult ALS', values: { phase: 'als' } },
    { label: 'Post-ROSC', values: { phase: 'post' } },
    { label: 'Особые обстоятельства', values: { phase: 'special' } },
  ],
  info: `### Для чего используется
**ERC Guidelines 2021 / 2025** - European Resuscitation Council, основа европейских протоколов СЛР. Гармонизированы с ILCOR CoSTR.

### Структура
1. Epidemiology of cardiac arrest
2. Systems saving lives
3. Adult BLS
4. Adult ALS
5. Cardiac arrest in special circumstances
6. Post-resuscitation care
7. First aid
8. Neonatal life support
9. Paediatric life support
10. Ethics
11. Education

### Отличия от AHA
- ERC активнее продвигает **SGA (iGel)** как 1-ю линию airway
- Нормотермия ≤37.7 °C как альтернатива TTM 32-36 (TTM2)
- 4H / 4T формулировка (AHA - Hs/Ts)

### Ключевые разряды
- Бифазный: 150-200 Дж (по производителю), далее эскалация
- Монофазный: 360 Дж

### Источники
Perkins GD et al. ERC 2021 Executive Summary. *Resuscitation* 2021;161.
Nolan JP et al. ERC-ESICM Post-Resuscitation Care 2021.
`,
};

export default runner;
