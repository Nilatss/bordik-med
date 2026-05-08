/** Runner: epals - EPALS / APLS / EPLS (ERC 2021, APLS 7th ed) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'step',
      label: 'Этап EPALS',
      type: 'select',
      options: [
        { value: 'abcde', label: 'Primary survey ABCDE' },
        { value: 'resp', label: 'Respiratory failure / distress' },
        { value: 'shock', label: 'Shock (компенсированный / декомпенс.)' },
        { value: 'arrest', label: 'Cardiac arrest (шок/нешок)' },
        { value: 'drugs', label: 'Drug doses (по кг)' },
      ],
    },
  ],
  compute: (v) => {
    const s = String(v.step);
    const map: Record<string, { title: string; c: string; details: string; actions: string[] }> = {
      abcde: {
        title: 'Primary survey - ABCDE',
        c: '#22C55E',
        details: 'Систематический подход EPALS: Airway, Breathing, Circulation, Disability, Exposure. Распознать compromised child до остановки.',
        actions: [
          'A - открыть airway, заподозрить обструкцию (stridor, drooling)',
          'B - SpO₂, ЧД, работа дыхания (retractions, grunting), аускультация, FiO₂',
          'C - ЧСС, CRT, АД, пульс центральный/периферический, IV/IO access',
          'D - AVPU / pGCS, зрачки, глюкоза (don\'t ever forget glucose!)',
          'E - полный осмотр, температура, сыпь; prevent hypothermia',
        ],
      },
      resp: {
        title: 'Respiratory distress / failure',
        c: '#F59E0B',
        details: 'Дыхательная недостаточность - ведущая причина остановки у детей. Distress → failure → arrest.',
        actions: [
          'Оксигенация: high-flow O₂ маска / NRM 15 л/мин',
          'HFNC / CPAP при необходимости',
          'Bronchodilator (salbutamol 2.5-5 мг neb) при бронхоспазме',
          'Adrenaline небулайзерный 0.5 мл/кг 1:1000 (макс 5 мл) при крупе/стридоре',
          'Intubation при failure: ketamine 1-2 мг/кг + rocuronium 1 мг/кг',
          'Размер ETT: (возраст/4)+4 uncuffed, (возраст/4)+3.5 cuffed',
        ],
      },
      shock: {
        title: 'Shock',
        c: '#EF4444',
        details: 'Ребёнок компенсирует шок дольше взрослого через тахикардию и периферическую вазоконстрикцию. Гипотензия = поздний признак.',
        actions: [
          'IV/IO доступ за ≤90 с (IO при невозможности IV)',
          'Болюс 10-20 мл/кг кристаллоида (Hartmann / Ringer lactate / 0.9% NaCl)',
          'До 3 болюсов, затем - вазопрессоры (адреналин / норэпинефрин)',
          'Септический шок: AB широкого спектра в 1-й час',
          'Кардиогенный: осторожно с жидкостями, раннее инотропы',
          'Анафилактический: адреналин 0.01 мг/кг (макс 0.5) IM 1:1000',
        ],
      },
      arrest: {
        title: 'Cardiac arrest',
        c: '#991B1B',
        details: 'Остановка сердца у детей чаще нешокабельная (асфиксия). Шокабельные - ~10%. Алгоритм: СЛР + ритм-анализ каждые 2 мин.',
        actions: [
          'Качественная СЛР: 15:2 (2 спасателя), глубина 1/3 AP',
          'Шокабельные (VF/pVT): 4 Дж/кг (эскалация до 8 Дж/кг); амиодарон 5 мг/кг после 3-го разряда',
          'Нешокабельные (асистолия/ПЭА): эпинефрин 10 мкг/кг IV/IO как можно раньше, каждые 3-5 мин',
          'Искать 4H/4T - особенно гипоксия, гиповолемия',
          'Airway: BVM с 2 спасателями; ETT/SGA опытными',
        ],
      },
      drugs: {
        title: 'Drug doses - по массе',
        c: '#4B8DF5',
        details: 'EPALS дозы по кг. Использовать Broselow / APLS length-based tape для быстрого расчёта.',
        actions: [
          'Эпинефрин 10 мкг/кг (0.1 мл/кг 1:10 000) IV/IO, макс 1 мг',
          'Амиодарон 5 мг/кг IV/IO болюс (макс 300 мг)',
          'Атропин 20 мкг/кг (min 100 мкг, max 500 мкг)',
          'Аденозин 100 мкг/кг (max 6 мг) → 200 мкг/кг (max 12 мг)',
          'Глюкоза 2 мл/кг 10% (0.2 г/кг)',
          'Диазепам 0.25 мг/кг IV / 0.5 мг/кг PR (судороги)',
          'Магний 25-50 мг/кг IV (астма, TdP)',
        ],
      },
    };
    const r = (map[s] || map.abcde)!;
    return {
      value: r.title,
      unit: '',
      interpretation: r.details,
      color: r.c,
      details: r.details,
      actions: r.actions,
      caveats: [
        'Педиатрия: "children are not small adults" - физиология и дозы отличаются',
        'Broselow tape / APLS WetFlag - быстрый расчёт веса/доз по длине',
        'Don\'t ever forget glucose!',
      ],
      related: [
        { id: 'pals', title: 'AHA PALS' },
        { id: 'pears', title: 'AHA PEARS' },
        { id: 'erc', title: 'ERC Paediatric' },
        { id: 'ilcor', title: 'ILCOR PLS' },
        { id: 'pat', title: 'PAT' },
        { id: 'broselow', title: 'Broselow tape' },
      ],
      relatedCourses: [
        { id: '302.2', title: 'Педиатрия' },
        { id: '300.4', title: 'Неотложная помощь' },
      ],
    };
  },
  reference: 'Van de Voorde P et al. European Resuscitation Council Guidelines 2021: Paediatric Life Support. Resuscitation 2021;161:327-387. Advanced Life Support Group. Advanced Paediatric Life Support (APLS) 7th ed. Wiley 2023.',
  countries: 'Европа (ERC), Великобритания (APLS), международно',
  presets: [
    { label: 'ABCDE', values: { step: 'abcde' } },
    { label: 'Respiratory', values: { step: 'resp' } },
    { label: 'Shock', values: { step: 'shock' } },
    { label: 'Cardiac arrest', values: { step: 'arrest' } },
    { label: 'Drug doses', values: { step: 'drugs' } },
  ],
  info: `### Для чего используется
**EPALS (European Paediatric Advanced Life Support)** - ERC, **APLS** - UK (ALSG), **EPLS** - ERC/APLS. Педиатрическая ALS для врачей и медсестёр.

### Структура
1. Primary survey ABCDE
2. Respiratory distress / failure
3. Shock
4. Cardiac arrest
5. Post-ROSC
6. Specific conditions (sepsis, trauma, seizures, poisoning)

### Ключевые параметры СЛР
| Параметр | Значение |
|---|---|
| Частота | 100-120/мин |
| Глубина | 1/3 AP диаметра |
| Соотношение (2 спасателя) | 15:2 |
| Соотношение (1 спасатель) | 30:2 |
| Дефибрилляция | 4 Дж/кг (эск. до 8) |
| Эпинефрин | 10 мкг/кг IV/IO q3-5 мин |
| Амиодарон | 5 мг/кг после 3-го разряда |

### Размеры ETT
- Uncuffed: (возраст/4) + 4
- Cuffed: (возраст/4) + 3.5
- Глубина: возраст/2 + 12 (oral)

### WetFlag (APLS)
- **W** Weight: (age+4)×2
- **E** Energy: 4 Дж/кг
- **T** Tube: age/4 + 4
- **F** Fluids: 10 мл/кг болюс
- **L** Lorazepam 0.1 мг/кг
- **A** Adrenaline 10 мкг/кг
- **G** Glucose 2 мл/кг 10%

### Источники
Van de Voorde P et al. ERC 2021 Paediatric Life Support. *Resuscitation* 2021;161.
ALSG. APLS 7th ed. Wiley 2023.
`,
};

export default runner;
