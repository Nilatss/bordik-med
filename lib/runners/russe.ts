/** Runner: russe - Russe classification of scaphoid fractures (1960) */
import type { ScoreTool } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 3,
  inputs: [
    {
      id: 'type',
      label: 'Ориентация линии перелома ладьевидной кости',
      type: 'select',
      options: [
        { value: '1', label: 'Horizontal oblique (HO) - наиболее стабильный', points: 1 },
        { value: '2', label: 'Transverse (T) - поперечный', points: 2 },
        { value: '3', label: 'Vertical oblique (VO) - наименее стабильный, высокий риск non-union', points: 3 },
      ],
    },
  ],
  bands: [
    {
      min: 1, max: 1, label: 'Horizontal oblique', color: '#22C55E',
      description: 'Линия почти параллельна суставу. Стабильный, компрессионный.',
      actions: [
        'Гипс (thumb spica) 6-8 нед при waist / distal',
        'КТ / МРТ при сомнительном рентгене через 10-14 дней',
        'Union rate ~90-95% при консервативном',
      ],
    },
    {
      min: 2, max: 2, label: 'Transverse', color: '#84CC16',
      description: 'Поперечная линия. Средняя стабильность.',
      actions: [
        'Non-displaced (< 1 мм) - thumb spica 8-12 нед',
        'Displaced > 1 мм - ORIF (Herbert / Acutrak screw)',
        'Union rate ~85% консервативно, ~95% хирургически',
      ],
    },
    {
      min: 3, max: 3, label: 'Vertical oblique', color: '#EF4444',
      description: 'Линия перпендикулярна оси кости. Высокий сдвиг, риск non-union ~30-50%.',
      actions: [
        'ORIF headless compression screw (Herbert, Acutrak)',
        'Volar percutaneous approach для waist fractures',
        'Dorsal approach для проксимального полюса',
        'Ранняя ROM через 2 нед после ORIF',
      ],
    },
  ],
  caveats: [
    'Russe опирается на рентген, но МРТ / КТ значительно точнее (рентген пропускает 25% переломов)',
    'Herbert (1984) классификация более детальна: A (стабильный, tubercle), B (острый), C (delayed union), D (non-union)',
    'Mayo (по локализации): distal pole, waist, proximal pole - наиболее клинически используемая',
    'Проксимальный полюс - AVN риск 30-100% (кровоснабжение ретроградное от дистального полюса)',
    'Рентген-контроль через 10-14 дней / МРТ при «snuff box» боли - occult fracture',
    'Humpback deformity (DISI) - признак несращения с угловой деформацией',
  ],
  related: [
    { id: 'frykman', title: 'Frykman (дистальный луч)' },
    { id: 'mason-mayo', title: 'Mason (головка луча)' },
    { id: 'ao-ota', title: 'AO/OTA' },
  ],
  relatedCourses: [
    { id: '302.2', title: 'Травматология' },
    { id: '300.4', title: 'Неотложная помощь' },
  ],
  reference: 'Russe O. Fracture of the carpal navicular: diagnosis, non-operative treatment, and operative treatment. J Bone Joint Surg Am 1960;42:759-68. Herbert TJ, Fisher WE. Management of the fractured scaphoid using a new bone screw. J Bone Joint Surg Br 1984;66:114.',
  countries: 'Международный',
  presets: [
    { label: 'Падение на разогнутую руку, линия HO', values: { type: '1' } },
    { label: 'Поперечный несмещённый waist', values: { type: '2' } },
    { label: 'Vertical oblique - сразу ORIF', values: { type: '3' } },
  ],
  info: `### Для чего используется
**Russe (1960)** - классификация **переломов ладьевидной кости** по ориентации линии перелома. Помогает предсказать стабильность и риск несращения (non-union).

### Типы
| Тип | Угол линии к оси кости | Стабильность | Non-union |
|---|---|---|---|
| **Horizontal oblique (HO)** | ~45° от вертикали | Компрессионный, стабильный | 5-10% |
| **Transverse (T)** | 90° (поперечный) | Умеренная | 10-20% |
| **Vertical oblique (VO)** | Параллельно оси | Сдвиговой, нестабильный | 30-50% |

### Дополнительные классификации

**Herbert (1984)** - клинически наиболее используемая:
- **A** - стабильный острый перелом (A1 - tubercle, A2 - waist несмещённый)
- **B** - нестабильный острый (B1 - distal oblique, B2 - displaced waist, B3 - proximal, B4 - fracture-dislocation)
- **C** - delayed union
- **D** - non-union (D1 - fibrous, D2 - sclerotic)

**Mayo (по локализации):**
- Distal pole / tubercle - 10%
- Waist - 70-80% (самая частая)
- Proximal pole - 10-20% (наивысший AVN)

### Кровоснабжение
- Ретроградное от дистальной ветви лучевой артерии (через dorsal ridge)
- Проксимальный полюс зависит от интактного waist - высокий AVN при переломе
- Preiser disease - первичный AVN ладьевидной

### Диагностика
- Рентген снимает 75% (scaphoid views: AP, lateral, obliques, PA ulnar deviation)
- МРТ - золотой стандарт (чувствительность > 95% с 24 ч)
- КТ - для смещения, несращения, планирования ORIF
- Клиника: snuff box tenderness, scaphoid tubercle tenderness, pain with axial loading thumb

### Лечение
| Тип | Лечение | Иммобилизация |
|---|---|---|
| Tubercle (distal) | Thumb spica | 4-6 нед |
| Waist несмещённый | Thumb spica или percutaneous screw | 8-12 нед или 2 нед post-op |
| Waist смещённый > 1 мм | ORIF headless screw | 2 нед post-op |
| Proximal pole | ORIF обязательно | 6-8 нед защита |
| Non-union | Bone graft + ORIF (Matti-Russe, vascularized graft 1,2-ICSRA) | 12+ нед |

### Факторы риска non-union
- Proximal pole
- Vertical oblique
- Displacement > 1 мм
- Задержка диагноза > 4 нед
- Курение

### Источник
Russe O. *J Bone Joint Surg Am* 1960;42:759. Herbert TJ, Fisher WE. *J Bone Joint Surg Br* 1984;66:114.
`,
};

export default runner;
