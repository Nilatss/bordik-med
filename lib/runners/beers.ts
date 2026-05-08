/** Runner: beers */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'drugClass',
      label: 'Класс / препарат',
      type: 'select',
      options: [
        { value: 'benzo', label: 'Бензодиазепины (диазепам, алпразолам)' },
        { value: 'zdrugs', label: 'Z-препараты (золпидем, зопиклон)' },
        { value: 'anticholinergic', label: 'Антихолинергики 1-го поколения (дифенгидрамин)' },
        { value: 'tca', label: 'Трициклические АД (амитриптилин)' },
        { value: 'nsaid', label: 'НПВП (длительно)' },
        { value: 'ppi', label: 'ИПП > 8 недель' },
        { value: 'sulfonylurea', label: 'Сульфонилмочевина длительного действия (глибенкламид)' },
        { value: 'alpha-blocker', label: 'α-блокаторы (доксазозин) при АГ' },
        { value: 'digoxin', label: 'Дигоксин > 0,125 мг/сут' },
        { value: 'antipsychotic', label: 'Антипсихотики' },
        { value: 'muscle-relaxant', label: 'Миорелаксанты (циклобензаприн)' },
      ],
    },
    {
      id: 'comorbidity',
      label: 'Сопутствующая патология',
      type: 'select',
      options: [
        { value: 'none', label: 'Нет значимой' },
        { value: 'hf', label: 'Сердечная недостаточность' },
        { value: 'ckd', label: 'ХБП (eGFR < 60)' },
        { value: 'dementia', label: 'Деменция / когнитивные нарушения' },
        { value: 'falls', label: 'Падения в анамнезе' },
        { value: 'delirium', label: 'Делирий в анамнезе' },
        { value: 'parkinson', label: 'Болезнь Паркинсона' },
      ],
    },
    {
      id: 'age',
      label: 'Возраст',
      type: 'select',
      options: [
        { value: '65-74', label: '65–74' },
        { value: '75-84', label: '75–84' },
        { value: '85+', label: '≥ 85' },
      ],
    },
  ],
  compute: (v) => {
    const dc = String(v.drugClass);
    const co = String(v.comorbidity);
    const age = String(v.age);

    type R = { rec: 'avoid' | 'caution' | 'conditional'; rationale: string };
    const baseMap: Record<string, R> = {
      'benzo': { rec: 'avoid', rationale: '↑ риск падений, переломов, делирия, когнитивных нарушений. Избегать во всех случаях, кроме алкогольного синдрома отмены/судорог.' },
      'zdrugs': { rec: 'avoid', rationale: '↑ риск падений, делирия; эффект на сон минимальный.' },
      'anticholinergic': { rec: 'avoid', rationale: 'Сильный антихолинергический эффект → когнитивное ухудшение, запоры, задержка мочи, спутанность.' },
      'tca': { rec: 'avoid', rationale: 'Антихолинергический эффект + ортостаз + QT-удлинение. Альтернатива: СИОЗС (не пароксетин).' },
      'nsaid': { rec: 'caution', rationale: '↑ риск ЖКК, АГ, ОПН, СН. Использовать < 5 дней, с ИПП при необходимости.' },
      'ppi': { rec: 'caution', rationale: 'Риск C. difficile, переломов, B12-дефицита, гипомагниемии. Деэскалировать через 8 недель.' },
      'sulfonylurea': { rec: 'avoid', rationale: 'Длительные гипогликемии. Альтернатива: глипизид или метформин.' },
      'alpha-blocker': { rec: 'avoid', rationale: 'Ортостатическая гипотензия, падения. Не использовать как препарат 1-й линии при АГ.' },
      'digoxin': { rec: 'caution', rationale: 'Накопление при ХБП. Целевая концентрация < 0,9 нг/мл, доза ≤ 0,125 мг/сут.' },
      'antipsychotic': { rec: 'avoid', rationale: 'При деменции — ↑ риск ОНМК и смерти (black box). Только при острой агрессии, коротко.' },
      'muscle-relaxant': { rec: 'avoid', rationale: 'Антихолинергический эффект, седация, падения. Сомнительная эффективность.' },
    };

    let r = baseMap[dc] || { rec: 'caution', rationale: 'Сверить в AGS Beers Criteria 2023 — класс-специфичная рекомендация.' };

    if (co === 'hf' && dc === 'nsaid') { r = { rec: 'avoid', rationale: 'НПВП + СН: задержка жидкости, декомпенсация — избегать.' }; }
    if (co === 'dementia' && dc === 'antipsychotic') { r = { rec: 'avoid', rationale: 'BBW: ↑ смертность у пациентов с деменцией на антипсихотиках.' }; }
    if (co === 'falls' && (dc === 'benzo' || dc === 'zdrugs')) { r = { rec: 'avoid', rationale: 'Падения в анамнезе + седативное — абсолютно избегать.' }; }
    if (co === 'delirium' && dc === 'anticholinergic') { r = { rec: 'avoid', rationale: 'Делирий в анамнезе + антихолинергик — провокация рецидива.' }; }
    if (co === 'parkinson' && dc === 'antipsychotic') { r = { rec: 'avoid', rationale: 'Блокада D2 ухудшает паркинсонизм. Исключения: кветиапин, клозапин в малых дозах.' }; }
    if (co === 'ckd' && dc === 'nsaid') { r = { rec: 'avoid', rationale: 'ХБП + НПВП: прогрессия ОПН, гиперкалиемия.' }; }

    const recMap = {
      avoid: { label: 'AVOID — избегать', color: '#EF4444' },
      caution: { label: 'USE WITH CAUTION — осторожно', color: '#F59E0B' },
      conditional: { label: 'CONDITIONAL — зависит от условия', color: '#FBBF24' },
    };
    const rm = recMap[r.rec];

    return {
      value: rm.label,
      unit: 'Beers 2023',
      interpretation: r.rationale,
      color: rm.color,
      details: `Препарат/класс: ${dc}. Коморбидность: ${co}. Возраст: ${age}.\n\nРекомендация AGS Beers 2023: ${rm.label}\n\nОбоснование: ${r.rationale}\n\nОбщие принципы:\n- Deprescribing: пересмотреть каждый препарат ежегодно\n- START/STOPP (Европа) — альтернатива Beers\n- Используйте минимальную эффективную дозу\n- Корректируйте на eGFR, массу тела, печёночную функцию`,
      actions: [
        'Сверить в AGS Beers Criteria 2023 — полная таблица в JAGS',
        'Рассмотреть deprescribing: постепенная отмена с заменой',
        'Документировать в карте: "Beers — избегать / осторожно"',
        'Для EU пациентов — параллельно STOPP/START Criteria v3',
        'Оценка по Medication Appropriateness Index (MAI)',
      ],
      caveats: [
        'AGS Beers — для США, но используется глобально как ориентир',
        'Критерии обновляются каждые 3 года (последняя 2023)',
        'Не абсолютное противопоказание — оценка польза/риск индивидуально',
        'В РФ нет официального аналога — используется Beers как гериатрический стандарт',
        'Европейский аналог — STOPP/START (O\'Mahony et al.)',
      ],
      related: [
        { id: 'stopp-start', title: 'STOPP/START Criteria' },
        { id: 'mai', title: 'Medication Appropriateness Index' },
        { id: 'lexicomp', title: 'Lexicomp' },
      ],
      relatedCourses: [
        { id: '308.1', title: 'Клиническая фармакология' },
        { id: '308.2', title: 'Гериатрия' },
        { id: '308.3', title: 'Лекарственные взаимодействия' },
      ],
    };
  },
  reference: 'American Geriatrics Society Beers Criteria® Update Expert Panel. AGS 2023 Updated Beers Criteria. J Am Geriatr Soc. 2023;71(7):2052-2081.',
  countries: 'США (AGS) · используется глобально',
  presets: [
    { label: 'Бензодиазепин + падения', values: { drugClass: 'benzo', comorbidity: 'falls', age: '75-84' } },
    { label: 'Антипсихотик + деменция', values: { drugClass: 'antipsychotic', comorbidity: 'dementia', age: '85+' } },
    { label: 'НПВП + ХБП', values: { drugClass: 'nsaid', comorbidity: 'ckd', age: '65-74' } },
  ],
  info: `### Для чего используется\n**Beers Criteria (AGS 2023)** — эталонный перечень потенциально нежелательных препаратов (PIMs) у пациентов ≥ 65 лет.\n\n### 5 таблиц Beers\n1. PIMs независимо от условий\n2. PIMs при конкретных заболеваниях\n3. Препараты, требующие осторожности\n4. Клинически значимые лекарственные взаимодействия\n5. Препараты, требующие коррекции по eGFR\n\n### Категории рекомендаций\n- **Avoid** — избегать\n- **Use with caution** — использовать осторожно\n- **Avoid in [condition]** — избегать при конкретной патологии\n\n### Когда применять\n- Полипрагмазия у пожилого пациента (5+ препаратов)\n- Ежегодный medication review\n- При выписке из стационара\n- При новом диагнозе деменции / падений\n\n### Аналоги\n- **STOPP/START** (Европа, 2023 v3)\n- **PRISCUS** (Германия)\n- **Medication Appropriateness Index (MAI)**`,
};
export default runner;
