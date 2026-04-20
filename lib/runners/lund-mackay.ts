// @ts-nocheck
/** Runner: lund-mackay - Lund-Mackay CT score for chronic rhinosinusitis */
import type { CalculatorTool } from '../tools-runners';

const sinusInput = (id: string, label: string) => ({
  id,
  label,
  type: 'select' as const,
  options: [
    { value: '0', label: '0 - чистый', points: 0 },
    { value: '1', label: '1 - частич. затемнение', points: 1 },
    { value: '2', label: '2 - полное затемнение', points: 2 },
  ],
});

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    sinusInput('max_r', 'Верхнечелюстная (правая)'),
    sinusInput('max_l', 'Верхнечелюстная (левая)'),
    sinusInput('ant_r', 'Передние решётчатые (правые)'),
    sinusInput('ant_l', 'Передние решётчатые (левые)'),
    sinusInput('post_r', 'Задние решётчатые (правые)'),
    sinusInput('post_l', 'Задние решётчатые (левые)'),
    sinusInput('sph_r', 'Клиновидная (правая)'),
    sinusInput('sph_l', 'Клиновидная (левая)'),
    sinusInput('fr_r', 'Лобная (правая)'),
    sinusInput('fr_l', 'Лобная (левая)'),
    {
      id: 'omc_r',
      label: 'ОМК (правый) - остиомеатальный комплекс',
      type: 'select',
      options: [
        { value: '0', label: '0 - проходим', points: 0 },
        { value: '2', label: '2 - обструкция', points: 2 },
      ],
    },
    {
      id: 'omc_l',
      label: 'ОМК (левый)',
      type: 'select',
      options: [
        { value: '0', label: '0 - проходим', points: 0 },
        { value: '2', label: '2 - обструкция', points: 2 },
      ],
    },
  ],
  compute: (v) => {
    const ids = ['max_r', 'max_l', 'ant_r', 'ant_l', 'post_r', 'post_l', 'sph_r', 'sph_l', 'fr_r', 'fr_l', 'omc_r', 'omc_l'];
    const total = ids.reduce((sum, id) => sum + (Number(v[id]) || 0), 0);
    const right = (Number(v.max_r) || 0) + (Number(v.ant_r) || 0) + (Number(v.post_r) || 0) + (Number(v.sph_r) || 0) + (Number(v.fr_r) || 0) + (Number(v.omc_r) || 0);
    const left = (Number(v.max_l) || 0) + (Number(v.ant_l) || 0) + (Number(v.post_l) || 0) + (Number(v.sph_l) || 0) + (Number(v.fr_l) || 0) + (Number(v.omc_l) || 0);

    let band = '', color = '#22C55E', details = '';
    if (total < 4) {
      band = 'Минимальная болезнь';
      color = '#22C55E';
      details = `LM ${total}/24 - норма или минимальные изменения. Cutoff ≥ 4 для ХРС (Hopkins 2007).`;
    } else if (total <= 11) {
      band = 'Лёгкая-умеренная';
      color = '#F59E0B';
      details = `LM ${total}/24 - соответствует хроническому риносинуситу лёгкой-умеренной степени.`;
    } else {
      band = 'Выраженная';
      color = '#EF4444';
      details = `LM ${total}/24 - выраженное тотальное вовлечение синусов. Показания к FESS.`;
    }

    return {
      value: String(total),
      unit: '/24',
      interpretation: band,
      color,
      details: `${details} Справа ${right}/12, слева ${left}/12.`,
      actions: [
        'Сопоставить с клиникой (SNOT-22) и эндоскопией (Lund-Kennedy)',
        total >= 4 ? 'Интраназальные ГКС + солевой лаваж - первая линия' : 'Клиническое наблюдение',
        total >= 12 ? 'FESS (функциональная эндоскопическая синус-хирургия)' : '',
        'У пациентов с CRSwNP: рассмотреть biologics (dupilumab)',
        'Оценка анатомических вариантов: Haller cell, Onodi cell, concha bullosa',
        'КТ в режиме костной + мягкотканной реконструкции, коронарный + аксиальный срезы',
      ].filter(Boolean),
      caveats: [
        'LM - радиологический score, не клинический',
        '~ 20-30 % бессимптомных пациентов имеют LM ≥ 4 (не лечить только по КТ)',
        'Cutoff 4 = ХРС (Hopkins 2007, спец. 78 %)',
        'Не различает полипоз, грибковый синусит, мукоцеле - нужна эндоскопия',
        'Альтернативы: Harvard (более детальный), Kennedy (старше)',
      ],
      scale: {
        segments: [
          { min: 0, max: 3, label: 'Норма', color: '#22C55E' },
          { min: 4, max: 11, label: 'Лёгк-умер.', color: '#F59E0B' },
          { min: 12, max: 24, label: 'Выражен.', color: '#EF4444' },
        ],
        current: total,
        unit: 'LM',
      },
      related: [
        { id: 'snot22', title: 'SNOT-22' },
      ],
      relatedCourses: [{ id: '314.3', title: 'Оториноларингология' }],
    };
  },
  reference: 'Lund VJ, Mackay IS. Staging in rhinosinusitis. Rhinology 1993;31:183-4. Hopkins C et al. Rhinology 2007.',
  countries: 'Международный (EPOS / ERS)',
  presets: [
    { label: 'Норма (LM 2)', values: { max_r: '1', max_l: '1', ant_r: '0', ant_l: '0', post_r: '0', post_l: '0', sph_r: '0', sph_l: '0', fr_r: '0', fr_l: '0', omc_r: '0', omc_l: '0' } },
    { label: 'Умеренный ХРС (LM 10)', values: { max_r: '2', max_l: '2', ant_r: '1', ant_l: '1', post_r: '1', post_l: '1', sph_r: '0', sph_l: '0', fr_r: '0', fr_l: '0', omc_r: '2', omc_l: '0' } },
    { label: 'Панрhiносинусит (LM 24)', values: { max_r: '2', max_l: '2', ant_r: '2', ant_l: '2', post_r: '2', post_l: '2', sph_r: '2', sph_l: '2', fr_r: '2', fr_l: '2', omc_r: '2', omc_l: '2' } },
  ],
  info: `### Для чего используется
**Lund-Mackay CT Score (1993)** - стандартизированная КТ-оценка тяжести **хронического риносинусита** и кандидатуры на FESS.

### Оценка
Каждый из 5 парных синусов + ОМК (остиомеатальный комплекс):
- **Синусы**: 0 (чистый), 1 (частичное затемнение), 2 (полное)
- **ОМК**: 0 (проходим) или 2 (обструкция)

**Макс.:** 12 баллов × 2 стороны = **0-24**

### Интерпретация
| LM | Тяжесть |
|---|---|
| 0-3 | Норма / минимум |
| 4-11 | Лёгкая-умеренная ХРС |
| 12-24 | Выраженная (FESS) |

### Cutoff
**LM ≥ 4** (Hopkins 2007) - рентгенологический диагноз ХРС (спец. 78 %, чувств. 87 %).

### Клиническое применение
- Диагностика и стадирование ХРС
- Предоперационное планирование FESS
- Объективная мера в RCT
- Часть EPOS 2020 диагностических критериев (клиника + эндоскопия + КТ)

### Ограничения
- 20-30 % бессимптомных людей имеют LM ≥ 4
- Не различает этиологию (бактериал, грибк., полипоз, муковисцидоз)
- Не заменяет эндоскопию (Lund-Kennedy)

### Источник
Lund VJ, Mackay IS. Rhinology 1993;31:183.`,
};

export default runner;
