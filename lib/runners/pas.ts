// @ts-nocheck
/**
 * Runner: pas
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
    inputs: [
      {
        id: "cough",
        label: "Болезненность при кашле/перкуссии",
        type: "checkbox",
        points: 2
      },
      {
        id: "anor",
        label: "Анорексия",
        type: "checkbox",
        points: 1
      },
      {
        id: "fever",
        label: "Лихорадка ≥ 38 °C",
        type: "checkbox",
        points: 1
      },
      {
        id: "naus",
        label: "Тошнота / рвота",
        type: "checkbox",
        points: 1
      },
      {
        id: "rlq",
        label: "Болезненность в правой подвздошной обл.",
        type: "checkbox",
        points: 2
      },
      {
        id: "leu",
        label: "Лейкоцитоз > 10 ×10⁹/л",
        type: "checkbox",
        points: 1
      },
      {
        id: "shift",
        label: "Сдвиг влево (нейтрофилёз > 75 %)",
        type: "checkbox",
        points: 1
      },
      {
        id: "mig",
        label: "Миграция боли в правую подвздошную",
        type: "checkbox",
        points: 1
      }
    ],
    bands: [
      {
        min: 0,
        max: 3,
        label: "0–3 (низкий)",
        color: "#10B981",
        description: "Аппендицит маловероятен. Наблюдение."
      },
      {
        min: 4,
        max: 6,
        label: "4–6 (промежуточный)",
        color: "#F59E0B",
        description: "Требует визуализации (УЗИ/КТ)."
      },
      {
        min: 7,
        max: 10,
        label: "7–10 (высокий)",
        color: "#EF4444",
        description: "Аппендицит вероятен. Хирургическая консультация."
      }
    ],
    maxScore: 10,
    caveats: [
      "Педиатрическая шкала (2–20 лет) — у взрослых Alvarado точнее",
      "Не исключает аппендицит при низкой сумме при сохраняющейся клинике — УЗИ/КТ",
      "Оперативность УЗИ зависит от комплекции и опыта оператора"
    ],
    relatedCourses: [
      {
        id: "301.3",
        title: "Гастроэнтерология"
      }
    ],
    related: [
      {
        id: "alvarado",
        title: "Alvarado (взрослые)"
      },
      {
        id: "kocher",
        title: "Kocher (септ. артрит)"
      }
    ],
    reference: "Samuel M. J Pediatr Surg 2002. Pediatric Appendicitis Score.",
    info: "### Что считает шкала\n**Pediatric Appendicitis Score (PAS)** — 8-параметровая шкала для оценки вероятности острого аппендицита у детей **5–15 лет**.\n\n### Компоненты (макс 10)\n| Критерий | Баллы |\n|---|---|\n| Кашель/перкуторная болезненность в правой подвздошной | 2 |\n| Анорексия | 1 |\n| Лихорадка ≥ 38 °C | 1 |\n| Тошнота/рвота | 1 |\n| Болезненность в правой подвздошной | 2 |\n| Лейкоцитоз > 10 ×10⁹/л | 1 |\n| Сдвиг влево (нейтрофилёз > 75 %) | 1 |\n| Миграция боли в правую подвздошную | 1 |\n\n### Интерпретация\n- **0–3** — аппендицит маловероятен (NPV ≈ 95 %); амбулаторное наблюдение\n- **4–6** — промежуточный риск; **визуализация** (УЗИ — first line у детей; КТ если УЗИ неинформативно)\n- **7–10** — аппендицит вероятен; хирургическая консультация / операция\n\n### Альтернативные шкалы\n| Шкала | Особенность |\n|---|---|\n| Alvarado (MANTRELS) | 10 баллов, более популярна у взрослых |\n| AIR (Appendicitis Inflammatory Response) | Включает CRP |\n| PARC (Kharbanda) | Машинное обучение, более точна у детей |\n\n### Алгоритм с УЗИ\n1. PAS 0–3 → выписка\n2. PAS 4–6 → УЗИ:\n   - визуализирован аппендикс норма → выписка\n   - аппендицит → операция\n   - неинформативно → КТ или повторный осмотр через 6–12 ч\n3. PAS 7–10 → консультация хирурга\n\n### Ограничения\n- Не валидизирован для детей < 5 лет (атипичная клиника, чаще перфорация)\n- Чувствительность ~ 82 %, специфичность ~ 75 % — недостаточно для отказа от визуализации в группе среднего риска"
  };

export default runner;
