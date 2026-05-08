/** Runner: alsfrs - ALSFRS-R (ALS Functional Rating Scale Revised) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'bulbar', label: 'Бульбарные функции (/12): речь + слюна + глотание', type: 'number', min: 0, max: 12, step: 1, quickValues: [12, 9, 6, 3] },
    { id: 'fine', label: 'Тонкая моторика (/12): почерк + резать пищу + одеваться', type: 'number', min: 0, max: 12, step: 1, quickValues: [12, 9, 6, 3] },
    { id: 'gross', label: 'Крупная моторика (/12): повороты в постели + ходьба + подъём по лестнице', type: 'number', min: 0, max: 12, step: 1, quickValues: [12, 9, 6, 3] },
    { id: 'resp', label: 'Респираторная функция (/12): одышка + ортопноэ + респираторная поддержка', type: 'number', min: 0, max: 12, step: 1, quickValues: [12, 9, 6, 3] },
    { id: 'prior', label: 'Предыдущий балл ALSFRS-R (опционально)', type: 'number', min: 0, max: 48, step: 1, quickValues: [0, 48, 40, 30] },
    { id: 'months', label: 'Месяцы между оценками', type: 'number', min: 0, max: 120, step: 1, quickValues: [0, 3, 6, 12] },
  ],
  compute: (v) => {
    const b = Number(v.bulbar) || 0;
    const f = Number(v.fine) || 0;
    const g = Number(v.gross) || 0;
    const r = Number(v.resp) || 0;
    const total = b + f + g + r;
    const prior = Number(v.prior);
    const months = Number(v.months);

    let band = '', color = '#22C55E', details = '';
    if (total >= 40) { band = 'Сохранная функция'; details = `ALSFRS-R ${total}/48 - минимальное функциональное снижение.`; }
    else if (total >= 30) { band = 'Умеренное снижение'; color = '#F59E0B'; details = `ALSFRS-R ${total}/48 - умеренная функц. инвалидизация.`; }
    else if (total >= 20) { band = 'Выраженное снижение'; color = '#EF4444'; details = `ALSFRS-R ${total}/48 - выраженная инвалидизация. Высокий риск резп. декомпенсации.`; }
    else { band = 'Терминальная'; color = '#991B1B'; details = `ALSFRS-R ${total}/48 - тяжёлая поздняя стадия. Медианная выживаемость ~ 6-12 мес.`; }

    let progressionNote = '';
    if (prior > 0 && months > 0) {
      const rate = (prior - total) / months;
      progressionNote = ` Скорость прогрессии: ${rate.toFixed(2)} баллов/мес.` +
        (rate > 1.2 ? ' Быстрая прогрессия - неблагоприятный прогноз.' : rate < 0.6 ? ' Медленная прогрессия.' : ' Средняя прогрессия.');
    }

    const domainLow = [];
    if (b < 8) domainLow.push('бульбарные симптомы');
    if (f < 8) domainLow.push('тонкая моторика');
    if (g < 8) domainLow.push('крупная моторика');
    if (r < 8) domainLow.push('респираторная функция');

    return {
      value: String(total), unit: '/48',
      interpretation: band, color,
      details: details + progressionNote + (domainLow.length ? ` Затронуто: ${domainLow.join(', ')}.` : ''),
      actions: [
        'Рилузол (Riluzole) 50 мг × 2 - все стадии',
        'Эдаравон (Radicava) - при ALSFRS-R ≥ 2 по каждому пункту, FVC ≥ 80 %',
        r < 10 ? 'Обсудить NIV (неинвазивная вентиляция) - ключевой жизнепродляющий фактор' : 'FVC / SNIP контроль каждые 3 мес',
        b < 8 ? 'PEG-гастростомия при потере > 10 % массы, дисфагии' : 'Питание через рот',
        'Физиотерапия, логопед, эрготерапия',
        'Мультидисциплинарная клиника ALS - доказано улучшает выживаемость',
        'Паллиативная помощь рано (не только в конце)',
      ],
      caveats: [
        'ALSFRS-R - стандарт в RCT и клинике ALS',
        'Диапазон 0-48, норма 48; обычная скорость падения 1 балл/мес',
        'Быстрая прогрессия > 1.2 балла/мес - плохой прогноз',
        'Респираторный домен - ключ к survivorship (FVC + NIV)',
        'Не включает когнитивные симптомы (30-50 % пациентов имеют FTD) - используйте ECAS',
      ],
      scale: {
        segments: [
          { min: 0, max: 19, label: 'Терм.', color: '#991B1B' },
          { min: 20, max: 29, label: 'Выраж.', color: '#EF4444' },
          { min: 30, max: 39, label: 'Умер.', color: '#F59E0B' },
          { min: 40, max: 48, label: 'Сохран.', color: '#22C55E' },
        ],
        current: total,
        unit: 'ALSFRS-R',
      },
      related: [{ id: 'hughes-gbs', title: 'Hughes GBS' }, { id: 'mgfa', title: 'MGFA (MG)' }],
      relatedCourses: [{ id: '310.4', title: 'БАС и болезни двигат. нейрона' }],
    };
  },
  reference: 'Cedarbaum JM et al. The ALSFRS-R: a revised ALS functional rating scale. J Neurol Sci 1999;169:13-21.',
  countries: 'Международный (WFN)',
  presets: [
    { label: 'Ранняя (ALSFRS-R 42)', values: { bulbar: 12, fine: 11, gross: 10, resp: 9, prior: 0, months: 0 } },
    { label: 'Умер. прогр. 1 балл/мес', values: { bulbar: 8, fine: 7, gross: 7, resp: 8, prior: 38, months: 6 } },
    { label: 'Поздняя + NIV', values: { bulbar: 6, fine: 3, gross: 3, resp: 4, prior: 28, months: 12 } },
  ],
  info: `### Для чего используется
ALSFRS-R - стандарт оценки функционального статуса при БАС (амиотрофическом латеральном склерозе). Применяется в клинике и RCT.

### Структура (12 пунктов × 0-4 = 0-48)
- **Бульбарные** (3 пункта): речь, слюна, глотание
- **Тонкая моторика** (3): почерк, резать пищу, одеваться
- **Крупная моторика** (3): повороты в постели, ходьба, лестница
- **Респираторная** (3): одышка, ортопноэ, вентиляция

### Интерпретация
| Балл | Стадия |
|---|---|
| 40-48 | Сохранная функция |
| 30-39 | Умеренное снижение |
| 20-29 | Выраженное |
| 0-19 | Терминальная |

### Прогрессия
- Обычная скорость: **1 балл/мес**
- Быстрая (>1.2 балла/мес): плохой прогноз, медиана выживаемости < 2 лет
- Медленная (<0.6 балла/мес): лучший прогноз

### Ключевые вмешательства
- **Рилузол**: ~ 3 мес продления выживаемости
- **NIV**: ~ 7-12 мес продления
- **PEG**: при потере > 10 % веса
- **Мультидисцип. клиника**: 7.5 мес продления (Traynor 2003)

### Источник
Cedarbaum JM et al. J Neurol Sci 1999;169:13.`,
};

export default runner;
