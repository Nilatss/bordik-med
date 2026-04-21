// @ts-nocheck
/** Runner: prescrire — Prescrire (French independent drug bulletin) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Франция (Association Mieux Prescrire) · независимый бюллетень',
  reference: 'La revue Prescrire / Prescrire International. Association Mieux Prescrire, Paris. https://english.prescrire.org/ (независимая подписка; без рекламы фармы)',
  inputs: [
    {
      id: 'drug_class',
      label: 'Класс препарата',
      type: 'select',
      options: [
        { value: 'antihypertensive', label: 'Антигипертензивные' },
        { value: 'antidiabetic', label: 'Сахароснижающие' },
        { value: 'anticoagulant', label: 'Антикоагулянты' },
        { value: 'antidepressant', label: 'Антидепрессанты' },
        { value: 'nsaid', label: 'НПВП' },
        { value: 'statin', label: 'Статины' },
        { value: 'antibiotic', label: 'Антибиотики' },
        { value: 'oncology', label: 'Онкология (новые таргетные)' },
      ],
    },
  ],
  presets: [
    { label: 'Антикоагулянты', values: { drug_class: 'anticoagulant' } },
    { label: 'Онкология', values: { drug_class: 'oncology' } },
    { label: 'НПВП', values: { drug_class: 'nsaid' } },
  ],
  compute: (v) => {
    const c = String(v.drug_class || 'antihypertensive');
    const map: Record<string, { title: string; verdict: string; stars: string; examples: string }> = {
      antihypertensive: { title: 'Антигипертензивные', verdict: 'Тиазиды + ИАПФ — "a real advance"; комбинированные taблетки часто "nothing new"', stars: '★★ тиазид; ★★ ИАПФ (enalapril); ☒ олмесартан (risk > benefit, sprue-like)', examples: 'Favorable: amlodipine, enalapril, indapamide. "Not acceptable": olmesartan (снят с возмещения во Франции 2017)' },
      antidiabetic: { title: 'Сахароснижающие', verdict: 'Метформин — "a real advance"; GLP-1 RA "possibly helpful"; SGLT2i "requires caution" (euDKA, ампутации)', stars: '★★★ метформин; ★ dapagliflozin (при HFrEF); ☒ rosiglitazone (отозван)', examples: 'Rimonabant, sitagliptin, saxagliptin — "nothing new" / "not acceptable"' },
      anticoagulant: { title: 'Антикоагулянты', verdict: 'Варфарин — "знакомый с управляемым риском"; DOAC — "possibly helpful" но без антидота (кроме idarucizumab)', stars: '★★ warfarin; ★ apixaban (лучший профиль DOAC); ⚠ rivaroxaban (кровотечения)', examples: 'Prescrire подчёркивает: DOAC не всегда "advance" — риск ЖКТ-кровотечений выше у rivaroxaban' },
      antidepressant: { title: 'Антидепрессанты', verdict: 'Большинство новых препаратов "nothing new"; SSRI = старые трицикли при тяжёлой депрессии', stars: '★ sertraline, citalopram; ☒ agomelatine (гепатотоксичность, снят с рекомендаций)', examples: 'Venlafaxine, duloxetine — "possibly helpful" но не превосходят SSRI' },
      nsaid: { title: 'НПВП', verdict: 'Ибупрофен низких доз + напроксен — "a real advance"; COX-2 "not acceptable" (ССЗ-риск)', stars: '★★ ибупрофен ≤ 1200 мг/сут; ★ напроксен; ☒ rofecoxib (отозван); ☒ diclofenac (ССЗ)', examples: 'Prescrire рекомендует избегать diclofenac (уровень ССЗ-риска как у COX-2)' },
      statin: { title: 'Статины', verdict: 'Симвастатин/правастатин — "a real advance" для вторичной профилактики; аторвастатин "nothing new"; rosuvastatin "not acceptable" (дороже, не лучше)', stars: '★★ simvastatin, pravastatin; ★ atorvastatin; ⚠ rosuvastatin', examples: 'Для первичной профилактики Prescrire более сдержан чем US guidelines' },
      antibiotic: { title: 'Антибиотики', verdict: 'Amoxicillin, доксициклин — "a real advance"; FQ — "requires caution" (разрывы сухожилий, аневризмы); telithromycin "not acceptable"', stars: '★★ amoxicillin; ★ doxycycline; ☒ telithromycin (гепатотоксичность); ⚠ FQ', examples: 'FQ — chronicite tendinopathy предупреждение с 2008' },
      oncology: { title: 'Онкология (новые таргетные)', verdict: 'Большинство — "nothing new" (malg surrogate endpoints); PFS ≠ OS; qualified approval часто без мед значимости', stars: 'Каждый год > 50% новых онкопрепаратов оцениваются "nothing new" по Prescrire', examples: 'Bevacizumab, sorafenib (HCC) — часто переоценены; trastuzumab (HER2+ BC) — один из немногих "advance"' },
    };
    const e = map[c];
    return {
      value: e.title,
      unit: 'Prescrire',
      color: '#6B7280',
      interpretation: `Prescrire verdict: ${e.title}`,
      details: `Класс: ${e.title}\n\nОбщий вердикт: ${e.verdict}\n\nRating: ${e.stars}\n\nПримеры: ${e.examples}\n\nPrescrire pictogram rating system:\n- BRAVO (★★★★★) — крупный прорыв (ред., напр. ART при ВИЧ)\n- A real advance (★★★) — существенный прогресс\n- Offers an advantage (★★)\n- Possibly helpful (★)\n- Nothing new (∅)\n- Not acceptable (☒) — риск > польза, избегать\n- Judgement reserved (?) — недостаточно данных`,
      actions: [
        'Открыть https://english.prescrire.org/ (English edition) или https://www.prescrire.org/ (French)',
        'Ежемесячный бюллетень La revue Prescrire (подписка)',
        'Prescrire International — English edition (подписка)',
        '"Towards better patient care" — ежегодный отчёт о новых препаратах',
        'Black list — препараты "not acceptable" к удалению из практики',
        'Prescrire Awards — Pilule d\'Or (золотая таблетка) ежегодно',
      ],
      caveats: [
        'Полностью независим от фармкомпаний (no ads, no funding) — редкость среди мед журналов',
        'Французский акцент: торговые названия и регуляторные решения EMA/ANSM',
        'Более консервативен чем FDA — многие препараты, одобренные FDA, получают "nothing new"',
        'Подписка платная (нет бесплатного доступа) — ~€180/год индивидуальная',
        'Задержка: новые препараты оцениваются через 6-12 мес после одобрения (ждут post-marketing данные)',
      ],
      related: [
        { id: 'cochrane', title: 'Cochrane Library' },
        { id: 'nice-cks', title: 'NICE CKS' },
        { id: 'bnf', title: 'British National Formulary' },
        { id: 'lexicomp', title: 'Lexicomp' },
      ],
      relatedCourses: [
        { id: '312.1', title: 'Медицинское образование' },
        { id: '302.1', title: 'Общая врачебная практика' },
      ],
    };
  },
  info: `### Для чего используется
**Prescrire** (франц. *предписывать*) — независимый французский бюллетень о лекарствах, издаётся с 1981 г. Ассоциацией Mieux Prescrire. **Полностью независим от фарминдустрии** (без рекламы, без финансирования от производителей) — уникальная черта среди мед журналов.

### Pictogram rating (оценка "польза/риск")
| Символ | Значение | Частота |
|---|---|---|
| 🏆 BRAVO | Крупный прорыв | ~1 за 10 лет |
| ★★★ | A real advance | 2-3% новых препаратов |
| ★★ | Offers an advantage | ~5% |
| ★ | Possibly helpful | ~10% |
| ∅ | Nothing new | ~50% |
| ☒ | Not acceptable | ~10-15% |
| ? | Judgement reserved | ~20% |

### Ежегодный отчёт
**"Towards better patient care"** — Prescrire ежегодно подводит итоги всех новых препаратов года. В последние годы > 50% получают "nothing new" или "not acceptable".

### Черный список (Drugs to avoid)
Ежегодный список препаратов, где риск превышает пользу. В 2024 г. — > 100 препаратов, включая diclofenac, agomelatine, dompéridone, trimetazidine.

### Подписка
- La revue Prescrire (франц., ежемес.) — ~€180/год
- Prescrire International (English, 11 номеров/год)
- Application mobile (résumé только)`,
};
export default runner;
