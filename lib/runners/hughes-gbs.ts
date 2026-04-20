// @ts-nocheck
/**
 * Runner: hughes-gbs
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
        id: "grade",
        label: "Hughes Disability Scale",
        type: "select",
        options: [
          {
            value: "0",
            label: "0 - здоров",
            points: 0
          },
          {
            value: "1",
            label: "1 - минимальные симптомы, бегает",
            points: 1
          },
          {
            value: "2",
            label: "2 - ходит 10 м без помощи, не бегает",
            points: 2
          },
          {
            value: "3",
            label: "3 - ходит 10 м с поддержкой",
            points: 3
          },
          {
            value: "4",
            label: "4 - прикован к постели / коляске",
            points: 4
          },
          {
            value: "5",
            label: "5 - требует ИВЛ",
            points: 5
          },
          {
            value: "6",
            label: "6 - смерть",
            points: 6
          }
        ]
      }
    ],
    bands: [
      {
        min: 0,
        max: 1,
        label: "0-1 минимальн.",
        color: "#22C55E",
        description: "Нет или минимальная инвалидизация",
        details: "Лёгкая форма. Госпитализация не обязательна, но рекомендуется ранняя консультация.",
        actions: [
          "Наблюдение",
          "ЭНМГ для подтверждения (AIDP / AMAN)",
          "ЦСЖ (albumino-cytological dissociation)",
          "Пересмотреть показания к IVIg если > 2-4 нед от начала"
        ]
      },
      {
        min: 2,
        max: 2,
        label: "2 ходит без помощи",
        color: "#86EFAC",
        description: "Ходит ≥ 10 м без помощи",
        details: "Лёгкая инвалидизация. Решение о IVIg индивидуально.",
        actions: [
          "Наблюдение в стационаре (прогрессия ≤ 4 нед)",
          "Мониторинг FVC, SpO₂, вегетативной нестабильности",
          "IVIg рассматривается при прогрессии"
        ]
      },
      {
        min: 3,
        max: 3,
        label: "3 с поддержкой",
        color: "#F59E0B",
        description: "Ходит 10 м только с помощью",
        details: "Умеренная - показание к иммунотерапии.",
        actions: [
          "IVIg 2 г/кг за 5 дней ИЛИ плазмаферез 5 сеансов (эквивалентны)",
          "Мониторинг FVC/NIF каждые 2-4 ч",
          "Госпитализация в отделение с возможностью ОРИТ",
          "Профилактика ТГВ"
        ]
      },
      {
        min: 4,
        max: 4,
        label: "4 коляска/постель",
        color: "#EF4444",
        description: "Прикован к коляске / постели",
        details: "Тяжёлая инвалидизация - срочная иммунотерапия.",
        actions: [
          "IVIg 2 г/кг за 5 дней",
          "Перевод в ОРИТ при FVC < 20 мл/кг или нарастании за 24 ч",
          "Вегетативный мониторинг (аритмии - ключевая причина смерти)",
          "Нутритивная поддержка; профилактика пролежней, ТГВ"
        ]
      },
      {
        min: 5,
        max: 5,
        label: "5 ИВЛ",
        color: "#991B1B",
        description: "Требует ИВЛ",
        details: "Жизнеугрожающая стадия. Летальность 5-10 %.",
        actions: [
          "ОРИТ, ИВЛ",
          "IVIg или плазмаферез",
          "Трахеостомия при прогнозе > 2 нед ИВЛ",
          "Реабилитация ранняя",
          "Автономная нестабильность: мониторинг непрерывно"
        ]
      },
      {
        min: 6,
        max: 6,
        label: "6 смерть",
        color: "#111827",
        description: "Смерть",
        details: "Летальный исход (ТЭЛА, аритмии, сепсис)."
      }
    ],
    reference: "Hughes RAC, Newsom-Davis JM, Perkin GD, Pierce JM. Controlled trial of prednisolone in acute polyneuropathy. Lancet 1978;2:750-753.",
    countries: "Международный",
    caveats: [
      "Hughes - основная шкала исхода GBS в RCT",
      "EGOS и mEGOS - прогностические шкалы на 1 нед и 2 нед",
      "IVIg и плазмаферез эквивалентны; комбинация НЕ улучшает",
      "Кортикостероиды в монотерапии неэффективны (RCT negative)",
      "Вариант: miller-Fisher (офтальмоплегия + атаксия + арефлексия, GQ1b+)",
      "10-20 % остаются с инвалидизацией после 1 года"
    ],
    related: [
      {
        id: "mgfa",
        title: "MGFA"
      },
      {
        id: "mrs",
        title: "mRS"
      }
    ],
    relatedCourses: [
      {
        id: "201.3",
        title: "Нейрофизиология"
      }
    ],
    info: "### Для чего используется\n**Hughes Disability Scale (Hughes 1978)** - стандарт **оценки инвалидизации при GBS / CIDP**. Первоначально в RCT преднизолона при AIDP.\n\n### Шкала (0-6)\n| Балл | Состояние |\n|---|---|\n| 0 | Здоров |\n| 1 | Минимальные признаки, способен бегать |\n| 2 | Ходит 10 м без помощи, не бегает |\n| 3 | Ходит 10 м с помощью (трость, поддержка) |\n| 4 | Прикован к постели или креслу-коляске |\n| 5 | Требует искусственной вентиляции (хотя бы часть дня) |\n| 6 | Смерть |\n\n### Клиническое применение\n- Первичная конечная точка в RCT IVIg / PLEX\n- Инвалидизация на нэйте выписки и 4-26 нед\n- **Цель лечения**: улучшение на **1 балл** в 4 нед\n\n### Прогностические шкалы\n| Шкала | Когда считать | Переменные |\n|---|---|---|\n| **EGOS (Erasmus GBS Outcome Score)** | 2 нед от госпитализации | Возраст, диарея (C. jejuni), Hughes 2 нед |\n| **mEGOS (modified EGOS)** | 1 нед | Возраст, диарея, MRC sum score |\n| **EGRIS (Erasmus GBS Respiratory Insufficiency Score)** | Поступление | Дни от начала, слабость лица/бульбарная, MRC |\n\n### Критерии диагноза (Brighton)\n- Прогрессирующая слабость, симметричная\n- Арефлексия\n- Монофазный курс < 4 нед\n- Альбумино-цитологическая диссоциация в ЦСЖ (белок ↑, клетки < 10-50)\n- ЭНМГ-паттерн (AIDP, AMAN, AMSAN)\n\n### Подтипы\n| Подтип | Частота | Характеристика |\n|---|---|---|\n| AIDP (demyelinating) | 85 % | Классическая демиелинизация |\n| AMAN (axonal motor) | 5-10 % (Азия - до 30 %) | GM1-антитела |\n| AMSAN | 5 % | Аксональная сенсомоторная; тяжёлая |\n| Miller-Fisher | 5 % | Офтальмоплегия + атаксия + арефлексия; GQ1b+ |\n\n### Тактика\n- **IVIg 2 г/кг за 5 дн** ИЛИ **плазмаферез 5 сеансов через день**\n- Показание: неспособность ходить ≥ 10 м без помощи (Hughes ≥ 3) ИЛИ быстрая прогрессия\n- Окно эффективности: IVIg - до 4 нед; PLEX - до 4 нед\n- **Стероиды НЕ показаны** (RCT показал бесполезность и возможный вред)\n- Комбинация IVIg + PLEX **не** улучшает\n- **ОРИТ** при: FVC < 20 мл/кг, NIF < −30 см H₂O, MEP < 40 см H₂O (правило 20/30/40), бульбарные, автономная нестабильность\n- Профилактика ТГВ, пролежней; ранняя реабилитация\n- Треть требует ИВЛ; смертность 3-7 %; у 20 % остаётся инвалидизация > 1 года\n\n### Источник\nHughes RAC et al. **Controlled trial of prednisolone in acute polyneuropathy.** *Lancet* 1978;2:750-753.\nvan den Berg B et al. **Guillain-Barré syndrome: pathogenesis, diagnosis, treatment and prognosis.** *Nat Rev Neurol* 2014;10:469-482."
  };

export default runner;
