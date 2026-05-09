/**
 * Runner: neo-milrinone-dose — Милринон (PDE3 inhibitor для PPHN)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * Inotrope-vasodilator (inodilator). Phosphodiesterase 3 inhibitor.
 * Increases contractility и снижает SVR / PVR одновременно.
 *
 * Показания:
 *   - Pulmonary hypertension с RV dysfunction (PPHN)
 *   - Cardiogenic shock с poor contractility (post-cardiac surgery)
 *   - Low cardiac output syndrome после CPB
 *   - Refractory shock с PVR ↑ (где dopamine противопоказан)
 *
 * Дозы:
 *   Loading (controversial — может вызвать systemic hypotension):
 *     50 мкг/кг IV за 30-60 мин (некоторые omit loading у н/р)
 *
 *   Maintenance:
 *     0.25-0.75 мкг/кг/мин IV continuous
 *     Start: 0.33 мкг/кг/мин (стандарт)
 *     Range: 0.25-1 мкг/кг/мин
 *
 *   Renal dosing: ↓ доза при ↓ клиренсе креатинина
 *
 * Therapeutic plasma level: 100-300 нг/мл
 *
 * SOURCES:
 *   - McNamara PJ et al. — milrinone в PPHN trial
 *   - Khanna A et al. CHEST 2017 — milrinone meta-analysis
 *   - Bassler D et al. — neonatal cardiac surgery PROCESS
 *   - NeoFax / Neonatal Formulary 9 ed (Ainsworth)
 *   - КР МЗ РФ "ППН" (2024)
 *   - AHA 2019 PPHN scientific statement
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (AHA 2019 / NeoFax) · РФ',
  reference: 'McNamara PJ. Khanna CHEST 2017. NeoFax. AHA 2019 PPHN. КР МЗ РФ ППН.',
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
      id: 'phase',
      label: 'Phase',
      type: 'select',
      options: [
        { value: 'load', label: 'Loading 50 мкг/кг IV за 30-60 мин (controversial у н/р)' },
        { value: 'load_low', label: 'Loading low 25 мкг/кг (safer)' },
        { value: 'maint_low', label: 'Maintenance 0.25 мкг/кг/мин (start)' },
        { value: 'maint_med', label: 'Maintenance 0.33 мкг/кг/мин (стандарт)' },
        { value: 'maint_med_high', label: 'Maintenance 0.5 мкг/кг/мин' },
        { value: 'maint_high', label: 'Maintenance 0.75 мкг/кг/мин (max common)' },
        { value: 'maint_max', label: 'Maintenance 1.0 мкг/кг/мин (max)' },
      ],
    },
    {
      id: 'concentration',
      label: 'Концентрация',
      type: 'select',
      options: [
        { value: '100', label: '100 мкг/мл (стандарт: 5 мг + 50 мл D5W)' },
        { value: '200', label: '200 мкг/мл (concentrated central)' },
        { value: '50', label: '50 мкг/мл (peripheral, large volume)' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const phase = String(values.phase ?? 'maint_med');
    const conc = Number(values.concentration ?? 100);

    if (w <= 0 || w > 5) {
      return { value: '—', interpretation: 'Введите массу 0.4-5 кг', color: '#9CA3AF', details: '' };
    }

    type MilrPhase = { dose: number; isLoad: boolean; label: string };
    const phases: Record<string, MilrPhase> = {
      load: { dose: 50, isLoad: true, label: 'Loading standard' },
      load_low: { dose: 25, isLoad: true, label: 'Loading low' },
      maint_low: { dose: 0.25, isLoad: false, label: 'Maintenance low (start)' },
      maint_med: { dose: 0.33, isLoad: false, label: 'Maintenance standard' },
      maint_med_high: { dose: 0.5, isLoad: false, label: 'Maintenance med-high' },
      maint_high: { dose: 0.75, isLoad: false, label: 'Maintenance high' },
      maint_max: { dose: 1.0, isLoad: false, label: 'Maintenance max' },
    };
    const p = phases[phase] ?? phases.maint_med;
    if (!p) {
      return { value: '—', interpretation: 'Неизвестная phase', color: '#9CA3AF', details: '' };
    }

    if (p.isLoad) {
      const total = w * p.dose;
      const vol = total / conc;
      const actions: string[] = [];
      actions.push(`Loading: ${total.toFixed(1)} мкг = ${vol.toFixed(2)} мл @ ${conc} мкг/мл`);
      actions.push(`Доза: ${p.dose} мкг/кг IV за 30-60 мин`);
      actions.push('⚠️ Loading у н/р controversial — может вызвать systemic hypotension');
      actions.push('Альтернатива: omit loading, start maintenance 0.33 мкг/кг/мин');
      actions.push('Volume bolus pre-loading (NS 10 мл/кг) — снижает hypotension risk');
      actions.push('После loading: start maintenance 0.33-0.5 мкг/кг/мин');
      actions.push('Onset action: 5-15 мин (без loading); peak 1-2 ч');

      return {
        value: total.toFixed(1),
        unit: `мкг (${vol.toFixed(2)} мл)`,
        interpretation: p.label,
        color: '#F59E0B',
        details: `${p.dose} мкг/кг × ${w} кг = ${total.toFixed(1)} мкг loading IV за 30-60 мин.`,
        actions,
      };
    } else {
      // continuous infusion
      const microPerMin = p.dose * w;
      const microPerHour = microPerMin * 60;
      const mlPerHour = microPerHour / conc;

      const actions: string[] = [];
      actions.push(`Милринон: ${microPerMin.toFixed(3)} мкг/мин = ${microPerHour.toFixed(1)} мкг/ч`);
      actions.push(`Скорость инфузии: ${mlPerHour.toFixed(2)} мл/ч @ ${conc} мкг/мл`);
      actions.push(`Доза: ${p.dose} мкг/кг/мин continuous`);

      actions.push('--- Подготовка ---');
      if (conc === 100) {
        actions.push('Стандарт: 5 мг + 50 мл D5W = 100 мкг/мл (или 1 мг + 9 мл D5W = 100 мкг/мл)');
      } else if (conc === 200) {
        actions.push('Concentrated: 5 мг + 25 мл = 200 мкг/мл (central line)');
      } else {
        actions.push('Diluted: 5 мг + 100 мл = 50 мкг/мл (peripheral)');
      }
      actions.push('Stable 72 ч при 25 °C; D5W или 0.9 % NaCl');
      actions.push('Доступ: central preferred (UVC); peripheral OK для start');

      actions.push('--- Titration ---');
      actions.push('Start: 0.25-0.33 мкг/кг/мин (без loading у н/р)');
      actions.push('↑ 0.1 мкг/кг/мин q30-60 мин до response');
      actions.push('Markers: ↑ contractility (echo), ↓ PVR (saturation gradient ↓), urine output ↑');
      actions.push('Max common: 0.75 мкг/кг/мин; absolute max: 1 мкг/кг/мин');
      actions.push('Combination с iNO для PPHN — synergy (Khanna 2017)');

      actions.push('--- Мониторинг ---');
      actions.push('Continuous: ЧСС, АД (invasive), SpO₂ pre/post-ductal, ECG');
      actions.push('Echocardiography q24h: contractility, PVR, RV function');
      actions.push('Cr / urea q12-24h (renal-dependent clearance)');
      actions.push('Plasma level если доступно: 100-300 нг/мл');

      actions.push('--- Side effects ---');
      actions.push('Hypotension (systemic vasodilation) — major concern, особенно loading');
      actions.push('Тахикардия (chronotropic effect)');
      actions.push('Аритмии (rare у н/р, common у adult heart failure)');
      actions.push('Тромбоцитопения (после 7-14 дней usage)');
      actions.push('Hepatic enzyme elevation (rare)');

      actions.push('--- Wean ---');
      actions.push('↓ 0.05 мкг/кг/мин q4-6h когда стабилен');
      actions.push('Continued benefit: длинный t½ (90-120 мин у н/р)');

      return {
        value: microPerMin.toFixed(3),
        unit: `мкг/мин (${mlPerHour.toFixed(2)} мл/ч)`,
        interpretation: p.label,
        color: '#3B82F6',
        details: `${p.dose} мкг/кг/мин × ${w} кг = ${microPerMin.toFixed(3)} мкг/мин = ${microPerHour.toFixed(1)} мкг/ч @ ${conc} мкг/мл → ${mlPerHour.toFixed(2)} мл/ч.`,
        actions,
      };
    }
  },
  caveats: [
    'Loading у н/р controversial: hypotension risk значительная; many neoнат clinicians omit loading',
    'Volume bolus (NS 10 мл/кг) до loading снижает hypotension risk',
    'PPHN: combination milrinone + iNO — synergy (Khanna 2017 meta-analysis), но quality of evidence moderate',
    'Renal-dependent clearance: ↓ доза при ↓ Cr clearance — t½ значительно удлинён',
    'Низкая dosing у preterm < 28 нед — start 0.2 мкг/кг/мин; longer t½',
    'Сочетание с dopamine может усиливать тахикардию — caution',
    'НЕСОВМЕСТИМО (in-line): furosemide, lasix (precipitates) — separate lumens',
    'Тромбоцитопения после > 7 дней usage у adults; rare у н/р short-term',
    'Long t½ (60-90 мин у adult, 90-120 мин у н/р): эффект сохраняется после wean',
    'НЕ inotrope для acute resuscitation — выбор epinephrine bolus',
  ],
  related: [
    { id: 'neo-resp-indices', title: 'OI / OSI' },
    { id: 'neo-pge1-dose', title: 'PGE1 (duct-dep CHD)' },
    { id: 'neo-dopamine-dose', title: 'Допамин н/р' },
    { id: 'neo-epinephrine-infusion', title: 'Адреналин continuous' },
  ],
  info: `### Милринон у новорождённых

Phosphodiesterase 3 inhibitor — inodilator (inotrope + vasodilator).
↑ Contractility + ↓ SVR / PVR одновременно. Идеален для PPHN с RV
dysfunction.

### Дозы

#### Loading (controversial у н/р)
| Type | Доза | Note |
|---|---|---|
| Standard | 50 мкг/кг IV за 30-60 мин | Hypotension risk |
| Low (safer) | 25 мкг/кг IV за 60 мин | Preferred у н/р |
| Omit | start maintenance | Common practice neoнат |

#### Maintenance continuous
| Уровень | Доза |
|---|---|
| Low (start) | 0.25 мкг/кг/мин |
| **Standard** | **0.33 мкг/кг/мин** |
| Med-high | 0.5 мкг/кг/мин |
| High | 0.75 мкг/кг/мин |
| Max | 1.0 мкг/кг/мин |

### Подготовка

| Conc | Recipe |
|---|---|
| 50 мкг/мл | 5 мг + 100 мл D5W (peripheral) |
| **100 мкг/мл** | **5 мг + 50 мл D5W** (стандарт) |
| 200 мкг/мл | 5 мг + 25 мл D5W (central) |

Stable 72 ч; D5W или NS.

### PPHN treatment algorithm

1. **iNO** 20 ppm trial (response: OI ↓ 15 % или PaO₂ ↑ 20 мм рт ст за 30 мин)
2. **Если ↑ PVR + ↓ contractility:** add milrinone 0.33 мкг/кг/мин
3. **Если ↓ contractility dominant:** add dobutamine 5-15 мкг/кг/мин
4. **Если refractory:** epinephrine 0.05-0.5 мкг/кг/мин
5. **Если no response:** ECMO consult (OI ≥ 40 sustained)

### Когда выбирать милринон

| Situation | Choice |
|---|---|
| **PPHN + RV failure** | Milrinone + iNO |
| **Post-cardiac surgery LCO** | Milrinone first-line |
| **Cardiogenic shock + ↑ SVR** | Milrinone (afterload ↓) |
| **Septic shock** | Norepi/dopamine first; milrinone adjunct |
| **PDA-related shock** | Avoid (vasodilation worsens shunt) |

### vs Other inodilators

| | Milrinone | Dobutamine | Levosimendan |
|---|---|---|---|
| **Mechanism** | PDE3 inhib | β1 agonist | Ca-sensitizer |
| **Contractility** | ↑ | ↑↑ | ↑ |
| **SVR** | ↓ | ↓ (mild) | ↓ |
| **PVR** | ↓ | neutral | ↓ |
| **t½** | 60-90 мин (adult) | 2 мин | 1 ч (active 70-80 ч) |
| **Renal clearance** | yes | no | partial |
| **Cost** | medium | low | high |

### Side effects

| Effect | Frequency | Management |
|---|---|---|
| Hypotension | major (systemic) | Volume, vasopressors |
| Тахикардия | common | Rate control, slow titration |
| Aритмии | rare у н/р | Monitoring ECG |
| Тромбоцитопения | > 7 d usage | Discontinue if < 50 |
| Hepatotoxicity | rare | LFT mon |

### Источники

- McNamara PJ et al. — PPHN trial
- Khanna A et al. CHEST 2017 — meta-analysis
- AHA 2019 PPHN scientific statement
- Bassler D et al. — PROCESS trial post-cardiac surgery
- NeoFax / Neonatal Formulary 9 ed (Ainsworth)
- КР МЗ РФ "Персистирующая лёгочная гипертензия" (2024)
`,
};

export default runner;
