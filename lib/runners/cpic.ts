// @ts-nocheck
/** Runner: cpic */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'gene',
      label: 'Ген',
      type: 'select',
      options: [
        { value: 'cyp2c19', label: 'CYP2C19' },
        { value: 'cyp2c9', label: 'CYP2C9' },
        { value: 'cyp2d6', label: 'CYP2D6' },
        { value: 'cyp3a5', label: 'CYP3A5' },
        { value: 'tpmt', label: 'TPMT / NUDT15' },
        { value: 'dpyd', label: 'DPYD' },
        { value: 'slco1b1', label: 'SLCO1B1' },
        { value: 'ugt1a1', label: 'UGT1A1' },
        { value: 'hla-b5701', label: 'HLA-B*57:01' },
        { value: 'hla-b1502', label: 'HLA-B*15:02' },
      ],
    },
    {
      id: 'drug',
      label: 'Препарат',
      type: 'select',
      options: [
        { value: 'clopidogrel', label: 'Клопидогрел' },
        { value: 'voriconazole', label: 'Вориконазол' },
        { value: 'ppi', label: 'ИПП (омепразол)' },
        { value: 'warfarin', label: 'Варфарин' },
        { value: 'codeine', label: 'Кодеин / трамадол' },
        { value: 'ssri', label: 'СИОЗС (пароксетин/флуоксетин)' },
        { value: 'tacrolimus', label: 'Такролимус' },
        { value: 'azathioprine', label: 'Азатиоприн / 6-МП' },
        { value: 'fluoropyrimidine', label: '5-ФУ / капецитабин' },
        { value: 'simvastatin', label: 'Симвастатин' },
        { value: 'irinotecan', label: 'Иринотекан' },
        { value: 'abacavir', label: 'Абакавир' },
        { value: 'carbamazepine', label: 'Карбамазепин' },
      ],
    },
    {
      id: 'phenotype',
      label: 'Фенотип (если известен)',
      type: 'select',
      options: [
        { value: 'unknown', label: 'Неизвестен — показать все' },
        { value: 'pm', label: 'Poor Metabolizer (PM)' },
        { value: 'im', label: 'Intermediate Metabolizer (IM)' },
        { value: 'nm', label: 'Normal / Extensive (NM)' },
        { value: 'rm', label: 'Rapid Metabolizer (RM)' },
        { value: 'um', label: 'Ultrarapid Metabolizer (UM)' },
        { value: 'positive', label: 'HLA-позитивный (для HLA)' },
      ],
    },
  ],
  compute: (v) => {
    const g = String(v.gene);
    const d = String(v.drug);
    const ph = String(v.phenotype || 'unknown');

    type Rec = { rec: string; evidence: string; color: string };
    const map: Record<string, Rec> = {
      'cyp2c19|clopidogrel|pm': { rec: 'PM: альтернатива — прасугрел или тикагрелор (клопидогрел неэффективен)', evidence: 'A', color: '#EF4444' },
      'cyp2c19|clopidogrel|im': { rec: 'IM: прасугрел/тикагрелор предпочтительнее при ОКС/ЧКВ', evidence: 'A', color: '#F59E0B' },
      'cyp2c19|clopidogrel|nm': { rec: 'NM: стандартная доза 75 мг/сут', evidence: 'A', color: '#22C55E' },
      'cyp2c19|voriconazole|um': { rec: 'UM: альтернативный азол (позаконазол/изавуконазол) — субтерапевтические концентрации', evidence: 'A', color: '#EF4444' },
      'cyp2c19|voriconazole|pm': { rec: 'PM: снизить дозу на 50%, мониторинг концентрации', evidence: 'A', color: '#F59E0B' },
      'cyp2c19|ppi|pm': { rec: 'PM: стандартная доза (↑ экспозиция выгодна для H. pylori)', evidence: 'B', color: '#22C55E' },
      'cyp2c9|warfarin|pm': { rec: 'PM (+ VKORC1 AA): начальная доза ≈ 0,5-2 мг/сут; см. WarfarinDosing.org', evidence: 'A', color: '#EF4444' },
      'cyp2d6|codeine|um': { rec: 'UM: избегать кодеин/трамадол — риск опиоидной токсичности (дети — противопоказано)', evidence: 'A', color: '#991B1B' },
      'cyp2d6|codeine|pm': { rec: 'PM: кодеин неэффективен — альтернативный анальгетик (морфин, НПВП)', evidence: 'A', color: '#EF4444' },
      'cyp2d6|ssri|pm': { rec: 'PM: снизить дозу пароксетина на 50% ИЛИ альтернатива (сертралин)', evidence: 'A', color: '#F59E0B' },
      'cyp3a5|tacrolimus|nm': { rec: 'Expresser (*1/*1 или *1/*3): стартовая доза ×1,5-2 от стандартной', evidence: 'A', color: '#F59E0B' },
      'tpmt|azathioprine|pm': { rec: 'TPMT PM: снизить дозу на 90% ИЛИ альтернатива — риск смертельной миелосупрессии', evidence: 'A', color: '#991B1B' },
      'tpmt|azathioprine|im': { rec: 'IM: снизить дозу на 30-70%, мониторинг ОАК', evidence: 'A', color: '#F59E0B' },
      'dpyd|fluoropyrimidine|pm': { rec: 'DPYD PM: избегать 5-ФУ/капецитабин — риск летальной токсичности', evidence: 'A', color: '#991B1B' },
      'dpyd|fluoropyrimidine|im': { rec: 'IM: снизить дозу на 25-50%, мониторинг', evidence: 'A', color: '#F59E0B' },
      'slco1b1|simvastatin|pm': { rec: 'Decreased function: max 20 мг/сут или альтернативный статин (розува/правастатин)', evidence: 'A', color: '#F59E0B' },
      'ugt1a1|irinotecan|pm': { rec: '*28/*28: снизить стартовую дозу на 30%, мониторинг нейтропении', evidence: 'A', color: '#F59E0B' },
      'hla-b5701|abacavir|positive': { rec: 'HLA-B*57:01 positive: противопоказан абакавир (риск реакции гиперчувствительности)', evidence: 'A', color: '#991B1B' },
      'hla-b1502|carbamazepine|positive': { rec: 'HLA-B*15:02 positive (азиаты): противопоказан карбамазепин (SJS/TEN)', evidence: 'A', color: '#991B1B' },
    };

    const key = `${g}|${d}|${ph}`;
    const altKey = `${g}|${d}|nm`;
    const e = map[key] || map[altKey] || { rec: 'См. полную CPIC-гайдлайн на cpicpgx.org для данной пары ген-препарат', evidence: 'C', color: '#6B7280' };

    const evColors: Record<string, string> = { A: '#22C55E', B: '#4B8DF5', C: '#F59E0B', D: '#6B7280' };
    const evDesc: Record<string, string> = {
      A: 'Evidence A — сильная (изменить терапию)',
      B: 'Evidence B — умеренная (рассмотреть изменение)',
      C: 'Evidence C — слабая (нет действий или только информационно)',
      D: 'Evidence D — минимальная',
    };

    return {
      value: `${g.toUpperCase()} / ${d}`,
      unit: `Evidence ${e.evidence}`,
      interpretation: e.rec,
      color: e.color,
      details: `Ген: ${g.toUpperCase()}. Препарат: ${d}. Фенотип: ${ph.toUpperCase()}.\n\n**Рекомендация CPIC:** ${e.rec}\n\n**Уровень доказательности:** ${evDesc[e.evidence]}\n\nCPIC (Clinical Pharmacogenetics Implementation Consortium) публикует peer-reviewed гайдлайны по парам ген-препарат с конкретными рекомендациями по дозированию в зависимости от фенотипа.`,
      actions: [
        'Открыть cpicpgx.org → Guidelines → выбрать пару ген-препарат',
        'Сверить фенотип по диплотипу (*1/*2, *2/*17 и т.д.) в таблице CPIC',
        'Применить рекомендацию по дозе / альтернативному препарату',
        'Документировать фенотип в истории болезни (ICD-10 Z15.81)',
        'Для РФ — сверить с Минздравом РФ (есть федеральные клинрекомендации по ряду пар)',
      ],
      caveats: [
        'CPIC-гайдлайны основаны на фенотипе — нужен генотип из валидированной лаборатории',
        'Фенотип не всегда однозначно соответствует генотипу (copy number, редкие аллели)',
        'Фенотип может меняться при сопутствующих препаратах (phenoconversion)',
        'Гайдлайны обновляются каждые 2-5 лет — используйте актуальную версию',
        'HLA-тесты одноразовые, CYP-тесты — пожизненные',
      ],
      related: [
        { id: 'lexicomp', title: 'Lexicomp' },
        { id: 'pharmgkb', title: 'PharmGKB' },
        { id: 'fda-table', title: 'FDA Pharmacogenomics Table' },
      ],
      relatedCourses: [
        { id: '308.1', title: 'Клиническая фармакология' },
        { id: '308.3', title: 'Лекарственные взаимодействия' },
      ],
    };
  },
  reference: 'Clinical Pharmacogenetics Implementation Consortium (CPIC) Guidelines. https://cpicpgx.org/guidelines/',
  countries: 'Международный (CPIC, США)',
  presets: [
    { label: 'CYP2C19 PM + клопидогрел', values: { gene: 'cyp2c19', drug: 'clopidogrel', phenotype: 'pm' } },
    { label: 'TPMT PM + азатиоприн', values: { gene: 'tpmt', drug: 'azathioprine', phenotype: 'pm' } },
    { label: 'HLA-B*57:01+ + абакавир', values: { gene: 'hla-b5701', drug: 'abacavir', phenotype: 'positive' } },
  ],
  info: `### Для чего используется\n**CPIC (Clinical Pharmacogenetics Implementation Consortium)** — международная экспертная группа (NIH + PharmGKB), публикующая peer-reviewed гайдлайны по парам ген-препарат с конкретными клиническими рекомендациями.\n\n### Фенотипы CYP\n- **PM (Poor Metabolizer)** — 2 нефункциональные аллели\n- **IM (Intermediate)** — 1 нефункциональная\n- **NM (Normal)** — 2 функциональные (референс)\n- **RM (Rapid)** — повышенная активность\n- **UM (Ultrarapid)** — дубликация функциональных копий\n\n### Уровни доказательности\n- **A** — изменить терапию (сильная рекомендация)\n- **B** — рассмотреть изменение (умеренная)\n- **C** — только информационно\n- **D** — нет рекомендации\n\n### Ключевые пары\n- CYP2C19 + клопидогрел / вориконазол / ИПП\n- CYP2D6 + кодеин / СИОЗС / тамоксифен\n- TPMT/NUDT15 + тиопурины\n- DPYD + фторпиримидины\n- HLA-B*57:01 + абакавир\n- HLA-B*15:02 + карбамазепин (азиаты)`,
};
export default runner;
