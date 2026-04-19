// @ts-nocheck
/**
 * Runner: ehra
 * AUTO-GENERATED from lib/tools-runners.ts by scripts/split-runners.mjs.
 * Do not edit by hand — regenerate via `npm run split:runners`.
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
        id: "cls",
        label: "Степень симптомов по EHRA",
        type: "select",
        options: [
          {
            value: 1,
            label: "I — Нет симптомов",
            points: 1
          },
          {
            value: 2,
            label: "IIa — Лёгкие (нормальная активность)",
            points: 2
          },
          {
            value: 3,
            label: "IIb — Умеренные (активность сохранена, но беспокоят)",
            points: 3
          },
          {
            value: 4,
            label: "III — Тяжёлые (нормальная активность нарушена)",
            points: 4
          },
          {
            value: 5,
            label: "IV — Инвалидизирующие (активность невозможна)",
            points: 5
          }
        ]
      }
    ],
    bands: [
      {
        min: 1,
        max: 1,
        label: "EHRA I",
        color: "#22C55E",
        description: "Нет симптомов. ФП — «silent».",
        details: "Бессимптомная ФП часто выявляется случайно. Риск инсульта не меньше, чем у симптомной.",
        actions: [
          "Оценить CHA₂DS₂-VASc — решить об антикоагуляции",
          "Контроль ритма обычно не требуется",
          "Мониторинг прогрессии"
        ]
      },
      {
        min: 2,
        max: 2,
        label: "EHRA IIa",
        color: "#84CC16",
        description: "Лёгкие симптомы — не влияют на повседневную активность.",
        details: "Сердцебиение, лёгкое утомление, не ограничивающие жизнь.",
        actions: [
          "Обсудить контроль частоты vs ритма с пациентом",
          "β-блокатор или недигидропиридиновый БКК — rate control",
          "Антикоагуляция по CHA₂DS₂-VASc"
        ]
      },
      {
        min: 3,
        max: 3,
        label: "EHRA IIb",
        color: "#F59E0B",
        description: "Умеренные — активность сохранена, пациент обеспокоен.",
        details: "Симптомы беспокоят, но пациент адаптирован. Уже показание к попытке стратегии контроля ритма при ранней/пароксизмальной ФП.",
        actions: [
          "Рассмотреть контроль ритма (антиаритмики / катетерная аблация)",
          "При пароксизмальной ФП < 1 года — ранняя аблация (EAST-AFNET 4)",
          "Коррекция ФР (АГ, апноэ сна, ожирение, алкоголь)"
        ]
      },
      {
        min: 4,
        max: 4,
        label: "EHRA III",
        color: "#EF4444",
        description: "Тяжёлые симптомы — нормальная активность нарушена.",
        details: "Сердцебиение, одышка, усталость ограничивают дневную активность. Показан контроль ритма и агрессивная коррекция ФР.",
        actions: [
          "Контроль ритма — катетерная аблация (I класс ESC 2020 при симптомной пароксизмальной ФП без эффекта от ААП)",
          "Антикоагуляция обязательна при CHA₂DS₂-VASc ≥ 1 (М) / ≥ 2 (Ж)",
          "Коррекция ФР по ABC-пути ESC"
        ]
      },
      {
        min: 5,
        max: 5,
        label: "EHRA IV",
        color: "#991B1B",
        description: "Инвалидизирующие — нормальная активность невозможна.",
        details: "Синкопе, острая СН, нестабильная гемодинамика. Часто требует экстренной кардиоверсии.",
        actions: [
          "Неотложная госпитализация",
          "При нестабильной гемодинамике — электрическая кардиоверсия",
          "Срочная кардиологическая оценка, аблация после стабилизации"
        ]
      }
    ],
    caveats: [
      "EHRA — субъективная шкала со стороны пациента; может меняться день ото дня",
      "Класс IIa vs IIb различается только влиянием на обеспокоенность, а не на активность",
      "Используется в связке с другими компонентами 4S-AF (Stroke, Severity of burden, Substrate)",
      "В ESC 2020 IIa = нормальная активность не нарушена, жалобы переносимые; IIb = те же жалобы, но «bothersome»"
    ],
    related: [
      {
        id: "chads-vasc",
        title: "CHA₂DS₂-VASc"
      },
      {
        id: "has-bled",
        title: "HAS-BLED"
      },
      {
        id: "4s-af",
        title: "4S-AF характеризация"
      }
    ],
    relatedCourses: [
      {
        id: "301.1",
        title: "Кардиология"
      }
    ],
    reference: "Kirchhof P et al. Outcome parameters for trials in atrial fibrillation: recommendations from a consensus conference. Europace 2007;9:1006. ESC 2020 AF Guidelines (Hindricks G et al. Eur Heart J 2021;42:373).",
    countries: "Международный (ESC / EHRA)",
    info: "### Для чего используется\n**EHRA symptom classification** — стандартизированная оценка **выраженности симптомов фибрилляции предсердий**. Используется для выбора стратегии (контроль частоты vs ритма), оценки эффекта лечения, включения в исследования.\n\n### Классы\n| Класс | Описание | Влияние на жизнь |\n|---|---|---|\n| **I** | Нет симптомов | Бессимптомная ФП |\n| **IIa** | Лёгкие | Нормальная активность не нарушена |\n| **IIb** | Умеренные | Активность не нарушена, но пациент обеспокоен |\n| **III** | Тяжёлые | Нормальная активность нарушена |\n| **IV** | Инвалидизирующие | Нормальная активность невозможна |\n\n### Эволюция классификации\n- **EHRA 2007** (Kirchhof): 4 класса (I–IV)\n- **ESC 2020**: подразделение II на IIa и IIb для более тонкой дифференциации пограничных пациентов\n\n### Клиническое значение\n- **EHRA ≥ IIb** — предпочтительна стратегия контроля ритма\n- **EHRA I** — чаще контроль частоты; важна оценка риска инсульта (CHA₂DS₂-VASc)\n- Катетерная аблация показана при **EHRA IIb–IV** и рефрактерной к ААП ФП\n\n### Роль в 4S-AF характеризации (ESC 2020)\nEHRA — компонент **Symptom severity** в многомерной характеризации ФП:\n1. **S**troke risk (CHA₂DS₂-VASc)\n2. **S**ymptom severity (EHRA)\n3. **S**everity of AF burden (пароксизмальная / персистирующая / постоянная)\n4. **S**ubstrate (предсердное ремоделирование, коморбидности)\n\n### Ограничения\n- Субъективность оценки\n- Не учитывает связь симптомов с ФП vs другие причины (особенно у пожилых)\n- Может недооценивать тяжесть у пациентов с высокой толерантностью\n\n### Источник\nKirchhof P, Auricchio A, Bax J et al. Outcome parameters for trials in atrial fibrillation: recommendations from a consensus conference organized by the German Atrial Fibrillation Competence NETwork and the European Heart Rhythm Association. *Europace* 2007;9(11):1006–1023.\nHindricks G, Potpara T, Dagres N et al. 2020 ESC Guidelines for the diagnosis and management of atrial fibrillation. *Eur Heart J* 2021;42(5):373–498."
  };

export default runner;
