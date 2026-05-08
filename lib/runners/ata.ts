/** Runner: ata — ATA 2015 thyroid nodule sonographic risk + FNA threshold */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'pattern',
      label: 'Сонографический паттерн (ATA 2015)',
      type: 'select',
      options: [
        { value: 'benign', label: 'Доброкачественный (чисто кистозный, спонгиоформный)' },
        { value: 'verylow', label: 'Очень низкий риск (частично кистозный без подозрит. UZ-признаков)' },
        { value: 'low', label: 'Низкий риск (изо-/гиперэхогенный солидный, halo)' },
        { value: 'intermed', label: 'Промежуточный (гипоэхогенный, чёткие края)' },
        { value: 'high', label: 'Высокий (гипоэхоген. + микрокальц./неровн. края/выше-ширины)' },
      ],
    },
    {
      id: 'size',
      hint: 'Размер в миллиметрах',
      label: 'Размер узла (максимальный диаметр)',
      type: 'number',
      unit: 'мм',
      min: 0,
      max: 80,
      step: 1,
      quickValues: [5, 8, 10, 15, 20, 30],
    },
    {
      id: 'bethesda',
      label: 'Bethesda-категория цитологии (если FNA выполнена)',
      type: 'select',
      options: [
        { value: 'none', label: 'FNA не выполнена' },
        { value: 'I', label: 'I — недиагностическая' },
        { value: 'II', label: 'II — доброкачественная' },
        { value: 'III', label: 'III — AUS/FLUS' },
        { value: 'IV', label: 'IV — фолликулярная неоплазия' },
        { value: 'V', label: 'V — подозрит. на малигн.' },
        { value: 'VI', label: 'VI — малигнизация' },
      ],
    },
  ],
  compute: (v) => {
    const pattern = String(v.pattern || 'low');
    const size = Number(v.size) || 0;
    const beth = String(v.bethesda || 'none');

    const patternMeta: Record<string, { risk: string; threshold: number; label: string; color: string; scalePos: number }> = {
      benign: { risk: '< 1 %', threshold: 999, label: 'Доброкач.', color: '#10B981', scalePos: 0.5 },
      verylow: { risk: '< 3 %', threshold: 20, label: 'Оч. низкий', color: '#10B981', scalePos: 1.5 },
      low: { risk: '5-10 %', threshold: 15, label: 'Низкий', color: '#84CC16', scalePos: 2.5 },
      intermed: { risk: '10-20 %', threshold: 10, label: 'Промежут.', color: '#F59E0B', scalePos: 3.5 },
      high: { risk: '70-90 %', threshold: 10, label: 'Высокий', color: '#EF4444', scalePos: 4.5 },
    };
    const meta = patternMeta[pattern]!;

    let fna = '';
    if (pattern === 'benign') fna = 'FNA не показана';
    else if (size < meta.threshold && meta.threshold < 999) fna = `FNA не показана (< ${meta.threshold} мм)`;
    else fna = `FNA показана (≥ ${meta.threshold} мм)`;

    const actions: string[] = [];
    let verdict = `${meta.label} риск · ${fna}`;
    let color = meta.color;

    if (beth !== 'none') {
      const bethMap: Record<string, { txt: string; act: string[]; color: string }> = {
        I: { txt: 'Bethesda I — повторить FNA под УЗ-контролем через 4-6 нед', act: ['Повторная FNA под УЗ-контролем'], color: '#F59E0B' },
        II: { txt: 'Bethesda II — доброкачественная; наблюдение УЗИ', act: ['УЗИ через 12-24 мес', 'При росте > 50 % объёма — повторная FNA'], color: '#10B981' },
        III: { txt: 'Bethesda III (AUS/FLUS) — повторная FNA / молекулярные тесты', act: ['Повторная FNA', 'Afirma/ThyroSeq при доступности', 'Риск малигн. 10-30 %'], color: '#F59E0B' },
        IV: { txt: 'Bethesda IV — диагностическая гемитиреоидэктомия', act: ['Лобэктомия диагностическая', 'Риск малигн. 25-40 %'], color: '#F59E0B' },
        V: { txt: 'Bethesda V — тиреоидэктомия (подозрит. на карциному)', act: ['Тотальная/субтотальная тиреоидэктомия', 'Риск малигн. 60-75 %'], color: '#EF4444' },
        VI: { txt: 'Bethesda VI — тиреоидэктомия + возможный РЙТ', act: ['Тотальная тиреоидэктомия', 'Стадирование + РЙТ по TNM', 'L-тироксин супрессивно'], color: '#EF4444' },
      };
      const b = bethMap[beth]!;
      verdict += ` · ${b.txt}`;
      color = b.color;
      actions.push(...b.act);
    } else if (fna.startsWith('FNA показана')) {
      actions.push('Выполнить FNAB под УЗ-контролем');
      actions.push('Оценить лимфоузлы шеи УЗИ (VI, III-IV уровни)');
      actions.push('ТТГ → при супрессии — сцинтиграфия (горячий узел → FNA не нужна)');
    } else {
      actions.push('Наблюдение УЗИ через 12-24 мес');
      actions.push('Повторная FNA при росте ≥ 20 % в 2 измерениях или > 50 % объёма');
    }

    return {
      value: `${meta.label} · ${size} мм`,
      unit: 'ATA 2015',
      interpretation: verdict,
      color,
      details: `ATA 2015 паттерн: ${meta.label} (риск малигнизации ${meta.risk}).\nПорог FNA: ${pattern === 'benign' ? 'не показан' : `≥ ${meta.threshold} мм`}.\nРазмер узла: ${size} мм.\nЦитология: ${beth === 'none' ? 'не выполнена' : `Bethesda ${beth}`}.`,
      actions,
      caveats: [
        'FNA не заменяет клиническую оценку — оцените эластографию, лимфоузлы, семейный анамнез',
        'При супрессированном ТТГ — сначала сцинтиграфия (горячие узлы практически никогда не малигнизируются)',
        'Bethesda III/IV — используйте молекулярное тестирование (Afirma GSC, ThyroSeq v3) при возможности',
        'Микрокарциномы < 10 мм низкого риска могут наблюдаться (active surveillance)',
      ],
      scale: {
        segments: [
          { min: 0, max: 1, label: 'Доброкач.', color: '#10B981' },
          { min: 1, max: 2, label: 'Оч. низкий', color: '#10B981' },
          { min: 2, max: 3, label: 'Низкий', color: '#84CC16' },
          { min: 3, max: 4, label: 'Промежут.', color: '#F59E0B' },
          { min: 4, max: 5, label: 'Высокий', color: '#EF4444' },
        ],
        current: meta.scalePos,
        unit: 'ATA уровень',
      },
      related: [
        { id: 'ti-rads', title: 'TI-RADS' },
        { id: 'bethesda', title: 'Bethesda' },
      ],
      relatedCourses: [
        { id: '302.1', title: 'Эндокринология' },
      ],
    };
  },
  reference: 'Haugen BR et al. ATA Guidelines for Thyroid Nodules and DTC. Thyroid 2016;26:1-133.',
  countries: 'Международный (ATA 2015)',
  presets: [
    { label: 'Доброкач. спонгиоформ. 15 мм', values: { pattern: 'benign', size: 15, bethesda: 'none' } },
    { label: 'Промежут. 12 мм', values: { pattern: 'intermed', size: 12, bethesda: 'none' } },
    { label: 'Высокий риск 14 мм + Beth V', values: { pattern: 'high', size: 14, bethesda: 'V' } },
  ],
  info: `### Для чего используется
**ATA 2015** — сонографическая стратификация риска узлов ЩЖ + пороги FNA + ведение по цитологии (Bethesda).

### 5 паттернов ATA
| Паттерн | UZ-признаки | Риск малигн. | Порог FNA |
|---|---|---|---|
| Доброкач. | Чисто кистозный, спонгиоформ. | < 1 % | не показан |
| Очень низкий | Частично кистозный без подозрит. | < 3 % | ≥ 20 мм |
| Низкий | Изо-/гиперэхогенный солидный | 5-10 % | ≥ 15 мм |
| Промежуточный | Гипоэхогенный, чёткие края | 10-20 % | ≥ 10 мм |
| Высокий | Гипоэхоген. + микрокальц./неровн. края / «выше-ширины» / экстратиреоидное распростр. | 70-90 % | ≥ 10 мм |

### Bethesda — ведение
| Категория | Малигн. риск | Тактика |
|---|---|---|
| I недиагн. | 1-4 % | Повтор. FNA |
| II доброкач. | 0-3 % | УЗИ-наблюдение |
| III AUS/FLUS | 10-30 % | Повт. FNA / молек. тесты |
| IV фолликул. | 25-40 % | Лобэктомия |
| V подозрит. | 60-75 % | Тиреоидэктомия |
| VI малигн. | 97-99 % | Тиреоидэктомия + РЙТ |

### Источник
Haugen BR et al. Thyroid 2016;26:1-133.`,
};

export default runner;
