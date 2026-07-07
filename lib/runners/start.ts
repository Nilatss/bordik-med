/**
 * Runner: start
 * AUTO-GENERATED from lib/tools-runners.ts by scripts/split-runners.mjs.
 * Do not edit by hand - regenerate via `npm run split:runners`.
 *
 * Loaded lazily via dynamic import from lib/runners/index.ts so the
 * encyclopaedia of clinical content stays out of the main app bundle.
 */

import type {
  CalculatorTool,
  ToolInput,
  ScoreBand,
  Preset,
  CalculatorResult,
  ResultExtras,
  ResultScaleSegment,
} from '../tools-runners';

/**
 * START is a decision tree (RPM: Respiration / Perfusion / Mental status),
 * not an additive score — "can walk" alone decides Green regardless of
 * anything else, and any single abnormal vital decides Red regardless of
 * how many others are also abnormal. Summing independent points (the
 * generic score+bands engine used by most runners) made Green
 * mathematically unreachable: ambulatory's 3 points landed inside the
 * Red {1,3} range, and two simultaneously-abnormal vitals also summed to
 * a value indistinguishable from "walking wounded". Modelled as an
 * explicit compute() instead, mirroring the 4S-AF runner's "not summed"
 * pattern.
 */
const SEGMENTS: ResultScaleSegment[] = [
  { min: 0, max: 0, label: "Зелёный - Minor", color: "#22C55E" },
  { min: 1, max: 1, label: "Жёлтый - Delayed", color: "#FACC15" },
  { min: 2, max: 2, label: "Красный - Immediate", color: "#DC2626" },
  { min: 3, max: 3, label: "Чёрный - Deceased / Expectant", color: "#000000" },
];

const CAVEATS = [
  "START применяется ТОЛЬКО в MCI и массовых поражениях, не в обычной ER",
  "JumpSTART - педиатрический вариант (< 8 лет): 5 искусственных вдохов перед признанием «чёрным», ЧДД порог 15-45",
  "SALT - альтернативная модель (Sort/Assess/Lifesaving/Treatment/Transport), стандарт NDLS США",
  "Категория Expectant/Deceased - только в условиях непоколебимого недостатка ресурсов"
];

const RELATED = [
  { id: "esi", title: "ESI (обычная ER)" },
  { id: "gcs", title: "GCS" },
  { id: "mts", title: "MTS" }
];

const RELATED_COURSES = [
  { id: "300.4", title: "Неотложная помощь" }
];

function triageResult(
  severity: 0 | 1 | 2 | 3,
  label: string,
  description: string,
  extra?: { details?: string; actions?: (string | null | undefined)[] }
): CalculatorResult {
  const segment = SEGMENTS[severity]!;
  return {
    value: segment.label,
    interpretation: `${segment.label} · ${description}`,
    color: segment.color,
    details: extra?.details,
    actions: extra?.actions,
    caveats: CAVEATS,
    related: RELATED,
    relatedCourses: RELATED_COURSES,
    scale: { segments: SEGMENTS, current: severity },
  };
}

