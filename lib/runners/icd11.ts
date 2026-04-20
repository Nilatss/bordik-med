// @ts-nocheck
/** Runner: icd11 — WHO ICD-11 (2022) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (WHO) · в силе с 01.01.2022',
  reference: 'World Health Organization. ICD-11 for Mortality and Morbidity Statistics (MMS). Geneva: WHO; 2022. https://icd.who.int/',
  inputs: [
    {
      id: 'chapter',
      label: 'Глава ICD-11',
      type: 'select',
      options: [
        { value: '01', label: '01 Инфекционные/паразитарные' },
        { value: '02', label: '02 Новообразования' },
        { value: '05', label: '05 Эндокринные, питания, обмена' },
        { value: '06', label: '06 Психические и поведенческие' },
        { value: '08', label: '08 Нервной системы' },
        { value: '11', label: '11 Кровообращения' },
        { value: '12', label: '12 Дыхания' },
        { value: '23', label: '23 Внешние причины' },
        { value: '26', label: '26 Традиционная медицина (новое)' },
      ],
    },
  ],
  presets: [
    { label: 'Психические (6A-6E)', values: { chapter: '06' } },
    { label: 'Кровообращения', values: { chapter: '11' } },
    { label: 'Новообразования', values: { chapter: '02' } },
  ],
  compute: (v) => {
    const ch = String(v.chapter || '11');
    const map: Record<string, { title: string; stem: string; ext: string; note: string }> = {
      '01': { title: 'Инфекционные и паразитарные', stem: '1A00 ТБ; 1C62 ВИЧ; 1F40 COVID-19; 1A40 сальмонеллёз', ext: 'XN-коды для возбудителя; XA-коды для анатомической локализации', note: 'COVID-19 = 1F40 (стандарт с 2022)' },
      '02': { title: 'Новообразования', stem: '2C25 ЗНО молочной железы; 2C30 лёгкого; 2E60 лейкемия', ext: 'XH-коды гистологии (ICD-O-3 интегрирован)', note: 'Можно кодировать stem + morphology extension одним "post-coordinated" кодом' },
      '05': { title: 'Эндокринные', stem: '5A11 СД 1 типа; 5A10 СД 2 типа; 5B50 гипотиреоз', ext: 'XS25 тяжесть; XK8G временной паттерн', note: 'СД типы разделены более чётко (1/2/другие/GDM)' },
      '06': { title: 'Психические/поведенческие', stem: '6A70 депрессивный эпизод; 6B00 ГТР; 6A20 шизофрения; 6C51 gaming disorder', ext: 'XS8H тяжесть; XT9R частота', note: 'Новое: gaming disorder (6C51), complex PTSD (6B41), prolonged grief (6B42)' },
      '08': { title: 'Нервной системы', stem: '8A80 мигрень; 8B10 ишемический инсульт; 8A00 БАС', ext: 'XA-локализация', note: 'Мигрень перенесена из главы дыхания в неврологию (vs ICD-10)' },
      '11': { title: 'Система кровообращения', stem: 'BA00 ЭАГ; BA41 ОИМ; BC81 ФП; BD10 СН', ext: 'XS-тяжесть; XK-острота', note: 'BA41 ОИМ — более детально по типам (1-5) чем ICD-10 I21' },
      '12': { title: 'Система дыхания', stem: 'CA23 ОРВИ; CA40 пневмония; CA22 ХОБЛ; CA23 БА', ext: 'XN-этиология (возбудитель)', note: 'ХОБЛ и БА разделены стем-кодами' },
      '23': { title: 'Внешние причины', stem: 'PA80 ДТП пассажир; PB40 падение; PD20 самоповреждение', ext: 'XE-место; XV-активность', note: 'Глава 23 + extension codes обязательны при травмах' },
      '26': { title: 'Традиционная медицина (новое в ICD-11)', stem: 'SF7Z состояния TM; SK50 принципы TM', ext: '—', note: 'Первая ICD с главой TM — покрывает традиционную китайскую/корейскую/японскую медицину; необязательна для членов' },
    };
    const e = map[ch];
    return {
      value: e.stem.split(';')[0].trim(),
      unit: 'ICD-11',
      color: '#6B7280',
      interpretation: `ICD-11 Chapter ${ch}: ${e.title}`,
      details: `**Глава:** ${ch} — ${e.title}\n\n**Примеры stem codes:** ${e.stem}\n\n**Extension codes:** ${e.ext}\n\n**Примечание:** ${e.note}\n\nICD-11 использует **post-coordination**: основной stem code + ноль или более extension codes (X-категория) для уточнения тяжести, острого/хронического, локализации, этиологии и т.д. Формат: буква-цифра-цифра-цифра (напр. BA00).`,
      actions: [
        'Открыть ICD-11 Browser: https://icd.who.int/browse/2024-01/mms/en',
        'ICD-11 Coding Tool: https://icd.who.int/ct11/ (автоподсказка кодов)',
        'API: https://id.who.int/icd/ (бесплатно с регистрацией)',
        'Для перехода с ICD-10 — использовать WHO mapping tables (partial/context-dependent)',
        'РФ: переход на ICD-11 запланирован (сроки уточняются МЗ РФ)',
      ],
      caveats: [
        'ICD-11 в силе с 01.01.2022, но принятие странами постепенное',
        'Не все страны имеют официальный перевод — WHO поддерживает 11 языков',
        'Mapping ICD-10 ↔ ICD-11 часто "one-to-many" — требует клинического контекста',
        'Post-coordination кодирование отличается от ICD-10 — требует обучения',
        'Для статистики смертности WHO — ICD-11 MMS (Mortality & Morbidity Statistics)',
        'Primary care версия — ICD-11 PHC (упрощённая)',
      ],
      related: [
        { id: 'icd10', title: 'WHO ICD-10' },
        { id: 'dsm-icd', title: 'DSM-5 ↔ ICD-11 crosswalk' },
        { id: 'snomed', title: 'SNOMED CT' },
        { id: 'icf', title: 'WHO ICF (функционирование)' },
      ],
      relatedCourses: [
        { id: '302.1', title: 'Общая врачебная практика' },
        { id: '304.1', title: 'Диагностика и кодирование' },
      ],
    };
  },
  info: `### Для чего используется
**WHO ICD-11** (2022) — 11-й пересмотр международной классификации болезней, первая цифровая ICD с API, разработана с 2007 г., вступила в силу 01.01.2022.

### Ключевые нововведения vs ICD-10
| Аспект | ICD-10 | ICD-11 |
|---|---|---|
| Кодов | ~14,000 | ~55,000 |
| Структура | иерархия | stem + extension (post-coordination) |
| Главы | 22 | 28 |
| Новые главы | — | 26 Традиционная медицина; 27 Коды с особыми целями; 04 Иммунная система |
| Цифровая | PDF + browser | полная API / linearizations / coding tool |
| Мульти-родительство | нет | да (концепт может принадлежать нескольким главам) |
| Gaming disorder | — | 6C51 |
| Complex PTSD | — | 6B41 |
| Sexual health | F52 в психиатрии | отдельная глава 17 (депатологизация) |

### Структура stem code
\`\`\`
BA00     — эссенциальная гипертензия
│└─ класс/группа
│
└ глава (B = 11 кровообращения)
\`\`\`

### Post-coordination пример
\`BA00 & XS25\` — ЭАГ + extension тяжести "severe"

### Источник
https://icd.who.int/`,
};
export default runner;
