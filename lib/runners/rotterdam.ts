// @ts-nocheck
/** Runner: rotterdam - диагностика СПКЯ (Rotterdam 2003 / AE-PCOS 2006) */
import type {
  ScoreTool,
  ToolInput,
  ScoreBand,
  Preset,
  CalculatorResult,
  ResultExtras,
  ResultScaleSegment,
} from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 3,
  inputs: [
    { id: 'oligo', label: 'Олиго/ановуляция (цикл > 35 сут или < 8 циклов/год)', type: 'checkbox', points: 1 },
    { id: 'hyper', label: 'Клиническая / биохимическая гиперандрогения (гирсутизм mFG ≥ 4-6, акне, алопеция; повышенный свободный тестостерон)', type: 'checkbox', points: 1 },
    { id: 'pco', label: 'Поликистозные яичники по УЗИ (≥ 20 фолликулов 2-9 мм и/или объём > 10 мл по TVS ≥ 8 МГц)', type: 'checkbox', points: 1 },
  ],
  bands: [
    { min: 0, max: 1, label: 'Диагноз СПКЯ не подтверждён', color: '#22C55E', interpretation: 'Нет достаточных критериев (< 2).', actions: ['Искать альтернативные причины олигоменореи/гиперандрогении'] },
    { min: 2, max: 3, label: 'СПКЯ по Rotterdam (≥ 2 критериев)', color: '#F59E0B', interpretation: 'Диагноз СПКЯ установлен после исключения иных причин.', actions: ['Исключить ТТГ, пролактин, 17-OHP (CAH), кортизол', 'Оценить метаболический риск: BMI, OGTT, липиды, АД', 'Вести по международному гайдлайну PCOS 2023 (Teede)'] },
  ],
  reference:
    'Rotterdam ESHRE/ASRM-Sponsored PCOS Consensus Workshop Group. Fertil Steril 2004;81:19-25. Azziz R et al. AE-PCOS Society criteria 2006. Teede HJ et al. International PCOS Guideline 2023.',
  countries: 'Международный (ESHRE/ASRM, AE-PCOS, Teede 2023)',
  presets: [
    { label: 'Классический фенотип A', values: { oligo: true, hyper: true, pco: true } },
    { label: 'Овуляторный (фенотип C)', values: { oligo: false, hyper: true, pco: true } },
    { label: 'Нет СПКЯ', values: { oligo: true, hyper: false, pco: false } },
  ],
  caveats: [
    'Диагноз - исключения: ТТГ, пролактин, 17-OHP, кортизол (по показаниям)',
    'AE-PCOS 2006 требует обязательную гиперандрогению + 1 из двух',
    'У подростков УЗИ-критерий не применяется (гинекологический возраст < 8 лет)',
    'Международный PCOS Guideline 2023: АМГ может заменить УЗИ у взрослых',
  ],
  related: [
    { id: 'palm-coein', title: 'PALM-COEIN' },
    { id: 'homa-ir', title: 'HOMA-IR' },
  ],
  relatedCourses: [
    { id: '301.4', title: 'Эндокринология' },
    { id: '203.9', title: 'Гинекология' },
  ],
  info: `### Rotterdam 2003
СПКЯ = наличие ≥ 2 из 3 критериев (после исключения иных причин):
1. Олиго/ановуляция
2. Клиническая/биохимическая гиперандрогения
3. Поликистозные яичники по УЗИ

### AE-PCOS Society 2006
Требует обязательную гиперандрогению + 1 из: овуляторная дисфункция, поликистозные яичники.

### Подросток - особые правила
УЗИ не применяется первые 8 лет после менархе. Диагноз: олигоменорея > 2 лет + гиперандрогения.

### Международный гайдлайн 2023 (Teede)
АМГ ≥ 3.2 нг/мл может заменить УЗИ у взрослых. Обязательный метаболический скрининг.

### Источники
Rotterdam ESHRE/ASRM 2003. AE-PCOS 2006. Teede International PCOS Guideline 2023.`,
};

export default runner;
