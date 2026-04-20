// @ts-nocheck
/** Runner: niaid — NIAID/WAO Anaphylaxis clinical criteria (2006/2020) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'skin', label: 'Кожные/слизистые: крапивница / зуд / ангиоотёк / гиперемия', type: 'checkbox' },
    { id: 'resp', label: 'Респираторный: одышка / хрипы / стридор / гипоксия', type: 'checkbox' },
    { id: 'cv', label: 'Сердечно-сосуд.: гипотония / синкопа / коллапс', type: 'checkbox' },
    { id: 'gi', label: 'ЖКТ: рвота / схватко-образ. боль / диарея', type: 'checkbox' },
    { id: 'knownexposure', label: 'Известный аллерген (для этого пациента)', type: 'checkbox' },
    { id: 'probableallergen', label: 'Вероятный контакт с аллергеном (за минуты-часы)', type: 'checkbox' },
    { id: 'sbpdrop', label: 'Падение САД ≥ 30 % от исходного (или < 90 у взросл.)', type: 'checkbox' },
    { id: 'onsetmin', label: 'Время от экспозиции до симптомов', type: 'number', unit: 'мин', min: 0, max: 240, step: 5, quickValues: [5, 15, 30, 60, 120] },
  ],
  compute: (v) => {
    const skin = !!v.skin;
    const resp = !!v.resp;
    const cv = !!v.cv;
    const gi = !!v.gi;
    const knownAlg = !!v.knownexposure;
    const probAlg = !!v.probableallergen;
    const hypo = !!v.sbpdrop;
    const onset = Number(v.onsetmin) || 0;

    // 3 criteria paths (NIAID 2006 / WAO 2020 update):
    // 1) Acute onset (min-hrs) with skin/mucosa + (respiratory OR cv/hypotension)
    // 2) TWO or more of the following after likely allergen exposure: skin, respiratory, GI, CV
    // 3) Reduced BP after exposure to KNOWN allergen for that patient
    const criterion1 = skin && (resp || cv || hypo) && onset > 0 && onset <= 240;
    const criteriaCount = [skin, resp, gi, cv].filter(Boolean).length;
    const criterion2 = probAlg && criteriaCount >= 2;
    const criterion3 = knownAlg && hypo;

    const meets = criterion1 || criterion2 || criterion3;

    let verdict = '';
    let color = '#10B981';
    const actions: string[] = [];

    if (meets) {
      verdict = 'Анафилаксия подтверждена — немедленное лечение';
      color = '#EF4444';
      actions.push('🚨 АДРЕНАЛИН 0,01 мг/кг (макс. 0,5 мг) в/м латерал. бедра, повторять каждые 5-15 мин');
      actions.push('Уложить пациента (если гипотония — ноги выше), О₂ 8-10 л/мин');
      actions.push('Венозный доступ + кристаллоиды 1-2 л быстро при гипотонии');
      actions.push('H1-блокатор (цетиризин 10 мг / дифенгидрамин 25-50 мг) — вторичная линия');
      actions.push('Системные ГКС (метилпреднизолон 1-2 мг/кг) — для профилактики бифазной реакции');
      actions.push('Сальбутамол небулайзер при бронхоспазме');
      actions.push('Глюкагон 1-5 мг в/в при приёме β-блокаторов (рефрактерн. гипотония)');
      actions.push('Наблюдение ≥ 4-6 ч (или 24 ч при тяжёлой); рецепт автоинъектора адреналина + направл. к аллергологу');
    } else if (criteriaCount >= 1 && (knownAlg || probAlg)) {
      verdict = 'Критерии не выполнены, но есть реакция — тщательный мониторинг';
      color = '#F59E0B';
      actions.push('Мониторинг АД, ЧСС, SpO₂ 2-4 ч');
      actions.push('Антигистаминные + топические ГКС при кожных проявлениях');
      actions.push('Адреналин наготове при эскалации');
    } else {
      verdict = 'Критерии анафилаксии не выполнены';
      color = '#10B981';
      actions.push('Искать альтернативные причины');
    }

    return {
      value: meets ? 'АНАФИЛАКСИЯ' : 'Не анафилаксия',
      unit: 'NIAID/WAO',
      interpretation: verdict,
      color,
      details: `**Выполнение критериев NIAID/WAO:**\n- Критерий 1 (кожа + дыхат./ССС, острое начало): ${criterion1 ? '✅' : '❌'}\n- Критерий 2 (≥ 2 системы после вероятн. аллергена): ${criterion2 ? '✅' : '❌'}\n- Критерий 3 (гипотония после известн. аллергена): ${criterion3 ? '✅' : '❌'}\n\n**Системы поражены:** ${criteriaCount}/4\n- Кожа/слизистые: ${skin ? '✅' : '❌'}\n- Респираторная: ${resp ? '✅' : '❌'}\n- ЖКТ: ${gi ? '✅' : '❌'}\n- ССС: ${cv ? '✅' : '❌'}`,
      actions,
      caveats: [
        'Адреналин — единственная жизнеспасающая терапия. Задержка → повышенная летальность',
        'Н1-блокаторы и ГКС НЕ заменяют адреналин — только как 2-я линия',
        'Бифазная реакция в 5-20 % — наблюдение ≥ 4-6 ч',
        'Триптаза сыворотки (пик 1-3 ч) подтверждает мастоцитарную активацию',
        'β-блокаторы могут сделать адреналин неэффективным → глюкагон',
        'Пациент с анафилаксией в анамнезе ВСЕГДА должен иметь автоинъектор адреналина',
      ],
      scale: {
        segments: [
          { min: 0, max: 1, label: 'Нет крит.', color: '#10B981' },
          { min: 1, max: 2, label: 'Погранично', color: '#F59E0B' },
          { min: 2, max: 5, label: 'Анафилакс.', color: '#EF4444' },
        ],
        current: meets ? 3 : criteriaCount > 0 ? 1.5 : 0.5,
        unit: 'критериев',
      },
      related: [
        { id: 'gell-coombs', title: 'Gell-Coombs' },
        { id: 'mastocytosis', title: 'Мастоцитоз' },
      ],
      relatedCourses: [
        { id: '306.2', title: 'Аллергология' },
        { id: '401.2', title: 'Неотложные состояния' },
      ],
    };
  },
  reference: 'Sampson HA et al. NIAID/FAAN Symposium. J Allergy Clin Immunol 2006;117:391. Cardona V et al. WAO update 2020.',
  countries: 'Международный (NIAID 2006 / WAO 2020)',
  presets: [
    { label: 'Классическая анафилаксия', values: { skin: true, resp: true, cv: false, gi: false, knownexposure: false, probableallergen: true, sbpdrop: false, onsetmin: 15 } },
    { label: 'Гипотония после аллергена', values: { skin: false, resp: false, cv: true, gi: false, knownexposure: true, probableallergen: false, sbpdrop: true, onsetmin: 10 } },
    { label: 'Кожная реакция изолир.', values: { skin: true, resp: false, cv: false, gi: false, knownexposure: false, probableallergen: true, sbpdrop: false, onsetmin: 30 } },
  ],
  info: `### Для чего используется
**Критерии NIAID/FAAN (2006) / WAO (2020)** — клиническая диагностика анафилаксии у постели пациента (без лаб. подтверждения).

### Три пути диагностики (выполнение ≥ 1)
**Критерий 1:** Острое начало (мин-часы) — поражение кожи/слизистых + ≥ 1 из:
- Респираторный компромисс (одышка, хрипы, стридор, гипоксия)
- Снижение АД или симптомы органной гипоперфузии

**Критерий 2:** После контакта с ВЕРОЯТНЫМ аллергеном — ≥ 2 систем:
- Кожа/слизистые
- Респираторная
- Гипотония / симптомы гипоперфузии
- Стойкие гастроинтестинальные (рвота, схватки, диарея)

**Критерий 3:** После контакта с ИЗВЕСТНЫМ аллергеном пациента — изолированное:
- Снижение АД (взр.: САД < 90 или ↓ ≥ 30 % от исход.; дети: САД < возраст. нормы)

### Терапия (ABCDE)
1. **Адреналин** 0,01 мг/кг (макс. 0,5 мг) в/м латерал. бедра — ПЕРВАЯ ЛИНИЯ
2. Повторять каждые 5-15 мин при отсутств. эффекта
3. Уложить + О₂ + кристаллоиды 1-2 л
4. H1-блокаторы, ГКС, β2-агонисты — вторичная линия
5. Глюкагон при β-блокаторах
6. Наблюдение 4-6 ч (бифазная реакция 5-20 %)

### Источник
Sampson HA et al. J Allergy Clin Immunol 2006;117:391. Cardona V et al. World Allergy Organ J 2020;13:100472.`,
};

export default runner;
