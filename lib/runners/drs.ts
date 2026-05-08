/**
 * Runner: drs
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
    maxScore: 29,
    inputs: [
      {
        id: "eye",
        label: "1. Открывание глаз",
        type: "select",
        options: [
          {
            value: "0",
            label: "Спонтанное",
            points: 0
          },
          {
            value: "1",
            label: "На речь",
            points: 1
          },
          {
            value: "2",
            label: "На боль",
            points: 2
          },
          {
            value: "3",
            label: "Нет",
            points: 3
          }
        ]
      },
      {
        id: "verbal",
        label: "2. Речевой ответ",
        type: "select",
        options: [
          {
            value: "0",
            label: "Ориентирован",
            points: 0
          },
          {
            value: "1",
            label: "Спутан",
            points: 1
          },
          {
            value: "2",
            label: "Неадекватный",
            points: 2
          },
          {
            value: "3",
            label: "Непонятный",
            points: 3
          },
          {
            value: "4",
            label: "Нет",
            points: 4
          }
        ]
      },
      {
        id: "motor",
        label: "3. Моторный ответ",
        type: "select",
        options: [
          {
            value: "0",
            label: "Выполняет команды",
            points: 0
          },
          {
            value: "1",
            label: "Локализует боль",
            points: 1
          },
          {
            value: "2",
            label: "Отдёргивает",
            points: 2
          },
          {
            value: "3",
            label: "Сгибательный (декортикация)",
            points: 3
          },
          {
            value: "4",
            label: "Разгибательный (децеребрация)",
            points: 4
          },
          {
            value: "5",
            label: "Нет",
            points: 5
          }
        ]
      },
      {
        id: "feeding",
        label: "4. Когнитивная способность: еда",
        type: "select",
        options: [
          {
            value: "0",
            label: "Полная",
            points: 0
          },
          {
            value: "1",
            label: "Частичная",
            points: 1
          },
          {
            value: "2",
            label: "Минимальная",
            points: 2
          },
          {
            value: "3",
            label: "Отсутствует",
            points: 3
          }
        ]
      },
      {
        id: "toileting",
        label: "5. Когнитивная способность: туалет",
        type: "select",
        options: [
          {
            value: "0",
            label: "Полная",
            points: 0
          },
          {
            value: "1",
            label: "Частичная",
            points: 1
          },
          {
            value: "2",
            label: "Минимальная",
            points: 2
          },
          {
            value: "3",
            label: "Отсутствует",
            points: 3
          }
        ]
      },
      {
        id: "grooming",
        label: "6. Когнитивная способность: гигиена",
        type: "select",
        options: [
          {
            value: "0",
            label: "Полная",
            points: 0
          },
          {
            value: "1",
            label: "Частичная",
            points: 1
          },
          {
            value: "2",
            label: "Минимальная",
            points: 2
          },
          {
            value: "3",
            label: "Отсутствует",
            points: 3
          }
        ]
      },
      {
        id: "functioning",
        label: "7. Уровень функционирования",
        type: "select",
        options: [
          {
            value: "0",
            label: "Полностью независим",
            points: 0
          },
          {
            value: "1",
            label: "Независим в спец. среде",
            points: 1
          },
          {
            value: "2",
            label: "Умеренно зависим",
            points: 2
          },
          {
            value: "3",
            label: "Заметно зависим",
            points: 3
          },
          {
            value: "4",
            label: "Полностью зависим",
            points: 4
          },
          {
            value: "5",
            label: "Постоянный уход",
            points: 5
          }
        ]
      },
      {
        id: "employability",
        label: "8. Способность к работе",
        type: "select",
        options: [
          {
            value: "0",
            label: "Без ограничений",
            points: 0
          },
          {
            value: "1",
            label: "Частичная",
            points: 1
          },
          {
            value: "2",
            label: "Только в защищённой среде",
            points: 2
          },
          {
            value: "3",
            label: "Нетрудоспособен",
            points: 3
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 0,
        label: "0 - без нарушений",
        color: "#22C55E",
        description: "Нет инвалидности."
      },
      {
        min: 1,
        max: 1,
        label: "1 - лёгкая",
        color: "#84CC16",
        description: "Лёгкая инвалидность."
      },
      {
        min: 2,
        max: 3,
        label: "2-3 - частичная",
        color: "#EAB308",
        description: "Частичная инвалидность."
      },
      {
        min: 4,
        max: 6,
        label: "4-6 - умеренная",
        color: "#F59E0B",
        description: "Умеренная инвалидность."
      },
      {
        min: 7,
        max: 11,
        label: "7-11 - умеренно-тяжёлая",
        color: "#F97316",
        description: "Умеренно-тяжёлая."
      },
      {
        min: 12,
        max: 16,
        label: "12-16 - тяжёлая",
        color: "#EF4444",
        description: "Тяжёлая инвалидность."
      },
      {
        min: 17,
        max: 21,
        label: "17-21 - крайне тяжёлая",
        color: "#DC2626",
        description: "Крайне тяжёлая."
      },
      {
        min: 22,
        max: 24,
        label: "22-24 - вегетативное состояние",
        color: "#991B1B",
        description: "Вегетативное состояние.",
        details: "Отсутствие осознанного контакта при сохранении цикла сон-бодрствование. Длительный уход, оценка MCS через CRS-R.",
        actions: [
          "CRS-R (Coma Recovery Scale-Revised) для дифф. с MCS",
          "Нейровизуализация (МРТ DWI/DTI, fMRI)",
          "Мультидисциплинарная реабилитация, предотвращение осложнений (пролежни, контрактуры, аспирация)",
          "Семейная поддержка, этические консультации"
        ]
      },
      {
        min: 25,
        max: 29,
        label: "25-29 - крайнее вег. состояние",
        color: "#7F1D1D",
        description: "Крайнее вегетативное состояние.",
        details: "Минимальные возможности реакции. Исход обычно плохой.",
        actions: [
          "Паллиативный подход, комфортный уход",
          "Обсуждение целей лечения с семьёй",
          "Профилактика осложнений"
        ]
      }
    ],
    caveats: [
      "DRS менее чувствителен к высокофункциональным исходам - потолок на уровне \"без нарушений\"",
      "Рекомендуется сочетание с FIM, GOSE, CRS-R для полной картины",
      "Градация \"вегетативное\" требует осмотра в динамике (не ставить на основании одного осмотра)",
      "Не заменяет формальное нейропсихологическое обследование"
    ],
    related: [
      {
        id: "gcs",
        title: "GCS"
      },
      {
        id: "rancho",
        title: "Rancho Los Amigos"
      },
      {
        id: "mrs",
        title: "mRS"
      }
    ],
    relatedCourses: [
      {
        id: "300.4",
        title: "Неотложная помощь"
      }
    ],
    reference: "Rappaport M et al. Disability rating scale for severe head trauma: coma to community. Arch Phys Med Rehabil 1982;63:118-123.",
    info: "### Для чего используется\n**DRS (Disability Rating Scale, Rappaport 1982)** - оценка исходов **тяжёлой черепно-мозговой травмы** от комы до возвращения в общество. Охватывает весь континуум восстановления.\n\n### Структура (8 пунктов, 0-29 баллов, + 30 = смерть)\n| Категория | Баллы | Домены |\n|---|---|---|\n| Arousability | 0-12 | Открывание глаз, речь, моторный ответ (как GCS, но обратная шкала) |\n| Cognitive ability | 0-9 | Еда, туалет, гигиена (по 0-3) |\n| Dependence | 0-5 | Уровень функционирования |\n| Psychosocial | 0-3 | Трудоспособность |\n\n### Интерпретация\n| DRS | Степень инвалидности |\n|---|---|\n| 0 | Нет |\n| 1 | Лёгкая |\n| 2-3 | Частичная |\n| 4-6 | Умеренная |\n| 7-11 | Умеренно-тяжёлая |\n| 12-16 | Тяжёлая |\n| 17-21 | Крайне тяжёлая |\n| 22-24 | Вегетативное состояние |\n| 25-29 | Крайнее вегетативное |\n| 30 | Смерть |\n\n### Применение\n- Исход ЧМТ на 1, 3, 6, 12 мес\n- Реабилитационный мониторинг\n- Клинические исследования (часто в связке с GOSE)\n\n### Ограничения\n- Потолочный эффект на высоких уровнях восстановления\n- Не оценивает тонкие когнитивные/поведенческие нарушения\n- Субъективность шкалы \"employability\"\n\n### Тактика\n- При низких баллах (< 7) - сфокусированная нейрореабилитация\n- При вегетативном/MCS - CRS-R в динамике\n- Комбинация с FIM/GOSE/CRS-R"
  };

export default runner;
