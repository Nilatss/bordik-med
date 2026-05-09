/**
 * Runner: neo-photo-preterm — Phototherapy thresholds for preterm < 35 нед
 *
 * NEONATOLOGY MODULE A9 (P1).
 *
 * Калькулятор порогов фототерапии и обмена для глубоко и умеренно
 * недоношенных (28-34+6 нед).
 *
 * Подход: упрощённая аппроксимация по NICE consensus и КР МЗ РФ.
 * Точные значения — peditools.org/index2.php или Maisels 2012 chart.
 *
 * Базовая формула (NICE-aligned, мкмоль/л TSB порог фототерапии):
 *   PT_threshold ≈ (GA_weeks − 22) × 5 + 50         (для возраста ≥ 24 ч)
 *   ETT_threshold ≈ PT_threshold + 50-80
 *
 * Например (NICE addendum):
 *   - 28 нед, 24 ч: ФТ при TSB ≥ 100-120 мкмоль/л; ОПК при ≥ 175-200
 *   - 30 нед, 48 ч: ФТ при TSB ≥ 150-180 мкмоль/л; ОПК при ≥ 230-270
 *   - 34 нед, 96 ч: ФТ при TSB ≥ 220-250 мкмоль/л; ОПК при ≥ 320-360
 *
 * SOURCES:
 *   - NICE CG98 Jaundice (2010, addendum 2023) — preterm chart
 *   - Maisels MJ et al. J Perinatol 2012;32(9):660 — preterm thresholds
 *   - КР МЗ РФ "Гемолитическая болезнь новорождённого" (2024)
 *   - PediTools peditools.org (для точных значений)
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'NICE CG98 / РФ КР · упрощение peditools',
  reference: 'Maisels MJ et al. J Perinatol 2012;32:660. NICE CG98 addendum 2023. КР МЗ РФ ГБН 2024.',
  inputs: [
    {
      id: 'ga_weeks',
      label: 'GA при рождении (нед)',
      type: 'number',
      min: 28,
      max: 34,
      step: 1,
    },
    {
      id: 'age_hours',
      label: 'Возраст (ч)',
      type: 'number',
      min: 12,
      max: 168,
      step: 1,
    },
    {
      id: 'tsb',
      label: 'TSB (мкмоль/л)',
      type: 'number',
      min: 0,
      max: 500,
      step: 1,
    },
    {
      id: 'risk',
      label: 'Нейротоксические факторы риска',
      type: 'select',
      options: [
        { value: '0', label: 'Нет (стандартный риск)' },
        { value: '1', label: 'Есть (sepsis, asphyxia, G6PD, hemolysis, albumin < 30 г/л)' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const ga = Number(values.ga_weeks ?? 30);
    const age = Number(values.age_hours ?? 0);
    const tsb = Number(values.tsb ?? 0);
    const highRisk = String(values.risk ?? '0') === '1';

    if (ga < 28 || ga > 34) {
      return {
        value: '—',
        interpretation: 'Используйте этот калькулятор для GA 28-34+6 нед',
        color: '#9CA3AF',
        details: 'Для < 28 нед — индивидуальные пороги; для ≥ 35 нед — Bili-2022 AAP калькулятор.',
      };
    }

    // Упрощённая аппроксимация порогов (мкмоль/л)
    // Возраст-зависимый рост порога
    const ageFactor = Math.min(age / 24, 7) * 10; // +10 мкмоль/л за каждый день, max 7
    const baseThreshold = (ga - 22) * 15 + 50;     // GA-dependent baseline
    const ptThreshold = baseThreshold + ageFactor - (highRisk ? 30 : 0);
    const ettThreshold = ptThreshold + 80;

    let band = '';
    let color = '#22C55E';
    const actions: string[] = [];

    if (tsb >= ettThreshold) {
      band = 'Показано обменное переливание';
      color = '#7F1D1D';
      actions.push(`TSB ${tsb} ≥ порога ОПК (${ettThreshold.toFixed(0)} мкмоль/л) — DVET`);
      actions.push('Срочная фототерапия high-intensity на время подготовки');
      actions.push('Подготовить кровь для обмена (RBC + FFP); UVC доступ');
      actions.push('Альбумин 1 г/кг IV (улучшает связывание билирубина)');
      actions.push('Рассмотреть IVIG если изоиммунная hemolytic болезнь');
    } else if (tsb >= ptThreshold) {
      band = 'Показана фототерапия';
      color = '#F59E0B';
      actions.push(`TSB ${tsb} ≥ порога ФТ (${ptThreshold.toFixed(0)} мкмоль/л)`);
      actions.push('Интенсивная фототерапия 360°; рассмотреть multiple banks');
      actions.push('Адекватная гидратация; IV если кормление неэффективно');
      actions.push('TSB контроль через 4-6 ч; trend важнее абсолютного значения');
      actions.push(`До ОПК осталось: ${(ettThreshold - tsb).toFixed(0)} мкмоль/л`);
    } else if (tsb >= ptThreshold - 30) {
      band = 'Близко к порогу — мониторинг';
      color = '#84CC16';
      actions.push(`TSB ${tsb} в зоне риска (порог ФТ ${ptThreshold.toFixed(0)} мкмоль/л)`);
      actions.push('TSB контроль через 4-6 ч');
      actions.push('Оценить тренд; если рост ≥ 5 мкмоль/л/ч — превентивная ФТ');
    } else {
      band = 'Ниже порога ФТ';
      color = '#22C55E';
      actions.push(`TSB ${tsb} < порога ФТ (${ptThreshold.toFixed(0)} мкмоль/л)`);
      actions.push('Стандартный мониторинг по протоколу');
      actions.push('Адекватное кормление; контроль массы и диуреза');
    }

    return {
      value: ptThreshold.toFixed(0),
      unit: 'мкмоль/л',
      interpretation: band,
      color,
      details: `Порог ФТ ≈ ${ptThreshold.toFixed(0)} мкмоль/л; ОПК ≈ ${ettThreshold.toFixed(0)} мкмоль/л @ GA ${ga} нед, ${age} ч жизни${highRisk ? ' (высокий риск)' : ''}.`,
      actions,
    };
  },
  caveats: [
    'Bordik MVP — упрощённая аппроксимация. Для точных значений: peditools.org или Maisels 2012 chart',
    'NICE addendum 2023 — отдельные кривые для каждой нед GA',
    'У ≥ 35 нед использовать AAP 2022 (Bili-2022 калькулятор)',
    'У < 28 нед — индивидуальный подход (порог снижен), консилиум',
    'Высокий риск (sepsis, asphyxia, G6PD, hemolysis, albumin < 30 г/л) — порог снижается на 20-30 %',
    'TSB динамика важнее абсолютного значения (rise ≥ 0.5 мг/дл/ч (~ 8.5 мкмоль/л/ч) — escalation)',
  ],
  related: [
    { id: 'neo-bili-2022', title: 'Bili-2022 ≥ 35 нед' },
    { id: 'neo-exchange-volume', title: 'DVET калькулятор' },
    { id: 'neo-tcb-conversion', title: 'TcB → TSB' },
  ],
  info: `### Phototherapy thresholds — preterm 28-34 нед

Калькулятор порогов фототерапии и обменного переливания для умеренно
и глубоко недоношенных (28-34+6 нед). Для ≥ 35 нед — Bili-2022 AAP.

### Принцип расчёта (Bordik MVP)

Упрощённая аппроксимация:

\`\`\`
PT  ≈ (GA−22) × 15 + 50 + (возраст_сут × 10) − риск_30
ETT ≈ PT + 80
\`\`\`

⚠️ Для точных значений — **peditools.org/index2.php** (Maisels chart).

### NICE chart (отрывки addendum 2023)

| GA | 24 ч TSB порог ФТ (мкмоль/л) | 24 ч TSB порог ОПК |
|---|---|---|
| 28 нед | 100-120 | 175-200 |
| 30 нед | 130-150 | 200-230 |
| 32 нед | 160-180 | 230-260 |
| 34 нед | 200-220 | 290-320 |

### Нейротоксические факторы риска

Снижают порог на 20-30 %:
- Sepsis / NEC / тяжёлая bacteraemia
- Asphyxia (Apgar 5 мин ≤ 5)
- G6PD дефицит
- Изоиммунная hemolytic болезнь
- Albumin < 30 г/л
- Респираторный дистресс / ИВЛ

### Триггеры эскалации

- **TSB рост ≥ 0.5 мг/дл/ч (8.5 мкмоль/л/ч)** на интенсивной ФТ → DVET готовиться
- **B/A ratio ≥ 7** у late preterm — DVET indication
- **Острый bilirubin encephalopathy** — экстренная DVET

### Источники

- NICE CG98 (2010, addendum 2023) — preterm chart
- Maisels MJ et al. J Perinatol 2012;32:660
- КР МЗ РФ "ГБН" (2024)
- PediTools (peditools.org)
`,
};

export default runner;
