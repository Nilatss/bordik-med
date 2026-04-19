// @ts-nocheck
/**
 * Runner: aspects
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
        id: "lost",
        label: "Сколько из 10 регионов с ранними ишемическими изменениями?",
        type: "number",
        min: 0,
        max: 10,
        step: 1,
        hint: "Регионы: M1–M6, C, L, IC, I",
        quickValues: [
          0,
          2,
          4,
          6,
          8,
          10
        ]
      }
    ],
    compute: (v)=>{
            const lost = Math.min(Math.max(Number(v.lost), 0), 10);
            const score = 10 - lost;
            const value = String(score);
            const caveats = [
                'Валидизирован только для инсульта в бассейне СМА (для заднего бассейна — Pc-ASPECTS)',
                'Низкая межрейтерская надёжность без формального обучения; МРТ-DWI чувствительнее',
                'Время от начала симптомов влияет на видимость ранних изменений на КТ',
                'SELECT2 и RESCUE-Japan LIMIT показали пользу тромбэкстракции и при ASPECTS 3–5'
            ];
            const related = [
                {
                    id: 'nihss',
                    title: 'NIHSS (тяжесть инсульта)'
                },
                {
                    id: 'mrs-stroke',
                    title: 'mRS (функциональный исход)'
                },
                {
                    id: 'ich',
                    title: 'ICH score'
                }
            ];
            const relatedCourses = [
                {
                    id: '301.1',
                    title: "Кардиология"
                }
            ];
            const scale = {
                segments: [
                    {
                        min: 0,
                        max: 5,
                        label: 'Обширная',
                        color: '#EF4444'
                    },
                    {
                        min: 5,
                        max: 7,
                        label: 'Пограничная',
                        color: '#F59E0B'
                    },
                    {
                        min: 7,
                        max: 10,
                        label: 'Благоприятная',
                        color: '#10B981'
                    }
                ],
                current: score,
                unit: 'ASPECTS'
            };
            if (score >= 8) return {
                value,
                unit: 'ASPECTS',
                interpretation: '≥ 8 — благоприятный паттерн, кандидат на тромбэкстракцию/тромболизис.',
                color: '#10B981',
                details: 'Ранние ишемические изменения минимальны — высокий шанс на хороший функциональный исход при успешной реперфузии. Все крупные RCT тромбэкстракции (MR CLEAN, ESCAPE, SWIFT-PRIME) включали пациентов с ASPECTS ≥ 6.',
                actions: [
                    'При окне ≤ 4,5 ч и отсутствии противопоказаний — в/в tPA (альтеплаза или тенектеплаза)',
                    'При окклюзии крупной артерии (ICA, M1) — тромбэкстракция ≤ 6 ч (или ≤ 24 ч при mismatch по DAWN/DEFUSE-3)',
                    'Прикроватный NIHSS, контроль АД (< 185/110 перед тромболизисом, < 180/105 после)'
                ],
                caveats,
                related,
                relatedCourses,
                scale
            };
            if (score >= 6) return {
                value,
                unit: 'ASPECTS',
                interpretation: '6–7 — пограничный, индивидуальное решение.',
                color: '#F59E0B',
                details: 'Умеренная зона ранней ишемии. Большинство RCT всё ещё включали таких пациентов (критерий ≥ 6), исход хуже, чем при ASPECTS 8–10, но тромбэкстракция оправдана.',
                actions: [
                    'Мультидисциплинарное решение (невролог, нейрорентгенолог, интервенционист)',
                    'Рассмотреть КТ-перфузию / МРТ-DWI-PWI для оценки penumbra',
                    'При наличии mismatch и окклюзии крупной артерии — тромбэкстракция'
                ],
                caveats,
                related,
                relatedCourses,
                scale
            };
            return {
                value,
                unit: 'ASPECTS',
                interpretation: '≤ 5 — обширная ишемия, повышенный риск геморрагии.',
                color: '#EF4444',
                details: 'Большой объём уже сформировавшегося инфаркта. Классически считался противопоказанием к тромбэкстракции, однако SELECT2 (2023) и RESCUE-Japan LIMIT (2022) показали пользу реперфузии и при ASPECTS 3–5 с приемлемым риском sICH.',
                actions: [
                    'Индивидуальное решение: тромбэкстракция возможна при ASPECTS 3–5 по новым RCT',
                    'Обязательно обсудить риск геморрагической трансформации',
                    'При ASPECTS 0–2 — реперфузия обычно не показана',
                    'Рассмотреть декомпрессивную гемикраниэктомию при малигнизирующем отёке'
                ],
                caveats,
                related,
                relatedCourses,
                scale
            };
        },
    reference: "Barber PA. Lancet 2000. ASPECTS — оценка ранней ишемии в бассейне СМА.",
    info: "### Что оценивает\n**ASPECTS (Alberta Stroke Program Early CT Score)** — полуколичественная оценка ранних ишемических изменений на бесконтрастной КТ при инсульте в бассейне **средней мозговой артерии (СМА)**.\n\n### 10 регионов (по 1 баллу за каждый сохранённый)\n**На уровне базальных ядер:**\n- C — caudate (хвостатое ядро)\n- L — lentiform nucleus (чечевицеобразное)\n- IC — internal capsule (внутренняя капсула)\n- I — insular ribbon (островковая лента)\n- M1 — передний кортекс СМА\n- M2 — кортекс СМА латеральнее островка\n- M3 — задний кортекс СМА\n\n**На уровне выше базальных ядер:**\n- M4 — передний СМА\n- M5 — латеральный СМА\n- M6 — задний СМА\n\n`ASPECTS = 10 − число повреждённых регионов`\n\n### Интерпретация\n- **10** — норма\n- **8–10** — благоприятный паттерн; **кандидат на тромболизис/тромбэктомию**\n- **6–7** — пограничный\n- **≤ 5** — обширная ишемия; повышенный риск геморрагической трансформации; результаты тромбэкстракции хуже\n\n### Применение в современных RCT\n| Исследования | Критерий ASPECTS | Дополнительно |\n|---|---|---|\n| MR CLEAN, ESCAPE, REVASCAT, EXTEND-IA, SWIFT-PRIME | ≥ 6 | Крупные артериальные окклюзии |\n| DAWN, DEFUSE-3 (продлённое окно) | ≥ 6 | + mismatch на МРТ / КТ-перфузии |\n| SELECT2, RESCUE-Japan LIMIT | 3–5 | Расширение показаний на обширную ишемию |\n- Современные исследования (**SELECT2**, **RESCUE-Japan LIMIT**): тромбэкстракция эффективна и при ASPECTS 3–5\n\n### Pc-ASPECTS (задний бассейн)\nДля базилярной/задней мозговой:\n- Таламус, ствол, мозжечок (по 2 балла), затылочная и таламус (по 1)\n- Макс 10\n\n### Ранние признаки ишемии на КТ\n- Сглаживание разделения серого/белого вещества\n- Затемнение островковой ленты (\"insular ribbon sign\")\n- Сглаживание извилин (\"loss of sulci\")\n- Гиперденсная СМА — острый тромб\n\n### Ограничения\n- Низкая межрейтерская надёжность без обучения\n- Время от начала симптомов влияет на видимость изменений\n- МРТ-DWI более чувствительна — там используют **DWI-ASPECTS**"
  };

export default runner;
