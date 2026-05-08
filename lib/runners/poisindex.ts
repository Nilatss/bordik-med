/** Runner: poisindex - POISINDEX / Micromedex Toxicology */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'toxin',
      label: 'Токсин',
      type: 'select',
      options: [
        { value: 'apap', label: 'Ацетаминофен (APAP) - Rumack-Matthew' },
        { value: 'asa', label: 'Салицилаты - Done nomogram' },
        { value: 'eg', label: 'Этиленгликоль' },
        { value: 'methanol', label: 'Метанол' },
        { value: 'li', label: 'Литий' },
        { value: 'tca', label: 'Трициклические антидепрессанты' },
      ],
    },
    {
      id: 'dose',
      label: 'Принятая доза (мг)',
      type: 'number',
      unit: 'мг',
      min: 0,
      max: 100000,
      step: 100,
      quickValues: [500, 2000, 5000, 10000, 20000],
    },
    {
      id: 'weight',
      hint: 'Вес в кг (без одежды)',
      label: 'Масса тела',
      type: 'number',
      unit: 'кг',
      min: 3,
      max: 200,
      step: 1,
      quickValues: [10, 20, 50, 70, 80],
    },
    {
      id: 'timeSinceIngestion',
      label: 'Время от приёма, ч',
      type: 'number',
      unit: 'ч',
      min: 0,
      max: 72,
      step: 0.5,
      quickValues: [1, 4, 8, 12, 24],
    },
  ],
  compute: (v) => {
    const tox = String(v.toxin || 'apap');
    const dose = Number(v.dose) || 0;
    const w = Number(v.weight) || 70;
    const t = Number(v.timeSinceIngestion) || 0;
    const mgPerKg = w > 0 ? dose / w : 0;

    let verdict = 'Нетоксичная доза';
    let color = '#22C55E';
    let threshold = 0;
    let antidote = '';
    let details = '';

    if (tox === 'apap') {
      threshold = 150;
      antidote = 'N-ацетилцистеин (NAC): 150 мг/кг за 1 ч → 50 мг/кг за 4 ч → 100 мг/кг за 16 ч (PO: 140 → 70 × 17 доз)';
      details = `Rumack-Matthew nomogram: токсичная линия 150 мкг/мл в 4 ч / 37.5 мкг/мл в 12 ч. Доза ${mgPerKg.toFixed(1)} мг/кг (порог ${threshold} мг/кг или 7.5 г). Забор уровня APAP через 4 ч после приёма.`;
      if (mgPerKg >= 150) { verdict = 'Потенциально токсично - NAC по номограмме'; color = '#EF4444'; }
      else if (mgPerKg >= 75) { verdict = 'Повторное приём > 150 мг/кг/24 ч - оценить'; color = '#F59E0B'; }
    } else if (tox === 'asa') {
      threshold = 150;
      antidote = 'Алкализация мочи: NaHCO₃ 1-2 мЭкв/кг болюс → инфузия до pH мочи 7.5-8. Гемодиализ при уровне > 100 мг/дл, ОПП, лёгочный отёк, ЦНС';
      details = `Done nomogram устарела - не использовать для хрон. Острое: ${mgPerKg.toFixed(1)} мг/кг. 150-300 мг/кг - умеренно; > 300 - тяжело; > 500 - потенциально летально.`;
      if (mgPerKg >= 500) { verdict = 'Потенциально летально'; color = '#7C2D12'; }
      else if (mgPerKg >= 300) { verdict = 'Тяжёлая интоксикация'; color = '#EF4444'; }
      else if (mgPerKg >= 150) { verdict = 'Умеренная'; color = '#F59E0B'; }
    } else if (tox === 'eg') {
      threshold = 1;
      antidote = 'Фомепизол 15 мг/кг в/в болюс → 10 мг/кг каждые 12 ч × 4 → 15 мг/кг до уровня < 20 мг/дл. Гемодиализ при ОПП, ацидозе, уровне > 50 мг/дл';
      details = `Этиленгликоль токсичен > 1 мл/кг (antifreeze). Метаболиты: гликольат, оксалат → ОПП. Осмолярная щель рано, анионная поздно. Флуоресценция мочи в УФ.`;
      if (dose > 30 || mgPerKg > 1000) { verdict = 'Потенциально летально - фомепизол + диализ'; color = '#EF4444'; }
      else if (dose > 0) { verdict = 'Подозрение на отравление'; color = '#F59E0B'; }
    } else if (tox === 'methanol') {
      antidote = 'Фомепизол 15 мг/кг в/в + гемодиализ + фолиновая к-та 50 мг в/в × 6 ч';
      details = `Метанол токсичен > 0.1 г/кг. Метаболит - формиат → метаболический ацидоз, слепота. Уровень > 20 мг/дл - токсично; > 50 - антидот + диализ.`;
      if (dose > 0) { verdict = 'Подозрение - антидот + диализ'; color = '#EF4444'; }
    } else if (tox === 'li') {
      antidote = 'Гемодиализ при уровне > 4 мЭкв/л (или > 2.5 с симптомами / ОПП). В/в физраствор для выведения';
      details = `Литий терапевтический 0.6-1.2 мЭкв/л. Острый: уровень при 6-12 ч, токсично > 1.5. Хронический: токсично > 1.2.`;
      if (mgPerKg > 40) { verdict = 'Потенциально токсично'; color = '#EF4444'; }
    } else if (tox === 'tca') {
      antidote = 'NaHCO₃ 1-2 мЭкв/кг болюс при QRS > 100 мс / гипотензии / аритмии; повтор до pH 7.5-7.55';
      details = `ТЦА: натриевая блокада (QRS > 100), антихолинергический синдром, серотониновый, гипотензия, судороги. Летально > 1 г.`;
      if (dose > 1000) { verdict = 'Потенциально летально'; color = '#EF4444'; }
      else if (dose > 500) { verdict = 'Серьёзное отравление'; color = '#F59E0B'; }
    }

    return {
      value: verdict,
      unit: '',
      interpretation: `${verdict}. Доза ${dose} мг (${mgPerKg.toFixed(1)} мг/кг), время от приёма ${t} ч. ${details}`,
      color,
      details,
      actions: [
        'ABC + мониторинг, в/в доступ × 2',
        'Забор крови: токсикологический скрин, уровень конкретного токсина в правильное время',
        'Активированный уголь 1 г/кг PO, если < 1-2 ч от приёма (НЕ при corrosive, невегетативном сознании без интубации)',
        `Антидот: ${antidote}`,
        'Контакт: региональный токсцентр / POISINDEX',
        'Мониторинг: ЭКГ, газы, электролиты, lactate, осмолярная и анионная щели',
        'ПДС / гемодиализ - по показаниям',
        'Психиатрическая консультация при суицидальной попытке',
      ],
      caveats: [
        'Done nomogram для ASA - ОТМЕНЁН (ненадёжен, особенно для хрон. интоксикации)',
        'Rumack-Matthew - только для ОДНОкратного острого приёма; повторные дозы и extended-release оценивать иначе',
        'Активированный уголь НЕ эффективен против: алкоголей, тяжёлых металлов, Li, железа, кислот/щелочей',
        'Sorbitol / promethazine-контaining уголь не давать детям',
        'Whole-bowel irrigation при extended-release, железо, Li, body packers',
        'Intralipid - для липофильных кардиотоксикантов (bupivacaine, BB, CCB)',
      ],
      scale: {
        segments: [
          { label: 'Безопасно', min: 0, max: 1, color: '#22C55E', description: 'Нет антидота' },
          { label: 'Наблюдение', min: 2, max: 2, color: '#10B981', description: 'Уголь, мониторинг' },
          { label: 'Лечение', min: 3, max: 3, color: '#F59E0B', description: 'Антидот' },
          { label: 'Критично', min: 4, max: 4, color: '#EF4444', description: 'Диализ / ICU' },
        ],
        current: color === '#EF4444' || color === '#7C2D12' ? 4 : color === '#F59E0B' ? 3 : color === '#22C55E' ? 1 : 2,
        unit: '',
      },
      related: [
        { id: 'antidote', title: 'Антидоты' },
        { id: 'ahls', title: 'AHLS' },
        { id: 'rumack-matthew', title: 'Rumack-Matthew' },
      ],
      relatedCourses: [
        { id: '303.6', title: 'Токсикология' },
        { id: '300.4', title: 'Неотложная помощь' },
      ],
    };
  },
  reference: 'Micromedex POISINDEX® System. Truven Health Analytics/IBM Watson. Nelson LS, Howland MA et al. Goldfrank\'s Toxicologic Emergencies, 11th ed. 2019. Rumack BH, Matthew H. Pediatrics 1975;55:871.',
  countries: 'США (Micromedex), международная референсная БД',
  presets: [
    { label: 'APAP 10 г / 70 кг / 4 ч', values: { toxin: 'apap', dose: 10000, weight: 70, timeSinceIngestion: 4 } },
    { label: 'ASA 20 г / 80 кг', values: { toxin: 'asa', dose: 20000, weight: 80, timeSinceIngestion: 6 } },
    { label: 'Этиленгликоль 100 мл', values: { toxin: 'eg', dose: 50000, weight: 70, timeSinceIngestion: 2 } },
    { label: 'ТЦА 2 г', values: { toxin: 'tca', dose: 2000, weight: 70, timeSinceIngestion: 1 } },
    { label: 'Литий хрон. 40 мг/кг', values: { toxin: 'li', dose: 2800, weight: 70, timeSinceIngestion: 12 } },
  ],
  info: `### Для чего используется
**POISINDEX / Micromedex** - наиболее полная токсикологическая референсная база (США) для антидотов, доз, номограмм, mgt.

### Ключевые номограммы
- **Rumack-Matthew** (APAP) - 4ч уровень vs риск гепатотоксичности
- **Done** (салицилаты) - устарела, не рекомендуется
- **Ethylene glycol** - фомепизол + диализ

### Основные антидоты
| Токсин | Антидот |
|---|---|
| APAP | NAC (150/50/100 мг/кг или PO 140→70×17) |
| ASA | NaHCO₃ + диализ |
| EG/метанол | Фомепизол + диализ |
| Опиоиды | Налоксон |
| BZD | Флумазенил |
| ФОС | Атропин + пралидоксим |
| Цианид | Hydroxocobalamin |
| ТЦА | NaHCO₃ |
| CCB/BB | Ca, глюкагон, high-dose insulin, intralipid |
| Дигоксин | Digoxin Fab |

### Контакты
- US Poison Control: **1-800-222-1222**
- POISINDEX: Micromedex platform

### Источники
Goldfrank's Toxicologic Emergencies 11 ed.
Rumack BH, Matthew H. *Pediatrics* 1975;55:871.
`,
};
export default runner;
