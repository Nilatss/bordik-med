// @ts-nocheck
/** Runner: harriet-lane */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'drug',
      label: 'Препарат',
      type: 'select',
      options: [
        { value: 'amoxicillin', label: 'Амоксициллин' },
        { value: 'amox-clav', label: 'Амоксициллин/клавуланат' },
        { value: 'ceftriaxone', label: 'Цефтриаксон' },
        { value: 'azithromycin', label: 'Азитромицин' },
        { value: 'paracetamol', label: 'Парацетамол' },
        { value: 'ibuprofen', label: 'Ибупрофен' },
        { value: 'dexamethasone', label: 'Дексаметазон (круп)' },
        { value: 'salbutamol', label: 'Сальбутамол (небулайзер)' },
        { value: 'epinephrine', label: 'Эпинефрин (анафилаксия)' },
        { value: 'ondansetron', label: 'Ондансетрон' },
        { value: 'ors', label: 'ORS (регидратация)' },
      ],
    },
    {
      id: 'weight',
      hint: 'Вес в кг (без одежды)',
      label: 'Масса тела (кг)',
      type: 'number',
      placeholder: 'кг',
    },
    {
      id: 'indication',
      label: 'Показание',
      type: 'select',
      options: [
        { value: 'standard', label: 'Стандартное' },
        { value: 'severe', label: 'Тяжёлая инфекция / ОРИТ' },
        { value: 'prophylaxis', label: 'Профилактика' },
        { value: 'anaphylaxis', label: 'Анафилаксия' },
        { value: 'croup', label: 'Круп' },
        { value: 'fever', label: 'Лихорадка / боль' },
      ],
    },
  ],
  compute: (v) => {
    const d = String(v.drug);
    const w = Number(v.weight) || 0;
    const ind = String(v.indication);

    type Dose = { mgkg: string; freq: string; route: string; max: string; prep: string; note: string };
    const map: Record<string, Dose> = {
      amoxicillin: { mgkg: '45-90 мг/кг/сут ÷ 2-3', freq: 'каждые 8-12 ч', route: 'перорально', max: '2-3 г/сут', prep: 'суспензия 250 мг/5 мл или 400 мг/5 мл', note: 'Высокая доза (80-90) при отите.' },
      'amox-clav': { mgkg: '40-90 мг/кг/сут (по амокс.) ÷ 2', freq: 'каждые 12 ч', route: 'перорально', max: '2 г амокс./сут', prep: 'суспензия 600/42,9 мг/5 мл (ES-600)', note: 'Соотношение 7:1 или 14:1 — ES-600 для высоких доз.' },
      ceftriaxone: { mgkg: '50-100 мг/кг/сут', freq: '1 раз/сут (менингит: каждые 12 ч)', route: 'в/в / в/м', max: '2 г (менингит: 4 г)', prep: 'флакон 500 мг / 1 г', note: 'Не у новорождённых с желтухой (билирубин-вытеснение).' },
      azithromycin: { mgkg: '10 мг/кг д.1, затем 5 мг/кг д.2-5', freq: '1 раз/сут', route: 'перорально', max: '500 мг д.1, 250 мг далее', prep: 'суспензия 200 мг/5 мл', note: 'Или 30 мг/кг однократно (отит).' },
      paracetamol: { mgkg: '10-15 мг/кг/доза', freq: 'каждые 4-6 ч (макс 5 раз/сут)', route: 'перорально / ректально', max: '75 мг/кг/сут (макс 4 г)', prep: 'суспензия 120/5 мл или 250/5 мл', note: 'Не давать < 3 мес без педиатра.' },
      ibuprofen: { mgkg: '5-10 мг/кг/доза', freq: 'каждые 6-8 ч', route: 'перорально', max: '40 мг/кг/сут (макс 2,4 г)', prep: 'суспензия 100 мг/5 мл', note: 'Не давать < 6 мес. Осторожно при дегидратации.' },
      dexamethasone: { mgkg: '0,6 мг/кг однократно', freq: 'однократно', route: 'перорально / в/м', max: '16 мг', prep: 'таб. 0,5 / 2 мг; р-р 4 мг/мл', note: 'Круп: даже однократная пероральная доза эффективна.' },
      salbutamol: { mgkg: '0,15 мг/кг (мин 2,5 мг, макс 5 мг)', freq: 'каждые 20 мин × 3, затем каждые 1-4 ч', route: 'небулайзер', max: '5 мг/доза', prep: 'р-р 2,5 мг/2,5 мл', note: 'При тяжёлой астме — непрерывно 0,5 мг/кг/ч.' },
      epinephrine: { mgkg: '0,01 мг/кг (1:1000) в/м', freq: 'каждые 5-15 мин при необходимости', route: 'в/м (латеральная бедро)', max: '0,3 мг (ребёнок), 0,5 мг (подросток)', prep: 'ампула 1 мг/мл (1:1000)', note: 'Автоинжектор: 0,15 мг < 25 кг, 0,3 мг ≥ 25 кг.' },
      ondansetron: { mgkg: '0,15 мг/кг (или 2 мг < 15 кг, 4 мг 15-30 кг, 8 мг > 30 кг)', freq: 'каждые 8 ч', route: 'перорально / в/в', max: '8 мг/доза', prep: 'ODT 4/8 мг; сироп 4 мг/5 мл', note: 'Однократная доза при гастроэнтерите — доказано снижает рвоту.' },
      ors: { mgkg: '50-100 мл/кг за 4 ч (лёгкая-умеренная дегидратация)', freq: 'дробно по 5 мл каждые 1-2 мин', route: 'перорально', max: 'по потребности', prep: 'WHO-ORS 75 ммоль/л Na', note: 'Замещение стула: 10 мл/кг после каждого жидкого стула.' },
    };

    const e = map[d] || { mgkg: 'См. Harriet Lane Handbook', freq: '—', route: '—', max: '—', prep: '—', note: 'Сверить в справочнике.' };

    let calcDose = '—';
    if (w > 0) {
      if (d === 'amoxicillin') calcDose = `${Math.round(w * (ind === 'severe' ? 90 : 50))} мг/сут ÷ 2-3 приёма`;
      else if (d === 'paracetamol') calcDose = `${Math.round(w * 15)} мг/доза`;
      else if (d === 'ibuprofen') calcDose = `${Math.round(w * 10)} мг/доза`;
      else if (d === 'ceftriaxone') calcDose = `${Math.round(w * (ind === 'severe' ? 100 : 50))} мг/сут`;
      else if (d === 'epinephrine') calcDose = `${(w * 0.01).toFixed(2)} мг (${(w * 0.01).toFixed(2)} мл 1:1000) в/м`;
      else if (d === 'dexamethasone') calcDose = `${(w * 0.6).toFixed(1)} мг однократно`;
      else if (d === 'ondansetron') calcDose = `${(w * 0.15).toFixed(1)} мг`;
    }

    return {
      value: calcDose !== '—' ? calcDose : e.mgkg,
      unit: 'педиатрическая доза',
      interpretation: `${d}: ${e.mgkg}, ${e.freq}`,
      color: '#4B8DF5',
      details: `Препарат: ${d}. Масса: ${w || '—'} кг. Показание: ${ind}.\n\nДоза: ${e.mgkg}\nЧастота: ${e.freq}\nПуть: ${e.route}\nМакс: ${e.max}\nФорма: ${e.prep}\nРасчёт для ${w || '?'} кг: ${calcDose}\n\nПримечание: ${e.note}\n\n*Harriet Lane Handbook (Johns Hopkins Hospital) — ведущий справочник педиатрических доз в США.*`,
      actions: [
        'Сверить в Harriet Lane Handbook (23-е изд., 2024) или приложении Harriet Lane',
        'Проверить по возрасту: новорождённые / младенцы имеют отдельные дозы',
        'Округлить до удобной формы (мл суспензии)',
        'Проверить max не превышена у крупных детей (> 40 кг = взрослая доза)',
        'Родителям — инструкция с шприцем-дозатором (не чайной ложкой)',
      ],
      caveats: [
        'Harriet Lane — US-стандарт; в РФ используется "Педиатрическая фармакология" (Баранов)',
        'Новорождённые (< 28 дней) — отдельная таблица (часто mg/kg/dose × 2 в сутки)',
        'Недоношенные — пересчёт на постконцептуальный возраст',
        'При ожирении дозировать по идеальной массе (IBW) для липофильных препаратов',
        'Почечные дозы: сверить eGFR по Schwartz (педиатрическая формула)',
      ],
      related: [
        { id: 'nelson-dosing', title: 'Nelson Pediatric Antimicrobial Therapy' },
        { id: 'bnf-children', title: 'BNF for Children (UK)' },
        { id: 'schwartz-egfr', title: 'Schwartz eGFR (педиатрия)' },
      ],
      relatedCourses: [
        { id: '308.1', title: 'Клиническая фармакология' },
        { id: '302.1', title: 'Педиатрия' },
        { id: '305.2', title: 'Рациональная антибиотикотерапия' },
      ],
    };
  },
  reference: 'Hughes HK, Kahl LK (eds). The Harriet Lane Handbook. 23rd ed. Elsevier; 2024. Johns Hopkins Hospital.',
  countries: 'США (Johns Hopkins) · международный стандарт педиатрии',
  presets: [
    { label: 'Амоксициллин — отит 15 кг', values: { drug: 'amoxicillin', weight: 15, indication: 'standard' } },
    { label: 'Парацетамол — 10 кг лихорадка', values: { drug: 'paracetamol', weight: 10, indication: 'fever' } },
    { label: 'Эпинефрин — 20 кг анафилаксия', values: { drug: 'epinephrine', weight: 20, indication: 'anaphylaxis' } },
  ],
  info: `### Для чего используется\n**The Harriet Lane Handbook** (Johns Hopkins Hospital) — ведущий карманный справочник педиатрической практики и дозирования в США. Обновляется резидентами педиатрии каждые 2-3 года.\n\n### Структура дозы\n- **мг/кг/доза** или **мг/кг/сут ÷ N приёмов**\n- **Частота** (каждые N часов)\n- **Путь** (перорально / в/в / в/м / ректально)\n- **Максимальная доза** (для крупных детей → взрослая)\n- **Форма / подготовка** (суспензия, таблетки)\n\n### Когда применять\n- Расчёт любой педиатрической дозы\n- Антибиотики по возрасту / весу\n- Парентеральное питание, реанимация\n- Неотложные дозы (эпинефрин, аденозин, амиодарон)\n- Новорождённые — отдельная глава\n\n### Альтернативы\n- **Nelson Pediatric Antimicrobial Therapy** (АБ-специфично)\n- **BNF for Children** (Великобритания)\n- **WHO Model Formulary for Children**\n- **Lexicomp Pediatric** (электронно)`,
};
export default runner;
