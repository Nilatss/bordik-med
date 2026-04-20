// @ts-nocheck
/** Runner: ciwa — Clinical Institute Withdrawal Assessment for Alcohol (CIWA-Ar) */
import type {
  CalculatorTool,
  ToolInput,
  Preset,
  CalculatorResult,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  countries: 'Международный',
  reference:
    'Sullivan JT, Sykora K, Schneiderman J, et al. Assessment of alcohol withdrawal: the revised clinical institute withdrawal assessment for alcohol scale (CIWA-Ar). Br J Addict. 1989;84(11):1353-1357.',
  inputs: [
    {
      id: 'total',
      label: 'Суммарный балл CIWA-Ar (10 пунктов × 0-7, max 67)',
      type: 'number',
      min: 0,
      max: 67,
      step: 1,
      quickValues: [5, 10, 15, 20, 25, 35],
      hint: 'Тошнота, тремор, пот, тревога, возбуждение, тактильные/слуховые/зрительные нарушения, головная боль (0-7), ориентация (0-4).',
    },
    {
      id: 'seizureHistory',
      label: 'Анамнез судорог при отмене алкоголя',
      type: 'checkbox',
      points: 0,
    },
    {
      id: 'dtHistory',
      label: 'Анамнез delirium tremens',
      type: 'checkbox',
      points: 0,
    },
  ],
  presets: [
    { label: 'Лёгкий (6)', values: { total: 6, seizureHistory: false, dtHistory: false } },
    { label: 'Умеренный (15)', values: { total: 15, seizureHistory: false, dtHistory: false } },
    { label: 'Тяжёлый + DT риск (25)', values: { total: 25, seizureHistory: true, dtHistory: true } },
  ],
  compute: (v) => {
    const total = Math.max(0, Math.min(67, Number(v.total) || 0));
    const seizure = v.seizureHistory === true;
    const dt = v.dtHistory === true;

    let color = '#22C55E';
    let label = 'Лёгкий (0-9)';
    let details = 'Лёгкий или отсутствующий синдром отмены. Симптоматическая терапия.';
    const actions: string[] = [];

    if (total >= 20) {
      color = '#991B1B';
      label = 'Тяжёлый (≥20)';
      details = 'Тяжёлый синдром отмены. Высокий риск delirium tremens (смертность 5-15% без лечения).';
      actions.push(
        'Госпитализация (мониторинг, ICU при DT)',
        'Бензодиазепины: диазепам 10-20 мг в/в q1h до седации, либо лоразепам 2-4 мг в/в q15-30 мин',
        'Фенобарбитал как альтернатива при резистентности к BZD',
        'Тиамин 100-500 мг в/в ДО глюкозы (профилактика Вернике)',
        'Коррекция Mg, K, PO4; регидратация',
        'Переоценка CIWA каждые 30-60 мин до стабилизации',
      );
    } else if (total >= 10) {
      color = '#F59E0B';
      label = 'Умеренный (10-19)';
      details = 'Умеренный синдром отмены. Показана фармакотерапия бензодиазепинами.';
      actions.push(
        'Symptom-triggered BZD: лоразепам 2 мг или диазепам 10 мг при CIWA ≥10',
        'Фиксированная схема при риске судорог/DT (chlordiazepoxide 50 мг q6h taper)',
        'Тиамин 100 мг в/в/в/м × 3-5 дней',
        'Повтор CIWA каждые 1-2 ч',
      );
    } else {
      actions.push(
        'Наблюдение, повтор CIWA каждые 4-8 ч',
        'Тиамин 100 мг в/м, фолат, мультивитамины',
        'Психосоциальная поддержка, направление к наркологу',
      );
    }

    if (seizure || dt) {
      color = '#991B1B';
      actions.unshift('⚠️ Анамнез судорог/DT — агрессивная фиксированная BZD-схема + ICU-мониторинг независимо от балла');
    }

    return {
      value: String(total),
      unit: 'баллов',
      color,
      interpretation: label,
      details,
      actions,
      caveats: [
        'CIWA-Ar валидна только при способности пациента к вербальному контакту',
        'Не применима при делирии, тяжёлой интоксикации, языковом барьере',
        'Не оценивает вегетативные параметры (ЧСС, АД, температура) — должны мониториться отдельно',
        'Пункт "ориентация" оценивается 0-4, остальные 0-7',
        'Низкий балл не исключает DT у пациентов с тяжёлой зависимостью',
      ],
      scale: {
        segments: [
          { min: 0, max: 9, label: '0-9 лёгкий', color: '#22C55E' },
          { min: 10, max: 19, label: '10-19 умеренный', color: '#F59E0B' },
          { min: 20, max: 67, label: '≥20 тяжёлый', color: '#991B1B' },
        ],
        current: total,
        unit: 'баллов',
      },
      related: [
        { id: 'cage-audit', title: 'AUDIT' },
        { id: 'cows', title: 'COWS (опиаты)' },
      ],
      relatedCourses: [
        { id: '306.1', title: 'Психиатрия — зависимости' },
        { id: '300.4', title: 'Неотложная помощь' },
      ],
    };
  },
  info: `### Для чего используется
**CIWA-Ar (Clinical Institute Withdrawal Assessment for Alcohol, Revised; Sullivan 1989)** — золотой стандарт оценки тяжести алкогольного абстинентного синдрома. 10 пунктов, оценивается клиницистом.

### Пункты
1. Тошнота/рвота (0-7)
2. Тремор (0-7)
3. Потливость (0-7)
4. Тревога (0-7)
5. Возбуждение (0-7)
6. Тактильные нарушения (0-7)
7. Слуховые нарушения (0-7)
8. Зрительные нарушения (0-7)
9. Головная боль (0-7)
10. Ориентация и нарушение сознания (0-4)

### Интерпретация
| Балл | Тяжесть | Тактика |
|---|---|---|
| 0-9 | Лёгкий | Поддерживающая, без BZD |
| 10-19 | Умеренный | BZD symptom-triggered |
| ≥20 | Тяжёлый | Госпитализация, риск DT |

### Фармакотерапия
- **Бензодиазепины** — 1-я линия (диазепам, лоразепам, хлордиазепоксид)
- **Тиамин 100-500 мг** до глюкозы — профилактика Вернике-Корсакова
- **Фенобарбитал** — при резистентности к BZD
- **Дексмедетомидин/пропофол** — ICU при тяжёлом DT

### Ограничения
- Требует вербального контакта (не работает при глубоком делирии)
- Субъективные пункты (тревога, тактильные) могут искажаться
- Не отражает вегетативную нестабильность

### Источник
Sullivan JT et al. *Br J Addict.* 1989;84:1353-1357.`,
};

export default runner;