const runner: CalculatorTool = {
    kind: "calculator",
    inputs: [
      {
        id: "ambulatory",
        label: "Может ли пациент идти?",
        type: "select",
        options: [
          {
            value: "3",
            label: "Да - walking wounded (Minor / зелёный)"
          },
          {
            value: "0",
            label: "Нет / не оценено"
          }
        ]
      },
      {
        id: "breathing",
        label: "Дыхание",
        type: "select",
        options: [
          {
            value: "0",
            label: "Норма (10-30/мин у взрослого)"
          },
          {
            value: "1",
            label: "ЧДД >30 или <10 - Immediate"
          },
          {
            value: "4",
            label: "Нет даже после открытия ДП - Deceased / Expectant"
          }
        ]
      },
      {
        id: "perfusion",
        label: "Перфузия (радиальный пульс / КСН)",
        type: "select",
        options: [
          {
            value: "0",
            label: "Радиальный пульс есть, CRT <2 с"
          },
          {
            value: "1",
            label: "Радиального нет / CRT >2 с - Immediate"
          }
        ]
      },
      {
        id: "mental",
        label: "Сознание",
        type: "select",
        options: [
          {
            value: "0",
            label: "Выполняет простые команды"
          },
          {
            value: "1",
            label: "Не выполняет команды - Immediate"
          }
        ]
      },
      {
        id: "minor_override",
        label: "Тяжёлая рана/ожог у walking wounded?",
        type: "select",
        options: [
          {
            value: "0",
            label: "Нет - остаётся Minor"
          },
          {
            value: "-1",
            label: "Да - пересортировать в Delayed"
          }
        ]
      }
    ],
    compute: (v) => {
      const ambulatory = String(v.ambulatory ?? '0');
      const override = String(v.minor_override ?? '0');
      const breathing = String(v.breathing ?? '0');
      const perfusion = String(v.perfusion ?? '0');
      const mental = String(v.mental ?? '0');

      // 1. Can the patient walk? Walking wounded is Green — unless a
      // severe wound/burn re-sorts them to Delayed — regardless of the
      // other three fields (real triage never even assesses them).
      if (ambulatory === '3') {
        if (override === '-1') {
          return triageResult(1, 'Жёлтый - Delayed',
            'Тяжёлая рана/ожог у walking wounded - пересортирован в Delayed.');
        }
        return triageResult(0, 'Зелёный - Minor (walking wounded)',
          'Способен идти самостоятельно. Лёгкие травмы.', {
            actions: [
              'Переместить в «зелёную» зону сбора',
              'Периодическая переоценка',
              'Лечение после Immediate/Delayed'
            ],
          });
      }

      // 2. Breathing.
      if (breathing === '4') {
        return triageResult(3, 'Чёрный - Deceased / Expectant',
          'Апноэ после открытия ДП; ресурсы не тратятся в условиях MCI.', {
            details: 'В условиях массового поражения (MCI) ресурсы направляются к пациентам с наибольшей вероятностью выживания. Expectant - травмы, несовместимые с жизнью в данных условиях.',
            actions: [
              'Переместить в отведённую зону',
              'При изменении ситуации (стабилизация обстановки) - возможна переоценка',
              'Документация времени и причины'
            ],
          });
      }
      const immediateDetails = 'ЧДД >30 или <10, нет радиального пульса, CRT >2 с или не выполняет команды - все это Immediate. Эвакуация приоритетная.';
      const immediateActions = [
        'Быстрые жизнеспасающие манипуляции: открыть ДП, остановить кровотечение жгутом',
        'Первая эвакуация',
        'Повторная оценка при первой возможности'
      ];
      if (breathing === '1') {
        return triageResult(2, 'Красный - Immediate',
          'Требует немедленной помощи для сохранения жизни.',
          { details: immediateDetails, actions: immediateActions });
      }

      // 3. Perfusion.
      if (perfusion === '1') {
        return triageResult(2, 'Красный - Immediate',
          'Требует немедленной помощи для сохранения жизни.',
          { details: immediateDetails, actions: immediateActions });
      }

      // 4. Mental status.
      if (mental === '1') {
        return triageResult(2, 'Красный - Immediate',
          'Требует немедленной помощи для сохранения жизни.',
          { details: immediateDetails, actions: immediateActions });
      }

      // 5. Everything normal but unable to walk — stable, needs treatment.
      return triageResult(1, 'Жёлтый - Delayed',
        'Стабилен, но требует лечения. Эвакуация после Immediate.');
    },
    reference: "Super G, Groth S, Hook R. START: Simple Triage and Rapid Treatment. Newport Beach Fire Dept / Hoag Hospital, 1983. SALT Triage: Lerner EB et al. Disaster Med Public Health Prep 2008.",
    countries: "Международный",
    presets: [
      {
        label: "Walking wounded",
        values: {
          ambulatory: "3",
          breathing: "0",
          perfusion: "0",
          mental: "0",
          minor_override: "0"
        }
      },
      {
        label: "ЧДД 35, нет пульса",
        values: {
          ambulatory: "0",
          breathing: "1",
          perfusion: "1",
          mental: "0",
          minor_override: "0"
        }
      },
      {
        label: "Апноэ после открытия ДП",
        values: {
          ambulatory: "0",
          breathing: "4",
          perfusion: "0",
          mental: "0",
          minor_override: "0"
        }
      }
    ],
    info: "### Для чего используется\n**START (Simple Triage And Rapid Treatment)** - система сортировки при **MCI** (massive casualty incident). Цель - за ≤ 60 секунд на пострадавшего распределить ресурсы по принципу «наибольшее благо наибольшему числу».\n\n### Алгоритм RPM (30-2-Can Do)\n1. **Walk?** - «идите сюда» → зелёный (Minor)\n2. **Respirations**\n   - Нет → открыть ДП\n     - Нет дыхания → **Чёрный / Expectant**\n     - Появилось → **Красный / Immediate**\n   - >30 или <10 → **Красный**\n3. **Perfusion** - радиальный пульс / CRT >2 с → **Красный**\n4. **Mental status** - не выполняет команды → **Красный**\n5. Иначе - **Жёлтый / Delayed**\n\n### Категории и цвета\n| Цвет | Категория | Приоритет |\n|---|---|---|\n| Красный | Immediate | 1 |\n| Жёлтый | Delayed | 2 |\n| Зелёный | Minor (walking wounded) | 3 |\n| Чёрный | Deceased / Expectant | Не эвакуируется первым |\n\n### JumpSTART (дети <8 лет или <45 кг)\n- При апноэ - 5 искусственных вдохов; если начинает дышать → **Красный**, иначе **Чёрный**\n- ЧДД: <15 или >45 → **Красный**\n- Перфузия: только пальпируемый пульс\n- Ментальный: AVPU - P (реагирует на боль неадекватно) или U → **Красный**\n\n### SALT Triage (альтернатива, US NDLS)\n1. **Sort** глобально: идти → минор; махнуть/выполнять команды → delayed; не двигаются → immediate assess\n2. **Assess** индивидуально\n3. **Lifesaving interventions**: открыть ДП, остановить кровотечение, декомпрессия тензионного пневмоторакса, автоинжектор\n4. **Treatment / Transport**\n\n### Ограничения\n- Жизнеспасающие интервенции минимальны (не начинать CPR при MCI!)\n- Субъективность «walking wounded» при травмах ног\n- Требует частых переоценок\n\n### Тактика\n- **Красный**: первая эвакуация в ближайший trauma center\n- **Жёлтый**: вторая волна эвакуации\n- **Зелёный**: самостоятельно в сборный пункт\n- **Чёрный**: зона морга; переоценка только при изменении ресурсов"
  };

export default runner;
