// @ts-nocheck
/** Runner: credmeds */
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
        { value: 'azithromycin', label: 'Азитромицин' },
        { value: 'clarithromycin', label: 'Кларитромицин' },
        { value: 'ciprofloxacin', label: 'Ципрофлоксацин' },
        { value: 'levofloxacin', label: 'Левофлоксацин' },
        { value: 'moxifloxacin', label: 'Моксифлоксацин' },
        { value: 'ondansetron', label: 'Ондансетрон' },
        { value: 'haloperidol', label: 'Галоперидол' },
        { value: 'methadone', label: 'Метадон' },
        { value: 'amiodarone', label: 'Амиодарон' },
        { value: 'sotalol', label: 'Соталол' },
        { value: 'citalopram', label: 'Циталопрам' },
        { value: 'escitalopram', label: 'Эсциталопрам' },
        { value: 'domperidone', label: 'Домперидон' },
      ],
    },
    {
      id: 'risk',
      label: 'Дополнительные факторы риска',
      type: 'select',
      options: [
        { value: 'none', label: 'Нет' },
        { value: 'congenital', label: 'Врождённый LQTS в анамнезе' },
        { value: 'electrolytes', label: 'Гипокалиемия / гипомагниемия' },
        { value: 'brady', label: 'Брадикардия < 50/мин' },
        { value: 'female', label: 'Женский пол + возраст > 65' },
        { value: 'multi', label: 'Несколько факторов одновременно' },
      ],
    },
  ],
  compute: (v) => {
    const d = String(v.drug);
    const r = String(v.risk);
    const known = ['azithromycin', 'clarithromycin', 'moxifloxacin', 'haloperidol', 'methadone', 'amiodarone', 'sotalol', 'citalopram', 'escitalopram'];
    const possible = ['ciprofloxacin', 'levofloxacin'];
    const conditional = ['ondansetron', 'domperidone'];
    let cat: 'Known' | 'Possible' | 'Conditional' | 'Congenital' = 'Possible';
    let color = '#F59E0B';
    let score = 2;
    if (known.includes(d)) { cat = 'Known'; color = '#EF4444'; score = 3; }
    else if (possible.includes(d)) { cat = 'Possible'; color = '#F59E0B'; score = 2; }
    else if (conditional.includes(d)) { cat = 'Conditional'; color = '#FBBF24'; score = 1; }
    if (r === 'congenital') { cat = 'Congenital'; color = '#991B1B'; score = 4; }
    if (r === 'multi' && cat !== 'Congenital') { color = '#991B1B'; score = Math.min(4, score + 1); }

    const catDesc: Record<string, string> = {
      Known: 'Known Risk of TdP — доказанный риск удлинения QT и пуантов',
      Possible: 'Possible Risk of TdP — может удлинять QT, TdP в отдельных сообщениях',
      Conditional: 'Conditional Risk — только при доп. факторах (передозировка, электролиты, взаимодействия)',
      Congenital: 'Drugs to Avoid in Congenital LQTS — избегать у пациентов с врождённым синдромом',
    };

    return {
      value: cat,
      unit: 'CredibleMeds',
      interpretation: catDesc[cat],
      color,
      details: `Препарат: ${d}. Категория риска TdP: ${cat}.\n\n${catDesc[cat]}\n\nДоп. факторы: ${r}.\n\nРекомендации по мониторингу:\n- ЭКГ исходно (QTc по Bazett/Fridericia)\n- QTc > 500 мс или ΔQTc > 60 мс — отменить\n- Коррекция K+ > 4,0 ммоль/л, Mg2+ > 2,0 мг/дл\n- Избегать комбинаций 2+ QT-удлиняющих препаратов\n- При Known Risk + риск-факторы → альтернативный препарат`,
      actions: [
        'Открыть crediblemeds.org → QTDrugs Lists → проверить категорию',
        'Снять ЭКГ до начала и через 3-5 дней терапии',
        'Коррекция электролитов (K+, Mg2+, Ca2+) до начала',
        'Отмена при QTc > 500 мс или увеличении на ≥ 60 мс',
        'Документировать риск в карте пациента',
      ],
      caveats: [
        'База обновляется AZCERT ежемесячно; используйте онлайн-версию',
        'Категория Conditional зависит от дозы, скорости инфузии, взаимодействий',
        'При Congenital LQTS — консультация аритмолога перед любым QT-препаратом',
        'QT-интервал — корригированный (Bazett при ЧСС 60-100, Fridericia при тахи/бради)',
        'Беременность/почечная недостаточность — отдельный риск накопления',
      ],
      related: [
        { id: 'lexicomp', title: 'Lexicomp (взаимодействия)' },
        { id: 'sanford', title: 'Sanford Guide (макролиды/ФХ)' },
        { id: 'qtc-bazett', title: 'Коррекция QT по Bazett' },
      ],
      relatedCourses: [
        { id: '308.3', title: 'Лекарственные взаимодействия' },
        { id: '308.1', title: 'Клиническая фармакология' },
        { id: '303.2', title: 'Нарушения ритма' },
      ],
      scale: [
        { from: 0, to: 1, label: 'Conditional', color: '#FBBF24' },
        { from: 1, to: 2, label: 'Possible', color: '#F59E0B' },
        { from: 2, to: 3, label: 'Known', color: '#EF4444' },
        { from: 3, to: 4, label: 'Congenital avoid', color: '#991B1B' },
      ] as ResultScaleSegment[],
      scaleValue: score,
    };
  },
  reference: 'Woosley RL, Heise CW, Gallo T, Tate J, Woosley D, Romero KA. www.CredibleMeds.org, AZCERT, Oro Valley, AZ.',
  countries: 'Международный (AZCERT, США)',
  presets: [
    { label: 'Азитромицин — обычный пациент', values: { drug: 'azithromycin', risk: 'none' } },
    { label: 'Ондансетрон + гипокалиемия', values: { drug: 'ondansetron', risk: 'electrolytes' } },
    { label: 'Метадон + врождённый LQTS', values: { drug: 'methadone', risk: 'congenital' } },
  ],
  info: `### Для чего используется\n**CredibleMeds (AZCERT)** — единственная независимая международная база QT-удлиняющих препаратов с доказательной классификацией риска TdP.\n\n### 4 категории\n| Категория | Значение |\n|---|---|\n| Known Risk | Доказанный риск TdP при терапевтических дозах |\n| Possible Risk | Удлиняет QT, TdP сообщался эпизодически |\n| Conditional Risk | Только при доп. факторах (передоз, ↓K+, взаимодействия) |\n| Congenital LQTS Avoid | Избегать у пациентов с врождённым синдромом |\n\n### Когда применять\n- Назначение макролида/фторхинолона/антипсихотика\n- Пациент уже получает QT-препарат — проверка совместимости\n- Врождённый LQTS — полный список препаратов для избегания\n- Онкология (тирозинкиназные ингибиторы, антиэметики)`,
};
export default runner;
