// @ts-nocheck
/** Runner: rxnorm — RxNorm (NIH/NLM) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'США (NLM/NIH) · международно для интероперабельности',
  reference: 'National Library of Medicine. RxNorm Technical Documentation. Bethesda: NLM; 2024. https://www.nlm.nih.gov/research/umls/rxnorm/',
  inputs: [
    {
      id: 'tty',
      label: 'Term Type (TTY)',
      type: 'select',
      options: [
        { value: 'IN', label: 'IN Ingredient (действующее в-во)' },
        { value: 'PIN', label: 'PIN Precise Ingredient (соль)' },
        { value: 'BN', label: 'BN Brand Name' },
        { value: 'SCD', label: 'SCD Semantic Clinical Drug' },
        { value: 'SBD', label: 'SBD Semantic Branded Drug' },
        { value: 'GPCK', label: 'GPCK Generic Pack' },
        { value: 'BPCK', label: 'BPCK Brand Pack' },
      ],
    },
  ],
  presets: [
    { label: 'Ingredient', values: { tty: 'IN' } },
    { label: 'Clinical Drug', values: { tty: 'SCD' } },
    { label: 'Brand Drug', values: { tty: 'SBD' } },
  ],
  compute: (v) => {
    const tty = String(v.tty || 'IN');
    const map: Record<string, { name: string; example: string; rxcui: string; structure: string }> = {
      IN: { name: 'Ingredient (активное действующее вещество)', example: 'Metformin', rxcui: '6809', structure: 'Просто действующее в-во без соли / дозы / формы. Использовать для drug-drug interaction checks.' },
      PIN: { name: 'Precise Ingredient (с солью)', example: 'Metformin hydrochloride', rxcui: '235156', structure: 'С конкретной солью / эфиром. Иерархически IS-A → Metformin (IN 6809).' },
      BN: { name: 'Brand Name', example: 'Glucophage', rxcui: '151827', structure: 'Торговое название без дозировки / формы.' },
      SCD: { name: 'Semantic Clinical Drug', example: 'Metformin hydrochloride 500 MG Oral Tablet', rxcui: '861007', structure: 'Ingredient + Strength + Dose Form — без бренда. Стандарт для e-prescribing в США.' },
      SBD: { name: 'Semantic Branded Drug', example: 'Metformin hydrochloride 500 MG Oral Tablet [Glucophage]', rxcui: '861008', structure: 'SCD + Brand Name. Для точной identification прописанного препарата.' },
      GPCK: { name: 'Generic Pack', example: 'Methylprednisolone 4 MG Oral Tablet Pack', rxcui: '573621', structure: 'Уп-ка с несколькими SCDs (напр., blister pack с разными дозами для tapering).' },
      BPCK: { name: 'Brand Pack', example: 'Medrol Dosepak', rxcui: '573623', structure: 'GPCK + Brand Name.' },
    };
    const e = map[tty];
    return {
      value: e.rxcui,
      unit: 'RXCUI',
      color: '#6B7280',
      interpretation: `RxNorm ${tty}: ${e.example}`,
      details: `Term Type (TTY): ${tty} — ${e.name}\nRXCUI: ${e.rxcui}\nName: ${e.example}\n\nСтруктура: ${e.structure}\n\nRxNorm создан NLM для нормализации названий лекарств из разных источников (FDA NDC, VA NDF-RT, Multum, First DataBank и др.). RXCUI (RxNorm Concept Unique Identifier) — числовой ID.`,
      actions: [
        'RxNav (NLM): https://mor.nlm.nih.gov/RxNav/',
        'RxNorm API: https://rxnav.nlm.nih.gov/RxNormAPIs.html (REST, бесплатно без регистрации)',
        'Использовать SCD / SBD для e-prescribing (стандарт CMS Meaningful Use)',
        'Mapping в NDC (National Drug Code) — через атрибут HAS_NDC',
        'Для drug-drug interactions использовать IN или PIN',
      ],
      caveats: [
        'RxNorm — БЕСПЛАТЕН (без регистрации), обновление еженедельно (production) + monthly (full release)',
        'Только в США — полный охват lекarstv; для других стран — ограниченное покрытие',
        'Для РФ — использовать ГРЛС (Государственный реестр лекарственных средств, Minzdrav)',
        'Компонент UMLS Metathesaurus — RxNorm всегда включён',
        'Rx vs OTC — RxNorm покрывает обе категории',
        'Historical RXCUI — не удаляются, получают статус "Obsolete" / "Retired"',
      ],
      related: [
        { id: 'umls', title: 'UMLS Metathesaurus' },
        { id: 'who-eml', title: 'WHO EML' },
        { id: 'snomed', title: 'SNOMED CT (drug products)' },
      ],
      relatedCourses: [
        { id: '308.1', title: 'Клиническая фармакология' },
        { id: '308.3', title: 'Лекарственные взаимодействия' },
      ],
    };
  },
  info: `### Для чего используется
**RxNorm** — нормализованный словарь названий лекарств, разработан US National Library of Medicine (NLM). Основа для e-prescribing в США (CMS Meaningful Use / Promoting Interoperability), drug-drug interaction engines, клинических decision support систем.

### Term Types (TTY) — иерархия
\`\`\`
IN (Ingredient: Metformin)
 ├─ PIN (Precise Ingredient: Metformin HCl)
 └─ SCDC (Clinical Drug Component: Metformin HCl 500 MG)
     └─ SCD (Semantic Clinical Drug: Metformin HCl 500 MG Oral Tablet)
         └─ SBD (Branded: + [Glucophage])
\`\`\`

### Ключевые TTY
| TTY | Расшифровка | Использование |
|---|---|---|
| IN | Ingredient | DDI checks, allergy |
| PIN | Precise Ingredient | Salt-specific |
| BN | Brand Name | Branded only |
| DF | Dose Form | Tablet, Capsule |
| SCDC | Clinical Drug Component | Ingredient + Strength |
| SCDF | Clinical Drug Form | Ingredient + Form |
| SCD | Semantic Clinical Drug | **Стандарт e-Rx** |
| SBD | Semantic Branded Drug | Branded SCD |
| GPCK/BPCK | Pack | Multi-component packages |

### Атрибуты / Relationships
- \`HAS_NDC\` — связь с FDA NDC (National Drug Code)
- \`HAS_INGREDIENT\` — SCD → IN
- \`HAS_DOSE_FORM\` — SCD → DF
- \`TRADENAME_OF\` — BN → IN

### RxNav Tools (бесплатно, NLM)
- **RxNav Web** — browser UI
- **RxNorm API** — REST
- **RxMix** — batch processing
- **RxImage API** — фото таблеток
- **Interaction API** — DDI (была deprecated 2024, альтернатива: MedlinePlus DailyMed)`,
};
export default runner;
