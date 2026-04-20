// @ts-nocheck
/**
 * Runner: raschke
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
        id: "weight",
        label: "Вес",
        type: "number",
        unit: "кг",
        min: 30,
        max: 250,
        step: 0.1,
        quickValues: [
          60,
          70,
          80,
          90,
          100,
          120
        ]
      },
      {
        id: "indication",
        label: "Показание",
        type: "select",
        options: [
          {
            value: "standard",
            label: "Стандартное (ВТЭ, ОКС без фибринолитика)"
          },
          {
            value: "stemi",
            label: "STEMI + фибринолитик"
          },
          {
            value: "bleed",
            label: "Высокий риск кровотечения"
          }
        ]
      }
    ],
    compute: (v)=>{
            const w = Number(v.weight);
            const ind = String(v.indication);
            let bolusUkg = 80, maintUkgh = 18;
            if (ind === 'stemi') {
                bolusUkg = 60;
                maintUkgh = 12;
            } else if (ind === 'bleed') {
                bolusUkg = 60;
                maintUkgh = 12;
            }
            const bolus = bolusUkg * w;
            const rate = maintUkgh * w;
            const maxBolus = ind === 'stemi' ? 4000 : undefined;
            const maxRate = ind === 'stemi' ? 1000 : undefined;
            const bolusFinal = maxBolus ? Math.min(bolus, maxBolus) : bolus;
            const rateFinal = maxRate ? Math.min(rate, maxRate) : rate;
            return {
                value: `Болюс ${bolusFinal.toFixed(0)} Ед, затем ${rateFinal.toFixed(0)} Ед/ч`,
                unit: `(${bolusUkg} Ед/кг → ${maintUkgh} Ед/кг/ч)`,
                interpretation: ind === 'stemi' ? 'STEMI + фибринолитик: сниженные дозы с капированием' : 'Раштке-номограмма титрования нефракционированного гепарина.',
                color: '#F59E0B',
                details: `Раштке weight-based номограмма (1993): болюс ${bolusUkg} Ед/кг в/в → инфузия ${maintUkgh} Ед/кг/ч. Для пациента ${w} кг: болюс ${bolusFinal.toFixed(0)} Ед, затем ${rateFinal.toFixed(0)} Ед/ч. ${ind === 'stemi' ? 'При STEMI + фибринолитик (tPA): капирование болюса 4000 Ед и инфузии 1000 Ед/ч.' : 'Титровать по aPTT (цель 1,5-2,5 × контроль, обычно 60-80 с) каждые 6 ч до стабильности, затем каждые 24 ч.'} Показано, что weight-based быстрее достигает терапевтического aPTT, чем фиксированные дозы (Raschke et al., *Ann Intern Med* 1993).`,
                actions: [
                    `Болюс ${bolusFinal.toFixed(0)} Ед в/в, затем инфузия ${rateFinal.toFixed(0)} Ед/ч`,
                    'Контроль aPTT через 6 ч, титрация по номограмме (см. info)',
                    'Баз. лаб.: aPTT, ОАК (Hb, тромб.), креатинин, АЛТ, ПВ/МНО',
                    'Ежедневно тромбоциты (HIT - падение > 50 % на 4-14 день → отмена, аргатробан)',
                    'Избегать в/м инъекций и НПВС; контроль за признаками кровотечения'
                ],
                caveats: [
                    'aPTT зависит от реактива лаборатории - использовать локальную номограмму',
                    'У ожирения использовать TBW (не IBW); капирование весом 150 кг обсуждается',
                    'При ХБП нефракционированный гепарин НЕ требует коррекции (в отличие от LMWH)',
                    'При STEMI + tPA строго капировать дозы - риск геморрагического инсульта',
                    'HIT (тип II): тромбоцитопения 4-14 день → отмена и переход на аргатробан/бивалирудин'
                ],
                relatedCourses: [
                    {
                        id: '301.1',
                        title: 'Кардиология'
                    },
                    {
                        id: '300.4',
                        title: 'Неотложная помощь'
                    }
                ],
                related: [
                    {
                        id: 'warfarin',
                        title: 'Варфарин - старт'
                    },
                    {
                        id: 'doac',
                        title: 'DOAC - подбор дозы'
                    },
                    {
                        id: 'cockcroft',
                        title: 'CrCl (для LMWH)'
                    }
                ]
            };
        },
    reference: "Raschke RA et al. Ann Intern Med 1993;119:874. Weight-based nomogram UFH (bolus 80 U/kg + 18 U/kg/h).",
    countries: "США · Международный (ACCP 2012)",
    presets: [
      {
        label: "ВТЭ 80 кг",
        values: {
          weight: 80,
          indication: "standard"
        }
      },
      {
        label: "STEMI + tPA, 90 кг",
        values: {
          weight: 90,
          indication: "stemi"
        }
      },
      {
        label: "Высокий риск кров., 70 кг",
        values: {
          weight: 70,
          indication: "bleed"
        }
      }
    ],
    info: "### Для чего используется\n**Номограмма Раштке (1993)** - weight-based дозирование нефракционированного гепарина (UFH) при ВТЭ и ОКС. Показано более быстрое и надёжное достижение терапевтического aPTT по сравнению с фиксированными дозами.\n\n### Стандартная схема (ВТЭ, нестабильная стенокардия / NSTEMI без фибринолитика)\n- **Болюс:** 80 Ед/кг в/в\n- **Поддерживающая инфузия:** 18 Ед/кг/ч\n\n### STEMI + фибринолитик (tPA, стрептокиназа)\n- **Болюс:** 60 Ед/кг (макс. 4000 Ед)\n- **Инфузия:** 12 Ед/кг/ч (макс. 1000 Ед/ч)\n\n### Титрация по aPTT (cross 1,5-2,5 × контроль)\n| aPTT | Действие |\n|---|---|\n| < 35 с | Повторить болюс 80 Ед/кг + ↑ инфузию на 4 Ед/кг/ч |\n| 35-45 с | Болюс 40 Ед/кг + ↑ инфузию на 2 Ед/кг/ч |\n| 46-70 с (цель) | Без изменений |\n| 71-90 с | ↓ инфузию на 2 Ед/кг/ч |\n| > 90 с | Остановить на 1 ч, ↓ инфузию на 3 Ед/кг/ч |\n\nКонтроль aPTT каждые 6 ч до 2 последовательных значений в цели, затем каждые 24 ч.\n\n### Мониторинг\n| Параметр | Частота |\n|---|---|\n| aPTT | Каждые 6 ч → 24 ч |\n| Тромбоциты | Ежедневно (HIT!) |\n| Hb | Ежедневно |\n| Креатинин | Исходно |\n\n### HIT - тип II\nИммуно-опосредованная тромбоцитопения на 4-14 день → парадоксальный тромбоз. **Падение тромбоцитов > 50 %** - немедленная отмена гепарина, переход на прямые ингибиторы тромбина (аргатробан, бивалирудин). Тест: anti-PF4 ELISA, SRA.\n\n### Ограничения\n- aPTT зависит от реактива - использовать локальную номограмму\n- В современной практике предпочтительнее LMWH (эноксапарин 1 мг/кг × 2) - не требует мониторинга aPTT\n\n### Источник\nRaschke RA et al. The weight-based heparin dosing nomogram compared with a \"standard care\" nomogram. *Ann Intern Med* 1993;119:874-881.\nACCP. *Chest* 2012;141(2 Suppl):e24S-e43S."
  };

export default runner;
