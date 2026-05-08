/**
 * Runner: aa-gradient — Alveolar-arterial (A-a) Oxygen Gradient
 *
 * P1-CR-10 — Formula source attribution:
 *   PRIMARY:    Alveolar gas equation (Riley, 1949):
 *               PAO2 = FiO2 × (Patm - PH2O) - (PaCO2 / R)
 *   STANDARD:   ATS / ERS Diagnostic Tests Standardisation —
 *               A-a gradient как baseline для evaluating diffusion
 *               impairment, V/Q mismatch, shunt physiology.
 *
 * Formulas:
 *   PAO2 = FiO2 × (Patm - PH2O) - (PaCO2 / R)
 *        = 0.21 × (760 - 47) - (PaCO2 / 0.8)        — на room air, sea level
 *        = 150 - 1.25 × PaCO2                        — упрощённый bedside
 *
 *   A-a gradient = PAO2 - PaO2
 *
 * Где:
 *   Patm  = atmospheric pressure (760 mmHg sea level)
 *   PH2O  = water vapour pressure (47 mmHg @ 37°C)
 *   FiO2  = fraction inspired O2 (0.21 room air, 1.0 100% O2 mask)
 *   R     = respiratory exchange ratio ≈ 0.8 (typical diet)
 *   PaO2/PaCO2 — arterial blood gas values
 *
 * Normal expected gradient (adult, room air):
 *   Age-adjusted normal: (Age/4) + 4
 *     20 yr → ~9 mmHg
 *     40 yr → ~14 mmHg
 *     60 yr → ~19 mmHg
 *     80 yr → ~24 mmHg
 *
 * Elevated → causes (5 categories of hypoxaemia):
 *   - V/Q mismatch (PE, COPD exacerbation, asthma)
 *   - Right-to-left shunt (intracardiac, pulmonary AVM, ARDS)
 *   - Diffusion impairment (interstitial lung disease)
 *   - Высокий FiO2 toxicity (>50% over hours-days)
 *
 * Normal at altitude:
 *   Patm уменьшается ~25 mmHg per 1000 ft. Расчёт компенсирует
 *   через input "atmospheric pressure" если runner поддерживает.
 *
 * Caveats:
 *   - На supplemental O2 (FiO2 > 0.21) gradient может быть нормально
 *     elevated — не overinterpret
 *   - PaO2/FiO2 ratio (P/F ratio) проще для ARDS staging по Berlin Definition
 *
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
        id: "fio2",
        hint: 'FiO₂ = доля O₂ во вдыхаемом воздухе (0.21 = атмосферный)',
        label: "FiO₂",
        type: "number",
        unit: "%",
        min: 21,
        max: 100,
        step: 1,
        quickValues: [
          21,
          24,
          28,
          40,
          60,
          100
        ]
      },
      {
        id: "paco2",
        hint: 'PaCO₂. Норма: 35-45 мм рт.ст.',
        label: "PaCO₂",
        type: "number",
        unit: "мм рт.ст.",
        min: 10,
        max: 100,
        step: 0.1,
        quickValues: [
          30,
          35,
          40,
          45,
          55,
          70
        ]
      },
      {
        id: "pao2",
        hint: 'PaO₂. Норма: 80-100 мм рт.ст.',
        label: "PaO₂",
        type: "number",
        unit: "мм рт.ст.",
        min: 20,
        max: 700,
        step: 0.1,
        quickValues: [
          50,
          60,
          70,
          85,
          95,
          120
        ]
      },
      {
        id: "age",
        hint: 'Возраст в годах',
        label: "Возраст",
        type: "number",
        unit: "лет",
        min: 0,
        max: 120,
        quickValues: [
          20,
          40,
          60,
          80
        ]
      }
    ],
    compute: (v)=>{
            const fio2 = Number(v.fio2) / 100;
            const paco2 = Number(v.paco2), pao2 = Number(v.pao2), age = Number(v.age);
            const pAO2 = fio2 * (760 - 47) - paco2 / 0.8;
            const gradient = pAO2 - pao2;
            const expected = age / 4 + 4;
            let interpretation = '', color = '#1A1A1A';
            let details = '';
            let actions = [];
            if (gradient <= expected) {
                interpretation = `В норме (ожидаемый ≤${expected.toFixed(0)})`;
                color = '#22C55E';
                details = 'Нормальный A-a градиент при гипоксемии указывает на гиповентиляцию или низкий FiO₂ (высокогорье). Альвеолярно-капиллярный барьер и V/Q интактны - кислород просто не поступает в альвеолы в достаточном количестве.';
                actions = [
                    'Если PaCO₂ повышен - гиповентиляция: оценить ЦНС-депрессанты (опиоиды, бензодиазепины), нервно-мышечные причины, ОНМК ствола, гипотиреоз тяжёлый, ожирение-гиповентиляция',
                    'Если PaCO₂ нормальный - проверить FiO₂ окружения (высокогорье, аппаратная ошибка)',
                    'Поддержка вентиляции (BiPAP, интубация) при прогрессирующей гиперкапнии'
                ];
            } else {
                interpretation = `Повышен - нарушение диффузии/V/Q (ожид. ≤${expected.toFixed(0)})`;
                color = '#EF4444';
                details = 'Повышенный A-a градиент означает, что альвеолярный O₂ не достигает артериальной крови. Четыре механизма: V/Q mismatch (ХОБЛ, астма, пневмония, ТЭЛА), шунт (ОРДС, ВПС, ателектаз), нарушение диффузии (ИЛФ, отёк), снижение смешанной венозной O₂.';
                actions = [
                    'Тест с 100 % O₂: если PaO₂ повышается → V/Q; если нет → шунт (ОРДС, ВПС)',
                    'ТЭЛА: срочно D-димер, КТ-ангиография, Wells (особенно при внезапной гипоксемии + нормальной рентгенограмме)',
                    'Рентген/КТ грудной клетки: пневмония, отёк лёгких, фиброз, ателектаз',
                    'ЭхоКГ при подозрении на шунт или правожелудочковую перегрузку',
                    'Коррекция первопричины + O₂-терапия; при ОРДС - протективная ИВЛ (6 мл/кг IBW, PEEP)'
                ];
            }
            return {
                value: gradient.toFixed(1),
                unit: 'мм рт.ст.',
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'Ожидаемый A-a растёт с возрастом (Возраст/4 + 4) и с FiO₂ - на 100% O₂ норма до 100 мм рт.ст.',
                    'Формула валидна на уровне моря (P_atm 760); на высоте пересчитывать атмосферное давление',
                    'При FiO₂ > 21% RQ = 0,8 уже неточен - использовать осторожно',
                    'Не путать с PaO₂/FiO₂ (индекс оксигенации) - он не возраст-зависим'
                ],
                scale: {
                    segments: [
                        {
                            min: 0,
                            max: expected,
                            label: 'Норма',
                            color: '#22C55E'
                        },
                        {
                            min: expected,
                            max: expected + 15,
                            label: 'Умеренно ↑',
                            color: '#F59E0B'
                        },
                        {
                            min: expected + 15,
                            max: 100,
                            label: 'Значительно ↑',
                            color: '#EF4444'
                        }
                    ],
                    current: Number(gradient.toFixed(1)),
                    unit: 'мм рт.ст.'
                },
                relatedCourses: [
                    {
                        id: '201.2',
                        title: "Дыхательная физиология"
                    },
                    {
                        id: '301.2',
                        title: "Пульмонология"
                    }
                ],
                related: [
                    {
                        id: 'pf-ratio',
                        title: 'PaO₂/FiO₂ (индекс оксигенации)'
                    },
                    {
                        id: 'wells-pe',
                        title: 'Wells (ТЭЛА)'
                    }
                ]
            };
        },
    reference: "A-a = [FiO₂ × (760−47)] − PaCO₂/0.8 − PaO₂. Ожидаемый A-a = (Возраст/4) + 4.",
    presets: [
      {
        label: "Норма у молодого",
        values: {
          fio2: 21,
          paco2: 40,
          pao2: 95,
          age: 30
        }
      },
      {
        label: "ХОБЛ (V/Q mismatch)",
        values: {
          fio2: 21,
          paco2: 55,
          pao2: 55,
          age: 65
        }
      },
      {
        label: "ТЭЛА",
        values: {
          fio2: 21,
          paco2: 32,
          pao2: 60,
          age: 55
        }
      },
      {
        label: "Гиповентиляция (норм. A-a)",
        values: {
          fio2: 21,
          paco2: 70,
          pao2: 60,
          age: 50
        }
      }
    ],
    info: "### Для чего используется\n**Альвеоло-артериальный градиент по кислороду (A-a gradient)** - разница между альвеолярным (расчётным) и артериальным (измеренным) парциальным давлением кислорода. Ключевой параметр для **дифференциальной диагностики гипоксемии**.\n\n### Уравнение альвеолярного газа\n`P_AO₂ = FiO₂ × (P_atm − P_H₂O) − PaCO₂ / RQ`\n\nУпрощённо на уровне моря (P_atm = 760, P_H₂O = 47, RQ = 0,8):\n`P_AO₂ = FiO₂ × 713 − PaCO₂ / 0,8`\n\n`A-a = P_AO₂ − PaO₂`\n\n### Норма A-a (возраст-зависимая)\n`Ожидаемый A-a ≈ возраст/4 + 4`\n\n| Возраст | Норма |\n|---|---|\n| 20 лет | ≤ 9 мм рт.ст. |\n| 40 лет | ≤ 14 |\n| 60 лет | ≤ 19 |\n| 80 лет | ≤ 24 |\n\nАльтернативная формула: **(возраст + 10) / 4**.\n\n### Причины гипоксемии - по A-a\n| Механизм | A-a | Примеры |\n|---|---|---|\n| **Гиповентиляция** | **Норма** | Опиоиды, нервно-мышечные, ОНМК ствола, гипотиреоз тяжёлый |\n| **Низкий FiO₂** | Норма | Высокогорье, аварии аппаратуры |\n| **V/Q mismatch** | ↑ | ХОБЛ, астма, пневмония, ТЭЛА |\n| **Шунт** | ↑ (не корригируется 100 % O₂) | ОРДС, внутрилёгочный шунт, ВПС справа-налево, ателектаз |\n| **Нарушение диффузии** | ↑ | ИЛФ, эмфизема, пневмонит, отёк |\n\n### Алгоритм при гипоксемии\n| Шаг | Действие | Решение |\n|---|---|---|\n| 1 | Измерить A-a | - |\n| 2 | A-a в норме | Гиповентиляция или ↓ FiO₂ |\n| 3 | A-a повышен | V/Q mismatch, шунт, диффузия |\n| 4 | Проба 100 % O₂ × 15 мин | PaO₂ ≥ 500 → V/Q; PaO₂ < 500 → шунт |\n\n### Пример расчёта\nПациент 50 лет, комнатный воздух, PaO₂ = 70, PaCO₂ = 40:\n\n| Шаг | Расчёт | Результат |\n|---|---|---|\n| P_AO₂ | 0,21 × 713 − 40/0,8 | 100 мм рт.ст. |\n| A-a фактический | 100 − 70 | 30 мм рт.ст. |\n| Ожидаемый A-a | 50/4 + 4 | 16,5 мм рт.ст. |\n| Вывод | A-a повышен | Патология газообмена (V/Q / шунт / диффузия) |\n\n### На высоте / в самолётах\nНа высоте (например, 2500 м, P_atm ~ 564) формула меняется:\n`P_AO₂ = FiO₂ × (P_atm − 47) − PaCO₂/0,8`\n\nНормальный A-a остаётся таким же возраст-зависимым.\n\n### Ограничения\n| Ограничение | Детали |\n|---|---|\n| Требует ABG | Нужен забор артериальной крови |\n| RQ = 0,8 допущение | При высокобелковой диете / голодании может отличаться |\n| Высокий FiO₂ (> 60 %) | Норма A-a выше |\n| Интубированные с тяжёлой гипоксемией | Удобнее P/F ratio (PaO₂/FiO₂) |"
  };

export default runner;
