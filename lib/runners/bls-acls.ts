/** Runner: bls-acls - AHA BLS / ACLS / PALS 2020 */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'algo',
      label: 'Алгоритм AHA',
      type: 'select',
      options: [
        { value: 'bls-adult', label: 'Adult BLS (взрослый)' },
        { value: 'bls-peds', label: 'Pediatric BLS (1 мес - пубертат)' },
        { value: 'acls-vfvt', label: 'ACLS - VF / pVT (шокабельный)' },
        { value: 'acls-asy', label: 'ACLS - Asystole / PEA (нешокабельный)' },
        { value: 'post-rosc', label: 'Post-ROSC (после восстановления)' },
      ],
    },
  ],
  compute: (v) => {
    const a = String(v.algo);
    const map: Record<string, { title: string; c: string; details: string; actions: string[]; caveats: string[] }> = {
      'bls-adult': {
        title: 'Adult BLS',
        c: '#EF4444',
        details: 'Взрослый BLS по AHA 2020: проверка реакции → вызов помощи / AED → проверка пульса ≤10 с → СЛР 30:2.',
        actions: [
          'Проверка реакции и дыхания (≤10 с) - scan chest',
          'Активировать EMS + AED / дефибриллятор',
          'Пульс на сонной ≤10 с; при отсутствии - начать компрессии',
          'Компрессии: центр груди, 100-120/мин, глубина 5-6 см, полное расправление',
          'Соотношение 30:2 (1 спасатель), минимизировать паузы',
          'AED как только доступен - следовать голосовым подсказкам',
        ],
        caveats: [
          'Не превышать глубину > 6 см у взрослых (риск повреждения)',
          'Смена компрессоров каждые 2 мин (или при усталости)',
        ],
      },
      'bls-peds': {
        title: 'Pediatric BLS',
        c: '#DC2626',
        details: 'Педиатрический BLS (1 мес - пубертат): два спасателя используют 15:2, глубина ~1/3 переднезаднего размера грудной клетки.',
        actions: [
          '1 спасатель - 30:2; 2 спасателя - 15:2',
          'Компрессии: ~4 см (грудной), ~5 см (ребёнок), 100-120/мин',
          'Пульс: плечевая (грудной) / сонная или бедренная (ребёнок) ≤10 с',
          'ЧСС <60 с признаками гипоперфузии → компрессии',
          'AED с педиатрическими электродами/аттенюатором (<8 лет / <25 кг)',
        ],
        caveats: [
          'Остановка у детей - чаще асфиксическая: вентиляция критична',
          'При 1 спасателе сначала 2 мин СЛР, затем EMS (если не наблюдаемая остановка)',
        ],
      },
      'acls-vfvt': {
        title: 'ACLS - VF / pVT',
        c: '#991B1B',
        details: 'Шокабельные ритмы: фибрилляция желудочков / ЖТ без пульса. Приоритет - ранняя дефибрилляция + качественная СЛР.',
        actions: [
          'Разряд: би­фазный 120-200 Дж (по аппарату), монофазный 360 Дж',
          'СЛР 2 мин немедленно после разряда - не проверять ритм сразу',
          'Эпинефрин 1 мг IV/IO каждые 3-5 мин (после 2-го разряда)',
          'Амиодарон: 300 мг IV/IO болюс → 150 мг повтор (или лидокаин 1-1.5 мг/кг)',
          'Продвинутый airway: SGA или ETT, капнография (EtCO₂ >10, цель >20)',
          'Искать обратимые причины: Hs (hypoxia, hypovolemia, H⁺, hypo/hyperkalemia, hypothermia) и Ts (tension PTX, tamponade, toxins, thrombosis coronary/pulmonary)',
        ],
        caveats: [
          'Минимизировать паузы компрессий - CPP критичен',
          'Вазопрессин больше не рекомендуется (AHA 2015/2020)',
        ],
      },
      'acls-asy': {
        title: 'ACLS - Asystole / PEA',
        c: '#7C2D12',
        details: 'Нешокабельные ритмы. Дефибрилляция НЕ показана. Основа - качественная СЛР, эпинефрин, поиск Hs/Ts.',
        actions: [
          'СЛР 30:2 до установки продвинутого airway, затем непрерывные компрессии + 10 вдохов/мин',
          'Эпинефрин 1 мг IV/IO как можно раньше, повтор каждые 3-5 мин',
          'Искать Hs/Ts и лечить причину (USG-POCUS при PEA)',
          'Подтвердить асистолию в 2 отведениях, проверить контакт электродов / усиление',
          'При подозрении на ТЭЛА - тромболизис (альтеплаза 50 мг)',
        ],
        caveats: [
          'Атропин при асистолии/ПЭА исключён из протокола с 2010',
          'Ранний эпинефрин (<3 мин) улучшает выживаемость при нешокабельных ритмах',
        ],
      },
      'post-rosc': {
        title: 'Post-ROSC Care',
        c: '#4B8DF5',
        details: 'После восстановления спонтанного кровообращения - системный подход: оксигенация, гемодинамика, TTM, коронарография, нейропрогноз.',
        actions: [
          'SpO₂ 92-98%, EtCO₂ 35-45; избегать гипероксии и гипокапнии',
          'SBP ≥90 / MAP ≥65 (норэпинефрин, эпинефрин, допамин)',
          'TTM (Targeted Temperature Management) 32-36 °C × 24 ч',
          'ЭКГ 12 отв.; при STEMI / подозрении на окклюзию - срочная коронарография',
          'Нейропрогноз не ранее 72 ч после ROSC (мультимодальный: клиника, ЭЭГ, СЭП, НСЭ, МРТ)',
          'Гликемия 7.8-10 ммоль/л; профилактика судорог (при наличии)',
        ],
        caveats: [
          'Избегать лихорадки ≥37.7 °C - ухудшает исход',
          'Пассивное охлаждение недостаточно - активные устройства',
        ],
      },
    };
    const r = (map[a] || map['bls-adult'])!;
    return {
      value: r.title,
      unit: '',
      interpretation: r.details,
      color: r.c,
      details: r.details,
      actions: r.actions,
      caveats: r.caveats,
      related: [
        { id: 'erc', title: 'ERC Guidelines 2021/2025' },
        { id: 'ilcor', title: 'ILCOR CoSTR' },
        { id: 'anzcor', title: 'ANZCOR' },
        { id: 'pals', title: 'PALS' },
        { id: 'epals', title: 'EPALS / APLS' },
        { id: 'nrp', title: 'NRP (новорождённые)' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Неотложная помощь' },
        { id: '301.1', title: 'Анестезиология-реаниматология' },
      ],
    };
  },
  reference: 'Panchal AR, Bartos JA, Cabañas JG, et al. Part 3: Adult Basic and Advanced Life Support: 2020 AHA Guidelines for CPR and ECC. Circulation 2020;142(16_suppl_2):S366-S468. Topjian AA et al. Part 4: Pediatric BLS/ACLS 2020.',
  countries: 'AHA (США, Канада, международно)',
  presets: [
    { label: 'Adult BLS', values: { algo: 'bls-adult' } },
    { label: 'Pediatric BLS', values: { algo: 'bls-peds' } },
    { label: 'ACLS - VF/pVT', values: { algo: 'acls-vfvt' } },
    { label: 'ACLS - Asystole/PEA', values: { algo: 'acls-asy' } },
    { label: 'Post-ROSC', values: { algo: 'post-rosc' } },
  ],
  info: `### Для чего используется
**AHA BLS / ACLS / PALS 2020** - стандарт сердечно-лёгочной реанимации American Heart Association. Основа большинства национальных протоколов вне Европы.

### Ключевые параметры высококачественной СЛР
| Параметр | Значение |
|---|---|
| Частота компрессий | 100-120/мин |
| Глубина (взрослые) | 5-6 см |
| Глубина (дети) | ~1/3 AP диаметра |
| Компрессионная фракция (CCF) | ≥60% (цель ≥80%) |
| Полное расправление грудной клетки | 100% |
| Вентиляция через продвинутый airway | 10/мин (1 вдох/6 с) |

### Шокабельные vs нешокабельные ритмы
- **Шокабельные:** VF, pulseless VT → дефибрилляция + эпинефрин + антиаритмик (амиодарон/лидокаин)
- **Нешокабельные:** asystole, PEA → СЛР + эпинефрин + Hs/Ts

### Обратимые причины (Hs / Ts)
**Hs:** Hypoxia · Hypovolemia · H⁺ (ацидоз) · Hypo/Hyperkalemia · Hypothermia
**Ts:** Tension pneumothorax · Tamponade · Toxins · Thrombosis (coronary, pulmonary)

### Post-ROSC
- TTM 32-36 °C × 24 ч
- Коронарография при STEMI
- Нейропрогноз не ранее 72 ч

### Источники
AHA 2020 Guidelines for CPR and ECC. *Circulation* 2020;142(16_suppl_2).
`,
};

export default runner;
