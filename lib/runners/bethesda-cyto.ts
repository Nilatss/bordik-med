// @ts-nocheck
/** Runner: bethesda-cyto - цитология шейки матки (Bethesda System 2014) */
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
      id: 'result',
      label: 'Результат цитологии',
      type: 'select',
      options: [
        { value: 'nilm', label: 'NILM - нет интраэпителиального поражения' },
        { value: 'ascus', label: 'ASC-US - атипичные клетки плоского эпителия неясного значения' },
        { value: 'asch', label: 'ASC-H - атипичные, не исключающие HSIL' },
        { value: 'lsil', label: 'LSIL - низкая степень (CIN 1, HPV)' },
        { value: 'hsil', label: 'HSIL - высокая степень (CIN 2/3)' },
        { value: 'scc', label: 'SCC - плоскоклеточный рак' },
        { value: 'agc', label: 'AGC - атипичные железистые клетки' },
        { value: 'ais', label: 'AIS - эндоцервикальная аденокарцинома in situ' },
        { value: 'adeno', label: 'Аденокарцинома' },
      ],
    },
    {
      id: 'age',
      label: 'Возраст',
      type: 'select',
      options: [
        { value: 'lt25', label: '< 25 лет' },
        { value: '25to29', label: '25-29 лет' },
        { value: 'ge30', label: '≥ 30 лет' },
      ],
    },
  ],
  compute: (v) => {
    const r = v.result;
    const age = v.age;
    const map: Record<string, { title: string; action: string; color: string; desc: string }> = {
      nilm: { title: 'NILM', action: 'Рутинный скрининг', color: '#22C55E', desc: 'Нет интраэпителиального поражения или злокачественности. Продолжить скрининг по национальным протоколам.' },
      ascus: { title: 'ASC-US', action: 'Рефлекс HPV-тест', color: '#F59E0B', desc: 'ASC-US: риск CIN 3+ ~ 2 %. Рефлекс HPV-тест (≥ 25 лет) или повторная цитология через 1 год (< 25 лет).' },
      asch: { title: 'ASC-H', action: 'Кольпоскопия', color: '#EF4444', desc: 'ASC-H: риск CIN 3+ ~ 25-50 %. Прямая кольпоскопия.' },
      lsil: { title: 'LSIL', action: 'Кольпоскопия (≥ 25 лет) / наблюдение (< 25)', color: '#F59E0B', desc: 'LSIL: CIN 1 эквивалент, риск CIN 3+ ~ 5 %.' },
      hsil: { title: 'HSIL', action: 'Кольпоскопия + биопсия', color: '#DC2626', desc: 'HSIL: CIN 2/3, риск CIN 3+ 60-70 %. Кольпоскопия, возможен excisional treatment.' },
      scc: { title: 'SCC', action: 'Срочная онкогинекологическая консультация', color: '#7F1D1D', desc: 'Плоскоклеточный рак - стадирование FIGO, МРТ таза, биопсия.' },
      agc: { title: 'AGC', action: 'Кольпоскопия + эндоцервикальный кюретаж ± эндометрия', color: '#DC2626', desc: 'AGC: риск злокачественности 9-54 %. Оценка эндоцервикса и эндометрия (≥ 35 лет или факторы риска).' },
      ais: { title: 'AIS', action: 'Диагностическая эксцизия (cold-knife cone)', color: '#DC2626', desc: 'AIS: конизация с отрицательными краями; гистерэктомия при завершённом деторождении.' },
      adeno: { title: 'Аденокарцинома', action: 'Онкогинеколог; FIGO стадирование', color: '#7F1D1D', desc: 'Инвазивная аденокарцинома - онкологическое ведение.' },
    };
    const m = map[r] || map.nilm;
    return {
      value: m.title,
      unit: '',
      interpretation: `${m.title} · ${m.action}`,
      color: m.color,
      details: m.desc,
      actions: [
        'Возраст влияет на тактику - см. ASCCP 2019',
        'HPV-ко-тестирование рекомендовано ≥ 30 лет',
        'При беременности биопсия по строгим показаниям; конизация - только при инвазии',
      ],
      caveats: [
        'Bethesda 2014 - обновление 2001 (Nayar, Solomon)',
        'Цитология не заменяет гистологию - диагноз ставится по биопсии',
        'Качество пробы (satisfactory / unsatisfactory) должно указываться в заключении',
        'У пациенток < 25 лет тактика более консервативная',
      ],
      related: [
        { id: 'asccp', title: 'ASCCP 2019' },
        { id: 'figo-staging', title: 'FIGO staging' },
      ],
      relatedCourses: [
        { id: '203.9', title: 'Гинекология' },
        { id: '201.7', title: 'Онкология' },
      ],
    };
  },
  reference: 'Nayar R, Wilbur DC. The Bethesda System for Reporting Cervical Cytology, 3rd edition. Springer, 2015.',
  countries: 'Международный (Bethesda)',
  presets: [
    { label: 'NILM', values: { result: 'nilm', age: 'ge30' } },
    { label: 'ASC-US (30+)', values: { result: 'ascus', age: 'ge30' } },
    { label: 'HSIL', values: { result: 'hsil', age: 'ge30' } },
    { label: 'AGC', values: { result: 'agc', age: 'ge30' } },
  ],
  caveats: ['Интерпретация в связке с HPV-статусом', 'Тактика по ASCCP 2019'],
  related: [
    { id: 'asccp', title: 'ASCCP 2019' },
    { id: 'figo-staging', title: 'FIGO staging' },
  ],
  relatedCourses: [
    { id: '203.9', title: 'Гинекология' },
    { id: '201.7', title: 'Онкология' },
  ],
  info: `### Bethesda System 2014
Стандартизованная номенклатура для заключений цитологии шейки матки.

### Категории результатов
- **NILM** - норма
- **ASC-US / ASC-H** - атипичные плоские клетки
- **LSIL / HSIL** - плоскоклеточное поражение низкой / высокой степени
- **SCC** - плоскоклеточный рак
- **AGC** - атипичные железистые клетки
- **AIS** - аденокарцинома in situ
- **Аденокарцинома** - инвазивная

### Источник
Nayar, Wilbur. Bethesda System 2014 (3rd edition).`,
};

export default runner;
