// @ts-nocheck
/** Runner: meniere - Meniere's disease diagnostic criteria (Barany 2015) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'attacks',
      label: 'Количество эпизодов спонтанного вертиго ≥ 20 мин',
      type: 'number',
      min: 0,
      max: 100,
      step: 1,
      quickValues: [0, 2, 5, 10],
    },
    {
      id: 'duration',
      label: 'Длительность эпизодов',
      type: 'select',
      options: [
        { value: '0', label: '< 20 минут', points: 0 },
        { value: '1', label: '20 мин - 12 часов', points: 1 },
        { value: '2', label: '> 12 часов', points: 2 },
      ],
    },
    {
      id: 'audiometry',
      label: 'Аудиометрически подтверждённая низко-/среднечастотная СНТ',
      type: 'select',
      options: [
        { value: '0', label: 'Нет / не документ.', points: 0 },
        { value: '1', label: 'Флюктуирующая СНТ без чёткой LF', points: 1 },
        { value: '2', label: 'Да: LF/MF СНТ, документ. в ≥1 эпизоде', points: 2 },
      ],
    },
    {
      id: 'aural',
      label: 'Флюктуирующие слуховые симптомы (тиннитус/заложенность/снижение слуха) в поражённом ухе',
      type: 'select',
      options: [
        { value: '0', label: 'Нет', points: 0 },
        { value: '1', label: 'Есть', points: 1 },
      ],
    },
    {
      id: 'exclusion',
      label: 'Исключены другие причины (вест. мигрень, шваннома, BPPV, TIA)',
      type: 'select',
      options: [
        { value: '0', label: 'Нет, не обследован', points: 0 },
        { value: '1', label: 'Да, исключены', points: 1 },
      ],
    },
  ],
  compute: (v) => {
    const attacks = Number(v.attacks) || 0;
    const dur = Number(v.duration) || 0;
    const audio = Number(v.audiometry) || 0;
    const aural = Number(v.aural) || 0;
    const excl = Number(v.exclusion) || 0;

    // Barany Society / AAO-HNS 2015 criteria
    // Definite:
    //   A. ≥2 episodes spontaneous vertigo each 20min-12h
    //   B. Audiometrically documented LF/MF SNHL before/during/after episode in affected ear on ≥1 occasion
    //   C. Fluctuating aural symptoms in affected ear
    //   D. Not better accounted for by another vestibular diagnosis
    // Probable: ≥2 episodes vertigo/dizziness 20min-24h + fluctuating aural symptoms + not better explained

    const A = attacks >= 2 && dur === 1;
    const A_probable = attacks >= 2 && dur >= 1; // up to 24h allowed for probable
    const B = audio >= 2;
    const C = aural >= 1;
    const D = excl === 1;

    let diagnosis = '';
    let color = '#64748B';
    let details = '';

    if (A && B && C && D) {
      diagnosis = 'Достоверная (Definite) МБ';
      color = '#EF4444';
      details = 'Соответствует всем 4 критериям Barany 2015 для достоверной болезни Меньера.';
    } else if (A_probable && C && D) {
      diagnosis = 'Вероятная (Probable) МБ';
      color = '#F59E0B';
      details = 'Соответствует критериям вероятной болезни Меньера: эпизоды 20 мин-24 ч + слуховые симптомы + исключены альтернативы.';
    } else {
      diagnosis = 'Критерии не выполнены';
      color = '#64748B';
      const missing = [];
      if (!A_probable) missing.push('≥2 эпизодов вертиго 20мин-24ч');
      if (!B && !C) missing.push('слуховые симптомы');
      if (!D) missing.push('исключение альтернатив');
      details = `Не соответствует критериям МБ. Не хватает: ${missing.join(', ')}.`;
    }

    return {
      value: diagnosis,
      interpretation: details,
      color,
      details,
      actions: [
        'Низкосолевая диета (< 2 г Na/день), ограничение кофе/алкоголя',
        'Диуретики (гидрохлоротиазид 25 мг, триамтерен) - 1-я линия',
        'Бетагистин 48 мг/сут (в EU/РФ, в США не одобрен)',
        'Интратимпанальные инъекции: гентамицин (хим. абляция) или дексаметазон',
        'При некупируемых симптомах: эндолимфатический шунт, лабиринтэктомия, neurectomy',
        'Слуховой аппарат при прогрессирующей СНТ',
        'Вестибулярная реабилитация между атаками',
      ],
      caveats: [
        'Barany Society / AAO-HNS 2015 - актуальные критерии',
        'Дифф. с вест. мигренью (главный дифф.диагноз), BPPV, TIA, acoustic neuroma, аутоиммунное внутр. ухо',
        'МРТ с контрастом + аудиометрия - обязательны',
        'Hearing loss обычно начинается с LF/MF (низких-средних частот)',
        'Stages (AAO-HNS 1995): I <25dB, II 26-40, III 41-70, IV >70 dB (PTA4 в worst year)',
        'Tumarkin drop attacks (otolithic crisis) - поздний неспецифичный признак',
      ],
      related: [
        { id: 'dix-hallpike', title: 'Dix-Hallpike' },
        { id: 'dhi', title: 'DHI' },
        { id: 'pta', title: 'PTA' },
      ],
      relatedCourses: [
        { id: '314.3', title: 'Оториноларингология' },
        { id: '310.2', title: 'Неврология' },
      ],
    };
  },
  reference: 'Lopez-Escamez JA et al. Diagnostic criteria for Menière\'s disease. J Vestib Res 2015;25:1-7. (Barany Society / AAO-HNS / EAONO / JSER / KBS).',
  countries: 'Международный (Barany Society / AAO-HNS)',
  presets: [
    { label: 'Definite МБ', values: { attacks: 5, duration: '1', audiometry: '2', aural: '1', exclusion: '1' } },
    { label: 'Probable МБ', values: { attacks: 3, duration: '2', audiometry: '1', aural: '1', exclusion: '1' } },
    { label: 'Не МБ (BPPV?)', values: { attacks: 10, duration: '0', audiometry: '0', aural: '0', exclusion: '0' } },
  ],
  info: `### Для чего используется
Диагностика **болезни Меньера (МБ)** по обновлённым критериям Barany Society / AAO-HNS / EAONO / JSER / KBS 2015.

### Достоверная (Definite) Meniere - все 4 критерия:
1. **A.** ≥2 эпизодов спонтанного вертиго, длительностью **20 мин - 12 часов**
2. **B.** Аудиометрически задокументированная **низко-/среднечастотная СНТ** в поражённом ухе до/во время/после ≥1 эпизода
3. **C.** Флюктуирующие слуховые симптомы в поражённом ухе (шум в ушах, заложенность, снижение слуха)
4. **D.** Не объясняется другим вестибулярным диагнозом

### Вероятная (Probable) Meniere:
1. ≥2 эпизодов вертиго/головокружения **20 мин - 24 часа**
2. Флюктуирующие слуховые симптомы
3. Не объясняется другим диагнозом

### Дифференциальная диагностика
- **Вестибулярная мигрень** (главный дифф.диагноз) - мигренозный анамнез
- **BPPV** - позиционный, < 1 мин
- **Вестибулярная шваннома** - МРТ
- **Autoimmune inner ear disease (AIED)** - прогрессия без эпизодов
- **TIA / инсульт** - неврологические симптомы
- **Perilymph fistula** - триггеры давлением
- **SCD (Superior Canal Dehiscence)** - КТ височной кости

### Стадии AAO-HNS 1995 (по PTA4 в worst year)
| Стадия | PTA4 (dB) |
|---|---|
| I | < 25 |
| II | 26-40 |
| III | 41-70 |
| IV | > 70 |

### Лечение (ступенчатое)
1. **Диета**: низкая соль < 2 г/сут, ограничение кофеина/алкоголя
2. **Диуретики**: HCTZ 25 мг/триамтерен
3. **Бетагистин** 48 мг/сут (EU)
4. **Интратимпанально**: дексаметазон (сохраняет слух) → гентамицин (химабляция)
5. **Хирургия**: эндолимфатический шунт → лабиринтэктомия (при утрате слуха)

### Источник
Lopez-Escamez JA et al. J Vestib Res 2015;25:1.`,
};

export default runner;
