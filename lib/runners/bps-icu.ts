// @ts-nocheck
/**
 * Runner: bps-icu - Behavioral Pain Scale (Payen 2001)
 */
import type { ScoreTool, ScoreBand } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 12,
  inputs: [
    {
      id: 'face',
      label: 'Выражение лица',
      type: 'select',
      options: [
        { value: '1', label: 'Расслаблено', points: 1 },
        { value: '2', label: 'Частично напряжено (нахмурено)', points: 2 },
        { value: '3', label: 'Полностью напряжено (зажмурены веки)', points: 3 },
        { value: '4', label: 'Гримаса', points: 4 },
      ],
    },
    {
      id: 'arms',
      label: 'Движения верхних конечностей',
      type: 'select',
      options: [
        { value: '1', label: 'Нет движений', points: 1 },
        { value: '2', label: 'Частично согнуты', points: 2 },
        { value: '3', label: 'Полностью согнуты со сжиманием кулаков', points: 3 },
        { value: '4', label: 'Постоянно втянуты', points: 4 },
      ],
    },
    {
      id: 'vent',
      label: 'Адаптация к ИВЛ',
      type: 'select',
      options: [
        { value: '1', label: 'Переносит движения вентилятора', points: 1 },
        { value: '2', label: 'Кашляет, но в основном переносит', points: 2 },
        { value: '3', label: 'Борется с вентилятором', points: 3 },
        { value: '4', label: 'Невозможно вентилировать', points: 4 },
      ],
    },
  ],
  bands: [
    { min: 3, max: 3, label: '3', color: '#22C55E', description: 'Нет боли.' },
    { min: 4, max: 5, label: '4-5', color: '#84CC16', description: 'Приемлемая анальгезия.' },
    { min: 6, max: 7, label: '6-7', color: '#F59E0B', description: 'Умеренная боль - требуется коррекция анальгезии.' },
    { min: 8, max: 12, label: '8-12', color: '#EF4444', description: 'Выраженная боль - немедленная эскалация анальгезии.' },
  ],
  caveats: [
    'BPS валидирован для седатированных, интубированных ICU-пациентов',
    'Для не интубированных - BPS-NI (адаптация: вокализация вместо ИВЛ)',
    'Оценка каждые 2-4 часа и до/после процедур',
    'Порог > 5 = значимая боль, требует вмешательства',
  ],
  relatedCourses: [
    { id: '300.4', title: 'Интенсивная терапия' },
    { id: '301.1', title: 'Анестезиология' },
  ],
  related: [
    { id: 'cpot', title: 'CPOT' },
    { id: 'rass', title: 'RASS' },
    { id: 'cam-icu', title: 'CAM-ICU' },
    { id: 'flacc', title: 'FLACC (дети)' },
  ],
  reference: 'Payen JF et al. Crit Care Med 2001;29:2258-2263.',
  countries: 'Международный (SCCM PADIS 2018)',
  info: `### Для чего используется
**Behavioral Pain Scale (BPS, Payen 2001)** - оценка боли у седатированных, интубированных ICU-пациентов, которые не могут сообщить о боли самостоятельно. Рекомендована SCCM PADIS 2018 наряду с CPOT.

### 3 домена × 1-4 балла = 3-12
| Домен | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| Лицо | Расслаблено | Напряжено частично | Напряжено полностью | Гримаса |
| Руки | Нет движений | Частично согнуты | Полностью согнуты/кулаки | Постоянно втянуты |
| ИВЛ | Переносит | Кашель | Борется | Невозможно |

### Интерпретация
- **≤ 5** - адекватная анальгезия
- **> 5** - значимая боль → эскалация (опиоиды, регионарная анестезия, NSAID)

### Альтернативы
| Шкала | Особенность |
|---|---|
| **CPOT** | 0-8, валидирована на кардиохирургии |
| **NVPS** | Non-Verbal Pain Scale |
| **ESCID** | Escala de conductas indicadoras de dolor |
| **BPS-NI** | для не интубированных |

### Источник
Payen JF, Bru O, Bosson JL, et al. Assessing pain in critically ill sedated patients by using a behavioral pain scale. Crit Care Med 2001;29:2258-63.`,
};

export default runner;
