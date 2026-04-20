// @ts-nocheck
/**
 * Runner: basdai
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

const runner: CalculatorTool = {
    kind: "calculator",
    inputs: [
      {
        id: "q1",
        label: "1. Усталость",
        type: "number",
        unit: "0-10",
        min: 0,
        max: 10,
        step: 0.1,
        quickValues: [
          0,
          2,
          4,
          6,
          8,
          10
        ]
      },
      {
        id: "q2",
        label: "2. Боль в шее/спине/тазобедрен.",
        type: "number",
        unit: "0-10",
        min: 0,
        max: 10,
        step: 0.1,
        quickValues: [
          0,
          2,
          4,
          6,
          8,
          10
        ]
      },
      {
        id: "q3",
        label: "3. Боль/припухлость суставов",
        type: "number",
        unit: "0-10",
        min: 0,
        max: 10,
        step: 0.1,
        quickValues: [
          0,
          2,
          4,
          6,
          8,
          10
        ]
      },
      {
        id: "q4",
        label: "4. Дискомфорт при прикосновении",
        type: "number",
        unit: "0-10",
        min: 0,
        max: 10,
        step: 0.1,
        quickValues: [
          0,
          2,
          4,
          6,
          8,
          10
        ]
      },
      {
        id: "q5",
        label: "5. Утренняя скованность (выраж.)",
        type: "number",
        unit: "0-10",
        min: 0,
        max: 10,
        step: 0.1,
        quickValues: [
          0,
          2,
          4,
          6,
          8,
          10
        ]
      },
      {
        id: "q6",
        label: "6. Утренняя скованность (длит.)",
        type: "number",
        unit: "0-10",
        min: 0,
        max: 10,
        step: 0.1,
        hint: "0=нет, 5=1 ч, 10=≥2 ч",
        quickValues: [
          0,
          2,
          4,
          6,
          8,
          10
        ]
      }
    ],
    compute: (v)=>{
            const a = Number(v.q1), b = Number(v.q2), c = Number(v.q3), d = Number(v.q4);
            const e = (Number(v.q5) + Number(v.q6)) / 2;
            const score = (a + b + c + d + e) / 5;
            const value = score.toFixed(2);
            const common = {
                caveats: [
                    'Субъективен - зависит от настроения, фоновой боли, фибромиалгии',
                    'Не отличает воспалительную боль от структурного повреждения',
                    'Не учитывает экстра-аксиальные проявления (увеит, ВЗК, псориаз, энтезит)',
                    'ASDAS-CRP - более современный объективный критерий'
                ],
                scale: {
                    segments: [
                        {
                            min: 0,
                            max: 4,
                            label: 'Низкая',
                            color: '#10B981'
                        },
                        {
                            min: 4,
                            max: 10,
                            label: 'Активная',
                            color: '#EF4444'
                        }
                    ],
                    current: Number(value),
                    unit: 'BASDAI'
                },
                relatedCourses: [
                    {
                        id: '301.8',
                        title: "Ревматология"
                    }
                ],
                related: [
                    {
                        id: 'das28',
                        title: 'DAS28 (РА)'
                    },
                    {
                        id: 'phq9',
                        title: 'PHQ-9'
                    }
                ]
            };
            if (score < 4) return {
                value,
                unit: 'BASDAI',
                interpretation: 'Низкая активность (< 4).',
                color: '#10B981',
                details: 'Низкая активность аксиального спондилоартрита. Продолжение текущей терапии, акцент на физическую активность и постуральные упражнения.',
                actions: [
                    'Продолжить НПВС по потребности + регулярная ЛФК (специфичная при АС)',
                    'Скрининг сопутствующих: увеит, ВЗК, псориаз, остеопороз',
                    'Оценка каждые 3-6 мес (BASDAI + ASDAS + CRP)'
                ],
                ...common
            };
            return {
                value,
                unit: 'BASDAI',
                interpretation: '≥ 4 - активная болезнь. Рассмотреть биологическую терапию (анти-ФНО / IL-17).',
                color: '#EF4444',
                details: 'Активный АС. При неэффективности ≥ 2 НПВС в максимальных дозах ≥ 4 нед + объективных признаках воспаления (СРБ, МРТ-сакроилеит) показана биологическая терапия.',
                actions: [
                    'Подтвердить неэффективность ≥ 2 НПВС в макс. дозах ≥ 4 нед',
                    'Скрининг до биологии: ТБ (IGRA), HBV/HCV, вакцинация',
                    'Анти-ФНО (адалимумаб, этанерцепт) или анти-IL-17 (секукинумаб) - первой линии; при ВЗК предпочтительны анти-ФНО (моноклональные)',
                    'ЛФК, постуральные упражнения, отказ от курения (ускоряет прогрессирование)',
                    'Переоценка через 12 нед (ΔBASDAI ≥ 2 - ответ)'
                ],
                ...common
            };
        },
    reference: "Garrett S. J Rheumatol 1994. BASDAI.",
    info: "### Что измеряет\n**Bath Ankylosing Spondylitis Disease Activity Index (BASDAI)** - самозаполняемый опросник для оценки активности **аксиального спондилоартрита** (анкилозирующего спондилита).\n\n### 6 вопросов (VAS 0-10)\n1. Усталость\n2. Боль в шее, спине, тазобедренных\n3. Боль/припухлость периферических суставов\n4. Дискомфорт при прикосновении / надавливании\n5. Утренняя скованность - выраженность\n6. Утренняя скованность - длительность (0=нет, 5=1 ч, 10=≥2 ч)\n\n### Формула\n`BASDAI = (Q1 + Q2 + Q3 + Q4 + (Q5+Q6)/2) / 5`\n\n### Интерпретация\n- **< 4** - низкая активность\n- **≥ 4** - активная болезнь; рассмотреть биологическую терапию\n\n### Биологическая терапия в АС\n**Условия для начала анти-ФНО / анти-IL-17**:\n- BASDAI ≥ 4 + ASDAS ≥ 2,1\n- Неэффективность ≥ 2 НПВС в максимальных дозах ≥ 4 нед\n- ВРВ + объективные признаки воспаления (СРБ, МРТ-сакроилеит)\n\n**Препараты**:\n- Анти-ФНО: адалимумаб, этанерцепт, инфликсимаб, голимумаб, цертолизумаб\n- Анти-IL-17: секукинумаб, иксекизумаб\n- JAK-ингибиторы: упадацитиниб, тофацитиниб\n\n### ASDAS (более современный)\n**Ankylosing Spondylitis Disease Activity Score** - включает СРБ:\n- ASDAS-CRP < 1,3 - неактивная\n- 1,3-2,1 - умеренная\n- 2,1-3,5 - высокая\n- > 3,5 - очень высокая\n\n### Связанные шкалы\n| Шкала | Что оценивает | Диапазон |\n|---|---|---|\n| BASFI | Функция | 0-10 |\n| BASMI | Подвижность позвоночника | 0-10 |\n| mSASSS | Рентгенологический прогресс | 0-72 |\n\n### Ограничения\n- Субъективный (зависит от настроения, фоновых болей)\n- Не отличает воспалительную боль от структурного повреждения\n- Не учитывает экстра-аксиальные проявления (увеит, ВЗК, псориаз)"
  };

export default runner;
