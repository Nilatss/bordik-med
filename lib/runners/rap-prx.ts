// @ts-nocheck
/** Runner: rap-prx — PRx/RAP autoregulation index (Czosnyka 1997) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'prx', label: 'PRx (moving correlation MAP/ICP)', type: 'number', unit: '', min: -1, max: 1, step: 0.05, quickValues: [-0.5, -0.2, 0, 0.2, 0.4, 0.6] },
    { id: 'rap', label: 'RAP (correlation AMP/ICP)', type: 'number', unit: '', min: -1, max: 1, step: 0.05, quickValues: [0, 0.3, 0.5, 0.8, 1] },
    { id: 'cpp', label: 'Текущий CPP', type: 'number', unit: 'мм рт.ст.', min: 20, max: 140, step: 1, quickValues: [50, 60, 70, 80, 90] },
  ],
  compute: (v) => {
    const prx = Number(v.prx);
    const rap = Number(v.rap);
    const cpp = Number(v.cpp);

    let status = '', color = '', details = '', prognosis = '';
    const actions: string[] = [];

    if (prx < 0) {
      status = 'Интактная цереброваскулярная авторегуляция';
      color = '#22C55E';
      details = 'PRx <0 — MAP и ICP движутся разнонаправленно, мозговые сосуды адекватно компенсируют колебания перфузии. Ассоциирован с благоприятным исходом (Sorrentino 2012).';
      prognosis = 'Благоприятный прогноз; CPP-opt обычно 65–75.';
      actions.push('Поддерживать текущий CPP', 'Продолжить мультимодальный мониторинг', 'Настроить CPP-opt по кривой PRx/CPP');
    } else if (prx < 0.25) {
      status = 'Пограничная авторегуляция';
      color = '#F59E0B';
      details = 'PRx 0–0.25 — зона неопределённости. Близко к порогу срыва авторегуляции (Sorrentino: PRx ≥0.25 — порог плохого исхода).';
      prognosis = 'Промежуточный прогноз; нужен индивидуальный CPP-opt.';
      actions.push('Рассчитать CPP-opt (U-shaped curve PRx/CPP за 4 ч)', 'Избегать колебаний MAP', 'Оценить глубину седации, PaCO₂, температуру');
    } else {
      status = 'Нарушенная авторегуляция';
      color = '#DC2626';
      details = 'PRx ≥0.25 — MAP и ICP колеблются сонаправленно: мозговые сосуды пассивно следуют за давлением. Ассоциация с высокой летальностью при ЧМТ (Czosnyka 1997, Sorrentino 2012).';
      prognosis = 'Неблагоприятный прогноз; риск вторичного ишемического повреждения.';
      actions.push('Поиск обратимых причин (гипоксия, гиперкапния, лихорадка, судороги)', 'Индивидуальный CPP-opt обязательно', 'Обсудить декомпрессию при рефрактерной ВЧГ', 'Нейропротекция: температура 36, Na 145–150, нормогликемия');
    }

    let rapNote = '';
    if (rap > 0.6) rapNote = 'RAP ≥0.6: комплаентность снижена, приближение к плато P–V кривой.';
    else if (rap < 0) rapNote = 'RAP <0: вероятно декомпенсация, cerebral malignant edema.';
    else rapNote = 'RAP 0–0.6: умеренная компенсация.';

    return {
      value: prx.toFixed(2),
      unit: 'PRx',
      interpretation: status,
      color,
      details: `${details}\n\n${rapNote}\n\n${prognosis}`,
      actions,
      caveats: [
        'PRx — moving Pearson correlation между 30-сек средними MAP и ICP за окно 5 мин',
        'RAP — correlation между амплитудой ICP-пульса и средним ICP (индекс комплаентности)',
        'PRx усредняется минимум за 4 часа для CPP-opt',
        'Аритмии, шум, артефакты могут искажать PRx',
      ],
      related: [
        { id: 'cpp', title: 'Cerebral perfusion pressure' },
        { id: 'lund-rosner', title: 'Lund vs Rosner' },
        { id: 'gcs', title: 'GCS' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Интенсивная терапия' },
        { id: '301.5', title: 'Нейроанестезиология' },
      ],
      scale: {
        segments: [
          { min: -1, max: 0, label: 'Интактна', color: '#22C55E' },
          { min: 0, max: 0.25, label: 'Пограничная', color: '#F59E0B' },
          { min: 0.25, max: 1, label: 'Нарушена', color: '#DC2626' },
        ],
        current: prx,
        unit: 'PRx',
      },
    };
  },
  reference: 'Czosnyka M et al. Neurosurgery 1997; Sorrentino E et al. Neurocrit Care 2012; Aries MJH et al. Crit Care Med 2012 (CPP-opt).',
  countries: 'Международный (Cambridge)',
  presets: [
    { label: 'Интактная, CPP=70', values: { prx: -0.2, rap: 0.4, cpp: 70 } },
    { label: 'Пограничная', values: { prx: 0.15, rap: 0.5, cpp: 65 } },
    { label: 'Сорванная авторегуляция', values: { prx: 0.45, rap: 0.75, cpp: 55 } },
  ],
  caveats: [
    'Требует непрерывной инвазивной ICP + AБЛ с оцифровкой (ICM+ / Sickbay)',
    'Не валидирован у детей младше 2 лет',
  ],
  info: `### Для чего используется
**PRx (Pressure Reactivity Index, Czosnyka 1997)** — мониторный индекс цереброваскулярной авторегуляции. Рассчитывается как скользящая корреляция между MAP и ICP. Позволяет индивидуализировать CPP-opt и прогнозировать исход ЧМТ.

### Интерпретация PRx
| PRx | Авторегуляция | Прогноз |
|---|---|---|
| <0 | Интактна | Благоприятный |
| 0–0.25 | Пограничная | Промежуточный |
| ≥0.25 | Нарушена (Sorrentino 2012 порог) | Неблагоприятный |

### RAP (Compliance index)
Correlation between ICP pulse amplitude (AMP) and mean ICP:
- **RAP ≈ 0** — хорошая компенсация (плоская P–V кривая)
- **RAP → 1** — потеря компенсации (крутая P–V кривая)
- **RAP <0** — декомпенсация, выраженный отёк (malignant edema)

### CPP-opt (Aries 2012)
Построение U-shaped кривой PRx vs CPP за 4 ч: минимум кривой = CPP-opt. Поддержание CPP-opt ±5 ассоциировано с лучшим исходом.

### Практика
1. Инвазивный ICP + непрерывный ABP → ICM+ / Moberg / Sickbay
2. PRx в реальном времени, CPP-opt каждые 4 ч
3. Целевые: CPP в окне ±5 от CPP-opt, PRx <0.25`,
};

export default runner;
