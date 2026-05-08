/** Runner: iop - Intraocular Pressure with CCT correction */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'iop', label: 'ВГД (Goldmann тонометрия, мм рт.ст.)', type: 'number', min: 5, max: 70, step: 1, quickValues: [12, 18, 22, 30] },
    { id: 'cct', label: 'ЦТР (центральная толщина роговицы, мкм)', type: 'number', min: 400, max: 700, step: 5, quickValues: [520, 545, 570, 600] },
    { id: 'discExcav', label: 'Экскавация ДЗН (C/D ratio)', type: 'number', min: 0, max: 1, step: 0.05, quickValues: [0.3, 0.5, 0.7, 0.9] },
    { id: 'vf', label: 'Дефекты поля зрения (по SAP)', type: 'checkbox' },
  ],
  compute: (v) => {
    const iop = Math.max(0, Number(v.iop) || 0);
    const cct = Math.max(400, Number(v.cct) || 545);
    // Ehlers correction: ~0.7 mmHg per 10 μm deviation from 545
    const correction = ((545 - cct) / 10) * 0.7;
    const iopCorrected = iop + correction;
    const cd = Number(v.discExcav) || 0;
    const vfDefect = !!v.vf;

    let band = '', color = '#22C55E', details = '';
    if (iopCorrected <= 21 && cd <= 0.5 && !vfDefect) {
      band = 'Норма';
      color = '#22C55E';
      details = `ВГД (corr.) ${iopCorrected.toFixed(1)} мм рт.ст., C/D ${cd.toFixed(2)}. Без признаков глаукомы.`;
    } else if (iopCorrected > 21 && cd <= 0.5 && !vfDefect) {
      band = 'Офтальмогипертензия';
      color = '#F59E0B';
      details = `ВГД (corr.) ${iopCorrected.toFixed(1)} > 21, ДЗН интактен, СПЗ норма → ocular hypertension. Риск перехода в глаукому 1-2%/год.`;
    } else if (iopCorrected <= 21 && (cd > 0.5 || vfDefect)) {
      band = 'Подозрение / НТГ';
      color = '#FB923C';
      details = `ВГД (corr.) ${iopCorrected.toFixed(1)} ≤ 21 + экскавация/дефект СПЗ → подозрение на глаукому нормального давления (НТГ).`;
    } else if (iopCorrected > 21 && (cd > 0.5 || vfDefect)) {
      band = 'Вероятная глаукома';
      color = '#EF4444';
      details = `ВГД ${iopCorrected.toFixed(1)} > 21 + экскавация ${cd.toFixed(2)} ${vfDefect ? '+ дефект СПЗ' : ''} → высоковероятна ПОУГ.`;
    } else {
      band = 'Глаукомный подозреваемый';
      color = '#F59E0B';
      details = `Глаукомный suspect — нужен мониторинг.`;
    }

    if (iop >= 30) {
      band = 'Острая гипертензия';
      color = '#991B1B';
      details = `ВГД ${iop} ≥ 30 мм рт.ст. — угроза потери зрения. Исключить острый приступ закрытоугольной глаукомы.`;
    }

    return {
      value: iopCorrected.toFixed(1),
      unit: 'мм рт.ст. (corr.)',
      interpretation: band,
      color,
      details: `${details} Коррекция на ЦТР: ${correction >= 0 ? '+' : ''}${correction.toFixed(1)} мм рт.ст.`,
      actions: [
        iop >= 30 ? 'СРОЧНО: системная ацетазоламид, местный тимолол+бриматиш, мантическая терапия' : '',
        iopCorrected > 21 ? 'Гониоскопия — открытый/закрытый угол' : '',
        cd > 0.5 || vfDefect ? 'OCT RNFL + SAP 24-2 (стандартная периметрия)' : '',
        'Суточный профиль ВГД (диурнальная кривая) — выявление пиков',
        'Пахиметрия при первом визите — ЦТР критична для интерпретации',
        iopCorrected > 25 || (cd > 0.5 && iopCorrected > 21) ? 'Стартовая гипотензивная терапия — простагландиновый аналог 1 раз/сут' : '',
      ].filter(Boolean),
      caveats: [
        'Норма ВГД: 10-21 мм рт.ст. (средн. 15-16, нормальное распределение)',
        'Goldmann калиброван на ЦТР 545 мкм — тонкая роговица занижает, толстая завышает',
        'Ehlers: +0.7 мм рт.ст. на каждые 10 мкм меньше 545',
        'Dresdner: +0.4 мм рт.ст. на каждые 10 мкм — менее агрессивная коррекция',
        'Корнеальный гистерезис (CH, Ocular Response Analyzer) — дополнительный предиктор',
        'ЦТР < 555 мкм — независимый фактор риска глаукомы (OHTS)',
        'Коррекция не заменяет диагноз — клинический контекст первичен',
      ],
      scale: {
        segments: [
          { min: 5, max: 21, label: 'Норма', color: '#22C55E' },
          { min: 22, max: 25, label: 'Лёгк. пов.', color: '#F59E0B' },
          { min: 26, max: 30, label: 'Умер.', color: '#FB923C' },
          { min: 31, max: 40, label: 'Высокое', color: '#EF4444' },
          { min: 41, max: 70, label: 'Критич.', color: '#991B1B' },
        ],
        current: Math.round(iopCorrected),
        unit: 'мм рт.ст.',
      },
      related: [{ id: 'hodapp', title: 'Hodapp' }, { id: 'oct-normative', title: 'OCT RNFL' }],
      relatedCourses: [{ id: '315.1', title: 'Офтальмология' }],
    };
  },
  reference: 'Ehlers N et al. Applanation tonometry and central corneal thickness. Acta Ophthalmol 1975;53:34. AAO Primary Open-Angle Glaucoma PPP 2020.',
  countries: 'Международный (AAO)',
  presets: [
    { label: 'Норма', values: { iop: 15, cct: 545, discExcav: 0.3, vf: false } },
    { label: 'Офтальмогипертензия', values: { iop: 25, cct: 580, discExcav: 0.4, vf: false } },
    { label: 'ПОУГ', values: { iop: 28, cct: 510, discExcav: 0.7, vf: true } },
    { label: 'Острый приступ', values: { iop: 48, cct: 540, discExcav: 0.5, vf: false } },
  ],
  info: `### Для чего используется
Оценка **внутриглазного давления (ВГД / IOP)** с коррекцией на центральную толщину роговицы (ЦТР) и стратификация риска глаукомы.

### Норма
- ВГД 10-21 мм рт.ст. (Goldmann applanation)
- Средн. 15-16, распределение близкое к нормальному
- Диурнальные колебания до 5 мм рт.ст.

### Коррекция на ЦТР (Ehlers)
**Corrected IOP = measured IOP + 0.7 × (545 − CCT) / 10**
- ЦТР < 545 → измеренное ВГД занижает реальное
- ЦТР > 545 → завышает

### Классификация
| Категория | ВГД | Диск + СПЗ |
|---|---|---|
| Норма | ≤ 21 | Интактны |
| Ocular hypertension | > 21 | Интактны |
| Suspect / НТГ | ≤ 21 | C/D > 0.5 / дефекты СПЗ |
| ПОУГ | > 21 | + дефекты |

### Факторы риска ПОУГ (OHTS)
- ВГД > 21 мм рт.ст.
- ЦТР < 555 мкм
- C/D ≥ 0.5
- Возраст > 60 лет
- Афроамериканцы, семейный анамнез
- Сахарный диабет, миопия высокой степени

### Острый приступ ЗУГ
- ВГД 40-70 мм рт.ст.
- Боль, тошнота, «радужные круги»
- Срочно: ацетазоламид + местные гипотензивные + иридотомия

### Источник
Ehlers 1975. OHTS 2002. AAO PPP 2020.`,
};

export default runner;
