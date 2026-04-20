// @ts-nocheck
/**
 * Runner: hachinski
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
    maxScore: 18,
    inputs: [
      {
        id: "abrupt",
        label: "Острое начало",
        type: "checkbox",
        points: 2
      },
      {
        id: "stepwise",
        label: "Ступенчатое прогрессирование",
        type: "checkbox",
        points: 1
      },
      {
        id: "fluctuating",
        label: "Флюктуирующее течение",
        type: "checkbox",
        points: 2
      },
      {
        id: "nocturnal",
        label: "Ночная спутанность",
        type: "checkbox",
        points: 1
      },
      {
        id: "personality",
        label: "Относительно сохранная личность",
        type: "checkbox",
        points: 1
      },
      {
        id: "depression",
        label: "Депрессия",
        type: "checkbox",
        points: 1
      },
      {
        id: "somatic",
        label: "Соматические жалобы",
        type: "checkbox",
        points: 1
      },
      {
        id: "emotional",
        label: "Эмоциональное недержание",
        type: "checkbox",
        points: 1
      },
      {
        id: "htn",
        label: "Артериальная гипертензия в анамнезе",
        type: "checkbox",
        points: 1
      },
      {
        id: "stroke",
        label: "Инсульт в анамнезе",
        type: "checkbox",
        points: 2
      },
      {
        id: "atherosclerosis",
        label: "Сопутствующий атеросклероз",
        type: "checkbox",
        points: 1
      },
      {
        id: "focal_symp",
        label: "Очаговые неврологические симптомы",
        type: "checkbox",
        points: 2
      },
      {
        id: "focal_signs",
        label: "Очаговые неврологические признаки",
        type: "checkbox",
        points: 2
      }
    ],
    bands: [
      {
        min: 0,
        max: 4,
        label: "≤ 4 - первичная (Alzheimer)",
        color: "#3B82F6",
        description: "Клиническая картина соответствует первичной дегенеративной деменции.",
        details: "Наиболее вероятно - болезнь Альцгеймера. Сосудистый компонент маловероятен.",
        actions: [
          "МРТ головного мозга (атрофия гиппокампа, височно-теменная)",
          "При возможности - биомаркёры (PET амилоид/тау, ЦСЖ Aβ42/тау)",
          "Ингибиторы AChE (донепезил, ривастигмин, галантамин)",
          "Мемантин при умеренной-тяжёлой стадии"
        ]
      },
      {
        min: 5,
        max: 6,
        label: "5-6 - смешанная",
        color: "#F59E0B",
        description: "Смешанная (Alzheimer + сосудистая) деменция вероятна.",
        details: "Смешанный патогенез часто встречается у пожилых. Оптимизация сосудистых факторов риска критична.",
        actions: [
          "МРТ (выявить оба компонента - лейкоареоз, лакуны + атрофия)",
          "Контроль АГ, СД, ФП, статины",
          "Антиагреганты при показаниях",
          "Ингибиторы AChE эффективны при смешанной"
        ]
      },
      {
        min: 7,
        max: 18,
        label: "≥ 7 - сосудистая",
        color: "#EF4444",
        description: "Клиническая картина соответствует сосудистой (мультиинфарктной) деменции.",
        details: "Первичная цель - профилактика повторных инсультов и контроль факторов риска.",
        actions: [
          "МРТ / КТ (множественные инфаркты, лейкоареоз, лакуны)",
          "Оптимизация АД (<130/80), ЛПНП (<1.8), HbA1c (<7)",
          "Антиагреганты (аспирин, клопидогрел) / антикоагулянты при ФП",
          "Реабилитация (физическая, когнитивная)",
          "Ингибиторы AChE - небольшая польза доказана"
        ]
      }
    ],
    caveats: [
      "Клинический инструмент - не заменяет МРТ/КТ нейровизуализацию",
      "Низкая специфичность для смешанной деменции (5-6 перекрывается)",
      "Разработан до современных биомаркёров Alzheimer (PET амилоид, ЦСЖ)",
      "Модифицированная версия Rosen (1980) - упрощённая"
    ],
    related: [
      {
        id: "mmse",
        title: "MMSE"
      },
      {
        id: "moca",
        title: "MoCA"
      },
      {
        id: "cdr",
        title: "CDR"
      }
    ],
    relatedCourses: [
      {
        id: "201.3",
        title: "Нейрофизиология"
      }
    ],
    reference: "Hachinski VC, Iliff LD, Zilhka E et al. Cerebral blood flow in dementia. Arch Neurol 1975;32:632-637.",
    info: "### Для чего используется\n**Hachinski Ischemic Score (1975)** - клиническая шкала для дифференциации **сосудистой деменции от болезни Альцгеймера**. 13 пунктов, максимум 18 баллов.\n\n### Пункты (баллы)\n| Признак | Баллы |\n|---|---|\n| Острое начало | 2 |\n| Ступенчатое прогрессирование | 1 |\n| Флюктуирующее течение | 2 |\n| Ночная спутанность | 1 |\n| Сохранная личность | 1 |\n| Депрессия | 1 |\n| Соматические жалобы | 1 |\n| Эмоциональное недержание | 1 |\n| АГ в анамнезе | 1 |\n| Инсульт в анамнезе | 2 |\n| Сопутствующий атеросклероз | 1 |\n| Очаговые симптомы | 2 |\n| Очаговые признаки | 2 |\n\n### Интерпретация\n| Баллы | Тип деменции |\n|---|---|\n| ≤ 4 | Первичная дегенеративная (Alzheimer) |\n| 5-6 | Смешанная |\n| ≥ 7 | Мультиинфарктная (сосудистая) |\n\n### Характеристики\n- Чувствительность ~89 %, специфичность ~89 % для различения AD vs VaD\n- Модифицированная Rosen (1980) - 8 пунктов\n\n### Ограничения\n- Не выявляет CADASIL, подкорковые сосудистые формы\n- Не заменяет МРТ с последовательностями FLAIR/SWI\n- До эры биомаркёров (амилоид-PET, ЦСЖ) - ныне дополнение, а не основа\n\n### Тактика\n- ≤ 4: AChE, мемантин, биомаркёры при неясности\n- 5-6: комплексный подход, сосудистые факторы + AChE\n- ≥ 7: вторичная профилактика инсульта (АД, ЛПНП, ФП), реабилитация\n\n### Источник\nHachinski VC et al. **Cerebral blood flow in dementia.** *Arch Neurol* 1975;32:632-637."
  };

export default runner;
