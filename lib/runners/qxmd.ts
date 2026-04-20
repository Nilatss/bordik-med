// @ts-nocheck
/** Runner: qxmd — QxMD Read + Calculate */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Канада / Международный (QxMD by Elsevier)',
  reference: 'QxMD (Read by QxMD, Calculate by QxMD). Elsevier. https://www.qxmd.com/ (бесплатное мобильное приложение; > 1 млн пользователей)',
  inputs: [
    {
      id: 'feature',
      label: 'Функция QxMD',
      type: 'select',
      options: [
        { value: 'search', label: 'Read — поиск литературы (PubMed-based)' },
        { value: 'calculate', label: 'Calculate — клинические калькуляторы' },
        { value: 'annotate', label: 'Annotate — комментарии/highlight PDF' },
        { value: 'keywords', label: 'Keywords — автоматическая подборка по интересам' },
        { value: 'topic', label: 'Topic Reviews — обзоры по тегам' },
      ],
    },
  ],
  presets: [
    { label: 'Read (литература)', values: { feature: 'search' } },
    { label: 'Calculate', values: { feature: 'calculate' } },
    { label: 'Keywords', values: { feature: 'keywords' } },
  ],
  compute: (v) => {
    const f = String(v.feature || 'search');
    const map: Record<string, { title: string; detail: string; tip: string }> = {
      search: { title: 'Read by QxMD — литературный поиск', detail: 'PubMed + Embase + Cochrane интеграция (через institutional OpenAthens / Shibboleth). Filtering по specialty, journal, year. Recent articles, Trending (popular in your specialty).', tip: 'Подключите institutional proxy для full text — иначе только abstract. Сохранять статьи в Collections для offline reading.' },
      calculate: { title: 'Calculate by QxMD — калькуляторы', detail: '> 400 клинических калькуляторов (CHA₂DS₂-VASc, Wells, NIHSS, GFR, Apgar и др.). Организация по specialty. Sharing results через email/clipboard.', tip: 'Альтернатива MDCalc с похожим UX. Иногда калькуляторы в Calculate обновляются позже чем в MDCalc.' },
      annotate: { title: 'Annotate — PDF highlights', detail: 'Highlight PDF статей цветными маркерами, добавить заметки, экспортировать в Mendeley/Zotero/Dropbox.', tip: 'Annotations syncs across devices через QxMD аккаунт. PDF остаётся в облаке.' },
      keywords: { title: 'Keywords — персонализированная лента', detail: 'Добавьте keywords (напр. "SGLT2 inhibitors", "sepsis guidelines") — приложение отправляет push-уведомления о новых статьях по теме.', tip: 'Лучший способ держать руку на пульсе литературы. Можно подписаться на журналы ("JAMA", "NEJM") — все новые выпуски появляются в ленте.' },
      topic: { title: 'Topic Reviews — обзоры по тегам', detail: 'Курируемые подборки статей по клиническим темам (напр. "COVID-19", "Heart failure", "Alzheimer"). Обновляются редакторами QxMD.', tip: 'Хороший старт для новой темы — меньше шума чем raw PubMed поиск.' },
    };
    const e = map[f];
    return {
      value: e.title,
      unit: 'QxMD',
      color: '#6B7280',
      interpretation: `QxMD: ${f}`,
      details: `**Функция:** ${e.title}\n\n**Описание:** ${e.detail}\n\n**Совет:** ${e.tip}\n\n**QxMD экосистема:**\n- **Read by QxMD** — флагманское приложение для поиска и чтения литературы (iOS/Android/web)\n- **Calculate by QxMD** — медицинские калькуляторы (ранее отдельное приложение, теперь интегрировано в Read)\n- **Account** — единый аккаунт для sync между устройствами\n- **Institutional access** — через больничную/университетскую подписку получается full text (не только abstract)\n\n**Интеграция с Elsevier:**\nQxMD куплен Elsevier в 2015 г. — даёт доступ к ScienceDirect full texts при наличии institutional подписки.`,
      actions: [
        'Скачать Read by QxMD (iOS/Android) или web: https://read.qxmd.com/',
        'Calculate (встроен в Read или отдельно): https://qxcalc.com/',
        'Создать бесплатный QxMD аккаунт — sync между устройствами',
        'Настроить institutional access — в Settings → Institution Access (OpenAthens / Shibboleth)',
        'Добавить Keywords (15-20 ключевых слов) для персонализированной ленты',
        'Включить push-уведомления для новых статей',
      ],
      caveats: [
        'Без institutional access — только abstracts (полнотекст платный)',
        'PubMed indexing имеет задержку 1-3 нед — свежие preprints не всегда доступны',
        'Elsevier acquisition: возможен bias в сторону Elsevier-изданий в Topic Reviews',
        'Annotations привязаны к QxMD аккаунту — при удалении может потеряться',
        'Calculate калькуляторы — меньше evidence commentary чем у MDCalc',
      ],
      related: [
        { id: 'pubmed', title: 'PubMed (база)' },
        { id: 'mdcalc', title: 'MDCalc (калькуляторы)' },
        { id: 'uptodate', title: 'UpToDate' },
      ],
      relatedCourses: [
        { id: '312.1', title: 'Медицинское образование' },
        { id: '302.1', title: 'Общая врачебная практика' },
      ],
    };
  },
  info: `### Для чего используется
**QxMD** — семейство бесплатных клинических приложений от Elsevier (куплено в 2015 г.). Наиболее популярные: **Read by QxMD** (литературный поиск) и **Calculate by QxMD** (калькуляторы).

### Read by QxMD
- Поиск по PubMed + Embase + Cochrane (интеграция через institutional access)
- **Keywords** — персонализированная лента новых статей
- **Topic Reviews** — курируемые подборки по темам
- **Collections** — сохранённые статьи (offline reading)
- **Annotate** — PDF highlights + заметки + экспорт в Mendeley/Zotero
- **Trending** — популярные в вашей специальности

### Calculate by QxMD
- > 400 клинических калькуляторов
- Организовано по специальности
- Sharing результатов (email, clipboard)

### Institutional access
Для full text подключите OpenAthens / Shibboleth от своей больницы/университета → получите полные тексты из ScienceDirect и подписных журналов.

### Платформы
- iOS (основное приложение)
- Android
- Web: https://read.qxmd.com/

### Бесплатно
Полностью бесплатно. Полнотекст статей — только если есть institutional subscription.

### Источник
https://www.qxmd.com/`,
};
export default runner;
