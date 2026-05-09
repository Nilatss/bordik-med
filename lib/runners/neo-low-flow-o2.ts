/**
 * Runner: neo-low-flow-o2 — Low-flow O₂ → Effective FiO₂
 *
 * NEONATOLOGY MODULE A43 (P3).
 *
 * Расчёт effective FiO₂ при low-flow nasal cannula (NC) у новорождённого.
 * Используется для оценки кислородной поддержки в условиях NICU,
 * step-down, или при transition from CPAP/MV к NC.
 *
 * Формула (упрощённая Finer et al. 1996):
 *   Effective FiO₂ ≈ 0.21 + (flow_LPM × FiO₂_source × 4 / weight_kg) / 100
 *
 * Эмпирически у н/р (Vain 1996; Finer 1996):
 *   Term newborn (3 кг):
 *     0.25 LPM @ 100% O₂ → ~28%
 *     0.5 LPM → ~30%
 *     1 LPM → ~35%
 *     2 LPM → ~50%
 *
 *   Preterm (1 кг):
 *     0.25 LPM @ 100% → ~50%
 *     0.5 LPM → ~70%
 *
 * SOURCES:
 *   - Finer NN et al. J Pediatr 1996;129(2):274 — оригинальная формула
 *   - Vain NE et al. J Pediatr 1996 — clinical validation
 *   - Walsh BK et al. Respir Care 2005 — pediatric NC
 *   - NICUtools — Effective FiO₂
 *   - КР МЗ РФ "Кислородная терапия у н/р" (2024)
 *
 * Saturation targets (preterm):
 *   - 90-95% (BOOST-II/SUPPORT/COT trials consensus)
 *   - Lower target (85-89%) — ↑ mortality + NEC (NeOProM meta-analysis)
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (Finer 1996 / NICUtools) · РФ',
  reference: 'Finer NN J Pediatr 1996;129:274. Vain NE J Pediatr 1996. NICUtools.',
  inputs: [
    {
      id: 'weight',
      label: 'Масса (кг)',
      type: 'number',
      min: 0.4,
      max: 5,
      step: 0.01,
    },
    {
      id: 'flow_lpm',
      label: 'Поток через nasal cannula (л/мин)',
      type: 'number',
      min: 0.025,
      max: 4,
      step: 0.025,
    },
    {
      id: 'source_fio2',
      label: 'Источник FiO₂ (% — обычно 21-100)',
      type: 'number',
      min: 21,
      max: 100,
      step: 1,
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const flow = Number(values.flow_lpm ?? 0);
    const sourceFio2 = Number(values.source_fio2 ?? 100);

    if (w <= 0 || w > 5) {
      return { value: '—', interpretation: 'Введите массу 0.4-5 кг', color: '#9CA3AF', details: '' };
    }
    if (flow <= 0 || flow > 4) {
      return { value: '—', interpretation: 'Введите поток 0.025-4 л/мин', color: '#9CA3AF', details: '' };
    }
    if (sourceFio2 < 21 || sourceFio2 > 100) {
      return { value: '—', interpretation: 'Введите FiO₂ 21-100 %', color: '#9CA3AF', details: '' };
    }

    // Finer 1996 simplified formula
    // VE (Minute ventilation) ≈ 200 мл/кг/мин у н/р
    // Effective FiO₂ ≈ (Flow × Source_FiO₂ + (VE - Flow) × 0.21) / VE
    const VE_ml_per_min = 200 * w; // эмпирический VE
    const flow_ml_per_min = flow * 1000;

    let effectiveFio2: number;
    if (flow_ml_per_min >= VE_ml_per_min) {
      // Если flow > VE, делает full source FiO₂
      effectiveFio2 = sourceFio2;
    } else {
      effectiveFio2 = (flow_ml_per_min * sourceFio2 + (VE_ml_per_min - flow_ml_per_min) * 21) / VE_ml_per_min;
    }
    // Clamp
    effectiveFio2 = Math.max(21, Math.min(100, effectiveFio2));

    let band = '';
    let color = '#22C55E';
    const actions: string[] = [];

    if (effectiveFio2 < 25) {
      band = 'Low support';
      color = '#22C55E';
      actions.push('Низкая кислородная поддержка');
      actions.push('Wean to room air если SpO₂ ≥ 95 % stable');
    } else if (effectiveFio2 < 35) {
      band = 'Moderate support';
      color = '#84CC16';
      actions.push('Умеренная поддержка');
      actions.push('Продолжить мониторинг SpO₂');
      actions.push('Wean к minimum effective level');
    } else if (effectiveFio2 < 50) {
      band = 'Significant support';
      color = '#F59E0B';
      actions.push('Значительная support — рассмотреть HFNC, CPAP или MV');
      actions.push('Если на NC > 1 LPM требуется — switch на HFNC (Vapotherm/Optiflow) preferable');
      actions.push('Effective FiO₂ ≥ 30 % persistent — оценить причину (RDS progression, sepsis, CHD)');
    } else {
      band = 'High — escalate';
      color = '#EF4444';
      actions.push('Очень высокая FiO₂ через NC — НЕ оптимально');
      actions.push('Escalate к: HFNC (если ≤ 6 LPM), CPAP, или MV');
      actions.push('Echo для исключения PPHN, CHD');
      actions.push('Газы крови, X-ray; рассмотреть surfactant (если RDS)');
    }

    actions.push('--- SpO₂ targets (preterm) ---');
    actions.push('90-95 % — стандарт для preterm < 35 нед');
    actions.push('Lower (85-89 %) — снижает ROP но повышает NEC + mortality (NeOProM)');
    actions.push('Term: > 95 %');

    actions.push('--- Wean ---');
    actions.push('↓ flow 0.025-0.05 LPM q4-12h по SpO₂');
    actions.push('Trial off O₂ когда minimum flow + SpO₂ stable > 95 %');
    actions.push('Re-evaluate в 1 нед если cannot wean');

    return {
      value: effectiveFio2.toFixed(0),
      unit: '%',
      interpretation: `Effective FiO₂ ≈ ${effectiveFio2.toFixed(0)} % (${band})`,
      color,
      details: `${flow} LPM @ ${sourceFio2} % source × ${w} кг → effective FiO₂ ≈ ${effectiveFio2.toFixed(0)} %.`,
      actions,
    };
  },
  caveats: [
    'Approximation only — actual FiO₂ depends на RR, depth, pattern of breathing, congestion',
    'У ELBW < 1000 г: даже small flow → high FiO₂; risk hyperoxia + ROP',
    'NC > 1 LPM у preterm — switch на HFNC (Vapotherm) preferred (warming, humidification)',
    'HFNC delivers more accurate FiO₂ at higher flows (2-8 LPM)',
    'Hyperoxia у preterm: ROP, BPD, oxidative stress — wean ASAP',
    'Hypoxia у term/late preterm: PPHN risk, brain injury — adequate support',
    'NeOProM 2018 meta-analysis: SpO₂ 91-95 % vs 85-89 % — higher target снижает mortality + NEC',
    'Saturation monitoring continuous — pulse ox accuracy низкая при low pulse signal',
    'Не использовать у н/р с anatomy obstruction (choanal atresia, micrognathia) — alternative airway',
  ],
  related: [
    { id: 'neo-resp-indices', title: 'OI / OSI' },
    { id: 'neo-rds-class', title: 'RDS classification' },
    { id: 'neo-bpd-nih', title: 'BPD severity' },
    { id: 'neo-surfactant-dose', title: 'Сурфактант' },
  ],
  info: `### Low-flow O₂ → Effective FiO₂

Расчёт effective FiO₂ при low-flow nasal cannula у новорождённого.

### Формула (Finer 1996)

\`\`\`
Effective FiO₂ ≈ (Flow × Source + (VE − Flow) × 0.21) / VE
\`\`\`

Где VE (минутная вентиляция) ≈ 200 мл/кг/мин у н/р.

### Эмпирические значения

#### Term newborn (3 кг)
| Flow LPM | Source 100% | Source 50% |
|---|---|---|
| 0.25 | ~28 % | ~24 % |
| 0.5 | ~30 % | ~26 % |
| 1 | ~35 % | ~28 % |
| 2 | ~50 % | ~36 % |

#### Preterm (1 кг)
| Flow LPM | Source 100% |
|---|---|
| 0.025 (25 мл/мин) | ~22 % |
| 0.1 | ~30 % |
| 0.25 | ~50 % |
| 0.5 | ~70 % |

### Bands и tactic

| Effective FiO₂ | Severity | Tactic |
|---|---|---|
| < 25 % | Low | Wean ASAP |
| 25-35 % | Moderate | Continue, monitor |
| 35-50 % | Significant | Switch to HFNC/CPAP |
| > 50 % | High | Escalate (CPAP, MV) |

### SpO₂ targets

| Группа | Target |
|---|---|
| Term | > 95 % |
| Late preterm | 90-95 % |
| Preterm < 35 нед | 90-95 % |
| Lower (85-89 %) | ↑ mortality + NEC (NeOProM 2018) |

### Когда escalate

| Trigger | Escalation |
|---|---|
| NC > 1 LPM @ FiO₂ > 30 % | HFNC (Vapotherm 2-8 LPM) |
| HFNC FiO₂ > 50 % | CPAP |
| CPAP FiO₂ > 50 % | MV |
| MV OI ≥ 25 | Consider iNO, HFOV |

### Caveats

- Approximation only — depends на RR, depth, pattern
- Hyperoxia у preterm: ROP, BPD risk → wean ASAP
- Pulse ox accuracy низкая при low pulse signal
- Не использовать у airway anomalies (choanal atresia)

### Источники

- Finer NN et al. J Pediatr 1996;129:274
- Vain NE et al. J Pediatr 1996
- Walsh BK et al. Respir Care 2005
- NeOProM meta-analysis 2018
- NICUtools
`,
};

export default runner;
