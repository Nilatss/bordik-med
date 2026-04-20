// @ts-nocheck
/** Runner: tccc - TCCC Tactical Combat Casualty Care (CoTCCC/JTS 2023) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'phase',
      label: 'Фаза TCCC',
      type: 'select',
      options: [
        { value: 'cuf', label: 'Care Under Fire (CUF) - помощь под огнём' },
        { value: 'tfc', label: 'Tactical Field Care (TFC) - тактическая полевая помощь' },
        { value: 'tacevac', label: 'TACEVAC - эвакуация с повышением уровня помощи' },
      ],
    },
  ],
  compute: (v) => {
    const phase = String(v.phase);
    const map: Record<string, { title: string; color: string; details: string; actions: string[]; caveats: string[] }> = {
      cuf: {
        title: 'Care Under Fire',
        color: '#991B1B',
        details: 'Фаза активного огневого контакта. Приоритет - подавление противника и перемещение в укрытие. Только жизнеспасающая помощь: жгут на конечность при массивном наружном кровотечении. Раненый помогает себе сам, если может.',
        actions: [
          'Подавить огонь противника (fire superiority)',
          'Переместить раненого в укрытие, если возможно',
          'CAT tourniquet (Combat Application Tourniquet) high-and-tight при массивном кровотечении конечности - поверх одежды',
          'Раненый с ОМП (inhalation injury) - в маску',
          'Не вскрывать дыхательные пути, не лечить шок, не начинать IV - это TFC',
          'Боеприпас и оружие раненого - обезопасить',
        ],
        caveats: [
          'В CUF жгут ставится "high and tight" - выше раны, поверх одежды',
          'Задача: "не стать вторым раненым" - tactical care first',
          'Если раненый вне укрытия и нельзя добраться - огневое прикрытие, self-aid',
        ],
      },
      tfc: {
        title: 'Tactical Field Care',
        color: '#F59E0B',
        details: 'Фаза после выхода из прямого огневого контакта. Применяется алгоритм MARCH-PAWS. Расширенная помощь: wound packing, NPA, игольная декомпрессия, IV/IO, TXA, кровь, ketamine, антибиотики.',
        actions: [
          'Разоружить раненого (safety check)',
          'M - Massive hemorrhage: CAT, wound packing (Combat Gauze гемостатическая), junctional tourniquet (JETT, SAM)',
          'A - Airway: NPA (назофарингеальный воздуховод), recovery position, cric при обструкции',
          'R - Respiration: игольная декомпрессия 14 G 10 cm по 4-5 м/р среднеподмышечной или 2 м/р ср.ключичной; Russell chest seal при открытой ране',
          'C - Circulation: reassess tourniquet, IO 1-й линии (sternum FAST1, humerus), TXA 1 г в первые 3 ч, жидкостная ресусцитация с целью radial pulse / систолы 80-90 ("permissive hypotension"), whole blood > plasma > crystalloid',
          'H - Head/Hypothermia: HPMK kit (Hypothermia Prevention Management Kit), шерсть, foil blanket',
          'P - Pain: moderate - мелоксикам 15 мг + парацетамол; severe без шока - OTFC (oral transmucosal fentanyl citrate 800 мкг) или кетамин 20-30 мг IV / 50-100 мг IM',
          'A - Antibiotics: PO moxifloxacin 400 мг ИЛИ IV ertapenem 1 г (при penetrating trauma, ожогах, открытых переломах)',
          'W - Wounds: очистка, повязка',
          'S - Splints / SAM splint',
        ],
        caveats: [
          'Whole blood (Low-Titer O+ или O-) - стандарт золотого часа (JTS 2023)',
          'TXA только в первые 3 ч от травмы',
          'Permissive hypotension - до остановки кровотечения, цель ment. status / radial pulse',
          'NPA безопаснее OPA при угнетении сознания - сохраняет тонус глотки',
        ],
      },
      tacevac: {
        title: 'Tactical Evacuation Care',
        color: '#4B8DF5',
        details: 'Фаза эвакуации (MEDEVAC/CASEVAC). Возможна расширенная помощь: мониторинг, ИВЛ, продвинутое управление дыхательными путями, дополнительная кровь/плазма, вазопрессоры.',
        actions: [
          'Передача по MIST/9-Line на борту',
          'Reassess MARCH: все tourniquet, повязки, декомпрессии',
          'Supraglottic airway (iGel) или RSI + ETT (при опыте и оборудовании)',
          'Монитор: SpO₂, капнография, ECG, NIBP',
          'Whole blood, FFP, RBC по протоколу MTP',
          'Продолжать подогрев, TXA если не введён',
          'Документация: TCCC Casualty Card (DD Form 1380)',
        ],
        caveats: [
          'MEDEVAC (9-Line) - помеченные санитарные воздушные суда',
          'CASEVAC - на любом доступном транспорте (не помечены Красным Крестом)',
          'Enroute care: уровень Role 1 → Role 2 (damage control surgery) → Role 3 (comprehensive)',
        ],
      },
    };
    const r = map[phase] || map.tfc;
    return {
      value: r.title,
      unit: '',
      interpretation: r.details,
      color: r.color,
      details: r.details,
      actions: r.actions,
      caveats: r.caveats,
      related: [
        { id: 'march-paws', title: 'MARCH-PAWS алгоритм' },
        { id: 'tecc', title: 'TECC (civilian)' },
        { id: 'phtls', title: 'PHTLS / ITLS' },
        { id: '9-line', title: '9-Line MEDEVAC / MIST' },
        { id: 'red-blood', title: 'Combat pulse + whole blood' },
        { id: 'mtp', title: 'MTP' },
        { id: 'ru-military', title: 'Российская военная медицина' },
      ],
      relatedCourses: [
        { id: '308.2', title: 'Тактическая медицина' },
        { id: '300.4', title: 'Неотложная помощь' },
      ],
    };
  },
  reference: 'Committee on Tactical Combat Casualty Care (CoTCCC). TCCC Guidelines. Joint Trauma System (JTS). Butler FK, Hagmann J, Butler EG. Tactical combat casualty care in special operations. Mil Med 1996;161(Suppl):3-16. JTS CPG for Damage Control Resuscitation 2023.',
  countries: 'Стандарт NATO / US DoD / СНГ (адаптации)',
  presets: [
    { label: 'CUF - под огнём', values: { phase: 'cuf' } },
    { label: 'TFC - MARCH-PAWS', values: { phase: 'tfc' } },
    { label: 'TACEVAC - эвакуация', values: { phase: 'tacevac' } },
  ],
  info: `### Для чего используется
**TCCC (Tactical Combat Casualty Care)** - стандарт боевой медицины NATO/US DoD. 3 фазы, алгоритм MARCH-PAWS в TFC.

### 3 фазы TCCC
| Фаза | Условия | Приоритет |
|---|---|---|
| **Care Under Fire (CUF)** | Активный огонь | Подавить противника, жгут, укрытие |
| **Tactical Field Care (TFC)** | Нет прямого огня | MARCH-PAWS, расширенная помощь |
| **TACEVAC** | Эвакуация | Enroute care, передача Role 2/3 |

### Care Under Fire (CUF)
1. Return fire / seek cover
2. Tell/tell casualty to fight and self-aid
3. **CAT tourniquet** high-and-tight на конечность при массивном кровотечении
4. Move casualty to cover

### Tactical Field Care (TFC) - MARCH-PAWS
- **M** Massive hemorrhage
- **A** Airway
- **R** Respiration
- **C** Circulation
- **H** Head / Hypothermia
- **P** Pain
- **A** Antibiotics
- **W** Wounds
- **S** Splints

### TACEVAC (эвакуация)
- MEDEVAC - помеченный санитарный транспорт, Красный Крест (защищён по ЖК)
- CASEVAC - любой транспорт
- 9-Line запрос, MIST передача
- Role 1 → Role 2 (damage control) → Role 3 (comprehensive) → Role 4 (definitive)

### Tourniquet
**CAT (Combat Application Tourniquet)** - стандарт. Применение:
1. 2-3 дюйма выше раны (не на сустав)
2. Затянуть до прекращения кровотечения
3. Время наложения записать маркером на лоб / жгут (T: 14:32)
4. Повторная оценка каждый час

### Hemostatic agents
- **Combat Gauze** (QuikClot) - каолин, стандарт
- **Celox Gauze** - хитозан
- **ChitoGauze** - хитозан
Применяются для wound packing + 3 мин давления.

### Chest seal
- **HyFin Vent**, **Russell**, **Asherman** - для открытых ран грудной клетки
- Vented preferred (клапан)

### Needle decompression
- 14 G игла ≥ 8 см (3.25 in)
- 4-5 м/р среднеподмышечная линия (новый стандарт TCCC 2018) ИЛИ 2 м/р среднеключичная
- Успех: выход воздуха + улучшение симптомов

### Источники
Butler FK et al. TCCC guidelines. CoTCCC. Joint Trauma System. Butler FK, Hagmann J. *Mil Med* 1996;161(Suppl). JTS Clinical Practice Guidelines 2023.
`,
};

export default runner;
