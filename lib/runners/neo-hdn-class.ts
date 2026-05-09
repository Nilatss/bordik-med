/**
 * Runner: neo-hdn-class — Гемолитическая болезнь новорождённого (ГБН)
 * по тяжести и форме (КР МЗ РФ ГБН + AAP 2022 + NICE CG98).
 *
 * NEONATOLOGY MODULE — Б11 (audit issue 3.B). Закрывает gap classifications.
 *
 * Классификация по 2 осям:
 *   1) Этиология (форма): AB0, Rh, Kell, minor antigen
 *   2) Тяжесть: лёгкая (только anaemia), средняя (anaemia + jaundice),
 *      тяжёлая (kernicterus risk / hydrops fetalis).
 *
 * SOURCES:
 *   - КР МЗ РФ "Гемолитическая болезнь плода и новорождённого" (2024)
 *   - AAP 2022 Hyperbilirubinemia Clinical Practice Guideline
 *     (Pediatrics 150:e2022058859 — IVIG для isoimmune)
 *   - NICE CG98 Jaundice in newborns < 28 d (updated 2023)
 *   - Mreihil K et al. Cochrane 2018:CD012080 — IVIG efficacy
 */
import type { ScoreTool, CalculatorResult } from '../tools-runners';
import { findBand } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 6,
  countries: 'РФ · США (AAP) · Европа (NICE)',
  reference: 'КР МЗ РФ ГБН 2024. AAP Pediatrics 2022;150:e2022058859. NICE CG98 (2023).',
  inputs: [
    {
      id: 'hb_at_birth',
      label: 'Hb пуповинная кровь < 120 г/л (anaemia)',
      type: 'checkbox',
      points: 1,
    },
    {
      id: 'tsb_high',
      label: 'TSB > exchange threshold по nomogram (по часам жизни)',
      type: 'checkbox',
      points: 2,
    },
    {
      id: 'hydrops_fetalis',
      label: 'Hydrops fetalis (отёчная форма) — генерализ. отёки + плеврит/асцит',
      type: 'checkbox',
      points: 3,
    },
    {
      id: 'positive_dat',
      label: 'Прямой Кумбс (DAT) положительный',
      type: 'checkbox',
      points: 1,
    },
    {
      id: 'rapid_rise',
      label: 'Скорость нарастания TSB > 5 мг/дл за 24 ч (или > 0.5 мг/дл/ч)',
      type: 'checkbox',
      points: 1,
    },
  ],
  bands: [
    {
      min: 0,
      max: 1,
      label: 'Отсутствие или минимальные признаки',
      color: '#22C55E',
      description: 'Нет данных за активный гемолиз / умеренные изменения.',
      actions: [
        'Стандартный мониторинг билирубина по nomogram (TSB / TcB на 24 ч жизни)',
        'Контроль группы крови, Rh + DAT',
        'Контроль CBC + ретикулоциты',
        'Грудное вскармливание поощрять',
        'Контроль желтухи + клиническая оценка q12h',
      ],
    },
    {
      min: 2,
      max: 3,
      label: 'Лёгкая ГБН (только лёгкая желтуха)',
      color: '#FBBF24',
      description: 'Изоиммунный конфликт с лёгкими лабораторными изменениями.',
      actions: [
        'Phototherapy при достижении PT threshold по nomogram (см. neo-bili-2022)',
        'Усиленное кормление (10-12 раз/сутки) для билирубин-elimination',
        'TSB q4-6h до plateau, затем q12h',
        'CBC + ретикулоциты + DAT',
        'IVIG 0.5-1 г/кг ИГ если TSB rapidly растёт despite phototherapy (AAP 2022)',
        'Подготовить donor blood для возможного DVET если TSB approach exchange threshold',
      ],
    },
    {
      min: 4,
      max: 5,
      label: 'Средняя/тяжёлая ГБН (anaemia + jaundice + Coombs+)',
      color: '#F97316',
      description: 'Активный гемолиз с риском билирубиновой энцефалопатии.',
      actions: [
        '⚠️ Intensive phototherapy (двойная или тройная PT)',
        'IVIG 0.5-1 г/кг IV over 2-4 ч (AAP 2022 — для isoimmune ГБН с нарастанием TSB)',
        'Возможен DVET (160 мл/кг — см. neo-exchange-volume) если TSB не отвечает на PT/IVIG',
        'Готов donor blood: cross-matched, irradiated, leukocyte-reduced, CMV-negative для preterm',
        'Контроль электролитов (Ca, K, Mg) + glucose до/во время DVET',
        'TSB q2-4h в острой фазе',
        'Анти-D Rh-prophylaxis у матери — для будущих беременностей (RhIG 300 мкг IM)',
        'Эритроцитарная трансфузия при Hb < 80 г/л + симптомы',
      ],
    },
    {
      min: 6,
      max: 6,
      label: 'Hydrops fetalis (отёчная форма) — критическое состояние',
      color: '#7F1D1D',
      description: 'Тяжёлая внутриутробная анемия с гипоксией и СН — крайне высокий риск смерти.',
      actions: [
        '🚨 СРОЧНО — реанимационный protocol в родзале',
        'Pre-emptive intubation + MV',
        'Чрескожный pleural / abdominal tap при тяжёлом effusion',
        'PRBC transfusion 10-20 мл/кг (uncrossmatched O-negative готовы immediately)',
        'Inotropes (dopamine, epinephrine) для cardiogenic shock',
        'Срочный DVET — обычно через UVC',
        'IVIG 1 г/кг IV',
        'Phototherapy максимально интенсивная',
        'NICU level III, mortality 25-50 %',
        'Anti-D RhIG для матери на следующих беременностях',
        'Антенатальная диагностика и в utero трансфузии в специализированных центрах для prevention в будущем',
      ],
    },
  ],
  compute(values): CalculatorResult {
    let score = 0;
    if (values.hb_at_birth === true) score += 1;
    if (values.tsb_high === true) score += 2;
    if (values.hydrops_fetalis === true) score += 3;
    if (values.positive_dat === true) score += 1;
    if (values.rapid_rise === true) score += 1;

    const band = findBand(runner.bands, score);

    return {
      value: String(score),
      unit: 'критериев / 8 max',
      interpretation: band.label,
      color: band.color,
      details: `${band.description ?? ''} См. actions для tactic.`,
      actions: (band.actions ?? []).filter((a): a is string => typeof a === 'string'),
    };
  },
  caveats: [
    'Этиология (Rh / AB0 / Kell / minor antigen) определяется через DAT + материнские антитела',
    'AB0-incompatibility — самая частая (~30 % всех желтух у term), обычно лёгкая-средняя',
    'Rh-incompatibility — реже (после anti-D prophylaxis), но severe (hydrops риск)',
    'Kell — редко, но severe; отличается тем что DAT может быть negative из-за erythroid suppression',
    'Hydrops fetalis — антенатальная диагностика (УЗИ + допплер MCA) предпочтительнее postnatal',
    'IVIG показания (AAP 2022): isoimmune ГБН + rapidly rising TSB despite intensive PT',
    'DVET через UVC — стандарт; периферический double-lumen — альтернатива',
    'Ретикулоциты повышены в активной фазе гемолиза — снижение к 7-14 d жизни',
    'Anti-D Rh prophylaxis — RhIG 300 мкг IM на 28 нед + после родов (если fetus Rh+)',
    'Late-onset anaemia (3-6 нед) после ГБН — frequent у Rh; может потребоваться эритропоэтин или transfusion',
    'NICE CG98 включает phototherapy threshold отдельно для ГБН (lower threshold чем для physiological)',
  ],
  related: [
    { id: 'neo-bili-2022', title: 'AAP/NICE/КР РФ bili nomograms' },
    { id: 'neo-photo-preterm', title: 'PT thresholds 28-34 нед' },
    { id: 'neo-exchange-volume', title: 'DVET 160 мл/кг' },
    { id: 'neo-tcb-conversion', title: 'TcB → TSB' },
    { id: 'kramer', title: 'Kramer scale (clinical)' },
  ],
  info: `### ГБН — гемолитическая болезнь новорождённого

ГБН — клинический синдром у новорождённого, обусловленный изоиммунной
гемолизом RBC матриц-антителами на отцовские антигены RBC ребёнка.

### Этиология (формы)

| Форма | Частота | Тяжесть | Особенности |
|---|---|---|---|
| **AB0** | 30 % всех желтух term | Лёгкая-средняя | Mother O + fetus A/B; DAT часто weak/+; редко hydrops |
| **Rh (anti-D)** | редко (после prophylaxis) | Средняя-тяжёлая | Mother Rh- + fetus Rh+; severe hydrops возможен |
| **Rh (anti-c, -E)** | редко | Средняя | Аналогично anti-D |
| **Kell (anti-K)** | очень редко | Тяжёлая | DAT может быть negative; erythroid suppression |
| **Duffy / Kidd** | rare | Variable | — |

### Степени тяжести (КР МЗ РФ + клиническая)

| Степень | Hb пуповинная | TSB на 24 ч | Дополнительно |
|---|---|---|---|
| **Лёгкая** | > 120 г/л | < PT threshold | Без транфузии, PT может не понадобиться |
| **Средняя** | 100-120 г/л | PT threshold | PT + monitoring |
| **Тяжёлая** | 80-100 г/л | Exchange threshold | PT + IVIG ± DVET |
| **Hydrops fetalis** | < 80 г/л + отёки | — | Pre-emptive интубация + DVET + transfusions |

### Диагностический алгоритм

1. **Антенатально:** maternal blood group + Rh + indirect Coombs (3 раза)
2. **Высокий риск (anti-D titer):** УЗИ + допплер MCA для anaemia
3. **При рождении:** cord blood — group, Rh, DAT, Hb, TSB
4. **24-48 ч:** TSB q4-6h, ретикулоциты, CBC

### Лечение по тяжести

#### Лёгкая
- Phototherapy при достижении nomogram threshold
- Усиленное кормление

#### Средняя
- Intensive PT (двойная)
- IVIG 0.5-1 г/кг при rapidly rising TSB
- Готовность к DVET

#### Тяжёлая (DVET indications)
- TSB > exchange threshold по nomogram
- Symptoms acute BIND (lethargy, opisthotonus)
- Failure of intensive PT + IVIG в течение 6-12 ч
- DVET = 2 × blood volume = 160 мл/кг

#### Hydrops fetalis
- Pre-emptive intubation
- Drainage effusions (chest tube, paracentesis)
- PRBC transfusion 10-20 мл/кг
- Inotropes
- Срочный DVET
- IVIG 1 г/кг

### IVIG (intravenous immunoglobulin)

**Показания (AAP 2022):**
- Isoimmune hemolytic disease
- TSB rapidly растёт despite intensive PT
- TSB approach exchange threshold

**Доза:** 0.5-1 г/кг IV over 2-4 ч.

**Механизм:** блокирует Fc-рецепторы на RES → ↓ destruction RBC.

**Эффективность (Cochrane 2018):** ↓ DVET need 30-50 %.

### Профилактика

- **Anti-D RhIG 300 мкг IM** @ 28 нед + после родов (если fetus Rh+)
- Раннее antenatal screening
- Универсальный screening на minor antigens у multipara

### Late effects

- **Late anaemia** (3-6 нед) — особенно у Rh; может потребоваться:
  - EPO 200 ЕД/кг 3×/нед (при Hb 80-100)
  - Transfusion (при Hb < 80 + симптомы)
- **Cholestasis** (rare) — ursodeoxycholic acid

### Источники

- КР МЗ РФ "Гемолитическая болезнь плода и новорождённого" 2024
- Kemper AR et al. Pediatrics 2022;150(3):e2022058859 — AAP 2022
- NICE CG98 Jaundice in newborn babies < 28 d (2023 addendum)
- Mreihil K et al. Cochrane 2018:CD012080 — IVIG meta-analysis
- ACOG Practice Bulletin 192 (2018) — RhD alloimmunization
- Smits-Wintjens VE et al. Pediatrics 2011;127:680 — neonatal AIHA
`,
};

export default runner;
