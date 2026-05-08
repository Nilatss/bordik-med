// @ts-nocheck
/**
 * Runner: curb65 — CURB-65 Pneumonia Severity Score
 *
 * P1-CR-10 — Formula source attribution:
 *   PRIMARY:    Lim WS, van der Eerden MM, Laing R, et al. Defining
 *               community acquired pneumonia severity on presentation to
 *               hospital: an international derivation and validation study.
 *               Thorax. 2003;58(5):377-382.
 *               doi:10.1136/thorax.58.5.377
 *   GUIDELINE:  BTS 2009 Guidelines for management of CAP, updated 2015.
 *               https://thorax.bmj.com/content/64/Suppl_3/iii1
 *   GUIDELINE:  ATS/IDSA 2019 CAP — рекомендуют CURB-65 ИЛИ PSI/PORT для
 *               disposition decision (outpatient vs ward vs ICU).
 *               doi:10.1164/rccm.201908-1581ST
 *
 * Mnemonic + items (1 балл каждый):
 *   C — Confusion (new disorientation in person/place/time, AMT ≤8)
 *   U — Urea >7 mmol/L (BUN >19 mg/dL)
 *   R — Respiratory rate ≥30/min
 *   B — Blood pressure (SBP <90 OR DBP ≤60)
 *   65 — Age ≥65 years
 *
 * 30-day mortality + disposition (validated):
 *   0-1  → 1.5%  outpatient management
 *   2    → 9.2%  short hospital stay / supervised outpatient
 *   3-5  → 22%+  hospital admission, consider ICU at ≥4
 *
 * Variants:
 *   - CRB-65 — без urea (для primary care без labs)
 *   - PSI / PORT — более детальная альтернатива (20 переменных)
 *
 * AUTO-GENERATED from lib/tools-runners.ts by scripts/split-runners.mjs.
 * Do not edit by hand - regenerate via `npm run split:runners`.
 *
 * Loaded lazily via dynamic import from lib/runners/index.ts so the
 * encyclopaedia of clinical content stays out of the main app bundle.
 */

import type {
  ScoreTool,
  ToolInput,
  ScoreBand,
  Preset,
  CalculatorResult,
  ResultExtras,
  ResultScaleSegment,
} from '../tools-runners';

