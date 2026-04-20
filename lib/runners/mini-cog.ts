// @ts-nocheck
/**
 * Runner: mini-cog
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
        id: "recall",
        label: "Отсроченное воспроизведение 3 слов (яблоко · стол · монета)",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 слов",
            points: 0
          },
          {
            value: "1",
            label: "1 слово",
            points: 1
          },
          {
            value: "2",
            label: "2 слова",
            points: 2
          },
          {
            value: "3",
            label: "3 слова",
            points: 3
          }
        ]
      },
      {
        id: "clock",
        label: "Тест рисования часов (CDT)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Ненормальный (ошибки в числах, стрелках, пропорциях)",
            points: 0
          },
          {
            value: "2",
            label: "Нормальный (все числа + стрелки на 11:10)",
            points: 2
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 3,
        label: "0-3 - подозрение на деменцию",
        color: "#EF4444",
        description: "Положительный скрининг (чувствительность ~76 %, специфичность ~89 %).",
        details: "Необходима дальнейшая оценка - MMSE/MoCA, нейропсихологическое тестирование, поиск обратимых причин.",
        actions: [
          "Расширенная оценка: MMSE или MoCA",
          "Лабораторные: B12, ТТГ, глюкоза, электролиты, витамин D",
          "Нейровизуализация (МРТ головного мозга) при прогрессирующем ухудшении",
          "Исключить депрессию (PHQ-9), делирий (CAM, 4AT)"
        ]
      },
      {
        min: 4,
        max: 5,
        label: "4-5 - отрицательный скрининг",
        color: "#22C55E",
        description: "Деменция маловероятна.",
        details: "При сохраняющихся жалобах пациента/родственников - всё равно расширенная оценка (MoCA чувствительнее)."
      }
    ],
    caveats: [
      "Скрининг, не диагноз - положительный результат требует подтверждения",
      "CDT субъективен - требуется стандартизированная оценка (Shulman, Sunderland)",
      "Менее чувствителен к MCI, чем MoCA",
      "Не применим при афазии, тяжёлых нарушениях зрения или моторики руки"
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
    reference: "Borson S, Scanlan J, Brush M et al. The Mini-Cog: a cognitive \"vital signs\" measure for dementia screening in multi-lingual elderly. Int J Geriatr Psychiatry 2000;15:1021-1027.",
    info: "### Для чего используется\n**Mini-Cog (Borson 2000)** - ультракороткий (~3 мин) скрининг **когнитивных нарушений/деменции** в первичной помощи. Состоит из запоминания 3 слов + теста рисования часов (CDT) + отсроченного воспроизведения.\n\n### Процедура\n1. **Регистрация:** произнести 3 не связанных слова, попросить повторить\n2. **Отвлекающая задача:** CDT - нарисовать часы, числа, стрелки на 11:10\n3. **Воспроизведение:** вспомнить 3 слова\n\n### Подсчёт (0-5)\n| Компонент | Баллы |\n|---|---|\n| Воспроизведение | 0-3 (по 1 за слово) |\n| CDT | 0 (ненормальный) или 2 (нормальный) |\n\n### Интерпретация\n| Сумма | Значение |\n|---|---|\n| 0-3 | Подозрение на деменцию |\n| 4-5 | Деменция маловероятна |\n\n### Характеристики\n- Чувствительность 76-99 %, специфичность 89-93 % (в зависимости от популяции)\n- Меньше зависит от образования и языка, чем MMSE\n- Одобрен Alzheimer's Association как инструмент ежегодного Medicare wellness visit\n\n### Альтернативы\n| Инструмент | Длительность | Особенность |\n|---|---|---|\n| **GPCOG** | ~4 мин | Включает опрос информанта |\n| **AD8** | ~3 мин | Опрос только информанта, 8 пунктов |\n| **IQCODE** | ~10 мин | Информант оценивает изменения за 10 лет, 26 пунктов |\n\n### Ограничения\n- Не диагноз - требуется подтверждение (MoCA, MMSE, нейропсихология)\n- Низкая чувствительность к MCI\n- CDT требует стандартизированной оценки (схемы Shulman / Sunderland)\n\n### Тактика\n- 0-3: MoCA/MMSE, B12/ТТГ/витD, депрессия, МРТ, консультация невролога\n- 4-5 при жалобах: всё равно MoCA (чувствительнее к MCI)\n\n### Источник\nBorson S et al. **The Mini-Cog: a cognitive vital signs measure.** *Int J Geriatr Psychiatry* 2000;15:1021-1027."
  };

export default runner;
