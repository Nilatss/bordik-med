// @ts-nocheck
/** Runner: aphab - Abbreviated Profile of Hearing Aid Benefit */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'ec',
      label: 'EC - Ease of Communication (без СА, % затруднений)',
      type: 'number',
      min: 0,
      max: 99,
      step: 1,
      quickValues: [20, 40, 60, 80],
    },
    {
      id: 'bn',
      label: 'BN - Background Noise (без СА, %)',
      type: 'number',
      min: 0,
      max: 99,
      step: 1,
      quickValues: [30, 60, 80, 95],
    },
    {
      id: 'rv',
      label: 'RV - Reverberation (без СА, %)',
      type: 'number',
      min: 0,
      max: 99,
      step: 1,
      quickValues: [20, 50, 75, 90],
    },
    {
      id: 'av',
      label: 'AV - Aversiveness (без СА, % раздражения)',
      type: 'number',
      min: 0,
      max: 99,
      step: 1,
      quickValues: [10, 30, 50, 80],
    },
    {
      id: 'ec_a',
      label: 'EC с СА (%)',
      type: 'number',
      min: 0,
      max: 99,
      step: 1,
      quickValues: [5, 15, 30, 50],
    },
    {
      id: 'bn_a',
      label: 'BN с СА (%)',
      type: 'number',
      min: 0,
      max: 99,
      step: 1,
      quickValues: [20, 40, 60, 80],
    },
    {
      id: 'rv_a',
      label: 'RV с СА (%)',
      type: 'number',
      min: 0,
      max: 99,
      step: 1,
      quickValues: [10, 30, 50, 70],
    },
    {
      id: 'av_a',
      label: 'AV с СА (%)',
      type: 'number',
      min: 0,
      max: 99,
      step: 1,
      quickValues: [20, 40, 60, 85],
    },
  ],
  compute: (v) => {
    const benefit = (u: number, a: number) => Math.max(-99, Math.min(99, u - a));
    const ec = benefit(Number(v.ec) || 0, Number(v.ec_a) || 0);
    const bn = benefit(Number(v.bn) || 0, Number(v.bn_a) || 0);
    const rv = benefit(Number(v.rv) || 0, Number(v.rv_a) || 0);
    const av = -benefit(Number(v.av) || 0, Number(v.av_a) || 0); // aversiveness: negative = worse
    const globalBen = (ec + bn + rv) / 3;

    let band = '', color = '#22C55E', details = '';
    // Cox 1999: benefit ≥ 22% на 2 из 3 субшкал EC/BN/RV = успешная адаптация
    const positiveSubscales = [ec, bn, rv].filter((x) => x >= 22).length;
    if (positiveSubscales >= 2 && globalBen >= 22) {
      band = 'Успешная адаптация СА';
      color = '#22C55E';
      details = `Глобальный выигрыш ${globalBen.toFixed(0)}%. Польза ≥22% в ${positiveSubscales}/3 субшкал - критерий успешности (Cox 1999).`;
    } else if (globalBen >= 10) {
      band = 'Частичный выигрыш';
      color = '#F59E0B';
      details = `Глобальный выигрыш ${globalBen.toFixed(0)}%. Польза есть, но не достигает критерия успешности. Коррекция настройки СА.`;
    } else {
      band = 'Недостаточный выигрыш';
      color = '#EF4444';
      details = `Глобальный выигрыш ${globalBen.toFixed(0)}%. СА не даёт значимой пользы - переоценка (модель, прошивка, CI).`;
    }

    if (av < -20) {
      details += ` Усиление раздражающих звуков (AV ${av.toFixed(0)}%) - переоценить компрессию.`;
    }

    return {
      value: `${globalBen.toFixed(0)}%`,
      unit: 'benefit',
      interpretation: band,
      color,
      details,
      actions: [
        'EC (простая коммуникация): выигрыш 10-30% - норма',
        'BN (шумная среда): выигрыш 15-40% - норма',
        'RV (реверберация): выигрыш 10-30% - норма',
        'AV: отрицательное значение = СА усиливает неприятные звуки (подкрутить MPO)',
        positiveSubscales < 2 ? 'Реналибровка СА: fitting с real-ear measurement (REM)' : 'Мониторинг каждые 6-12 мес',
        'При профундной тугоухости (>90 dB HL) рассмотреть кохлеарную имплантацию',
        'Параллельно: IOI-HA (7 пунктов), SADL (15 пунктов), COSI (индивид. цели)',
      ],
      caveats: [
        'APHAB - 24 пункта × 7 категорий (всегда - никогда), 4 подшкалы × 6 вопросов',
        'Отдельно оценивается без СА (Unaided) и с СА (Aided)',
        'Benefit = Unaided − Aided (отрицательный AV означает ухудшение)',
        'Норматив EC/BN/RV: выигрыш ≥22% на 2/3 - адаптация успешна (Cox 1999)',
        'AV парадоксально ухудшается у ~50% пациентов (компрессия звуков окружения)',
        'Альтернативы: IOI-HA (кратко), SADL, GHABP, COSI',
      ],
      scale: {
        segments: [
          { min: -99, max: 9, label: 'Недостат.', color: '#EF4444' },
          { min: 10, max: 21, label: 'Частичн.', color: '#F59E0B' },
          { min: 22, max: 99, label: 'Успех', color: '#22C55E' },
        ],
        current: Math.round(globalBen),
        unit: '% benefit',
      },
      related: [
        { id: 'pta', title: 'PTA' },
      ],
      relatedCourses: [{ id: '314.3', title: 'Оториноларингология' }],
    };
  },
  reference: 'Cox RM, Alexander GC. The Abbreviated Profile of Hearing Aid Benefit. Ear Hear 1995;16:176-86. Norms: Cox 1999.',
  countries: 'Международный (AAA / ASHA)',
  presets: [
    { label: 'Успех подбора СА', values: { ec: 60, bn: 75, rv: 55, av: 40, ec_a: 20, bn_a: 40, rv_a: 25, av_a: 60 } },
    { label: 'Частичный выигрыш', values: { ec: 55, bn: 70, rv: 60, av: 30, ec_a: 40, bn_a: 55, rv_a: 50, av_a: 55 } },
    { label: 'Недостаточный', values: { ec: 50, bn: 60, rv: 55, av: 20, ec_a: 48, bn_a: 58, rv_a: 55, av_a: 70 } },
  ],
  info: `### Для чего используется
**APHAB (Cox & Alexander 1995)** - валидированный 24-пунктовый опросник для оценки **субъективной пользы слуховых аппаратов**. Сравнивает повседневные затруднения со слухом без и с СА.

### Структура (24 пункта, 4 подшкалы × 6 вопросов)
- **EC (Ease of Communication)** - тихая среда, 1-на-1
- **BN (Background Noise)** - шум, группа людей
- **RV (Reverberation)** - эхо, большие помещения
- **AV (Aversiveness)** - раздражающие звуки (тормоза, крик)

Каждый вопрос - % времени затруднений (1 % → 99 %).

### Вычисление
- **Unaided** (без СА) vs **Aided** (с СА)
- **Benefit = U − A**: выше → больше польза
- **AV**: инвертирован (рост раздражения = хуже)

### Критерий успешности (Cox 1999)
**Benefit ≥ 22 %** на **≥ 2 из 3 субшкал (EC/BN/RV)** = успешная адаптация.

### Типичные выигрыши
| Субшкала | Норма benefit |
|---|---|
| EC | 10-30 % |
| BN | 15-40 % |
| RV | 10-30 % |
| AV | 0 ± 20 % (часто негативный) |

### Применение
- Верификация подбора СА
- Сравнение моделей / программ
- Документация для страховых
- Отбор на кохлеарную имплантацию (APHAB + PTA + речевая аудиометрия)

### Альтернативы
- **IOI-HA (International Outcome Inventory, 7 пунктов)** - краткий скрининг
- **SADL (Satisfaction with Amplification in Daily Life)** - удовлетворение
- **COSI** - индивидуализированные цели
- **GHABP (Glasgow)** - benefit + satisfaction

### Источник
Cox RM, Alexander GC. Ear Hear 1995;16:176.`,
};

export default runner;
