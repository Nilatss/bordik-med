/**
 * Runner: neo-exchange-volume — Double Volume Exchange Transfusion (DVET) calc
 *
 * NEONATOLOGY MODULE A10 (P1).
 *
 * Расчёт объёма обменного переливания у новорождённого с тяжёлой
 * гипербилирубинемией / ГБН.
 *
 * Стандарт: Double Volume Exchange (DVET) = 2 × BV ≈ 160-170 мл/кг
 *   - Замещает ≈ 87-90 % циркулирующего билирубина и сенсибилизированных
 *     эритроцитов
 *   - Single volume (≈ 80 мл/кг) — заменяет ≈ 65-70 % (используется реже)
 *
 * Технические параметры:
 *   - Кровь: реконструированная (RBC + FFP) или цельная свежая;
 *     совместимая по матери (анти-D) и ребёнку
 *   - Скорость: ~5 мл/кг каждые 3 минуты, push-pull через UVC
 *   - Объём за один цикл: 5-10 % BV (5-15 мл) — не превышать
 *   - Длительность: 1-2 часа в зависимости от стабильности
 *
 * SOURCES:
 *   - AAP CPG 2022 Hyperbilirubinemia (Pediatrics 150(3):e2022058859)
 *   - NICE CG98 Jaundice in newborn babies (2010, addendum 2023)
 *   - КР МЗ РФ "Гемолитическая болезнь новорождённого" (2024)
 *   - WHO Pocket Book of Hospital Care for Children (2013)
 */
