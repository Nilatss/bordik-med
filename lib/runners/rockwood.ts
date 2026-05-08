/** Runner: rockwood - Rockwood classification of acromioclavicular joint injuries */
import type { ScoreTool } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 6,
  inputs: [
    {
      id: 'type',
      label: 'Тип Rockwood',
      type: 'select',
      options: [
        { value: '1', label: 'I - растяжение AC-связок, CC-связки интактны', points: 1 },
        { value: '2', label: 'II - разрыв AC, CC растянуты (подвывих <25%)', points: 2 },
        { value: '3', label: 'III - разрыв AC + CC, смещение 25-100%', points: 3 },
        { value: '4', label: 'IV - заднее смещение ключицы в трапецевидную мышцу', points: 4 },
        { value: '5', label: 'V - верхнее смещение >100% (CC-distance в 2-3 раза больше нормы)', points: 5 },
        { value: '6', label: 'VI - нижнее смещение ключицы (под акромион/клювовидный)', points: 6 },
      ],
    },
  ],
  bands: [
    {
      min: 1, max: 2, label: 'Rockwood I', color: '#22C55E',
      description: 'AC sprain. Связки AC и CC интактны, минимальная болезненность.',
      actions: [
        'Покой, лёд, НПВС, слинг 1-2 недели',
        'Ранняя ROM',
        'Возврат к спорту 1-2 недели',
      ],
    },
    {
      min: 2, max: 3, label: 'Rockwood II', color: '#84CC16',
      description: 'Разрыв AC-связок, CC растянуты. Подвывих < 25%.',
      actions: [
        'Консервативно: слинг 2-4 недели + ранняя ROM',
        'Возврат к спорту 4-6 недель',
      ],
    },
    {
      min: 3, max: 4, label: 'Rockwood III', color: '#F59E0B',
      description: 'Полный разрыв AC и CC. Смещение 25-100% (в пределах удвоенного CC-distance).',
      details: 'Тактика остаётся спорной - большинство рекомендаций: консервативное начальное ведение с опцией операции при неуспехе через 3 мес.',
      actions: [
        'Консервативно: слинг, физиотерапия, возврат через 6-12 недель',
        'Операция у спортсменов с тяжёлыми нагрузками или тяжёлым трудом (CC-reconstruction, hook plate)',
        'Повторная оценка через 3 мес - оперировать при persistent pain/dysfunction',
      ],
    },
    {
      min: 4, max: 5, label: 'Rockwood IV', color: '#EF4444',
      description: 'Заднее смещение дистального конца ключицы в трапецевидную мышцу. Палпируется сзади.',
      actions: [
        'Оперативное лечение - open reduction + CC-reconstruction',
        'Обычно не поддаётся закрытой редукции',
      ],
    },
    {
      min: 5, max: 6, label: 'Rockwood V', color: '#EF4444',
      description: 'Верхнее смещение > 100% нормы. Выраженная деформация, «tenting» кожи, угроза перфорации.',
      actions: [
        'Показано оперативное лечение',
        'CC-reconstruction (аутотрансплантат/аллотрансплантат ± dog-bone button)',
        'Hook plate - альтернатива, но требует удаления',
      ],
    },
    {
      min: 6, max: 6, label: 'Rockwood VI', color: '#991B1B',
      description: 'Редчайший тип - нижнее смещение ключицы под акромион или клювовидный отросток. Ассоциирован с повреждением плечевого сплетения.',
      actions: [
        'Осмотр plexus brachialis, аксиллярного нерва',
        'Срочная open reduction + CC-reconstruction',
      ],
    },
  ],
  caveats: [
    'Тип III - зона клинической дискуссии; ISAKOS (2014) рекомендует стратификацию III-A (стабильный) vs III-B (нестабильный) на стресс-рентгенограммах',
    'Bilateral AP view (Zanca view) с 10-15° краниального наклона - стандарт',
    'Weighted / stress views практически не используются современными guidelines',
    'МРТ при III-V для оценки повреждения мышц (trapezius, deltoid), мягких тканей',
    'У детей/подростков - Rockwood редко; чаще псевдодислокации (periosteal sleeve rupture с сохранной periosteum)',
  ],
  related: [
    { id: 'ao-ota', title: 'AO/OTA (clavicle 15)' },
    { id: 'neer', title: 'Neer (проксим. плечевая)' },
  ],
  relatedCourses: [
    { id: '302.2', title: 'Травматология' },
    { id: '300.4', title: 'Неотложная помощь' },
  ],
  reference: 'Rockwood CA. Injuries to the acromioclavicular joint. In: Rockwood CA, Green DP (eds). Fractures in Adults. 2nd ed. Philadelphia: Lippincott, 1984:860-910. ISAKOS Upper Extremity Committee. Consensus statement on the need for augmentation of the Rockwood classification. Knee Surg Sports Traumatol Arthrosc 2014;22:271-8.',
  countries: 'Международный',
  presets: [
    { label: 'AC-sprain после падения (Rockwood I)', values: { type: '1' } },
    { label: 'Спортсмен, Rockwood III', values: { type: '3' } },
    { label: 'Tenting кожи, Rockwood V', values: { type: '5' } },
  ],
  info: `### Для чего используется
**Rockwood (1984)** - классификация повреждений **акромиально-ключичного сустава** (AC joint) на 6 типов. Расширение более ранней Tossy-Allman системы (1963). Определяет тактику между консервативным и оперативным лечением.

### Анатомия
- **AC-связки** (superior, inferior) - стабилизируют горизонтальное смещение
- **CC (coracoclavicular)-связки**: конусовидная (conoid) + трапециевидная (trapezoid) - стабилизируют вертикальное смещение
- **CC-distance в норме**: 11-13 мм

### Типы
| Тип | AC | CC | Смещение | Кожа/мышцы | Лечение |
|---|---|---|---|---|---|
| **I** | Растяжение | Интактны | 0 | Норма | Консерв. |
| **II** | Разрыв | Растяжение | <25% (подвывих) | Норма | Консерв. |
| **III** | Разрыв | Разрыв | 25-100% | Deltotrapezoid fascia интактна | Спорно (консерв. обычно) |
| **IV** | Разрыв | Разрыв | Заднее смещение | В трапецевидную | Оперативное |
| **V** | Разрыв | Разрыв | >100% | Разрыв deltotrapezoid fascia, tenting | Оперативное |
| **VI** | Разрыв | Разрыв | Нижнее (под акромион/клювовидный) | + plexus injury | Оперативное |

### Диагностика
- Bilateral AP clavicle с 10-15° краниального наклона (Zanca view)
- Axillary view - задне-переднее смещение (тип IV!)
- CC-distance измеряют билатерально; удвоение от нормы = тип V
- МРТ при III для оценки deltotrapezoid fascia

### Тактика
| Тип | Рекомендация |
|---|---|
| I, II | Консервативно (слинг 1-4 нед + ROM) |
| III | Консерв. начало + оценка через 3 мес; оператив. у overhead athletes/heavy labor |
| IV, V, VI | Оперативное: CC-reconstruction (auto/allograft) ± dog-bone button, hook plate (временная, удаляется) |

### ISAKOS 2014 стратификация типа III
- III-A: стабильный без overriding на axillary, без scapular dyskinesis → консерв.
- III-B: нестабильный, overriding, scapular dyskinesis → оперативный

### Возврат к активности
- I: 1-2 нед
- II: 4-6 нед
- III (консерв.): 6-12 нед
- Оперативные: 4-6 мес (защита CC-reconstruction)

### Источник
Rockwood CA. In: *Fractures in Adults* (1984). ISAKOS Consensus. *KSSTA* 2014;22:271.
`,
};

export default runner;
