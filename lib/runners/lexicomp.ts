// @ts-nocheck
/** Runner: lexicomp */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'drugA',
      label: 'Препарат A',
      type: 'select',
      options: [
        { value: 'warfarin', label: 'Варфарин' },
        { value: 'clarithromycin', label: 'Кларитромицин' },
        { value: 'amiodarone', label: 'Амиодарон' },
        { value: 'simvastatin', label: 'Симвастатин' },
        { value: 'apixaban', label: 'Апиксабан' },
        { value: 'ssri', label: 'СИОЗС (флуоксетин)' },
        { value: 'metformin', label: 'Метформин' },
      ],
    },
    {
      id: 'drugB',
      label: 'Препарат B',
      type: 'select',
      options: [
        { value: 'clarithromycin', label: 'Кларитромицин' },
        { value: 'warfarin', label: 'Варфарин' },
        { value: 'simvastatin', label: 'Симвастатин' },
        { value: 'rifampin', label: 'Рифампицин' },
        { value: 'ketoconazole', label: 'Кетоконазол' },
        { value: 'tramadol', label: 'Трамадол' },
        { value: 'contrast', label: 'Йодсодержащий контраст' },
      ],
    },
    {
      id: 'category',
      label: 'Категория риска',
      type: 'select',
      options: [
        { value: 'auto', label: 'Автоопределение' },
        { value: 'A', label: 'A — нет известного взаимодействия' },
        { value: 'B', label: 'B — без действий' },
        { value: 'C', label: 'C — мониторинг терапии' },
        { value: 'D', label: 'D — рассмотреть модификацию' },
        { value: 'X', label: 'X — избегать комбинации' },
      ],
    },
  ],
  compute: (v) => {
    const a = String(v.drugA);
    const b = String(v.drugB);
    let cat = String(v.category || 'auto');
    let mechanism = 'См. монографию Lexicomp / UpToDate.';
    let severity = 'Категория C — рутинный мониторинг.';
    let alt = '—';
    if (cat === 'auto') {
      if ((a === 'warfarin' && b === 'clarithromycin') || (a === 'clarithromycin' && b === 'warfarin')) {
        cat = 'D'; mechanism = 'Ингибирование CYP3A4 и вытеснение из белков — ↑ МНО/кровотечения.';
        severity = 'Категория D — снизить дозу варфарина, контроль МНО через 3-5 дней.';
        alt = 'Азитромицин (меньше CYP3A4).';
      } else if ((a === 'simvastatin' && b === 'clarithromycin') || (a === 'clarithromycin' && b === 'simvastatin')) {
        cat = 'X'; mechanism = 'Сильное ингибирование CYP3A4 → ↑↑ уровня симвастатина → рабдомиолиз.';
        severity = 'Категория X — избегать; симвастатин приостановить на время курса макролида.';
        alt = 'Правастатин/розувастатин (не метаболизируются через CYP3A4).';
      } else if ((a === 'simvastatin' && b === 'ketoconazole') || (a === 'ketoconazole' && b === 'simvastatin')) {
        cat = 'X'; mechanism = 'Азолы — мощные ингибиторы CYP3A4.';
        severity = 'Категория X — противопоказано.';
        alt = 'Правастатин / флувастатин.';
      } else if ((a === 'apixaban' && b === 'rifampin') || (a === 'rifampin' && b === 'apixaban')) {
        cat = 'X'; mechanism = 'Индукция CYP3A4/P-gp → ↓ концентрации апиксабана, потеря эффективности.';
        severity = 'Категория X — избегать; рассмотреть НМГ/варфарин.';
        alt = 'Варфарин с контролем МНО.';
      } else if ((a === 'ssri' && b === 'tramadol') || (a === 'tramadol' && b === 'ssri')) {
        cat = 'D'; mechanism = 'Серотонинергическая нагрузка + ингибирование CYP2D6 → серотониновый синдром.';
        severity = 'Категория D — использовать минимально, мониторить признаки гипертермии/ригидности.';
        alt = 'Парацетамол / габапентиноиды.';
      } else if ((a === 'metformin' && b === 'contrast') || (a === 'contrast' && b === 'metformin')) {
        cat = 'D'; mechanism = 'Риск лактат-ацидоза при ОПН после контраста.';
        severity = 'Категория D — отменить метформин перед введением при eGFR < 60, возобновить через 48 ч.';
        alt = 'Временная отмена метформина.';
      } else {
        cat = 'C'; mechanism = 'Взаимодействие не подтверждено как тяжёлое — уточните в Lexicomp.';
      }
    }
    const colorMap: Record<string, string> = { A: '#22C55E', B: '#22C55E', C: '#F59E0B', D: '#EF4444', X: '#991B1B' };
    const labelMap: Record<string, string> = {
      A: 'Риск A — взаимодействия нет',
      B: 'Риск B — без действий',
      C: 'Риск C — мониторинг',
      D: 'Риск D — рассмотреть модификацию',
      X: 'Риск X — избегать',
    };
    return {
      value: `Lexicomp ${cat}`,
      unit: 'категория',
      interpretation: labelMap[cat] || `Риск ${cat}`,
      color: colorMap[cat] || '#6B7280',
      details: `Пара: ${a} + ${b}.\n\nМеханизм: ${mechanism}\n\nДействие: ${severity}\n\nАльтернатива: ${alt}\n\nДоступ к полному анализу — через институциональную подписку UpToDate Lexidrug (Lexicomp) или мобильное приложение Lexicomp.`,
      actions: [
        'Открыть UpToDate → Drug Interactions → ввести оба препарата',
        'Сверить категорию (A/B/C/D/X) и прочитать Patient Management',
        'При X — заменить один из препаратов; при D — снизить дозу / разнести по времени',
        'Документировать взаимодействие в истории болезни (ФИО, дата проверки, категория)',
      ],
      caveats: [
        'Lexicomp обновляется еженедельно — ссылайтесь на текущую онлайн-версию, не кэш',
        'Категория X не всегда абсолютное противопоказание — учитывайте пользу/риск',
        'Взаимодействия пища-препарат и фитопрепараты тоже доступны в Lexicomp',
        'Для РФ-брендов предварительно уточнить МНН (INN)',
      ],
      related: [
        { id: 'stockley', title: 'Stockley\'s Interactions (UK)' },
        { id: 'bnf', title: 'BNF' },
        { id: 'rls-ru', title: 'РЛС (РФ)' },
      ],
      relatedCourses: [
        { id: '308.3', title: 'Лекарственные взаимодействия' },
        { id: '305.2', title: 'Рациональная антибиотикотерапия' },
      ],
    };
  },
  reference: 'Wolters Kluwer. Lexicomp Drug Interactions (UpToDate Lexidrug). https://www.uptodate.com/drug-interactions',
  countries: 'США / Международный',
  presets: [
    { label: 'Варфарин + Кларитромицин', values: { drugA: 'warfarin', drugB: 'clarithromycin', category: 'auto' } },
    { label: 'Симвастатин + Кларитромицин', values: { drugA: 'simvastatin', drugB: 'clarithromycin', category: 'auto' } },
    { label: 'Апиксабан + Рифампицин', values: { drugA: 'apixaban', drugB: 'rifampin', category: 'auto' } },
  ],
  info: `### Для чего используется\n**Lexicomp (UpToDate Lexidrug)** — крупнейшая профессиональная база лекарственных взаимодействий с категориальной шкалой риска A→X.\n\n### Категории риска\n| Код | Значение |\n|---|---|\n| A | Нет известного взаимодействия |\n| B | Без клинически значимых действий |\n| C | Мониторировать терапию |\n| D | Рассмотреть модификацию режима |\n| X | Избегать комбинации |\n\n### Когда применять\n- Пациент на 5+ препаратах (полипрагмазия)\n- Добавление антибиотика к пациенту на варфарине/DOAC\n- Пересадка органов (CNI + CYP3A4-препараты)\n- Онкология (таргетные ± сопутствующие препараты)\n\n### Источник\nhttps://www.uptodate.com/drug-interactions (требуется подписка учреждения).`,
};
export default runner;
