// @ts-nocheck
/** Runner: pllr */
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
        { value: 'warfarin', label: 'Варфарин' },
        { value: 'ace', label: 'иАПФ (лизиноприл)' },
        { value: 'arb', label: 'БРА (лозартан)' },
        { value: 'isotretinoin', label: 'Изотретиноин' },
        { value: 'methotrexate', label: 'Метотрексат' },
        { value: 'valproate', label: 'Вальпроат' },
        { value: 'lithium', label: 'Литий' },
        { value: 'ssri', label: 'СИОЗС (сертралин)' },
        { value: 'metronidazole', label: 'Метронидазол' },
        { value: 'fluconazole', label: 'Флуконазол' },
        { value: 'amoxicillin', label: 'Амоксициллин' },
        { value: 'levothyroxine', label: 'Левотироксин' },
      ],
    },
    {
      id: 'status',
      label: 'Статус пациента',
      type: 'select',
      options: [
        { value: 'pregnant', label: 'Беременность' },
        { value: 'lactation', label: 'Лактация' },
        { value: 'planning', label: 'Планирование (репродуктивный потенциал)' },
      ],
    },
  ],
  compute: (v) => {
    const d = String(v.drug);
    const st = String(v.status);

    type P = { preg: string; lact: string; repro: string; old: string; color: string };
    const map: Record<string, P> = {
      warfarin: { preg: 'Тератоген: варфариновая эмбриопатия (костные дефекты) в 1-м триместре, кровотечения плода в 3-м. Использовать НМГ.', lact: 'Совместим — не проникает в молоко.', repro: 'Контрацепция обязательна. При планировании — перейти на НМГ.', old: 'Старая категория X (в 1-м триместре).', color: '#991B1B' },
      ace: { preg: '2-3-й триместр: олигогидрамнион, ОПН плода, гипоплазия черепа, смерть. Отменить при ≥ 2-й триместр.', lact: 'Низкие уровни в молоке — каптоприл/эналаприл совместимы.', repro: 'При планировании перейти на метилдопу/нифедипин.', old: 'Старая категория D.', color: '#EF4444' },
      arb: { preg: 'Противопоказан во всех триместрах — фетотоксичность аналогично иАПФ.', lact: 'Данных мало — избегать.', repro: 'Отменить при планировании.', old: 'Старая категория D.', color: '#EF4444' },
      isotretinoin: { preg: 'Абсолютно противопоказан — тяжёлые пороки (iPLEDGE program). Две формы контрацепции за 1 мес до, во время и 1 мес после.', lact: 'Противопоказан.', repro: 'Обязательна регистрация в iPLEDGE, тесты на беременность ежемесячно.', old: 'Старая категория X.', color: '#991B1B' },
      methotrexate: { preg: 'Абортивный + тератоген. Противопоказан.', lact: 'Противопоказан.', repro: 'Мужчины — контрацепция 3 мес после отмены; женщины — 1 цикл (онкодозы: 6 мес).', old: 'Старая категория X.', color: '#991B1B' },
      valproate: { preg: 'Дефекты нервной трубки 1-2%, снижение IQ. Противопоказан при мигрени/биполярке у женщин репродуктивного возраста.', lact: 'Совместим (низкая экскреция).', repro: 'Обязательная программа предотвращения беременности (EMA PRAC 2018).', old: 'Старая категория D/X.', color: '#991B1B' },
      lithium: { preg: '1-й триместр: аномалия Эбштейна (относительный риск ~2x). Мониторинг уровня, ЭхоКГ плода 16-20 нед.', lact: 'С осторожностью — проникает в молоко, мониторить ребёнка.', repro: 'Планировать беременность, снизить дозу в родах.', old: 'Старая категория D.', color: '#F59E0B' },
      ssri: { preg: 'Сертралин/эсциталопрам — наиболее изучены. Риск PPHN в 3-м триместре (малый), неонатальный синдром отмены. Пароксетин — избегать (ССС пороки).', lact: 'Сертралин — препарат выбора (низкая экскреция).', repro: 'Продолжить при депрессии — нелеченая депрессия опаснее.', old: 'Старая категория C (пароксетин — D).', color: '#F59E0B' },
      metronidazole: { preg: 'Безопасен со 2-го триместра. В 1-м — использовать только при показаниях (трихомониаз и т.д.).', lact: 'Однократная доза 2 г — прервать ГВ на 12-24 ч. Длительный курс — избегать.', repro: 'Безопасен при планировании.', old: 'Старая категория B.', color: '#22C55E' },
      fluconazole: { preg: 'Однократные 150 мг — безопасны. Высокие дозы (> 400 мг/сут) длительно — тератоген.', lact: 'Совместим.', repro: 'Однократные дозы безопасны.', old: 'Старая категория D (высокие дозы).', color: '#F59E0B' },
      amoxicillin: { preg: 'Безопасен во всех триместрах — препарат выбора (пиелонефрит, ИМП).', lact: 'Совместим.', repro: 'Безопасен.', old: 'Старая категория B.', color: '#22C55E' },
      levothyroxine: { preg: 'Безопасен, обязателен при гипотиреозе. Доза ↑ на 30% во 2-3-м триместре. Цель ТТГ < 2,5 в 1-м, < 3,0 — далее.', lact: 'Совместим.', repro: 'Оптимизировать ТТГ перед зачатием.', old: 'Старая категория A.', color: '#22C55E' },
    };

    const e = map[d] || { preg: 'См. полную монографию PLLR на DailyMed / LactMed', lact: 'См. LactMed', repro: 'См. монографию', old: '—', color: '#6B7280' };
    const section = st === 'lactation' ? e.lact : st === 'planning' ? e.repro : e.preg;

    return {
      value: `${d} — ${st === 'lactation' ? 'Лактация' : st === 'planning' ? 'Репродукция' : 'Беременность'}`,
      unit: 'FDA PLLR',
      interpretation: section,
      color: e.color,
      details: `Препарат: ${d}. Статус: ${st}.\n\n**8.1 Pregnancy:** ${e.preg}\n\n**8.2 Lactation:** ${e.lact}\n\n**8.3 Females & Males of Reproductive Potential:** ${e.repro}\n\n**Историческая категория (до 2015):** ${e.old}\n\n*PLLR (Pregnancy and Lactation Labeling Rule) заменила с 30 июня 2015 г. буквенные категории A/B/C/D/X на нарративные разделы с фактическими данными.*`,
      actions: [
        'Открыть DailyMed (dailymed.nlm.nih.gov) → найти препарат → раздел 8 инструкции',
        'Для лактации сверить с LactMed (NIH): lactmed.nlm.nih.gov',
        'При планировании — оценить риск vs польза, предложить контрацепцию',
        'Документировать обсуждение риска с пациенткой',
        'Репродуктивные токсины — регистрация в Pregnancy Registry (FDA)',
      ],
      caveats: [
        'PLLR — только для FDA-маркированных препаратов (США)',
        'Старые категории A/B/C/D/X больше не используются с 2015, но часто встречаются в литературе',
        'Для ЕС аналог — SmPC раздел 4.6 (EMA)',
        'В РФ используется Инструкция МЗ РФ — часто менее детальная',
        'LactMed — отдельная бесплатная база NIH по лактации',
      ],
      related: [
        { id: 'lactmed', title: 'LactMed (NIH)' },
        { id: 'briggs', title: 'Briggs Drugs in Pregnancy and Lactation' },
        { id: 'reprotox', title: 'REPROTOX' },
      ],
      relatedCourses: [
        { id: '308.1', title: 'Клиническая фармакология' },
        { id: '301.3', title: 'Беременность и лактация' },
      ],
    };
  },
  reference: 'FDA. Pregnancy and Lactation Labeling (Drugs) Final Rule. 80 FR 37567. Effective June 30, 2015.',
  countries: 'США (FDA)',
  presets: [
    { label: 'Варфарин — беременность', values: { drug: 'warfarin', status: 'pregnant' } },
    { label: 'Сертралин — лактация', values: { drug: 'ssri', status: 'lactation' } },
    { label: 'Изотретиноин — планирование', values: { drug: 'isotretinoin', status: 'planning' } },
  ],
  info: `### Для чего используется\n**FDA Pregnancy and Lactation Labeling Rule (PLLR)** — действует с 30 июня 2015 г., заменила категории A/B/C/D/X нарративными разделами инструкции 8.1–8.3.\n\n### Структура раздела 8\n- **8.1 Pregnancy** — риск-резюме, клинические соображения, данные\n- **8.2 Lactation** — экскреция в молоко, эффекты на ребёнка и продукцию молока\n- **8.3 Females and Males of Reproductive Potential** — тесты, контрацепция, бесплодие\n\n### Почему отменены категории\n- A/B/C/D/X чрезмерно упрощали сложность данных\n- Не учитывали дозу, путь, триместр\n- "C" содержала ~70% всех препаратов (бесполезно)\n\n### Где найти\n- **DailyMed** (FDA) — все одобренные монографии\n- **LactMed** (NIH) — специализированная база лактации\n- **Briggs Drugs in Pregnancy and Lactation** — печатный стандарт\n- **REPROTOX / TERIS** — платные базы тератогенов\n\n### Когда применять\n- Любое назначение беременной / кормящей\n- Планирование беременности\n- Обсуждение контрацепции с пациенткой на тератогенных препаратах\n\n### Источник\nhttps://www.fda.gov/drugs/labeling-information-drug-products/pregnancy-and-lactation-labeling-drugs-final-rule`,
};
export default runner;
