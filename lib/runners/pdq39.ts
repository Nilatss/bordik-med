// @ts-nocheck
/**
 * Runner: pdq39
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
        id: "mobility",
        label: "Мобильность (10 пунктов × 0-4, итого 0-40)",
        type: "number",
        min: 0,
        max: 40,
        step: 1,
        quickValues: [
          0,
          10,
          20,
          30,
          40
        ]
      },
      {
        id: "adl",
        label: "ADL (6 × 0-4, 0-24)",
        type: "number",
        min: 0,
        max: 24,
        step: 1,
        quickValues: [
          0,
          6,
          12,
          18,
          24
        ]
      },
      {
        id: "emotional",
        label: "Эмоции (6 × 0-4, 0-24)",
        type: "number",
        min: 0,
        max: 24,
        step: 1,
        quickValues: [
          0,
          6,
          12,
          18,
          24
        ]
      },
      {
        id: "stigma",
        label: "Стигма (4 × 0-4, 0-16)",
        type: "number",
        min: 0,
        max: 16,
        step: 1,
        quickValues: [
          0,
          4,
          8,
          12,
          16
        ]
      },
      {
        id: "social",
        label: "Социальная поддержка (3 × 0-4, 0-12)",
        type: "number",
        min: 0,
        max: 12,
        step: 1,
        quickValues: [
          0,
          3,
          6,
          9,
          12
        ]
      },
      {
        id: "cognition",
        label: "Когниции (4 × 0-4, 0-16)",
        type: "number",
        min: 0,
        max: 16,
        step: 1,
        quickValues: [
          0,
          4,
          8,
          12,
          16
        ]
      },
      {
        id: "communication",
        label: "Коммуникация (3 × 0-4, 0-12)",
        type: "number",
        min: 0,
        max: 12,
        step: 1,
        quickValues: [
          0,
          3,
          6,
          9,
          12
        ]
      },
      {
        id: "bodily",
        label: "Телесный дискомфорт (3 × 0-4, 0-12)",
        type: "number",
        min: 0,
        max: 12,
        step: 1,
        quickValues: [
          0,
          3,
          6,
          9,
          12
        ]
      }
    ],
    compute: (v)=>{
            const raw = {
                mobility: Number(v.mobility) || 0,
                adl: Number(v.adl) || 0,
                emotional: Number(v.emotional) || 0,
                stigma: Number(v.stigma) || 0,
                social: Number(v.social) || 0,
                cognition: Number(v.cognition) || 0,
                communication: Number(v.communication) || 0,
                bodily: Number(v.bodily) || 0
            };
            const maxes = {
                mobility: 40,
                adl: 24,
                emotional: 24,
                stigma: 16,
                social: 12,
                cognition: 16,
                communication: 12,
                bodily: 12
            };
            // Transform each subscale to 0-100
            const scaled = {};
            for (const k of Object.keys(raw)){
                scaled[k] = raw[k] / maxes[k] * 100;
            }
            // Summary Index (PDQ-39 SI) = average of 8 subscale scores
            const si = Object.values(scaled).reduce((a, b)=>a + b, 0) / 8;
            let interpretation = '', color = '', details = '', actions = [];
            if (si < 20) {
                interpretation = 'Хорошее качество жизни';
                color = '#22C55E';
                details = 'Незначительное влияние PD на качество жизни.';
                actions = [
                    'Продолжить текущую терапию, поддерживающие вмешательства',
                    'Физ. активность, когнитивная стимуляция'
                ];
            } else if (si < 40) {
                interpretation = 'Умеренное снижение КЖ';
                color = '#F59E0B';
                details = 'Умеренное влияние. Обратить внимание на наиболее проблемные домены.';
                actions = [
                    'Таргетная реабилитация (LSVT-BIG/LOUD при мобильности/речи)',
                    'СИОЗС при эмоциональном ухудшении',
                    'Группы поддержки (стигма, социальная поддержка)'
                ];
            } else {
                interpretation = 'Выраженное снижение КЖ';
                color = '#EF4444';
                details = 'Значительное влияние на повседневную жизнь и благополучие.';
                actions = [
                    'Мультидисциплинарный подход',
                    'Оптимизация моторной терапии (DBS, помпы)',
                    'Лечение немоторных симптомов (депрессия, сон, боль)',
                    'Психосоциальная поддержка, опекун'
                ];
            }
            return {
                value: si.toFixed(1),
                unit: 'PDQ-39 SI (0-100)',
                interpretation,
                color,
                details,
                actions,
                differential: Object.keys(scaled).map((k)=>({
                        term: k,
                        desc: `${scaled[k].toFixed(0)}/100 (сырой ${raw[k]}/${maxes[k]})`
                    })),
                caveats: [
                    'Higher = worse: PDQ-39 SI 0 - идеально, 100 - худшее состояние',
                    'Каждый домен трансформируется в 0-100 перед усреднением',
                    'PDQ-8 - короткая версия (по 1 пункту от каждого домена)',
                    'Заполняется пациентом (последние 4 недели)'
                ],
                scale: {
                    segments: [
                        {
                            min: 0,
                            max: 20,
                            label: 'Хорошее',
                            color: '#22C55E'
                        },
                        {
                            min: 20,
                            max: 40,
                            label: 'Умеренное',
                            color: '#F59E0B'
                        },
                        {
                            min: 40,
                            max: 101,
                            label: 'Выраженное',
                            color: '#EF4444'
                        }
                    ],
                    current: Number(si.toFixed(1)),
                    unit: 'PDQ-39 SI'
                },
                related: [
                    {
                        id: 'hoehn',
                        title: 'Hoehn-Yahr'
                    },
                    {
                        id: 'updrs',
                        title: 'MDS-UPDRS'
                    },
                    {
                        id: 'schwab',
                        title: 'Schwab-England'
                    }
                ],
                relatedCourses: [
                    {
                        id: '201.3',
                        title: 'Нейрофизиология'
                    }
                ]
            };
        },
    reference: "Peto V, Jenkinson C, Fitzpatrick R, Greenhall R. The development and validation of a short measure of functioning and well being for individuals with Parkinson’s disease. Qual Life Res 1995;4:241-248.",
    info: "### Для чего используется\n**PDQ-39 (Parkinson's Disease Questionnaire, Peto 1995)** - **оценка качества жизни** при PD по 39 пунктам / 8 доменам. Заполняется пациентом.\n\n### Домены (8) и максимальные сырые баллы\n| Домен | Пункты | Макс |\n|---|---|---|\n| Мобильность | 10 | 40 |\n| ADL | 6 | 24 |\n| Эмоции | 6 | 24 |\n| Стигма | 4 | 16 |\n| Социальная поддержка | 3 | 12 |\n| Когниции | 4 | 16 |\n| Коммуникация | 3 | 12 |\n| Телесный дискомфорт | 3 | 12 |\n\n### Формула\nКаждый домен: (сырой / макс) × 100 → 0-100.\n**PDQ-39 SI = среднее 8 субшкал**.\nHigher = worse QoL.\n\n### Интерпретация (ориентировочно)\n| SI | Значение |\n|---|---|\n| < 20 | Хорошее КЖ |\n| 20-40 | Умеренное снижение |\n| > 40 | Выраженное снижение |\n\n### Применение\n- Оценка эффекта терапии (DBS, помпы, леводопа)\n- Клинические исследования\n- Пациент-ориентированный исход\n\n### Версии\n- **PDQ-39** - оригинал, 39 пунктов\n- **PDQ-8** - короткая версия, 8 пунктов (по 1 от домена)\n\n### Ограничения\n- Self-report - зависит от когнитивной сохранности\n- Период оценки - последние 4 недели\n- Не отражает флуктуации\n\n### Тактика\n- < 20: поддержка\n- 20-40: таргетные вмешательства по худшим доменам\n- > 40: мультидисциплинарный подход\n\n### Источник\nPeto V et al. **PDQ-39: short measure of functioning and well being for individuals with PD.** *Qual Life Res* 1995;4:241-248."
  };

export default runner;
