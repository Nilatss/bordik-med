// @ts-nocheck
/**
 * Runner: epds
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
    inputs: [
      {
        id: "q1",
        label: "Вопрос 1",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 баллов",
            points: 0
          },
          {
            value: 1,
            label: "1 балл",
            points: 1
          },
          {
            value: 2,
            label: "2 балла",
            points: 2
          },
          {
            value: 3,
            label: "3 балла",
            points: 3
          }
        ]
      },
      {
        id: "q2",
        label: "Вопрос 2",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 баллов",
            points: 0
          },
          {
            value: 1,
            label: "1 балл",
            points: 1
          },
          {
            value: 2,
            label: "2 балла",
            points: 2
          },
          {
            value: 3,
            label: "3 балла",
            points: 3
          }
        ]
      },
      {
        id: "q3",
        label: "Вопрос 3",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 баллов",
            points: 0
          },
          {
            value: 1,
            label: "1 балл",
            points: 1
          },
          {
            value: 2,
            label: "2 балла",
            points: 2
          },
          {
            value: 3,
            label: "3 балла",
            points: 3
          }
        ]
      },
      {
        id: "q4",
        label: "Вопрос 4",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 баллов",
            points: 0
          },
          {
            value: 1,
            label: "1 балл",
            points: 1
          },
          {
            value: 2,
            label: "2 балла",
            points: 2
          },
          {
            value: 3,
            label: "3 балла",
            points: 3
          }
        ]
      },
      {
        id: "q5",
        label: "Вопрос 5",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 баллов",
            points: 0
          },
          {
            value: 1,
            label: "1 балл",
            points: 1
          },
          {
            value: 2,
            label: "2 балла",
            points: 2
          },
          {
            value: 3,
            label: "3 балла",
            points: 3
          }
        ]
      },
      {
        id: "q6",
        label: "Вопрос 6",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 баллов",
            points: 0
          },
          {
            value: 1,
            label: "1 балл",
            points: 1
          },
          {
            value: 2,
            label: "2 балла",
            points: 2
          },
          {
            value: 3,
            label: "3 балла",
            points: 3
          }
        ]
      },
      {
        id: "q7",
        label: "Вопрос 7",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 баллов",
            points: 0
          },
          {
            value: 1,
            label: "1 балл",
            points: 1
          },
          {
            value: 2,
            label: "2 балла",
            points: 2
          },
          {
            value: 3,
            label: "3 балла",
            points: 3
          }
        ]
      },
      {
        id: "q8",
        label: "Вопрос 8",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 баллов",
            points: 0
          },
          {
            value: 1,
            label: "1 балл",
            points: 1
          },
          {
            value: 2,
            label: "2 балла",
            points: 2
          },
          {
            value: 3,
            label: "3 балла",
            points: 3
          }
        ]
      },
      {
        id: "q9",
        label: "Вопрос 9",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 баллов",
            points: 0
          },
          {
            value: 1,
            label: "1 балл",
            points: 1
          },
          {
            value: 2,
            label: "2 балла",
            points: 2
          },
          {
            value: 3,
            label: "3 балла",
            points: 3
          }
        ]
      },
      {
        id: "q10",
        label: "Вопрос 10",
        type: "select",
        options: [
          {
            value: 0,
            label: "0 баллов",
            points: 0
          },
          {
            value: 1,
            label: "1 балл",
            points: 1
          },
          {
            value: 2,
            label: "2 балла",
            points: 2
          },
          {
            value: 3,
            label: "3 балла",
            points: 3
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 9,
        label: "0-9 (норма)",
        color: "#10B981",
        description: "Депрессия маловероятна."
      },
      {
        min: 10,
        max: 12,
        label: "10-12 (возможная)",
        color: "#F59E0B",
        description: "Возможная депрессия - доп. оценка через 2 нед."
      },
      {
        min: 13,
        max: 30,
        label: "≥ 13 (вероятная)",
        color: "#EF4444",
        description: "Вероятная послеродовая депрессия. Психиатр.",
        details: "Высокая вероятность послеродовой депрессии. Требуется клиническая оценка по DSM-5. Обязательно отдельно оценить вопрос 10 (суицидальные мысли).",
        actions: [
          "Клиническое intervew, оценка суицидального риска",
          "КПТ / IPT при лёгкой-умеренной; СИОЗС (сертралин, пароксетин - совместимы с ГВ) при умеренной-тяжёлой",
          "Исключить гипотиреоз, анемию, дефицит витамина D",
          "При тяжёлой острой - брексанолон в/в или зураносолон per os"
        ]
      }
    ],
    maxScore: 30,
    caveats: [
      "Скрининг, не диагноз (DSM-5)",
      "Вопрос 10 (самоповреждение): любой положительный ответ требует немедленной оценки",
      "Не оценивает манию - послеродовая депрессия может быть дебютом биполярного расстройства",
      "Культурно-языковые адаптации могут влиять на чувствительность"
    ],
    relatedCourses: [
      {
        id: "201.3",
        title: "Нейрофизиология"
      },
      {
        id: "302.2",
        title: "Педиатрия раннего возраста"
      }
    ],
    related: [
      {
        id: "phq9",
        title: "PHQ-9"
      },
      {
        id: "gad7",
        title: "GAD-7"
      },
      {
        id: "apgar",
        title: "Apgar"
      }
    ],
    reference: "Cox JL. Br J Psychiatry 1987. Edinburgh Postnatal Depression Scale.",
    info: "### Что измеряет\n**Edinburgh Postnatal Depression Scale (EPDS)** - самозаполняемый скрининг **послеродовой депрессии**. 10 вопросов о настроении за последние 7 дней. Также валидизирован для антенатальной депрессии.\n\n### Интерпретация\n| Сумма | Интерпретация |\n|---|---|\n| 0-9 | Маловероятна |\n| 10-12 | Возможная депрессия - повторить через 2 нед |\n| ≥ 13 | Вероятная - направление к психиатру |\n\n**Вопрос 10** (мысли о причинении вреда себе) - независимо от суммы, **любой положительный ответ** требует немедленной оценки суицидального риска.\n\n### Когда применять\n| Период | Контекст |\n|---|---|\n| 6-8 нед после родов | Основной скрининг (ACOG, USPSTF, NICE) |\n| II триместр | Антенатальная депрессия |\n| До 1 года после родов | Повторный скрининг при симптомах |\n\n### Распространённость\n| Состояние | Частота |\n|---|---|\n| Послеродовая депрессия | 10-15 % родивших |\n| Послеродовая хандра (baby blues) | 50-80 %, проходит за 2 нед |\n| Послеродовый психоз | 0,1-0,2 %, экстренная госпитализация |\n\n### Дифф. диагноз (соматические причины)\n| Причина | Что исключить / анализ |\n|---|---|\n| Гипотиреоз | ТТГ всем после родов |\n| Анемия | ОАК, ферритин |\n| Дефицит витамина D | 25-OH витамин D |\n| Лекарственный | Оральные контрацептивы, β-блокаторы |\n\n### Лечение\n| Тяжесть | Первая линия | Дополнительно |\n|---|---|---|\n| Лёгкая / умеренная | КПТ, межличностная терапия (IPT), физическая активность | При неэффективности - СИОЗС |\n| Умеренная / тяжёлая | СИОЗС + психотерапия | Совместимы с ГВ: сертралин, пароксетин. Избегать: флуоксетин (длинный T½), доксепин |\n| Тяжёлая / острая | Брексанолон в/в (FDA 2019) | Мониторинг в стационаре |\n| Амбулаторная | Зураносолон per os (FDA 2023) | Альтернатива брексанолону |\n\n### Связанные шкалы\n| Шкала | Применение |\n|---|---|\n| PHQ-9 | Общая депрессия у взрослых |\n| HAM-D | Клиническая (для исследований) |\n| PSS-NICU | Стресс у родителей детей в РИТ |\n\n### Ограничения\n- Скрининг, не диагноз - для диагноза нужен клинический intervew (DSM-5)\n- Чувствителен к культурным факторам перевода\n- Не оценивает мании / биполярного расстройства (ППД может быть дебютом BD I)"
  };

export default runner;
