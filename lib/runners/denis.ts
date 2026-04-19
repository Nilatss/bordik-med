// @ts-nocheck
/** Runner: denis — Denis three-column classification of thoracolumbar spine injuries (1983) */
import type { ScoreTool } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 4,
  inputs: [
    {
      id: 'mechanism',
      label: 'Механизм / тип повреждения',
      type: 'select',
      options: [
        { value: '1', label: 'Compression — только передняя колонна (стабильный)', points: 1 },
        { value: '2', label: 'Burst — передняя + средняя колонна (стабильный / нестабильный)', points: 2 },
        { value: '3', label: 'Flexion-distraction (Chance) — все 3 колонны в натяжении (нестабильный)', points: 3 },
        { value: '4', label: 'Fracture-dislocation — все 3 колонны + трансляция (нестабильный)', points: 4 },
      ],
    },
  ],
  bands: [
    {
      min: 1, max: 1, label: 'Compression', color: '#22C55E',
      description: 'Повреждение только передней колонны. Стабильный.',
      details: 'Аксиальная нагрузка + flexion → клиновидная деформация. Задняя и средняя колонны интактны.',
      actions: [
        'Консервативно: TLSO брейс 8–12 нед',
        'Рентген-контроль через 2, 6, 12 нед',
        'Хирургия при кифозе > 30° или высоте < 50%',
        'Кифопластика при остеопоротических компрессионных переломах со значительной болью',
      ],
    },
    {
      min: 2, max: 2, label: 'Burst', color: '#F59E0B',
      description: 'Передняя + средняя колонна. Стабильный или нестабильный — решается по канальному сужению / PLC.',
      details: 'Аксиальная нагрузка → ретропульсия фрагмента в канал. Типы A–E по Denis.',
      actions: [
        'КТ + МРТ (оценить PLC, интрусию)',
        'Стабильный (без неврол. дефицита, < 50% канала, кифоз < 25°, PLC интактен) — TLSO 12 нед',
        'Нестабильный / неврол. дефицит → задняя инструментация ± декомпрессия (педикулярные винты, 1-2 выше / 1-2 ниже)',
        'При тяжёлой деформации — передний подход (corpectomy + cage) или комбинированный',
      ],
    },
    {
      min: 3, max: 3, label: 'Flexion-distraction (Chance)', color: '#EF4444',
      description: 'Все 3 колонны в натяжении. Нестабильный.',
      details: 'Классически у водителей с lap belt без shoulder harness. Костный или чисто связочный вариант.',
      actions: [
        'Костный (через тело + педикулы) — может консервативно в гипсовом корсете',
        'Связочный / смешанный — хирургия (задняя инструментация + фузия)',
        'ОБЯЗАТЕЛЬНО искать интраабдоминальные повреждения (до 50%: разрыв кишки, брыжейки, pancreas)',
      ],
    },
    {
      min: 4, max: 4, label: 'Fracture-dislocation', color: '#991B1B',
      description: 'Все 3 колонны + трансляция/ротация. Максимально нестабильный.',
      details: 'Три подтипа: flexion-rotation, shear, flexion-distraction variant.',
      actions: [
        'Высокий риск неврологического дефицита (> 75%)',
        'Срочная редукция + задняя инструментация (длинная конструкция)',
        'Декомпрессия (laminectomy / corpectomy) при неврологическом дефиците',
        'Методы: hybrid constructs, иногда 360° реконструкция',
      ],
    },
  ],
  caveats: [
    '3 колонны Denis: передняя (передние 2/3 тела + ALL + передний annulus), средняя (задняя 1/3 тела + PLL + задний annulus), задняя (pedicles, facets, lamina, PLC: supraspinous, interspinous, ligamentum flavum, капсулы)',
    'Повреждение ≥ 2 колонн (особенно средней) → нестабильность',
    'Современные альтернативы: TLICS (Thoracolumbar Injury Classification and Severity), AO Spine TL Classification — более clinically-actionable',
    'Chance fracture + lap belt → активно искать abdominal injury (small bowel, mesentery, pancreas)',
    'МРТ обязательна для оценки PLC (T2 STIR — гиперинтенсивность) и спинного мозга',
    'Остеопоротические компрессионные переломы — отдельная категория (genant grades, vertebroplasty)',
  ],
  related: [
    { id: 'ao-spine', title: 'AO Spine TL' },
    { id: 'slic', title: 'SLIC (шейный)' },
    { id: 'asia', title: 'ASIA' },
  ],
  relatedCourses: [
    { id: '302.2', title: 'Травматология' },
    { id: '200.5', title: 'Нейрохирургия' },
  ],
  reference: 'Denis F. The three column spine and its significance in the classification of acute thoracolumbar spinal injuries. Spine 1983;8:817–31. Denis F. Spinal instability as defined by the three-column spine concept in acute spinal trauma. Clin Orthop 1984;189:65.',
  countries: 'Международный',
  presets: [
    { label: 'Пожилая, остеопоротический компрессионный L1', values: { mechanism: '1' } },
    { label: 'Падение с высоты, L1 burst, без дефицита', values: { mechanism: '2' } },
    { label: 'ДТП с lap belt, Chance T12', values: { mechanism: '3' } },
    { label: 'High-velocity, fracture-dislocation T7-T8, параплегия', values: { mechanism: '4' } },
  ],
  info: `### Для чего используется
**Denis (1983)** — классическая **3-колонная модель стабильности** грудопоясничного отдела позвоночника. Переломы делятся на 4 большие группы.

### 3 колонны
| Колонна | Структуры |
|---|---|
| **Передняя** | Передние 2/3 тела позвонка + ALL + передняя часть annulus |
| **Средняя** | Задняя 1/3 тела + PLL + задний annulus + задняя замыкательная пластинка |
| **Задняя** | Педикулы, суставы, пластины, остистые, PLC (supraspinous, interspinous, ligamentum flavum, facet capsules) |

**Ключевое правило Denis:** нестабильность = повреждение ≥ 2 колонн, **особенно средней**.

### Типы повреждений
| Тип | Колонны | Стабильность |
|---|---|---|
| **Compression** | Передняя | Стабильный |
| **Burst** | Передняя + средняя | Варьирует |
| **Flexion-distraction (Chance)** | Все 3 (в натяжении) | Нестабильный |
| **Fracture-dislocation** | Все 3 + трансляция | Очень нестабильный |

### Подтипы Burst (Denis)
- **A** — через обе замыкательные пластинки
- **B** — через верхнюю замыкательную (наиболее частый)
- **C** — через нижнюю
- **D** — burst + ротация
- **E** — burst + латеральный изгиб

### Современные классификации
- **TLICS (2005)**: 3 компонента — morphology, PLC, neurology; сумма баллов определяет хирургию (≥ 5 = хирургия, ≤ 3 = консервативно)
- **AO Spine TL (2013)**: тип A (компрессия), B (натяжение), C (трансляция) + модификаторы M1/M2, neurology N0-N4

### Хирургические показания (Denis)
- Неврологический дефицит
- Повреждение PLC
- Кифоз > 30°
- Высота тела < 50%
- Канал стеноз > 50%
- Множественные уровни

### Подходы
- **Задний**: педикулярные винты 1–2 выше / 1–2 ниже, опц. decompressive laminectomy
- **Передний**: corpectomy + titanium cage / struct graft при значительной ретропульсии
- **Комбинированный (360°)**: тяжёлая нестабильность

### Chance fracture — всегда ищите
- Перфорация тонкой кишки
- Разрыв брыжейки (hematoma)
- Панкреас injury
- Дуоденальная гематома
→ КТ брюшной полости с контрастом обязательна

### ASIA грейд
- **A** — полное: no motor/sensory below level
- **B** — sensory only preserved
- **C** — motor preserved, < 3/5 in majority
- **D** — motor preserved, ≥ 3/5
- **E** — нормальный

### Источник
Denis F. *Spine* 1983;8:817. Vaccaro AR et al. (TLICS) *Spine* 2005;30:2325.
`,
};

export default runner;
