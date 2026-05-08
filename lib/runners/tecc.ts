/** Runner: tecc - TECC Tactical Emergency Casualty Care (civilian) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'zone',
      label: 'Фаза / зона',
      type: 'select',
      options: [
        { value: 'hot', label: 'Direct Threat Care (Hot zone) - активная угроза' },
        { value: 'warm', label: 'Indirect Threat Care (Warm zone) - непрямая угроза' },
        { value: 'cold', label: 'Evacuation Care (Cold zone) - эвакуация/безопасная' },
      ],
    },
  ],
  compute: (v) => {
    const zone = String(v.zone);
    const map: Record<string, { title: string; c: string; actions: string[]; details: string }> = {
      hot: {
        title: 'Direct Threat Care (Hot zone)',
        c: '#991B1B',
        actions: [
          'Threat mitigation - приоритет безопасности спасателя',
          'Переместить пострадавшего в укрытие или warm zone',
          'Tourniquet для массивного наружного кровотечения - CAT, SWAT-T, RATS (цивильные аналоги)',
          'Self-aid / buddy-aid если пострадавший сознателен',
          'Минимизировать время в hot zone',
        ],
        details: 'Гражданский эквивалент TCCC Care Under Fire. Применяется при активной стрельбе, ножевых нападениях, взрывах, пожарах. Принцип: "good guys first" - безопасность первого помощника.',
      },
      warm: {
        title: 'Indirect Threat Care (Warm zone)',
        c: '#F59E0B',
        actions: [
          'MARCH priorities с гражданским оборудованием',
          'M - tourniquet проверка, wound packing с Combat Gauze / обычными бинтами',
          'A - NPA, recovery position (chin lift/jaw thrust)',
          'R - occlusive dressing при sucking chest wound; needle decompression (если обучен)',
          'C - direct pressure, TXA при доступности, IV при обученности',
          'H - предотвращение гипотермии, TBI',
          'Rapid triage: START (Simple Triage And Rapid Treatment) / SALT',
        ],
        details: 'Warm zone = зона потенциальной/непрямой угрозы (active shooter движется, но не в прямой видимости; вторичное устройство возможно). Помощь возможна, но быстрая, с планом отхода.',
      },
      cold: {
        title: 'Evacuation Care (Cold zone)',
        c: '#4B8DF5',
        actions: [
          'Полная оценка ABC/MARCH',
          'Расширенная помощь: IV доступ, мониторинг, расширенные airway',
          'Передача в EMS/госпиталь',
          'SBAR / MIST handoff',
          'Rewarming, pain management, антибиотики по протоколу',
          'Триаж повторный (состояние меняется)',
        ],
        details: 'Cold zone = безопасная зона (собственно EMS standard of care). Полный протокол ALS.',
      },
    };
    const r = (map[zone] || map.warm)!;
    return {
      value: r.title,
      unit: '',
      interpretation: r.details,
      color: r.c,
      details: r.details,
      actions: r.actions,
      caveats: [
        'TECC разработан Committee for Tactical Emergency Casualty Care (C-TECC) - гражданский аналог CoTCCC',
        'Принципы основаны на TCCC, адаптированы под civilian EMS, SWAT medics, firefighters',
        'Отличия от TCCC: ограничение огнестрельного оружия, больше вариантов оборудования, педиатрия',
        'Bystander / Stop the Bleed - обучение граждан tourniquet + pressure + packing',
      ],
      related: [
        { id: 'tccc', title: 'TCCC' },
        { id: 'march-paws', title: 'MARCH-PAWS' },
        { id: 'phtls', title: 'PHTLS / ITLS' },
        { id: 'start-civ', title: 'START triage' },
        { id: 'sieve-sort', title: 'Triage Sieve/Sort' },
        { id: '9-line', title: '9-Line / MIST' },
      ],
      relatedCourses: [
        { id: '308.2', title: 'Тактическая медицина' },
        { id: '300.4', title: 'Неотложная помощь' },
      ],
    };
  },
  reference: 'Callaway DW, Smith ER, Cain J et al. Tactical Emergency Casualty Care (TECC): guidelines for the provision of prehospital trauma care in high threat environments. J Spec Oper Med 2011;11:104-22. Committee for Tactical Emergency Casualty Care (C-TECC) Guidelines 2022.',
  countries: 'США, Канада, EU, civilian EMS/SWAT',
  presets: [
    { label: 'Hot zone', values: { zone: 'hot' } },
    { label: 'Warm zone', values: { zone: 'warm' } },
    { label: 'Cold zone', values: { zone: 'cold' } },
  ],
  info: `### Для чего используется
**TECC (Tactical Emergency Casualty Care)** - гражданский стандарт тактической медицины. Разработан C-TECC (2011) по аналогии с TCCC, но адаптирован под civilian EMS, SWAT, fire, MCI.

### 3 зоны (вместо 3 фаз TCCC)
| Зона | TCCC-эквивалент | Условия |
|---|---|---|
| **Hot (Direct Threat)** | Care Under Fire | Активная угроза на сцене |
| **Warm (Indirect Threat)** | Tactical Field Care | Потенциальная/непрямая угроза |
| **Cold (Evacuation)** | TACEVAC | Безопасная зона |

### Ключевые отличия TECC vs TCCC
| Параметр | TCCC | TECC |
|---|---|---|
| Оружие | Военное | Ограничено |
| Оборудование | Military-grade | Civilian EMS |
| Педиатрия | Минимум | Полная интеграция |
| Trainees | Combat medics | EMT, paramedic, SWAT, FD |
| Пациенты | Combatants | Все категории |

### MARCH в Warm zone
- **M** - CAT/SWAT-T/RATS tourniquet, Combat Gauze / обычный бинт
- **A** - NPA, recovery position
- **R** - chest seal, needle decompression (paramedic+)
- **C** - direct pressure, TXA (EMS protocol)
- **H** - space blanket, TBI

### Stop the Bleed (US/NAEMT)
Гражданская программа обучения:
1. **A**lert - 911
2. **B**leeding - найти источник
3. **C**ompress - tourniquet, wound packing, direct pressure

### Источники
Callaway DW et al. *J Spec Oper Med* 2011;11:104. C-TECC Guidelines 2022. Jacobs LM et al. Hartford Consensus. Stop the Bleed. *Bull Am Coll Surg* 2013.
`,
};

export default runner;
