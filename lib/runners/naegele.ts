// @ts-nocheck
/**
 * Runner: naegele
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
        id: "lmpY",
        label: "Год LMP",
        type: "number",
        min: 2000,
        max: 2100,
        step: 1,
        quickValues: [
          2024,
          2025,
          2026
        ]
      },
      {
        id: "lmpM",
        label: "Месяц LMP",
        type: "number",
        min: 1,
        max: 12,
        step: 1,
        quickValues: [
          1,
          3,
          5,
          7,
          9,
          11
        ]
      },
      {
        id: "lmpD",
        label: "День LMP",
        type: "number",
        min: 1,
        max: 31,
        step: 1,
        quickValues: [
          1,
          7,
          14,
          21,
          28
        ]
      }
    ],
    compute: (v)=>{
            const y = Number(v.lmpY), m = Number(v.lmpM), d = Number(v.lmpD);
            const lmp = new Date(y, m - 1, d);
            if (isNaN(lmp.getTime())) throw new Error('bad date');
            const edd = new Date(lmp);
            edd.setDate(edd.getDate() + 280);
            const value = edd.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            const today = new Date();
            const daysPreg = Math.floor((today.getTime() - lmp.getTime()) / 86400000);
            const weeks = Math.floor(daysPreg / 7);
            const days = daysPreg - weeks * 7;
            const ga = daysPreg >= 0 && daysPreg <= 300 ? `Текущий срок: ${weeks} нед ${days} дн.` : '';
            return {
                value,
                unit: 'ПДР',
                interpretation: `Предполагаемая дата родов = LMP + 280 дней (40 нед). ${ga}`.trim(),
                color: '#1A1A1A',
                details: 'Naegele - ориентировочная оценка при регулярном 28-дневном цикле и точно известной дате LMP. Золотой стандарт датирования - УЗИ I триместра по КТР (±5-7 дней): при расхождении с LMP > 7 дней ПДР переустанавливается по УЗИ (ACOG/ISUOG).',
                actions: [
                    'При нерегулярном цикле скорректировать: ПДР + (длина цикла − 28) дней',
                    'При ЭКО - считать от даты подсадки эмбриона, не от LMP',
                    'Подтвердить срок УЗИ I триместра (7-14 нед)',
                    'Запланировать скрининги: anti-D (28 нед при Rh−), ГСД (24-28 нед), Tdap (27-36 нед)'
                ],
                caveats: [
                    'Недостоверна при нерегулярных циклах, СПКЯ, лактационной аменорее',
                    'Не применять при беременности после ЭКО',
                    'При расхождении с УЗИ I триместра > 7 дней использовать УЗИ-датирование'
                ],
                related: [
                    {
                        id: 'bishop',
                        title: 'Bishop (готовность шейки)'
                    },
                    {
                        id: 'apgar',
                        title: 'Apgar (оценка новорождённого)'
                    }
                ]
            };
        },
    reference: "Naegele FK, 1812. Стандартный расчёт ПДР для регулярного 28-дн цикла.",
    info: "### Что считает\n**Правило Naegele** - оценка предполагаемой даты родов (ПДР, EDD) от первого дня последней менструации (LMP, ПДПМ).\n\n### Формула\n`ПДР = LMP − 3 месяца + 7 дней + 1 год`\n\nили эквивалентно: **LMP + 280 дней (= 40 недель = 9 месяцев + 7 дней)**\n\n### Условия применимости\n- Регулярный цикл **28 дней**\n- Точно известна LMP\n- Овуляция на 14-й день\n\n### Корректировка для нерегулярного цикла\n`Скорректированная ПДР = Naegele EDD + (длина цикла − 28)`\n\nНапример, 32-дн цикл: добавить 4 дня к Naegele.\n\n### Когда Naegele НЕ работает\n- Беременность после ЭКО - используйте **дату подсадки эмбриона**\n- Овуляция вне 14-го дня (СПКЯ, лактационная аменорея)\n- Нерегулярные циклы\n\n### Золотой стандарт датирования\n**УЗИ I триместра (КТР, 7-14 нед)** - точность ± 5-7 дней.\nЕсли разница УЗИ vs LMP > 7 дней - переустанавливают ПДР по УЗИ (ACOG/ISUOG).\n\n### Сроки беременности\n- **40 нед 0 дн** = ПДР\n- **37-41 нед** = доношенный (37-38⁶ - early term, 39-40⁶ - full term, 41-41⁶ - late term)\n- **≥ 42 нед** = переношенная (post-term)\n- **< 37 нед** = преждевременные\n\n### Дополнительные применения\n- Дозирование anti-D Ig (28 нед при Rh-)\n- Скрининг ГСД (24-28 нед)\n- Стероиды для созревания лёгких (24⁰⁻³⁴⁶ нед)\n- Срок прививок (Tdap 27-36 нед)"
  };

export default runner;
