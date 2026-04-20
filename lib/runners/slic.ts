// @ts-nocheck
/**
 * Runner: slic
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
    maxScore: 10,
    inputs: [
      {
        id: "morphology",
        label: "Морфология",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет патологии",
            points: 0
          },
          {
            value: "1",
            label: "Компрессионный перелом",
            points: 1
          },
          {
            value: "2",
            label: "Взрывной (burst)",
            points: 2
          },
          {
            value: "3",
            label: "Дистракция (facet perch, hyperextension)",
            points: 3
          },
          {
            value: "4",
            label: "Ротация / трансляция",
            points: 4
          }
        ]
      },
      {
        id: "dlc",
        label: "Дисколигаментарный комплекс (DLC)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Интактен",
            points: 0
          },
          {
            value: "1",
            label: "Неопределённо (изолированный межостистый промежуток, МРТ+)",
            points: 1
          },
          {
            value: "2",
            label: "Разрушен (facet dislocation, dehiscence)",
            points: 2
          }
        ]
      },
      {
        id: "neuro",
        label: "Неврологический статус",
        type: "select",
        options: [
          {
            value: "0",
            label: "Интактен",
            points: 0
          },
          {
            value: "1",
            label: "Корешковая компрессия",
            points: 1
          },
          {
            value: "2",
            label: "Полное повреждение спинного мозга",
            points: 2
          },
          {
            value: "3",
            label: "Неполное повреждение спинного мозга",
            points: 3
          }
        ]
      },
      {
        id: "cord_compression",
        label: "Продолжающаяся компрессия спинного мозга при неврологическом дефиците (+1)",
        type: "checkbox",
        points: 1
      }
    ],
    bands: [
      {
        min: 0,
        max: 3,
        label: "≤ 3 консерватив.",
        color: "#22C55E",
        description: "Неоперативное лечение",
        details: "Консервативное лечение: жёсткий воротник, наблюдение.",
        actions: [
          "Жёсткий воротник (Philadelphia, Miami-J) 6-12 нед",
          "Контрольные снимки в динамике (flexion-extension через 4-6 нед)",
          "Реабилитация"
        ]
      },
      {
        min: 4,
        max: 4,
        label: "4 неопределённо",
        color: "#F59E0B",
        description: "Равнозначный выбор (хирургия vs консерватив.)",
        details: "Хирургическое или консервативное - решение индивидуально с учётом механизма, возраста, коморбидности.",
        actions: [
          "Мультидисциплинарный консилиум",
          "МРТ для оценки DLC",
          "При подвывихах / нестабильности - операция"
        ]
      },
      {
        min: 5,
        max: 10,
        label: "≥ 5 операция",
        color: "#EF4444",
        description: "Хирургическое лечение",
        details: "Показание к операции - декомпрессия и стабилизация.",
        actions: [
          "Срочная декомпрессия + стабилизация < 24 ч при неврологическом дефиците",
          "Передний (ACDF/ACCF) vs задний (lateral mass screws) подход по паттерну",
          "Комбинированный подход при сочетанных повреждениях",
          "Реабилитация после операции"
        ]
      }
    ],
    reference: "Vaccaro AR, Hulbert RJ, Patel AA et al. The Subaxial Cervical Spine Injury Classification System. Spine 2007;32:2365-2374.",
    countries: "Международный (Spine Trauma Study Group)",
    caveats: [
      "SLIC применим к субаксиальному (C3-C7) отделу",
      "TLICS - аналог для грудопоясничного (Vaccaro 2005)",
      "AOSpine Cervical Classification - современная альтернатива (A/B/C + N modifier)",
      "DLC оценивается по МРТ T2 FS / STIR (сигнал в связках / диске)",
      "+1 балл за сохраняющуюся компрессию возможен только при неврологическом дефиците"
    ],
    related: [
      {
        id: "asia",
        title: "ASIA Impairment"
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
    info: "### Для чего используется\n**SLIC (Subaxial Cervical Spine Injury Classification, Vaccaro 2007)** - балльная система для решения **об оперативном лечении травм C3-C7**.\n\n### Три домена\n| Домен | Критерий | Баллы |\n|---|---|---|\n| **Морфология** | Нет | 0 |\n|  | Компрессия | 1 |\n|  | Взрывной (burst) | 2 |\n|  | Дистракция (facet perch, hyperextension) | 3 |\n|  | Ротация/трансляция | 4 |\n| **DLC** | Интактен | 0 |\n|  | Неопределённо | 1 |\n|  | Разрушен | 2 |\n| **Неврология** | Интактен | 0 |\n|  | Корешковая | 1 |\n|  | Полное SCI | 2 |\n|  | Неполное SCI | 3 |\n|  | + продолжающаяся компрессия при дефиците | +1 |\n\n### Интерпретация\n| Сумма | Тактика |\n|---|---|\n| ≤ 3 | Неоперативное (воротник, наблюдение) |\n| 4 | Равнозначно (решение индивидуальное) |\n| ≥ 5 | Оперативное |\n\n### Морфологические паттерны\n- **Компрессия**: < 25 % уменьшение высоты тела, без заднего вовлечения\n- **Взрывной (burst)**: ретропульсия тела, вовлечение задней стенки\n- **Дистракция**: facet perch, hyperextension (флексионный/экстензионный)\n- **Ротация/трансляция**: faset dislocation (unilateral / bilateral), floating lateral mass\n\n### DLC (Disco-Ligamentous Complex) на МРТ\n- Интактен: нормальный T2 сигнал в диске, ALL, PLL, interspinous\n- Неопределённо: изолированный отёк в interspinous без дисрупции\n- Разрушен: widening of interspinous, facet dislocation, avulsion, увеличение диска\n\n### Альтернативы\n- **TLICS (Thoracolumbar Injury Classification and Severity Score, Vaccaro 2005)** - для T-L; те же 3 домена\n- **AOSpine Cervical Classification (Vaccaro 2016)** - A (compression) / B (tension band) / C (translation) + N modifier; считается современной\n- **Allen-Ferguson (1982)** - историческая, по механизму\n\n### Хирургические подходы\n| Паттерн | Подход |\n|---|---|\n| Компрессия / burst - декомпрессия спереди | **ACDF** (1 уровень) / **ACCF** (corpectomy) |\n| Задний тензионный bandensis / facet dislocation | **Posterior lateral mass screws** |\n| Тяжёлая нестабильность / комбинированные | **Циркулярный** (передне-задний) |\n\n### Ограничения SLIC\n- Субъективность оценки DLC (inter-rater κ ≈ 0.5)\n- Не применим к окципитоцервикальным или атлантоаксиальным (C0-C2)\n- Не учитывает возраст, ОА, anterior longitudinal ligament injury изолированно\n\n### Тактика при ≥ 5\n- **Срочная декомпрессия < 24 ч** при неврологическом дефиците (STASCIS)\n- **MAP ≥ 85-90** мм рт.ст. 5-7 дней\n- Профилактика ТГВ, пролежней\n- Ранняя реабилитация\n\n### Источник\nVaccaro AR et al. **The Subaxial Cervical Spine Injury Classification System.** *Spine* 2007;32:2365-2374.\nVaccaro AR et al. **A new classification of thoracolumbar injuries (TLICS).** *Spine* 2005;30:2325-2333."
  };

export default runner;
