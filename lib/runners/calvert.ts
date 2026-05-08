/**
 * Runner: calvert
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
        id: "auc",
        label: "Целевой AUC",
        type: "number",
        unit: "мг·мин/мл",
        min: 1,
        max: 7,
        step: 0.5,
        quickValues: [
          4,
          5,
          6
        ]
      },
      {
        id: "gfr",
        label: "GFR / CrCl",
        type: "number",
        unit: "мл/мин",
        min: 10,
        max: 200,
        step: 1,
        quickValues: [
          60,
          80,
          100,
          125
        ]
      }
    ],
    compute: (v)=>{
            const auc = Number(v.auc);
            const gfrRaw = Number(v.gfr);
            // FDA cap at 125 to avoid overdosing
            const gfr = Math.min(gfrRaw, 125);
            const dose = Math.round(auc * (gfr + 25));
            const capped = gfrRaw > 125;
            return {
                value: `${dose} мг`,
                unit: `Карбоплатин (AUC ${auc})`,
                interpretation: capped ? `Доза рассчитана с капом GFR = 125 мл/мин (FDA, 2010) для предотвращения передозировки` : `Стандартный расчёт Calvert для AUC ${auc}`,
                color: '#4B8DF5',
                details: `Carboplatin (мг) = AUC × (GFR + 25) = ${auc} × (${gfr} + 25) = ${dose} мг.\n\n${capped ? `Ваш расчётный GFR = ${gfrRaw} мл/мин - превышает FDA-кап 125. При использовании расчётных формул (CKD-EPI, Cockcroft) пороговое значение установлено FDA в 2010 после случаев передозировки у пациентов с высоким расчётным клиренсом. Если измеренный GFR по 51Cr-EDTA / иогексол доступен, можно его использовать без капа.\n\n` : ''}Типичные AUC: моно-карбоплатин - 5-7; в комбинации - 4-6; паллиатив/геровозраст - 2-4.`,
                actions: [
                    `Премедикация: дексаметазон 8 мг + ондансетрон 8 мг + НК-1 антагонист (апрепитант)`,
                    `Инфузия: карбоплатин ${dose} мг в 250-500 мл D5W за 30-60 мин (не в 0,9% NaCl - инактивация)`,
                    'Контроль: нейтрофилы, тромбоциты (nadir на 21-й день) перед следующим циклом',
                    'Снижение дозы на 25% при нейтрофильной < 1,5×10⁹/л или тромбоцитопении < 100×10⁹/л',
                    'Ототоксичность < cisplatin, но кумулятивная - аудиометрия при длительных курсах'
                ],
                caveats: [
                    'FDA-кап GFR 125 мл/мин введён в 2010 - применяется при расчётных клиренсах (CKD-EPI, MDRD, Cockcroft)',
                    'Измеренный GFR (51Cr-EDTA, иогексол) - золотой стандарт, не требует капа',
                    'У ожирения использовать TBW или корректированную массу для CrCl',
                    'Пожилые (> 65) - обычно AUC 4-5, не выше 6',
                    'При ХБП < 30 мл/мин - рассмотреть cisplatin или замену режима'
                ],
                relatedCourses: [
                    {
                        id: '202.8',
                        title: 'Фармакокинетика'
                    },
                    {
                        id: '301.3',
                        title: 'Онкология'
                    }
                ],
                related: [
                    {
                        id: 'cockcroft',
                        title: 'CrCl (Cockcroft-Gault)'
                    },
                    {
                        id: 'ckd-epi',
                        title: 'CKD-EPI eGFR'
                    },
                    {
                        id: 'bsa-dose',
                        title: 'Доза по BSA'
                    }
                ]
            };
        },
    reference: "Calvert AH et al. Carboplatin dosage: prospective evaluation of a simple formula based on renal function. *J Clin Oncol* 1989;7:1748. FDA safety announcement 2010 (GFR cap at 125).",
    countries: "Международный (ASCO, ESMO)",
    presets: [
      {
        label: "Яичники, AUC 5",
        values: {
          auc: 5,
          gfr: 100
        }
      },
      {
        label: "НМРЛ, AUC 6",
        values: {
          auc: 6,
          gfr: 90
        }
      },
      {
        label: "Геровозраст, AUC 4",
        values: {
          auc: 4,
          gfr: 60
        }
      }
    ],
    info: "\n### Для чего используется\n**Формула Кальверта (1989)** - индивидуальный расчёт дозы карбоплатина на основе функции почек (80% экскретируется почками в неизменённом виде). Стандарт ASCO/ESMO.\n\n### Формула\n`Доза (мг) = AUC × (GFR + 25)`\n\nGFR в мл/мин. «25» - небиллиарный клиренс. С 2010 FDA требует `кап GFR = 125` при расчётных методах.\n\n### Типичные AUC\n| Режим | AUC |\n|---|---|\n| Моно-карбоплатин (яичники) | 5-7 |\n| В комбинации (paclitaxel) | 4-6 |\n| Паллиатив / геровозраст | 2-4 |\n\n### Ограничения\n- Требует точного GFR (лучше измеренного)\n- Не применим при ХБП < 30 мл/мин\n- При ожирении корректировка массы по препарату"
  };

export default runner;
