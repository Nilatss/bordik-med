// @ts-nocheck
/** Runner: ferriman — Modified Ferriman-Gallwey score for hirsutism */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const areas: { id: string; label: string }[] = [
  { id: 'upperlip', label: 'Верхняя губа' },
  { id: 'chin', label: 'Подбородок' },
  { id: 'chest', label: 'Грудь' },
  { id: 'upperback', label: 'Верх спины' },
  { id: 'lowerback', label: 'Низ спины' },
  { id: 'upperabdomen', label: 'Верх живота' },
  { id: 'lowerabdomen', label: 'Низ живота' },
  { id: 'arm', label: 'Плечо' },
  { id: 'thigh', label: 'Бедро' },
];

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    ...areas.map<ToolInput>((a) => ({
      id: a.id,
      label: a.label,
      type: 'select',
      options: [
        { value: 0, label: '0 — нет терминальных волос', points: 0 },
        { value: 1, label: '1 — единичные', points: 1 },
        { value: 2, label: '2 — лёгкое оволосение', points: 2 },
        { value: 3, label: '3 — среднее', points: 3 },
        { value: 4, label: '4 — выраженное (мужской тип)', points: 4 },
      ],
    })),
    {
      id: 'ethnicity',
      label: 'Этническая группа (порог)',
      type: 'select',
      options: [
        { value: 'med', label: 'Средиземноморская/Ближневост. (порог ≥ 9-10)' },
        { value: 'white', label: 'Европеоиды/Северо-Европ. (порог ≥ 8)' },
        { value: 'asian', label: 'Восточно-азиатская (порог ≥ 2-3)' },
        { value: 'black', label: 'Афроамериканская (порог ≥ 8)' },
        { value: 'hispanic', label: 'Латиноамериканская (порог ≥ 9)' },
      ],
    },
  ],
  compute: (v) => {
    const total = areas.reduce((acc, a) => acc + (Number(v[a.id]) || 0), 0);
    const eth = String(v.ethnicity || 'white');
    const thresh: Record<string, number> = { med: 9, white: 8, asian: 3, black: 8, hispanic: 9 };
    const th = thresh[eth];
    const positive = total >= th;

    let severity = '';
    let color = '#10B981';
    if (total < th) { severity = 'Норма (нет гирсутизма)'; color = '#10B981'; }
    else if (total < 15) { severity = 'Лёгкий гирсутизм'; color = '#F59E0B'; }
    else if (total < 25) { severity = 'Умеренный гирсутизм'; color = '#F97316'; }
    else { severity = 'Тяжёлый гирсутизм'; color = '#EF4444'; }

    const actions: string[] = [];
    if (positive) {
      actions.push('Лабораторно: тестостерон общий/свободный, ДГЭА-С, 17-ОН-прогестерон (8:00)');
      actions.push('Оценка гипоталамо-гипофизарной оси: ЛГ/ФСГ, пролактин, ТТГ');
      actions.push('УЗИ малого таза: поликистоз яичников?');
      actions.push('При ↑ ДГЭА-С > 7 мкмоль/л — МРТ надпочечников (опухоль?)');
      actions.push('При быстропрогрессирующем гирсутизме + вирилизации — исключить опухоль (андроген-секретирующ.)');
      actions.push('Терапия: КОК с антиандрогенным прогестином (дроспиренон, ципротерон)');
      actions.push('Спиронолактон 50-200 мг/сут, финастерид 2,5-5 мг/сут');
      actions.push('Косметическая эпиляция (лазер, электро-)');
    } else {
      actions.push('Гирсутизм не подтверждён — повторная оценка не требуется');
      actions.push('Если беспокоит косметический аспект — консультация дерматолога');
    }

    return {
      value: `${total}/36 баллов`,
      unit: 'mFG',
      interpretation: `${severity} · порог ≥ ${th}`,
      color,
      details: `9 оцениваемых зон × 0-4 балла = макс. 36.\n\nСумма: ${total} · Порог (${eth}): ${th}\n\n${positive ? '⚠️ Гирсутизм подтверждён — требуется эндокринное обследование на андрогенизм.' : 'Значение в пределах этнической нормы.'}\n\nЧастые причины:\n- СПКЯ (70-80 % случаев)\n- Идиопатический (15-20 %)\n- Неклассическая ВГКН (1-10 %)\n- Андроген-секретирующая опухоль (< 1 %)\n- Cushing, гипертиреоз, акромегалия, гиперпролактинемия`,
      actions,
      caveats: [
        'Оценка субъективна — требует опыта',
        'Этнические пороги варьируют: азиаты < европейцы < среднеземноморцы',
        'Быстрое развитие + вирилизация (маскулинизация голоса, клиторомегалия) → опухоль (срочно МРТ)',
        'Не включает бакенбарды, усы, ореолу грудной железы (но их можно учесть в общем впечатлении)',
        'Терапия КОК/спиронолактоном действует 6-12 мес — раньше не оценивать',
      ],
      scale: {
        segments: [
          { min: 0, max: 8, label: 'Норма', color: '#10B981' },
          { min: 8, max: 15, label: 'Лёгкий', color: '#F59E0B' },
          { min: 15, max: 25, label: 'Умеренный', color: '#F97316' },
          { min: 25, max: 36, label: 'Тяжёлый', color: '#EF4444' },
        ],
        current: total,
        unit: 'баллов',
      },
      related: [
        { id: 'rotterdam', title: 'Rotterdam PCOS' },
      ],
      relatedCourses: [
        { id: '302.1', title: 'Эндокринология' },
        { id: '305.1', title: 'Гинекология' },
      ],
    };
  },
  reference: 'Hatch R et al. Hirsutism: implications, etiology, and management. Am J Obstet Gynecol 1981;140:815-30.',
  countries: 'Международный',
  presets: [
    { label: 'Норма', values: { upperlip: 1, chin: 0, chest: 0, upperback: 0, lowerback: 0, upperabdomen: 0, lowerabdomen: 1, arm: 1, thigh: 0, ethnicity: 'white' } },
    { label: 'Умеренный (СПКЯ)', values: { upperlip: 2, chin: 2, chest: 1, upperback: 1, lowerback: 2, upperabdomen: 2, lowerabdomen: 3, arm: 2, thigh: 2, ethnicity: 'white' } },
    { label: 'Тяжёлый (вирил.)', values: { upperlip: 4, chin: 4, chest: 3, upperback: 2, lowerback: 3, upperabdomen: 3, lowerabdomen: 4, arm: 3, thigh: 3, ethnicity: 'white' } },
  ],
  info: `### Для чего используется
**Модифицированный индекс Ферримана-Галлвея (mFG)** — стандартизированная оценка гирсутизма: степень терминального оволосения в 9 андроген-чувствительных зонах.

### Зоны (каждая 0-4 балла)
1. Верхняя губа
2. Подбородок
3. Грудь
4. Верх спины
5. Низ спины
6. Верх живота
7. Низ живота
8. Плечо
9. Бедро

### Пороги по этнической группе
| Популяция | Порог |
|---|---|
| Восточно-азиаты | ≥ 2-3 |
| Европеоиды / афроамериканцы | ≥ 8 |
| Средиземноморские | ≥ 9-10 |

### Интерпретация по сумме
| Балл | Степень |
|---|---|
| < 8 | Норма |
| 8-15 | Лёгкий |
| 16-25 | Умеренный |
| > 25 | Тяжёлый |

### Источник
Hatch R et al. Am J Obstet Gynecol 1981;140:815. Endocrine Society Guideline 2018.`,
};

export default runner;