import type { CalculatorTool, CalculatorResult } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный (AAP 2022 / NICE CG98 / WHO) · РФ',
  reference: 'AAP 2022; NICE CG98 (2010, 2023); КР МЗ РФ "ГБН" (2024); WHO Pocket Book.',
  inputs: [
    {
      id: 'weight',
      label: 'Масса (кг)',
      type: 'number',
      min: 0.5,
      max: 6,
      step: 0.01,
    },
    {
      id: 'mode',
      label: 'Тип обмена',
      type: 'select',
      options: [
        { value: '2', label: 'Double volume (DVET, стандарт)' },
        { value: '1', label: 'Single volume' },
      ],
    },
    {
      id: 'preterm',
      label: 'Преждевременно рождённый (< 37 нед)?',
      type: 'select',
      options: [
        { value: '0', label: 'Нет (BV ≈ 80-85 мл/кг)' },
        { value: '1', label: 'Да (BV ≈ 90-100 мл/кг)' },
      ],
    },
  ],
  compute(values): CalculatorResult {
    const w = Number(values.weight ?? 0);
    const mode = Number(values.mode ?? 2);
    const preterm = String(values.preterm ?? '0') === '1';

    if (w <= 0 || w > 6) {
      return {
        value: '—',
        interpretation: 'Введите массу 0.5-6 кг',
        color: '#9CA3AF',
        details: 'Расчёт применим для новорождённых 0.5-6 кг.',
      };
    }

    const bvPerKg = preterm ? 95 : 85;
    const bv = w * bvPerKg;
    const total = bv * mode;
    const aliquot = Math.min(15, Math.max(5, Math.round(bv * 0.05)));
    const cycles = Math.round(total / aliquot);

    const actions: string[] = [];
    actions.push(`Объём обмена: ${total.toFixed(0)} мл (${mode === 2 ? 'DVET' : 'single'})`);
    actions.push(`Аликвота на цикл: ${aliquot} мл (5-10 % BV)`);
    actions.push(`Ориентировочно ${cycles} циклов push-pull`);
    actions.push('Доступ: UVC (предпочтительно) или комбинированный UVC + UAC');
    actions.push('Кровь: реконструированная (RBC + FFP), совместимая, < 7 дней, согретая до 37 °C');
    actions.push('Мониторинг каждые 30 мин: ЧСС, АД, SpO₂, температура, гликемия, кальций, K');
    actions.push('Контроль билирубина через 1-2 ч после окончания, далее q4-6h');
    actions.push('Готовность к коррекции: гипогликемия, гипокальциемия, гиперкалиемия, ацидоз');

    return {
      value: total.toFixed(0),
      unit: 'мл',
      interpretation: mode === 2 ? 'Double Volume Exchange' : 'Single Volume Exchange',
      color: '#EF4444',
      details: `BV = ${w} × ${bvPerKg} = ${bv.toFixed(0)} мл; ${mode === 2 ? '×2' : '×1'} = ${total.toFixed(0)} мл. ~ ${cycles} циклов × ${aliquot} мл.`,
      actions,
    };
  },
  caveats: [
    'DVET заменяет 87-90 % циркулирующего билирубина и эритроцитов',
    'Показания DVET: TSB на пороге обмена по AAP/NICE/КР РФ номограммам, ИЛИ TSB продолжает расти ≥ 0.5 мг/дл/ч на ФТ',
    'Bilirubin-Albumin (B/A) ratio ≥ 8 у термин (≥ 7 у поздних преэрм) — также показание',
    'Острый bilirubin encephalopathy (irritability, opisthotonos, retrocollis) — экстренная DVET',
    'Осложнения: 0.5-1 % смертность; гипокальциемия, аритмии, тромбоз UVC, NEC',
    'У G6PD-дефицита — порог снижается; у hemolytic disease — не задерживать',
  ],
  related: [
    { id: 'neo-bili-2022', title: 'Bili-2022 пороги' },
    { id: 'neo-tcb-conversion', title: 'TcB → TSB' },
    { id: 'neo-uvc-uac', title: 'UVC/UAC размер' },
    { id: 'neo-partial-exchange', title: 'Partial exchange (полицитемия)' },
  ],
  info: `### Double Volume Exchange Transfusion (DVET)

Расчёт объёма обменного переливания у новорождённого с тяжёлой
гипербилирубинемией или гемолитической болезнью.

### Принцип

| Тип | Объём | Замещает |
|---|---|---|
| **Double volume (DVET)** | 2 × BV ≈ 160-170 мл/кг | 87-90 % билирубина |
| Single volume | 1 × BV ≈ 80-85 мл/кг | 65-70 % |

### Показания (AAP 2022 + NICE CG98 + КР МЗ РФ)

- TSB на пороге обмена по номограммам (AAP/NICE/РФ)
- TSB рост ≥ 0.5 мг/дл/ч на интенсивной фототерапии
- Bilirubin-Albumin (B/A) ratio ≥ 8 у термин (≥ 7 у late preterm)
- Острый bilirubin encephalopathy: irritability, opisthotonos, retrocollis,
  fever, high-pitched cry — экстренная DVET

### Кровь для обмена

- **Реконструированная:** RBC + FFP, согласован Hct ~50-60 %
- **Цельная свежая:** < 7 дней, согретая до 37 °C
- **Совместимость:** O Rh-negative часто, проверить материнский антитела
  (анти-D, анти-Kell)

### Техника

- **Доступ:** UVC основной, UAC опционально (в/в push-pull или isovolemic)
- **Скорость:** 5 мл/кг каждые 3 минуты
- **Аликвота:** 5-15 мл за цикл (5-10 % BV)
- **Длительность:** 1-2 ч обычно

### Мониторинг

| Параметр | Частота |
|---|---|
| ЧСС, АД, SpO₂ | Continuous |
| Температура | q15 мин |
| Гликемия, ионы (Ca, K) | q30 мин |
| TSB | После окончания + q4-6h |

### Осложнения

- Смертность 0.5-1 %
- **Метаболические:** гипогликемия, гипокальциемия, гиперкалиемия, ацидоз
- **Тромбоз UVC**, портальная гипертензия (если UVC не корректен)
- **NEC** (особенно у глубоко недоношенных)
- **Тромбоцитопения** транзиторная

### Источники

- AAP CPG 2022 Hyperbilirubinemia
- NICE CG98 (2010, 2023 addendum)
- КР МЗ РФ "Гемолитическая болезнь новорождённого" (2024)
- WHO Pocket Book of Hospital Care for Children (2013)
`,
};

export default runner;
