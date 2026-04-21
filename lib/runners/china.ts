// @ts-nocheck
/** Runner: china — Chinese national clinical guidelines */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Китай (КНР)',
  reference: 'CMA — Chinese Medical Association (中华医学会); NHC — National Health Commission (国家卫生健康委员会); NMPA — National Medical Products Administration. https://www.cma.org.cn, http://www.nhc.gov.cn',
  inputs: [
    {
      id: 'specialty',
      label: 'Специальность',
      type: 'select',
      options: [
        { value: 'cardio', label: 'Кардиология (CSC — Chinese Society of Cardiology)' },
        { value: 'endo', label: 'Эндокринология / Diabetes (CDS — Chinese Diabetes Society)' },
        { value: 'onko', label: 'Онкология (CSCO — Chinese Society of Clinical Oncology)' },
        { value: 'resp', label: 'Респираторная (CTS — Chinese Thoracic Society)' },
        { value: 'paed', label: 'Педиатрия (CPS — Chinese Pediatric Society)' },
        { value: 'gi', label: 'Гастроэнтерология (CSG)' },
        { value: 'tcm', label: 'Традиционная китайская медицина (TCM — SATCM)' },
        { value: 'infect', label: 'Инфекционные болезни (CIDSA)' },
      ],
    },
  ],
  presets: [
    { label: 'CSCO — онкология', values: { specialty: 'onko' } },
    { label: 'CDS — диабет', values: { specialty: 'endo' } },
    { label: 'Кардиология (CSC)', values: { specialty: 'cardio' } },
  ],
  compute: (v) => {
    const s = String(v.specialty || 'cardio');
    const map: Record<string, { name: string; society: string; examples: string }> = {
      cardio: { name: 'Кардиология', society: 'CSC — Chinese Society of Cardiology (中华医学会心血管病学分会)', examples: 'Guidelines for Hypertension (2023), CHF (2018), AF (2023), ACS (2019). Часто адаптация ESC/ACC с учётом эпидемиологии КНР (выше частота инсультов vs ИБС).' },
      endo: { name: 'Эндокринология / Diabetes', society: 'CDS — Chinese Diabetes Society', examples: 'Guideline for the Prevention and Treatment of Type 2 Diabetes Mellitus in China (2020, upd. 2023). Специфика: высокая распространённость T2DM (~12% взрослых), особые дозы метформина, akarbose широко распространена.' },
      onko: { name: 'Онкология', society: 'CSCO — Chinese Society of Clinical Oncology', examples: 'CSCO Guidelines — ежегодное обновление всех основных локализаций (NSCLC, желудок, колоректальный, HCC, молочная железа). Высокая распространённость HCC (HBV), NPC, рака желудка — специфика региона. Препараты: много китайских генериков + local biosimilars.' },
      resp: { name: 'Респираторная', society: 'CTS — Chinese Thoracic Society', examples: 'COPD guidelines, asthma, pulmonary TB (high burden), ARDS, IPF. Адаптация GOLD/GINA.' },
      paed: { name: 'Педиатрия', society: 'CPS — Chinese Pediatric Society', examples: 'Национальный календарь прививок (National Immunization Program), bronchiolitis, пневмония, IDA (high prevalence), growth charts for Chinese children (WHO-adapted).' },
      gi: { name: 'Гастроэнтерология', society: 'CSG — Chinese Society of Gastroenterology', examples: 'H. pylori (very high prevalence — консенсус Kyoto-China), хронический гастрит, IBD (rising incidence), HBV/HCV consensus (China viral hepatitis).' },
      tcm: { name: 'Традиционная китайская медицина', society: 'SATCM — State Administration of TCM', examples: 'TCM официально интегрирована в систему здравоохранения КНР. Национальные стандарты TCM, фармакопея TCM (отдельная часть Chinese Pharmacopoeia), интегрированная медицина (中西医结合 — zhongxiyi jiehe).' },
      infect: { name: 'Инфекционные болезни', society: 'CIDSA + China CDC', examples: 'COVID-19 diagnosis and treatment protocol (10+ версий), HBV/HCV consensus, TB (NTP), противомикробная стратегия (high AMR concern).' },
    };
    const e = map[s];
    return {
      value: e.name,
      unit: 'China / CMA',
      color: '#6B7280',
      interpretation: `Navigate: Chinese ${e.name}`,
      details: `Специальность: ${e.name}\n\nОбщество: ${e.society}\n\nПримеры: ${e.examples}\n\nИздание: гайдлайны публикуются в Chinese Journal of X (中华X杂志), например Chinese Journal of Cardiology (中华心血管病杂志). Ежегодные обновления через CSCO/CSC конгрессы.`,
      actions: [
        'CMA: https://www.cma.org.cn/',
        'NHC (政策): http://www.nhc.gov.cn/',
        'NMPA (лекарства): https://www.nmpa.gov.cn/',
        'China CDC: https://en.chinacdc.cn/',
        'CSCO guidelines app (онкология)',
        'Chinese Journal archives (medlive.cn, yiigle.com)',
        'ChiCTR — Chinese Clinical Trial Registry',
      ],
      caveats: [
        'Большинство полных версий — на китайском (упрощённый); английские резюме есть не всегда',
        'Chinese Pharmacopoeia (ChP) отличается от European/USP — особенно для TCM',
        'Генерическая замена в КНР — GQCE programme (Generic Quality Consistency Evaluation)',
        'TCM интегрирована официально — учитывать при переводе пациентов',
        'Реимбурсирование: National Reimbursement Drug List (NRDL) — ежегодные переговоры с NHSA (National Healthcare Security Administration)',
        'Высокая региональная вариабельность: Tier-1 cities (Beijing, Shanghai) vs сельские районы',
      ],
      related: [
        { id: 'jcs', title: 'JCS (Japan)' },
        { id: 'asean', title: 'ASEAN guidelines' },
        { id: 'iap', title: 'IAP (India)' },
      ],
      relatedCourses: [
        { id: '302.1', title: 'Общая врачебная практика' },
        { id: '300.1', title: 'Организация здравоохранения' },
      ],
    };
  },
  info: `### Для чего используется
Навигация по национальной системе клинических рекомендаций КНР. Крупнейшая в мире система здравоохранения по числу пациентов.

### Ключевые организации
| Орган | Роль |
|-------|------|
| **NHC** (国家卫生健康委员会) | National Health Commission — министерство здравоохранения, политика |
| **NMPA** | Регистрация лекарств и медизделий (аналог EMA/FDA) |
| **CMA** (中华医学会) | Chinese Medical Association — зонтичное общество (~90 специализированных subsocieties) |
| **NHSA** | National Healthcare Security Administration — страхование, цены, NRDL |
| **China CDC** | CDC КНР |
| **SATCM** | Администрация TCM |

### Специфика КНР
- Интегрированная медицина (中西医结合 — Western + TCM)
- Национальный прививочный календарь (бесплатный для детей)
- **NRDL** — National Reimbursement Drug List (ежегодные price negotiations)
- Высокая распространённость HBV/HCV, H. pylori, рака желудка/печени/NPC
- Региональные различия: Tier-1 cities vs rural

### Источники
- https://www.cma.org.cn/
- http://www.nhc.gov.cn/
- https://www.nmpa.gov.cn/
- https://en.chinacdc.cn/`,
};
export default runner;
