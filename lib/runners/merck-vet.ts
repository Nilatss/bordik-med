// @ts-nocheck
/** Runner: merck-vet */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'section',
      label: 'Раздел Merck Vet Manual',
      type: 'select',
      options: [
        { value: 'behavior',    label: 'Поведение' },
        { value: 'cardio',      label: 'Сердечно-сосудистая система' },
        { value: 'dermatology', label: 'Дерматология' },
        { value: 'endocrine',   label: 'Эндокринология' },
        { value: 'gi',          label: 'ЖКТ' },
        { value: 'hema',        label: 'Гематология' },
        { value: 'infectious',  label: 'Инфекционные болезни' },
        { value: 'neuro',       label: 'Неврология' },
        { value: 'ortho',       label: 'Ортопедия' },
        { value: 'onco',        label: 'Онкология' },
        { value: 'renal',       label: 'Почки / МПС' },
        { value: 'repro',       label: 'Репродукция' },
        { value: 'resp',        label: 'Дыхание' },
        { value: 'toxicology',  label: 'Токсикология' },
      ],
    },
  ],
  compute: (v) => {
    const s = String(v.section);

    const topics: Record<string, string> = {
      behavior:    'Агрессия, тревожность разлуки, компульсивные расстройства, когнитивная дисфункция (CDS), фобии',
      cardio:      'MMVD, ДКМП, ГКМП (коты), ХСН, аритмии, дирофиляриоз, перикардит, тампонада',
      dermatology: 'Атопический дерматит, блошиный дерматит, демодекоз, дерматофитоз, пододерматит, пиодерма',
      endocrine:   'СД 1/2, гиперадренокортицизм (Кушинг), гипотиреоз, гипертиреоз кошек, гипо-/гиперкальциемия',
      gi:          'Гастрит, IBD, EPI, ХПН желудка, панкреатит, FIP, лимфома ЖКТ, мегаэзофагус',
      hema:        'Анемия (IMHA, регенеративная/нерегенеративная), тромбоцитопения, лейкозы',
      infectious:  'Парвовирус, чума, FIV/FeLV, FIP, лептоспироз, бабезиоз, эрлихиоз, боррелиоз',
      neuro:       'Эпилепсия, IVDD (диск), FCE, гранулёматоз, GME, энцефалит, вестибулярный синдром',
      ortho:       'HD/ED дисплазия, CCL разрыв, пателлярный вывих, OCD, TPLO/TTA, переломы',
      onco:        'Лимфома (B/T-cell), MCT, osteosarcoma, гемангиосаркома, TVT, мелкосвязанные опухоли',
      renal:       'CKD (IRIS), острый ОПН, пиелонефрит, цистит FLUTD, уролитиаз, протеинурия',
      repro:       'Пиометра, дистопия, эклампсия, неонатальная смертность, крипторхизм',
      resp:        'BOAS (брахицефалы), бронхит, пневмония, плеврит, астма кошек, BOAS скрининг',
      toxicology:  'Шоколад, лук/чеснок, ксилитол, изюм, этиленгликоль, родентициды (анти-К), НПВС',
    };

    const top = topics[s] || '—';

    return {
      value: s,
      unit: 'MSD Vet Manual',
      interpretation: `Раздел «${s}» · ${top.split(',')[0]}...`,
      color: '#4B8DF5',
      details: `Темы раздела:\n${top}\n\nИсточники онлайн:\n- merckvetmanual.com (США)\n- msdvetmanual.com (остальной мир)\n- Доступно бесплатно с 2005 г.\n\nТакже содержит: Pet Owner Version (для владельцев) и Professional Version (детально).`,
      actions: [
        'Открыть merckvetmanual.com или msdvetmanual.com для полной статьи',
        'Скачать MSD Vet Manual app (iOS / Android)',
        'Свериться с Plumb\'s при назначении препаратов',
        'Для специфических протоколов — ACVIM Consensus Statements',
      ],
      caveats: [
        'Merck = MSD (одна компания, разные названия для США vs ROW)',
        'Не заменяет актуальные клинические рекомендации (ACVIM, ECVIM, WSAVA)',
        'Обновляется регулярно, но местные протоколы могут отличаться',
        'Pet Owner Version ≠ Professional Version — выбирайте профессиональную',
      ],
      related: [
        { id: 'plumbs', title: 'Plumb\'s Drug Handbook' },
        { id: 'acvim', title: 'ACVIM staging' },
        { id: 'cite', title: 'CITE / FEC' },
      ],
      relatedCourses: [
        { id: '312.1', title: 'Ветеринарная медицина' },
      ],
    };
  },
  reference: 'The Merck Veterinary Manual. 11th ed. Kenilworth: Merck & Co; 2016. Online: merckvetmanual.com (US) / msdvetmanual.com (ROW).',
  countries: 'США / международный (MSD)',
  presets: [
    { label: 'Токсикология', values: { section: 'toxicology' } },
    { label: 'Инфекции', values: { section: 'infectious' } },
    { label: 'Онкология', values: { section: 'onco' } },
  ],
  info: `### Для чего используется
**The Merck Veterinary Manual** (вне США известен как **MSD Veterinary Manual**) — универсальный клинический справочник по медицине собак, кошек, лошадей, КРС, экзотов и дикой фауны. Печатное 11-е изд. (2016) + регулярно обновляемая онлайн-версия.

### Ключевые разделы
- **Внутренние болезни** — кардиология, эндокринология, ЖКТ, нефрология
- **Инфекционные болезни** — вирусы, бактерии, паразиты
- **Хирургия / ортопедия** — CCL, переломы, дисплазии
- **Репродукция** — пиометра, дистопии, неонатология
- **Токсикология** — основные интоксикации домашних животных
- **Поведение** — агрессия, тревожность, CDS
- **Дерматология, неврология, онкология, офтальмология**

### Версии
| Версия | Для кого |
|---|---|
| Professional | Ветеринарные специалисты |
| Pet Owner | Владельцы (упрощённый язык) |
| Quick Reference | Дозы, протоколы, алгоритмы |

### Онлайн
- merckvetmanual.com — США
- msdvetmanual.com — остальной мир
- Мобильные приложения iOS / Android
- Бесплатный доступ с 2005 г.

### Применение
- Первый справочник для быстрой ориентации
- Дифференциальный диагноз по симптому
- Обзор болезней у вида (species chapter)
- Поиск по химическому / бытовому токсину

### Альтернативы
- **BSAVA Manuals** — серия специализированных монографий (UK)
- **Ettinger & Feldman** — Textbook of Veterinary Internal Medicine (US)
- **WSAVA** — глобальные гайдлайны

### Источник
Merck & Co, Kenilworth, NJ · 1955 (1-е изд.) - 2016 (11-е изд.).`,
};
export default runner;
