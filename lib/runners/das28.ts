// @ts-nocheck
/**
 * Runner: das28
 * AUTO-GENERATED from lib/tools-runners.ts by scripts/split-runners.mjs.
 * Do not edit by hand — regenerate via `npm run split:runners`.
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
        id: "tjc",
        label: "Болезненные суставы (TJC, 0–28)",
        type: "number",
        min: 0,
        max: 28,
        step: 1,
        quickValues: [
          0,
          3,
          6,
          10,
          15,
          20
        ]
      },
      {
        id: "sjc",
        label: "Припухшие суставы (SJC, 0–28)",
        type: "number",
        min: 0,
        max: 28,
        step: 1,
        quickValues: [
          0,
          2,
          5,
          8,
          12,
          18
        ]
      },
      {
        id: "crp",
        label: "СРБ",
        type: "number",
        unit: "мг/л",
        min: 0,
        step: 0.1,
        quickValues: [
          2,
          5,
          10,
          20,
          40,
          80
        ]
      },
      {
        id: "gh",
        label: "Общая оценка пациента (VAS)",
        type: "number",
        unit: "0–100 мм",
        min: 0,
        max: 100,
        step: 1,
        quickValues: [
          10,
          30,
          50,
          70,
          90
        ]
      }
    ],
    compute: (v)=>{
            const tjc = Number(v.tjc), sjc = Number(v.sjc), crp = Math.max(Number(v.crp), 0.1), gh = Number(v.gh);
            const das = 0.56 * Math.sqrt(tjc) + 0.28 * Math.sqrt(sjc) + 0.36 * Math.log(crp + 1) + 0.014 * gh + 0.96;
            const value = das.toFixed(2);
            const common = {
                caveats: [
                    'В DAS28 не входят голеностопные и стопы — при их изолированном поражении активность занижается',
                    'Не отражает структурный прогресс — параллельно нужны УЗИ/МРТ и рентген',
                    'CRP может быть низким даже при активном РА (seronegative, фоновая терапия)',
                    'Boolean ACR/EULAR 2011 — более строгие критерии ремиссии, чем DAS28 < 2,6'
                ],
                scale: {
                    segments: [
                        {
                            min: 0,
                            max: 2.6,
                            label: 'Ремиссия',
                            color: '#10B981'
                        },
                        {
                            min: 2.6,
                            max: 3.2,
                            label: 'Низкая',
                            color: '#10B981'
                        },
                        {
                            min: 3.2,
                            max: 5.1,
                            label: 'Умеренная',
                            color: '#F59E0B'
                        },
                        {
                            min: 5.1,
                            max: 9,
                            label: 'Высокая',
                            color: '#EF4444'
                        }
                    ],
                    current: Number(value),
                    unit: 'DAS28-CRP'
                },
                relatedCourses: [
                    {
                        id: '301.8',
                        title: "Ревматология"
                    }
                ],
                related: [
                    {
                        id: 'basdai',
                        title: 'BASDAI'
                    },
                    {
                        id: 'phq9',
                        title: 'PHQ-9'
                    }
                ]
            };
            if (das < 2.6) return {
                value,
                unit: 'DAS28-CRP',
                interpretation: 'Ремиссия.',
                color: '#10B981',
                details: 'Клиническая ремиссия — цель терапии для большинства пациентов. Обычно требуется ≥ 6 мес стабильности перед обсуждением деэскалации.',
                actions: [
                    'Сохранить текущую схему, оценка каждые 3–6 мес',
                    'Обсудить постепенное снижение биологической/JAK-терапии при стабильной ремиссии > 6 мес',
                    'Контроль костной плотности, ССС-риска, вакцинация'
                ],
                ...common
            };
            if (das <= 3.2) return {
                value,
                unit: 'DAS28-CRP',
                interpretation: 'Низкая активность.',
                color: '#10B981',
                details: 'Низкая активность болезни — приемлемая цель у пациентов с длительным анамнезом или противопоказаниями к интенсификации.',
                actions: [
                    'Продолжить текущую схему; стремиться к ремиссии у активных/молодых',
                    'Переоценка через 3 мес',
                    'Проверка приверженности, УЗИ активных суставов при сомнениях'
                ],
                ...common
            };
            if (das <= 5.1) return {
                value,
                unit: 'DAS28-CRP',
                interpretation: 'Умеренная активность.',
                color: '#F59E0B',
                details: 'Умеренная активность. Продолжение текущей терапии без изменений ускоряет структурное повреждение — нужна интенсификация.',
                actions: [
                    'Оценить приверженность и дозы МТХ (до 25 мг/нед)',
                    'Добавить/поменять DMARD, добавить биологию (анти-ФНО, IL-6, ABT) или JAK-ингибитор',
                    'Внутрисуставные ГКС в активные суставы как мост',
                    'Переоценка через 3 мес (treat-to-target)'
                ],
                ...common
            };
            return {
                value,
                unit: 'DAS28-CRP',
                interpretation: 'Высокая активность. Усиление DMARD/биологии.',
                color: '#EF4444',
                details: 'Высокая активность — высокий риск быстрого структурного повреждения и внесуставных осложнений. Требуется немедленная интенсификация.',
                actions: [
                    'Немедленная интенсификация: биология (анти-ФНО, IL-6) или JAK-ингибитор',
                    'Bridging терапия преднизолоном коротким курсом',
                    'Скрининг до биологии: туберкулёз (IGRA), HBV/HCV, вакцинация',
                    'Переоценка через 3 мес; консилиум при неэффективности 2 биологий'
                ],
                ...common
            };
        },
    reference: "Wells G. Ann Rheum Dis 2009. DAS28-CRP формула.",
    info: "### Что измеряет\n**Disease Activity Score 28 (DAS28-CRP)** — оценка активности **ревматоидного артрита** на основе 28 суставов, СРБ и общей оценки пациента.\n\n### Формула\n`DAS28-CRP = 0,56·√TJC28 + 0,28·√SJC28 + 0,36·ln(CRP+1) + 0,014·VAS_GH + 0,96`\n\n### 28 оцениваемых суставов\n- 2 плечевых, 2 локтевых, 2 лучезапястных\n- 10 ПФ (II–V обеих рук)\n- 10 ПИФ (II–V обеих рук)\n- 2 коленных\n\n⚠️ В DAS28 **не входят** голеностопные и стопы — поэтому при изолированном поражении стоп DAS28 может занижать активность.\n\n### Интерпретация\n| DAS28-CRP | Активность |\n|---|---|\n| < 2,6 | Ремиссия |\n| 2,6–3,2 | Низкая |\n| 3,2–5,1 | Умеренная |\n| > 5,1 | Высокая |\n\n(Для DAS28-СОЭ пороги: < 2,6; ≤ 3,2; ≤ 5,1; > 5,1)\n\n### Целевая терапия (treat-to-target)\n- Цель: ремиссия (или низкая активность у длительных пациентов)\n- Оценка каждые 1–3 мес активной фазы\n- Если цель не достигнута за 3 мес — **усиление терапии** (DMARD комбинация / биологическая / JAK-ингибиторы)\n\n### Альтернативы\n| Шкала | Что включает | Применение |\n|---|---|---|\n| CDAI | TJC28 + SJC28 + VAS_pat + VAS_phys | Амбулаторный приём (без лаб.) |\n| SDAI | CDAI + CRP | Амбулаторный + лаб. |\n| RAPID3 | Самозаполняемая | Онлайн-мониторинг |\n| ACR20 / 50 / 70 | % улучшения критериев | RCT-оценка ответа |\n\n### Современные критерии ремиссии (ACR/EULAR 2011)\nBoolean-критерии — все ≤ 1: TJC, SJC, CRP, VAS_pat. Более строгие, чем DAS28 < 2,6.\n\n### Ограничения\n- Не учитывает структурный прогресс — параллельно используйте УЗИ/МРТ + рентген\n- CRP может быть низким у части пациентов даже при активном РА"
  };

export default runner;
