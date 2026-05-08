/**
 * Runner: kigali - Kigali modification of the Berlin ARDS definition (Riviello 2016)
 * Низкоресурсный вариант: SpO₂/FiO₂ вместо PaO₂/FiO₂, УЗИ лёгких + рентген, без PEEP.
 */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'timing', label: 'Начало в течение < 1 недели от известного инсульта/новых симптомов', type: 'checkbox' },
    { id: 'bilateral', label: 'Двусторонние инфильтраты на УЗИ лёгких или рентгенограмме', type: 'checkbox' },
    { id: 'noncardiac', label: 'Отёк не объясняется сердечной недостаточностью/гиперволемией', type: 'checkbox' },
    { id: 'sf315', label: 'SpO₂/FiO₂ ≤ 315 (эквивалент PaO₂/FiO₂ ≤ 300)', type: 'checkbox' },
    {
      id: 'severity', label: 'Степень гипоксемии (SpO₂/FiO₂)', type: 'select',
      options: [
        { value: 'none', label: '> 315 - не ARDS' },
        { value: 'mild', label: '236-315 - лёгкая' },
        { value: 'mod', label: '151-235 - умеренная' },
        { value: 'sev', label: '≤ 150 - тяжёлая' },
      ],
    },
  ],
  compute: (v) => {
    const t = !!v.timing, b = !!v.bilateral, nc = !!v.noncardiac, sf = !!v.sf315;
    if (!t || !b || !nc || !sf) {
      return {
        value: 'Не ARDS (Kigali)',
        interpretation: 'Критерии Kigali не выполнены',
        color: '#22C55E',
        details: 'Для диагноза по Kigali необходимы ВСЕ 4 критерия: начало < 1 нед, двусторонние инфильтраты (УЗИ или рентген), отёк не кардиогенного генеза и SpO₂/FiO₂ ≤ 315.',
        actions: ['Искать альтернативные причины гипоксемии', 'ЭхоКГ для исключения кардиогенного отёка'],
        related: [
          { id: 'berlin-ards', title: 'Berlin ARDS' },
          { id: 'murray', title: 'Murray LIS' },
          { id: 'rox', title: 'ROX' },
        ],
        relatedCourses: [{ id: '300.4', title: 'Интенсивная терапия' }],
      };
    }
    const sev = String(v.severity || 'mild');
    let label = 'Лёгкий ARDS', color = '#F59E0B', details = 'Kigali лёгкий (S/F 236-315).';
    let actions = ['Низкопоточный O₂ / HFNC / CPAP', 'Консервативная инфузия', 'Лечение причины'];
    if (sev === 'mod') {
      label = 'Умеренный ARDS (Kigali)'; color = '#EF4444';
      details = 'Kigali умеренный (S/F 151-235). Госпитальная летальность выше, чем при лёгком.';
      actions = ['CPAP/НИВЛ при доступности', 'Vt 6 мл/кг IBW если ИВЛ', 'Прон-позиция (awake prone)', 'Консервативная инфузия'];
    } else if (sev === 'sev') {
      label = 'Тяжёлый ARDS (Kigali)'; color = '#991B1B';
      details = 'Kigali тяжёлый (S/F ≤ 150). В низкоресурсном окружении - высокая летальность.';
      actions = ['ИВЛ Vt 6 мл/кг IBW + PEEP-таблица ARDSnet', 'Прон-позиция ≥ 16 ч/сут', 'Нейромышечная блокада ≤ 48 ч', 'Транспорт в центр с ECMO, если доступен'];
    } else if (sev === 'none') {
      return {
        value: 'S/F > 315',
        interpretation: 'Не ARDS',
        color: '#22C55E',
        details: 'SpO₂/FiO₂ > 315 не соответствует критериям гипоксемии Kigali.',
        actions: ['Наблюдение'],
        related: [{ id: 'berlin-ards', title: 'Berlin ARDS' }],
        relatedCourses: [{ id: '300.4', title: 'Интенсивная терапия' }],
      };
    }
    return {
      value: label,
      interpretation: label,
      color,
      details,
      actions,
      caveats: [
        'Kigali не требует PEEP - создан для низкоресурсных условий (Руанда)',
        'SpO₂ > 97% делает S/F ненадёжным - интерпретировать с осторожностью',
        'УЗИ лёгких зависит от оператора, но позволяет диагностику без CXR',
      ],
      related: [
        { id: 'berlin-ards', title: 'Berlin ARDS' },
        { id: 'murray', title: 'Murray LIS' },
        { id: 'rox', title: 'ROX' },
        { id: 'hacor', title: 'HACOR' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Интенсивная терапия' },
        { id: '301.1', title: 'Анестезиология' },
      ],
    };
  },
  reference: 'Riviello ED et al. Hospital Incidence and Outcomes of the Acute Respiratory Distress Syndrome Using the Kigali Modification of the Berlin Definition. Am J Respir Crit Care Med 2016;193:52-59.',
  countries: 'Низкоресурсные страны (валидировано в Руанде)',
  presets: [
    { label: 'Лёгкий Kigali', values: { timing: true, bilateral: true, noncardiac: true, sf315: true, severity: 'mild' } },
    { label: 'Умеренный Kigali', values: { timing: true, bilateral: true, noncardiac: true, sf315: true, severity: 'mod' } },
    { label: 'Тяжёлый Kigali', values: { timing: true, bilateral: true, noncardiac: true, sf315: true, severity: 'sev' } },
  ],
  caveats: [
    'Не требует PEEP и ABG - ключевое отличие от Berlin 2012',
    'УЗИ лёгких - равнозначная альтернатива рентгену',
    'Тяжесть определяется SpO₂/FiO₂: > 315 / 236-315 / 151-235 / ≤ 150',
  ],
  info: `### Для чего используется
**Kigali modification of the Berlin ARDS Definition (Riviello 2016)** - адаптация Берлинских критериев для стран с ограниченными ресурсами, где ABG и ИВЛ с PEEP недоступны.

### Отличия от Berlin 2012
| Критерий | Berlin | Kigali |
|---|---|---|
| Оксигенация | PaO₂/FiO₂ | **SpO₂/FiO₂** |
| PEEP ≥ 5 | Требуется | **Не требуется** |
| Визуализация | CXR / КТ | **УЗИ лёгких или CXR** |

### Степени по S/F
| Степень | SpO₂/FiO₂ |
|---|---|
| Лёгкий | 236-315 |
| Умеренный | 151-235 |
| Тяжёлый | ≤ 150 |

### Источник
Riviello ED et al. Am J Respir Crit Care Med 2016;193:52-9.`,
};

export default runner;
