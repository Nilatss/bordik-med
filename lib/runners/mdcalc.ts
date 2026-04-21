// @ts-nocheck
/** Runner: mdcalc — MDCalc (evidence-based medical calculators) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'США / Международный (MD Aware LLC, сейчас часть Google Health)',
  reference: 'MDCalc. MD Aware LLC. https://www.mdcalc.com/ (> 825 калькуляторов с evidence review; ~2 млн клиницистов/мес)',
  inputs: [
    {
      id: 'category',
      label: 'Категория калькулятора',
      type: 'select',
      options: [
        { value: 'cardio', label: 'Кардиология (CHA₂DS₂-VASc, HEART, GRACE)' },
        { value: 'pulm', label: 'Пульмонология (Wells PE, PERC, PSI)' },
        { value: 'gi', label: 'ЖКТ (MELD, Glasgow-Blatchford, Rockall)' },
        { value: 'renal', label: 'Нефрология (CKD-EPI, Cockcroft, FENa)' },
        { value: 'em', label: 'Неотложная (NIHSS, Ottawa, NEXUS)' },
        { value: 'icu', label: 'ИТ (APACHE II, SOFA, qSOFA)' },
        { value: 'ob', label: 'Акушерство (Bishop, APGAR)' },
        { value: 'endo', label: 'Эндокринология (HbA1c → eAG, Corrected Ca)' },
      ],
    },
  ],
  presets: [
    { label: 'Кардио', values: { category: 'cardio' } },
    { label: 'Неотложная', values: { category: 'em' } },
    { label: 'ИТ', values: { category: 'icu' } },
  ],
  compute: (v) => {
    const c = String(v.category || 'cardio');
    const map: Record<string, { title: string; count: string; top: string; evidence: string }> = {
      cardio: { title: 'Кардиология', count: '~120 калькуляторов', top: 'CHA₂DS₂-VASc, HAS-BLED, HEART, TIMI, GRACE, ASCVD, Framingham, Duke criteria, Killip', evidence: 'Большинство — Level A (validated in ≥ 2 independent cohorts)' },
      pulm: { title: 'Пульмонология', count: '~60 калькуляторов', top: 'Wells DVT, Wells PE, PERC, Geneva, PSI/PORT, CURB-65, BODE, SMART-COP', evidence: 'PSI и CURB-65 — Level A; BODE — Level B' },
      gi: { title: 'ЖКТ / гепатология', count: '~50 калькуляторов', top: 'MELD, MELD-Na, Child-Pugh, Glasgow-Blatchford, Rockall, AIMS65, MDF (Maddrey)', evidence: 'MELD для трансплантации — Level A; Rockall — Level B' },
      renal: { title: 'Нефрология', count: '~40 калькуляторов', top: 'CKD-EPI 2021, Cockcroft-Gault, MDRD, Schwartz (pediatric), FENa, FEUrea, KDIGO AKI', evidence: 'CKD-EPI 2021 (без race) — текущий стандарт' },
      em: { title: 'Неотложная помощь', count: '~150 калькуляторов', top: 'NIHSS, GCS, Ottawa Ankle/Knee/Head, NEXUS, Canadian C-Spine, PECARN, Alvarado, Kocher', evidence: 'Ottawa правила — Level A (> 95% sensitivity)' },
      icu: { title: 'Интенсивная терапия', count: '~40 калькуляторов', top: 'APACHE II/III/IV, SOFA, qSOFA, SAPS II, Pediatric Risk of Mortality (PRISM), Lung Injury Score', evidence: 'APACHE II и SOFA — Level A для mortality prediction' },
      ob: { title: 'Акушерство', count: '~25 калькуляторов', top: 'Bishop Score, APGAR, Gestational age, EDD (Naegele), BPP, PPH risk', evidence: 'Bishop — Level A для прогноза индукции родов' },
      endo: { title: 'Эндокринология', count: '~30 калькуляторов', top: 'HbA1c → eAG, Corrected Ca, Corrected Na, Plasma Osm, FINDRISC, HOMA-IR, Free Water Deficit', evidence: 'Corrected Ca и HbA1c conversion — consensus formulas' },
    };
    const e = map[c];
    return {
      value: e.title,
      unit: 'MDCalc',
      color: '#6B7280',
      interpretation: `MDCalc: ${e.title}`,
      details: `Категория: ${e.title}\n\nОбъём: ${e.count}\n\nТоп-калькуляторы: ${e.top}\n\nУровень доказательности: ${e.evidence}\n\nСтруктура каждого MDCalc-калькулятора:\n1. Use / Pearls / Pitfalls — когда применять, подводные камни\n2. Input variables — с explanations / tooltips\n3. Result + interpretation — автоматическая клиническая интерпретация\n4. Next Steps — что делать с результатом (management)\n5. Evidence — оригинальные статьи (часто со ссылками PubMed)\n6. Creator insights — интервью с автором шкалы (если возможно)\n\nMDCalc Evidence Rating:\n- Well studied — множественные validation studies\n- Widely used — клинически принят несмотря на ограничения доказательной базы\n- Cautious use — ограниченная валидация или противоречивые данные`,
      actions: [
        'Открыть https://www.mdcalc.com/ — поиск по названию или специальности',
        'Мобильное приложение MDCalc Medical Calculator (iOS/Android) — бесплатно, offline mode для подписчиков',
        'CME кредиты доступны (US) — MDCalc CME (подписка)',
        'Browse by Specialty — 33 специальности',
        'Favorites + Recent — для быстрого доступа',
        'Интеграция с EHR (Epic, Cerner) — для больниц',
      ],
      caveats: [
        'Базовая версия бесплатна; CME и advanced features — подписка',
        'US-ориентация: нормы лаб показателей в мг/дл и conventional units (есть SI toggle)',
        'Не все калькуляторы валидированы в рос./европ. популяциях',
        'Для критических решений — сверить с оригинальной статьёй (указана в Evidence tab)',
        'GoogleMed/Google Health с 2023 — возможны изменения в модели доступа',
      ],
      related: [
        { id: 'qxmd', title: 'QxMD Calculate' },
        { id: 'uptodate', title: 'UpToDate (calculators tab)' },
        { id: 'pubmed', title: 'PubMed (evidence)' },
      ],
      relatedCourses: [
        { id: '312.1', title: 'Медицинское образование' },
        { id: '302.1', title: 'Общая врачебная практика' },
      ],
    };
  },
  info: `### Для чего используется
**MDCalc** — крупнейший в мире бесплатный портал медицинских калькуляторов (> 825 инструментов) с **evidence review** для каждого. Используется > 2 млн клиницистов ежемесячно. Создан доктором Joe Habboushe (emergency physician). С 2023 часть Google Health.

### Структура калькулятора
1. **Use** — когда применять
2. **Pearls / Pitfalls** — клинические советы и предостережения
3. **Why use** — почему именно этот инструмент
4. **Inputs** — с подсказками и unit toggle (US / SI)
5. **Result** — с автоматической интерпретацией
6. **Next Steps** — management рекомендации
7. **Evidence** — ссылки на оригинальные статьи (PubMed)
8. **Creator insights** — часто интервью с автором шкалы

### Популярные категории
- Кардиология (~120): CHA₂DS₂-VASc, HEART, GRACE, TIMI, ASCVD
- Неотложная помощь (~150): Ottawa rules, NEXUS, Wells, PERC
- Пульмонология (~60): PSI, CURB-65, BODE
- Нефрология (~40): CKD-EPI 2021, FENa
- ЖКТ (~50): MELD, Glasgow-Blatchford, Rockall
- ИТ (~40): APACHE II, SOFA, qSOFA

### Бесплатно vs Premium
- **Base** — все калькуляторы бесплатно, web + mobile
- **MDCalc CME** — подписка, CME кредиты (US ACCME)
- **MDCalc for EHR** — enterprise интеграция (Epic, Cerner)

### Mobile app
MDCalc Medical Calculator (iOS/Android) — бесплатно. Offline mode только для CME subscribers.`,
};
export default runner;
