// @ts-nocheck
/** Runner: stan - STAN ST-analysis плодовой ЭКГ (Neoventa; Amer-Wåhlin 2001) */
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
      id: 'ctg',
      label: 'КТГ (классификация FIGO)',
      type: 'select',
      options: [
        { value: 'normal', label: 'Нормальная' },
        { value: 'intermediate', label: 'Подозрительная / промежуточная' },
        { value: 'abnormal', label: 'Патологическая' },
        { value: 'preterminal', label: 'Претерминальная' },
      ],
    },
    {
      id: 'stEvent',
      label: 'ST-событие',
      type: 'select',
      options: [
        { value: 'none', label: 'Нет ST-событий' },
        { value: 'episodicTQRS', label: 'Эпизодический подъём T/QRS (> 0.15 за < 10 мин)' },
        { value: 'baselineTQRS', label: 'Базальный подъём T/QRS (> 0.10)' },
        { value: 'biphasicBrief', label: 'Биазный ST 1-2 степени < 5 мин' },
        { value: 'biphasicProlonged', label: 'Биазный ST 2-3 степени ≥ 5 мин или ≥ 2 эпизодов' },
      ],
    },
    {
      id: 'stage',
      label: 'Период родов',
      type: 'select',
      options: [
        { value: 'first', label: 'I период' },
        { value: 'second', label: 'II период' },
      ],
    },
  ],
  compute: (v) => {
    const ctg = v.ctg;
    const ev = v.stEvent;
    let action = 'Наблюдение';
    let color = '#22C55E';
    let details = '';
    if (ctg === 'preterminal') {
      action = 'Немедленное родоразрешение';
      color = '#7F1D1D';
      details = 'Претерминальная КТГ - ST-анализ не используется, требуется оперативное родоразрешение без промедления.';
    } else if (ctg === 'normal' && ev === 'none') {
      action = 'Наблюдение';
      color = '#22C55E';
      details = 'Нормальная КТГ без ST-событий - продолжение ведения родов.';
    } else if (ctg === 'abnormal' && (ev === 'episodicTQRS' || ev === 'baselineTQRS' || ev === 'biphasicBrief')) {
      action = 'Вмешательство: реанимация in utero и/или родоразрешение';
      color = '#DC2626';
      details = 'Патологическая КТГ + значимое ST-событие - гипоксия миокарда плода. Устранение обратимых причин, подготовка к родам.';
    } else if (ctg === 'intermediate' && ev === 'biphasicProlonged') {
      action = 'Вмешательство: реанимация in utero / оперативное родоразрешение';
      color = '#DC2626';
      details = 'Промежуточная КТГ + биазный ST ≥ 5 мин - признак гипоксии.';
    } else if (ctg === 'intermediate' && (ev === 'episodicTQRS' || ev === 'baselineTQRS')) {
      action = 'Усиленное наблюдение, коррекция обратимых причин';
      color = '#F59E0B';
      details = 'Промежуточная КТГ + повышение T/QRS - адаптивная реакция; контроль.';
    } else if (ctg === 'abnormal' && ev === 'none') {
      action = 'Клиническая оценка ± FSBS / родоразрешение при сохранении';
      color = '#F59E0B';
      details = 'Патологическая КТГ без ST-событий - решение по клинике; возможен переход к fetal scalp blood sampling.';
    } else {
      action = 'Наблюдение с переоценкой';
      color = '#F59E0B';
      details = 'Данные не соответствуют критериям немедленного вмешательства.';
    }
    return {
      value: action,
      unit: '',
      interpretation: `STAN: ${action}`,
      color,
      details,
      actions: [
        'Скальп-электрод устанавливается при раскрытии ≥ 2-3 см, излитии вод и головном предлежании',
        'ST-анализ применяется только при технически качественной записи ≥ 20 мин базовой линии',
        'При претерминальной КТГ ST-анализ не используется - немедленное родоразрешение',
        'Дополнительно - лактат/pH скальпа плода (FSBS) при недостаточной интерпретируемости',
      ],
      caveats: [
        'STAN не заменяет интерпретацию КТГ, а дополняет её',
        'Эффективность показана в RCT Amer-Wåhlin 2001 (снижение метаболического ацидоза)',
        'Требует сертифицированного обучения персонала (Neoventa curriculum)',
        'Ложные подъёмы T/QRS возможны при неправильной установке электрода',
      ],
      related: [
        { id: 'ctg', title: 'КТГ' },
        { id: 'apgar', title: 'Apgar' },
      ],
      relatedCourses: [
        { id: '302.2', title: 'Акушерство' },
        { id: '301.7', title: 'Интранатальная медицина' },
      ],
    };
  },
  reference:
    'Amer-Wåhlin I et al. Cardiotocography only versus cardiotocography plus ST analysis of fetal electrocardiogram for intrapartum fetal monitoring: a Swedish randomised controlled trial. Lancet 2001;358:534-538. Neoventa STAN clinical guidelines.',
  countries: 'Европа (Neoventa STAN; Швеция, Нидерланды, UK)',
  presets: [
    { label: 'Норма', values: { ctg: 'normal', stEvent: 'none', stage: 'first' } },
    { label: 'Промежуточная + базальный T/QRS', values: { ctg: 'intermediate', stEvent: 'baselineTQRS', stage: 'first' } },
    { label: 'Патологическая + эпизодический T/QRS', values: { ctg: 'abnormal', stEvent: 'episodicTQRS', stage: 'second' } },
    { label: 'Претерминальная', values: { ctg: 'preterminal', stEvent: 'none', stage: 'second' } },
  ],
  caveats: [
    'Метод требует целостного электрода и качественной записи',
    'Претерминальная КТГ - прямое показание к родоразрешению, STAN не применяется',
  ],
  related: [
    { id: 'ctg', title: 'КТГ' },
    { id: 'apgar', title: 'Apgar' },
  ],
  relatedCourses: [
    { id: '302.2', title: 'Акушерство' },
    { id: '301.7', title: 'Интранатальная медицина' },
  ],
  info: `### Для чего используется
**STAN (ST Analysis, Neoventa)** - компьютерный анализ сегмента ST плодовой ЭКГ в дополнение к КТГ. Позволяет различать компенсированную и декомпенсированную гипоксию миокарда плода.

### События
- **Эпизодический T/QRS** - подъём > 0.15 длительностью < 10 мин
- **Базальный T/QRS** - устойчивое превышение 0.10
- **Биазный ST** - 1-3 степени; ≥ 5 мин или ≥ 2 эпизодов считается значимым

### Действия по сочетанию
| КТГ | ST-событие | Тактика |
|---|---|---|
| Нормальная | Любое | Наблюдение |
| Подозрительная | Значимое T/QRS или биазный ≥ 5 мин | Вмешательство |
| Патологическая | Любое значимое | Вмешательство |
| Претерминальная | Не применимо | Родоразрешение |

### Условия применения
- ≥ 36 нед
- Излитие вод, раскрытие ≥ 2-3 см
- Головное предлежание
- Технически качественная запись ≥ 20 мин

### Источники
Amer-Wåhlin Lancet 2001. Neoventa STAN clinical guidelines.`,
};

export default runner;
