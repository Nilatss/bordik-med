/**
 * Runner: cam
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
        id: "acute",
        label: "1. Острое начало и флюктуирующее течение (изменение от исходного, колеблется в течение суток)",
        type: "checkbox",
        points: 1
      },
      {
        id: "inattention",
        label: "2. Нарушение внимания (не может концентрироваться, отвлекаемость - тест «цифры назад» или «месяцы назад»)",
        type: "checkbox",
        points: 1
      },
      {
        id: "disorganized",
        label: "3. Дезорганизованное мышление (бессвязная речь, нелогичный ход мыслей, смена темы)",
        type: "checkbox",
        points: 1
      },
      {
        id: "loc",
        label: "4. Изменённый уровень сознания (настороже, летаргия, ступор, кома - что угодно, кроме «alert»)",
        type: "checkbox",
        points: 1
      }
    ],
    bands: [
      {
        min: 0,
        max: 2,
        label: "CAM отрицательный",
        color: "#22C55E",
        description: "Делирий маловероятен. Продолжить рутинную оценку."
      },
      {
        min: 3,
        max: 3,
        label: "Критерии не выполнены",
        color: "#F59E0B",
        description: "Есть 1+2, но нет 3 или 4 - делирий не диагностирован; повторить оценку.",
        details: "Алгоритм CAM требует ОБЯЗАТЕЛЬНОГО сочетания критериев 1 и 2 ПЛЮС критерия 3 ИЛИ 4. Если это условие не выполнено - CAM отрицательный."
      },
      {
        min: 4,
        max: 4,
        label: "CAM положительный",
        color: "#EF4444",
        description: "Делирий (требуется 1 И 2, И [3 ИЛИ 4]).",
        details: "Чувствительность 94-100%, специфичность 90-95% в руках обученного оценщика. Делирий - медицинская неотложность: смертность на госпитализации до 25%, риск длительного когнитивного снижения.",
        actions: [
          "Искать обратимые причины (DELIRIUM mnemonic): Drugs, Electrolytes, Lack of O₂, Infection, Retention (моча/кал), Ischemia, Under-hydration, Metabolic",
          "ОАК, электролиты, глюкоза, лактат, ТТГ, B12, мочевина/креатинин, ОАМ, рентген грудной клетки",
          "Нефармакологическое: ориентация во времени, очки/слуховой аппарат, семья, мобилизация, режим сна",
          "Избегать бензодиазепинов (кроме алкогольного абстинентного синдрома)",
          "При тяжёлом возбуждении - галоперидол низкой дозы (0.5-1 мг) или кветиапин; избегать у паркинсонизма"
        ]
      }
    ],
    caveats: [
      "CAM - сам по себе НЕ скрининг; требуется предварительная оценка внимания (Digit span, месяцы назад)",
      "Низкая чувствительность без обучения оценщика (~ 40%) - обучение критично",
      "Для ICU-пациентов использовать CAM-ICU (Ely), адаптированную под интубированных",
      "Hypoactive delirium часто пропускается - всегда спрашивать о внимании/флюктуациях у сонливых пациентов"
    ],
    related: [
      {
        id: "4at",
        title: "4AT"
      },
      {
        id: "mmse",
        title: "MMSE"
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
      },
      {
        id: "300.4",
        title: "Неотложная помощь"
      }
    ],
    reference: "Inouye SK, van Dyck CH, Alessi CA, et al. Clarifying confusion: the Confusion Assessment Method. A new method for detection of delirium. Ann Intern Med 1990;113:941-8.",
    countries: "США",
    presets: [
      {
        label: "Норма",
        values: {
          acute: false,
          inattention: false,
          disorganized: false,
          loc: false
        }
      },
      {
        label: "Типичный делирий",
        values: {
          acute: true,
          inattention: true,
          disorganized: true,
          loc: false
        }
      },
      {
        label: "Hypoactive delirium",
        values: {
          acute: true,
          inattention: true,
          disorganized: false,
          loc: true
        }
      }
    ],
    info: "### Для чего используется\n**CAM (Confusion Assessment Method, Inouye 1990)** - стандартный инструмент выявления делирия у взрослых. DSM-5 совместим. Применяется в гериатрии, хирургии, терапии.\n\n### Критерии (алгоритм)\nДелирий диагностируется при наличии:\n1. **Острое начало И флюктуирующий курс** - **ОБЯЗАТЕЛЬНО**\n2. **Нарушение внимания** - **ОБЯЗАТЕЛЬНО**\n3. **Дезорганизованное мышление** - нужен **ИЛИ 3 ИЛИ 4**\n4. **Изменённый уровень сознания** - нужен **ИЛИ 3 ИЛИ 4**\n\n**CAM+** = (1) И (2) И (3 ИЛИ 4).\n\n### Интерпретация\n| Условие | Результат |\n|---|---|\n| (1) и (2) и (3 или 4) | **CAM положительный - делирий** |\n| Любое другое | CAM отрицательный |\n\n### Метрики (в руках обученного)\n- Чувствительность: 94-100%\n- Специфичность: 90-95%\n- PPV: 91-94%, NPV: 90-100%\n\n### Ограничения\n- Без обучения чувствительность падает до 40%\n- Требует предварительной оценки внимания (Digit span, месяцы назад, \"World\"/\"DLROW\")\n- Для ICU - использовать **CAM-ICU** (с невербальной оценкой внимания)\n- Hypoactive delirium (сонливый/заторможенный) часто пропускается\n\n### Тактика\n**Искать причины** (DELIRIUM mnemonic):\n- **D**rugs (опиаты, бензы, холинолитики)\n- **E**lectrolytes (Na, Ca, глюкоза)\n- **L**ack of O₂ (гипоксия, ОСН)\n- **I**nfection (UTI, пневмония, сепсис)\n- **R**etention (мочи, кала)\n- **I**schemia (ОНМК, ИМ)\n- **U**nder-hydration, Under-nutrition\n- **M**etabolic (уремия, печ. энцеф., ТТГ)\n\n**Лечение**:\n- Нефармакологическое - HELP bundle (Inouye): ориентация, сон, мобилизация, зрение/слух, гидратация\n- Галоперидол 0.25-1 мг PO/IM при тяжёлом возбуждении (осторожно - QTc, экстрапирамидные)\n- Избегать бензодиазепинов (кроме алкогольного абстинентного)"
  };

export default runner;
