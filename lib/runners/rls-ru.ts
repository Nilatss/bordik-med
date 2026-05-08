/** Runner: rls-ru */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'query',
      label: 'Препарат (МНН или бренд РФ)',
      type: 'select',
      options: [
        { value: 'ksarelto', label: 'Ксарелто (Ривароксабан)' },
        { value: 'preductal', label: 'Предуктал МВ (Триметазидин)' },
        { value: 'arbidol', label: 'Арбидол (Умифеновир)' },
        { value: 'mexidol', label: 'Мексидол (Этилметилгидроксипиридина сукцинат)' },
        { value: 'concor', label: 'Конкор (Бисопролол)' },
        { value: 'nolpaza', label: 'Нольпаза (Пантопразол)' },
        { value: 'eutirox', label: 'Эутирокс (Левотироксин)' },
      ],
    },
    {
      id: 'lookup',
      label: 'Что проверить',
      type: 'select',
      options: [
        { value: 'registration', label: 'Регистрация в ГРЛС (ЛП № и дата)' },
        { value: 'inn', label: 'МНН и АТХ' },
        { value: 'indications', label: 'Показания (по инструкции)' },
        { value: 'vital', label: 'Статус ЖНВЛП' },
      ],
    },
  ],
  compute: (v) => {
    const d = String(v.query);
    const q = String(v.lookup);
    const data: Record<string, { inn: string; atc: string; ind: string; vital: string }> = {
      ksarelto: { inn: 'Ривароксабан', atc: 'B01AF01', ind: 'Профилактика ВТЭ после ортопедических операций, неклапанная ФП, лечение ТГВ/ТЭЛА', vital: 'Да (ЖНВЛП)' },
      preductal: { inn: 'Триметазидин', atc: 'C01EB15', ind: 'Стабильная стенокардия (в составе комбинированной терапии)', vital: 'Да' },
      arbidol: { inn: 'Умифеновир', atc: 'J05AX13 (экспериментальный)', ind: 'ОРВИ, грипп A и B (доказательная база ограничена)', vital: 'Нет' },
      mexidol: { inn: 'Этилметилгидроксипиридина сукцинат', atc: 'N07XX (локальный)', ind: 'ОНМК, ДЭП, тревожные расстройства (локальная регистрация РФ)', vital: 'Да' },
      concor: { inn: 'Бисопролол', atc: 'C07AB07', ind: 'АГ, ИБС, ХСН', vital: 'Да' },
      nolpaza: { inn: 'Пантопразол', atc: 'A02BC02', ind: 'ГЭРБ, язвенная болезнь, эрадикация H. pylori', vital: 'Да' },
      eutirox: { inn: 'Левотироксин натрия', atc: 'H03AA01', ind: 'Гипотиреоз, супрессия ТТГ', vital: 'Да' },
    };
    const e = data[d] || { inn: '—', atc: '—', ind: '—', vital: '—' };
    const out: Record<string, string> = {
      registration: `Проверить № РУ и дату можно в ГРЛС (grls.rosminzdrav.ru) по торговому наименованию ${d}.`,
      inn: `МНН: ${e.inn}\nАТХ: ${e.atc}`,
      indications: `Показания (РФ инструкция): ${e.ind}`,
      vital: `ЖНВЛП: ${e.vital}`,
    };
    return {
      value: e.inn,
      unit: 'РЛС/ГРЛС',
      interpretation: `${e.inn} (АТХ ${e.atc})`,
      color: '#22C55E',
      details: `Препарат: ${d}\n\n${out[q] || '—'}\n\nПолная актуальная инструкция — в ГРЛС (grls.rosminzdrav.ru) — официальный государственный реестр. Дополнительно: РЛС (rlsnet.ru) и Vidal.ru (коммерческие справочники).`,
      actions: [
        'Открыть grls.rosminzdrav.ru → ввести торговое наименование',
        'Скачать официальную инструкцию (PDF) — только она имеет юридическую силу',
        'Для взаимодействий — дополнительно Lexicomp/Stockley\'s (ГРЛС не содержит полных таблиц взаимодействий)',
        'Проверить статус ЖНВЛП (если требуется для льготного назначения)',
      ],
      caveats: [
        'ГРЛС — единственный официальный источник РФ; РЛС и Видаль — коммерческие и могут устаревать',
        'Часть препаратов (мексидол, кагоцел, арбидол) имеет только локальную российскую регистрацию без признания ЕМА/FDA',
        'Дозировки и показания в РФ могут отличаться от EMA/FDA (учитывайте клинические рекомендации Минздрава)',
        'ЖНВЛП-перечень обновляется распоряжениями Правительства РФ — сверяйтесь с текущей редакцией',
      ],
      related: [
        { id: 'vidal', title: 'Vidal (Россия)' },
        { id: 'bnf', title: 'BNF (UK)' },
        { id: 'lexicomp', title: 'Lexicomp (взаимодействия)' },
        { id: 'martindale', title: 'Martindale' },
      ],
      relatedCourses: [
        { id: '308.1', title: 'Клиническая фармакология' },
        { id: '308.2', title: 'Регуляторика ЛП в РФ' },
      ],
    };
  },
  reference: 'Государственный реестр лекарственных средств РФ. https://grls.rosminzdrav.ru/ · РЛС (Регистр лекарственных средств России). https://www.rlsnet.ru/',
  countries: 'Российская Федерация',
  presets: [
    { label: 'Ксарелто — регистрация', values: { query: 'ksarelto', lookup: 'registration' } },
    { label: 'Мексидол — МНН/АТХ', values: { query: 'mexidol', lookup: 'inn' } },
    { label: 'Конкор — ЖНВЛП', values: { query: 'concor', lookup: 'vital' } },
  ],
  info: `### Для чего используется\nОфициальные и профессиональные справочники лекарственных средств в РФ.\n\n### Иерархия источников РФ\n1. **ГРЛС (grls.rosminzdrav.ru)** — официальный государственный реестр Минздрава РФ. Содержит актуальные инструкции, № РУ, даты регистрации. **Имеет юридическую силу.**\n2. **РЛС (rlsnet.ru)** — коммерческий справочник, удобный поиск, архив инструкций. Обновляется регулярно.\n3. **Vidal Россия (vidal.ru)** — российская адаптация международного справочника.\n4. **ЖНВЛП** — Перечень жизненно необходимых и важнейших лекарственных препаратов (распоряжение Правительства РФ) — регулируется цена.\n\n### Когда применять\n- Проверка регистрации препарата в РФ\n- Поиск МНН по бренду / эквивалентов\n- Льготное назначение (ЖНВЛП, 14 нозологий)\n- Экспертиза назначения (страховая, СМО)`,
};
export default runner;
