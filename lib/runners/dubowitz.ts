// @ts-nocheck
/**
 * Runner: dubowitz
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
    maxScore: 70,
    inputs: [
      {
        id: "neuro",
        label: "Сумма неврологических критериев (10 признаков × 0-5)",
        type: "number",
        unit: "баллов",
        min: 0,
        max: 35,
        step: 1,
        points: 0,
        hint: "Поза, квадратное окно, сгибание голеностопа, отдача рук, отдача ног, подколенный угол, пятка-к-уху, шарф, отвисание головы, вентральное подвешивание"
      },
      {
        id: "external",
        label: "Сумма внешних (физических) критериев (11 признаков × 0-4)",
        type: "number",
        unit: "баллов",
        min: 0,
        max: 35,
        step: 1,
        points: 0,
        hint: "Отёк, текстура кожи, цвет, прозрачность, лануго, складки подошвы, сосок, молочная железа, ухо (форма/твёрдость), гениталии"
      }
    ],
    bands: [
      {
        min: 0,
        max: 10,
        label: "Крайне недоношенный (< 28 нед)",
        color: "#991B1B",
        description: "Экстремальная недоношенность."
      },
      {
        min: 11,
        max: 25,
        label: "28-32 нед",
        color: "#EF4444",
        description: "Глубокая недоношенность."
      },
      {
        min: 26,
        max: 40,
        label: "33-36 нед",
        color: "#F59E0B",
        description: "Умеренная/поздняя недоношенность."
      },
      {
        min: 41,
        max: 55,
        label: "37-41 нед (доношенный)",
        color: "#22C55E",
        description: "Доношенный."
      },
      {
        min: 56,
        max: 70,
        label: "> 41 нед (переношенный)",
        color: "#84CC16",
        description: "Переношенный."
      }
    ],
    caveats: [
      "Dubowitz 1970 - исторический метод, постепенно вытеснен Ballard / New Ballard из-за трудоёмкости (21 признак)",
      "Сильно зависит от обученности оценщика",
      "Нейромышечная часть ненадёжна при седации, асфиксии, ЦНС-поражении",
      "Погрешность ± 2 нед; УЗИ I триместра точнее"
    ],
    related: [
      {
        id: "ballard",
        title: "Ballard"
      },
      {
        id: "apgar",
        title: "Apgar"
      },
      {
        id: "crib",
        title: "CRIB"
      }
    ],
    relatedCourses: [
      {
        id: "302.2",
        title: "Педиатрия раннего возраста"
      }
    ],
    reference: "Dubowitz LMS, Dubowitz V, Goldberg C. Clinical assessment of gestational age in the newborn infant. J Pediatr 1970;77:1-10.",
    countries: "Международный (исторический)",
    info: "### Для чего используется\n**Шкала Dubowitz (1970)** - первый систематический клинический метод постнатальной оценки гестационного возраста. Основа для Ballard / New Ballard.\n\n### Структура\n- **10 неврологических признаков** × 0-5\n- **11 внешних признаков** × 0-4\n- Итоговая сумма → GA по референсному графику\n\n### Соответствие (упрощённо)\n| Общий балл | GA (нед) |\n|---|---|\n| 10 | 28 |\n| 20 | 30 |\n| 30 | 33 |\n| 40 | 36 |\n| 45 | 38 |\n| 50 | 40 |\n| 60 | 42 |\n\n`GA ≈ 0,2642 × балл + 24,595` (Dubowitz 1970)\n\n### Ограничения\n- Трудоёмок (21 признак)\n- Ненадёжен у больных / седированных\n- Сегодня на практике вытеснен Ballard\n- Для рутинной клиники предпочтительно УЗИ I триместра\n\n### Тактика\nGA определяет:\n- Стероиды, сурфактант, питание\n- Целевые SpO₂\n- Риск РДС, IVH, NEC, ROP\n\n### Источник\nDubowitz LMS, Dubowitz V, Goldberg C. *J Pediatr* 1970;77:1-10."
  };

export default runner;
