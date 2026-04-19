// @ts-nocheck
/**
 * Runner: cam-icu — Confusion Assessment Method for ICU (Ely 2001)
 */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'f1', label: '1. Острое изменение или флюктуация психического статуса', type: 'checkbox' },
    { id: 'f2', label: '2. Невнимательность (ASE: ошибок >2 из 10 букв «SAVEAHAART»)', type: 'checkbox' },
    { id: 'f3', label: '3. Изменённый уровень сознания (RASS ≠ 0)', type: 'checkbox' },
    { id: 'f4', label: '4. Дезорганизованное мышление (≥2 ошибок в 4 вопросах + команда)', type: 'checkbox' },
  ],
  compute: (v) => {
    const f1 = !!v.f1, f2 = !!v.f2, f3 = !!v.f3, f4 = !!v.f4;
    const positive = f1 && f2 && (f3 || f4);
    if (positive) {
      return {
        value: 'CAM-ICU+',
        interpretation: 'Делирий ПОЗИТИВЕН',
        color: '#EF4444',
        details: 'Пациент соответствует критериям делирия по CAM-ICU. Делирий ассоциирован с +3× смертностью, увеличением ИВЛ-дней, длительной когнитивной дисфункцией.',
        actions: [
          'Искать и устранить причину: боль, гипоксия, инфекция, метаболические нарушения, ЛС (бензодиазепины, антихолинэргики)',
          'Немедикаментозно: ранняя мобилизация, реориентация, сон/бодрствование, слуховые/зрительные пособия',
          'ABCDEF bundle (SCCM): Assess pain, Both SAT/SBT, Choice of analgesia, Delirium, Early mobility, Family',
          'Фармакотерапия — только при выраженной ажитации с угрозой безопасности: дексмедетомидин, галоперидол 0,5–2 мг (избегать бензодиазепинов)',
        ],
        caveats: [
          'Оценивать каждые 8–12 часов',
          'Нельзя оценить, если RASS = −4 или −5 (пациент недоступен)',
          'При RASS ≠ 0 feature 3 автоматически позитивна',
        ],
        related: [
          { id: 'rass', title: 'RASS' }, { id: 'bps-icu', title: 'BPS' },
          { id: 'cam', title: 'CAM (вне ICU)' }, { id: '4at', title: '4AT' },
        ],
        relatedCourses: [
          { id: '300.4', title: 'Интенсивная терапия' },
        ],
      };
    }
    return {
      value: 'CAM-ICU−',
      interpretation: 'Делирий отсутствует',
      color: '#22C55E',
      details: 'Не выполнены критерии делирия. Продолжить мониторинг каждые 8–12 ч, особенно после смены седации или эскалации терапии.',
      actions: [
        'Повторная оценка при каждой смене', 'Профилактика: ABCDEF bundle',
        'Избегать бензодиазепинов, особенно у пожилых',
      ],
      caveats: [
        'Ложноотрицательный результат возможен при гипоактивном делирии',
        'При RASS −4/−5 — оценка невозможна',
      ],
      related: [
        { id: 'rass', title: 'RASS' }, { id: 'cam', title: 'CAM' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Интенсивная терапия' },
      ],
    };
  },
  reference: 'Ely EW et al. JAMA 2001;286:2703–2710.',
  countries: 'Международный (SCCM PADIS 2018)',
  presets: [
    { label: 'Гиперактивный делирий', values: { f1: true, f2: true, f3: true, f4: true } },
    { label: 'Только острое начало', values: { f1: true, f2: false, f3: false, f4: false } },
    { label: 'Спокоен, без делирия', values: { f1: false, f2: false, f3: false, f4: false } },
  ],
  caveats: [
    'Требует предварительной оценки RASS (≥−3)',
    'ASE letters test: «SAVEAHAART» — пациент сжимает руку на каждой букве A',
    'Гипоактивный делирий — самая частая и наиболее пропускаемая форма',
  ],
  info: `### Для чего используется
**CAM-ICU (Ely 2001)** — валидированный диагностический инструмент для делирия у вентилируемых и невербальных пациентов ICU. Золотой стандарт SCCM PADIS 2018.

### Алгоритм
Сначала оцениваем **RASS**. Если RASS = −4/−5 → STOP (пациент недоступен). Если RASS ≥ −3 → CAM-ICU.

### 4 Features
1. **Острое начало или флюктуация** ментального статуса
2. **Невнимательность** — тест ASE «SAVEAHAART» (>2 ошибки)
3. **Изменённый уровень сознания** — RASS ≠ 0
4. **Дезорганизованное мышление** — 4 простых вопроса + команда

### Делирий =  Feature 1 **И** Feature 2 **И** (Feature 3 **ИЛИ** Feature 4)

### Источник
Ely EW, Inouye SK, Bernard GR, et al. Delirium in mechanically ventilated patients: validity and reliability of the CAM-ICU. JAMA 2001;286:2703–10.`,
};

export default runner;
