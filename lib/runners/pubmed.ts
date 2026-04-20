// @ts-nocheck
/** Runner: pubmed — PubMed / MEDLINE search syntax */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'США (NLM/NIH) · Международный бесплатный доступ',
  reference: 'National Library of Medicine. PubMed. Bethesda, MD: NCBI/NLM. https://pubmed.ncbi.nlm.nih.gov/ (> 37 млн citations; MEDLINE + PMC + bookshelf)',
  inputs: [
    {
      id: 'search_type',
      label: 'Тип поиска',
      type: 'select',
      options: [
        { value: 'term', label: 'Текстовый термин (title/abstract)' },
        { value: 'author', label: 'По автору' },
        { value: 'mesh', label: 'MeSH (Medical Subject Headings)' },
        { value: 'date', label: 'По дате публикации' },
        { value: 'journal', label: 'По журналу' },
        { value: 'clinical', label: 'Clinical Queries filter' },
      ],
    },
  ],
  presets: [
    { label: 'MeSH поиск', values: { search_type: 'mesh' } },
    { label: 'Clinical Queries', values: { search_type: 'clinical' } },
    { label: 'Автор', values: { search_type: 'author' } },
  ],
  compute: (v) => {
    const t = String(v.search_type || 'term');
    const map: Record<string, { syntax: string; example: string; note: string }> = {
      term: { syntax: 'term[Title/Abstract] или term[tiab] · term[ti] (только title) · term[ab] (только abstract)', example: '"atrial fibrillation"[tiab] AND "anticoagulation"[tiab] AND randomized[pt]', note: 'Кавычки для фраз; AND/OR/NOT заглавными; [pt] = publication type' },
      author: { syntax: 'Smith J[au] — последняя имя + инициалы. Full name: Smith John[Full Author Name]. Первый автор: Smith J[1au]. Последний: Smith J[lastau]', example: 'Braunwald E[au] AND 2020:2024[dp]', note: 'Автор-индекс работает с 1966; с 2002 используется full name если указано' },
      mesh: { syntax: 'term[MeSH] — exploded (включает narrower). term[MeSH:noexp] — только этот уровень. term[Majr] — major topic (центральная тема статьи)', example: '"Myocardial Infarction"[Majr] AND "Thrombolytic Therapy"[MeSH] AND humans[mh]', note: 'MeSH обновляется ежегодно; MeSH Browser: https://meshb.nlm.nih.gov/' },
      date: { syntax: 'yyyy/mm/dd[dp] для publication date. 2023:2024[dp] — диапазон. "last 5 years"[dp]. [edat] — Entrez date (добавлен в PubMed)', example: '("2024/01/01"[dp] : "2024/12/31"[dp]) AND covid[tiab]', note: '[crdt] = create date, [mhda] = MeSH date; используйте [dp] для journal publication date' },
      journal: { syntax: 'journal[TA] — Title Abbreviation (полностью или сокращённо NLM). ISSN[TA] также работает', example: '"N Engl J Med"[TA] AND "heart failure"[tiab] AND 2023[dp]', note: 'NLM catalog для точных аббревиатур: https://www.ncbi.nlm.nih.gov/nlmcatalog/journals' },
      clinical: { syntax: 'Clinical Queries filters: Therapy/Diagnosis/Etiology/Prognosis/Clinical Prediction Guides × Narrow/Broad. Прямой hedge можно вставить в query.', example: '"diabetes type 2"[tiab] AND (randomized controlled trial[pt] OR controlled clinical trial[pt]) — эквивалент Therapy/Narrow', note: 'Доступен на /clinical — готовые filters для систематических обзоров' },
    };
    const e = map[t];
    return {
      value: e.syntax.split(' · ')[0] || e.syntax.split('.')[0],
      unit: 'PubMed',
      color: '#6B7280',
      interpretation: `PubMed: ${t}`,
      details: `**Тип поиска:** ${t}\n\n**Синтаксис:** ${e.syntax}\n\n**Пример запроса:** \`${e.example}\`\n\n**Примечание:** ${e.note}\n\n**Boolean operators:**\n- \`AND\` — пересечение (и A, и B)\n- \`OR\` — объединение (A или B)\n- \`NOT\` — исключение (A без B)\n- Круглые скобки для группировки: \`(A OR B) AND C\`\n\n**Полезные теги:**\n- \`[tiab]\` — title/abstract\n- \`[MeSH]\` — MeSH термин (exploded)\n- \`[au]\` — автор\n- \`[dp]\` — publication date\n- \`[pt]\` — publication type (напр., \`randomized controlled trial[pt]\`)\n- \`[Majr]\` — major MeSH topic\n- \`[TA]\` — journal title abbreviation\n\n**Truncation:** \`neoplas*[tiab]\` — neoplasm, neoplastic, neoplasia (минимум 4 символа до *).`,
      actions: [
        'Открыть https://pubmed.ncbi.nlm.nih.gov/',
        'Advanced Search Builder: https://pubmed.ncbi.nlm.nih.gov/advanced/ — визуальный конструктор',
        'Clinical Queries: https://pubmed.ncbi.nlm.nih.gov/clinical/',
        'MeSH Browser: https://meshb.nlm.nih.gov/',
        'NLM Catalog (journal abbreviations): https://www.ncbi.nlm.nih.gov/nlmcatalog/',
        'PubMed API (E-utilities): для программного поиска',
      ],
      caveats: [
        'MeSH индексация добавляется через 1-3 мес после публикации — свежие статьи искать по [tiab]',
        'Не все MEDLINE журналы имеют open access full text — проверить "Free PMC article" filter',
        'Автоматический term mapping может менять запрос — проверить "Search Details" panel',
        'Тruncation (*) отключает automatic explosion для MeSH — использовать осторожно',
        'Для systematic review нужны несколько БД (PubMed + Embase + Cochrane + другие)',
        'PMC ≠ PubMed: PMC — full text repository, PubMed — citation database',
      ],
      related: [
        { id: 'cochrane', title: 'Cochrane Library' },
        { id: 'prisma', title: 'PRISMA 2020' },
        { id: 'embase', title: 'Embase (Elsevier)' },
      ],
      relatedCourses: [
        { id: '312.1', title: 'Медицинское образование' },
        { id: '302.1', title: 'Общая врачебная практика' },
      ],
    };
  },
  info: `### Для чего используется
**PubMed** — бесплатная поисковая система по биомедицинской литературе от NLM/NIH (США). > 37 млн citations, включая MEDLINE (с 1946), PubMed Central (full text open access), NCBI Bookshelf.

### Ключевые компоненты
- **MEDLINE** — основная БД, индексирована MeSH
- **PubMed Central (PMC)** — open access full text
- **NCBI Bookshelf** — учебники и справочники
- **MeSH** — Medical Subject Headings (контролируемый словарь, ~30 000 терминов, ежегодное обновление)

### Синтаксис (field tags)
| Тэг | Значение |
|---|---|
| [tiab] | Title / Abstract |
| [ti] | Только Title |
| [MeSH] | MeSH term (exploded) |
| [Majr] | Major MeSH topic |
| [au] | Author |
| [1au] | First author |
| [lastau] | Last author |
| [dp] | Publication date |
| [pt] | Publication type |
| [TA] | Journal abbreviation |
| [la] | Language |
| [mh] | MeSH heading qualifier |

### Публикационные типы (популярные [pt])
- \`randomized controlled trial\` — RCT
- \`systematic review\`
- \`meta-analysis\`
- \`practice guideline\`
- \`review\`
- \`clinical trial\`
- \`case reports\`

### Boolean operators
\`AND\`, \`OR\`, \`NOT\` (заглавные). Скобки для группировки.

### Truncation
\`neoplas*\` раскрывается в все слова от "neopl" (минимум 4 символа до *). Отключает explosion для MeSH.

### Источник
https://pubmed.ncbi.nlm.nih.gov/`,
};
export default runner;
