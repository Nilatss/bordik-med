// @ts-nocheck
/** Runner: gli */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'sex', label: 'Пол', type: 'select', options: [
      { value: 'm', label: 'Мужской' },
      { value: 'f', label: 'Женский' },
    ] },
    { id: 'age', label: 'Возраст', type: 'number', unit: 'лет', min: 3, max: 95, step: 1, quickValues: [25, 45, 65] },
    { id: 'height', label: 'Рост', type: 'number', unit: 'см', min: 100, max: 220, step: 1, quickValues: [160, 170, 180] },
    { id: 'ethnicity', label: 'Этническая группа', type: 'select', options: [
      { value: 'cauc', label: 'Кавказская (европеоиды)' },
      { value: 'afr', label: 'Афроамериканцы' },
      { value: 'nas', label: 'Северо-Восточная Азия' },
      { value: 'sas', label: 'Юго-Восточная Азия' },
      { value: 'oth', label: 'Другие / смешанные' },
    ] },
    { id: 'fev1', label: 'ОФВ₁ измеренный', type: 'number', unit: 'л', min: 0.3, max: 7, step: 0.01, quickValues: [2.0, 3.0, 3.5] },
    { id: 'fvc', label: 'ФЖЕЛ измеренная', type: 'number', unit: 'л', min: 0.5, max: 8, step: 0.01, quickValues: [2.5, 4.0, 4.5] },
  ],
  compute: (v) => {
    const age = Number(v.age) || 25;
    const h = Number(v.height) || 170;
    const fev1 = Number(v.fev1) || 3.0;
    const fvc = Number(v.fvc) || 4.0;
    const male = v.sex !== 'f';
    const eth = String(v.ethnicity || 'cauc');

    // Упрощённые предсказанные значения GLI-2012 (для демонстрации; не точная сплайн-модель)
    // Основа: Quanjer 2012, Caucasian reference equations (mid-age).
    const ethFactor = eth === 'afr' ? 0.88 : eth === 'nas' ? 0.94 : eth === 'sas' ? 0.92 : eth === 'oth' ? 0.94 : 1.0;

    const fev1Pred = male
      ? (-0.5 + 0.0000439 * h * h - 0.0247 * age) * ethFactor
      : (-0.32 + 0.0000347 * h * h - 0.0227 * age) * ethFactor;
    const fvcPred = male
      ? (-0.65 + 0.0000563 * h * h - 0.0288 * age) * ethFactor
      : (-0.45 + 0.0000424 * h * h - 0.0247 * age) * ethFactor;

    const fev1Pct = fev1Pred > 0 ? (fev1 / fev1Pred) * 100 : 0;
    const fvcPct = fvcPred > 0 ? (fvc / fvcPred) * 100 : 0;
    const ratio = fvc > 0 ? fev1 / fvc : 0;

    // Z-score приближение: (измеренное - предсказанное) / (0.10 * предсказанное)
    const fev1Z = fev1Pred > 0 ? (fev1 - fev1Pred) / (fev1Pred * 0.12) : 0;

    let interp = '';
    let color = '#10B981';
    if (fev1Z < -1.645 && ratio < 0.7) {
      interp = 'Обструктивный паттерн (ОФВ₁/ФЖЕЛ < 0.7, ОФВ₁ < LLN). Рассмотрите ХОБЛ / астму.';
      color = '#EF4444';
    } else if (fev1Z < -1.645 && ratio >= 0.7) {
      interp = 'Возможный рестриктивный паттерн (ОФВ₁ < LLN, соотношение норма). Нужен TLC.';
      color = '#F59E0B';
    } else if (fev1Z >= -1.645 && fev1Z < -1.0) {
      interp = 'Нижняя граница нормы. Наблюдение, повтор через 6-12 мес.';
      color = '#F59E0B';
    } else {
      interp = 'Спирометрия в пределах нормы (z-score ≥ -1.645).';
      color = '#10B981';
    }

    return {
      value: fev1Pct.toFixed(0) + ' %',
      unit: 'предсказ.',
      interpretation: interp,
      color,
      details: `ОФВ₁ ${fev1.toFixed(2)} л (${fev1Pct.toFixed(0)} % от предсказ. ${fev1Pred.toFixed(2)} л); ФЖЕЛ ${fvc.toFixed(2)} л (${fvcPct.toFixed(0)} %); ОФВ₁/ФЖЕЛ = ${ratio.toFixed(2)}; z-score ОФВ₁ ≈ ${fev1Z.toFixed(2)}.`,
      actions: [
        ratio < 0.7 ? 'Пост-бронходилататорный тест (сальбутамол 400 мкг, повтор через 15 мин)' : 'Исключить рестрикцию: бодиплетизмография, DLCO',
        'Сравните z-score с LLN (-1.645 = 5-й перцентиль)',
        'Клиническая корреляция: mMRC, CAT, курение pack-years',
      ],
      caveats: [
        'Упрощённая аппроксимация GLI-2012; для точных z-score используйте официальный калькулятор ERS',
        'Нужны контроль качества спирометрии (ATS/ERS 2019: ≥ 3 приемлемых манёвра)',
        'Этническая поправка обязательна — без неё систематическая ошибка до 15 %',
        'LLN (5-й перцентиль) предпочтительнее фиксированного 80 % от предсказанного',
      ],
      scale: {
        segments: [
          { min: -5, max: -2.5, label: '< -2.5 тяж.', color: '#DC2626' },
          { min: -2.5, max: -1.645, label: '-2.5…-1.65', color: '#EF4444' },
          { min: -1.645, max: -1, label: '-1.65…-1.0', color: '#F59E0B' },
          { min: -1, max: 2, label: 'норма', color: '#10B981' },
        ],
        current: Math.max(-5, Math.min(2, fev1Z)),
        unit: 'z',
      },
      related: [
        { id: 'gold', title: 'GOLD ABE' },
        { id: 'mmrc', title: 'mMRC' },
        { id: 'act', title: 'ACT' },
      ],
      relatedCourses: [
        { id: '301.2', title: 'Пульмонология' },
      ],
    };
  },
  reference: 'Quanjer PH et al. GLI-2012 multi-ethnic reference equations. Eur Respir J 2012;40:1324-43.',
  countries: 'Международный (ATS/ERS)',
  presets: [
    { label: '♂ 45 лет, 178 см', values: { sex: 'm', age: 45, height: 178, ethnicity: 'cauc', fev1: 3.6, fvc: 4.6 } },
    { label: '♀ 65 лет, 160 см (ХОБЛ)', values: { sex: 'f', age: 65, height: 160, ethnicity: 'cauc', fev1: 1.3, fvc: 2.4 } },
    { label: '♂ 30 лет, афр., 180 см', values: { sex: 'm', age: 30, height: 180, ethnicity: 'afr', fev1: 3.8, fvc: 4.7 } },
  ],
  info: `### Для чего используется
**GLI-2012 (Global Lung Function Initiative)** — мультиэтнические референсные уравнения для спирометрии (ОФВ₁, ФЖЕЛ, ОФВ₁/ФЖЕЛ, ФЕФ25-75), рекомендованные **ATS/ERS 2019** как глобальный стандарт интерпретации.

### Ключевые показатели
| Показатель | Норма |
|---|---|
| z-score ≥ -1.645 | В пределах нормы (> 5-й перцентиль) |
| z-score -1.645 … -2 | Лёгкое снижение |
| z-score < -2 | Умеренное/тяжёлое снижение |
| ОФВ₁/ФЖЕЛ < LLN | Обструкция |
| ОФВ₁/ФЖЕЛ ≥ LLN + ОФВ₁ < LLN | Подозрение на рестрикцию |

### LLN vs 80 %
Фиксированный порог 80 % от предсказанного **завышает** частоту «патологии» у пожилых и **недооценивает** у молодых. LLN (5-й перцентиль / z -1.645) — предпочтительнее.

### Ограничения
- Упрощённая формула в калькуляторе; для официальных z-score используйте GLI desktop software или онлайн-калькулятор ERS
- Качество манёвра должно соответствовать ATS/ERS 2019 (приемлемость, повторяемость)
- Этническая поправка критична

### Источник
Quanjer PH et al. Eur Respir J 2012;40:1324-43. ATS/ERS Technical Statement 2019.`,
};

export default runner;
