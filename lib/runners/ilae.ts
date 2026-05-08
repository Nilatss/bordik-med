/**
 * Runner: ilae
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
    maxScore: 4,
    inputs: [
      {
        id: "seizure_type",
        label: "1. Тип приступа",
        type: "select",
        options: [
          {
            value: "focal",
            label: "Фокальный",
            points: 1
          },
          {
            value: "generalized",
            label: "Генерализованный",
            points: 1
          },
          {
            value: "unknown_onset",
            label: "Неизвестное начало",
            points: 1
          }
        ]
      },
      {
        id: "epilepsy_type",
        label: "2. Тип эпилепсии",
        type: "select",
        options: [
          {
            value: "focal_ep",
            label: "Фокальная",
            points: 1
          },
          {
            value: "generalized_ep",
            label: "Генерализованная",
            points: 1
          },
          {
            value: "combined",
            label: "Комбинированная (фокальная + генерализованная)",
            points: 1
          },
          {
            value: "unknown_ep",
            label: "Неизвестная",
            points: 1
          }
        ]
      },
      {
        id: "syndrome",
        label: "3. Эпилептический синдром (если установлен)",
        type: "select",
        options: [
          {
            value: "none",
            label: "Не установлен",
            points: 0
          },
          {
            value: "jme",
            label: "Ювенильная миоклоническая эпилепсия",
            points: 1
          },
          {
            value: "cae",
            label: "Детская абсансная эпилепсия",
            points: 1
          },
          {
            value: "west",
            label: "Синдром Веста",
            points: 1
          },
          {
            value: "lgs",
            label: "Синдром Леннокса-Гасто",
            points: 1
          },
          {
            value: "dravet",
            label: "Синдром Драве",
            points: 1
          },
          {
            value: "tle",
            label: "Височная эпилепсия (MTLE)",
            points: 1
          },
          {
            value: "other",
            label: "Другой",
            points: 1
          }
        ]
      },
      {
        id: "etiology",
        label: "4. Этиология",
        type: "select",
        options: [
          {
            value: "structural",
            label: "Структурная (опухоль, инсульт, МАВ, FCD)",
            points: 1
          },
          {
            value: "genetic",
            label: "Генетическая (SCN1A, KCNQ2 и др.)",
            points: 1
          },
          {
            value: "infectious",
            label: "Инфекционная (нейроцистицеркоз, ЦНС-инфекции)",
            points: 1
          },
          {
            value: "metabolic",
            label: "Метаболическая (митохондриальная, пиридоксин-зависимая)",
            points: 1
          },
          {
            value: "immune",
            label: "Иммунная (анти-NMDAR, LGI1, GAD)",
            points: 1
          },
          {
            value: "unknown",
            label: "Неизвестная",
            points: 1
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 4,
        label: "ILAE 2017 классификация",
        color: "#4B8DF5",
        description: "Иерархическая классификация: тип приступа → тип эпилепсии → синдром → этиология.",
        details: "Классификация ILAE 2017 (Fisher, Scheffer) - многоуровневая. Используется для постановки диагноза, выбора антиэпилептической терапии и поиска причины. Комплексный подход с EEG, MRI, генетикой.",
        actions: [
          "EEG (рутинное + по возможности длительный мониторинг/видео-ЭЭГ)",
          "МРТ головного мозга по эпилептическому протоколу (3T, FLAIR, высокое разрешение)",
          "При подозрении на иммунную/генетическую - аутоантитела / панель генов",
          "Выбор антиэпилептика по типу (вальпроат - генерализованная; ламотриджин, леветирацетам - широкий спектр; карбамазепин - фокальная)"
        ]
      }
    ],
    caveats: [
      "Требует EEG и часто МРТ для точной классификации",
      "Синдром может быть не установлен - используйте уровень \"тип эпилепсии\"",
      "Этиология может быть комбинированной (напр. структурная + генетическая)",
      "Классификация динамическая - уточняется с новыми данными"
    ],
    related: [
      {
        id: "stess",
        title: "STESS"
      },
      {
        id: "engel",
        title: "Engel"
      },
      {
        id: "gcs",
        title: "GCS"
      }
    ],
    relatedCourses: [
      {
        id: "201.3",
        title: "Нейрофизиология"
      }
    ],
    reference: "Fisher RS, Cross JH, French JA et al. Operational classification of seizure types by the ILAE. Epilepsia 2017;58:522-530. Scheffer IE et al. ILAE classification of the epilepsies. Epilepsia 2017;58:512-521.",
    info: "### Для чего используется\n**ILAE 2017 классификация** - современная **иерархическая классификация эпилепсии**, заменившая версию 1981/1989 гг. Построена на трёх уровнях диагностики.\n\n### Три уровня диагноза\n1. **Тип приступа** - фокальный / генерализованный / неизвестное начало\n2. **Тип эпилепсии** - фокальная / генерализованная / комбинированная / неизвестная\n3. **Синдром** - специфический клинико-электрографический паттерн (напр. JME, CAE, West, LGS, Dravet)\n\n### Дополнительно - этиология (6 категорий)\n| Этиология | Примеры |\n|---|---|\n| Структурная | Опухоль, инсульт, FCD, MAV, мезиальный темпоральный склероз |\n| Генетическая | SCN1A (Dravet), KCNQ2, CHRNA4 |\n| Инфекционная | Нейроцистицеркоз, ЦМВ, ВИЧ, TBE |\n| Метаболическая | Митохондриальные, пиридоксин-зависимые |\n| Иммунная | Анти-NMDAR, LGI1, GAD, CASPR2 |\n| Неизвестная | Если причина не установлена |\n\n### Фокальные приступы (новое в 2017)\n- С сохранением сознания (ранее \"простые парциальные\")\n- С нарушением сознания (ранее \"сложные парциальные\")\n- Моторные / немоторные\n- Фокальные с переходом в билатеральные тонико-клонические\n\n### Генерализованные\n- Моторные: тонико-клонические, миоклонические, клонические, тонические, атонические\n- Немоторные (абсансы): типичные, атипичные, миоклонические, с миоклонией век\n\n### Ограничения\n- Требует EEG и нейровизуализации\n- Синдром устанавливается не всегда\n- Классификация динамическая, уточняется при дообследовании\n\n### Тактика\n- EEG + МРТ обязательны\n- Выбор АЭП по типу: вальпроат/ламотриджин/леветирацетам (генерализованные); карбамазепин/окскарбазепин/ламотриджин (фокальные)\n- При фармакорезистентности (≥ 2 АЭП) - оценка на хирургию эпилепсии"
  };

export default runner;
