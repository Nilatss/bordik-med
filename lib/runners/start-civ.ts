// @ts-nocheck
/** Runner: start-civ — START / JumpSTART / SALT civilian MCI triage */
import type {
  CalculatorTool,
  ToolInput,
  ScoreBand,
  Preset,
  CalculatorResult,
  ResultExtras,
  ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'algo',
      label: 'Алгоритм',
      type: 'select',
      options: [
        { value: 'start', label: 'START (взрослые)' },
        { value: 'jump', label: 'JumpSTART (дети < 8 лет)' },
        { value: 'salt', label: 'SALT (Sort–Assess–LSI)' },
      ],
    },
    { id: 'walks', label: 'Может идти самостоятельно', type: 'checkbox' },
    { id: 'rr', label: 'ЧДД', type: 'number', unit: '/мин', min: 0, max: 80, step: 1, quickValues: [0, 8, 12, 20, 32, 45] },
    { id: 'radial', label: 'Радиальный пульс пальпируется (или CRT < 2 c)', type: 'checkbox' },
    { id: 'obeys', label: 'Выполняет простые команды', type: 'checkbox' },
  ],
  compute: (v) => {
    const algo = String(v.algo || 'start');
    const walks = v.walks === true;
    const rr = Number(v.rr) || 0;
    const radial = v.radial === true;
    const obeys = v.obeys === true;
    let cat = 'GREEN';
    let label = 'Зелёный — Minor (walking wounded)';
    let color = '#22C55E';
    if (algo === 'jump') {
      if (walks) { cat = 'GREEN'; label = 'Зелёный — Minor'; color = '#22C55E'; }
      else if (rr === 0) { cat = 'BLACK'; label = 'Чёрный — Deceased/Expectant (после 5 спасательных вдохов)'; color = '#000000'; }
      else if (rr < 15 || rr > 45) { cat = 'RED'; label = 'Красный — Immediate'; color = '#DC2626'; }
      else if (!radial) { cat = 'RED'; label = 'Красный — Immediate (нет пульса)'; color = '#DC2626'; }
      else if (!obeys) { cat = 'RED'; label = 'Красный — Immediate (AVPU P/U)'; color = '#DC2626'; }
      else { cat = 'YELLOW'; label = 'Жёлтый — Delayed'; color = '#FACC15'; }
    } else if (algo === 'salt') {
      if (walks) { cat = 'GREEN'; label = 'Зелёный — Minor (SALT sort)'; color = '#22C55E'; }
      else if (rr === 0 && !radial) { cat = 'BLACK'; label = 'Чёрный — Dead (нет дыхания после LSI)'; color = '#000000'; }
      else if (!obeys || !radial || rr > 30 || rr < 10) { cat = 'RED'; label = 'Красный — Immediate (SALT)'; color = '#DC2626'; }
      else { cat = 'YELLOW'; label = 'Жёлтый — Delayed'; color = '#FACC15'; }
    } else {
      if (walks) { cat = 'GREEN'; label = 'Зелёный — Minor (walking wounded)'; color = '#22C55E'; }
      else if (rr === 0) { cat = 'BLACK'; label = 'Чёрный — Expectant (апноэ после открытия ДП)'; color = '#000000'; }
      else if (rr > 30 || rr < 10) { cat = 'RED'; label = 'Красный — Immediate (ЧДД)'; color = '#DC2626'; }
      else if (!radial) { cat = 'RED'; label = 'Красный — Immediate (нет радиального пульса)'; color = '#DC2626'; }
      else if (!obeys) { cat = 'RED'; label = 'Красный — Immediate (не выполняет команды)'; color = '#DC2626'; }
      else { cat = 'YELLOW'; label = 'Жёлтый — Delayed'; color = '#FACC15'; }
    }
    const actions: Record<string, string[]> = {
      RED: ['Жизнеспасающие манипуляции: жгут, открыть ДП, декомпрессия', 'Первая волна эвакуации', 'Повторная оценка'],
      YELLOW: ['Стабилен, но требует лечения', 'Вторая волна эвакуации', 'Мониторинг каждые 10–15 мин'],
      GREEN: ['Самостоятельно в сборный пункт', 'Периодическая переоценка', 'Лечение после Immediate/Delayed'],
      BLACK: ['В условиях MCI ресурсы не расходуются', 'Документация времени', 'Переоценка при изменении ресурсов'],
    };
    return {
      value: cat,
      interpretation: label,
      color,
      details: `Алгоритм: ${algo.toUpperCase()}. Классификация в условиях MCI направлена на максимизацию выживаемости.`,
      actions: actions[cat],
      caveats: [
        'Применяется ТОЛЬКО в MCI, не в обычной ER',
        'JumpSTART: 5 спасательных вдохов перед категорией Black',
        'SALT стандарт NDLS США; включает LSI (жгут, ДП, декомпрессия, автоинжектор)',
        'Категория Expectant назначается только при непоколебимом дефиците ресурсов',
      ],
      related: [
        { id: 'sieve-sort', title: 'SIEVE + SORT (UK)' },
        { id: 'mchs-russia', title: 'МЧС РФ 4-цветная' },
        { id: 'stanag', title: 'NATO STANAG 2879' },
        { id: 'start', title: 'START (score-версия)' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Неотложная помощь' },
      ],
    };
  },
  reference: 'Super G et al. START: Simple Triage and Rapid Treatment. Hoag/Newport Beach, 1983. Romig LE. JumpSTART pediatric MCI triage. J Emerg Nurs 2002. Lerner EB et al. SALT Triage. Disaster Med Public Health Prep 2011;5:129–137.',
  countries: 'США · Международный',
  presets: [
    { label: 'Walking wounded', values: { algo: 'start', walks: true, rr: 16, radial: true, obeys: true } },
    { label: 'ЧДД 34, нет пульса (взрослый)', values: { algo: 'start', walks: false, rr: 34, radial: false, obeys: true } },
    { label: 'Ребёнок, апноэ', values: { algo: 'jump', walks: false, rr: 0, radial: false, obeys: false } },
    { label: 'SALT: не выполняет команды', values: { algo: 'salt', walks: false, rr: 22, radial: true, obeys: false } },
  ],
  caveats: [
    'START применяется только в MCI',
    'Для детей < 8 лет используйте JumpSTART',
    'SALT включает LSI до присвоения категории',
  ],
  info: `### Для чего используется
**START / JumpSTART / SALT** — три основных алгоритма первичной сортировки в условиях массового поражения (MCI, civilian).

### START (Super, 1983) — взрослые
Мнемоника **RPM 30-2-CanDo**: Respirations / Perfusion / Mental status.
1. Идёт? → **Зелёный** (Minor)
2. ЧДД > 30 или < 10 → **Красный**; апноэ после ДП → **Чёрный**
3. Нет радиального пульса (или CRT > 2 c) → **Красный**
4. Не выполняет команды → **Красный**
5. Иначе → **Жёлтый**

### JumpSTART (Romig, 2002) — дети < 8 лет
- Апноэ → 5 спасательных вдохов; появилось дыхание → **Красный**, нет → **Чёрный**
- ЧДД < 15 или > 45 → **Красный**
- Перфузия по пульсу
- AVPU: P (неадекватно на боль) или U → **Красный**

### SALT (Lerner, 2011) — NDLS США
1. **Sort** глобально: идёт / машет / не двигается
2. **Assess** индивидуально
3. **Lifesaving interventions**: жгут, открыть ДП, декомпрессия, автоинжектор
4. **Treatment / Transport**

Категории: Immediate · Delayed · Minimal · Expectant · Dead.

### Источники
- Super G et al. *START: Simple Triage and Rapid Treatment.* 1983
- Romig LE. *Pediatric triage. A system to JumpSTART your triage…* J Emerg Nurs 2002
- Lerner EB et al. *Mass casualty triage: SALT.* Disaster Med Public Health Prep 2011;5:129
`,
};

export default runner;
