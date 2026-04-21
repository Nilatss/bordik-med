// @ts-nocheck
/** Runner: evidencepoint — EvidencePoint (DynaMed alternative) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'США / Международный',
  reference: 'DynaMed / EvidencePoint (EBSCO). https://www.dynamed.com/ · Альтернативы: EvidencePoint, BMJ Best Practice.',
  inputs: [
    {
      id: 'specialty',
      label: 'Специальность',
      type: 'select',
      options: [
        { value: 'im', label: 'Внутренние болезни' },
        { value: 'em', label: 'Неотложная помощь' },
        { value: 'peds', label: 'Педиатрия' },
        { value: 'obgyn', label: 'Акушерство/гинекология' },
        { value: 'surg', label: 'Хирургия' },
        { value: 'psych', label: 'Психиатрия' },
        { value: 'derm', label: 'Дерматология' },
        { value: 'primary', label: 'Primary care / семейная' },
      ],
    },
  ],
  presets: [
    { label: 'Primary care', values: { specialty: 'primary' } },
    { label: 'Неотложная', values: { specialty: 'em' } },
    { label: 'Педиатрия', values: { specialty: 'peds' } },
  ],
  compute: (v) => {
    const s = String(v.specialty || 'im');
    const map: Record<string, { title: string; nav: string }> = {
      im: { title: 'Внутренние болезни', nav: 'Browse by Body System → Cardiovascular / Endocrine / Hematology / etc. или прямой поиск по диагнозу.' },
      em: { title: 'Неотложная помощь', nav: 'Emergency Medicine tab → Trauma / Toxicology / Shock / Cardiac arrest. Быстрые "EMA" (Emergency Medicine Approach) pathways.' },
      peds: { title: 'Педиатрия', nav: 'Pediatrics section → возрастные разделы (neonatal / infant / toddler / school-age). Pediatric dosing calculator встроен.' },
      obgyn: { title: 'Акушерство/гинекология', nav: 'Women\'s Health → Obstetrics / Gynecology. Prenatal care timeline, labor & delivery algorithms.' },
      surg: { title: 'Хирургия', nav: 'Surgery by system → Preop/Intraop/Postop sections с evidence-based protocols (напр. ERAS pathways).' },
      psych: { title: 'Психиатрия', nav: 'Mental Health → DSM-5/ICD-11 aligned. Drug-drug interactions критически важны — cross-ref с Lexicomp.' },
      derm: { title: 'Дерматология', nav: 'Dermatology atlas со стоковыми фото + алгоритмы ведения по морфологии высыпания.' },
      primary: { title: 'Primary care / семейная', nav: 'Preventive care schedules (USPSTF) + chronic disease management (HTN/DM/CKD/COPD). Интеграция USPSTF grades A-D.' },
    };
    const e = map[s];
    return {
      value: e.title,
      unit: 'DynaMed/EvPoint',
      color: '#6B7280',
      interpretation: `DynaMed/EvidencePoint: ${e.title}`,
      details: `Специальность: ${e.title}\n\nНавигация: ${e.nav}\n\nDynaMed structure (каждая topic):\n- Overview & Recommendations — ключевые рекомендации с levels\n- Related Summaries — связанные темы\n- Background — этиология, эпидемиология, патофизиология\n- History — anamnesis questions\n- Physical — examination findings\n- Diagnosis — criteria, differential, tests\n- Prognosis — ожидаемое течение\n- Treatment — medications, non-drug, procedures\n- Prevention & Screening — evidence-based prevention\n- Quality improvement — performance measures\n\nDynaMed Level of Evidence:\n- Level 1 [Likely reliable evidence] — высокое качество (systematic reviews, крупные RCT)\n- Level 2 [Mid-level evidence] — meta-analyses среднего качества, cohort studies\n- Level 3 [Lacking direct evidence] — экспертное мнение, уровни без прямых данных\n\n7-step systematic surveillance: DynaMed редакторы ежедневно мониторят > 500 журналов, обновления идут непрерывно (в отличие от UpToDate с weekly cycle).`,
      actions: [
        'Открыть https://www.dynamed.com/ (подписка через EBSCO)',
        'Мобильное приложение DynaMed (iOS/Android) — offline после sync',
        'Институциональная подписка через библиотеку (Athens / IP-auth)',
        'CME кредиты за чтение (US) — до 0.5 кредита за topic',
        '"Drug-drug interactions" — интеграция с Micromedex',
        'Альтернативы: BMJ Best Practice (BMJ), UpToDate (Wolters Kluwer)',
      ],
      caveats: [
        'Требуется подписка — бесплатный доступ ограничен',
        'DynaMed Plus был объединён с основным DynaMed в 2020 г.',
        '"EvidencePoint" — разные продукты разных издателей могут использовать это название; точное имя — DynaMed (EBSCO)',
        'US-ориентация: дозы, brand names, guidelines US',
        'Для РФ — сверить с КР МЗ РФ при применении',
      ],
      related: [
        { id: 'uptodate', title: 'UpToDate (Wolters Kluwer)' },
        { id: 'bmj-bp', title: 'BMJ Best Practice' },
        { id: 'mdcalc', title: 'MDCalc' },
      ],
      relatedCourses: [
        { id: '312.1', title: 'Медицинское образование' },
        { id: '302.1', title: 'Общая врачебная практика' },
      ],
    };
  },
  info: `### Для чего используется
**DynaMed** (EBSCO Health) — evidence-based clinical decision support tool, основной конкурент UpToDate. Быстрый reference для point-of-care решений с explicit evidence grading. Иногда упоминается под названием **EvidencePoint** или "evidence-based point-of-care tool".

### Отличие от UpToDate
| Аспект | DynaMed | UpToDate |
|---|---|---|
| Update cycle | Непрерывный (ежедневный surveillance > 500 журналов) | Еженедельный |
| Evidence grading | Level 1/2/3 (explicit) | GRADE 1A-2C |
| Стиль | Bullet-point, быстрее для скана | Narrative, глубже |
| Цена | Обычно дешевле через EBSCO | Премиум-позиционирование |
| Mobile app | Да, offline | Да, offline |

### Структура topic
1. Overview & Recommendations
2. Related Summaries
3. Background
4. History & Physical
5. Diagnosis
6. Prognosis
7. Treatment
8. Prevention & Screening
9. Quality Improvement (performance measures)
10. References

### DynaMed Level of Evidence
- **Level 1** — likely reliable evidence (SR, большие RCT)
- **Level 2** — mid-level evidence
- **Level 3** — lacking direct evidence (expert opinion)

### 7-step systematic literature surveillance
Ежедневно команда мониторит > 500 журналов + Cochrane + guideline repositories → обновления публикуются в тот же день если практика-меняющие данные.

### Доступ
- Институциональная подписка (больница/университет) через EBSCO
- Мобильное приложение после sync — offline
- CME кредиты (US)`,
};
export default runner;
