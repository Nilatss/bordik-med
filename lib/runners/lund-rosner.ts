/** Runner: lund-rosner - Lund vs Rosner vs BTF neurointensive protocols */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'protocol',
      label: 'Протокол',
      type: 'select',
      options: [
        { value: 'lund', label: 'Lund (Grände, 1990s)' },
        { value: 'rosner', label: 'Rosner (CPP-oriented)' },
        { value: 'btf', label: 'BTF 2016 (современный)' },
      ],
    },
  ],
  compute: (v) => {
    const p = String(v.protocol || 'btf');
    let title = '', details = '', color = '#3B82F6';
    const actions: string[] = [];

    if (p === 'lund') {
      title = 'Lund concept (Grände, Lund Univ.)';
      color = '#3B82F6';
      details = 'Подход через снижение мозгового метаболизма и сохранение коллоидно-осмотического давления. Цель - уменьшить капиллярный ультрафильтрат и отёк. Допускается CPP ≥50, вазопрессоры минимальны, ограничение жидкости, альбумин, β-блокада, низкие дозы тиопентала.';
      actions.push('CPP ≥50 (допустимо), не стремиться к 70', 'Рестрикция кристаллоидов', 'Альбумин 20% для поддержания онкотического давления', 'β-блокада (метопролол) + α₂-агонисты (клонидин)', 'Избегать норэпинефрина', 'Тиопентал при рефрактерной ВЧГ');
    } else if (p === 'rosner') {
      title = 'Rosner concept (vasodilatatory cascade)';
      color = '#F59E0B';
      details = 'Агрессивная поддержка MAP для достижения CPP ≥70 - блокирует "вазодилататорный каскад" (снижение CPP → вазодилатация → ↑ICP). Исторический подход; избыточно высокий CPP ассоциирован с ARDS (ARTI).';
      actions.push('CPP ≥70, если нужно - до 80', 'Объёмное расширение + вазопрессоры (норэпинефрин)', 'MAP увеличивать до падения ICP', 'Мониторинг баланса; риск ARDS/перегрузки');
    } else {
      title = 'BTF 2016 (4th edition, Carney et al.)';
      color = '#22C55E';
      details = 'Современный консенсус - CPP 60-70 индивидуализированно. Избегать <50 (ишемия) и >90 (ARDS). Индивидуализация через PRx (CPP-opt). ICP <22, седация, осмотерапия по показаниям (3% NaCl предпочтительнее маннитола). Декомпрессионная краниоэктомия при рефрактерной ВЧГ.';
      actions.push('CPP 60-70 (индивидуально через PRx)', 'ICP <22 как триггер для эскалации', '3% NaCl (осмоляльность цель 320)', 'Head-of-bed 30°, нормокапния 35-40', 'Температура 36 (избегать гипертермии)', 'Декомпрессия при неподдающейся ВЧГ (RESCUEicp 2016)');
    }

    return {
      value: title,
      unit: '',
      interpretation: title,
      color,
      details,
      actions,
      caveats: [
        'Lund - сильнее при отёке, слабее при ишемии',
        'Rosner - больше ARDS, больше перегрузка',
        'BTF - золотой стандарт сейчас',
        'Ни один RCT напрямую не сравнил все три на современной популяции',
      ],
      related: [
        { id: 'cpp', title: 'CPP' },
        { id: 'rap-prx', title: 'PRx / RAP' },
        { id: 'gcs', title: 'GCS' },
        { id: 'four', title: 'FOUR' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Интенсивная терапия' },
        { id: '301.5', title: 'Нейроанестезиология' },
      ],
    };
  },
  reference: 'Brain Trauma Foundation 2016 (4th ed.); Grände PO, Intensive Care Med 2006 (Lund); Rosner MJ, J Neurosurg 1995.',
  countries: 'Международный',
  presets: [
    { label: 'Lund', values: { protocol: 'lund' } },
    { label: 'Rosner', values: { protocol: 'rosner' } },
    { label: 'BTF 2016', values: { protocol: 'btf' } },
  ],
  caveats: [
    'Современная практика - BTF 2016 + индивидуальный CPP-opt по PRx',
  ],
  info: `### Для чего используется
Сравнение трёх исторических концепций нейроинтенсивной терапии при ЧМТ. В практике 2020-х - BTF 2016 с индивидуализацией по PRx (Aries 2012).

### Lund concept (Grände, 1990s)
**Идея:** снизить мозговой метаболизм и предотвратить капиллярный ультрафильтрат.
- CPP ≥50 (допустимо)
- Рестрикция жидкостей, альбумин для КОД
- β-блокада, α₂-агонисты
- Избегать вазопрессоров
- Тиопентал при рефрактерной ВЧГ

### Rosner concept (1990s)
**Идея:** блокировать "вазодилататорный каскад" высоким CPP.
- CPP ≥70 (до 80)
- Вазопрессоры + объём
- Агрессивное повышение MAP
- Риск: ARDS, перегрузка, TRALI

### BTF 2016 (современный стандарт)
| Параметр | Цель |
|---|---|
| CPP | 60-70 (индив. через PRx) |
| ICP | <22 |
| PaCO₂ | 35-40 |
| Na | 145-150 |
| T | ≤37 |
| Осмотерапия | 3% NaCl предпочт. |
| Декомпрессия | RESCUEicp 2016 - при ICP >25 >1-12 ч на макс. медикаментозной |

### Ключевое сравнение
| Параметр | Lund | Rosner | BTF 2016 |
|---|---|---|---|
| Цель CPP | ≥50 | ≥70 | 60-70 |
| Жидкости | рестрикция | liberal | нейтральный баланс |
| Вазопрессоры | избегать | активно | по необходимости |
| Альбумин | да | нет | нет (SAFE-TBI) |
| Риск ARDS | низкий | высокий | умеренный |`,
};

export default runner;
