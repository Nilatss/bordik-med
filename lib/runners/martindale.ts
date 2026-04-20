// @ts-nocheck
/** Runner: martindale */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'drugClass',
      label: 'Класс препарата',
      type: 'select',
      options: [
        { value: 'abx', label: 'Антибактериальные' },
        { value: 'antifungal', label: 'Противогрибковые' },
        { value: 'antiviral', label: 'Противовирусные' },
        { value: 'nsaid', label: 'НПВС' },
        { value: 'anticoag', label: 'Антикоагулянты' },
        { value: 'antidiab', label: 'Противодиабетические' },
        { value: 'psych', label: 'Психотропные' },
        { value: 'onc', label: 'Противоопухолевые' },
      ],
    },
    {
      id: 'query',
      label: 'Что нужно найти',
      type: 'select',
      options: [
        { value: 'inn', label: 'INN (международное непатентованное название)' },
        { value: 'forms', label: 'Доступные формы выпуска' },
        { value: 'brands', label: 'Торговые наименования по странам' },
        { value: 'monograph', label: 'Полная монография (свойства, взаимодействия)' },
      ],
    },
  ],
  compute: (v) => {
    const cls = String(v.drugClass);
    const q = String(v.query);
    const classExamples: Record<string, string> = {
      abx: 'Amoxicillin, Ceftriaxone, Azithromycin, Vancomycin',
      antifungal: 'Fluconazole, Voriconazole, Amphotericin B, Echinocandins',
      antiviral: 'Aciclovir, Oseltamivir, Remdesivir, Sofosbuvir',
      nsaid: 'Ibuprofen, Diclofenac, Celecoxib, Naproxen',
      anticoag: 'Warfarin, Heparin, Apixaban, Rivaroxaban',
      antidiab: 'Metformin, Insulin (human/analog), Empagliflozin, Semaglutide',
      psych: 'Fluoxetine, Haloperidol, Olanzapine, Lithium',
      onc: 'Doxorubicin, Cisplatin, Tamoxifen, Rituximab',
    };
    const outputs: Record<string, string> = {
      inn: 'INN (рекомендованный ВОЗ) приведён в заголовке монографии. Альтернативные названия (USAN, BAN, JAN, rINN) — в разделе Nomenclature.',
      forms: 'Разделы Preparations / Proprietary Preparations: таблетки, капсулы, растворы, суппозитории, мази — с указанием концентраций и производителей по странам.',
      brands: 'Страна-раздел: UK, USA, France, Germany, Russia, Japan, Brazil, India — торговые наименования с дозировками.',
      monograph: 'Полная монография: Pharmacopoeias → Adverse Effects → Precautions → Interactions → Pharmacokinetics → Uses and Administration → Preparations.',
    };
    return {
      value: 'Martindale lookup',
      unit: 'справка',
      interpretation: `Класс: ${cls} · Запрос: ${q}`,
      color: '#22C55E',
      details: `Класс: ${cls}. Примеры МНН: ${classExamples[cls] || '—'}.\n\n${outputs[q] || 'См. Martindale.'}\n\nMartindale (The Complete Drug Reference) издаётся Pharmaceutical Press, содержит > 6000 монографий и > 185 000 торговых наименований по 40+ странам.`,
      actions: [
        'Открыть MedicinesComplete → Martindale',
        'Ввести МНН или искомое торговое наименование',
        'Использовать Proprietary Preparations для межстранового сравнения',
        'Sверить с локальным формуляром (BNF / РЛС / FDA Orange Book)',
      ],
      caveats: [
        'Martindale — энциклопедический справочник, не национальный формуляр (рекомендации не заменяют BNF/Lexicomp)',
        'Обновляется ~ ежегодно (печатная версия)',
        'Для РФ-брендов часто требуется кросс-ссылка на РЛС',
        'Не содержит доз-руководств для рутинной практики — используйте BNF/Lexicomp',
      ],
      related: [
        { id: 'bnf', title: 'BNF' },
        { id: 'rls-ru', title: 'РЛС (РФ)' },
        { id: 'vidal', title: 'Vidal' },
        { id: 'mims', title: 'MIMS' },
      ],
      relatedCourses: [
        { id: '308.1', title: 'Клиническая фармакология' },
        { id: '308.5', title: 'Международная фармакотерапия' },
      ],
    };
  },
  reference: 'Brayfield A (ed.). Martindale: The Complete Drug Reference. Pharmaceutical Press. https://about.medicinescomplete.com/publication/martindale-the-complete-drug-reference/',
  countries: 'Международный (40+ стран)',
  presets: [
    { label: 'Антибиотики — INN', values: { drugClass: 'abx', query: 'inn' } },
    { label: 'НПВС — формы выпуска', values: { drugClass: 'nsaid', query: 'forms' } },
    { label: 'Антикоагулянты — бренды', values: { drugClass: 'anticoag', query: 'brands' } },
  ],
  info: `### Для чего используется\n**Martindale: The Complete Drug Reference** — крупнейший международный справочник лекарств с акцентом на торговые наименования и формы выпуска в 40+ странах.\n\n### Когда применять\n- Поиск эквивалента иностранного препарата (турист, экспат, медтуризм)\n- Определение INN по торговому наименованию\n- Академическое/фармацевтическое сравнение препаратов\n- Поиск редких формуляций (suspension, ophthalmic, depot и т.д.)\n\n### Структура монографии\n1. Nomenclature (INN, BAN, USAN, rINN, CAS)\n2. Pharmacopoeias (BP, USP, Ph.Eur., JP)\n3. Adverse Effects / Precautions / Interactions\n4. Pharmacokinetics\n5. Uses and Administration\n6. **Preparations** (по странам, с производителями)\n\n### Доступ\nMedicinesComplete (подписка) / печатная версия.\n\n### Источник\nhttps://about.medicinescomplete.com/publication/martindale-the-complete-drug-reference/`,
};
export default runner;
