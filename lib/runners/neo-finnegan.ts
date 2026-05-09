/**
 * Runner: neo-finnegan — Modified Finnegan Neonatal Abstinence Score (mFNAS)
 *
 * NEONATOLOGY MODULE A7 (P1).
 *
 * SOURCES:
 *   - Finnegan LP et al. Addict Dis. 1975;2(1-2):141-58
 *   - MDCalc Modified Finnegan: https://www.mdcalc.com/calc/10048/modified-finnegan-neonatal-abstinence-score-nas
 *   - Hudak ML, Tan RC; AAP Committee on Drug. Pediatrics 2012;129(2):e540
 *   - КР МЗ РФ "Неонатальный абстинентный синдром" (2024)
 *
 * Bands (mFNAS):
 *   ≤ 7   — Не требует фармакотерапии (поддерживающие меры)
 *   8-11  — Активный мониторинг; фармакотерапия при тренде
 *   ≥ 12  — Фармакотерапия (морфин или метадон) показана
 *
 * Триггер фармакотерапии (РФ + AAP):
 *   - 3 последовательных балла ≥ 8, ИЛИ
 *   - 2 последовательных балла ≥ 12
 */
import type { ScoreTool, CalculatorResult } from '../tools-runners';
import { findBand } from '../tools-runners';

type Item = { id: string; label: string; max: number };

const items: Item[] = [
  { id: 'cry_high', label: 'Высокий пронзительный крик (0/2)', max: 2 },
  { id: 'cry_cont', label: 'Продолжительный крик (0/3)', max: 3 },
  { id: 'sleep', label: 'Нарушения сна (1/2/3 ч)', max: 3 },
  { id: 'moro', label: 'Усиленный/повторный Moro reflex (0-3)', max: 3 },
  { id: 'tremor_dist', label: 'Тремор при беспокойстве (0/1/2)', max: 2 },
  { id: 'tremor_undist', label: 'Тремор в покое (0-4)', max: 4 },
  { id: 'tone', label: 'Гипертонус (0/2)', max: 2 },
  { id: 'excoriation', label: 'Экскориации (0/1)', max: 1 },
  { id: 'myoclonus', label: 'Миоклонус (0/3)', max: 3 },
  { id: 'seizures', label: 'Судороги (0/5)', max: 5 },
  { id: 'sweating', label: 'Потливость (0/1)', max: 1 },
  { id: 'fever', label: 'Лихорадка 37.2-38.4 / >38.4°C (0/1/2)', max: 2 },
  { id: 'yawn', label: 'Зевота частая (0/1)', max: 1 },
  { id: 'mottling', label: 'Мраморность кожи (0/1)', max: 1 },
  { id: 'stuffy', label: 'Заложенность носа (0/1)', max: 1 },
  { id: 'sneezing', label: 'Чихание > 3-4/15 мин (0/1)', max: 1 },
  { id: 'flaring', label: 'Раздувание крыльев носа (0/2)', max: 2 },
  { id: 'rr', label: 'Тахипноэ > 60 / + втяжения (0/1/2)', max: 2 },
  { id: 'sucking', label: 'Чрезмерное сосание (0/1)', max: 1 },
  { id: 'feeding', label: 'Плохое питание (0/2)', max: 2 },
  { id: 'regurg', label: 'Срыгивание / проективная рвота (0-3)', max: 3 },
  { id: 'stools', label: 'Жидкий / водянистый стул (0-3)', max: 3 },
];

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 47,
  countries: 'Международный (Finnegan 1975 / AAP 2012) · РФ',
  reference: 'Finnegan LP. Addict Dis 1975;2:141. Hudak ML, Tan RC. Pediatrics 2012;129:e540.',
  inputs: items.map((it) => ({
    id: it.id,
    label: it.label,
    type: 'number' as const,
    min: 0,
    max: it.max,
  })),
  bands: [
    {
      min: 0,
      max: 7,
      label: 'Лёгкая',
      color: '#22C55E',
      description: 'Поддерживающие меры; продолжить мониторинг.',
      actions: [
        'Поддерживающие меры: пеленание, низкий уровень шума, кормление по требованию',
        'Кенгуру; кормление грудью / донорским молоком (если безопасно)',
        'Продолжить мониторинг q3-4h первые 96-120 ч',
      ],
    },
    {
      min: 8,
      max: 11,
      label: 'Умеренная',
      color: '#F59E0B',
      description: 'Активный мониторинг; фармакотерапия при тренде.',
      actions: [
        'Усилить нефармакологические меры; перевод в одиночную палату',
        'Обсудить фармакотерапию если ≥ 3 последовательных оценок ≥ 8',
        'Контроль электролитов, гликемии, температуры',
      ],
    },
    {
      min: 12,
      max: 47,
      label: 'Тяжёлая',
      color: '#EF4444',
      description: 'Показана фармакотерапия (морфин/метадон).',
      actions: [
        'Фармакотерапия: морфин 0.04-0.08 мг/кг q3-4h PO (титрование) — first line',
        'Альтернативы: метадон, бупренорфин (по протоколу учреждения)',
        'Адъювант: клонидин при тяжёлой автономной симптоматике',
        'NICU-мониторинг и постепенное снижение дозы по протоколу',
      ],
    },
  ],
  compute(values): CalculatorResult {
    let total = 0;
    for (const it of items) {
      const raw = Number(values[it.id] ?? 0);
      total += Math.max(0, Math.min(it.max, raw));
    }
    const band = findBand(runner.bands, total);
    return {
      value: String(total),
      unit: 'mFNAS',
      interpretation: band.label,
      color: band.color,
      details: `Сумма ${total}/47 — ${band.description}. Триггер фармакотерапии: 3 последовательных ≥ 8 ИЛИ 2 последовательных ≥ 12.`,
      actions: (band.actions ?? []).filter((a): a is string => typeof a === 'string'),
    };
  },
  caveats: [
    'Оценка q3-4h после кормления первые 96-120 ч жизни',
    'Eat-Sleep-Console (ESC) — функциональная альтернатива (NEJM 2023)',
    'Опиоиды короткого действия — пик симптомов 24-72 ч; метадон до 96 ч; бупренорфин до 14 дней',
  ],
  related: [
    { id: 'neo-nips', title: 'NIPS' },
    { id: 'neo-pipp-r', title: 'PIPP-R' },
    { id: 'neo-npass', title: 'N-PASS' },
  ],
  info: `### Modified Finnegan Score (NAS)

22-пунктовая шкала оценки неонатального абстинентного синдрома. Оценка
проводится **q3-4h после кормления** первые 96-120 ч жизни.

### Триггеры фармакотерапии

**AAP 2012 + КР МЗ РФ:**
- 3 последовательных оценок ≥ 8
- ИЛИ 2 последовательных оценок ≥ 12

### Когда оценивать

Любой новорождённый с подтверждённой/подозреваемой материнской
зависимостью от опиоидов, бензодиазепинов, барбитуратов, ССРИ.

| Препарат | Начало симптомов |
|---|---|
| Опиоиды короткого действия | 24-72 ч |
| Метадон | 72-96 ч |
| Бупренорфин | до 14 дней |

### Альтернатива: ESC (Eat-Sleep-Console)

NEJM 2023 RCT: ESC (фокус на способности есть/спать/быть успокоенным)
снижает использование медикаментозной терапии и сокращает LOS.

### Источники

- Finnegan LP 1975 — оригинал
- Hudak ML, Tan RC. AAP 2012
- ESC trial NEJM 2023
- MDCalc mFNAS
`,
};

export default runner;
