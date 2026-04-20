// @ts-nocheck
/** Runner: bop — Bleeding on Probing (%) */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (AAP/EFP, Ainamo & Bay 1975)',
  reference: 'Ainamo J, Bay I. Problems and proposals for recording gingivitis and plaque. Int Dent J. 1975;25(4):229-35. Lang NP, et al. J Clin Periodontol 1986;13:590 (BoP as predictor).',
  inputs: [
    { id: 'bleeding', label: 'Число сайтов с кровоточивостью', type: 'number', min: 0, max: 192, step: 1 },
    { id: 'total', label: 'Всего обследовано сайтов', type: 'number', min: 1, max: 192, step: 1 },
  ],
  presets: [
    { label: 'Здоровый (BoP 5%)', values: { bleeding: 6, total: 112 } },
    { label: 'Локальный (BoP 20%)', values: { bleeding: 22, total: 112 } },
    { label: 'Генерал. (BoP 50%)', values: { bleeding: 56, total: 112 } },
  ],
  compute: (v) => {
    const b = Number(v.bleeding || 0);
    const t = Math.max(1, Number(v.total || 1));
    const pct = Math.round((b / t) * 1000) / 10;
    let label = 'Стабильный пародонт', color = '#22C55E';
    if (pct > 30) { label = 'Генерализ. воспаление — риск пародонтита'; color = '#B91C1C'; }
    else if (pct >= 10) { label = 'Локальное воспаление'; color = '#F59E0B'; }
    return {
      value: pct.toFixed(1),
      unit: '%',
      color,
      interpretation: `BoP ${pct.toFixed(1)}% — ${label}`,
      details: `**BoP%** = ${b} / ${t} × 100 = **${pct.toFixed(1)}%**\n**Состояние:** ${label}\n\n**Интерпретация (AAP/EFP):**\n- <10% — стабильный пародонт ("gold standard" success)\n- 10-30% — локализованное воспаление\n- >30% — генерализованное воспаление, риск прогрессии`,
      actions: [
        'BoP <10%: поддерживающая терапия 3-6 мес',
        'BoP 10-30%: профгигиена, усиленная мотивация, повторная оценка',
        'BoP >30%: SRP, переоценка плана лечения, проверка гигиены',
        'Отрицательная предиктивная ценность BoP ≈ 98% (Lang 1986)',
      ],
      caveats: [
        'BoP высокочувствителен, но малоспецифичен (курение снижает BoP!)',
        'Давление зондирования 25 г — стандарт, Florida probe точнее',
        'Обычно 6 сайтов/зуб × 28 зубов = 168 сайтов',
        'Значения >30% после терапии = показание к пересмотру',
      ],
      scale: {
        segments: [
          { min: 0, max: 10, label: '<10 Стабил', color: '#22C55E' },
          { min: 10, max: 30, label: '10-30 Локал', color: '#F59E0B' },
          { min: 30, max: 100, label: '>30 Риск', color: '#B91C1C' },
        ],
        value: pct,
      },
      related: [
        { id: 'gingival', title: 'Gingival Index' },
        { id: 'cpi', title: 'CPI' },
        { id: 'aap-efp', title: 'AAP/EFP' },
      ],
      relatedCourses: [
        { id: '313.1', title: 'Стоматология' },
      ],
    };
  },
  info: `### Для чего используется
**Bleeding on Probing (%)** — ключевой индикатор активности воспаления пародонта и успеха пародонтальной терапии.

### Интерпретация
| BoP% | Статус |
|---|---|
| **<10%** | Стабильный пародонт (EFP success criterion) |
| **10-30%** | Локализованное воспаление |
| **>30%** | Генерализованное, высокий риск прогрессии |

### Формула
BoP% = (сайты с кровоточивостью / всего сайтов) × 100

Обычно 6 сайтов/зуб × 28 зубов = 168 сайтов.

### Клиническая ценность
- **Негативная предиктивная ценность** ~98% (Lang NP et al. 1986) — отсутствие BoP надёжно указывает на стабильность
- Позитивная ценность ниже — одиночный BoP+ не всегда = прогрессия
- Курильщики — ложно-низкий BoP (вазоконстрикция)

### Источник
Ainamo J, Bay I. Int Dent J 1975;25(4):229. Lang NP et al. J Clin Periodontol 1986;13:590.`,
};
export default runner;
