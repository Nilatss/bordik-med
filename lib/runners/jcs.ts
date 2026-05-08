/** Runner: jcs — Japanese clinical guidelines */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Япония',
  reference: 'JCS — Japanese Circulation Society; JDS — Japan Diabetes Society; JSMO — Japanese Society of Medical Oncology; JPS — Japan Pediatric Society; Minds — Japan Council for Quality Health Care. https://www.j-circ.or.jp, https://www.jds.or.jp, https://minds.jcqhc.or.jp',
  inputs: [
    {
      id: 'specialty',
      label: 'Специальность',
      type: 'select',
      options: [
        { value: 'cardio', label: 'Кардиология (JCS — Japanese Circulation Society)' },
        { value: 'diabetes', label: 'Диабет (JDS — Japan Diabetes Society)' },
        { value: 'onko', label: 'Онкология (JSMO, JSCO)' },
        { value: 'paed', label: 'Педиатрия (JPS — Japan Pediatric Society)' },
        { value: 'gi', label: 'Гастроэнтерология (JSGE — Japanese Society of Gastroenterology)' },
        { value: 'resp', label: 'Респираторная (JRS — Japanese Respiratory Society)' },
        { value: 'minds', label: 'Минздрав / Minds (национальная база гайдлайнов)' },
      ],
    },
  ],
  presets: [
    { label: 'JCS — Cardiology', values: { specialty: 'cardio' } },
    { label: 'JDS — Diabetes', values: { specialty: 'diabetes' } },
    { label: 'Minds — национальный портал', values: { specialty: 'minds' } },
  ],
  compute: (v) => {
    const s = String(v.specialty || 'cardio');
    const map: Record<string, { name: string; society: string; examples: string; actions: string[]; caveats: string[] }> = {
      cardio: {
        name: 'Кардиология',
        society: 'JCS — 日本循環器学会',
        examples: 'JCS/JHFS Guideline for Diagnosis and Treatment of Acute and Chronic Heart Failure (2017, upd. 2021); JCS Guidelines for AF Management (2020); JCS Guidelines for Diagnosis and Treatment of Patients with Ischaemic Heart Disease (2022). Японская специфика: более высокая распространённость вазоспастической стенокардии, Takotsubo; более низкие дозы статинов часто приемлемы (восточноазиатский метаболизм).',
        actions: [
          'JCS guidelines (English): https://www.j-circ.or.jp/english/sessions/guidelines/',
          'JCS journal (Circulation Journal): https://www.jstage.jst.go.jp/browse/circj',
          'JHFS (Heart Failure Society): http://www.asas.or.jp/jhfs/',
          'JCS Annual Scientific Meeting (Kyoto/Tokyo)',
        ],
        caveats: [
          'Vasospastic angina — японская клиника: ergonovine / acetylcholine provocation test',
          'Clopidogrel CYP2C19 LOF частый → prasugrel 3.75 мг (не 10 мг как на Западе)',
          'Warfarin — японские пациенты более чувствительны, target INR 1.6–2.6 для AF (не 2–3)',
          'JCS 2022 lipid — LDL < 55 mg/dL для secondary prevention (согласно ESC)',
        ],
      },
      diabetes: {
        name: 'Диабет',
        society: 'JDS — 日本糖尿病学会',
        examples: 'Treatment Guide for Diabetes (ежегодное обновление); Evidence-based Practice Guideline for Treatment of Diabetes in Japan (2024). Специфика: более низкий BMI при T2DM, повышенная чувствительность к сульфонилмочевине, широкое использование ингибиторов DPP-4, HbA1c 6.5% (NGSP) = 6.1% (JDS — old).',
        actions: [
          'JDS portal (English): https://www.jds.or.jp/modules/en/',
          'JDS Treatment Guide 2022-2023 (English): https://www.jds.or.jp/modules/en/index.php?content_id=44',
          'Japan Diabetes Complications Study (JDCS)',
          'JDS Annual Meeting (May)',
        ],
        caveats: [
          'T2DM часто при BMI < 25 — японский "non-obese DM" фенотип',
          'DPP-4i — первая линия у japanese (high response rate)',
          'Metformin dose часто ниже (500–1500 мг/сут vs 2000–2500 на Западе)',
          'HbA1c target < 7.0% NGSP (strict < 6.0% для young без осложнений)',
        ],
      },
      onko: {
        name: 'Онкология',
        society: 'JSMO + JSCO + organ-specific societies',
        examples: 'JSMO guidelines, JSCO guidelines. Локализации: гастрит/рак желудка (высокая распространённость), колоректальный (JSCCR), HCC (JSH — Japan Society of Hepatology с TNM-like Japanese staging). Скрининг желудка — эндоскопия после 50 лет.',
        actions: [
          'JSMO: https://www.jsmo.or.jp/en/',
          'JSCCR (colorectal): http://www.jsccr.jp/english/',
          'Japanese Gastric Cancer Association: http://www.jgca.jp/',
          'JSH HCC guidelines: https://www.jsh.or.jp/',
        ],
        caveats: [
          'Gastric cancer — эндоскопический screening с 50 лет (национальная программа)',
          'JGCA staging — японская классификация помимо TNM',
          'ESD (endoscopic submucosal dissection) — стандарт ранних cancers, родилось в Японии',
          'Trastuzumab deruxtecan (T-DXd) — японский origin (Daiichi Sankyo)',
        ],
      },
      paed: {
        name: 'Педиатрия',
        society: 'JPS — 日本小児科学会',
        examples: 'Национальный календарь прививок (Japan Immunization Program), Kawasaki disease guidelines (Япония — страна-пионер), neonatal resuscitation, childhood obesity.',
        actions: [
          'JPS (English): https://www.jpeds.or.jp/english/',
          'Japanese KD Research Committee: http://www.kawasaki-disease.org/',
          'National Immunization Program (MHLW): https://www.mhlw.go.jp/',
          'NCCHD (National Center for Child Health): https://www.ncchd.go.jp/en/',
        ],
        caveats: [
          'Kawasaki disease — впервые описана Kawasaki T. (1967); treatment IVIG 2 g/kg + ASA',
          'Calendar: BCG, HepB, Rota, DPT-IPV-Hib, PCV13, MR, VZV, JE (japanese encephalitis)',
          'HPV vaccine — возобновлён recommendation 2022 после suspension 2013',
          'JE vaccine уникален (endemic в Asia, не стандартный в USA/EU)',
        ],
      },
      gi: {
        name: 'Гастроэнтерология',
        society: 'JSGE — 日本消化器病学会',
        examples: 'H. pylori eradication guidelines, GERD, IBD, NAFLD, хронический панкреатит, Kyoto consensus для хронического гастрита. JSH — отдельно для печени.',
        actions: [
          'JSGE portal: https://www.jsge.or.jp/',
          'JSH (Japan Society of Hepatology): https://www.jsh.or.jp/English/',
          'Kyoto Global Consensus (H. pylori): https://pubmed.ncbi.nlm.nih.gov/',
          'JED (Japan Endoscopy Database)',
        ],
        caveats: [
          'H. pylori — vonoprazan triple therapy первая линия (уникально в Японии)',
          'Gastric cancer screening — endoscopy-based, не FIT (как США)',
          'NAFLD prevalence растёт (~25% adults) несмотря на low obesity',
          'HBV — NUC (entecavir / TAF) через universal insurance',
        ],
      },
      resp: {
        name: 'Респираторная',
        society: 'JRS — 日本呼吸器学会',
        examples: 'COPD (адаптация GOLD с японскими особенностями), астма, IPF, community-acquired pneumonia, ABPA. Mycobacterium avium complex (MAC) — высокая заболеваемость в Японии.',
        actions: [
          'JRS (English): https://www.jrs.or.jp/english/',
          'JRS MAC guidelines (2023)',
          'Japan CAP guidelines (JRS/JAID)',
          'PMDA asthma / COPD drug approvals',
        ],
        caveats: [
          'MAC pulmonary disease — очень высокая заболеваемость у middle-aged women',
          'Biologics для asthma (omalizumab, mepolizumab, dupilumab, benralizumab, tezepelumab) — все покрыты',
          'Pirfenidone / nintedanib для IPF — японский origin research',
          'COPD prevalence недодиагностирована в Японии (~NICE report)',
        ],
      },
      minds: {
        name: 'Minds (Medical Information Network Distribution Service)',
        society: 'Japan Council for Quality Health Care',
        examples: 'Minds — национальный портал клинических рекомендаций Японии (minds.jcqhc.or.jp). Агрегатор всех Clinical Practice Guidelines + оценка методологического качества (AGREE II). Японские CPG + переводы ключевых международных.',
        actions: [
          'Minds portal: https://minds.jcqhc.or.jp/',
          'Minds Guideline Library (EN search): https://minds.jcqhc.or.jp/s/search_result_en',
          'GRADE Japan: https://minds.jcqhc.or.jp/',
          'Minds CPG Manual (методология)',
        ],
        caveats: [
          'Minds — не creates guidelines, но оценивает (AGREE II)',
          'Peer-review перед listing — качество обеспечено',
          'Search доступен в основном на японском; English limited',
          'Для переведённых международных CPG — проверять дату (может быть задержка)',
        ],
      },
    };
    const e = map[s]!;
    return {
      value: e.name,
      unit: 'Japan',
      color: '#6B7280',
      interpretation: `Navigate: Japanese ${e.name}`,
      details: `Специальность: ${e.name}\n\nОбщество: ${e.society}\n\nПримеры: ${e.examples}`,
      actions: [
        ...e.actions,
        '— Общие источники —',
        'JCS: https://www.j-circ.or.jp/english/',
        'Minds portal: https://minds.jcqhc.or.jp/',
        'PMDA (регулятор): https://www.pmda.go.jp/english/',
        'MHLW: https://www.mhlw.go.jp/english/',
      ],
      caveats: [
        ...e.caveats,
        '— Общие для Японии —',
        'Полные тексты на японском; английские переводы — часто с задержкой',
        'Восточноазиатская фармакогенетика: CYP2C19 LOF → clopidogrel; warfarin — более чувствительны',
        'Реимбурсирование: Kokuho (universal), ставки утверждаются через Chuikyo',
      ],
      related: [
        { id: 'china', title: 'China (CMA)' },
        { id: 'ktas', title: 'KTAS (Korean Triage)' },
        { id: 'esc-eu', title: 'ESC (European Cardiology)' },
      ],
      relatedCourses: [
        { id: '303.1', title: 'Кардиология' },
        { id: '302.1', title: 'Общая врачебная практика' },
      ],
    };
  },
  info: `### Для чего используется
Навигация по японским клиническим рекомендациям. Япония имеет развитую систему EBM гайдлайнов с собственной спецификой (фармакогенетика, эпидемиология, диета).

### Ключевые общества
| Общество | Домен |
|----------|-------|
| **JCS** (Japanese Circulation Society) | Кардиология |
| **JDS** (Japan Diabetes Society) | Диабет |
| **JSMO / JSCO** | Онкология |
| **JPS** | Педиатрия |
| **JSGE / JSH** | Гастро / гепатология |
| **JRS** | Респираторная |
| **Minds** | Национальный портал-агрегатор |

### Японская специфика
- Восточноазиатская фармакогенетика (CYP2C19, warfarin sensitivity)
- Более низкий BMI при T2DM
- Высокая распространённость рака желудка, HCC (HCV/HBV), MAC infection, Kawasaki
- Болезнь Такоцубо впервые описана в Японии (1990)
- Universal health insurance (Kokuho) — покрытие ~70%

### Источники
- https://www.j-circ.or.jp/english/
- https://www.jds.or.jp/modules/en/
- https://minds.jcqhc.or.jp/
- https://www.pmda.go.jp/english/`,
};
export default runner;
