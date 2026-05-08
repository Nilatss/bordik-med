/** Runner: ktv */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'modality', label: 'Модальность', type: 'select', options: [
      { value: 'hd', label: 'Гемодиализ (spKt/V, Daugirdas II)', points: 0 },
      { value: 'pd', label: 'Перитонеальный (недельный Kt/V)', points: 0 },
    ] },
    { id: 'urea_pre',
hint: 'Мочевина. Норма: 2.5-7.5 ммоль/л', label: 'Мочевина до (HD) / урея в крови (PD)', type: 'number', unit: 'ммоль/л', min: 1, max: 60, step: 0.1, quickValues: [20, 25, 30] },
    { id: 'urea_post',
hint: 'Мочевина. Норма: 2.5-7.5 ммоль/л', label: 'Мочевина после HD', type: 'number', unit: 'ммоль/л', min: 0.5, max: 40, step: 0.1, quickValues: [6, 8, 10] },
    { id: 'duration', label: 'Длительность сеанса HD', type: 'number', unit: 'ч', min: 1, max: 8, step: 0.25, quickValues: [3.5, 4, 4.5] },
    { id: 'uf',
hint: 'Объём в литрах', label: 'Ультрафильтрация (снижение веса)', type: 'number', unit: 'л', min: 0, max: 6, step: 0.1, quickValues: [1, 2, 3] },
    { id: 'weight',
hint: 'Вес в кг (без одежды)', label: 'Вес после (сухой)', type: 'number', unit: 'кг', min: 30, max: 200, step: 0.5, quickValues: [60, 70, 85] },
    { id: 'pd_volume', label: 'Недельный дренаж (PD)', type: 'number', unit: 'л/нед', min: 20, max: 200, step: 1, quickValues: [60, 80, 100] },
    { id: 'pd_urea_d',
hint: 'Мочевина. Норма: 2.5-7.5 ммоль/л', label: 'Мочевина диализата (PD)', type: 'number', unit: 'ммоль/л', min: 1, max: 60, step: 0.1, quickValues: [15, 20, 25] },
    { id: 'pd_v',
hint: 'Объём в литрах', label: 'Объём распределения V (PD)', type: 'number', unit: 'л', min: 20, max: 60, step: 0.5, quickValues: [35, 40, 45] },
  ],
  compute: (v) => {
    const modality = String(v.modality);
    if (modality === 'hd') {
      const pre = Number(v.urea_pre);
      const post = Number(v.urea_post);
      const t = Number(v.duration);
      const uf = Number(v.uf);
      const w = Number(v.weight);
      // Daugirdas II: spKt/V = -ln(R - 0.008*t) + (4 - 3.5*R)*UF/W
      const R = post / Math.max(pre, 0.01);
      const ktv = -Math.log(R - 0.008 * t) + (4 - 3.5 * R) * uf / Math.max(w, 1);
      const ktvSafe = isFinite(ktv) ? ktv : 0;
      let color = '#EF4444', interpretation = 'Недостаточно';
      if (ktvSafe >= 1.4) { color = '#22C55E'; interpretation = 'Адекватно'; }
      else if (ktvSafe >= 1.2) { color = '#F59E0B'; interpretation = 'Минимально'; }

      return {
        value: ktvSafe.toFixed(2),
        unit: 'spKt/V',
        interpretation,
        color,
        details: `Daugirdas II: R=${R.toFixed(2)}, t=${t} ч, UF=${uf} л, W=${w} кг. Цель ≥1.4 (минимум 1.2).`,
        actions: ktvSafe >= 1.4
          ? ['Текущая доза адекватна — продолжить режим', 'Ежемесячный контроль']
          : ['Увеличить время или BFR диализа', 'Проверить диализатор (KoA), рециркуляцию доступа', 'Исключить ошибку забора пост-диализной крови'],
        caveats: [
          'spKt/V недооценивает при высокой UF',
          'eKt/V (equilibrated) = spKt/V − 0.6/t + 0.03 — точнее для ребаунда',
          'Кровь «после» — через 10–20 сек после остановки насоса, доступ без рециркуляции',
        ],
        scale: {
          segments: [
            { min: 0, max: 1.2, label: 'Низко', color: '#EF4444' },
            { min: 1.2, max: 1.4, label: 'Минимум', color: '#F59E0B' },
            { min: 1.4, max: 2.5, label: 'Адекватно', color: '#22C55E' },
          ],
          current: Number(Math.max(0, Math.min(2.5, ktvSafe)).toFixed(2)),
          unit: 'spKt/V',
        },
        relatedCourses: [
          { id: '301.3', title: 'Нефрология' },
          { id: '301.4', title: 'Урология' },
        ],
        related: [
          { id: 'ckd-epi', title: 'CKD-EPI' },
          { id: 'kdigo-ckd', title: 'KDIGO ХБП' },
        ],
      };
    } else {
      const pre = Number(v.urea_pre);
      const ud = Number(v.pd_urea_d);
      const vol = Number(v.pd_volume);
      const V = Number(v.pd_v);
      // Недельный KT по D/P urea = (ud/pre) * volume; Kt/V = KT / V
      const kt = (ud / Math.max(pre, 0.01)) * vol;
      const ktv = kt / Math.max(V, 1);
      let color = '#EF4444', interpretation = 'Недостаточно';
      if (ktv >= 1.7) { color = '#22C55E'; interpretation = 'Адекватно'; }
      else if (ktv >= 1.5) { color = '#F59E0B'; interpretation = 'Минимально'; }

      return {
        value: ktv.toFixed(2),
        unit: 'Kt/V нед.',
        interpretation,
        color,
        details: `Недельный Kt/V PD: (D/P мочевины ${(ud / pre).toFixed(2)}) × объём ${vol} л / V ${V} л. Цель ≥1.7.`,
        actions: ktv >= 1.7
          ? ['Режим адекватен — продолжить', 'Контроль PET-теста каждые 6 мес']
          : ['Увеличить объём обмена или частоту', 'Оценить остаточную функцию почек (суммарный Kt/V)', 'Рассмотреть переход на APD/CCPD'],
        caveats: [
          'Учитывать остаточную функцию почек (renal Kt/V)',
          'D/P urea зависит от типа транспортёра (high/low)',
          'ISPD: минимум 1.7/нед (Total = peritoneal + renal)',
        ],
        scale: {
          segments: [
            { min: 0, max: 1.5, label: 'Низко', color: '#EF4444' },
            { min: 1.5, max: 1.7, label: 'Минимум', color: '#F59E0B' },
            { min: 1.7, max: 3, label: 'Адекватно', color: '#22C55E' },
          ],
          current: Number(Math.max(0, Math.min(3, ktv)).toFixed(2)),
          unit: 'Kt/V нед.',
        },
        relatedCourses: [
          { id: '301.3', title: 'Нефрология' },
          { id: '301.4', title: 'Урология' },
        ],
        related: [
          { id: 'ckd-epi', title: 'CKD-EPI' },
        ],
      };
    }
  },
  reference: 'Daugirdas JT, JASN 1993 (HD). ISPD 2020 Guidelines (PD).',
  countries: 'Международный (KDIGO/ISPD)',
  presets: [
    { label: 'HD адекватный', values: { modality: 'hd', urea_pre: 25, urea_post: 8, duration: 4, uf: 2, weight: 70, pd_volume: 80, pd_urea_d: 20, pd_v: 40 } },
    { label: 'HD недостаточный', values: { modality: 'hd', urea_pre: 25, urea_post: 14, duration: 3, uf: 1, weight: 80, pd_volume: 80, pd_urea_d: 20, pd_v: 40 } },
    { label: 'PD адекватный', values: { modality: 'pd', urea_pre: 20, urea_post: 8, duration: 4, uf: 2, weight: 70, pd_volume: 100, pd_urea_d: 16, pd_v: 38 } },
  ],
  info: `### Для чего используется
**Kt/V** — показатель дозы диализа (клиренс × время / объём распределения мочевины).

### Гемодиализ (spKt/V)
Формула Daugirdas II:
\`spKt/V = -ln(R - 0.008·t) + (4 - 3.5·R)·UF/W\`
где R = Мочевина_после/Мочевина_до.
Цель: **≥1.4** за сеанс 3×/нед (минимум 1.2).

### Перитонеальный (недельный Kt/V)
\`Kt/V = (D/P_urea × объём дренажа)/V\`
Цель суммарный (перитонеальный + остаточный ренальный) **≥1.7/нед**.`,
};
export default runner;
