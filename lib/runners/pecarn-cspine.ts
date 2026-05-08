/**
 * Runner: pecarn-cspine
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
    maxScore: 8,
    inputs: [
      {
        id: "ams",
        label: "Нарушение сознания (GCS <15, AVPU не A)",
        type: "checkbox",
        points: 1
      },
      {
        id: "focal",
        label: "Очаговый неврологический дефицит",
        type: "checkbox",
        points: 1
      },
      {
        id: "neckPain",
        label: "Жалобы на боль в шее",
        type: "checkbox",
        points: 1
      },
      {
        id: "torticollis",
        label: "Кривошея (вынужденное положение головы)",
        type: "checkbox",
        points: 1
      },
      {
        id: "torsoInjury",
        label: "Существенное повреждение туловища",
        type: "checkbox",
        points: 1
      },
      {
        id: "predispose",
        label: "Предрасполагающее состояние (Down, Klippel-Feil, ахондроплазия, RA)",
        type: "checkbox",
        points: 1
      },
      {
        id: "diving",
        label: "Механизм: ныряние",
        type: "checkbox",
        points: 1
      },
      {
        id: "highMvc",
        label: "Высокоэнергетичный MVC (скорость >55 км/ч, выброс, смерть пассажира, роллover)",
        type: "checkbox",
        points: 1
      }
    ],
    bands: [
      {
        min: 0,
        max: 0,
        label: "0 факторов (очень низкий риск)",
        color: "#22C55E",
        description: "Чувствительность 98%, специфичность 26%. Визуализация не показана.",
        actions: [
          "Клиническое наблюдение",
          "Снятие воротника после клинического обследования"
        ]
      },
      {
        min: 1,
        max: 1,
        label: "1 фактор (низкий-промежуточный риск)",
        color: "#F59E0B",
        description: "Риск CSI ~1-2%. Рентген C-spine (AP, лат., odontoid), решение индивидуально.",
        actions: [
          "Рентген шейного отдела в 3 проекциях",
          "При сомнении - КТ"
        ]
      },
      {
        min: 2,
        max: 8,
        label: "≥2 факторов (высокий риск)",
        color: "#EF4444",
        description: "Риск клинически значимой CSI повышен. Показана визуализация.",
        details: "При множественных факторах риск CSI в разы выше. КТ C-spine более чувствительна; МРТ при неврологическом дефиците.",
        actions: [
          "Иммобилизация воротником",
          "КТ C-spine (или рентген при стабильном пациенте и 1 факторе)",
          "МРТ при очаговом дефиците / стойкой боли без находок на КТ",
          "Нейрохирург при переломе/подвывихе"
        ]
      }
    ],
    caveats: [
      "Правило валидировано у детей <16 лет с тупой травмой",
      "Чувствительность к клинически значимым CSI 98%, но специфичность низкая",
      "SCIWORA (Spinal Cord Injury Without Radiographic Abnormality) - актуальна у <8 лет, нужен МРТ",
      "Младенцы <3 лет плохо коммуницируют - расширенные показания к визуализации",
      "Не заменяет NEXUS и Canadian C-spine (для взрослых)"
    ],
    related: [
      {
        id: "pecarn-head",
        title: "PECARN head"
      },
      {
        id: "pgcs",
        title: "Pediatric GCS"
      },
      {
        id: "pecarn-chalice",
        title: "PECARN / CHALICE"
      }
    ],
    relatedCourses: [
      {
        id: "302.2",
        title: "Педиатрия раннего возраста"
      },
      {
        id: "300.4",
        title: "Неотложная помощь"
      }
    ],
    reference: "Leonard JC, Kuppermann N, Olsen C, et al. Factors associated with cervical spine injury in children after blunt trauma. Ann Emerg Med 2011;58:145-155.",
    countries: "Международный (PECARN)",
    presets: [
      {
        label: "Без факторов риска",
        values: {
          ams: false,
          focal: false,
          neckPain: false,
          torticollis: false,
          torsoInjury: false,
          predispose: false,
          diving: false,
          highMvc: false
        }
      },
      {
        label: "MVC + боль в шее",
        values: {
          ams: false,
          focal: false,
          neckPain: true,
          torticollis: false,
          torsoInjury: false,
          predispose: false,
          diving: false,
          highMvc: true
        }
      },
      {
        label: "Высокий риск (AMS + очаг.)",
        values: {
          ams: true,
          focal: true,
          neckPain: true,
          torticollis: false,
          torsoInjury: false,
          predispose: false,
          diving: false,
          highMvc: false
        }
      }
    ],
    info: "### Для чего используется\n**PECARN C-spine rule (Leonard 2011)** - инструмент для выявления детей с тупой травмой, у которых риск клинически значимой травмы шейного отдела позвоночника (CSI) достаточно низок, чтобы отказаться от визуализации.\n\n### 8 факторов риска\n1. Нарушение сознания (GCS <15, AVPU не «A»)\n2. Очаговый неврологический дефицит\n3. Боль в шее\n4. Кривошея\n5. Существенное повреждение туловища\n6. Предрасполагающее состояние (синдром Дауна, Klippel-Feil, ахондроплазия, ревматоидный артрит)\n7. Механизм: ныряние\n8. Высокоэнергетичный MVC\n\n### Интерпретация\n| Факторов | Риск CSI | Тактика |\n|---|---|---|\n| 0 | <1% | Без визуализации, клиническое наблюдение |\n| 1 | 1-2% | Рентген C-spine; индивидуально КТ |\n| ≥2 | Значительный | КТ C-spine, иммобилизация |\n\n### SCIWORA\nSpinal Cord Injury Without Radiographic Abnormality - у <8 лет частое явление (связки эластичнее). При неврологическом дефиците с нормальным рентгеном/КТ - обязательно МРТ.\n\n### Ограничения\n- Валидирован у <16 лет с тупой травмой\n- Не валидирован у младенцев <3 лет (сложная коммуникация)\n- NEXUS/Canadian C-spine - отдельные инструменты для взрослых\n\n### Тактика\n- **0 факторов**: снятие воротника после осмотра\n- **1 фактор**: рентген (AP, лат., odontoid)\n- **≥2 факторов**: КТ, иммобилизация\n- **Очаговый дефицит**: МРТ в дополнение к КТ"
  };

export default runner;
