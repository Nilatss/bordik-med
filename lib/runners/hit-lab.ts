// @ts-nocheck
/** Runner: hit-lab — HIT laboratory diagnostics integration (4T + PF4 ELISA OD + SRA) */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'fourt', label: '4T score', type: 'number', unit: 'балл', min: 0, max: 8, step: 1, quickValues: [3, 5, 6, 7] },
    { id: 'od', label: 'PF4/гепарин ELISA OD (оптич. плотность)', type: 'number', unit: 'OD', min: 0, max: 3.5, step: 0.05, quickValues: [0.3, 0.5, 1.0, 1.5, 2.0] },
    { id: 'sra', label: 'SRA (% высвобождение серотонина)', type: 'number', unit: '%', min: 0, max: 100, step: 1, quickValues: [0, 10, 30, 60, 90] },
    { id: 'sra_done', label: 'SRA выполнен', type: 'checkbox' },
  ],
  compute: (v) => {
    const fourt = Number(v.fourt) || 0;
    const od = Number(v.od) || 0;
    const sra = Number(v.sra) || 0;
    const sraDone = !!v.sra_done;

    // 4T category
    let tCat = 'низкая';
    if (fourt >= 6) tCat = 'высокая';
    else if (fourt >= 4) tCat = 'промежут.';

    // ELISA: positive ≥ 0.4 OD; strong > 1.0
    let elisa = 'отриц.';
    if (od >= 1.0) elisa = 'сильно +';
    else if (od >= 0.4) elisa = 'слабо +';

    // SRA: positive ≥ 20 % release
    const sraPos = sraDone && sra >= 20;

    let verdict = '';
    let color = '#22C55E';
    const actions = [];

    if (tCat === 'низкая' && od < 0.4) {
      verdict = 'HIT исключён (4T низкий + ELISA отриц.)';
      color = '#22C55E';
      actions.push('Продолжить гепарин');
      actions.push('Искать альтернативные причины тромбоцитопении');
    } else if (sraDone && sraPos && fourt >= 4) {
      verdict = 'HIT ПОДТВЕРЖДЁН (SRA + + 4T ≥ 4)';
      color = '#EF4444';
      actions.push('Немедленно отменить ВЕСЬ гепарин (вкл. промывания катетеров)');
      actions.push('Аргатробан 2 мкг/кг/мин или бивалирудин');
      actions.push('При почечной недост. — аргатробан (печёночная элим.)');
      actions.push('Варфарин ТОЛЬКО после Plt > 150 + перекрытие ≥ 5 дн');
      actions.push('УЗДС вен ног для скрининга тромбоза');
    } else if (sraDone && !sraPos && od >= 0.4) {
      verdict = 'ELISA + / SRA − → неспецифические антитела';
      color = '#F59E0B';
      actions.push('HIT маловероятен, но мониторинг клиники');
      actions.push('Решение о гепарине — индивидуально на основании 4T');
    } else if (od >= 1.0 && tCat !== 'низкая') {
      verdict = 'Сильно + ELISA (OD ≥ 1,0) + клиника → HIT вероятен';
      color = '#EF4444';
      actions.push('Отменить гепарин эмпирически');
      actions.push('Заказать SRA для подтверждения');
      actions.push('Негепариновый антикоагулянт (аргатробан/бивалирудин)');
    } else if (od >= 0.4 && tCat !== 'низкая') {
      verdict = 'Слабо + ELISA + клиника → требуется SRA';
      color = '#F59E0B';
      actions.push('Отменить гепарин до SRA');
      actions.push('Начать аргатробан / бивалирудин');
      actions.push('SRA для окончательного подтверждения');
    } else if (tCat === 'высокая' && od < 0.4) {
      verdict = 'Высокий 4T при отриц. ELISA — повторить через 24-48 ч';
      color = '#F59E0B';
      actions.push('Повторить ELISA через 1-2 сут (серонегативный период)');
      actions.push('Рассмотреть переход на негепариновый антикоагулянт');
    } else {
      verdict = 'Интерпретируйте с учётом полной клиники';
      color = '#F59E0B';
    }

    return {
      value: `4T=${fourt} · OD=${od.toFixed(2)} · SRA=${sraDone ? sra + ' %' : 'не вып.'}`,
      unit: 'HIT панель',
      interpretation: verdict,
      color,
      details: `**Диагностика HIT (ASH 2018):**
1. 4T score = ${fourt} (${tCat} клинич. вероятность)
2. ELISA PF4/гепарин OD = ${od.toFixed(2)} (${elisa}; + ≥ 0,4; сильно + > 1,0)
3. SRA = ${sraDone ? sra + ' %' : 'не выполнен'} (+ ≥ 20 %)

**Байесовская интеграция:** только комбинация высокой клин. вероятности (4T ≥ 4) + положительного функционального теста (SRA) подтверждает HIT.`,
      actions,
      caveats: [
        'ELISA чувствителен (~ 99 %), но неспецифичен (до 30 % ложно-+, особенно в кардиохирургии)',
        'SRA — золотой стандарт (спец. > 95 %), но доступен в реф. центрах',
        'OD > 2,0 — сильнейшая корреляция с функцион. положит. антителами (> 90 % SRA+)',
        'В первые 24-48 ч возможен серонегативный HIT — повторять при клин. подозрении',
        'Не переливать тромбоциты (усугубляет тромбоз)',
        'Варфарин противопоказан до Plt > 150 — риск варфариновой гангрены',
      ],
      scale: {
        segments: [
          { min: 0, max: 0.4, label: 'ELISA отриц.', color: '#22C55E' },
          { min: 0.4, max: 1.0, label: 'Слабо +', color: '#F59E0B' },
          { min: 1.0, max: 3.5, label: 'Сильно +', color: '#EF4444' },
        ],
        current: Math.min(od, 3.5),
        unit: 'OD',
      },
      relatedCourses: [
        { id: '303.2', title: 'Гематология' },
        { id: '304.1', title: 'Лаб. диагностика' },
      ],
      related: [
        { id: '4t', title: '4T score' },
        { id: 'plasmic', title: 'PLASMIC' },
      ],
    };
  },
  reference: 'Cuker A et al. Blood Adv 2018;2:3360-92 (ASH 2018). Warkentin TE, Greinacher A. Blood 2017;129:2864.',
  countries: 'Международный (ASH 2018)',
  presets: [
    { label: 'HIT исключён', values: { fourt: 2, od: 0.2, sra: 0, sra_done: false } },
    { label: 'HIT подтверждён', values: { fourt: 7, od: 2.2, sra: 80, sra_done: true } },
    { label: 'Неопределённо', values: { fourt: 5, od: 0.6, sra: 0, sra_done: false } },
  ],
  info: `### Для чего используется
**Интегративная диагностика гепарин-индуцированной тромбоцитопении (HIT II)** — сочетание клинической вероятности (4T), серологического теста (ELISA) и функционального теста (SRA) по алгоритму ASH 2018.

### Алгоритм (ASH 2018)
1. **4T score** — клиническая предтестовая вероятность
2. **ELISA PF4/гепарин** — скрининг (OD ≥ 0,4 = +)
3. **SRA (или HIPA)** — подтверждение (высвобождение серотонина ≥ 20 %)

### Байесовская матрица
| 4T | ELISA | SRA | Трактовка |
|---|---|---|---|
| Низкий | Любой | — | HIT исключён |
| Промежут./высокий | Отриц. (OD < 0,4) | — | HIT маловероятен, повторить через 24-48 ч |
| Любой | OD 0,4-1,0 | + | HIT |
| Любой | OD > 1,0 | + | HIT высоко вероятен |
| Промежут./высокий | + | − | Неспецифические антитела, HIT маловероятен |

### OD значения (прогностика)
| OD | SRA + вероятность |
|---|---|
| 0,4-0,99 | ~ 5-15 % |
| 1,0-1,99 | ~ 50 % |
| ≥ 2,0 | > 90 % |

### Тактика при подтверждённом HIT
1. Отменить **весь** гепарин (включая промывания катетеров, покрытия)
2. **Аргатробан** 2 мкг/кг/мин (титр. по aPTT 1,5-3×) — печёночная элим.
3. **Бивалирудин** 0,15-0,2 мг/кг/ч — при почечной недост. альтернативно
4. **Фондапаринукс** 7,5 мг п/к 1 р/сут (off-label, ASH IIa)
5. Варфарин ТОЛЬКО после Plt > 150 с перекрытием ≥ 5 дн
6. УЗДС вен ног (скрининг TVP)

### Ограничения
- ELISA не дифференцирует патогенные и непатогенные антитела
- SRA требует референс-лаб, задержка 3-7 дн
- Быстрые «латексные» агглютинационные тесты — ниже специфичность
- Спонтанный HIT (без воздействия гепарина) — редкий, но описан

### Источник
Cuker A, Arepally GM, Chong BH et al. American Society of Hematology 2018 guidelines for management of venous thromboembolism: heparin-induced thrombocytopenia. *Blood Adv* 2018;2:3360-3392.`,
};

export default runner;
