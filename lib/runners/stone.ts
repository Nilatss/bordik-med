// @ts-nocheck
/** Runner: stone */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'size',
hint: 'Размер в миллиметрах', label: 'Размер камня', type: 'number', unit: 'мм', min: 1, max: 40, step: 1, quickValues: [4, 6, 10, 15, 20] },
    { id: 'location', label: 'Локация', type: 'select', options: [
      { value: 'upper', label: 'Верхняя треть мочеточника', points: 0 },
      { value: 'mid', label: 'Средняя треть мочеточника', points: 0 },
      { value: 'lower', label: 'Нижняя треть / ЛМС', points: 0 },
      { value: 'pelvis', label: 'Лоханка', points: 0 },
      { value: 'calyx_up', label: 'Верхняя чашечка', points: 0 },
      { value: 'calyx_lo', label: 'Нижняя чашечка', points: 0 },
    ] },
    { id: 'hydro', label: 'Гидронефроз', type: 'select', options: [
      { value: 'none', label: 'Нет / I ст', points: 0 },
      { value: 'mod', label: 'II ст (умеренный)', points: 1 },
      { value: 'severe', label: 'III–IV ст (выраженный)', points: 2 },
    ] },
    { id: 'infection', label: 'Признаки инфекции (лихорадка, лейкоциты в моче, сепсис)', type: 'checkbox' },
    { id: 'pain', label: 'Неконтролируемая боль / рвота', type: 'checkbox' },
    { id: 'single', label: 'Единственная / трансплантированная почка', type: 'checkbox' },
  ],
  compute: (v) => {
    const size = Number(v.size);
    const loc = String(v.location);
    const hydro = String(v.hydro);
    const infection = v.infection === true;
    const pain = v.pain === true;
    const single = v.single === true;

    let rec = '', color = '#22C55E', interpretation = '', urgency = 0;

    if (infection) {
      rec = 'Неотложное дренирование (JJ-стент или ЧПНС) + антибиотики широкого спектра. После купирования сепсиса — дефинитивное удаление камня.';
      color = '#991B1B'; interpretation = 'Уросепсис — срочно!'; urgency = 4;
    } else if (single && size >= 5) {
      rec = 'Раннее активное удаление (URS/SWL) — риск ОПП при обструкции единственной почки.';
      color = '#EF4444'; interpretation = 'Срочное вмешательство'; urgency = 3;
    } else if (hydro === 'severe') {
      rec = 'Дренирование (JJ/ЧПНС) при стойкой обструкции + плановое удаление (URS/SWL/PCNL).';
      color = '#EF4444'; interpretation = 'Высокий риск'; urgency = 3;
    } else if (size < 5) {
      rec = 'Консервативная тактика + медикаментозная экспульсивная терапия (тамсулозин 0.4 мг/сут, НПВС). Ожидаемое самостоятельное отхождение 80–90% в течение 4 нед. Контроль через 2–4 нед.';
      color = '#22C55E'; interpretation = 'MET / наблюдение'; urgency = 0;
    } else if (size < 10) {
      if (loc === 'lower' || loc === 'mid' || loc === 'upper') {
        rec = 'МЭТ 2–4 нед; при неэффективности — URS (уретероскопия) 1-й линии или SWL.';
        color = '#F59E0B'; interpretation = 'MET → URS/SWL'; urgency = 1;
      } else if (loc === 'calyx_lo') {
        rec = 'SWL или FURS (гибкая уретероскопия). При неблагоприятной анатомии нижней чашечки — FURS.';
        color = '#F59E0B'; interpretation = 'SWL / FURS'; urgency = 1;
      } else {
        rec = 'SWL или FURS — сопоставимая эффективность при <10 мм.';
        color = '#F59E0B'; interpretation = 'SWL / FURS'; urgency = 1;
      }
    } else if (size < 20) {
      if (loc === 'pelvis' || loc === 'calyx_up' || loc === 'calyx_lo') {
        rec = 'FURS (ретроградная внутрипочечная хирургия, RIRS) или мини-PCNL. SWL — при благоприятной анатомии.';
        color = '#EF4444'; interpretation = 'FURS / mini-PCNL'; urgency = 2;
      } else {
        rec = 'URS/FURS. SWL эффективна при <10 мм в проксимальном мочеточнике.';
        color = '#EF4444'; interpretation = 'URS/FURS'; urgency = 2;
      }
    } else {
      if (loc === 'pelvis' || loc === 'calyx_up' || loc === 'calyx_lo') {
        rec = 'PCNL (перкутанная нефролитотомия) — 1-я линия для камней >20 мм в почке.';
        color = '#EF4444'; interpretation = 'PCNL'; urgency = 3;
      } else {
        rec = 'Крупный камень мочеточника >20 мм: URS (эндоскопически) или лапароскопическая уретеролитотомия.';
        color = '#EF4444'; interpretation = 'URS / лапароскопия'; urgency = 3;
      }
    }

    if (pain && urgency < 2) {
      rec += ' Купирование боли: НПВС (диклофенак) или опиоиды при неэффективности.';
    }

    return {
      value: String(size),
      unit: 'мм',
      interpretation,
      color,
      details: rec,
      actions: [
        'Рентгенонегативные камни: неконтрастная КТ (LDCT)',
        'Биохимия мочи и камня (метаболическая оценка при рецидивах)',
        'Гидратация 2.5–3 л/сут, снижение соли и животного белка',
        infection ? 'Посев мочи, гемокультура, антибиотик по протоколу уросепсиса' : 'Контроль анализа мочи',
      ],
      caveats: [
        'EAU 2024: SWL менее эффективна при плотности >1000 HU, ожирении, ниж. чашечке',
        'JJ-стент рутинно после URS не обязателен, но при затруднении или осложнении — ставить',
        'Во время беременности: JJ-стент или ЧПНС; дефинитивное лечение после родов',
        'При уросепсисе — антибиотик до дренирования, не ждать посева',
      ],
      scale: {
        segments: [
          { min: 0, max: 5, label: '<5 мм MET', color: '#22C55E' },
          { min: 5, max: 10, label: '5–10 SWL/URS', color: '#F59E0B' },
          { min: 10, max: 20, label: '10–20 URS', color: '#EF4444' },
          { min: 20, max: 40, label: '>20 PCNL', color: '#991B1B' },
        ],
        current: Math.max(0, Math.min(40, size)),
        unit: 'мм',
      },
      relatedCourses: [
        { id: '301.4', title: 'Урология' },
        { id: '301.3', title: 'Нефрология' },
      ],
      related: [
        { id: 'pvr', title: 'PVR' },
        { id: 'kdigo', title: 'KDIGO AKI' },
      ],
    };
  },
  reference: 'EAU Guidelines on Urolithiasis 2024; AUA/Endourological Society 2016.',
  countries: 'Международный (EAU/AUA)',
  presets: [
    { label: 'Мелкий — MET', values: { size: 4, location: 'lower', hydro: 'none', infection: false, pain: false, single: false } },
    { label: 'Средний — SWL/URS', values: { size: 8, location: 'upper', hydro: 'mod', infection: false, pain: true, single: false } },
    { label: 'Крупный лоханочный — PCNL', values: { size: 22, location: 'pelvis', hydro: 'mod', infection: false, pain: false, single: false } },
    { label: 'Уросепсис', values: { size: 10, location: 'mid', hydro: 'severe', infection: true, pain: true, single: false } },
  ],
  info: `### Для чего используется
Алгоритм принятия решения при мочекаменной болезни (МКБ) по EAU/AUA 2024.

### Правило размера
| Размер | Тактика 1-й линии |
|---|---|
| <5 мм | MET (тамсулозин) + наблюдение |
| 5–10 мм | MET или SWL / URS |
| 10–20 мм | URS / FURS / mini-PCNL |
| >20 мм (почка) | PCNL |

### Красные флаги (немедленное дренирование)
- Обструкция + инфекция (уросепсис) → ЧПНС или JJ-стент
- ОПП при единственной почке
- Неконтролируемая боль / рвота
- Двусторонняя обструкция`,
};
export default runner;
