// @ts-nocheck
/**
 * Runner: snoop
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
        id: "s",
        label: "S - системные симптомы (лихорадка, потеря массы, онко, ВИЧ, иммуносупрессия)",
        type: "checkbox",
        points: 1
      },
      {
        id: "n",
        label: "N - неврологические признаки (спутанность, слабость, диплопия, папилледема)",
        type: "checkbox",
        points: 1
      },
      {
        id: "o1",
        label: "O - внезапное начало (thunderclap, пик < 1 мин)",
        type: "checkbox",
        points: 1
      },
      {
        id: "o2",
        label: "O - older age: новая ГБ у пациента > 50 лет",
        type: "checkbox",
        points: 1
      },
      {
        id: "p",
        label: "P - изменение паттерна или прогрессирующая ГБ",
        type: "checkbox",
        points: 1
      },
      {
        id: "pos",
        label: "+ позиционная (усиление лёжа или стоя)",
        type: "checkbox",
        points: 1
      },
      {
        id: "val",
        label: "+ провокация Valsalva / кашлем / физ. нагрузкой",
        type: "checkbox",
        points: 1
      },
      {
        id: "pap",
        label: "+ папилледема на офтальмоскопии",
        type: "checkbox",
        points: 1
      },
      {
        id: "preg",
        label: "+ беременность / послеродовой период",
        type: "checkbox",
        points: 1
      },
      {
        id: "eye",
        label: "+ болезненный глаз с автономными симптомами / посттравматическая ГБ",
        type: "checkbox",
        points: 1
      }
    ],
    bands: [
      {
        min: 0,
        max: 0,
        label: "0 - нет красных флагов",
        color: "#22C55E",
        description: "Вероятна первичная ГБ. Клиническая диагностика по ICHD-3."
      },
      {
        min: 1,
        max: 10,
        label: "≥ 1 - обязательна нейровизуализация",
        color: "#EF4444",
        description: "Любой положительный пункт - подозрение на вторичную ГБ.",
        details: "Красные флаги SNOOP10 (Dodick 2003, обновлено 2019) - индикация для срочного дообследования. Выбор метода зависит от типа флага.",
        actions: [
          "Thunderclap: немедленно КТ без контраста (САК), затем ЛП при отрицательной КТ",
          "Очаговая неврология/папилледема: МРТ + МР-венография (CVST, опухоль, IIH)",
          "Системные симптомы: СОЭ/СРБ (темпоральный артериит у ≥ 50 лет - доза преднизолона 40-60 мг сразу)",
          "Беременность/послеродовой: КТ/МРТ/МР-вено (эклампсия, PRES, CVST, RCVS)",
          "Позиционная: МРТ - SIH (ортостатическая), опухоль задней черепной ямки (лёжа)"
        ]
      }
    ],
    caveats: [
      "SNOOP10 - скрининговый, не заменяет клиническую оценку",
      "Отсутствие красных флагов не исключает вторичной ГБ (до 5 % секондари)",
      "POUND (Detsky 2006) - скрининг мигрени: ≥ 4 из 5 (Pulsating, 4-72 hrs, Unilateral, Nausea, Disabling) → LR+ 24",
      "Расширенный SNOOP10 добавил позиционную, Valsalva, papilledema, pregnancy, painful eye, post-traumatic"
    ],
    related: [
      {
        id: "ichd3",
        title: "ICHD-3"
      },
      {
        id: "midas",
        title: "MIDAS"
      },
      {
        id: "gcs",
        title: "GCS"
      }
    ],
    relatedCourses: [
      {
        id: "300.4",
        title: "Неотложная помощь"
      }
    ],
    reference: "Dodick DW. Clinical clues and clinical rules: primary vs secondary headache. Adv Stud Med 2003;3:S550-S555. Updated to SNNOOP10: Do NL et al. Neurology 2019;92:134-144.",
    info: "### Для чего используется\n**SNOOP10 (Dodick 2003, обновлено 2019)** - мнемоника **красных флагов вторичной головной боли**. Индикация для срочной нейровизуализации.\n\n### Мнемоника (SNNOOP10)\n| Буква | Значение |\n|---|---|\n| **S** | Systemic symptoms (лихорадка, потеря массы, онко, ВИЧ) |\n| **N** | Neoplasm history (анамнез опухоли) |\n| **N** | Neurologic deficit (спутанность, слабость, диплопия) |\n| **O** | Onset - sudden (thunderclap < 1 мин) |\n| **O** | Older age (новая ГБ > 50 лет) |\n| **P** | Pattern change (прогрессирование, изменение) |\n| **1** | Positional (позиционная) |\n| **2** | Precipitated by Valsalva |\n| **3** | Papilledema |\n| **4** | Pregnancy / postpartum |\n| **5** | Painful eye with autonomic features |\n| **6** | Post-traumatic |\n| **7** | Pathology of immune system (ВИЧ, иммуносупрессия) |\n| **8** | Painkiller overuse (MOH) |\n\n### Тактика по флагам\n| Флаг | Первый шаг |\n|---|---|\n| Thunderclap | КТ, затем ЛП (САК / RCVS) |\n| Очаговая / папилледема | МРТ + МР-вено |\n| Systemic + возраст | СОЭ/СРБ (темпоральный артериит) |\n| Беременность | МРТ (эклампсия, CVST, PRES, RCVS) |\n| Позиционная | МРТ с контрастом (SIH, опухоль) |\n| Valsalva | МРТ (Chiari, опухоль задней ямки) |\n\n### POUND (для мигрени, Detsky 2006)\n| P | Pulsating (пульсирующая) |\n| O | Hours 4-72 (duration) |\n| U | Unilateral (односторонняя) |\n| N | Nausea |\n| D | Disabling (инвалидизирующая) |\n**≥ 4/5 → LR+ 24** для мигрени.\n\n### Ограничения\n- Скрининг, не диагноз\n- Отрицательный SNOOP не исключает вторичной ГБ полностью\n- Требует детального анамнеза\n\n### Тактика\n- **0 флагов:** диагностика по ICHD-3, первичная ГБ\n- **≥ 1 флаг:** срочная нейровизуализация, дифф. диагностика\n- Thunderclap - всегда КТ ≤ 6 ч от начала"
  };

export default runner;
