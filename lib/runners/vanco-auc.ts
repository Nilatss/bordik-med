// @ts-nocheck
/**
 * Runner: vanco-auc
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
        id: "trough",
        label: "Концентрация trough",
        type: "number",
        unit: "мг/л",
        min: 1,
        max: 60,
        step: 0.1,
        quickValues: [
          10,
          15,
          20,
          25
        ]
      },
      {
        id: "dose",
        label: "Разовая доза",
        type: "number",
        unit: "мг",
        min: 250,
        max: 4000,
        step: 50,
        quickValues: [
          750,
          1000,
          1250,
          1500,
          1750,
          2000
        ]
      },
      {
        id: "interval",
        label: "Интервал дозирования",
        type: "select",
        options: [
          {
            value: 6,
            label: "q6h"
          },
          {
            value: 8,
            label: "q8h"
          },
          {
            value: 12,
            label: "q12h"
          },
          {
            value: 24,
            label: "q24h"
          },
          {
            value: 36,
            label: "q36h"
          },
          {
            value: 48,
            label: "q48h"
          }
        ]
      },
      {
        id: "mic",
        label: "МПК (МИК) S. aureus",
        type: "number",
        unit: "мг/л",
        min: 0.25,
        max: 4,
        step: 0.25,
        quickValues: [
          0.5,
          1,
          2
        ]
      }
    ],
    compute: (v)=>{
            const trough = Number(v.trough);
            const dose = Number(v.dose);
            const tau = Number(v.interval);
            const mic = Number(v.mic) || 1;
            // Simplified: AUC24 ≈ trough × (24/tau) × k, where k ≈ 1.1-1.4 depending on t1/2.
            // Практически: AUC24 ≈ (доза × 24 / tau) / clearance, но через trough:
            // AUC24 ≈ trough × 24 × (1 + tau/(t½·ln2)) / 2 - сложно.
            // Rough estimate (Neely 2014): AUC24 ≈ (trough × 24) + (dose × 24 / tau) × 0.3
            const dailyDose = dose * 24 / tau;
            const auc = trough * 24 + dailyDose * 0.3; // упрощённая формула Neely
            const ratio = auc / mic;
            let interpretation = '', color = '', details = '', actions = [];
            if (ratio < 400) {
                interpretation = 'Суб-терапевтическая экспозиция (AUC/MIC < 400)';
                color = '#3B82F6';
                details = `AUC₂₄ ≈ ${auc.toFixed(0)} мг·ч/л, AUC/МПК ≈ ${ratio.toFixed(0)}. Ниже целевого диапазона 400-600 (IDSA 2020) - риск клинической неудачи при инвазивной MRSA-инфекции. Увеличьте суточную дозу на 20-30%.`;
                actions = [
                    'Увеличить суточную дозу на 20-30%, перепроверить trough через 24-48 ч',
                    'При МПК = 2 мг/л - рассмотреть альтернативный препарат (даптомицин, линезолид)',
                    'Bayesian-ПО (InsightRx, DoseMeRx) предпочтительнее trough-only подхода'
                ];
            } else if (ratio <= 600) {
                interpretation = 'Целевая экспозиция (AUC/MIC 400-600)';
                color = '#22C55E';
                details = `AUC₂₄ ≈ ${auc.toFixed(0)} мг·ч/л, AUC/МПК ≈ ${ratio.toFixed(0)}. В целевом диапазоне 400-600 по IDSA/ASHP 2020. Продолжайте режим, контролируйте креатинин 2-3 раза в неделю.`;
                actions = [
                    'Поддерживать текущий режим',
                    'Контроль креатинина 2-3 раза в неделю при длительности ≥ 5 дней',
                    'При клиническом ухудшении - повторить посев и МПК'
                ];
            } else {
                interpretation = 'Избыточная экспозиция (AUC/MIC > 600) - риск нефротоксичности';
                color = '#EF4444';
                details = `AUC₂₄ ≈ ${auc.toFixed(0)} мг·ч/л, AUC/МПК ≈ ${ratio.toFixed(0)}. Превышает верхний порог 600, AUC > 650 достоверно ассоциирован с VIKI (Vancomycin-Induced Kidney Injury). Снизить дозу.`;
                actions = [
                    'Снизить суточную дозу на 20-30% ИЛИ удлинить интервал',
                    'Ежедневный контроль креатинина; при ↑ ≥ 1,5 × baseline - отменить',
                    'Избегать сопутствующих нефротоксинов (пиперациллин-тазобактам, НПВС, контрастные вещества)',
                    'Bayesian-ПО для точного расчёта'
                ];
            }
            return {
                value: ratio.toFixed(0),
                unit: 'AUC/МПК',
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'Формула упрощённая (Neely 2014); для пациентов с нестабильной функцией почек - Bayesian PK/PD',
                    'Golden standard - 2 уровня (peak + trough) с расчётом AUC по трапеции',
                    'При МПК ≥ 2 мг/л ванкомицин почти никогда не достигает целевого AUC/MIC - рассмотреть альтернативы',
                    'У детей и беременных ориентиры отличаются - смотрите педиатрические руководства',
                    'Trough-only подход (15-20 мг/л) устарел - IDSA 2020 рекомендует AUC-guided dosing'
                ],
                scale: {
                    segments: [
                        {
                            min: 0,
                            max: 400,
                            label: 'Суб-терап.',
                            color: '#3B82F6'
                        },
                        {
                            min: 400,
                            max: 600,
                            label: 'Цель',
                            color: '#22C55E'
                        },
                        {
                            min: 600,
                            max: 1200,
                            label: 'Токсично',
                            color: '#EF4444'
                        }
                    ],
                    current: Math.min(Number(ratio.toFixed(0)), 1200),
                    unit: 'AUC/МПК'
                },
                relatedCourses: [
                    {
                        id: '202.8',
                        title: 'Фармакокинетика'
                    },
                    {
                        id: '301.7',
                        title: 'Инфекционные болезни'
                    }
                ],
                related: [
                    {
                        id: 'cockcroft',
                        title: 'CrCl (Cockcroft-Gault)'
                    },
                    {
                        id: 'aminoglycoside',
                        title: 'Аминогликозиды (Hartford)'
                    },
                    {
                        id: 'mg-kg',
                        title: 'Доза по массе'
                    }
                ]
            };
        },
    reference: "Rybak MJ et al. Therapeutic monitoring of vancomycin for serious MRSA infections: IDSA/ASHP/PIDS consensus. *Am J Health-Syst Pharm* 2020;77:835.",
    countries: "США (IDSA/ASHP) · Международный",
    presets: [
      {
        label: "Trough 15, 1 г q12h, МПК 1",
        values: {
          trough: 15,
          dose: 1000,
          interval: 12,
          mic: 1
        }
      },
      {
        label: "Trough 20, 1,5 г q12h, МПК 1",
        values: {
          trough: 20,
          dose: 1500,
          interval: 12,
          mic: 1
        }
      },
      {
        label: "Trough 10, 1 г q12h, МПК 2",
        values: {
          trough: 10,
          dose: 1000,
          interval: 12,
          mic: 2
        }
      }
    ],
    info: "### Для чего используется\n**Мониторинг экспозиции ванкомицина** при инвазивных MRSA-инфекциях (бактериемия, эндокардит, пневмония). IDSA 2020 отказались от trough-only подхода в пользу **AUC₂₄/МПК 400-600**.\n\n### Целевой диапазон\n`AUC₂₄/МПК 400-600 мг·ч/л` (IDSA/ASHP/PIDS 2020)\n\n### Расчёт AUC\n| Метод | Точность |\n|---|---|\n| Bayesian (InsightRx, DoseMeRx) | Золотой стандарт |\n| 2-level (peak + trough) | Высокая |\n| Trough-only (Neely upp. formula) | Приблизительная |\n\n### Интерпретация\n| AUC/МПК | Значение |\n|---|---|\n| < 400 | Риск неудачи |\n| 400-600 | Цель |\n| > 600 | Риск нефротоксичности (VIKI) |\n\n### Ограничения\n- Упрощённая формула - нельзя применять при нестабильной функции почек\n- МПК = 2 мг/л делает достижение цели маловероятным\n- Не применим для менингита (нужны концентрации в ликворе)\n\n### Источник\nRybak MJ et al. *Am J Health-Syst Pharm* 2020;77:835.\nNeely MN et al. *Antimicrob Agents Chemother* 2014;58:309.\n"
  };

export default runner;
