// @ts-nocheck
/** Runner: nice-cks — NICE Clinical Knowledge Summaries (UK) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Великобритания (NHS England, NICE)',
  reference: 'National Institute for Health and Care Excellence. Clinical Knowledge Summaries (CKS). https://cks.nice.org.uk/ (бесплатно для NHS; публичный доступ в UK)',
  inputs: [
    {
      id: 'topic',
      label: 'Тема (primary care)',
      type: 'select',
      options: [
        { value: 'htn', label: 'Гипертензия' },
        { value: 'dm2', label: 'Сахарный диабет 2 типа' },
        { value: 'asthma', label: 'Бронхиальная астма' },
        { value: 'depression', label: 'Депрессия' },
        { value: 'back-pain', label: 'Боль в спине' },
        { value: 'uti', label: 'Инфекции мочевых путей' },
        { value: 'sore-throat', label: 'Боль в горле' },
        { value: 'contracept', label: 'Контрацепция' },
      ],
    },
  ],
  presets: [
    { label: 'Гипертензия', values: { topic: 'htn' } },
    { label: 'СД2', values: { topic: 'dm2' } },
    { label: 'Астма', values: { topic: 'asthma' } },
  ],
  compute: (v) => {
    const t = String(v.topic || 'htn');
    const map: Record<string, { title: string; summary: string; guidance: string; ng: string }> = {
      htn: { title: 'Hypertension in adults', summary: 'Диагноз: клинич АД ≥ 140/90 + ABPM/HBPM ≥ 135/85 mm Hg', guidance: 'Step 1: < 55 лет/non-black — ACEi/ARB; ≥ 55 или black — CCB. Step 2: add CCB или ACEi/ARB. Step 3: + thiazide-like diuretic. Step 4 (resistant): + spironolactone если K < 4.5', ng: 'NG136 (2019, revised 2022)' },
      dm2: { title: 'Type 2 diabetes', summary: 'HbA1c ≥ 48 mmol/mol (6.5%) для диагноза; цель 48-53 mmol/mol', guidance: '1-я линия: метформин MR. При ССЗ/ХБП — добавить SGLT2i. Эскалация: DPP-4i / SU / pioglitazone / GLP-1 RA', ng: 'NG28 (2015, last updated 2022)' },
      asthma: { title: 'Asthma', summary: 'Диагноз BTS/SIGN + NICE: FeNO ≥ 40 ppb + spirometry + PEF variability', guidance: 'Step 1: SABA + low-dose ICS. Step 2: + LTRA. Step 3: + LABA. Step 4: MART. Step 5: высокодозный ICS / theophylline / specialist', ng: 'NG80 (2017, last updated 2021); BTS/SIGN 158' },
      depression: { title: 'Depression in adults', summary: 'PHQ-9 для скрининга и мониторинга; less severe vs more severe', guidance: 'Less severe: guided self-help, CBT, group exercise. More severe: CBT + antidepressant (SSRI 1-я линия: sertraline/citalopram)', ng: 'NG222 (2022)' },
      'back-pain': { title: 'Low back pain and sciatica', summary: 'STarT Back tool для стратификации риска; без routine imaging', guidance: 'Self-management + exercise. NSAID + weak opioid PRN. Без paracetamol-монотерапии. MRI только если рассматривается спинальная хирургия/infection', ng: 'NG59 (2016, last updated 2020)' },
      uti: { title: 'UTI (lower) — antimicrobial prescribing', summary: 'Женщины < 65: dipstick не требуется если ≥ 2 симптома', guidance: '1-я линия: нитрофурантоин 100 мг MR × 2 × 3 дня (женщины) / 7 дней (мужчины). Альтернатива: триметоприм 200 мг × 2 × 3 дня (если резистентность < 20%)', ng: 'NG109 (2018)' },
      'sore-throat': { title: 'Sore throat (acute)', summary: 'FeverPAIN или Centor score для решения об АБ', guidance: 'FeverPAIN 0-1: no АБ. 2-3: no АБ или backup. 4-5: immediate АБ — феноксиметилпенициллин 500 мг × 4 × 5-10 дней', ng: 'NG84 (2018)' },
      contracept: { title: 'Contraception', summary: 'UKMEC категории 1-4 для оценки риска методов', guidance: 'LARC (IUS/IUD/implant) — наиболее эффективны. КОК противопоказаны при мигрени с аурой (UKMEC 4)', ng: 'FSRH guidelines (integrated with CKS)' },
    };
    const e = map[t];
    return {
      value: e.title,
      unit: 'NICE CKS',
      color: '#6B7280',
      interpretation: `CKS: ${e.title}`,
      details: `**Topic:** ${e.title}\n\n**Диагностика:** ${e.summary}\n\n**Management:** ${e.guidance}\n\n**Связанный NICE guideline:** ${e.ng}\n\nCKS — **primary care quick reference** от NICE, основан на NICE guidelines + Cochrane + другая evidence. Структура: Summary, Have I got the right topic?, How up-to-date is this topic?, Management, Prescribing information, Background information.`,
      actions: [
        'Открыть https://cks.nice.org.uk/topics/' + t.replace(/-/g, '-'),
        'Бесплатно для NHS сотрудников; полный доступ в UK по IP',
        'Вне UK — частичный доступ (некоторые topics заблокированы)',
        'Мобильное приложение не предоставляется — оптимизирован для web',
        'Cross-reference к полному NICE guideline (' + e.ng + ')',
        'Prescribing info — BNF интеграция для доз',
      ],
      caveats: [
        'UK-specific: дозы и торговые названия для NHS/BNF',
        'Обновляется ~раз в 2-5 лет (не непрерывно как UpToDate)',
        'Geo-blocked вне UK для некоторых разделов с 2021 (NICE policy)',
        'Не для стационарного/специализированного лечения — только primary care',
        'При применении в РФ/ЕС — сверить с локальными стандартами и регистрацией препаратов',
      ],
      related: [
        { id: 'nice-guidelines', title: 'NICE full guidelines' },
        { id: 'bnf', title: 'British National Formulary' },
        { id: 'sign', title: 'SIGN (Scotland)' },
        { id: 'uptodate', title: 'UpToDate' },
      ],
      relatedCourses: [
        { id: '312.1', title: 'Медицинское образование' },
        { id: '302.1', title: 'Общая врачебная практика' },
      ],
    };
  },
  info: `### Для чего используется
**NICE Clinical Knowledge Summaries (CKS)** — краткие, удобные для primary care сводки NICE guidelines для GP и медсестёр NHS. Покрывает > 370 клинических тем, используется в UK primary care ежедневно.

### Структура topic
1. **Summary** — ключевые моменты
2. **Have I got the right topic?** — scope и исключения
3. **How up-to-date is this topic?** — дата последнего пересмотра
4. **Management** — пошаговый алгоритм
5. **Prescribing information** — дозы из BNF
6. **Background information** — этиология, эпидемиология
7. **Diagnosis** — критерии и дифференциал
8. **References** — NICE guidelines, Cochrane, NHS sources

### Доступ
- **Бесплатно для NHS** (через OpenAthens)
- **Публично в UK** (по IP-адресу)
- Вне UK — ограничен с 2021 (NICE policy)

### Связь с NICE guidelines
CKS = clinical "quick reference" суммирует полный NICE guideline (напр. NG136 для HTN). Если нужна полная evidence review — NICE guideline; если быстрое решение в primary care — CKS.`,
};
export default runner;
