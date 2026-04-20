// @ts-nocheck
/**
 * Runner: sgarbossa
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
    maxScore: 10,
    inputs: [
      {
        id: "conc_ste",
        label: "Конкордантная элевация ST ≥ 1 мм",
        type: "checkbox",
        points: 5
      },
      {
        id: "conc_std",
        label: "Конкордантная депрессия ST ≥ 1 мм в V1-V3",
        type: "checkbox",
        points: 3
      },
      {
        id: "disc_ste",
        label: "Дискордантная элевация ST ≥ 5 мм",
        type: "checkbox",
        points: 2
      },
      {
        id: "smith",
        label: "Smith-модификация: ST/S ≤ −0,25 (любое отведение)",
        type: "checkbox",
        points: 5
      }
    ],
    bands: [
      {
        min: 0,
        max: 2,
        label: "0-2 (негативно)",
        color: "#22C55E",
        description: "Нет убедительных критериев STEMI при БЛНПГ / ЭКС. Продолжить поиск ишемии.",
        actions: [
          "Серийные ЭКГ каждые 15-30 мин",
          "hs-cTn 0/1h или 0/2h",
          "ЭхоКГ - нарушения локальной сократимости",
          "Low threshold для КАГ при продолжающейся боли"
        ]
      },
      {
        min: 3,
        max: 4,
        label: "3 (пограничный)",
        color: "#F59E0B",
        description: "Одиночный критерий дискордантной элевации. Smith-модификация повышает чувствительность.",
        actions: [
          "Применить Smith-modified Sgarbossa",
          "Повтор ЭКГ, тропонин",
          "Обсудить экстренную КАГ при клиническом подозрении"
        ]
      },
      {
        min: 5,
        max: 10,
        label: "≥ 5 (Sgarbossa +)",
        color: "#EF4444",
        description: "STEMI-эквивалент. Специфичность ~ 98 %. Показана реперфузия.",
        details: "Чувствительность исходных критериев ~ 20 %, specificity ~ 98 %. Smith-модификация повышает чувствительность до ~ 80 %. При клиническом подозрении ОКС и Sgarbossa + → первичная PCI ≤ 90 мин.",
        actions: [
          "Cath-lab активация - первичная PCI ≤ 90 мин",
          "ASA 300 мг + тикагрелор 180 мг + гепарин",
          "При недоступности PCI ≤ 120 мин - тромболизис (при отсутствии противопоказаний)",
          "Обсудить с интервенционным кардиологом"
        ]
      }
    ],
    reference: "Sgarbossa EB. NEJM 1996;334:481. Smith SW. Ann Emerg Med 2012;60:766 (ST/S ratio).",
    countries: "Международный",
    caveats: [
      "Оригинальные критерии: чувствительность ~ 20 %, специфичность ~ 98 %",
      "Smith-модификация (ST/S ≤ −0,25) повышает чувствительность до ~ 80 %",
      "Применим при БЛНПГ (LBBB) и желудочковом ритме / PPM-ритме",
      "Не применять при Right-BBB (для RBBB нет такой шкалы - ищите прямые признаки ИМ)"
    ],
    related: [
      {
        id: "heart",
        title: "HEART"
      },
      {
        id: "timi",
        title: "TIMI"
      },
      {
        id: "esc-nste",
        title: "ESC hs-cTn"
      }
    ],
    relatedCourses: [
      {
        id: "301.1",
        title: "Кардиология"
      },
      {
        id: "300.4",
        title: "Неотложная помощь"
      }
    ],
    info: "### Для чего используется\n**Критерии Sgarbossa / Smith-modified Sgarbossa** - диагностика **острого инфаркта миокарда при блокаде левой ножки пучка Гиса (БЛНПГ)** или желудочковом ритмоводителе (PPM), где стандартные STEMI-критерии неприменимы из-за вторичных изменений ST-T.\n\n### Критерии Sgarbossa (1996)\n| Критерий | Баллы |\n|---|---|\n| Конкордантная элевация ST ≥ 1 мм (в отведениях с + QRS) | 5 |\n| Конкордантная депрессия ST ≥ 1 мм в V1-V3 | 3 |\n| Дискордантная элевация ST ≥ 5 мм (в отведениях с − QRS) | 2 |\n\n**≥ 3 баллов** - специфично (≈ 98 %) для ОИМ.\n\n### Smith-модификация (2012)\nДискордантная элевация оценивается как **ST/S ratio ≤ −0,25** (вместо абсолютного ≥ 5 мм) - любой единственный + критерий → STEMI-эквивалент. Чувствительность растёт с ~ 20 % до ~ 80 % без потери специфичности.\n\n### Критерии\n- Конкордантная ST-элевация ≥ 1 мм (концепция дискордантности ST по отношению к основному QRS)\n- Конкордантная ST-депрессия ≥ 1 мм в V1-V3\n- Дискордантная ST-элевация ≥ 5 мм **или** ST/S ≤ −0,25 (Smith)\n\n### Интерпретация\n| Сумма | Значение |\n|---|---|\n| 0-2 | Sgarbossa negative; STEMI маловероятен |\n| ≥ 3 | Sgarbossa positive - STEMI-эквивалент |\n| Smith + любое | STEMI-эквивалент (чувствительнее) |\n\n### Ограничения\n- Не применяется при правой блокаде (RBBB) - там прямые STEMI-критерии работают\n- При хронической БЛНПГ + старый ИМ возможны ложноположительные конкордантные изменения\n- Требует сравнения с \"старой\" ЭКГ, если доступна\n\n### Тактика\n- **Sgarbossa +** → активация cath-lab, первичная PCI ≤ 90 мин\n- **Smith +** при клиническом подозрении → также реперфузия\n- Негативный результат - не исключает ИМ; серийные ЭКГ и hs-cTn\n\n### Источник\nSgarbossa EB, Pinski SL, Barbagelata A et al. Electrocardiographic diagnosis of evolving acute myocardial infarction in the presence of left bundle-branch block. *N Engl J Med* 1996;334:481-487.\nSmith SW, Dodd KW, Henry TD et al. Diagnosis of ST-elevation myocardial infarction in the presence of left bundle branch block with the ST-elevation to S-wave ratio in a modified Sgarbossa rule. *Ann Emerg Med* 2012;60:766-776."
  };

export default runner;
