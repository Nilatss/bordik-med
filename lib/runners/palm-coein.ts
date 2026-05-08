/** Runner: palm-coein - классификация аномальных маточных кровотечений (FIGO 2011) */
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
      id: 'cause',
      label: 'Предполагаемая причина АМК',
      type: 'select',
      options: [
        { value: 'P', label: 'Polyp - полип эндометрия/цервикса' },
        { value: 'A', label: 'Adenomyosis - аденомиоз' },
        { value: 'LSM', label: 'Leiomyoma - субмукозная миома' },
        { value: 'LO', label: 'Leiomyoma - иной локализации' },
        { value: 'M', label: 'Malignancy/гиперплазия' },
        { value: 'C', label: 'Coagulopathy - коагулопатия' },
        { value: 'O', label: 'Ovulatory dysfunction - овуляторная дисфункция' },
        { value: 'E', label: 'Endometrial - эндометриальная причина' },
        { value: 'I', label: 'Iatrogenic - ятрогенная' },
        { value: 'N', label: 'Not yet classified' },
      ],
    },
  ],
  compute: (v) => {
    const c = v.cause;
    const map: Record<string, { title: string; color: string; desc: string; actions: string[] }> = {
      P: {
        title: 'AUB-P (полип)',
        color: '#F59E0B',
        desc: 'Полип эндометрия - ведёт к межменструальным кровотечениям. Диагностика: ТВУЗИ, гистероскопия.',
        actions: ['Гистероскопическая полипэктомия с гистологией'],
      },
      A: {
        title: 'AUB-A (аденомиоз)',
        color: '#F59E0B',
        desc: 'Аденомиоз: гетеротопия эндометрия в миометрии. МРТ чувствительна; UZ-критерии MUSA.',
        actions: ['Левоноргестрел-ВМС (Мирена) 1-я линия', 'ГнРГ-агонисты, гистерэктомия'],
      },
      LSM: {
        title: 'AUB-LSM (субмукозная миома)',
        color: '#EF4444',
        desc: 'Субмукозная миома (ESGE типы 0-2) - частая причина меноррагий.',
        actions: ['Гистерорезектоскопия', 'Улипристал (где доступно), ГнРГ как мост'],
      },
      LO: {
        title: 'AUB-LO (миома иной локализации)',
        color: '#F59E0B',
        desc: 'Интрамуральная / субсерозная миома. Симптоматическое ведение.',
        actions: ['ЛНГ-ВМС, НПВС, транексам', 'Миомэктомия / эмболизация'],
      },
      M: {
        title: 'AUB-M (малигнизация / гиперплазия)',
        color: '#DC2626',
        desc: 'Гиперплазия эндометрия или рак - факторы риска: ожирение, СД, эстрогенная терапия. Биопсия эндометрия обязательна.',
        actions: ['Биопсия аспирационная / Pipelle', 'Гистероскопия + раздельное выскабливание', 'Онкогинеколог при раке'],
      },
      C: {
        title: 'AUB-C (коагулопатия)',
        color: '#EF4444',
        desc: 'Коагулопатия - до 20 % подростков с меноррагией: vWD, тромбоцитопатии.',
        actions: ['Скрининг: ПТВ/АЧТВ, vWF, Ristocetin', 'Транексам, десмопрессин, гормональная супрессия'],
      },
      O: {
        title: 'AUB-O (овуляторная дисфункция)',
        color: '#F59E0B',
        desc: 'Ановуляция (СПКЯ, перименопауза, тиреоидные нарушения, гиперпролактинемия).',
        actions: ['Гестагены, КОК, ЛНГ-ВМС', 'Коррекция причины (ТТГ, пролактин, СПКЯ)'],
      },
      E: {
        title: 'AUB-E (эндометриальная)',
        color: '#F59E0B',
        desc: 'Первичное нарушение гемостаза эндометрия при регулярных циклах - диагноз исключения.',
        actions: ['Транексам 1 г × 3-4/сут', 'НПВС, ЛНГ-ВМС'],
      },
      I: {
        title: 'AUB-I (ятрогенная)',
        color: '#F59E0B',
        desc: 'Антикоагулянты, КОК с пропусками, ВМС (не-ЛНГ), тамоксифен.',
        actions: ['Пересмотр терапии', 'Коррекция режима гормонов'],
      },
      N: {
        title: 'AUB-N (неклассифицированная)',
        color: '#6B7280',
        desc: 'Артериовенозная мальформация, ниша после КС, хронический эндометрит.',
        actions: ['Расширенная визуализация (МРТ)', 'Биопсия при подозрении на эндометрит'],
      },
    };
    const m = (map[String(c)] || map.N)!;
    return {
      value: m.title,
      unit: '',
      interpretation: m.title,
      color: m.color,
      details: m.desc,
      actions: m.actions,
      caveats: [
        'PALM = структурные (визуализация/гистология); COEIN = неструктурные',
        'У одной пациентки возможно сочетание (AUB-P-LSM-O)',
        'RCOG HMB: ЛНГ-ВМС - 1-я линия при отсутствии структурной патологии',
        'У женщин ≥ 45 лет с АМК - биопсия эндометрия обязательна',
      ],
      related: [
        { id: 'rotterdam', title: 'Rotterdam PCOS' },
        { id: 'bethesda-cyto', title: 'Bethesda' },
      ],
      relatedCourses: [
        { id: '203.9', title: 'Гинекология' },
        { id: '301.4', title: 'Эндокринология' },
      ],
    };
  },
  reference:
    'Munro MG, Critchley HOD, Broder MS, Fraser IS; FIGO Working Group on Menstrual Disorders. FIGO classification system (PALM-COEIN). Int J Gynaecol Obstet 2011;113:3-13. RCOG/NICE NG88 Heavy Menstrual Bleeding 2018.',
  countries: 'Международный (FIGO, RCOG, NICE)',
  presets: [
    { label: 'Субмукозная миома', values: { cause: 'LSM' } },
    { label: 'Коагулопатия (подросток)', values: { cause: 'C' } },
    { label: 'Ановуляция', values: { cause: 'O' } },
    { label: 'Гиперплазия/рак', values: { cause: 'M' } },
  ],
  caveats: ['Комбинации причин встречаются часто', 'Биопсия эндометрия обязательна при АМК ≥ 45 лет или факторах риска'],
  related: [
    { id: 'rotterdam', title: 'Rotterdam PCOS' },
    { id: 'bethesda-cyto', title: 'Bethesda' },
  ],
  relatedCourses: [
    { id: '203.9', title: 'Гинекология' },
    { id: '301.4', title: 'Эндокринология' },
  ],
  info: `### PALM-COEIN (FIGO 2011)
Классификация аномальных маточных кровотечений у небеременных репродуктивного возраста.

### Структурные (PALM)
Polyp · Adenomyosis · Leiomyoma (LSM / LO) · Malignancy/hyperplasia.

### Неструктурные (COEIN)
Coagulopathy · Ovulatory dysfunction · Endometrial · Iatrogenic · Not yet classified.

### Ведение HMB (RCOG/NICE)
1-я линия без структурной патологии - ЛНГ-ВМС. 2-я - транексам, НПВС, КОК. 3-я - гестагены / хирургия.

### Источники
Munro MG FIGO 2011. RCOG/NICE NG88 HMB 2018.`,
};

export default runner;
