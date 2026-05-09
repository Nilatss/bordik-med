/**
 * Runner: neo-surfactant-dose — Сурфактант (RDS / MAS)
 *
 * NEONATOLOGY MODULE — neo Drug DB foundation.
 *
 * Расчёт дозы сурфактанта для лечения RDS (синдром дыхательных расстройств)
 * и MAS (meconium aspiration syndrome) у новорождённых.
 *
 * Препараты (поршкая практика):
 *   - Poractant alfa (Curosurf, 80 мг/мл): 100-200 мг/кг initial; 100 мг/кг повтор
 *   - Beractant (Survanta, 25 мг/мл): 100 мг/кг (4 мл/кг) initial и повтор
 *   - Calfactant (Infasurf, 35 мг/мл): 105 мг/кг (3 мл/кг) initial и повтор
 *
 * Methods:
 *   - INSURE (INtubate-SURfactant-Extubate)
 *   - LISA (Less Invasive Surfactant Administration) / MIST (Minimally Invasive
 *     Surfactant Therapy) — через тонкий катетер при сохранённом CPAP
 *   - Аэрозольная (исследовательская)
 *
 * Repeat dose criteria:
 *   - Persistent FiO₂ ≥ 30 % через 2-6 ч после первой дозы
 *   - До 3 доз total (по протоколу учреждения)
 *
 * SOURCES:
 *   - European Consensus Guidelines on RDS Management 2022 (Sweet DG et al.
 *     Neonatology 2023;120(1):3)
 *   - AAP Hot Topics in Neonatology 2022
 *   - КР МЗ РФ "Респираторный дистресс синдром" (2024)
 *   - Polin RA, AAP COFN 2014 — Surfactant administration
 *   - Cochrane Reviews: Curosurf vs Survanta (2018)
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (European Consensus 2022 / Sweet et al.) · РФ',
  reference: 'Sweet DG et al. Neonatology 2023;120:3. Polin RA AAP COFN 2014. КР МЗ РФ РДС 2024.',
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
      id: 'product',
      label: 'Препарат',
      type: 'select',
      options: [
        { value: 'curosurf', label: 'Poractant alfa (Curosurf), 80 мг/мл' },
        { value: 'survanta', label: 'Beractant (Survanta), 25 мг/мл' },
        { value: 'infasurf', label: 'Calfactant (Infasurf), 35 мг/мл' },
      ],
    },
    {
      id: 'dose_type',
      label: 'Доза',
      type: 'select',
      options: [
        { value: 'high', label: 'Initial high (Curosurf 200 мг/кг)' },
        { value: 'standard', label: 'Initial standard / повтор (100-105 мг/кг)' },
      ],
    },
    {
      id: 'method',
      label: 'Способ введения',
      type: 'select',
      options: [
        { value: 'insure', label: 'INSURE (intubate-surf-extubate)' },
        { value: 'lisa', label: 'LISA / MIST (тонкий катетер на CPAP)' },
        { value: 'bolus', label: 'Болюс через ETT (если интубирован)' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const product = String(values.product ?? 'curosurf');
    const doseType = String(values.dose_type ?? 'standard');
    const method = String(values.method ?? 'insure');

    if (w <= 0 || w > 5) {
      return {
        value: '—',
        interpretation: 'Введите массу 0.4-5 кг',
        color: '#9CA3AF',
        details: 'Расчёт применим для новорождённых 0.4-5 кг.',
      };
    }

    // Concentration (мг/мл) и доза (мг/кг)
    const products: Record<string, { conc: number; standard: number; high: number; max: number }> = {
      curosurf: { conc: 80, standard: 100, high: 200, max: 200 },
      survanta: { conc: 25, standard: 100, high: 100, max: 100 }, // 4 мл/кг
      infasurf: { conc: 35, standard: 105, high: 105, max: 105 }, // 3 мл/кг
    };
    const p = products[product] ?? products.curosurf;
    if (!p) {
      return {
        value: '—',
        interpretation: 'Неизвестный препарат',
        color: '#9CA3AF',
        details: '',
      };
    }
    const dosePerKg = doseType === 'high' ? p.high : p.standard;
    const totalDose = w * dosePerKg;
    const totalVol = totalDose / p.conc;

    const productName: Record<string, string> = {
      curosurf: 'Curosurf (poractant alfa)',
      survanta: 'Survanta (beractant)',
      infasurf: 'Infasurf (calfactant)',
    };

    const actions: string[] = [];
    actions.push(`Препарат: ${productName[product]}`);
    actions.push(`Доза: ${dosePerKg} мг/кг → ${totalDose.toFixed(0)} мг = ${totalVol.toFixed(2)} мл`);

    if (method === 'lisa') {
      actions.push('LISA/MIST: тонкий катетер 5-6 Fr через голосовые связки на сохранённом CPAP');
      actions.push('Премедикация: атропин 0.01 мг/кг IV (опционально); короткое опиоид-седативное (fentanyl 1-2 мкг/кг) — controversial');
      actions.push('Введение в течение 30-60 сек, малыми болюсами при поворотах');
      actions.push('После: продолжить CPAP, мониторинг SpO₂, при ухудшении — bag-mask, intubate');
    } else if (method === 'insure') {
      actions.push('INSURE: интубация → введение в ETT 1-2 мин → экстубация на CPAP');
      actions.push('Premedicate: morphine/fentanyl + atropine; пред-oxygenation');
      actions.push('Болюс через ETT в 2-4 alikvots при изменении положения');
      actions.push('Экстубация после 5-10 мин если PaCO₂ нормальный, work of breathing OK');
    } else {
      actions.push('Bolus через ETT — стандартная техника при established MV');
      actions.push('2-4 aliquots при изменении положения для homogeneous distribution');
      actions.push('Продолжить MV; pause feeding 30 мин; контроль ETT position');
    }

    actions.push('Pre-treatment: гретая до 37 °C, аккуратное перемешивание (не shaking)');
    actions.push(`Repeat dose criteria: persistent FiO₂ ≥ 30 % через 2-6 ч; до 3 доз total`);
    actions.push('Мониторинг: SpO₂, ЧСС, AAi (lung air entry), КОС после 30-60 мин');

    return {
      value: totalDose.toFixed(0),
      unit: `мг (${totalVol.toFixed(2)} мл)`,
      interpretation: productName[product] + (doseType === 'high' ? ' — initial high dose' : ' — standard'),
      color: '#3B82F6',
      details: `${dosePerKg} мг/кг × ${w} кг = ${totalDose.toFixed(0)} мг = ${totalVol.toFixed(2)} мл @ ${p.conc} мг/мл.`,
      actions,
    };
  },
  caveats: [
    'European Consensus 2022: рекомендует Curosurf 200 мг/кг initial для значительной RDS',
    'Cochrane 2018: Curosurf vs Survanta — небольшое преимущество Curosurf для mortality (RR 0.86)',
    'LISA/MIST: cnижает ИВЛ потребность, BPD; теперь стандарт для GA ≥ 26 нед на CPAP',
    'Премедикация LISA — controversial; некоторые центры используют fentanyl, другие — атропин only, третьи — без премедикации',
    'Beractant (Survanta) — большой объём (4 мл/кг) — желудочно-пищеводный рефлюкс',
    'У MAS — surfactant lavage 15-20 мл/кг (диssolved 1:5 в saline) — не bolus',
    'Repeat dose: persistent FiO₂ ≥ 30 % после 2-6 ч; max 3 доз total',
    'Не использовать в активной фазе шока или critical hypoxemia без stabilization первой',
  ],
  related: [
    { id: 'neo-ett', title: 'Размер ЭТТ' },
    { id: 'neo-resp-indices', title: 'OI / OSI' },
    { id: 'silverman', title: 'Silverman-Anderson' },
    { id: 'neo-resus-doses', title: 'Реанимационные дозы н/р' },
  ],
  info: `### Сурфактант — расчёт дозы

Расчёт дозы сурфактанта для лечения RDS (preterm) и MAS (meconium
aspiration syndrome) у новорождённых.

### Препараты

| Препарат | Концентрация | Initial doza | Повтор |
|---|---|---|---|
| **Curosurf** (poractant alfa) | 80 мг/мл | 100-200 мг/кг | 100 мг/кг |
| **Survanta** (beractant) | 25 мг/мл | 100 мг/кг (4 мл/кг) | 100 мг/кг |
| **Infasurf** (calfactant) | 35 мг/мл | 105 мг/кг (3 мл/кг) | 105 мг/кг |

### Способы введения

| Метод | Принцип | Применение |
|---|---|---|
| **LISA / MIST** | Тонкий катетер на CPAP | GA ≥ 26 нед, на CPAP, RDS |
| **INSURE** | Intubate → surf → extubate | Stable, ожидаемая экстубация |
| **Bolus через ETT** | Прямое введение | Уже на MV |
| **Aerosolized** | Ультразвук → AeroFact | Исследовательский (Sweet 2022) |

### Repeat dose criteria

- **Persistent FiO₂ ≥ 30 %** через 2-6 ч после первой дозы
- **Persistent MV need** или **rising FiO₂**
- **До 3 доз total** (per учреждение)

### European Consensus 2022 (Sweet et al.)

- **First dose ASAP** при clinical signs RDS
- **Curosurf 200 мг/кг** (high dose) для significant RDS — мета-анализ Cochrane
- **LISA preferred** для GA ≥ 26 нед на CPAP (снижает MV duration, BPD)
- **Меньше доз** = меньше ВЖК, меньше PDA

### Premedication для LISA

- **Атропин 0.01 мг/кг IV** — снижает bradycardia (опционально)
- **Опиоид:** fentanyl 1-2 мкг/кг (controversial — risk apnea на CPAP)
- **Без седации** в некоторых центрах (Sweet 2022 — выбор центра)

### MAS (meconium aspiration)

- **Lavage:** 15-20 мл/кг diluted 1:5 в saline (slow infusion)
- **Не bolus** — может ухудшить mechanics
- **Surfactant** + iNO часто используется при PPHN

### Источники

- Sweet DG et al. European Consensus 2022 (Neonatology 2023;120:3)
- Polin RA, AAP COFN 2014 — Surfactant administration
- Cochrane Reviews: Curosurf vs Survanta (2018)
- КР МЗ РФ "Респираторный дистресс синдром" (2024)
`,
};

export default runner;
