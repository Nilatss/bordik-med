/**
 * Runner: esc-pe
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
        id: "unstable",
        label: "Гемодинамическая нестабильность (шок / САД < 90 / ↓ ≥ 40 > 15 мин)",
        type: "checkbox"
      },
      {
        id: "pesi",
        label: "PESI класс III-V или sPESI ≥ 1",
        type: "checkbox"
      },
      {
        id: "rv",
        label: "Дисфункция ПЖ (ЭхоКГ или КТ: RV/LV > 1,0)",
        type: "checkbox"
      },
      {
        id: "trop",
        label: "Повышенный тропонин",
        type: "checkbox"
      },
      {
        id: "hestia",
        label: "Hestia = 0 (пригодность к амбулаторному лечению)",
        type: "checkbox"
      }
    ],
    compute: (v)=>{
            const unstable = v.unstable === true;
            const pesi = v.pesi === true;
            const rv = v.rv === true;
            const trop = v.trop === true;
            const hestia = v.hestia === true;
            let category;
            let interpretation = '', color = '', details = '';
            let actions = [];
            let label = '';
            if (unstable) {
                category = 'high';
                label = 'Высокий риск';
                interpretation = 'ТЭЛА высокого риска';
                color = '#991B1B';
                details = '30-дн. смертность > 15 %. Показан первичный системный тромболизис при отсутствии абсолютных противопоказаний (альтеплаза 100 мг за 2 ч или 0,6 мг/кг за 15 мин). При противопоказаниях - катетер-направленная терапия / хирургическая эмболэктомия.';
                actions = [
                    'Системный тромболизис (альтеплаза 100 мг / 2 ч или болюс)',
                    'Нефракционированный гепарин (болюс 80 Ед/кг + инфузия)',
                    'При противопоказаниях - катетерная эмболэктомия / ECMO',
                    'ICU, вазопрессоры (норэпинефрин), осторожная инфузия (≤ 500 мл)',
                    'PERT team'
                ];
            } else if (pesi && rv && trop) {
                category = 'int-high';
                label = 'Промежуточно-высокий риск';
                interpretation = 'Intermediate-high risk ТЭЛА';
                color = '#EF4444';
                details = '30-дн. смертность 5-15 %. Госпитализация, мониторинг в ICU 48-72 ч. PEITHO: рутинный тромболизис не рекомендуется (↑ риск большого кровотечения и ОНМК), но - готовность к rescue-тромболизису при декомпенсации.';
                actions = [
                    'Госпитализация в ICU/мониторное отделение',
                    'LMWH или НФГ (в первые 48 ч, затем DOAC)',
                    'Rescue тромболизис при развитии шока',
                    'Рассмотреть катетер-направленный тромболизис (USAT, EKOS) или тромбэктомию',
                    'PERT team при крупных тромбах'
                ];
            } else if (pesi || rv || trop) {
                category = 'int-low';
                label = 'Промежуточно-низкий риск';
                interpretation = 'Intermediate-low risk ТЭЛА';
                color = '#F59E0B';
                details = '30-дн. смертность 3-5 %. Госпитализация в обычное отделение, стандартная антикоагуляция.';
                actions = [
                    'Госпитализация (обычное отделение)',
                    'DOAC: апиксабан 10 мг × 2 / 7 дн → 5 мг × 2 или ривароксабан 15 мг × 2 / 21 дн → 20 мг',
                    'LMWH при раке (далтепарин/эноксапарин) или переходе на DOAC (эдоксабан)',
                    'Длительность АК: провокация - 3 мес, непровоц. - ≥ 3 мес (часто пожизненно)'
                ];
            } else {
                category = 'low';
                label = 'Низкий риск';
                interpretation = 'Low risk ТЭЛА';
                color = '#22C55E';
                details = hestia ? '30-дн. смертность < 1 %, пациент подходит для амбулаторного лечения по критериям Hestia.' : '30-дн. смертность < 1 %, но проверьте Hestia критерии для решения об амбулаторном ведении.';
                actions = hestia ? [
                    'Амбулаторное лечение DOAC',
                    'Апиксабан 10 мг × 2 / 7 дн → 5 мг × 2 или ривароксабан 15 мг × 2 / 21 дн → 20 мг',
                    'Повторный визит через 1-2 нед',
                    'Обследование на провокацию / тромбофилию при показаниях'
                ] : [
                    'Госпитализация короткая (24-48 ч)',
                    'DOAC',
                    'Оценить Hestia для ранней выписки'
                ];
            }
            return {
                value: label,
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'Нестабильность = шок, САД < 90, ↓ САД ≥ 40 мм рт.ст. > 15 мин, или потребность в вазопрессорах',
                    'Intermediate-high требует ВСЕХ трёх: +PESI + +RV + +тропонин',
                    'При раке предпочтительны LMWH или эдоксабан / апиксабан (эдоксабан после 5 дней LMWH)',
                    'Беременность: LMWH; DOAC противопоказаны'
                ],
                related: [
                    {
                        id: 'wells-pe',
                        title: 'Wells (ТЭЛА)'
                    },
                    {
                        id: 'pesi',
                        title: 'PESI / sPESI'
                    },
                    {
                        id: 'bova',
                        title: 'Bova'
                    }
                ],
                relatedCourses: [
                    {
                        id: '301.1',
                        title: 'Кардиология'
                    },
                    {
                        id: '301.2',
                        title: 'Пульмонология'
                    }
                ]
            };
        },
    reference: "Konstantinides SV et al. 2019 ESC Guidelines PE. Eur Heart J 2020;41:543. Обновление 2024.",
    countries: "ЕС · международный",
    presets: [
      {
        label: "Low + Hestia 0",
        values: {
          unstable: false,
          pesi: false,
          rv: false,
          trop: false,
          hestia: true
        }
      },
      {
        label: "Int-low",
        values: {
          unstable: false,
          pesi: true,
          rv: false,
          trop: false,
          hestia: false
        }
      },
      {
        label: "Int-high",
        values: {
          unstable: false,
          pesi: true,
          rv: true,
          trop: true,
          hestia: false
        }
      },
      {
        label: "High-risk",
        values: {
          unstable: true,
          pesi: true,
          rv: true,
          trop: true,
          hestia: false
        }
      }
    ],
    info: "### Для чего используется\n**ESC 2019/2024 PE risk stratification** - итоговая классификация пациента с ТЭЛА на **4 категории** для выбора стратегии реперфузии vs антикоагуляции vs амбулаторного ведения.\n\n### Алгоритм\n1. **Гемодинамическая нестабильность?** (шок / САД < 90 / ↓ ≥ 40 мм рт.ст. > 15 мин / вазопрессоры)\n   - **Да** → **High-risk** → тромболизис / катетерная / хирургическая эмболэктомия\n   - Нет → шаг 2\n2. Рассчитать PESI (класс III-V) или sPESI (≥ 1)\n3. Выполнить ЭхоКГ (или КТ) - RV/LV > 1,0 = ПЖ-дисфункция\n4. Измерить тропонин\n\n### Категории\n| Категория | Критерии | 30-дн. смертность | Тактика |\n|---|---|---|---|\n| **High** | Шок / САД < 90 | > 15 % | Тромболизис, ICU |\n| **Int-high** | PESI III-V **+** ПЖ-дисф. **+** ↑тропонин | 5-15 % | Госпитализация ICU, rescue-тромболизис при декомп. |\n| **Int-low** | PESI III-V **или** ПЖ-дисф. **или** ↑тропонин | 3-5 % | Госпитализация, антикоагуляция |\n| **Low** | PESI I-II (или sPESI 0) + всё негативно | < 1 % | DOAC, рассмотреть амбулаторное (Hestia 0) |\n\n### Hestia критерии (амбулаторное ведение)\nВсе должны быть \"нет\": нестабильность, потребность в тромболизисе, активное кровотечение, SpO₂ < 90 %, ТЭЛА на АК, тяжёлая боль, мед. или соц. причина для госпитализации, CrCl < 30, тяжёлая печ. нед., беременность, HIT в анамнезе.\n\n### Реперфузия\n| Режим | Доза |\n|---|---|\n| Альтеплаза (стандарт) | 100 мг / 2 ч в/в |\n| Альтеплаза (rescue, шок) | 0,6 мг/кг (макс. 50 мг) за 15 мин |\n| Тенектеплаза | Болюс по массе тела |\n| Катетерный тромболизис (USAT) | Альтеплаза 10-20 мг за 10-24 ч |\n| Тромбэктомия | FlowTriever / Indigo при противопоказаниях к литикам |\n\n### Ограничения\n- Int-high: рутинный тромболизис НЕ рекомендуется (PEITHO: ↑ кровотечений)\n- Не применять классификацию в первые минуты - сначала стабилизация\n- У онкобольных - LMWH или эдоксабан / апиксабан предпочтительнее варфарина\n\n### Тактика\n- **High** - альтеплаза немедленно, PERT team\n- **Int-high** - ICU, готовность к rescue-тромболизису, рассмотреть CDT\n- **Int-low** - обычная палата, DOAC\n- **Low + Hestia 0** - DOAC амбулаторно"
  };

export default runner;
