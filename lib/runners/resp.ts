/**
 * Runner: resp - RESP Score (Schmidt 2014) для VV-ECMO при тяжёлом ARDS
 */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'age', label: 'Возраст', type: 'select',
      options: [
        { value: '0', label: '18-49 лет (0)' },
        { value: '-2', label: '50-59 лет (−2)' },
        { value: '-3', label: '≥ 60 лет (−3)' },
      ],
    },
    { id: 'immuno', label: 'Иммунокомпрометация', type: 'checkbox' },
    {
      id: 'vent', label: 'Длительность ИВЛ до ECMO', type: 'select',
      options: [
        { value: '3', label: '< 48 ч (+3)' },
        { value: '1', label: '48 ч - 7 сут (+1)' },
        { value: '0', label: '> 7 сут (0)' },
      ],
    },
    {
      id: 'dx', label: 'Этиология ARDS', type: 'select',
      options: [
        { value: '3', label: 'Вирусная пневмония (+3)' },
        { value: '3b', label: 'Бактериальная пневмония (+3)' },
        { value: '2', label: 'Астма (+11 исторически, здесь используем класс этиологии +2)' },
        { value: '1', label: 'Травма / ожог (+3)' },
        { value: '0', label: 'Аспирация (+5)' },
        { value: 'n1', label: 'Другая острая причина (+1)' },
        { value: 'n0', label: 'Неинфекционное не-лёгочное (0)' },
      ],
    },
    { id: 'cns', label: 'Нейродисфункция ЦНС (−1)', type: 'checkbox' },
    { id: 'infect', label: 'Сопутствующая внелёгочная бактериемия (−3)', type: 'checkbox' },
    { id: 'nmb', label: 'Нейромышечная блокада до ECMO (+1)', type: 'checkbox' },
    { id: 'no', label: 'iNO до ECMO (+1)', type: 'checkbox' },
    { id: 'bicarb', label: 'HCO₃⁻ < 15 ммоль/л (−2)', type: 'checkbox' },
    {
      id: 'pip', label: 'Peak inspiratory pressure', type: 'select',
      options: [
        { value: '0', label: '< 42 см H₂O (0)' },
        { value: '-1', label: '≥ 42 см H₂O (−1)' },
      ],
    },
  ],
  compute: (v) => {
    const sum = Number(v.age) + Number(v.vent) + (Number(v.pip) || 0)
      + (v.immuno ? -2 : 0)
      + (v.cns ? -7 : 0)
      + (v.infect ? -3 : 0)
      + (v.nmb ? 1 : 0)
      + (v.no ? 1 : 0)
      + (v.bicarb ? -2 : 0);
    const dxMap: Record<string, number> = { '3': 3, '3b': 3, '2': 11, '1': 3, '0': 5, 'n1': 1, 'n0': 0 };
    const dxPts = dxMap[String(v.dx || 'n0')] ?? 0;
    const total = sum + dxPts;
    let cls = 'V', color = '#991B1B', surv = '18%', details = '';
    if (total >= 6) { cls = 'I'; color = '#22C55E'; surv = '92%'; details = 'Класс I - очень высокая выживаемость после VV-ECMO.'; }
    else if (total >= 3) { cls = 'II'; color = '#84CC16'; surv = '76%'; details = 'Класс II - высокая выживаемость.'; }
    else if (total >= -1) { cls = 'III'; color = '#F59E0B'; surv = '57%'; details = 'Класс III - промежуточная выживаемость.'; }
    else if (total >= -5) { cls = 'IV'; color = '#EF4444'; surv = '33%'; details = 'Класс IV - низкая выживаемость.'; }
    else { cls = 'V'; color = '#991B1B'; surv = '18%'; details = 'Класс V - очень низкая выживаемость; тщательно взвесить показания.'; }
    return {
      value: `RESP ${total} · Class ${cls}`,
      interpretation: `Class ${cls} · выживаемость ${surv}`,
      color,
      details,
      actions: [
        'Применять EOLIA / Berlin критерии для отбора на VV-ECMO',
        'Для VA-ECMO (кардиогенный шок) - использовать SAVE score',
        'Оптимизировать ИВЛ и прон до ECMO; исключить обратимые причины',
        'Центр ECMO, MDT обсуждение',
      ],
      caveats: [
        'Валидирован для VV-ECMO при тяжёлом ARDS (Schmidt 2014, n=2355)',
        'Диапазон от −22 до +15 баллов',
        'Для VA-ECMO - см. SAVE score',
        'Не замена клинической оценке; учитывать коморбидность',
      ],
      related: [
        { id: 'preserve', title: 'PRESERVE' },
        { id: 'berlin-ards', title: 'Berlin ARDS' },
        { id: 'murray-ecmo', title: 'Murray LIS (ECMO)' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Интенсивная терапия' },
        { id: '301.1', title: 'Анестезиология' },
      ],
    };
  },
  reference: 'Schmidt M, Bailey M, Sheldrake J, et al. Predicting survival after extracorporeal membrane oxygenation for severe acute respiratory failure. The RESP Score. Am J Respir Crit Care Med 2014;189:1374-1382.',
  countries: 'Международный (ELSO)',
  presets: [
    { label: 'Class I (высокая выживаемость)', values: { age: '0', vent: '3', dx: '3', pip: '0' } },
    { label: 'Class III', values: { age: '-2', vent: '1', dx: 'n1', pip: '0' } },
    { label: 'Class V', values: { age: '-3', vent: '0', dx: 'n0', pip: '-1', immuno: true, bicarb: true } },
  ],
  caveats: [
    'Только VV-ECMO при ARDS',
    'Для кардиогенного шока - SAVE',
    'Диапазон −22…+15',
  ],
  info: `### Для чего используется
**RESP Score (Respiratory ECMO Survival Prediction, Schmidt 2014)** - прогноз госпитальной выживаемости перед VV-ECMO у пациентов с тяжёлым ARDS.

### 12 предикторов (диапазон −22 … +15)
Возраст, иммунокомпрометация, длительность ИВЛ, диагноз, ЦНС-дисфункция, внелёгочная инфекция, NMB, iNO, HCO₃⁻, PIP и др.

### Классы и выживаемость
| Класс | Баллы | Выживаемость |
|---|---|---|
| I | ≥ 6 | 92% |
| II | 3…5 | 76% |
| III | −1…2 | 57% |
| IV | −5…−2 | 33% |
| V | ≤ −6 | 18% |

### Для VA-ECMO - SAVE Score
Отдельная шкала для кардиогенного шока.

### Источник
Schmidt M et al. Am J Respir Crit Care Med 2014;189:1374-82.`,
};

export default runner;
