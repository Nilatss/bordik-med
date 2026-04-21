// @ts-nocheck
/** Runner: uptodate — UpToDate (Wolters Kluwer) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'США / Международный (Wolters Kluwer)',
  reference: 'UpToDate. Wolters Kluwer. https://www.uptodate.com/ (подписка; используется > 2 млн клиницистов в 190+ странах)',
  inputs: [
    {
      id: 'category',
      label: 'Категория темы',
      type: 'select',
      options: [
        { value: 'cardio', label: 'Кардиология' },
        { value: 'infect', label: 'Инфекционные болезни' },
        { value: 'onco', label: 'Онкология' },
        { value: 'endo', label: 'Эндокринология' },
        { value: 'neuro', label: 'Неврология' },
        { value: 'em', label: 'Неотложная помощь' },
        { value: 'peds', label: 'Педиатрия' },
        { value: 'obgyn', label: 'Акушерство/гинекология' },
      ],
    },
  ],
  presets: [
    { label: 'Кардиология', values: { category: 'cardio' } },
    { label: 'Инфекции', values: { category: 'infect' } },
    { label: 'Неотложная', values: { category: 'em' } },
  ],
  compute: (v) => {
    const c = String(v.category || 'cardio');
    const map: Record<string, { title: string; topics: string; grades: string }> = {
      cardio: { title: 'Кардиология', topics: '~2800 topics: ОКС, СН, ФП, ГКМП, клапанные пороки, липидология', grades: 'Grade 1A: DAPT после ОКС; Grade 1B: ИАПФ при HFrEF; Grade 2C: периодичность Эхо при АС' },
      infect: { title: 'Инфекционные болезни', topics: '~2500 topics: ВП, сепсис, ВИЧ, HCV, TB, COVID-19, стафилококковые инфекции', grades: 'Grade 1A: ранняя АБ при сепсисе; Grade 1B: ВААРТ при ВИЧ; обновление еженедельно' },
      onco: { title: 'Онкология', topics: '~2200 topics: по локализации + генетика опухолей + паллиатив', grades: 'Интеграция с NCCN guidelines; Grade 2B для экспериментальных режимов' },
      endo: { title: 'Эндокринология', topics: '~1500 topics: СД 1/2, щитовидка, надпочечники, остеопороз, гипофиз', grades: 'Grade 1A: метформин 1-я линия СД2; Grade 1B: LT4 при гипотиреозе' },
      neuro: { title: 'Неврология', topics: '~1900 topics: инсульт, эпилепсия, деменция, мигрень, рассеянный склероз', grades: 'Grade 1A: tPA < 4.5ч; Grade 1B: аспирин при ОИИ' },
      em: { title: 'Неотложная помощь', topics: '~1600 topics: травма, токсикология, ОКС, ОНМК, шок, pediatric EM', grades: 'Algorithms и tables для быстрого bedside reference' },
      peds: { title: 'Педиатрия', topics: '~2400 topics: неонатология, инфекции, развитие, подростковая медицина', grades: 'Grade 1A: вакцинация по ACIP/AAP schedule' },
      obgyn: { title: 'Акушерство/гинекология', topics: '~1800 topics: пренатальный уход, осложнения беременности, гинекологическая онкология', grades: 'Согласовано с ACOG bulletins' },
    };
    const e = map[c];
    return {
      value: e.title,
      unit: 'UpToDate',
      color: '#6B7280',
      interpretation: `UpToDate: ${e.title}`,
      details: `Категория: ${e.title}\n\nОбъём: ${e.topics}\n\nГрадации доказательности: ${e.grades}\n\nUpToDate использует GRADE-адаптированную систему:\n- Grade 1A/1B/1C — сильная рекомендация (high/moderate/low evidence)\n- Grade 2A/2B/2C — слабая рекомендация\n\nКаждая topic содержит: Summary & Recommendations, Introduction, Clinical Manifestations, Diagnosis, Treatment, Patient Education (basic/beyond basics), References.`,
      actions: [
        'Открыть https://www.uptodate.com/ (требуется подписка — часто через больницу/вуз)',
        'Мобильное приложение (iOS/Android) — offline после sync',
        'Быстрый поиск: What\'s New, Practice Changing UpDates (еженедельно)',
        'Calculators tab — 200+ встроенных калькуляторов',
        'Drug interactions — через Lexicomp интеграцию',
        'CME кредиты начисляются за чтение topics (US)',
      ],
      caveats: [
        'Требуется подписка (индивидуальная ~$600/год или институциональная)',
        'US-ориентация: дозы и торговые названия для американского рынка',
        'Обновления еженедельные, но для РФ/ЕС локальные guidelines могут отличаться',
        'Patient Education — английский; локализации ограничены',
        'Не заменяет клиническое суждение — evidence-based, но не алгоритм',
      ],
      related: [
        { id: 'dynamed', title: 'DynaMed (EBSCO)' },
        { id: 'mdcalc', title: 'MDCalc' },
        { id: 'lexicomp', title: 'Lexicomp' },
        { id: 'sanford', title: 'Sanford Guide' },
      ],
      relatedCourses: [
        { id: '312.1', title: 'Медицинское образование' },
        { id: '302.1', title: 'Общая врачебная практика' },
      ],
    };
  },
  info: `### Для чего используется
**UpToDate** (Wolters Kluwer) — эталонный evidence-based клинический справочник, используется > 2 млн клиницистов в 190+ странах. Более 12 000 клинических topics, обновляется еженедельно командой из > 7 000 врачей-авторов и рецензентов.

### Ключевые особенности
- **Practice Changing UpDates** — еженедельная подборка новых данных, меняющих практику
- **What's New** — раздел последних обновлений по специальности
- **Graded recommendations** (GRADE-адаптированная): 1A/1B/1C (strong) vs 2A/2B/2C (weak)
- **Calculators** — 200+ встроенных (MDRD, CHA₂DS₂-VASc, Wells, etc.)
- **Drug interactions** — Lexicomp интегрирован
- **Patient Education** — Basics (5 класс) и Beyond the Basics (10 класс)
- **CME/CE credits** — до 0.5 кредита за ≥ 1 вопрос

### Как получить доступ
- Институциональная подписка (больница/университет) — IP-authentication
- Индивидуальная подписка ~$599/год (UpToDate Advanced $739)
- Мобильное приложение после sign-in на web — offline доступ на 30 дней`,
};
export default runner;
