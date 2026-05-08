/**
 * Runner: qtc
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
        id: "qt",
        label: "QT интервал",
        type: "number",
        unit: "мс",
        min: 200,
        max: 700,
        step: 1,
        quickValues: [
          360,
          400,
          440,
          480,
          520
        ]
      },
      {
        id: "rr",
        label: "RR интервал",
        type: "number",
        unit: "мс",
        min: 300,
        max: 2000,
        step: 1,
        hint: "Или ЧСС ×60000/ЧСС",
        quickValues: [
          600,
          750,
          857,
          1000,
          1200
        ]
      },
      {
        id: "female",
        label: "Женский пол",
        type: "checkbox"
      }
    ],
    compute: (v)=>{
            const qt = Number(v.qt), rr = Number(v.rr) / 1000; // RR в секундах
            const qtc_bazett = qt / Math.sqrt(rr);
            const threshold = v.female === true ? 470 : 450;
            let interpretation = '', color = '#1A1A1A';
            let details = '';
            let actions: string[] = [];
            if (qtc_bazett <= threshold) {
                interpretation = `Нормальный QTc (порог ${threshold} мс)`;
                color = '#22C55E';
                details = 'QTc в пределах нормы. Тем не менее, при назначении QT-удлиняющих препаратов (макролиды, хинолоны, ондансетрон, галоперидол, метадон, амиодарон, соталол) разумен контроль ЭКГ, особенно при полипрагмазии.';
                actions = [];
            } else if (qtc_bazett <= 500) {
                interpretation = 'Удлинён - риск аритмий';
                color = '#F59E0B';
                details = 'Пограничное удлинение QTc. Риск torsade de pointes повышен, но не критичен. Каждые 10 мс прироста QTc увеличивают риск TdP примерно на 7 %.';
                actions = [
                    'Проверить K⁺, Mg²⁺, Ca²⁺ - корректировать',
                    'Ревизия препаратов: отменить или заменить QT-удлиняющие (www.crediblemeds.org)',
                    'Исключить ишемию, гипотиреоз, внутричерепную патологию',
                    'При брадикардии или ЧСС > 85 - пересчитать по Fridericia (Bazett переоценивает)'
                ];
            } else {
                interpretation = 'Значительно удлинён - риск TdP';
                color = '#EF4444';
                details = 'QTc ≥ 500 мс - высокий риск жизнеугрожающей аритмии torsade de pointes. Требуется срочная коррекция электролитов и отмена всех QT-удлиняющих препаратов.';
                actions = [
                    'Экстренно: MgSO₄ 2 г в/в (даже при нормальном Mg) - первая линия при TdP',
                    'K⁺ целевой > 4,5 ммоль/л; Mg²⁺ > 1,0 ммоль/л',
                    'Отменить ВСЕ QT-удлиняющие препараты, включая комбинации',
                    'Телеметрия; при брадикардии - overdrive-пейсинг или изопротеренол',
                    'При рецидивирующих TdP - β-блокаторы (пропранолол, надолол), обсуждение ИКД',
                    'Семейный скрининг при подозрении на врождённый LQTS (Romano-Ward, Jervell-Lange-Nielsen)'
                ];
            }
            return {
                value: qtc_bazett.toFixed(0),
                unit: 'мс (Bazett)',
                interpretation,
                color,
                details,
                actions,
                caveats: [
                    'Bazett переоценивает QTc при ЧСС > 85 и недооценивает при < 60 - использовать Fridericia (QT/³√RR)',
                    'При ФП измерять на нескольких циклах и усреднять',
                    'При LBBB, WPW, широком QRS - QT удлинён искусственно; интерпретация затруднена',
                    'Автоматический анализ ЭКГ часто ошибается - измерять вручную в отведениях II, V5',
                    'Женщины имеют физиологически более длинный QTc (порог 470 vs 450)'
                ],
                scale: {
                    segments: [
                        {
                            min: 300,
                            max: threshold,
                            label: 'Норма',
                            color: '#22C55E'
                        },
                        {
                            min: threshold,
                            max: 500,
                            label: 'Удлинён',
                            color: '#F59E0B'
                        },
                        {
                            min: 500,
                            max: 600,
                            label: 'Риск TdP',
                            color: '#EF4444'
                        }
                    ],
                    current: Number(qtc_bazett.toFixed(0)),
                    unit: 'мс'
                },
                relatedCourses: [
                    {
                        id: '301.1',
                        title: "Кардиология"
                    }
                ],
                related: [
                    {
                        id: 'ca-corrected',
                        title: 'Коррекция Ca'
                    }
                ]
            };
        },
    reference: "Bazett 1920: QTc = QT/√RR. Ж >470, М >450. QTc >500 - повышенный риск torsades.",
    info: "### Для чего используется\n**QTc (corrected QT)** - длительность интервала QT, скорректированная на частоту сердечных сокращений. Ключевой параметр для оценки **риска жизнеугрожающей аритмии torsade de pointes (TdP)** и внезапной сердечной смерти.\n\n### Формулы коррекции\n| Формула | Год | Когда использовать |\n|---|---|---|\n| **Bazett**: QT/√RR | 1920 | Классическая, но переоценивает при ЧСС > 85 |\n| **Fridericia**: QT/³√RR | 1920 | Лучше при тахи- и брадикардии (предпочтительна при ЧСС > 85 или < 60) |\n| **Framingham**: QT + 154 × (1 − RR) | 1992 | Линейная корректировка |\n| **Hodges**: QT + 1,75 × (ЧСС − 60) | 1983 | Альтернатива |\n\n(RR в секундах)\n\n### Пороговые значения\n| Категория | Мужчины | Женщины |\n|---|---|---|\n| Норма | < 450 мс | < 460 мс |\n| Пограничное | 450-469 | 460-479 |\n| Удлинение | ≥ 470 | ≥ 480 |\n| **Высокий риск TdP** | ≥ 500 | ≥ 500 |\n\n### Причины удлинения QTc\n| Категория | Примеры |\n|---|---|\n| **Наследственные** (LQTS) | Romano-Ward, Jervell-Lange-Nielsen |\n| **Лекарственные** | Амиодарон, соталол, макролиды, хинолоны, галоперидол, метадон, цисаприд |\n| **Электролитные** | Гипокалиемия, гипомагниемия, гипокальциемия |\n| **Метаболические** | Гипотиреоз, гипотермия |\n| **Ишемия** / инфаркт | Острый ИМ |\n| **Диеты, голодание** | Крайние изменения электролитов |\n\n### Тактика при удлинённом QTc\n| QTc | Действие |\n|---|---|\n| 460-499 | Проверить K⁺, Mg²⁺; отменить / заменить QT-удлиняющие препараты |\n| ≥ 500 | Срочная коррекция электролитов; MgSO₄ 2 г в/в при TdP; отмена всех QT-удлиняющих |\n| Рецидивирующие TdP | β-блокаторы (пропранолол, надолол), ИКД |\n\n### Риск TdP по QTc\nКаждые 10 мс увеличения QTc повышают риск TdP на ~ 7 %.\n\n### Tisdale score\nИспользуется для оценки **риска удлинения QT на препаратах** в стационаре.\n\n### Специальные ситуации\n| Состояние | Особенность |\n|---|---|\n| ФП | Трудно измерять RR; усреднение |\n| Низкое ЧСС (< 50) | Использовать Fridericia, не Bazett |\n| LBBB, WPW | QT удлинён за счёт QRS; интерпретация затруднена |\n\n### Ограничения\n- Bazett - наиболее распространённая, но неточна при крайних ЧСС\n- QTc - оценочная, не абсолютная\n- Не отражает абсолютный риск TdP (нужна клиника)"
  };

export default runner;
