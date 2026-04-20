// @ts-nocheck
/** Runner: bnf */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'drug',
      label: 'Препарат',
      type: 'select',
      options: [
        { value: 'amoxicillin', label: 'Amoxicillin' },
        { value: 'paracetamol', label: 'Paracetamol' },
        { value: 'ibuprofen', label: 'Ibuprofen' },
        { value: 'prednisolone', label: 'Prednisolone' },
        { value: 'salbutamol', label: 'Salbutamol' },
        { value: 'ramipril', label: 'Ramipril' },
      ],
    },
    {
      id: 'ageGroup',
      label: 'Возрастная группа',
      type: 'select',
      options: [
        { value: 'adult', label: 'Взрослый (BNF)' },
        { value: 'child', label: 'Ребёнок (BNFC)' },
        { value: 'neonate', label: 'Новорождённый (BNFC)' },
      ],
    },
    {
      id: 'indication',
      label: 'Показание',
      type: 'select',
      options: [
        { value: 'standard', label: 'Стандартное' },
        { value: 'severe', label: 'Тяжёлая инфекция / обострение' },
        { value: 'prophylaxis', label: 'Профилактика' },
      ],
    },
  ],
  compute: (v) => {
    const d = String(v.drug);
    const age = String(v.ageGroup);
    const ind = String(v.indication);
    const doseMap: Record<string, Record<string, string>> = {
      amoxicillin: {
        adult: '500 мг 3 раза/сут (тяжёлая — 1 г 3 раза/сут)',
        child: '20-40 мг/кг/сут в 3 приёма',
        neonate: '30 мг/кг 2 раза/сут',
      },
      paracetamol: {
        adult: '500 мг - 1 г каждые 4-6 ч (макс 4 г/сут)',
        child: '15 мг/кг каждые 4-6 ч (макс 60 мг/кг/сут)',
        neonate: '10 мг/кг каждые 8 ч',
      },
      ibuprofen: {
        adult: '300-400 мг 3-4 раза/сут (макс 2,4 г/сут)',
        child: '5-10 мг/кг 3-4 раза/сут (макс 30 мг/кг/сут)',
        neonate: 'Не применяется',
      },
      prednisolone: {
        adult: '10-60 мг/сут утром',
        child: '1-2 мг/кг/сут (макс 40 мг)',
        neonate: '1-2 мг/кг/сут',
      },
      salbutamol: {
        adult: '100-200 мкг (1-2 вдоха) по потребности; при тяжёлом — небулайзер 2,5-5 мг',
        child: '100-200 мкг (1-2 вдоха); небулайзер 2,5 мг (< 5 лет) / 5 мг (≥ 5)',
        neonate: 'Не стандартно; 0,1-0,2 мг/кг в небулайзере по решению неонатолога',
      },
      ramipril: {
        adult: '1,25-2,5 мг 1 раз/сут, титровать до 10 мг',
        child: '0,05-0,2 мг/кг/сут',
        neonate: 'Не рекомендован',
      },
    };
    let dose = (doseMap[d] && doseMap[d][age]) || 'См. BNF/BNFC';
    if (ind === 'severe' && d === 'amoxicillin') dose = age === 'adult' ? '1 г 3 раза/сут' : '40 мг/кг/сут';
    if (ind === 'prophylaxis' && d === 'amoxicillin') dose = age === 'adult' ? '500 мг 1 раз/сут' : '20 мг/кг/сут';
    const sideEffects: Record<string, string> = {
      amoxicillin: 'Сыпь, диарея, C. difficile; редко анафилаксия, холестаз',
      paracetamol: 'Редко гепатотоксичность при передозировке (N-ацетилцистеин как антидот)',
      ibuprofen: 'ЖК-кровотечение, НПВС-нефропатия, ↑ АД, бронхоспазм у астматиков',
      prednisolone: 'Гипергликемия, остеопороз, инфекции, HPA-супрессия',
      salbutamol: 'Тремор, тахикардия, гипокалиемия при высоких дозах',
      ramipril: 'Кашель, гиперкалиемия, ангионевротический отёк, ОПН при стенозе почечной артерии',
    };
    return {
      value: dose,
      unit: age === 'adult' ? 'BNF' : 'BNFC',
      interpretation: age === 'adult' ? 'BNF adult dose' : 'BNFC paediatric dose',
      color: '#22C55E',
      details: `Препарат: ${d}. Возраст: ${age}. Показание: ${ind}.\n\nДоза (BNF/BNFC): ${dose}\n\nПобочные эффекты: ${sideEffects[d] || '—'}\n\nПолная монография включает: показания, противопоказания, взаимодействия, CI в беременности/лактации, преднизолон-эквиваленты. Доступ через BNF.org или MedicinesComplete (NHS).`,
      actions: [
        'Открыть bnf.nice.org.uk / BNFC (для детей)',
        'Проверить: Indications and dose → Cautions → Interactions → Side-effects',
        'Для NHS — сверить с локальным formulary (trust/ICB)',
        'Проверить беременность/лактацию отдельно (BNF Appendix 4/5)',
      ],
      caveats: [
        'BNF/BNFC — это UK national guidance; в РФ дозы могут отличаться (смотреть РЛС/ГРЛС)',
        'Обновляется раз в 6 месяцев (печатный) и ежемесячно онлайн',
        'Дозировки в BNF учитывают UK-спектр показаний, off-label использование отмечается явно',
        'Педиатрические дозы часто по массе — проверяйте max dose',
      ],
      related: [
        { id: 'stockley', title: 'Stockley\'s Interactions' },
        { id: 'martindale', title: 'Martindale' },
        { id: 'mims', title: 'MIMS (UK)' },
      ],
      relatedCourses: [
        { id: '308.1', title: 'Клиническая фармакология' },
        { id: '308.4', title: 'Педиатрическая фармакология' },
      ],
    };
  },
  reference: 'Joint Formulary Committee. British National Formulary. BMJ Group & Pharmaceutical Press. https://bnf.nice.org.uk/',
  countries: 'Великобритания (NHS)',
  presets: [
    { label: 'Amoxicillin adult standard', values: { drug: 'amoxicillin', ageGroup: 'adult', indication: 'standard' } },
    { label: 'Paracetamol paediatric', values: { drug: 'paracetamol', ageGroup: 'child', indication: 'standard' } },
    { label: 'Prednisolone adult', values: { drug: 'prednisolone', ageGroup: 'adult', indication: 'standard' } },
  ],
  info: `### Для чего используется\n**BNF (British National Formulary)** — официальный UK-справочник лекарственных средств, рекомендованный NHS/NICE. **BNFC** — педиатрическая версия.\n\n### Структура\n- Indications and dose (по показанию)\n- Cautions / Contra-indications\n- Interactions (ссылка на Appendix 1)\n- Side-effects (по частоте)\n- Pregnancy / Breast-feeding (Appendix 4/5)\n- Hepatic / Renal impairment (Appendix 2/3)\n\n### Доступ\n- bnf.nice.org.uk (бесплатно для NHS)\n- MedicinesComplete (подписка)\n- Приложение BNF Publications (iOS/Android)\n- Печатная версия — обновляется 2 раза/год\n\n### Когда использовать\n- Практика в UK (обязательный стандарт)\n- Педиатрия (BNFC — уникальный источник по детским дозам)\n- Международные рекомендации (особенно бывшие страны Содружества)`,
};
export default runner;
