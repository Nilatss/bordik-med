// @ts-nocheck
/** Runner: stockley */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'drugA',
      label: 'Препарат A',
      type: 'select',
      options: [
        { value: 'warfarin', label: 'Warfarin' },
        { value: 'digoxin', label: 'Digoxin' },
        { value: 'methotrexate', label: 'Methotrexate' },
        { value: 'lithium', label: 'Lithium' },
        { value: 'ciclosporin', label: 'Ciclosporin' },
        { value: 'phenytoin', label: 'Phenytoin' },
      ],
    },
    {
      id: 'drugB',
      label: 'Препарат B',
      type: 'select',
      options: [
        { value: 'nsaid', label: 'НПВС (ибупрофен)' },
        { value: 'amiodarone', label: 'Amiodarone' },
        { value: 'trimethoprim', label: 'Trimethoprim' },
        { value: 'thiazide', label: 'Тиазидные диуретики' },
        { value: 'rifampicin', label: 'Rifampicin' },
        { value: 'fluconazole', label: 'Fluconazole' },
      ],
    },
    {
      id: 'interactionType',
      label: 'Тип взаимодействия',
      type: 'select',
      options: [
        { value: 'auto', label: 'Автоопределение' },
        { value: 'pk', label: 'Фармакокинетическое' },
        { value: 'pd', label: 'Фармакодинамическое' },
      ],
    },
  ],
  compute: (v) => {
    const a = String(v.drugA);
    const b = String(v.drugB);
    let severity = 'Moderate';
    let summary = 'Проверьте Stockley\'s Drug Interactions (текущее издание).';
    let action = 'Мониторировать клинически.';
    let color = '#F59E0B';
    if ((a === 'warfarin' && b === 'nsaid')) {
      severity = 'Severe'; color = '#EF4444';
      summary = 'НПВС + варфарин — ↑ риск ЖК-кровотечения (слизистая + антитромбоцитарный эффект).';
      action = 'Избегать; если необходимо — кратковременно, ИПП + контроль МНО/Hb.';
    } else if ((a === 'methotrexate' && b === 'trimethoprim')) {
      severity = 'Severe'; color = '#991B1B';
      summary = 'Триметоприм (включая котримоксазол) — антифолатный синергизм → миелосупрессия.';
      action = 'Противопоказано при низкодозном МТХ у ревматологов; избегать.';
    } else if ((a === 'lithium' && b === 'thiazide')) {
      severity = 'Severe'; color = '#EF4444';
      summary = 'Тиазиды ↓ почечную экскрецию лития → токсичность.';
      action = 'Снизить дозу лития на 30-50%, контроль уровня лития через 4-5 дней.';
    } else if ((a === 'digoxin' && b === 'amiodarone')) {
      severity = 'Severe'; color = '#EF4444';
      summary = 'Амиодарон ингибирует P-gp и почечный клиренс дигоксина → ↑ уровень вдвое.';
      action = 'Снизить дозу дигоксина на 50%, контроль уровня через 7 дней.';
    } else if ((a === 'ciclosporin' && b === 'rifampicin')) {
      severity = 'Severe'; color = '#EF4444';
      summary = 'Рифампицин — сильный индуктор CYP3A4 → ↓ циклоспорина, риск отторжения.';
      action = 'Избегать; если нужен рифампицин — повысить дозу ЦсА в 2-3 раза с TDM.';
    } else if ((a === 'phenytoin' && b === 'fluconazole')) {
      severity = 'Severe'; color = '#EF4444';
      summary = 'Флуконазол ингибирует CYP2C9 → ↑ фенитоина.';
      action = 'Контроль уровня фенитоина, снизить дозу.';
    }
    return {
      value: severity,
      unit: 'Stockley',
      interpretation: `Stockley\'s: ${severity}`,
      color,
      details: `Пара: ${a} + ${b}.\n\n${summary}\n\nРекомендуемое действие: ${action}\n\nПолный текст с цитированием первичных исследований — в текущем печатном/онлайн издании Stockley\'s Drug Interactions (Pharmaceutical Press).`,
      actions: [
        'Открыть MedicinesComplete → Stockley\'s Drug Interactions',
        'Ввести оба МНН; прочитать раздел "Importance and management"',
        'Сверить с BNF для UK-специфичных рекомендаций',
        'Документировать проверку в амбулаторной карте',
      ],
      caveats: [
        'Stockley\'s ориентирован на UK/ЕС — некоторые препараты недоступны в РФ',
        'Тяжесть может отличаться от Lexicomp (разные методологии оценки)',
        'Для NHS обычно используется BNF Interactions Appendix, не Stockley',
        'Обновляется ежемесячно в онлайн-версии MedicinesComplete',
      ],
      related: [
        { id: 'lexicomp', title: 'Lexicomp (США)' },
        { id: 'bnf', title: 'BNF (UK)' },
        { id: 'martindale', title: 'Martindale' },
      ],
      relatedCourses: [
        { id: '308.3', title: 'Лекарственные взаимодействия' },
        { id: '308.1', title: 'Клиническая фармакология' },
      ],
    };
  },
  reference: 'Preston CL (ed.). Stockley\'s Drug Interactions. Pharmaceutical Press. https://about.medicinescomplete.com/publication/stockleys-drug-interactions/',
  countries: 'Великобритания / ЕС',
  presets: [
    { label: 'Варфарин + НПВС', values: { drugA: 'warfarin', drugB: 'nsaid', interactionType: 'auto' } },
    { label: 'Метотрексат + Триметоприм', values: { drugA: 'methotrexate', drugB: 'trimethoprim', interactionType: 'auto' } },
    { label: 'Литий + Тиазид', values: { drugA: 'lithium', drugB: 'thiazide', interactionType: 'auto' } },
  ],
  info: `### Для чего используется\n**Stockley's Drug Interactions** — флагманский UK-справочник лекарственных взаимодействий от Pharmaceutical Press с подробным цитированием первичной литературы.\n\n### Структура монографии\n- Clinical evidence — сводка исследований\n- Mechanism — фармакокинетический/фармакодинамический\n- Importance and management — практические рекомендации\n- References — первичные источники\n\n### Отличие от Lexicomp\n| Параметр | Stockley\'s | Lexicomp |\n|---|---|---|\n| Страна | UK/ЕС | США |\n| Стиль | Описательный, цитатный | Категориальный A-X |\n| Формат | MedicinesComplete | UpToDate |\n\n### Источник\nhttps://about.medicinescomplete.com/publication/stockleys-drug-interactions/`,
};
export default runner;
