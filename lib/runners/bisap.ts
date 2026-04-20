// @ts-nocheck
/**
 * Runner: bisap
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
        id: "bun",
        label: "BUN >25 mg/dL (≈мочевина >8.9 ммоль/л)",
        type: "checkbox",
        points: 1
      },
      {
        id: "impaired",
        label: "Нарушение сознания (GCS <15)",
        type: "checkbox",
        points: 1
      },
      {
        id: "sirs",
        label: "SIRS (≥2 критериев)",
        type: "checkbox",
        points: 1
      },
      {
        id: "age",
        label: "Возраст >60 лет",
        type: "checkbox",
        points: 1
      },
      {
        id: "pleural",
        label: "Плевральный выпот на рентгене",
        type: "checkbox",
        points: 1
      }
    ],
    bands: [
      {
        min: 0,
        max: 2,
        label: "0-2 (низкий риск)",
        color: "#22C55E",
        description: "Смертность <2%."
      },
      {
        min: 3,
        max: 5,
        label: "≥3 (высокий риск)",
        color: "#EF4444",
        description: "Смертность до 22%. Агрессивная терапия, ICU."
      }
    ],
    caveats: [
      "Оценивается в первые 24 ч",
      "Точность сопоставима с APACHE II, но проще",
      "Не заменяет КТ-оценку (Balthazar / CTSI) через 48-72 ч",
      "Учитывать этиологию (желчнокаменная, алкогольная, гипертриглицеридемия)"
    ],
    relatedCourses: [
      {
        id: "301.3",
        title: "Гастроэнтерология"
      }
    ],
    related: [
      {
        id: "sofa",
        title: "SOFA"
      },
      {
        id: "qsofa",
        title: "qSOFA"
      }
    ],
    reference: "Wu 2008. Оценивается в первые 24 ч острого панкреатита.",
    info: "### Для чего используется\n**BISAP (Bedside Index for Severity in Acute Pancreatitis, Wu 2008)** - прикроватная оценка тяжести и прогноза **острого панкреатита** в первые 24 часа. Проще, чем APACHE II / Ranson.\n\n### Мнемоника BISAP (5 критериев, по 1 баллу)\n| Буква | Критерий |\n|---|---|\n| **B** | BUN > 25 mg/dL (мочевина > 8,9 ммоль/л) |\n| **I** | Impaired mental status (GCS < 15) |\n| **S** | SIRS ≥ 2 критерия |\n| **A** | Age > 60 лет |\n| **P** | Pleural effusion (плеврит на визуализации) |\n\n### SIRS-критерии\n| Критерий | Порог |\n|---|---|\n| Температура | < 36 или > 38 °C |\n| ЧСС | > 90 |\n| ЧДД | > 20 или PaCO₂ < 32 |\n| Лейкоциты | < 4 или > 12 × 10⁹/л, либо > 10 % палочек |\n\n### Интерпретация\n| BISAP | Смертность |\n|---|---|\n| 0 | < 1 % |\n| 1 | 0,8 % |\n| 2 | 1,9 % |\n| **3** | **5,3 %** - умеренно тяжёлый |\n| **4** | **12,7 %** - тяжёлый |\n| **5** | **22,5 %** - очень тяжёлый |\n\n### BISAP vs Ranson vs APACHE II\n| Шкала | Время оценки | Особенность |\n|---|---|---|\n| **BISAP** | В первые 24 ч | Простая, прикроватная |\n| **Ranson** | При поступлении + через 48 ч | 11 критериев; старый стандарт |\n| **APACHE II** | В любое время в ICU | Сложная, но точнее |\n| **Atlanta revised 2012** | Клиническая классификация | Лёгкий/умеренный/тяжёлый |\n| **CTSI (Balthazar)** | КТ | Визуализационная оценка |\n\n### Классификация Atlanta 2012\n| Тяжесть | Критерии |\n|---|---|\n| Лёгкий | Без органной недостаточности, без местных осложнений |\n| Умеренно тяжёлый | Транзиторная органная недостаточность (< 48 ч) или местные осложнения |\n| Тяжёлый | Персистирующая органная недостаточность (> 48 ч) |\n\n### Терапия\n| Период | Подход |\n|---|---|\n| 0-24 ч | Агрессивная инфузия (250 мл/ч Рингер), анальгезия, NPO |\n| 24-72 ч | Раннее энтеральное питание (< 72 ч), контроль лактата |\n| Тяжёлый | ICU, мониторинг; ОПП → ЗПТ; некроз + сепсис → антибиотики + дренаж |\n| Билиарный | ЭРХПГ при холангите; холецистэктомия до выписки |\n\n### Ограничения\n- Не учитывает гематокрит и кальций (которые есть в Ranson)\n- Чувствительность ниже в первые часы (нужно время для развития SIRS)\n- Не подходит для мониторинга динамики"
  };

export default runner;
