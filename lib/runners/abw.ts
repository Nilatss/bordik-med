// @ts-nocheck
/**
 * Runner: abw
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
        id: "actualWeight",
        label: "Фактическая масса",
        type: "number",
        unit: "кг",
        min: 30,
        max: 300,
        step: 0.1,
        quickValues: [
          70,
          90,
          110,
          130,
          150
        ]
      },
      {
        id: "height",
        label: "Рост",
        type: "number",
        unit: "см",
        min: 130,
        max: 220,
        step: 0.1,
        quickValues: [
          155,
          160,
          165,
          170,
          175,
          180,
          185
        ]
      },
      {
        id: "female",
        label: "Женский пол",
        type: "checkbox"
      }
    ],
    compute: (v)=>{
            const tbw = Number(v.actualWeight);
            const cm = Number(v.height);
            const inchesAbove5ft = Math.max(0, (cm - 152.4) / 2.54);
            const female = v.female === true;
            // Devine IBW
            const ibw = (female ? 45.5 : 50) + 2.3 * inchesAbove5ft;
            const abw = ibw + 0.4 * (tbw - ibw);
            const ratio = tbw / ibw;
            let interpretation = '', color = '#1A1A1A';
            let details = '';
            let actions = [];
            if (ratio < 1.2) {
                interpretation = 'ABW не требуется';
                color = '#22C55E';
                details = `Фактическая масса (${tbw.toFixed(1)} кг) ≤ 120% от IBW (${ibw.toFixed(1)} кг). Дозировать препараты по фактической массе или IBW — ABW неоправдана.`;
            } else if (ratio < 1.5) {
                interpretation = 'Умеренное ожирение — ABW применима';
                color = '#F59E0B';
                details = `TBW ${(ratio * 100).toFixed(0)}% от IBW. Для аминогликозидов, ванкомицина (нагрузочная доза по TBW, поддерживающая по ABW), гепарина NMH (лечение) — использовать ABW.`;
                actions = [
                    'Аминогликозиды: нагрузка по ABW, поддержание по ABW + мониторинг уровней',
                    'Ванкомицин: нагрузка 25–30 мг/кг TBW (макс 3 г); поддержание — ABW',
                    'Фармакокинетика: ABW учитывает частичное распределение препарата в жировой ткани (40%)'
                ];
            } else {
                interpretation = 'Выраженное ожирение — ABW обязательна';
                color = '#EF4444';
                details = `TBW ${(ratio * 100).toFixed(0)}% от IBW — выраженное ожирение. Дозирование по TBW приведёт к токсичности (аминогликозиды), по IBW — к субтерапевтическим концентрациям. ABW — компромисс; в анестезиологии предпочесть LBW (Janmahasatian).`;
                actions = [
                    'Аминогликозиды по ABW + TDM (пик/остаток)',
                    'Пропофол, рокуроний — LBW (Janmahasatian)',
                    'Цефазолин периоперационно — 2 г при < 120 кг, 3 г при ≥ 120 кг',
                    'НМГ профилактика: увеличенные дозы (эноксапарин 40 мг ×2 при BMI ≥ 40)'
                ];
            }
            return {
                value: abw.toFixed(1),
                unit: 'кг',
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    `IBW (Devine): ${ibw.toFixed(1)} кг; TBW/IBW: ${ratio.toFixed(2)}`,
                    'ABW применима при TBW/IBW > 1,2 (20% выше идеала); при меньшем избытке используйте TBW или IBW',
                    'Коэффициент 0,4 — средний; для ванкомицина в некоторых протоколах 0,3; для NMH 0,5',
                    'В анестезиологии LBW (Janmahasatian) точнее ABW для пропофола, рокурония'
                ],
                related: [
                    {
                        id: 'ibw-devine',
                        title: 'IBW (Devine)'
                    },
                    {
                        id: 'ibw-robinson',
                        title: 'IBW (Robinson/Miller/Hamwi)'
                    },
                    {
                        id: 'lbw',
                        title: 'Lean BW (Janmahasatian)'
                    },
                    {
                        id: 'bmi',
                        title: 'BMI'
                    }
                ],
                relatedCourses: [
                    {
                        id: '202.8',
                        title: 'Фармакокинетика'
                    }
                ]
            };
        },
    reference: "ABW = IBW + 0,4 × (TBW − IBW). Traynor AM et al. Clin Pharmacokinet 1995. Стандарт для аминогликозидов.",
    countries: "Международный",
    presets: [
      {
        label: "Ожирение I (♂ 100/175)",
        values: {
          actualWeight: 100,
          height: 175,
          female: false
        }
      },
      {
        label: "Ожирение II (♂ 120/175)",
        values: {
          actualWeight: 120,
          height: 175,
          female: false
        }
      },
      {
        label: "Морбидное ожирение ♀",
        values: {
          actualWeight: 140,
          height: 165,
          female: true
        }
      },
      {
        label: "Норма (♂ 75/175)",
        values: {
          actualWeight: 75,
          height: 175,
          female: false
        }
      }
    ],
    info: "### Для чего используется\n**Adjusted Body Weight (ABW)** — скорректированная масса тела, компромисс между фактической (TBW) и идеальной (IBW) для дозирования препаратов у пациентов с ожирением. Применяется в основном для **аминогликозидов** (гентамицин, тобрамицин, амикацин) и поддерживающих доз **ванкомицина**.\n\n### Формула\n`ABW = IBW + 0,4 × (TBW − IBW)`\n\nIBW рассчитывается по Devine:\n- ♂ IBW = 50 + 2,3 × (дюймы > 5 футов)\n- ♀ IBW = 45,5 + 2,3 × (дюймы > 5 футов)\n\nКоэффициент 0,4 отражает, что препараты типа аминогликозидов распределяются в жировой ткани примерно на 40%.\n\n### Когда применять\nABW имеет смысл только при **TBW/IBW > 1,2** (фактическая масса > 120% от идеальной).\n\n### Применение по препаратам\n| Препарат | Доза по |\n|---|---|\n| Аминогликозиды (гент, тобра, амика) | ABW + TDM |\n| Ванкомицин нагрузочная | TBW (макс 3 г) |\n| Ванкомицин поддерживающая | ABW (коэф. 0,3–0,4) |\n| НМГ профилактика (эноксапарин) | Повышенные дозы при BMI ≥ 40 |\n| НМГ лечение | TBW |\n| Гепарин нефракционированный | TBW (мониторинг АЧТВ/анти-Xa) |\n| Пропофол, рокуроний | LBW (лучше ABW) |\n| Цефазолин периоперационно | 2 г / 3 г при ≥ 120 кг |\n\n### Ограничения\n- Коэффициент 0,4 — усреднённый; для NMH предлагают 0,5; для некоторых бета-лактамов 0,3\n- Не учитывает пол и распределение жира (андроидное/геноидное)\n- При BMI > 50 все формулы теряют точность — использовать TDM\n\n### Тактика\n- TBW < 1,2 × IBW → использовать TBW или IBW\n- TBW ≥ 1,2 × IBW → использовать ABW для аминогликозидов\n- Всегда TDM при аминогликозидах и ванкомицине у пациентов с ожирением\n\n### Источник\nTraynor AM, Nafziger AN, Bertino JS Jr. Aminoglycoside dosing weight correction factors for patients of various body sizes. *Antimicrob Agents Chemother* 1995;39:545–548."
  };

export default runner;
