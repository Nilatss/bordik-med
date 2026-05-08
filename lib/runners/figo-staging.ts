/** Runner: figo-staging - стадирование гинекологических опухолей (FIGO 2014/2018/2023) */
import type {
  CalculatorTool,
  ToolInput,
  ScoreBand,
  Preset,
  CalculatorResult,
  ResultExtras,
  ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'cancer',
      label: 'Локализация',
      type: 'select',
      options: [
        { value: 'cervix', label: 'Рак шейки матки (FIGO 2018)' },
        { value: 'endo', label: 'Рак эндометрия (FIGO 2023)' },
        { value: 'ovary', label: 'Рак яичников (FIGO 2014)' },
      ],
    },
    {
      id: 'stage',
      label: 'Стадия',
      type: 'select',
      options: [
        { value: 'I', label: 'I - локализованная' },
        { value: 'II', label: 'II - местно-распространённая' },
        { value: 'III', label: 'III - регионарное распространение' },
        { value: 'IV', label: 'IV - отдалённая' },
      ],
    },
  ],
  compute: (v) => {
    const c = v.cancer;
    const s = String(v.stage);
    let title = '';
    let desc = '';
    let color = '';
    let actions: string[] = [];
    const palette: Record<string, string> = { I: '#22C55E', II: '#F59E0B', III: '#EF4444', IV: '#7F1D1D' };
    color = palette[s] || '#1A1A1A';
    if (c === 'cervix') {
      const map: Record<string, string> = {
        I: 'FIGO I (cervix): опухоль ограничена шейкой. IA1 (инвазия ≤ 3 мм), IA2 (3-5 мм), IB1 (≤ 2 см), IB2 (2-4 см), IB3 (> 4 см).',
        II: 'FIGO II: распространение за пределы шейки, но без перехода на нижнюю треть влагалища и стенку таза. IIA (верхние 2/3 влагалища), IIB (параметрий).',
        III: 'FIGO III: нижняя треть влагалища, гидронефроз, лимфатические узлы. IIIA (нижняя 1/3 влагалища), IIIB (стенка таза/гидронефроз), IIIC1 (тазовые ЛУ), IIIC2 (парааортальные ЛУ).',
        IV: 'FIGO IV: слизистая мочевого пузыря/прямой кишки или отдалённые метастазы. IVA (смежные органы), IVB (отдалённые).',
      };
      title = `Рак шейки матки · Стадия ${s}`;
      desc = map[s] || '';
      actions = [
        'IA1 без LVSI: конизация / простая гистерэктомия',
        'IB1-IB2: радикальная гистерэктомия + тазовая лимфаденэктомия',
        'IB3 / II-IVA: ХЛТ (цисплатин) + брахитерапия',
        'IVB: системная химиотерапия ± таргетная (бевацизумаб, пембролизумаб)',
      ];
    } else if (c === 'endo') {
      const map: Record<string, string> = {
        I: 'FIGO I (endometrium 2023): опухоль ограничена телом матки. IA - без/с минимальной инвазией миометрия, IB - инвазия ≥ 50%, IC - агрессивная гистология.',
        II: 'FIGO II: инвазия стромы шейки или существенная LVSI / агрессивная гистология с инвазией миометрия.',
        III: 'FIGO III: местное/регионарное распространение. IIIA - серозная/придатки, IIIB - влагалище/параметрий, IIIC - ЛУ (C1 тазовые, C2 парааортальные).',
        IV: 'FIGO IV: IVA - мочевой/прямая, IVB - абдоминальные перитонеальные вне таза, IVC - отдалённые (лёгкие, печень, кости).',
      };
      title = `Рак эндометрия · Стадия ${s}`;
      desc = map[s] || '';
      actions = [
        'IA low-risk: тотальная гистерэктомия с придатками',
        'IB / high-risk / серозная: + лимфодиссекция, адъювантная ЛТ/ХТ',
        'III: химиотерапия (carbo/paclitaxel) + ЛТ',
        'IV: системная терапия (включая пембролизумаб при dMMR)',
      ];
    } else {
      const map: Record<string, string> = {
        I: 'FIGO I (ovary 2014): опухоль в пределах яичников. IA - один яичник, капсула интактна. IB - оба. IC - разрыв/клетки в смывах.',
        II: 'FIGO II: тазовое распространение. IIA - матка/трубы, IIB - другие тазовые ткани.',
        III: 'FIGO III: перитонеальные метастазы вне таза и/или ретроперитонеальные ЛУ. IIIA - только ЛУ или микроскопия, IIIB - ≤ 2 см, IIIC - > 2 см.',
        IV: 'FIGO IV: отдалённые метастазы. IVA - плевральный выпот с цитологией+, IVB - паренхиматозные/внеабдоминальные ЛУ.',
      };
      title = `Рак яичников · Стадия ${s}`;
      desc = map[s] || '';
      actions = [
        'I low-risk: хирургическое стадирование без ХТ (IA grade 1)',
        'IC / II+: адъювантная ХТ (carbo/paclitaxel)',
        'III-IV: циторедукция + ХТ; PARP-ингибиторы (олапариб) при BRCA/HRD',
        'Бевацизумаб - при высоком риске',
      ];
    }
    return {
      value: title,
      unit: '',
      interpretation: title,
      color,
      details: desc,
      actions,
      caveats: [
        'FIGO для шейки матки - 2018 (обновлена 2019): добавлены подстадии IB1/IB2/IB3, IIIC',
        'FIGO для эндометрия - 2023 (NEW): учитывает молекулярную классификацию (POLEmut, MMRd, p53abn, NSMP)',
        'FIGO для яичников - 2014: включает маточные трубы и первичный перитонеальный рак',
        'TNM (AJCC) и FIGO согласованы, но не идентичны',
      ],
      related: [
        { id: 'iota', title: 'IOTA (ультразвук яичников)' },
        { id: 'bethesda-cyto', title: 'Bethesda цитология' },
      ],
      relatedCourses: [
        { id: '302.2', title: 'Акушерство/гинекология' },
        { id: '201.4', title: 'Онкология' },
      ],
    };
  },
  reference:
    'FIGO cervical cancer staging 2018/2019 (Bhatla N, Int J Gynaecol Obstet 145:129). FIGO endometrial 2023 (Berek JS, Int J Gynaecol Obstet 162:383). FIGO ovarian 2014 (Prat J, Int J Gynaecol Obstet 124:1).',
  countries: 'Международный (FIGO)',
  presets: [
    { label: 'Шейка IB2', values: { cancer: 'cervix', stage: 'I' } },
    { label: 'Эндометрий I', values: { cancer: 'endo', stage: 'I' } },
    { label: 'Яичники III', values: { cancer: 'ovary', stage: 'III' } },
  ],
  caveats: [
    'Окончательное стадирование шейки - клиническое + визуализация (МРТ) + ЛУ',
    'Эндометрий и яичники - хирургическое стадирование',
  ],
  related: [
    { id: 'iota', title: 'IOTA' },
    { id: 'bethesda-cyto', title: 'Bethesda цитология' },
  ],
  relatedCourses: [
    { id: '302.2', title: 'Акушерство/гинекология' },
    { id: '201.4', title: 'Онкология' },
  ],
  info: `### FIGO стадирование гинекологических опухолей

### Шейка матки (FIGO 2018/2019)
| Стадия | Описание |
|---|---|
| IA1 | Инвазия ≤ 3 мм |
| IA2 | 3-5 мм |
| IB1 | ≤ 2 см |
| IB2 | 2-4 см |
| IB3 | > 4 см |
| II | За пределами шейки (IIA влагалище, IIB параметрий) |
| III | Нижняя 1/3 влагалища / стенка таза / гидронефроз / ЛУ |
| IIIC1 | Тазовые ЛУ |
| IIIC2 | Парааортальные ЛУ |
| IV | IVA смежные, IVB отдалённые |

### Эндометрий (FIGO 2023) - молекулярно-ориентированная
| Стадия | Описание |
|---|---|
| IA-IC | Ограничена телом; IC - агрессивные гистологии |
| II | Шейка или LVSI / агрессивная гистология |
| IIIA-IIIC | Придатки / влагалище / ЛУ |
| IVA/B/C | Смежные / перитонеальные / отдалённые |

### Яичники (FIGO 2014)
| Стадия | Описание |
|---|---|
| I | Ограничена яичниками (A/B/C) |
| II | Тазовое распространение |
| III | Перитонеальные вне таза / ЛУ |
| IV | Отдалённые (IVA плевра, IVB паренхимa) |

### Источники
FIGO 2014/2018/2023 (Prat J, Bhatla N, Berek JS).`,
};

export default runner;
