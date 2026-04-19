// @ts-nocheck
/** Runner: ao-spine — TLICS (Vaccaro 2005) + AO Spine thoracolumbar (Vaccaro 2013) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'system',
      label: 'Система',
      type: 'select',
      options: [
        { value: 'tlics', label: 'TLICS (Vaccaro 2005) — балльная' },
        { value: 'ao', label: 'AO Spine (Vaccaro 2013) — морфологическая' },
      ],
    },

    // TLICS
    {
      id: 'tlics_morph',
      label: 'TLICS: морфология',
      type: 'select',
      options: [
        { value: '0', label: 'Нет перелома (0)' },
        { value: '1', label: 'Компрессия (1)' },
        { value: '2', label: 'Burst-компрессия (2)' },
        { value: '3', label: 'Трансляция / ротация (3)' },
        { value: '4', label: 'Дистракция (4)' },
      ],
    },
    {
      id: 'tlics_plc',
      label: 'TLICS: задний связочный комплекс (PLC)',
      type: 'select',
      options: [
        { value: '0', label: 'Интактен (0)' },
        { value: '2', label: 'Подозрение / неопределённый (2)' },
        { value: '3', label: 'Разрыв (3)' },
      ],
    },
    {
      id: 'tlics_neuro',
      label: 'TLICS: неврологический статус',
      type: 'select',
      options: [
        { value: '0', label: 'Норма (0)' },
        { value: '1', label: 'Корешковое повреждение (2)' },
        { value: '2', label: 'Полный повреждение спинного мозга (2)' },
        { value: '3', label: 'Неполное повреждение / cauda equina (3)' },
      ],
    },

    // AO Spine
    {
      id: 'ao_type',
      label: 'AO Spine: тип морфологии',
      type: 'select',
      options: [
        { value: 'A0', label: 'A0 — минорные (остистый/поперечный отросток)' },
        { value: 'A1', label: 'A1 — вколоченный wedge' },
        { value: 'A2', label: 'A2 — split (coronal)' },
        { value: 'A3', label: 'A3 — неполный burst' },
        { value: 'A4', label: 'A4 — полный burst (обе замыкательные пластины)' },
        { value: 'B1', label: 'B1 — костный Chance (задняя tension band через кость)' },
        { value: 'B2', label: 'B2 — задняя tension band разрыв (связочный)' },
        { value: 'B3', label: 'B3 — передняя tension band (hyperextension)' },
        { value: 'C', label: 'C — трансляционное повреждение' },
      ],
    },
    {
      id: 'ao_neuro',
      label: 'AO Spine: неврология (N)',
      type: 'select',
      options: [
        { value: 'N0', label: 'N0 — норма' },
        { value: 'N1', label: 'N1 — транзиторный дефицит' },
        { value: 'N2', label: 'N2 — радикулопатия' },
        { value: 'N3', label: 'N3 — неполное повреждение / cauda equina' },
        { value: 'N4', label: 'N4 — полное повреждение спинного мозга' },
        { value: 'NX', label: 'NX — невозможно оценить' },
      ],
    },
    {
      id: 'ao_m1',
      label: 'AO Spine: модификатор M1 — сомнение в PLC (МРТ / клиника)',
      type: 'checkbox',
    },
    {
      id: 'ao_m2',
      label: 'AO Spine: модификатор M2 — сопутствующее заболевание (АС, DISH, остеопороз, ожог)',
      type: 'checkbox',
    },
  ],
  compute: (v) => {
    const system = String(v.system || 'tlics');

    if (system === 'tlics') {
      const morph = Number(v.tlics_morph) || 0;
      const plc = Number(v.tlics_plc) || 0;
      const neuroRaw = Number(v.tlics_neuro) || 0;
      const neuroPts = [0, 2, 2, 3][neuroRaw] ?? 0;
      const total = morph + plc + neuroPts;
      let interpretation = ''; let color = '#22C55E'; let details = ''; let actions: string[] = [];
      if (total <= 3) {
        interpretation = 'Консервативное лечение';
        color = '#22C55E';
        details = 'TLICS ≤ 3 — ортез/брейс, мобилизация по переносимости, контрольные рентгены.';
        actions = ['Thoracolumbar brace (TLSO) 8–12 недель', 'Аналгезия', 'Контроль рентгена 1, 6, 12 нед'];
      } else if (total === 4) {
        interpretation = 'Неопределённая зона — выбор хирурга';
        color = '#F59E0B';
        details = 'TLICS = 4 — клиническое суждение (возраст, комплаенс, форма позвоночника, коморбидность).';
        actions = ['Обсудить с пациентом плюсы/минусы обеих тактик', 'МРТ для оценки PLC обязательна'];
      } else {
        interpretation = 'Оперативное лечение';
        color = '#EF4444';
        details = 'TLICS ≥ 5 — показана стабилизация (чаще задняя pedicle screw ± декомпрессия).';
        actions = ['Хирургическая стабилизация', 'Декомпрессия при неврологическом дефиците', 'МРТ до операции'];
      }
      return {
        value: String(total),
        unit: 'баллов TLICS',
        interpretation,
        color,
        details,
        actions,
        scale: {
          segments: [
            { min: 0, max: 4, label: 'Консерв.', color: '#22C55E' },
            { min: 4, max: 5, label: 'Неопред.', color: '#F59E0B' },
            { min: 5, max: 10, label: 'Операция', color: '#EF4444' },
          ],
          current: total,
          unit: 'TLICS',
        },
        caveats: [
          'TLICS разработан для грудопоясничного отдела (T10–L2 зоны наибольшего биомеханического стресса)',
          'Для шейного отдела — SLIC (Vaccaro 2007)',
          'Не учитывает осевую нагрузку у пожилых (остеопороз)',
          'При спондилите (AS, DISH) минимальная травма может быть нестабильной',
        ],
        related: [
          { id: 'slic', title: 'SLIC (шейный)' },
          { id: 'asia', title: 'ASIA' },
          { id: 'can-cspine', title: 'Canadian C-Spine' },
        ],
        relatedCourses: [
          { id: '302.2', title: 'Травматология' },
          { id: '300.4', title: 'Неотложная помощь' },
        ],
      };
    }

    // AO Spine
    const type = String(v.ao_type || 'A0');
    const neuro = String(v.ao_neuro || 'N0');
    const mods: string[] = [];
    if (v.ao_m1) mods.push('M1');
    if (v.ao_m2) mods.push('M2');
    const code = `${type}/${neuro}${mods.length ? '/' + mods.join(',') : ''}`;
    let interpretation = ''; let color = '#22C55E'; let details = ''; let actions: string[] = [];
    if (type === 'A0' || type === 'A1') {
      interpretation = 'Консервативное лечение (минорные / compression wedge)';
      color = '#22C55E';
      details = 'A0 — процесс отростков, A1 — стабильный wedge без затрагивания posterior wall. PLC интактен.';
      actions = ['TLSO / функциональное лечение', 'Раннее вставание, анальгезия'];
    } else if (type === 'A2' || type === 'A3') {
      interpretation = 'Вариабельно — чаще консерв., хирургия при нестабильности';
      color = '#F59E0B';
      details = 'A2 (split) — редкий, тактика по клинике. A3 (неполный burst) — без PLC повреждения чаще консерв.';
      actions = ['МРТ для оценки PLC', 'Консерв. с контролем рентгена / хирургия при kyphosis > 30°, потеря высоты > 50%'];
    } else if (type === 'A4') {
      interpretation = 'Полный burst — обсудить хирургию';
      color = '#F97316';
      details = 'A4 — обе замыкательные пластины повреждены. Высокий риск прогрессии деформации.';
      actions = ['Короткий segmental posterior fusion', 'Альтернатива: kyphoplasty + посегментная фиксация у пожилых'];
    } else if (type === 'B1' || type === 'B2' || type === 'B3') {
      interpretation = 'НЕСТАБИЛЬНЫЙ — дистракционное повреждение';
      color = '#EF4444';
      details = 'Tension band injury (костный Chance / связочный / hyperextension). Показана стабилизация.';
      actions = ['Задняя стабилизация (pedicle screws)', 'МРТ обязательна', 'Декомпрессия при N3/N4'];
    } else {
      interpretation = 'Трансляция — крайне нестабильный';
      color = '#991B1B';
      details = 'Тип C — полное смещение по оси. Высочайший риск неврологического дефицита.';
      actions = ['Срочная стабилизация', 'ASIA exam, МРТ', 'Multi-level fusion, часто требуется передняя + задняя фиксация'];
    }
    if (neuro === 'N3' || neuro === 'N4') {
      actions.unshift('Срочная декомпрессия при неполном повреждении (N3) в течение 24 ч (STASCIS)');
    }
    return {
      value: code,
      interpretation,
      color,
      details,
      actions,
      caveats: [
        'AO Spine — морфологическая (не балльная), тактика строится на ТИПЕ + N + M',
        'Модификатор M1 — сомнения в целостности PLC, обычно смещает в сторону операции',
        'M2 — сопутствующая патология (AS, DISH, остеопороз, ожог)',
        'Для шейного отдела — отдельная AO Spine subaxial (C0/C1–C7)',
        'TLICS проще в подсчёте; AO Spine точнее в морфологии',
      ],
      related: [
        { id: 'slic', title: 'SLIC (шейный)' },
        { id: 'asia', title: 'ASIA' },
        { id: 'can-cspine', title: 'Canadian C-Spine' },
      ],
      relatedCourses: [
        { id: '302.2', title: 'Травматология' },
        { id: '300.4', title: 'Неотложная помощь' },
      ],
    };
  },
  reference: 'Vaccaro AR et al. A new classification of thoracolumbar injuries: the importance of injury morphology, the integrity of the posterior ligamentous complex, and neurologic status. Spine 2005;30:2325–33. Vaccaro AR et al. AOSpine thoracolumbar spine injury classification system. Eur Spine J 2013;22:2184–201. Vaccaro AR et al. The subaxial cervical spine injury classification system (SLIC). Spine 2007;32:2365–74.',
  countries: 'Международный',
  presets: [
    { label: 'TLICS 2: A1 компрессия, PLC ok, N0', values: { system: 'tlics', tlics_morph: '1', tlics_plc: '0', tlics_neuro: '0' } },
    { label: 'TLICS 7: burst + PLC разрыв + cauda', values: { system: 'tlics', tlics_morph: '2', tlics_plc: '3', tlics_neuro: '3' } },
    { label: 'AO A3/N0', values: { system: 'ao', ao_type: 'A3', ao_neuro: 'N0' } },
    { label: 'AO B2/N3 (Chance ligament + incomplete SCI)', values: { system: 'ao', ao_type: 'B2', ao_neuro: 'N3' } },
    { label: 'AO C/N4 (трансляция + complete SCI)', values: { system: 'ao', ao_type: 'C', ao_neuro: 'N4' } },
  ],
  info: `### Для чего используется
Две дополняющие друг друга классификации повреждений **грудопоясничного отдела позвоночника**.

### TLICS (Vaccaro 2005) — балльная
**TLICS = Morphology + PLC + Neurology**

| Morphology | Баллы |
|---|---|
| Компрессия | 1 |
| Burst | 2 |
| Translation/rotation | 3 |
| Distraction | 4 |

| PLC | Баллы |
|---|---|
| Интактен | 0 |
| Подозрение | 2 |
| Разрыв | 3 |

| Neurology | Баллы |
|---|---|
| Норма | 0 |
| Root injury | 2 |
| Complete SCI | 2 |
| Incomplete SCI / cauda | 3 |

| Итог | Тактика |
|---|---|
| ≤ 3 | Консервативно |
| 4 | Зона выбора (surgeon's preference) |
| ≥ 5 | Операция |

### AO Spine Thoracolumbar (Vaccaro 2013)
**Тип + Neurology + Modifiers**

**Типы:**
- **A** Compression (A0 minor → A4 complete burst)
- **B** Tension band (B1 bony Chance, B2 PLC disruption, B3 hyperextension)
- **C** Translation / rotation (самый нестабильный)

**Neurology (N):**
- N0 норма / N1 транзиторный / N2 radiculopathy / N3 incomplete / N4 complete / NX невозможно оценить

**Modifiers:**
- **M1** — подозрение на повреждение PLC (МРТ indeterminate)
- **M2** — сопутствующая патология (AS, DISH, остеопороз)

### SLIC (Vaccaro 2007) — шейный аналог TLICS
- Morphology: compression 1, burst 2, distraction 3, rotation 4
- DLC (discoligamentous complex): 0/1/2
- Neurology: 0/1/2/3
- ≤ 3 консерв., 4 выбор, ≥ 5 операция

### Источник
Vaccaro AR et al. *Spine* 2005;30:2325. *Eur Spine J* 2013;22:2184. *Spine* 2007;32:2365.
`,
};

export default runner;
