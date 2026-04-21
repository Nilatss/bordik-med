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
    const map: Record<string, { name: string; society: string; examples: string; actions: string[]; caveats: string[] }> = {
      cardio: {
        name: 'Кардиология',
        society: 'CSC — Chinese Society of Cardiology (中华医学会心血管病学分会)',
        examples: 'Guidelines for Hypertension (2023), CHF (2018), AF (2023), ACS (2019). Часто адаптация ESC/ACC с учётом эпидемиологии КНР (выше частота инсультов vs ИБС).',
        actions: [
          'CSC portal: https://www.csc.org.cn/',
          'Chinese Hypertension Guidelines 2023 (Chinese Circulation Journal)',
          'Chinese Journal of Cardiology (中华心血管病杂志): http://zhxxgbx.yiigle.com/',
          'CSC Great Wall Conference (annual, 长城心脏病学大会)',
        ],
        caveats: [
          'BP thresholds: 2023 CN guideline снизил диагностический порог до ≥130/80 (ранее 140/90) — ближе к ACC/AHA',
          'Stroke vs CHD ratio в КНР ~1:1 (vs Запад ~1:5) — акцент на профилактику инсульта при HTN',
          'Dose-adjusted статины: восточноазиатский метаболизм — rosuvastatin макс. 20 мг, а не 40 мг',
          'DOAC — все 4 одобрены NMPA и в NRDL, но dabigatran чаще dose-reduced',
        ],
      },
      endo: {
        name: 'Эндокринология / Diabetes',
        society: 'CDS — Chinese Diabetes Society',
        examples: 'Guideline for the Prevention and Treatment of Type 2 Diabetes Mellitus in China (2020, upd. 2023). Специфика: высокая распространённость T2DM (~12% взрослых), особые дозы метформина, akarbose широко распространена.',
        actions: [
          'CDS portal: https://www.diab.net.cn/',
          'Chinese Journal of Diabetes (中华糖尿病杂志): http://zhtnbzz.yiigle.com/',
          'CDS T2DM Guideline 2020/2023 full PDF',
          'IDF Western Pacific + CDS joint statements',
        ],
        caveats: [
          'Диагностический HbA1c ≥ 6.5% принят в CDS 2020 (ранее — только глюкоза)',
          'Акарбоза — первая линия наравне с метформином (post-prandial glucose доминирует)',
          'Berberine и другие TCM-препараты включены как дополнение (уникально для CDS)',
          'GLP-1 RA и SGLT2i — в NRDL, но insulin аналоги часто не покрываются полностью',
        ],
      },
      onko: {
        name: 'Онкология',
        society: 'CSCO — Chinese Society of Clinical Oncology',
        examples: 'CSCO Guidelines — ежегодное обновление всех основных локализаций (NSCLC, желудок, колоректальный, HCC, молочная железа). Высокая распространённость HCC (HBV), NPC, рака желудка — специфика региона. Препараты: много китайских генериков + local biosimilars.',
        actions: [
          'CSCO portal: http://www.csco.org.cn/',
          'CSCO Guidelines app (iOS/Android) — ежегодное обновление',
          'CSCO Annual Meeting (сентябрь, Xiamen)',
          'NCCN Chinese Edition (co-branded с NCCN US)',
        ],
        caveats: [
          'Локальные PD-1: tislelizumab, camrelizumab, sintilimab, toripalimab — часто first-line в NRDL',
          'NSCLC EGFR mutation rate ~40–50% (vs ~15% на Западе) — обязательно тестирование',
          'HCC (HBV-associated) — особые критерии milan/CNLC staging (не BCLC)',
          'NPC (рак носоглотки) — эндемичен на юге КНР (Гуандун); отдельный CSCO guideline',
          'CAR-T и biosimilars — большая доля локального производства, отличие от западных брендов',
        ],
      },
      resp: {
        name: 'Респираторная',
        society: 'CTS — Chinese Thoracic Society',
        examples: 'COPD guidelines, asthma, pulmonary TB (high burden), ARDS, IPF. Адаптация GOLD/GINA.',
        actions: [
          'CTS portal: http://www.cts.net.cn/',
          'Chinese Journal of Tuberculosis and Respiratory Diseases (中华结核和呼吸杂志)',
          'Chinese COPD guidelines 2021 (CTS)',
          'China CDC TB programme: https://en.chinacdc.cn/',
        ],
        caveats: [
          'TB — КНР в top-3 стран по burden (WHO); free-DOTS через China CDC',
          'Air pollution (PM2.5) — специфический driver COPD/asthma exacerbations',
          'Silicosis, pneumoconiosis — профессиональное (coal mining provinces)',
          'Aspergillus, MAC — растущая проблема, но диагностика ограничена периферийно',
        ],
      },
      paed: {
        name: 'Педиатрия',
        society: 'CPS — Chinese Pediatric Society',
        examples: 'Национальный календарь прививок (National Immunization Program), bronchiolitis, пневмония, IDA (high prevalence), growth charts for Chinese children (WHO-adapted).',
        actions: [
          'CPS portal: http://www.cma-pedia.org/',
          'Chinese Journal of Pediatrics (中华儿科杂志)',
          'NIP (National Immunization Program): http://www.nhc.gov.cn/jkj/',
          'WS/T 423—2022 — China growth standards for children',
        ],
        caveats: [
          'NIP — бесплатные: BCG, HepB, OPV/IPV, DTaP, MMR, JE, MenA, MenAC',
          'Non-NIP (платные): HPV, varicella, PCV13, rotavirus, influenza, HiB',
          'Mycoplasma pneumoniae — циклические эпидемии, макролид-резистентность > 80%',
          'Hand-foot-and-mouth (EV-A71) — EV71 вакцина доступна только в КНР',
        ],
      },
      gi: {
        name: 'Гастроэнтерология',
        society: 'CSG — Chinese Society of Gastroenterology',
        examples: 'H. pylori (very high prevalence — консенсус Kyoto-China), хронический гастрит, IBD (rising incidence), HBV/HCV consensus (China viral hepatitis).',
        actions: [
          'CSG portal: http://www.csgecn.com/',
          'Chinese H. pylori Consensus (6th report, 2022)',
          'Chinese Journal of Digestion (中华消化杂志)',
          'China HBV/HCV consensus (China Foundation for Hepatitis Prevention and Control)',
        ],
        caveats: [
          'H. pylori эрадикация: 14-дневная bismuth quadruple therapy — первая линия (из-за резистентности clarithromycin > 30%)',
          'Gastric cancer — 2-я причина онко-смертности в КНР → endoscopic screening после 40 лет в high-risk regions',
          'HBV — ~70 млн носителей; TDF/TAF/entecavir в NRDL',
          'IBD частота растёт в urban areas — но всё ещё 10–20× ниже чем на Западе',
        ],
      },
      tcm: {
        name: 'Традиционная китайская медицина',
        society: 'SATCM — State Administration of TCM',
        examples: 'TCM официально интегрирована в систему здравоохранения КНР. Национальные стандарты TCM, фармакопея TCM (отдельная часть Chinese Pharmacopoeia), интегрированная медицина (中西医结合 — zhongxiyi jiehe).',
        actions: [
          'SATCM portal: http://www.satcm.gov.cn/',
          'Chinese Pharmacopoeia (ChP) Vol. I (TCM raw + formulations)',
          'World Journal of TCM: http://www.wjtcm.net/',
          'TCM hospital directory (on SATCM portal, по провинциям)',
        ],
        caveats: [
          'TCM — равный статус с Western medicine в КНР по закону (TCM Law 2017)',
          'Многие TCM formulas в NRDL — широко назначаются в hospital settings',
          'Гепатотоксичность: He shou wu, Jin bu huan — следить при назначении',
          'Совместное применение (中西医结合) — риск drug-drug interactions с antiplatelets / warfarin',
        ],
      },
      infect: {
        name: 'Инфекционные болезни',
        society: 'CIDSA + China CDC',
        examples: 'COVID-19 diagnosis and treatment protocol (10+ версий), HBV/HCV consensus, TB (NTP), противомикробная стратегия (high AMR concern).',
        actions: [
          'China CDC: https://en.chinacdc.cn/',
          'CIDSA portal: http://www.cidsa.cn/',
          'China Infectious Disease Reporting System (中国疾病预防控制信息系统)',
          'NHC COVID-19 treatment protocol (latest edition — на nhc.gov.cn)',
        ],
        caveats: [
          'Notifiable diseases — 40+ классов A/B/C, обязательная отчётность в 24ч',
          'AMR: carbapenem-resistant K. pneumoniae в КНР один из самых высоких в мире',
          'Schistosomiasis japonicum — endemic в долинах Янцзы (частично контролировано)',
          'HFRS (hantavirus) — Shaanxi, Heilongjiang; leptospirosis на юге',
          'Influenza H7N9 / H5N1 — регулярный мониторинг',
        ],
      },
    };
    const e = map[s];
    return {
      value: e.name,
      unit: 'China / CMA',
      color: '#6B7280',
      interpretation: `Navigate: Chinese ${e.name}`,
      details: `Специальность: ${e.name}\n\nОбщество: ${e.society}\n\nПримеры: ${e.examples}\n\nИздание: гайдлайны публикуются в Chinese Journal of X (中华X杂志), например Chinese Journal of Cardiology (中华心血管病杂志). Ежегодные обновления через CSCO/CSC конгрессы.`,
      actions: [
        ...e.actions,
        '— Общие источники —',
        'CMA: https://www.cma.org.cn/',
        'NHC (政策): http://www.nhc.gov.cn/',
        'NMPA (лекарства): https://www.nmpa.gov.cn/',
        'China CDC: https://en.chinacdc.cn/',
        'ChiCTR — Chinese Clinical Trial Registry: https://www.chictr.org.cn/',
      ],
      caveats: [
        ...e.caveats,
        '— Общие для КНР —',
        'Полные версии обычно на китайском (упрощённый); английские резюме не всегда',
        'NRDL (National Reimbursement Drug List) — ежегодные переговоры с NHSA',
        'Региональная вариабельность: Tier-1 cities vs сельские районы',
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