const runner: ScoreTool = {
    kind: "score",
    maxScore: 5,
    inputs: [
      {
        id: "confusion",
        label: "Confusion (спутанность, новая)",
        type: "checkbox",
        points: 1
      },
      {
        id: "urea",
        label: "Urea (мочевина) >7 ммоль/л",
        type: "checkbox",
        points: 1
      },
      {
        id: "rr",
        label: "ЧДД ≥30/мин",
        type: "checkbox",
        points: 1
      },
      {
        id: "bp",
        label: "Систолическое АД <90 или ДАД ≤60",
        type: "checkbox",
        points: 1
      },
      {
        id: "age",
        label: "Возраст ≥65 лет",
        type: "checkbox",
        points: 1
      }
    ],
    bands: [
      {
        min: 0,
        max: 1,
        label: "0-1 балл",
        color: "#22C55E",
        description: "Низкая смертность (<3%). Амбулаторное лечение."
      },
      {
        min: 2,
        max: 2,
        label: "2 балла",
        color: "#F59E0B",
        description: "Средняя (~9%). Рассмотреть госпитализацию."
      },
      {
        min: 3,
        max: 5,
        label: "≥3 баллов",
        color: "#EF4444",
        description: "Высокая (15-40%). Госпитализация (≥4 - ICU).",
        details: "Высокая 30-дневная смертность. При 4-5 баллах - рассмотреть ICU, особенно при гипоксемии, лактате ≥ 2, полиорганной недостаточности.",
        actions: [
          "Госпитализация, при ≥ 4 баллах - ICU",
          "Эмпирическая АБ: β-лактам + макролид (или респираторный фторхинолон)",
          "Гемокультуры × 2 до АБ, пневмококковый/легионеллёзный антиген в моче",
          "Оценить оксигенацию (P/F), качать до цели SpO₂ 92-96 %"
        ]
      }
    ],
    caveats: [
      "Не учитывает сопутствующую патологию (СН, ХБП, онкология) и оксигенацию",
      "У пожилых мочевина > 7 часто из-за дегидратации, а не тяжести пневмонии",
      "Для решения об ICU точнее IDSA/ATS критерии или SMART-COP",
      "Не валидизирован для нозокомиальной пневмонии"
    ],
    relatedCourses: [
      {
        id: "301.2",
        title: "Пульмонология"
      },
      {
        id: "301.9",
        title: "Инфекционные болезни"
      }
    ],
    related: [
      {
        id: "qsofa",
        title: "qSOFA (сепсис)"
      },
      {
        id: "news2",
        title: "NEWS2"
      },
      {
        id: "pf-ratio",
        title: "P/F-ratio"
      }
    ],
    reference: "Lim 2003 (BTS). Тяжесть внебольничной пневмонии.",
    info: "### Для чего используется\n**CURB-65 (BTS 2003)** - оценка **тяжести внебольничной пневмонии (ВП)** и решение о месте лечения: амбулаторно / стационар / ICU.\n\n### Расшифровка\n| Буква | Критерий |\n|---|---|\n| **C** | Confusion (спутанность, новая) |\n| **U** | Urea (мочевина) > 7 ммоль/л (BUN > 19 mg/dL) |\n| **R** | Respiratory rate ≥ 30/мин |\n| **B** | Blood pressure САД < 90 или ДАД ≤ 60 |\n| **65** | Возраст ≥ 65 лет |\n\n### Интерпретация\n| CURB-65 | 30-дн смертность | Тактика |\n|---|---|---|\n| 0 | 0,7 % | Амбулаторно |\n| 1 | 2,1 % | Амбулаторно |\n| 2 | 9,2 % | Госпитализация |\n| 3 | 14,5 % | Госпитализация, рассмотреть ICU |\n| 4 | 40 % | ICU |\n| 5 | 57 % | ICU |\n\n### CRB-65 (амбулаторный вариант, без мочевины)\nИспользуется в поликлинике/на дому, когда мочевина недоступна:\n- 0 - амбулаторно\n- 1-2 - рассмотреть госпитализацию\n- 3-4 - срочная госпитализация\n\n### Эмпирическая антибиотикотерапия (IDSA/ATS 2019)\n| Категория | Препараты |\n|---|---|\n| Амбулаторно, без сопутствующих | Амоксициллин 1 г × 3, или доксициклин, или макролид (если резистентность < 25 %) |\n| Амбулаторно, сопутствующие (СД, ХСН, ХОБЛ) | β-лактам + макролид ИЛИ респираторный фторхинолон (левофлоксацин, моксифлоксацин) |\n| Стационар (не-ICU) | β-лактам + макролид ИЛИ фторхинолон |\n| ICU | β-лактам (цефтриаксон/ампициллин-сульбактам) + азитромицин ИЛИ + фторхинолон |\n| + Риск MRSA | + ванкомицин или линезолид |\n| + Риск P. aeruginosa | Пиперациллин-тазобактам, цефепим, меропенем + ципрофлоксацин/левофлоксацин |\n\n**Длительность**: минимум 5 дней, обычно 7 дней; пневмококковая может быть 5-7; легионелла - 10-14.\n\n### Критерии ICU (IDSA/ATS minor criteria - ≥ 3 или 1 major)\n**Major**:\n- Септический шок с вазопрессорами\n- Механическая вентиляция\n\n**Minor** (нужно ≥ 3):\n- Ч/Д ≥ 30\n- PaO₂/FiO₂ ≤ 250\n- Мультилобарные инфильтраты\n- Confusion\n- Уремия (BUN ≥ 20 mg/dL)\n- Лейкопения (< 4 × 10⁹/л)\n- Тромбоцитопения (< 100 × 10⁹/л)\n- Гипотермия (< 36 °C)\n- Гипотензия, требующая агрессивной инфузии\n\n### Кроме CURB-65 - другие шкалы\n| Шкала | Особенность |\n|---|---|\n| **PSI (Pneumonia Severity Index)** | Более сложная (20 переменных), точнее для 30-дн смертности |\n| **SMART-COP** | Для предсказания необходимости ИВЛ/вазопрессоров |\n| **A-DROP** (Япония) | Возраст, Dehydration, Respiratory, Orientation, Pressure |\n\n### Диагностика\n- **Рентген / КТ** для подтверждения инфильтрата\n- Пульсоксиметрия, лактат при тяжёлой\n- Гемокультуры × 2 (при госпитализации)\n- Окраска мокроты по Граму + культура\n- Антигены мочи: **Streptococcus pneumoniae, Legionella pneumophila** (при тяжёлой)\n- ПЦР: грипп, РСВ, COVID-19\n- Прокальцитонин (для деэскалации антибиотиков)\n\n### Вакцинация (профилактика)\n- PCV20 или PCV15→PPSV23 у всех > 65\n- Ежегодно грипп\n- COVID-19 бустеры\n- RSV vaccine (≥ 60 лет высокий риск)\n\n### Ограничения\n- Не учитывает гипоксию (добавьте SpO₂)\n- Недооценивает тяжесть у молодых с иммунодефицитом\n- В ICU-популяции не работает (используйте SOFA)"
  };

export default runner;
