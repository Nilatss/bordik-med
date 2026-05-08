/** Runner: fast-us - FAST / eFAST ultrasound for trauma */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'ruq', label: 'RUQ (Morison\'s pouch - hepatorenal) - свободная жидкость', type: 'checkbox' },
    { id: 'luq', label: 'LUQ (spleno-renal / перисплен.) - свободная жидкость', type: 'checkbox' },
    { id: 'pelvis', label: 'Suprapubic (pouch of Douglas / retrovesical) - жидкость', type: 'checkbox' },
    { id: 'pericard', label: 'Subxiphoid (pericardial) - выпот в перикарде', type: 'checkbox' },
    { id: 'thoraxL', label: 'eFAST: левый гемиторакс - жидкость/отсутствие lung sliding', type: 'checkbox' },
    { id: 'thoraxR', label: 'eFAST: правый гемиторакс - жидкость/отсутствие lung sliding', type: 'checkbox' },
  ],
  compute: (v) => {
    const positives: string[] = [];
    if (v.ruq) positives.push('RUQ (гепаторенальный карман)');
    if (v.luq) positives.push('LUQ (периспленический)');
    if (v.pelvis) positives.push('Таз (pouch of Douglas)');
    if (v.pericard) positives.push('Перикард');
    if (v.thoraxL) positives.push('Левый гемиторакс');
    if (v.thoraxR) positives.push('Правый гемиторакс');
    const count = positives.length;
    let interpretation = '', color = '#22C55E', details = '';
    let actions: string[] = [];
    if (count === 0) {
      interpretation = 'FAST отрицательный';
      color = '#22C55E';
      details = 'Нет свободной жидкости в 4 стандартных FAST-окнах и отсутствуют признаки пневмо-/гемоторакса. FAST чувствителен ~60-80%, специфичность > 95%. Отрицательный FAST НЕ исключает травму - особенно забрюшинные, диафрагмальные, полые органы.';
      actions = [
        'Повторный FAST через 15-30 мин при изменении гемодинамики',
        'При гемодинамической нестабильности и высокой подозрительности - лапаротомия/torako- или КТ по ATLS',
        'У стабильных - КТ whole-body (pan-scan) при blunt polytrauma',
      ];
    } else {
      if (v.pericard) {
        interpretation = 'Положительный FAST: выпот в перикарде - подозрение на тампонаду';
        color = '#991B1B';
        details = 'Свободная жидкость в перикарде при травме = гемоперикард. При гипотонии/Beck triad - тампонада. Показана экстренная pericardiocentesis или субксифоидальное окно / thoracotomy.';
        actions = [
          'ABC + крупнокалиберный доступ + MTP',
          'Экстренная хирургия: ED thoracotomy при аресте / pericardiocentesis как мост',
          'Активация травма-команды, кардиохирургия',
        ];
      } else if (v.thoraxL || v.thoraxR) {
        interpretation = 'Положительный eFAST: гемо-/пневмоторакс';
        color = '#EF4444';
        details = 'Жидкость в плевральной полости или отсутствие lung sliding (pneumothorax sensitivity УЗИ > CXR). Требует дренирования при клинических проявлениях.';
        actions = [
          'Крупный плевральный дренаж 28-32F при гемотораксе',
          'Finger/needle decompression при tension pneumothorax',
          'CXR/КТ подтверждение после стабилизации',
        ];
      } else {
        interpretation = `Положительный FAST: ${count} окно(-а) с свободной жидкостью`;
        color = '#EF4444';
        details = 'При тупой травме - свободная жидкость = гемоперитонеум до доказательства обратного. У нестабильного пациента - экстренная лапаротомия; у стабильного - КТ для локализации/grading.';
        actions = [
          'Нестабильный (SBP < 90, BD > 5, лактат > 4, FAST+) → операционная, не КТ',
          'Стабильный → КТ brom-to-pelvis с контрастом',
          'MTP при признаках массивной кровопотери (SI > 1,0)',
          'Tranexamic acid 1 г в/в < 3 ч (CRASH-2)',
        ];
      }
    }

    positives.forEach((p) => { /* no-op, kept for clarity */ });

    return {
      value: String(count),
      unit: count === 1 ? 'положительное окно' : 'положительных окон',
      interpretation,
      color,
      details: details + (positives.length ? `\n\nПоложительные окна: ${positives.join(', ')}.` : ''),
      actions,
      caveats: [
        'FAST чувствительность 60-80%, специфичность > 95% для свободной жидкости',
        'НЕ исключает: забрюшинную травму, повреждение полого органа, диафрагмы',
        'Чувствительность растёт с объёмом жидкости: ≥ 200 мл - обнаруживаются надёжно, < 100 мл - пропускаются',
        'У беременных и при асците - ложноположительные',
        'У нестабильного пациента с FAST+ - прямая лапаротомия, НЕ КТ (ATLS)',
        'eFAST для pneumothorax превосходит supine CXR (sens 90-95% vs 50%)',
        'Повторный FAST через 15-30 мин повышает чувствительность',
      ],
      related: [
        { id: 'aast', title: 'AAST Organ Injury Scale' },
        { id: 'iss', title: 'ISS / NISS' },
        { id: 'shock-index', title: 'Shock Index' },
        { id: 'rts', title: 'RTS' },
        { id: 'triss', title: 'TRISS' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Неотложная помощь' },
        { id: '302.2', title: 'Травматология' },
      ],
    };
  },
  reference: 'Rozycki GS et al. Surgeon-performed ultrasound for the assessment of truncal injuries: lessons learned from 1540 patients. Ann Surg 1998;228:557-67. Kirkpatrick AW et al. Hand-held thoracic sonography for detecting post-traumatic pneumothoraces: the Extended Focused Assessment with Sonography for Trauma (EFAST). J Trauma 2004;57:288-95. ATLS 10th ed. American College of Surgeons.',
  countries: 'Международный (ATLS)',
  presets: [
    { label: 'Все окна отрицательные', values: { ruq: false, luq: false, pelvis: false, pericard: false, thoraxL: false, thoraxR: false } },
    { label: 'RUQ + таз - гемоперитонеум', values: { ruq: true, luq: false, pelvis: true, pericard: false, thoraxL: false, thoraxR: false } },
    { label: 'Тампонада перикарда', values: { ruq: false, luq: false, pelvis: false, pericard: true, thoraxL: false, thoraxR: false } },
    { label: 'eFAST: левый гемоторакс + RUQ', values: { ruq: true, luq: false, pelvis: false, pericard: false, thoraxL: true, thoraxR: false } },
  ],
  info: `### Для чего используется
**FAST** (Focused Assessment with Sonography for Trauma, Rozycki 1993) - point-of-care УЗИ при травме для быстрого обнаружения **гемоперитонеума** и **гемоперикарда**. **eFAST** (Kirkpatrick 2004) добавляет оценку плевральных полостей (**гемо-/пневмоторакс**).

### 4 окна FAST
1. **RUQ (Morison's pouch)** - гепаторенальный карман - самое чувствительное окно для гемоперитонеума (≥ 250 мл)
2. **LUQ** - периспленический и субдиафрагмальный (жидкость собирается здесь при спленической травме)
3. **Suprapubic** - ретровезикальный / pouch of Douglas
4. **Subxiphoid** - перикард (гемоперикард, выпот)

### +2 окна eFAST
5. **Левый гемиторакс** - жидкость над диафрагмой + lung sliding
6. **Правый гемиторакс** - то же

### Зонд
- Curvilinear 3,5-5 МГц (брюшная полость) или phased array (torакальные/субкостальные окна)
- Linear 7-10 МГц для pneumothorax (lung sliding, A/B lines, M-mode «seashore» vs «barcode»)

### Диагностические характеристики
| Параметр | Значение |
|---|---|
| Sensitivity (hemoperitoneum) | 60-80% (объём-зависимо) |
| Specificity | > 95% |
| eFAST для pneumothorax | Sens 90-95%, Spec 98% |
| Пороговый объём | ~200 мл для надёжного обнаружения |

### Алгоритм ATLS
1. **Нестабильный + FAST+** → операционная (лапаротомия/торакотомия), НЕ КТ
2. **Нестабильный + FAST−** → искать другие источники шока (таз, длинные кости, внешняя)
3. **Стабильный + FAST+** → КТ brom-to-pelvis (локализация, grading AAST)
4. **Стабильный + FAST−** → КТ по клинике / серийное наблюдение

### Ограничения
- **Пропускает**: забрюшинную травму (поджелудочная, почки, duodenum), повреждение полых органов, диафрагмальные разрывы
- **Ложноположительные**: асцит, овариальная киста, беременность, перитонеальный диализ
- **Оператор-зависимо** (кривая обучения ~25-50 исследований)

### DPL (diagnostic peritoneal lavage)
Исторически - «стандарт» до FAST. Sens 95%, но инвазивно. Сейчас - только в редких случаях, когда FAST/КТ недоступны.

### Источники
Rozycki GS et al. *Ann Surg* 1998;228:557. Kirkpatrick AW et al. *J Trauma* 2004;57:288. ATLS 10th ed. (ACS 2018).
`,
};

export default runner;
