/**
 * Runner: stess
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
    maxScore: 6,
    inputs: [
      {
        id: "age",
        label: "Возраст ≥ 65 лет",
        type: "checkbox",
        points: 2
      },
      {
        id: "history",
        label: "Анамнез приступов: нет или неизвестно (1) vs есть (0)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Есть история приступов",
            points: 0
          },
          {
            value: "1",
            label: "Нет истории или неизвестно",
            points: 1
          }
        ]
      },
      {
        id: "seizure_type",
        label: "Тип эпистатуса",
        type: "select",
        options: [
          {
            value: "0",
            label: "Простой фокальный / миоклонический / абсансный",
            points: 0
          },
          {
            value: "1",
            label: "Сложный фокальный",
            points: 1
          },
          {
            value: "2",
            label: "Генерализованный судорожный (GCSE) / NCSE в коме",
            points: 2
          }
        ]
      },
      {
        id: "loc",
        label: "Уровень сознания на момент поступления",
        type: "select",
        options: [
          {
            value: "0",
            label: "Бодрствует / сонливость / спутанность",
            points: 0
          },
          {
            value: "1",
            label: "Сопор / кома",
            points: 1
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 2,
        label: "0-2 - низкий риск",
        color: "#22C55E",
        description: "Вероятность выживания высокая. Стандартная терапия эпистатуса.",
        details: "STESS < 3 ассоциирован с выживанием > 90 % в когортах Rossetti 2008/2015.",
        actions: [
          "Бензодиазепин (лоразепам 0,1 мг/кг IV или мидазолам IM)",
          "Второй этап: левЕтирацетам, фосфенитоин, вальпроат",
          "EEG-мониторинг при сохранении нарушения сознания"
        ]
      },
      {
        min: 3,
        max: 6,
        label: "≥ 3 - высокий риск смерти",
        color: "#EF4444",
        description: "Повышенная госпитальная смертность. Агрессивная эскалация.",
        details: "STESS ≥ 3 ассоциирован со смертностью 30-60 %. Плохой прогноз, но не основание отказа от лечения - может потребоваться эскалация до анестезии.",
        actions: [
          "Эскалация: мидазолам / пропофол / тиопентал инфузия - анестезия 24 ч",
          "Постоянный EEG-мониторинг (cEEG)",
          "Интенсивная терапия, протекция дыхательных путей",
          "Поиск и устранение причины (инсульт, менингит, метаболические)"
        ]
      }
    ],
    caveats: [
      "STESS - прогностическая шкала, не определяет лечение",
      "Высокий STESS не основание отказа от терапии",
      "Альтернативы: EMSE (Leitinger 2015) - учитывает этиологию; END-IT (Gao 2016) - азиатская валидация",
      "Не валидизирована у детей"
    ],
    related: [
      {
        id: "ilae",
        title: "ILAE 2017"
      },
      {
        id: "gcs",
        title: "GCS"
      },
      {
        id: "four",
        title: "FOUR"
      }
    ],
    relatedCourses: [
      {
        id: "300.4",
        title: "Неотложная помощь"
      }
    ],
    reference: "Rossetti AO, Logroscino G, Bromfield EB. A clinical score for prognosis of status epilepticus in adults. Neurology 2006;66:1736-1738. Rossetti 2008 (валидация).",
    info: "### Для чего используется\n**STESS (Status Epilepticus Severity Score, Rossetti 2006/2008)** - прогностическая шкала **госпитальной смертности при эпилептическом статусе** у взрослых.\n\n### 4 параметра (0-6 баллов)\n| Параметр | Баллы |\n|---|---|\n| Возраст ≥ 65 лет | 2 |\n| Нет/неизвестна история приступов | 1 |\n| Генерализованный тонико-клонический или NCSE в коме | 2 |\n| Сложный фокальный | 1 |\n| Простой фокальный / миоклонический / абсансный | 0 |\n| Сопор / кома на поступлении | 1 |\n\n### Интерпретация\n| STESS | Смертность | Исход |\n|---|---|---|\n| 0-2 | < 10 % | Благоприятный |\n| ≥ 3 | 30-60 % | Неблагоприятный |\n\n### Альтернативы\n| Шкала | Особенность |\n|---|---|\n| **EMSE** (Leitinger 2015) | Включает этиологию и EEG-паттерны |\n| **END-IT** (Gao 2016) | Валидизирована на азиатских популяциях |\n| **MICS** | Пересечение с критической ситуацией |\n\n### Ограничения\n- Прогностическая, не определяет интенсивность лечения\n- Не валидизирована у детей\n- Этиология не входит в STESS (EMSE это компенсирует)\n\n### Тактика\n- **STESS < 3:** стандартная эскалация - бензодиазепин → левЕтирацетам/фосфенитоин/вальпроат\n- **STESS ≥ 3:** ранняя анестезия (мидазолам / пропофол / тиопентал), cEEG, ICU\n- Всегда параллельно - поиск причины и лечение"
  };

export default runner;
