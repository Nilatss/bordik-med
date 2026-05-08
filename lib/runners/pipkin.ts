/** Runner: pipkin - Pipkin classification of femoral head fracture-dislocation (1957) */
import type { ScoreTool } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 4,
  inputs: [
    {
      id: 'type',
      label: 'Тип перелома головки бедра по Pipkin',
      type: 'select',
      options: [
        { value: '1', label: 'I - перелом ниже fovea (каудально от круглой связки)', points: 1 },
        { value: '2', label: 'II - перелом выше fovea (цефалически)', points: 2 },
        { value: '3', label: 'III - тип I или II + перелом шейки бедра', points: 3 },
        { value: '4', label: 'IV - тип I или II + перелом вертлужной впадины', points: 4 },
      ],
    },
  ],
  bands: [
    {
      min: 1, max: 1, label: 'Pipkin I', color: '#84CC16',
      description: 'Перелом каудально от fovea - вне нагружаемой зоны.',
      details: 'Фрагмент обычно небольшой, расположен ниже круглой связки, не влияет на конгруэнтность.',
      actions: [
        'Закрытая репозиция вывиха (при наличии) в течение 6 ч',
        'КТ после редукции для оценки фрагментов',
        'Небольшие фрагменты - консервативно; крупные смещённые - ORIF (Smith-Petersen / Kocher-Langenbeck)',
        'Ранняя частичная нагрузка через 4-6 нед',
      ],
    },
    {
      min: 2, max: 2, label: 'Pipkin II', color: '#F59E0B',
      description: 'Перелом выше fovea - в нагружаемой зоне. Хирургия обычно показана.',
      details: 'Фрагмент в weight-bearing zone, неконгруэнтность приводит к раннему ОА.',
      actions: [
        'Срочная редукция вывиха',
        'ORIF через передний (Smith-Petersen) или хирургический вывих Ganz',
        'Headless compression screws',
        'Частичная нагрузка 6-8 нед',
      ],
    },
    {
      min: 3, max: 3, label: 'Pipkin III', color: '#EF4444',
      description: 'Комбинация с переломом шейки - высокий риск AVN (до 50%).',
      actions: [
        'У молодых: срочная ORIF (шейка + головка) - капсулотомия для декомпрессии',
        'У пожилых: тотальное эндопротезирование (THA) - лучший функциональный исход',
        'Контроль AVN через 6 и 12 мес',
      ],
    },
    {
      min: 4, max: 4, label: 'Pipkin IV', color: '#991B1B',
      description: 'Перелом головки + вертлужной впадины. Сложная реконструкция.',
      actions: [
        'КТ с 3D реконструкцией, Judet views',
        'ORIF acetabulum через Kocher-Langenbeck / ilioinguinal + фиксация головки',
        'У пожилых - total hip arthroplasty',
        'Высокий риск post-traumatic ОА',
      ],
    },
  ],
  caveats: [
    'Все переломы-вывихи головки бедра - срочная редукция в течение 6 ч для снижения AVN',
    'Общий риск AVN: I - 10%, II - 25%, III - 50%, IV - 25-40%',
    'Post-traumatic ОА возникает у 20-30% даже после успешной ORIF',
    'Хирургический вывих по Ganz даёт лучшее обзор, но требует опыта',
    'Brumback и Stewart расширили классификацию, учитывая задние / передние вывихи',
  ],
  related: [
    { id: 'garden', title: 'Garden (шейка бедра)' },
    { id: 'young-burgess', title: 'Young-Burgess (таз)' },
    { id: 'ao-ota', title: 'AO/OTA' },
  ],
  relatedCourses: [
    { id: '302.2', title: 'Травматология' },
    { id: '300.4', title: 'Неотложная помощь' },
  ],
  reference: 'Pipkin G. Treatment of grade IV fracture-dislocation of the hip. J Bone Joint Surg Am 1957;39:1027-42. Brumback RJ et al. J Bone Joint Surg Am 1987;69:1103.',
  countries: 'Международный',
  presets: [
    { label: 'ДТП, задний вывих бедра, мелкий фрагмент ниже fovea', values: { type: '1' } },
    { label: 'Молодой, вывих + крупный фрагмент в нагружаемой зоне', values: { type: '2' } },
    { label: 'Комбинированный перелом шейки и головки', values: { type: '3' } },
    { label: 'Перелом головки + задняя стенка вертлужной впадины', values: { type: '4' } },
  ],
  info: `### Для чего используется
**Pipkin (1957)** - классификация **переломов головки бедренной кости, ассоциированных с задним вывихом тазобедренного сустава**. Определяет хирургическую тактику и прогноз (AVN, post-traumatic ОА).

### Типы
| Тип | Описание | AVN |
|---|---|---|
| **I** | Перелом ниже fovea centralis (вне нагружаемой зоны) | ~10% |
| **II** | Перелом выше fovea (в нагружаемой зоне) | ~25% |
| **III** | I или II + перелом шейки бедра | ~50% |
| **IV** | I или II + перелом вертлужной впадины | 25-40% |

### Fovea centralis
Ямка на головке бедра для прикрепления **ligamentum teres** (круглой связки). Ориентир: фрагмент выше/ниже этой точки определяет попадание в нагружаемую зону.

### Принципы лечения
- **Срочная редукция вывиха** (в течение 6 ч) для минимизации AVN
- Post-reduction **КТ** для оценки фрагментов, incarceration
- Open reduction при: incarcerated fragment, неконгруэнтность, крупный фрагмент в weight-bearing zone

### Доступы
- **Smith-Petersen** (передний) - для Pipkin I/II
- **Kocher-Langenbeck** (задний) - для acetabular (IV)
- **Хирургический вывих по Ganz** - лучший обзор, высокий опыт

### Осложнения
- AVN (см. таблицу)
- Post-traumatic ОА (20-30%)
- Heterotopic ossification (индометацин / радиотерапия)
- Sciatic nerve injury (10% при заднем вывихе)

### Источник
Pipkin G. *J Bone Joint Surg Am* 1957;39:1027.
`,
};

export default runner;
