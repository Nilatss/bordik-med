// @ts-nocheck
/**
 * Runner: ckd-epi — CKD-EPI 2021 race-free Creatinine GFR
 *
 * P1-CR-10 — Formula source attribution:
 *   PRIMARY:    Inker LA, Eneanya ND, Coresh J, et al. New Creatinine- and
 *               Cystatin C-Based Equations to Estimate GFR without Race.
 *               N Engl J Med. 2021;385(19):1737-1749.
 *               doi:10.1056/NEJMoa2102953
 *   GUIDELINE:  NKF-ASN Task Force on Reassessing the Inclusion of Race in
 *               Diagnosing Kidney Disease. Final Report (2021) —
 *               рекомендует CKD-EPI 2021 (без race) для всех взрослых.
 *               https://www.kidney.org/news/nkf-asn-task-force-reassessing-inclusion-race-diagnosing-kidney-diseases
 *   GUIDELINE:  KDIGO 2024 CKD Guideline (предполагается, draft 2023) —
 *               CKD-EPI 2021 default; cystatin-based для confirmation в
 *               borderline случаях.
 *
 * Formula (race-free, 2021):
 *   eGFR = 142 × min(Cr/κ, 1)^α × max(Cr/κ, 1)^(-1.200)
 *               × 0.9938^age × 1.012 (if female)
 *   κ:   0.7 (female) / 0.9 (male)
 *   α:  -0.241 (female) / -0.302 (male)
 *   Result: mL/min/1.73 m²
 *
 * Старая 2009 версия (с race-coefficient) НЕ используется — replaced 2021.
 *
 * CKD stages (KDIGO):
 *   G1   ≥90    — normal/high (нужны структурные изменения для CKD)
 *   G2   60-89  — mildly decreased
 *   G3a  45-59  — mildly to moderately
 *   G3b  30-44  — moderately to severely
 *   G4   15-29  — severely decreased
 *   G5   <15    — kidney failure (renal replacement therapy)
 *
 * Caveats:
 *   - Inaccurate в AKI (steady-state required)
 *   - Underestimates eGFR в healthy young / high muscle mass
 *   - Cystatin-based variant более reliable в edge cases (amputations,
 *     malnutrition, body composition extremes)
 *
 * P0-CR closure (2026-05-06): добавлен guard на creatinine ≤0 / NaN.
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
        id: "age",
        hint: 'Возраст в годах',
        label: "Возраст",
        type: "number",
        unit: "лет",
        min: 18,
        max: 120,
        quickValues: [
          30,
          45,
          60,
          70,
          80
        ]
      },
      {
        id: "creatinine",
        hint: 'Креатинин сыворотки. Норма: М 62-115, Ж 53-97 мкмоль/л',
        label: "Креатинин сыворотки",
        type: "number",
        unit: "мкмоль/л",
        min: 10,
        max: 2000,
        step: 1,
        quickValues: [
          70,
          90,
          120,
          160,
          220,
          350
        ]
      },
      {
        id: "female",
        label: "Женский пол",
        type: "checkbox"
      }
    ],
    compute: (v)=>{
            const age = Number(v.age);
            const creat = Number(v.creatinine);
            // P0 guard: creatinine ≤ 0 ломает Math.pow(0, neg) → Infinity.
            // HTML min=10 — UI-валидация, обходится paste/preset/POST.
            if (!Number.isFinite(creat) || creat <= 0 || !Number.isFinite(age) || age <= 0) {
                return {
                    value: 'N/A',
                    unit: 'мл/мин/1,73 м²',
                    interpretation: 'Введите корректные значения (креатинин > 0, возраст > 0)',
                    color: '#9CA3AF',
                };
            }
            const scr_mgdl = creat / 88.4;
            const female = v.female === true;
            const k = female ? 0.7 : 0.9;
            const alpha = female ? -0.241 : -0.302;
            const sexFactor = female ? 1.012 : 1;
            const minTerm = Math.pow(Math.min(scr_mgdl / k, 1), alpha);
            const maxTerm = Math.pow(Math.max(scr_mgdl / k, 1), -1.200);
            const egfr = 142 * minTerm * maxTerm * Math.pow(0.9938, age) * sexFactor;
            let interpretation = '', color = '#1A1A1A';
            if (egfr >= 90) {
                interpretation = 'G1: Нормальная или повышенная';
                color = '#22C55E';
            } else if (egfr >= 60) {
                interpretation = 'G2: Незначительно снижена';
                color = '#22C55E';
            } else if (egfr >= 45) {
                interpretation = 'G3а: Умеренно снижена';
                color = '#F59E0B';
            } else if (egfr >= 30) {
                interpretation = 'G3б: Значительно снижена';
                color = '#F59E0B';
            } else if (egfr >= 15) {
                interpretation = 'G4: Резко снижена';
                color = '#EF4444';
            } else {
                interpretation = 'G5: Почечная недостаточность';
                color = '#991B1B';
            }
            let details = '';
            let actions = [];
            if (egfr >= 60) {
                details = 'СКФ ≥ 60 мл/мин/1,73 м². Диагноз ХБП ставится только при наличии маркеров повреждения почек (альбуминурия A2/A3, гематурия, структурные изменения, тубулопатии) длительностью ≥ 3 месяцев.';
                actions = [
                    'Оценить UACR (альбумин/креатинин мочи) - даже при нормальной СКФ A2/A3 повышают ССО-риск',
                    'Контроль АД, глюкозы, липидов',
                    'Избегать НПВС длительными курсами'
                ];
            } else if (egfr >= 30) {
                details = 'Умеренное снижение СКФ (G3). Требуется нефропротекция (иАПФ/БРА при альбуминурии, SGLT2-ингибиторы при СД2 и альбуминурии, контроль АД < 130/80) и коррекция доз нефротоксичных препаратов.';
                actions = [
                    'иАПФ/БРА при UACR > 30 мг/г; SGLT2 (дапаглифлозин, эмпаглифлозин) при СД2 или альбуминурии',
                    'Коррекция доз: DOAC, LMWH, метформин, аминогликозиды',
                    'Контроль гемоглобина, K⁺, фосфора, PTH, 25(OH)D каждые 6-12 мес',
                    'Направить к нефрологу при G3b или быстром снижении (> 5 мл/мин/год)'
                ];
            } else if (egfr >= 15) {
                details = 'Тяжёлое снижение СКФ (G4). Очень высокий риск прогрессии до ТПН и ССО. Плановая подготовка к заместительной почечной терапии - образование пациента, выбор модальности, формирование сосудистого доступа.';
                actions = [
                    'Обязательно наблюдение нефролога; планирование диализа/трансплантации',
                    'Преэмптивная трансплантация - рассмотреть при eGFR < 20',
                    'Коррекция анемии (ESA при Hb < 100 г/л), минерально-костных нарушений',
                    'Отмена или коррекция: метформин, многие антибиотики, НПВС, гадолиний'
                ];
            } else {
                details = 'СКФ < 15 мл/мин/1,73 м² - терминальная почечная недостаточность (G5). Показана заместительная почечная терапия при наличии уремических симптомов, рефрактерной гиперкалиемии, перегрузки жидкостью или метаболического ацидоза.';
                actions = [
                    'Срочное начало ЗПТ (ГД/ПД) или трансплантация',
                    'Пересмотреть ВСЕ препараты - дозы по инструкциям для диализных пациентов',
                    'Диета с ограничением K⁺, фосфора, белка (индивидуально)'
                ];
            }
            return {
                value: egfr.toFixed(0),
                unit: 'мл/мин/1.73м²',
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'Для дозирования препаратов FDA/EMA рекомендуют Cockcroft-Gault, а не CKD-EPI',
                    'Не применима при AKI - креатинин не в стационарном состоянии',
                    'Ложно завышает СКФ при саркопении, ампутациях, параплегии (низкая продукция креатинина)',
                    'Ложно занижает при крайнем мышечном развитии, высокобелковой диете',
                    'Беременность: креатинин-оценки неточны, ориентироваться на абсолютный SCr'
                ],
                scale: {
                    segments: [
                        {
                            min: 0,
                            max: 15,
                            label: 'G5',
                            color: '#991B1B'
                        },
                        {
                            min: 15,
                            max: 30,
                            label: 'G4',
                            color: '#EF4444'
                        },
                        {
                            min: 30,
                            max: 45,
                            label: 'G3б',
                            color: '#F59E0B'
                        },
                        {
                            min: 45,
                            max: 60,
                            label: 'G3а',
                            color: '#F59E0B'
                        },
                        {
                            min: 60,
                            max: 90,
                            label: 'G2',
                            color: '#22C55E'
                        },
                        {
                            min: 90,
                            max: 150,
                            label: 'G1',
                            color: '#22C55E'
                        }
                    ],
                    current: Number(egfr.toFixed(0)),
                    unit: 'мл/мин/1.73м²'
                },
                relatedCourses: [
                    {
                        id: '301.5',
                        title: "Нефрология"
                    },
                    {
                        id: '201.6',
                        title: "Мочевыделительная физиология"
                    }
                ],
                related: [
                    {
                        id: 'cockcroft',
                        title: 'Cockcroft-Gault (для доз)'
                    },
                    {
                        id: 'mdrd',
                        title: 'MDRD (устаревшая)'
                    },
                    {
                        id: 'fena',
                        title: 'FENa'
                    }
                ]
            };
        },
    reference: "CKD-EPI 2021 (race-free). Текущий стандарт KDIGO и NKF-ASN.",
    countries: "Международный (KDIGO)",
    presets: [
      {
        label: "Здоровый ♂ 40 лет",
        values: {
          age: 40,
          creatinine: 88,
          female: false
        }
      },
      {
        label: "Здоровая ♀ 40 лет",
        values: {
          age: 40,
          creatinine: 70,
          female: true
        }
      },
      {
        label: "G3a - умеренно",
        values: {
          age: 65,
          creatinine: 140,
          female: false
        }
      },
      {
        label: "G3b - умеренно тяж.",
        values: {
          age: 70,
          creatinine: 180,
          female: false
        }
      },
      {
        label: "G4 - тяжёлая ХБП",
        values: {
          age: 72,
          creatinine: 320,
          female: true
        }
      }
    ],
    info: "### Для чего используется\n**CKD-EPI 2021 (race-free)** - современный стандарт расчёта **скорости клубочковой фильтрации (рСКФ, eGFR)** по креатинину. Используется для:\n\n- Диагностики и стадирования хронической болезни почек (ХБП)\n- Мониторинга функции почек\n- Оценки риска прогрессии ХБП и ССС-событий\n- Критериев направления к нефрологу\n\n### Почему race-free\nВ прежней CKD-EPI 2009 был коэффициент \"×1,159 для чернокожих\", что критиковалось как некорректное научно и этически. **NKF-ASN Task Force 2021** пересчитал уравнение без расовой переменной. Это стандарт в США с 2022, принят KDIGO.\n\n### Формула (упрощённо)\n`eGFR = 142 × min(SCr/κ, 1)^α × max(SCr/κ, 1)^(−1,200) × 0,9938^возраст × (1,012 если жен)`\n\nГде:\n- κ = 0,7 (жен) / 0,9 (муж)\n- α = −0,241 (жен) / −0,302 (муж)\n\n### Стадии ХБП (KDIGO 2012)\n| Стадия | eGFR | Описание |\n|---|---|---|\n| G1 | ≥ 90 | Норма или повышена (при наличии маркеров повреждения) |\n| G2 | 60-89 | Незначительно снижена |\n| G3a | 45-59 | Умеренно снижена |\n| G3b | 30-44 | Значительно снижена |\n| G4 | 15-29 | Резко снижена |\n| G5 | < 15 | Почечная недостаточность (диализ/трансплантация) |\n\n### Категории альбуминурии (A)\n| Категория | ACR (мг/г) или UACR (мг/ммоль) |\n|---|---|\n| A1 (норма) | < 30 мг/г (< 3 мг/ммоль) |\n| A2 (умеренная) | 30-300 |\n| A3 (выраженная) | > 300 |\n\n**Диагноз ХБП** требует: eGFR < 60 **ИЛИ** маркеры повреждения (альбуминурия, гематурия, структурные изменения) ≥ 3 мес.\n\n### Когда направить к нефрологу\n- eGFR < 30 (G4-G5)\n- Быстрое снижение eGFR (> 5/год)\n- A3-альбуминурия\n- Стойкая гематурия неясной природы\n- Резистентная гипертензия\n- Нефролитиаз рецидивирующий\n- Наследственные болезни почек\n\n### CKD-EPI vs Cockcroft-Gault\n| Формула | Когда использовать |\n|---|---|\n| CKD-EPI 2021 | Стадирование ХБП, документация, мониторинг |\n| Cockcroft-Gault | Дозирование лекарств по FDA-инструкциям (DOACs, аминогликозиды) |\n\n### Когда CKD-EPI неточна\n| Ситуация | Причина неточности |\n|---|---|\n| AKI (острое повреждение) | Креатинин не в равновесии, формулы недостоверны |\n| Экстремальный BMI (< 15 или > 40) | Нарушена корреляция мышечной массы и креатинина |\n| Ампутация, параплегия | Низкая мышечная масса → SCr занижен, eGFR завышен |\n| Беременность | Повышен клиренс, измерение креатинина напрямую |\n| Строгая вегетарианская диета | Низкая продукция креатинина |\n\n### Альтернативные методы\n| Метод | Особенность |\n|---|---|\n| eGFR по цистатину C (CKD-EPI Cys) | Не зависит от мышечной массы |\n| eGFR по креатинину + цистатину C | Самый точный при пограничных значениях |\n| Инулиновый клиренс | Золотой стандарт в исследованиях |"
  };

export default runner;
