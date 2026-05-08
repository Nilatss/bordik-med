/**
 * Runner: audit-c — AUDIT-C 3-question Alcohol Use Screen
 *
 * P1-CR-10 — Formula source attribution:
 *   PRIMARY:    Bush K, Kivlahan DR, McDonell MB, Fihn SD, Bradley KA.
 *               The AUDIT alcohol consumption questions (AUDIT-C): an
 *               effective brief screening test for problem drinking.
 *               Arch Intern Med. 1998;158(16):1789-1795.
 *               doi:10.1001/archinte.158.16.1789
 *   GUIDELINE:  USPSTF 2018 Final Recommendation — alcohol misuse
 *               screening + brief counseling в primary care. AUDIT-C
 *               recommended over CAGE для outpatient screen.
 *               doi:10.1001/jama.2018.16789
 *
 * 3 questions (0-4 each, max 12):
 *   1. How often do you have a drink containing alcohol?
 *      0 = Never        1 = ≤monthly      2 = 2-4 times/month
 *      3 = 2-3 times/week  4 = ≥4 times/week
 *   2. How many standard drinks containing alcohol do you have on
 *      a typical day when drinking?
 *      0 = 1-2          1 = 3-4           2 = 5-6
 *      3 = 7-9          4 = ≥10
 *   3. How often do you have ≥6 drinks on one occasion?
 *      0 = Never        1 = <monthly      2 = monthly
 *      3 = weekly       4 = daily/almost daily
 *
 * Bands (USPSTF cut-offs):
 *   Men:   ≥4   → positive screen — brief intervention
 *   Women: ≥3   → positive screen — brief intervention
 *
 * Caveats:
 *   - Self-report — социальный bias underestimates real use
 *   - НЕ диагноз alcohol use disorder; positive screen → DSM-5 AUD
 *     evaluation требуется
 *   - Pregnant women: ≥3 = consider any alcohol use as risk
 *
 * Variants:
 *   - AUDIT (full 10-question, max 40) — для confirmation после
 *     positive AUDIT-C screen
 *   - CAGE (4 questions) — older, deprecated в primary care
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
    maxScore: 12,
    inputs: [
      {
        id: "q1",
        label: "Как часто вы употребляете алкоголь?",
        type: "select",
        options: [
          {
            value: "0",
            label: "Никогда",
            points: 0
          },
          {
            value: "1",
            label: "Ежемесячно или реже",
            points: 1
          },
          {
            value: "2",
            label: "2-4 раза в месяц",
            points: 2
          },
          {
            value: "3",
            label: "2-3 раза в неделю",
            points: 3
          },
          {
            value: "4",
            label: "4+ раза в неделю",
            points: 4
          }
        ]
      },
      {
        id: "q2",
        label: "Сколько порций в обычный день употребления?",
        type: "select",
        options: [
          {
            value: "0",
            label: "1-2",
            points: 0
          },
          {
            value: "1",
            label: "3-4",
            points: 1
          },
          {
            value: "2",
            label: "5-6",
            points: 2
          },
          {
            value: "3",
            label: "7-9",
            points: 3
          },
          {
            value: "4",
            label: "10+",
            points: 4
          }
        ]
      },
      {
        id: "q3",
        label: "Как часто употребляете ≥6 порций за раз?",
        type: "select",
        options: [
          {
            value: "0",
            label: "Никогда",
            points: 0
          },
          {
            value: "1",
            label: "Реже раза в месяц",
            points: 1
          },
          {
            value: "2",
            label: "Ежемесячно",
            points: 2
          },
          {
            value: "3",
            label: "Еженедельно",
            points: 3
          },
          {
            value: "4",
            label: "Ежедневно/почти",
            points: 4
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 2,
        label: "0-2 (низкий риск)",
        color: "#22C55E",
        description: "Низкий риск алкогольных проблем."
      },
      {
        min: 3,
        max: 4,
        label: "3 Ж / 4 М",
        color: "#F59E0B",
        description: "Положительный скрининг - полный AUDIT."
      },
      {
        min: 5,
        max: 12,
        label: "≥5",
        color: "#EF4444",
        description: "Высокий риск. Вмешательство + полный AUDIT."
      }
    ],
    caveats: [
      "Разные пороги для М (≥ 4) и Ж (≥ 3)",
      "Скрининг - положительный результат требует полного AUDIT (10 вопросов) и клинической оценки",
      "Для синдрома отмены использовать CIWA-Ar",
      "Беременным ставится порог ≥ 3 независимо от пола"
    ],
    relatedCourses: [
      {
        id: "301.3",
        title: "Гастроэнтерология"
      }
    ],
    related: [
      {
        id: "cage",
        title: "CAGE"
      },
      {
        id: "fagerstrom",
        title: "Fagerström (никотин)"
      },
      {
        id: "phq9",
        title: "PHQ-9"
      }
    ],
    reference: "Bush 1998 (US VA). Короткая версия AUDIT. Cutoff ≥4 М / ≥3 Ж.",
    info: "### Для чего используется\n**AUDIT-C (Alcohol Use Disorders Identification Test - Concise, Bush 1998)** - короткая 3-вопросная версия AUDIT для **скрининга проблемного употребления алкоголя**. Широко применяется в первичной помощи (US VA, NIAAA).\n\n### 3 вопроса\n1. Как часто вы употребляете алкоголь? (0-4 балла)\n2. Сколько стандартных порций выпиваете в типичный день? (0-4)\n3. Как часто выпиваете ≥ 6 порций за один раз? (0-4)\n\nМаксимум 12 баллов.\n\n### Интерпретация\n| AUDIT-C | Мужчины | Женщины | Интерпретация |\n|---|---|---|---|\n| 0 | Воздерживается | Воздерживается | - |\n| ≥ 4 | Положительный | - | Скрининг положительный |\n| ≥ 3 | - | Положительный | Скрининг положительный |\n| ≥ 8 | Оба пола | Вероятное расстройство употребления алкоголя |\n\n### Стандартная порция\n| Страна | Определение |\n|---|---|\n| США | 14 г чистого этанола (~ 340 мл пива 5 %, 150 мл вина 12 %, 45 мл крепкого 40 %) |\n| РФ | Ближе к 10 г |\n| Великобритания | 8 г (unit) |\n\n### Тактика при AUDIT-C положительном\n| Шаг | Действие |\n|---|---|\n| 1. Полный AUDIT (10 вопросов) | Точнее оценивает тяжесть |\n| 2. Краткая интервенция | Мотивационное интервью |\n| 3. Направление | К наркологу при зависимости |\n| 4. DSM-5 критерии | Лёгкое / умеренное / тяжёлое расстройство |\n\n### Связанные шкалы\n| Шкала | Применение |\n|---|---|\n| **AUDIT (10 вопросов)** | Полная оценка |\n| **CAGE** | 4 вопроса, менее чувствителен |\n| **T-ACE** | Беременность |\n| **MAST** | Более длинная (25 вопросов) |\n| **CRAFFT** | Подростки |\n\n### Лечение алкогольной зависимости\n| Препарат | Механизм |\n|---|---|\n| Налтрексон | Антагонист опиоидных, снижает тягу |\n| Акампросат | Модулятор глутамата |\n| Дисульфирам | Аверсивная терапия |\n| Психотерапия | КПТ, группы АА |\n\n### Ограничения\n- Неэффективен у пациентов с отрицанием\n- Валидность зависит от стандартной порции (перевод)\n- Не оценивает другие ПАВ"
  };

export default runner;
