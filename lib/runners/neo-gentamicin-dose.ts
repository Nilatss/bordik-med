/**
 * Runner: neo-gentamicin-dose — Гентамицин (н/р)
 *
 * NEONATOLOGY MODULE — Drug DB foundation.
 *
 * Расчёт дозы гентамицина для эмпирической терапии раннего/позднего
 * неонатального сепсиса. Стандарт пары с ампициллином (covers GBS,
 * gram-negative).
 *
 * Aminoglycoside — extended-interval dosing (EID) предпочтительно у н/р.
 *
 * SOURCES:
 *   - AAP Red Book (2021-2024)
 *   - NeoFax / Neonatal Formulary 9 ed (Ainsworth, Oxford)
 *   - BNF for Children
 *   - КР МЗ РФ "Бактериальный сепсис н/р" (2024)
 *   - Cochrane One vs Multiple aminoglycoside dosing 2011
 *
 * Дозы (extended-interval):
 *
 *   PMA ≤ 29 нед, PNA 0-7 дн:    5 мг/кг q48h
 *   PMA ≤ 29 нед, PNA 8-28 дн:   4 мг/кг q36h
 *   PMA ≤ 29 нед, PNA > 28 дн:   4 мг/кг q24h
 *   PMA 30-34 нед, PNA 0-7 дн:   4.5 мг/кг q36h
 *   PMA 30-34 нед, PNA > 7 дн:   4 мг/кг q24h
 *   PMA ≥ 35 нед, PNA 0-7 дн:    4 мг/кг q24h
 *   PMA ≥ 35 нед, PNA > 7 дн:    5 мг/кг q24h
 *
 * Therapeutic monitoring:
 *   Trough (через 30 мин до next dose): < 1.0 мг/л
 *   Peak (через 30 мин после end of infusion): 5-12 мг/л (CFR 8-10)
 *
 * Toxicity:
 *   Nephrotoxicity (если trough > 2 мг/л sustained)
 *   Ototoxicity (irreversible) — мониторинг ABR
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (AAP Red Book / NeoFax / BNFc) · РФ',
  reference: 'AAP Red Book 2021-2024. NeoFax. КР МЗ РФ "Бактериальный сепсис н/р" 2024.',
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
      id: 'pma',
      label: 'PMA (постменструальный возраст, нед)',
      type: 'select',
      options: [
        { value: '28', label: '≤ 29 нед (extreme/very preterm)' },
        { value: '32', label: '30-34 нед (преэрм)' },
        { value: '40', label: '≥ 35 нед (late preterm / термин)' },
      ],
    },
    {
      id: 'pna',
      label: 'PNA (постнатальный возраст)',
      type: 'select',
      options: [
        { value: '5', label: '0-7 дней' },
        { value: '15', label: '8-28 дней' },
        { value: '40', label: '> 28 дней' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const pma = Number(values.pma ?? 40);
    const pna = Number(values.pna ?? 5);

    if (w <= 0 || w > 5) {
      return {
        value: '—',
        interpretation: 'Введите массу 0.4-5 кг',
        color: '#9CA3AF',
        details: '',
      };
    }

    // Dosing matrix (extended-interval)
    let dosePerKg = 4;
    let interval = 'q24h';

    if (pma <= 29) {
      if (pna <= 7) {
        dosePerKg = 5;
        interval = 'q48h';
      } else if (pna <= 28) {
        dosePerKg = 4;
        interval = 'q36h';
      } else {
        dosePerKg = 4;
        interval = 'q24h';
      }
    } else if (pma <= 34) {
      if (pna <= 7) {
        dosePerKg = 4.5;
        interval = 'q36h';
      } else {
        dosePerKg = 4;
        interval = 'q24h';
      }
    } else {
      // PMA >= 35
      if (pna <= 7) {
        dosePerKg = 4;
        interval = 'q24h';
      } else {
        dosePerKg = 5;
        interval = 'q24h';
      }
    }

    const total = w * dosePerKg;
    const conc = 10; // мг/мл (стандартная concentration после dilution)
    const vol = total / conc;

    const actions: string[] = [];
    actions.push(`Гентамицин: ${total.toFixed(1)} мг = ${vol.toFixed(2)} мл @ 10 мг/мл`);
    actions.push(`Доза: ${dosePerKg} мг/кг ${interval}`);
    actions.push('Путь: IV slow infusion 30 мин (никогда не push)');
    actions.push('Совместимость: 0.9 % NaCl, 5 % glucose');
    actions.push('НЕСОВМЕСТИМО (in-line): ампициллин, цефалоспорины, heparin (separate lumens)');
    actions.push('При совместном введении с ампициллином: разные line / flush 0.9 % NaCl');

    actions.push('--- Therapeutic Drug Monitoring ---');
    actions.push('Trough level: измерить через 30 мин ДО следующей дозы. Цель: < 1.0 мг/л');
    actions.push('Peak level: через 30 мин ПОСЛЕ окончания инфузии. Цель: 5-12 мг/л (target ratio 8-10)');
    actions.push('Первый level — после 2-3 доз обычно (или при подозрении на накопление)');
    actions.push('При почечной дисфункции / отёках / hyperhydratation — раннее измерение');

    actions.push('--- Toxicity ---');
    actions.push('Nephrotoxicity: trough > 2 мг/л sustained → продлить interval');
    actions.push('Ototoxicity: irreversible. ABR (auditory brainstem response) screening при > 7 дней терапии');
    actions.push('Vestibular toxicity редко у н/р (балансирующий аппарат развивается позже)');

    actions.push('Длительность: 7-10 дней для sepsis; 14-21 для meningitis (плохая CSF penetration — обсудить cefotaxime)');

    return {
      value: total.toFixed(1),
      unit: `мг (${vol.toFixed(2)} мл)`,
      interpretation: `${dosePerKg} мг/кг ${interval} (extended-interval)`,
      color: '#3B82F6',
      details: `${dosePerKg} мг/кг × ${w} кг = ${total.toFixed(1)} мг ${interval}, IV slow infusion 30 мин.`,
      actions,
    };
  },
  caveats: [
    'Extended-interval (EID) preferred у н/р: меньше nephrotoxicity, similar efficacy (Cochrane 2011)',
    'НЕ использовать concomitantly с другими nephrotoxic препаратами (амфотерицин, vancomycin, NSAIDs) без пристального мониторинга',
    'Не комбинировать в одной line с β-lactams — inactivation in vitro',
    'Низкая CSF penetration — для meningitis обсудить cefotaxime / meropenem',
    'Volume of distribution выше у н/р (особенно недоношенных / отёчных) — может потребоваться higher mg/kg',
    'Адекватная гидратация важна; диурез < 1 мл/кг/ч → задержать дозу',
    'Therapeutic monitoring: первый trough после 2-3 дозы у термин; раньше у недоношенных',
    'Ototoxicity — irreversible, screening ABR обязателен при > 7 дней или при hyperhydration',
    'Synergy с ампициллином против Listeria, GBS — стандарт пары для EOS',
  ],
  related: [
    { id: 'neo-ampicillin-dose', title: 'Ампициллин н/р' },
    { id: 'neo-kaiser-eos', title: 'Kaiser EOS' },
    { id: 'neo-puopolo-eos', title: 'Puopolo EOS' },
    { id: 'neo-fluid', title: 'Жидкость по дням' },
  ],
  info: `### Гентамицин — empiric neonatal sepsis

Аминогликозид, second member пары с ампициллином для эмпирической
терапии EOS / LOS. Покрытие gram-negative (E. coli, Klebsiella, etc.).

### Extended-Interval Dosing (EID)

| PMA | PNA | Доза | Interval |
|---|---|---|---|
| ≤ 29 нед | 0-7 дн | 5 мг/кг | q48h |
| ≤ 29 нед | 8-28 дн | 4 мг/кг | q36h |
| ≤ 29 нед | > 28 дн | 4 мг/кг | q24h |
| 30-34 нед | 0-7 дн | 4.5 мг/кг | q36h |
| 30-34 нед | > 7 дн | 4 мг/кг | q24h |
| ≥ 35 нед | 0-7 дн | 4 мг/кг | q24h |
| ≥ 35 нед | > 7 дн | 5 мг/кг | q24h |

### Therapeutic Drug Monitoring

| Параметр | Когда измерять | Цель |
|---|---|---|
| **Trough** | 30 мин до next dose | < 1.0 мг/л |
| **Peak** | 30 мин после end of infusion | 5-12 мг/л |
| **Peak/MIC ratio** | — | 8-10 (Cmax/MIC) |

Первый level: после 2-3 доз у термин; раньше у недоношенных или
при подозрении на накопление.

### Спектр

| Чувствительны | Резистентны |
|---|---|
| E. coli | Anaerobes |
| Klebsiella | Streptococci alone |
| Enterobacter | MRSA / MRSE |
| Pseudomonas | Listeria (need ampi synergy) |
| Citrobacter | ESBL produces (variable) |

### Синергия с ампициллином

- **Listeria meningitis:** ampi + gent — bactericidal
- **GBS sepsis:** ampi + gent — bactericidal at lower MIC
- **Enterococcus IE:** ampi + gent — synergy

### Длительность

| Показание | Длительность |
|---|---|
| Sepsis | 7-10 дней (positive); 36-48 ч (negative + clinical) |
| Meningitis | 14-21 день (однако обсудить cefotaxime/meropenem) |
| UTI | 7-10 дней |
| Pneumonia | 7-14 дней |

### Toxicity

#### Nephrotoxicity
- Reversible — обычно при правильном мониторинге
- Trough > 2 мг/л sustained → продлить interval
- Признаки: ↓ диурез, ↑ Cr, FENa изменения

#### Ototoxicity
- **Irreversible** — высокочастотная нейросенсорная потеря
- Cochlear hair cells damage
- Screening ABR при > 7 дней лечения
- Family history aminoglycoside-induced ототоксичности — risk + 100×

### Совместимость in IV

| Совместимо | Несовместимо (in-line) |
|---|---|
| 0.9 % NaCl | Ampicillin |
| 5 % Glucose | Cephalosporins |
| — | Heparin |
| — | TPN с аминокислотами |

### Источники

- AAP Red Book 2021-2024
- NeoFax / Neonatal Formulary 9 ed (Ainsworth)
- BNFc
- КР МЗ РФ "Бактериальный сепсис н/р" (2024)
- Cochrane One vs Multiple aminoglycoside dosing 2011
`,
};

export default runner;
