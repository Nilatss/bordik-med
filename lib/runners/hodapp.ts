// @ts-nocheck
/** Runner: hodapp - Hodapp-Parrish-Anderson glaucoma VF severity */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'md', label: 'MD (Mean Deviation, дБ)', type: 'number', min: -35, max: 5, step: 0.5, quickValues: [-1, -4, -10, -18] },
    { id: 'pointsBelow5', label: 'Точек с p<5% в общем графе (PD)', type: 'number', min: 0, max: 74, step: 1, quickValues: [5, 15, 30, 50] },
    { id: 'pointsBelow1', label: 'Точек с p<1% в общем графе', type: 'number', min: 0, max: 74, step: 1, quickValues: [2, 10, 20, 40] },
    { id: 'within5deg', label: 'Дефект в пределах 5° от фиксации', type: 'select', options: [{ value: 'none', label: 'Нет' }, { value: 'any', label: 'Есть <15 дБ' }, { value: 'severe', label: 'Есть 0 дБ (абсолют.)' }] },
  ],
  compute: (v) => {
    const md = Number(v.md) || 0;
    const p5 = Number(v.pointsBelow5) || 0;
    const p1 = Number(v.pointsBelow1) || 0;
    const fix = String(v.within5deg || 'none');

    let band = '', color = '#22C55E', details = '';
    // Advanced: MD < -12 OR point <0 dB within 5° OR ≥50% points <1%
    const isAdvanced = md < -12 || fix === 'severe' || p1 >= 37;
    // Moderate: MD -6 to -12 OR 19-36 points p<1% OR p5 ≥ 37 OR defect <15 dB within 5°
    const isModerate = (md >= -12 && md < -6) || (p1 >= 19 && p1 < 37) || (fix === 'any') || (p5 >= 37 && p5 < 74);
    // Early: MD ≥ -6, < 18 points p<5%, < 10 points p<1%, no point within 5° <15 dB
    const isEarly = md >= -6 && p5 < 18 && p1 < 10 && fix === 'none';

    if (isAdvanced) {
      band = 'Продвинутая (advanced)';
      color = '#EF4444';
      details = `MD ${md.toFixed(1)} дБ, p<1% = ${p1} точек, фиксация ${fix}. Hodapp advanced stage — риск потери зрения.`;
    } else if (isModerate) {
      band = 'Умеренная (moderate)';
      color = '#F59E0B';
      details = `MD ${md.toFixed(1)} дБ, p<1% = ${p1}. Hodapp moderate — дефекты, требующие активной терапии.`;
    } else if (isEarly) {
      band = 'Ранняя (early)';
      color = '#84CC16';
      details = `MD ${md.toFixed(1)} дБ, p<5% = ${p5}. Hodapp early — первые глаукомные изменения.`;
    } else {
      band = 'Неклассифицируемая';
      color = '#F59E0B';
      details = `Сочетание параметров не укладывается строго в стадии — пограничное состояние, нужна интерпретация специалиста.`;
    }

    return {
      value: isAdvanced ? 'Advanced' : isModerate ? 'Moderate' : isEarly ? 'Early' : 'Borderline',
      unit: 'stage',
      interpretation: band,
      color,
      details,
      actions: [
        'Цель ВГД: early −20-25%, moderate −30%, advanced −40% от базового',
        isAdvanced ? 'Рассмотреть фильтрующую хирургию (трабекулэктомия, дренаж Ahmed) или SLT' : '',
        isModerate ? 'Комбинированная гипотензивная терапия, SLT при неэффективности' : '',
        isEarly ? 'Монотерапия (простагландин) 1-я линия, SLT альтернатива' : '',
        'Периметрия SAP 24-2 / 10-2 (advanced) каждые 6-12 мес',
        'OCT RNFL — параллельная структурная оценка',
        'Обучение приверженности — главная причина прогрессии',
      ].filter(Boolean),
      caveats: [
        'Оригинал Hodapp-Parrish-Anderson 1993 основан на Humphrey 30-2',
        'Альтернативы: Brusini GSS, AGIS score, Enhanced Glaucoma Staging System',
        'Reliability indices обязательны: FP<15%, FN<33%, fixation losses<20%',
        '10-2 обязательна при advanced (5° около фиксации) — 24-2 недооценивает',
        'MD влияют катаракта, миоз, утомление — учитывать глобальные факторы',
        'Стадия по худшему глазу, но ведение индивидуальное',
      ],
      related: [{ id: 'iop', title: 'IOP' }, { id: 'oct-normative', title: 'OCT RNFL' }],
      relatedCourses: [{ id: '315.1', title: 'Офтальмология' }],
    };
  },
  reference: 'Hodapp E, Parrish RK II, Anderson DR. Clinical Decisions in Glaucoma. Mosby 1993. AAO POAG PPP 2020.',
  countries: 'Международный (AAO)',
  presets: [
    { label: 'Early (MD -3)', values: { md: -3, pointsBelow5: 10, pointsBelow1: 4, within5deg: 'none' } },
    { label: 'Moderate (MD -8)', values: { md: -8, pointsBelow5: 30, pointsBelow1: 20, within5deg: 'any' } },
    { label: 'Advanced (MD -18)', values: { md: -18, pointsBelow5: 60, pointsBelow1: 45, within5deg: 'severe' } },
  ],
  info: `### Для чего используется
**Hodapp-Parrish-Anderson (HPA, 1993)** — стандартная классификация тяжести **глаукомного повреждения поля зрения** по данным Humphrey SAP 24-2/30-2.

### Критерии

**Early (ранняя)** — все должны выполняться:
- MD ≥ −6 дБ
- < 18 точек с p < 5% на общем графе
- < 10 точек с p < 1%
- Нет точек в пределах 5° от фиксации с чувствительностью < 15 дБ

**Moderate (умеренная)** — любое:
- MD −6 до −12 дБ
- 19-36 точек p < 1%
- Дефект < 15 дБ в пределах 5° от фиксации (1 гемиполе)

**Advanced (продвинутая)** — любое:
- MD < −12 дБ
- ≥ 37 точек p < 1% (≥ 50% поля)
- Точка с чувствительностью 0 дБ в пределах 5°
- Дефект < 15 дБ в обоих гемиполях в пределах 5°

### Применение
- Целевое ВГД зависит от стадии (early −20%, advanced −40%)
- Выбор хирургии / SLT vs капли
- Мониторинг прогрессии (GPA, VFI)

### Альтернативы
- **AGIS** — 0-20 баллов (clinical trials)
- **GSS Brusini** — 2D (MD × PSD)
- **Enhanced GSS** — включает структуру OCT

### Источник
Hodapp, Parrish, Anderson. Clinical Decisions in Glaucoma. Mosby 1993.`,
};

export default runner;
