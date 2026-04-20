// @ts-nocheck
/**
 * Runner: cage
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
        id: "cut",
        label: "C - Cut down: пытались ли вы сократить потребление?",
        type: "checkbox",
        points: 1
      },
      {
        id: "annoyed",
        label: "A - Annoyed: раздражают ли вас упрёки об алкоголе?",
        type: "checkbox",
        points: 1
      },
      {
        id: "guilty",
        label: "G - Guilty: чувствуете ли вы вину из-за выпивки?",
        type: "checkbox",
        points: 1
      },
      {
        id: "eye",
        label: "E - Eye-opener: выпивали с утра для снятия нервозности?",
        type: "checkbox",
        points: 1
      }
    ],
    bands: [
      {
        min: 0,
        max: 1,
        label: "0-1",
        color: "#22C55E",
        description: "Отрицательный скрининг."
      },
      {
        min: 2,
        max: 4,
        label: "≥2",
        color: "#EF4444",
        description: "Положительный скрининг на алкогольную зависимость. Чувствительность ~93%."
      }
    ],
    caveats: [
      "Низкая чувствительность для проблемного/рискованного пития (без зависимости) - AUDIT-C точнее",
      "Может пропускать текущих активных пьющих (cut-down/guilt отсутствует у тех, кто не пытается бросить)",
      "Низкая чувствительность у женщин - лучше TWEAK",
      "Скрининг, не диагноз (DSM-5 критерии AUD)"
    ],
    related: [
      {
        id: "audit-c",
        title: "AUDIT-C"
      },
      {
        id: "fagerstrom",
        title: "Fagerström"
      }
    ],
    reference: "Ewing 1984. Классический 4-вопросный скрининг.",
    info: "### Для чего используется\n**CAGE (Ewing 1984)** - классический 4-вопросный скрининг на **проблемное употребление алкоголя**. Очень быстрый (< 1 мин), легко запоминается.\n\n### 4 вопроса (мнемоника CAGE)\n| Буква | Вопрос |\n|---|---|\n| **C** | Cut down - Вы когда-либо чувствовали необходимость сократить употребление? |\n| **A** | Annoyed - Раздражали ли вас упрёки окружающих о ваших пьянках? |\n| **G** | Guilty - Чувствовали вы чувство вины из-за алкоголя? |\n| **E** | Eye-opener - Нужен ли был алкоголь «опохмелиться» утром? |\n\nКаждый «да» = 1 балл.\n\n### Интерпретация\n| CAGE | Вероятность расстройства |\n|---|---|\n| 0 | Низкая |\n| 1 | Пограничная |\n| ≥ 2 | Клинически значимая, необходима полная оценка |\n\n### Чувствительность/специфичность\n- Cutoff ≥ 2: чувствительность 77 %, специфичность 87 %\n- При cutoff ≥ 1: чувствительность ↑, специфичность ↓\n\n### Применение\n| Ситуация | Особенность |\n|---|---|\n| Первичная помощь | Быстрый скрининг |\n| Приёмный покой | Выявление скрытой зависимости |\n| Предоперационная оценка | Риск абстинентного синдрома |\n\n### Ограничения\n- Слабее AUDIT-C по чувствительности, особенно у женщин и молодёжи\n- Не учитывает текущее употребление (может быть положительный у тех, кто бросил)\n- Не оценивает другие ПАВ\n- Не отличает прошлую и текущую проблему\n\n### CAGE-AID (adapted)\nРасширенная версия, включает вопросы о наркотиках (CAGE Adapted to Include Drugs).\n\n### Алгоритм после положительного CAGE\n| Шаг | Действие |\n|---|---|\n| 1 | Полный AUDIT |\n| 2 | DSM-5 критерии расстройства |\n| 3 | Направление на лечение |\n| 4 | Краткая интервенция (мотивационное интервью) |"
  };

export default runner;
