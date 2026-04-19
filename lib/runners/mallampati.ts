// @ts-nocheck
/**
 * Runner: mallampati
 * Composite difficult airway assessment — Mallampati + Cormack-Lehane + LEMON + MACOCHA.
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
  kind: 'calculator',
  inputs: [
    {
      id: 'mp',
      label: 'Mallampati класс',
      type: 'select',
      options: [
        { value: '1', label: 'I — видны мягкое нёбо, зев, язычок, дужки', points: 0 },
        { value: '2', label: 'II — видны мягкое нёбо, зев, язычок', points: 1 },
        { value: '3', label: 'III — видны мягкое нёбо и основание язычка', points: 2 },
        { value: '4', label: 'IV — видно только твёрдое нёбо', points: 3 },
      ],
    },
    {
      id: 'cl',
      label: 'Cormack–Lehane (при ларингоскопии, если известно)',
      type: 'select',
      options: [
        { value: '0', label: 'Не оценивалось / ожидание', points: 0 },
        { value: '1', label: 'Grade I — видна вся голосовая щель', points: 0 },
        { value: '2', label: 'Grade II — видна задняя часть/черпаловидные', points: 1 },
        { value: '3', label: 'Grade III — виден только надгортанник', points: 3 },
        { value: '4', label: 'Grade IV — надгортанник не виден', points: 4 },
      ],
    },
    { id: 'lemon_look', label: 'LEMON: внешние признаки (борода, травма, ожирение лица)', type: 'checkbox', points: 1 },
    { id: 'lemon_eval', label: 'LEMON: правило 3-3-2 нарушено (открытие рта < 3 пальцев / подбородок-подъязычная < 3 / щитовидно-подъязычная < 2)', type: 'checkbox', points: 1 },
    { id: 'lemon_obst', label: 'LEMON: обструкция (опухоль, гематома, эпиглоттит, стридор)', type: 'checkbox', points: 2 },
    { id: 'lemon_neck', label: 'LEMON: ограничение подвижности шеи (< 35°)', type: 'checkbox', points: 1 },
    { id: 'macocha', label: 'MACOCHA: ICU-пациент (SAPS II > 30 / кома / гипоксия / анестезиолог-неэксперт)', type: 'checkbox', points: 2 },
  ],
  compute: (v) => {
    const mpPts = v.mp === '1' ? 0 : v.mp === '2' ? 1 : v.mp === '3' ? 2 : v.mp === '4' ? 3 : 0;
    const clPts = v.cl === '1' ? 0 : v.cl === '2' ? 1 : v.cl === '3' ? 3 : v.cl === '4' ? 4 : 0;
    const lemonLook = v.lemon_look ? 1 : 0;
    const lemonEval = v.lemon_eval ? 1 : 0;
    const lemonObst = v.lemon_obst ? 2 : 0;
    const lemonNeck = v.lemon_neck ? 1 : 0;
    const macocha = v.macocha ? 2 : 0;
    const total = mpPts + clPts + lemonLook + lemonEval + lemonObst + lemonNeck + macocha;

    let interpretation = '', color = '#22C55E', details = '', actions: string[] = [];
    if (total <= 2) {
      interpretation = 'Низкий риск трудной интубации';
      color = '#22C55E';
      details = 'Композитный риск трудной ларингоскопии/интубации низкий (< 5%). Стандартная техника прямой ларингоскопии с клинком Macintosh.';
      actions = [
        'Стандартная индукция, прямая ларингоскопия',
        'Готовность к плану B (LMA, bougie) — рутинно',
      ];
    } else if (total <= 5) {
      interpretation = 'Умеренный риск';
      color = '#F59E0B';
      details = 'Умеренный риск трудной интубации (10–20%). Подготовить видеоларингоскоп и план B, предоксигенация 3–5 мин.';
      actions = [
        'Преоксигенация 100% O₂ 3–5 мин (или 8 глубоких вдохов)',
        'Видеоларингоскоп (McGrath, GlideScope, C-MAC) наготове',
        'Bougie, LMA 2-го поколения доступны',
        'Позиционирование: ramped (приподнятая голова/плечи)',
      ];
    } else if (total <= 9) {
      interpretation = 'Высокий риск трудной интубации';
      color = '#EF4444';
      details = 'Высокий риск неудачной интубации с первой попытки (> 25%). Рассмотреть awake fiberoptic intubation (AFOI) или awake video-laryngoscopy.';
      actions = [
        'Обсудить awake fiberoptic intubation (AFOI) как первую линию',
        'DAS / ASA Difficult Airway Algorithm наготове',
        'Два анестезиолога у кровати',
        'Хирург-ЛОР готов к экстренной крикотиреоидотомии',
        'Оборудование: видеоларингоскоп + фибробронхоскоп + LMA + набор для коникотомии',
      ];
    } else {
      interpretation = 'Критический риск (невозможная интубация / невозможная вентиляция)';
      color = '#991B1B';
      details = 'Очень высокий риск CICV (Cannot Intubate, Cannot Ventilate). Awake AFOI обязателен, если нет жизненных показаний к RSI.';
      actions = [
        'Awake fiberoptic intubation — стандарт',
        'Хирургическая команда в операционной, шея подготовлена',
        'ECMO-готовность при обструкции ВДП опухолью',
        'Обсудить регионарную анестезию как альтернативу ОА',
      ];
    }

    return {
      value: String(total),
      unit: 'баллов',
      interpretation,
      color,
      details,
      actions,
      caveats: [
        'Mallampati имеет низкую чувствительность (≈ 50%) как единственный предиктор — обязательно использовать композитный подход',
        'Cormack–Lehane оценивается только при прямой ларингоскопии (постфактум)',
        'LEMON (Reed 2004) валидизирован в ED для RSI',
        'MACOCHA (De Jong 2013) — специфичен для ICU-интубаций',
        'Ни одна шкала не заменяет план B/C — всегда иметь algorithm DAS/ASA',
      ],
      scale: {
        segments: [
          { min: 0, max: 2, label: 'Низкий', color: '#22C55E' },
          { min: 2, max: 5, label: 'Умеренный', color: '#F59E0B' },
          { min: 5, max: 9, label: 'Высокий', color: '#EF4444' },
          { min: 9, max: 15, label: 'Критический', color: '#991B1B' },
        ],
        current: total,
        unit: 'баллов',
      },
      related: [
        { id: 'wilson-arne', title: 'Wilson score' },
        { id: 'asa-ps', title: 'ASA-PS' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Неотложная помощь' },
        { id: '201.2', title: 'Дыхательная физиология' },
      ],
    };
  },
  reference: 'Mallampati SR 1985; Cormack RS, Lehane J 1984; Reed MJ LEMON 2005; De Jong A MACOCHA 2013.',
  countries: 'Международный',
  presets: [
    { label: 'Молодой без факторов', values: { mp: '1', cl: '0', lemon_look: false, lemon_eval: false, lemon_obst: false, lemon_neck: false, macocha: false } },
    { label: 'Ожирение + борода', values: { mp: '3', cl: '0', lemon_look: true, lemon_eval: true, lemon_obst: false, lemon_neck: false, macocha: false } },
    { label: 'ICU с эпиглоттитом', values: { mp: '4', cl: '0', lemon_look: true, lemon_eval: true, lemon_obst: true, lemon_neck: true, macocha: true } },
  ],
  info: `### Для чего используется
Композитная прикроватная оценка риска **трудной ларингоскопии и интубации**. Сочетает 4 валидизированные шкалы.

### Mallampati (1985)
Оценивается в сидячем положении, максимальное открытие рта, высунутый язык (без фонации).

| Класс | Видно |
|---|---|
| I | Мягкое нёбо, зев, язычок, дужки |
| II | Мягкое нёбо, зев, язычок |
| III | Мягкое нёбо, основание язычка |
| IV | Только твёрдое нёбо |

### Cormack–Lehane (1984)
Постмоментная оценка при прямой ларингоскопии.

| Grade | Видимость |
|---|---|
| I | Вся голосовая щель |
| II | Задняя часть / черпаловидные |
| III | Только надгортанник |
| IV | Не виден надгортанник |

### LEMON (Reed 2005)
**L**ook externally — борода, травма, дисморфия
**E**valuate 3-3-2 — открытие рта ≥ 3 пальцев, подбородок-подъязычная ≥ 3, щитовидно-подъязычная ≥ 2
**M**allampati
**O**bstruction / obesity
**N**eck mobility

### MACOCHA (De Jong 2013, ICU)
**M**allampati III/IV · **A**pnea (OSA) · **C**ervical spine limited · **O**pening mouth < 3 см · **C**oma · **H**ypoxia · **A**nesthesiologist non-expert.
Порог ≥ 3 — высокий риск трудной интубации в ICU.

### Алгоритмы
- DAS 2015 (UK) — пошаговый, включая FONA
- ASA Difficult Airway Algorithm 2022 (обновление)
- Vortex approach — cognitive aid в кризисе

### Ограничения
- Одиночные тесты имеют низкую чувствительность
- Композитная оценка повышает PPV, но не заменяет клиническое суждение
- При экстренной RSI время на оценку ограничено — use LEMON`,
};

export default runner;
