// @ts-nocheck
/**
 * Runner: crib
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
    maxScore: 27,
    inputs: [
      {
        id: "ga",
        label: "Гестационный возраст",
        type: "select",
        options: [
          {
            value: "0",
            label: "≥ 28 нед",
            points: 0
          },
          {
            value: "1",
            label: "27 нед",
            points: 1
          },
          {
            value: "2",
            label: "26 нед",
            points: 2
          },
          {
            value: "3",
            label: "25 нед",
            points: 3
          },
          {
            value: "4",
            label: "24 нед",
            points: 4
          },
          {
            value: "5",
            label: "≤ 23 нед",
            points: 5
          }
        ]
      },
      {
        id: "bw",
        label: "Масса при рождении",
        type: "select",
        options: [
          {
            value: "0",
            label: "≥ 1350 г",
            points: 0
          },
          {
            value: "1",
            label: "1150-1349 г",
            points: 1
          },
          {
            value: "3",
            label: "850-1149 г",
            points: 3
          },
          {
            value: "4",
            label: "650-849 г",
            points: 4
          },
          {
            value: "7",
            label: "< 650 г",
            points: 7
          }
        ]
      },
      {
        id: "sex",
        label: "Пол",
        type: "select",
        options: [
          {
            value: "0",
            label: "Женский",
            points: 0
          },
          {
            value: "1",
            label: "Мужской",
            points: 1
          }
        ]
      },
      {
        id: "temp",
        label: "Температура при поступлении",
        type: "select",
        options: [
          {
            value: "0",
            label: "> 36,0 °C",
            points: 0
          },
          {
            value: "1",
            label: "35,0-36,0 °C",
            points: 1
          },
          {
            value: "2",
            label: "< 35,0 °C",
            points: 2
          }
        ]
      },
      {
        id: "be",
        label: "Избыток оснований (BE, худший за 12 ч)",
        type: "select",
        options: [
          {
            value: "0",
            label: "≥ −7,0 ммоль/л",
            points: 0
          },
          {
            value: "1",
            label: "−7,1 … −9,9 ммоль/л",
            points: 1
          },
          {
            value: "2",
            label: "−10,0 … −14,9 ммоль/л",
            points: 2
          },
          {
            value: "3",
            label: "≤ −15,0 ммоль/л",
            points: 3
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 5,
        label: "0-5 (низкий риск)",
        color: "#22C55E",
        description: "Прогнозируемая госпитальная летальность < 5 %.",
        details: "Низкий риск смерти при текущей стабилизации. Продолжить стандартный протокол ведения ОРИТН.",
        actions: [
          "Стандартный мониторинг в ОРИТН",
          "Профилактика нозокомиальных инфекций",
          "Грудное молоко/донорское молоко как можно раньше"
        ]
      },
      {
        min: 6,
        max: 10,
        label: "6-10 (умеренный)",
        color: "#F59E0B",
        description: "Прогнозируемая летальность ~5-15 %.",
        details: "Умеренный риск. Часто сопутствуют РДС, ВЖК, открытый артериальный проток.",
        actions: [
          "Сурфактант при РДС",
          "Эхокардиография - ОАП",
          "УЗИ головного мозга 3-й и 7-й день",
          "Мониторинг электролитов, глюкозы каждые 6-12 ч"
        ]
      },
      {
        min: 11,
        max: 15,
        label: "11-15 (высокий)",
        color: "#EF4444",
        description: "Прогнозируемая летальность ~15-50 %.",
        details: "Высокий риск. Обсудить с семьёй цели лечения, полный спектр терапии - инотропы, ИВЛ HFOV, iNO при показаниях.",
        actions: [
          "Мультидисциплинарный консилиум",
          "Консультация с семьёй о прогнозе",
          "Максимальная поддержка, нутритивный протокол"
        ]
      },
      {
        min: 16,
        max: 27,
        label: "≥ 16 (очень высокий)",
        color: "#991B1B",
        description: "Прогнозируемая летальность > 50 %.",
        details: "Критическое состояние. Учитывать желания семьи, возможность паллиативного ведения.",
        actions: [
          "Консилиум с семьёй - палliative care option",
          "Полная ИВЛ, инотропы, при показаниях iNO / ECMO",
          "Документирование целей терапии (код-статус)"
        ]
      }
    ],
    caveats: [
      "Разработан для недоношенных < 32 нед или < 1500 г - не применять у доношенных",
      "Оценивается в первый час жизни - не пересчитывается после",
      "Не заменяет индивидуального клинического суждения и динамической оценки",
      "Альтернативы: SNAP-II, SNAPPE-II (Richardson 2001) - учитывают больше физиологических параметров"
    ],
    relatedCourses: [
      {
        id: "302.2",
        title: "Педиатрия 0-2"
      },
      {
        id: "300.4",
        title: "Неотложная"
      }
    ],
    related: [
      {
        id: "apgar",
        title: "Apgar"
      },
      {
        id: "ballard",
        title: "Ballard (зрелость)"
      },
      {
        id: "silverman",
        title: "Silverman-Anderson"
      }
    ],
    reference: "Parry G, Tucker J, Tarnow-Mordi W. CRIB II: an update. Lancet 2003;361:1789-91.",
    countries: "Международный (NICU)",
    info: "### Для чего используется\n**CRIB-II (Clinical Risk Index for Babies, version II, Parry 2003)** - шкала прогноза госпитальной летальности у недоношенных новорождённых в первый час после поступления в ОРИТН. Используется для:\n\n- Оценки тяжести состояния и прогноза\n- Стратификации при сравнении исходов между ОРИТН\n- Аудита качества неонатальной помощи\n\n### Критерии (5 параметров, 0-27 баллов)\n| Параметр | Диапазон |\n|---|---|\n| Гестационный возраст | ≤ 23 → 5, 24 → 4, 25 → 3, 26 → 2, 27 → 1, ≥ 28 → 0 |\n| Масса при рождении | < 650 → 7, 650-849 → 4, 850-1149 → 3, 1150-1349 → 1, ≥ 1350 → 0 |\n| Пол | ♂ → 1, ♀ → 0 |\n| Температура при поступлении | < 35 → 2, 35-36 → 1, > 36 → 0 |\n| BE (худший за 12 ч) | ≤ −15 → 3, −10…−14,9 → 2, −7,1…−9,9 → 1, ≥ −7 → 0 |\n\n### Интерпретация\n| Баллы | Прогноз госпитальной смертности |\n|---|---|\n| 0-5 | < 5 % |\n| 6-10 | 5-15 % |\n| 11-15 | 15-50 % |\n| ≥ 16 | > 50 % |\n\n### Альтернативы\n| Шкала | Особенность |\n|---|---|\n| **CRIB-I** (1993) | 6 параметров + оксигенация; заменена CRIB-II |\n| **SNAP-II** (Richardson 2001) | 6 физиологических параметров, 0-162 балла |\n| **SNAPPE-II** | SNAP-II + перинатальные (масса, Apgar, SGA), 0-162 |\n| **NTISS** | Терапевтическая интенсивность |\n\n### Ограничения\n- Применима только у недоношенных < 32 нед / < 1500 г\n- Не учитывает пороки развития и хирургические состояния\n- Точность прогноза в отдельном случае ограничена (групповой показатель)\n\n### Источник\nParry G, Tucker J, Tarnow-Mordi W. CRIB II: an update of the clinical risk index for babies score. *Lancet* 2003;361:1789-91.\nRichardson DK et al. SNAP-II and SNAPPE-II. *J Pediatr* 2001;138:92-100."
  };

export default runner;
