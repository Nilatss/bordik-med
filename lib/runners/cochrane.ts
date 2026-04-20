// @ts-nocheck
/** Runner: cochrane — Cochrane Library (systematic reviews) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (Cochrane Collaboration)',
  reference: 'Cochrane Library. John Wiley & Sons on behalf of The Cochrane Collaboration. https://www.cochranelibrary.com/ (> 9000 systematic reviews; золотой стандарт EBM)',
  inputs: [
    {
      id: 'topic',
      label: 'Тема / группа Cochrane',
      type: 'select',
      options: [
        { value: 'cardiac', label: 'Heart group (кардиология)' },
        { value: 'stroke', label: 'Stroke group' },
        { value: 'acute-resp', label: 'Acute Respiratory Infections' },
        { value: 'preg', label: 'Pregnancy & Childbirth' },
        { value: 'neonatal', label: 'Neonatal group' },
        { value: 'depression', label: 'Common Mental Disorders' },
        { value: 'pain', label: 'Pain, Palliative & Supportive Care' },
        { value: 'infect', label: 'Infectious Diseases' },
      ],
    },
    {
      id: 'review_type',
      label: 'Тип обзора',
      type: 'select',
      options: [
        { value: 'intervention', label: 'Intervention (терапевт. вмешательство)' },
        { value: 'diagnostic', label: 'Diagnostic test accuracy' },
        { value: 'prognosis', label: 'Prognosis review' },
        { value: 'qualitative', label: 'Qualitative evidence synthesis' },
        { value: 'methodology', label: 'Methodology review' },
        { value: 'overview', label: 'Overview of reviews (umbrella)' },
      ],
    },
  ],
  presets: [
    { label: 'Беременность — intervention', values: { topic: 'preg', review_type: 'intervention' } },
    { label: 'Инсульт — intervention', values: { topic: 'stroke', review_type: 'intervention' } },
    { label: 'Диагностика', values: { topic: 'infect', review_type: 'diagnostic' } },
  ],
  compute: (v) => {
    const t = String(v.topic || 'cardiac');
    const r = String(v.review_type || 'intervention');
    const groups: Record<string, string> = {
      cardiac: 'Cochrane Heart (Koordination: London, UK)',
      stroke: 'Cochrane Stroke (Edinburgh, UK)',
      'acute-resp': 'Cochrane Acute Respiratory Infections (Brisbane, AU)',
      preg: 'Cochrane Pregnancy and Childbirth (Liverpool, UK)',
      neonatal: 'Cochrane Neonatal (Oxford, UK)',
      depression: 'Cochrane Common Mental Disorders (Bristol, UK)',
      pain: 'Cochrane Pain, Palliative & Supportive Care (Oxford, UK)',
      infect: 'Cochrane Infectious Diseases (Liverpool, UK)',
    };
    const types: Record<string, string> = {
      intervention: 'Evaluates effects of therapeutic/preventive interventions (RR, OR, MD). PICO: Population, Intervention, Comparator, Outcome. Используется RevMan + GRADE.',
      diagnostic: 'Оценивает точность диагностического теста (Sensitivity, Specificity, LR+, LR−). HSROC модели; QUADAS-2 для risk of bias.',
      prognosis: 'Оценивает прогностические факторы (risk estimates). QUIPS tool; CHARMS для data extraction.',
      qualitative: 'Синтезирует качественные исследования (thematic synthesis, meta-ethnography). GRADE-CERQual для доверия.',
      methodology: 'Исследует методы исследований (напр. аллокация, blinding, missing data)',
      overview: 'Overview of reviews — synthesis of existing systematic reviews (often for clinical guidelines).',
    };
    return {
      value: groups[t],
      unit: 'Cochrane',
      color: '#6B7280',
      interpretation: `Cochrane ${r}: ${groups[t]}`,
      details: `**Cochrane Review Group:** ${groups[t]}\n\n**Тип обзора:** ${r}\n${types[r]}\n\n**PICO framework** (для intervention reviews):\n- **P**opulation — пациенты/участники\n- **I**ntervention — вмешательство\n- **C**omparator — контроль (placebo / standard care / other intervention)\n- **O**utcome — primary / secondary исходы\n\n**GRADE certainty of evidence:** High / Moderate / Low / Very Low — на основе risk of bias, inconsistency, indirectness, imprecision, publication bias.\n\n**Формат Cochrane review:**\n1. Plain language summary\n2. Abstract (structured)\n3. Background\n4. Objectives\n5. Methods (+ protocol pre-registered)\n6. Results (PRISMA flow, forest plots)\n7. Discussion\n8. Authors' conclusions\n9. Summary of findings (SoF) tables с GRADE`,
      actions: [
        'Открыть https://www.cochranelibrary.com/ (CDSR = Cochrane Database of Systematic Reviews)',
        'Поиск по термину + filter Topic / Review Group',
        'Cochrane Clinical Answers (CCA) — быстрые ответы на клинические вопросы (подписка)',
        'Protocol — pre-registered план обзора (перед публикацией full review)',
        'RevMan Web — бесплатный инструмент для авторов Cochrane',
        'Cochrane Crowd — citizen science для screening статей',
      ],
      caveats: [
        'Abstracts и Plain Language Summaries — бесплатно (open access)',
        'Full text требует подписки в некоторых странах (UK, Scandinavia — национальные лицензии)',
        'РФ: частичный open access через eLibrary',
        'Review может быть "out of date" если > 5 лет без обновления — проверить "last updated"',
        'Cochrane reviews строже по методологии, но не всегда включают все RCT (date cutoff)',
        'Для diagnostic reviews — Cochrane методы отличаются от intervention (HSROC vs forest plot)',
      ],
      related: [
        { id: 'prisma', title: 'PRISMA 2020 checklist' },
        { id: 'grade', title: 'GRADE evidence assessment' },
        { id: 'pubmed', title: 'PubMed' },
        { id: 'uptodate', title: 'UpToDate' },
      ],
      relatedCourses: [
        { id: '312.1', title: 'Медицинское образование' },
        { id: '302.1', title: 'Общая врачебная практика' },
      ],
    };
  },
  info: `### Для чего используется
**Cochrane Library** — международная сеть независимых исследователей (> 30 000 в 190+ странах), выпускающих **systematic reviews** — золотой стандарт EBM. Основана Archie Cochrane (UK). > 9000 systematic reviews в Cochrane Database of Systematic Reviews (CDSR).

### Типы обзоров
1. **Intervention** — эффективность терапии/профилактики (наиболее частые)
2. **Diagnostic test accuracy (DTA)** — точность диагностики
3. **Prognosis review** — прогностические факторы
4. **Qualitative evidence synthesis (QES)** — качественные исследования
5. **Methodology review** — методы научных исследований
6. **Overview of reviews** — umbrella review

### Cochrane Review Groups (50+)
Каждая группа покрывает тематическую область (Heart, Stroke, Pregnancy & Childbirth, Neonatal, Pain, etc.).

### PICO framework
**P**opulation · **I**ntervention · **C**omparator · **O**utcome — стандартный способ формулировать клинический вопрос.

### GRADE
Certainty of evidence: High · Moderate · Low · Very Low (учитывает risk of bias, inconsistency, indirectness, imprecision, publication bias).

### Инструменты
- **RevMan Web** — бесплатный для авторов Cochrane
- **Cochrane Crowd** — citizen science для screening
- **Cochrane Clinical Answers (CCA)** — клинически ориентированные ответы
- **Cochrane Library app** — мобильный доступ

### Источник
https://www.cochranelibrary.com/`,
};
export default runner;
