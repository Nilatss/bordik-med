/** Runner: red-blood - Combat Pulse Check + R.E.D. / LTOWB (JTS 2023) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'tool',
      label: 'Инструмент',
      type: 'select',
      options: [
        { value: 'pulse', label: 'Combat Pulse Check - оценка SBP по пульсу' },
        { value: 'red', label: 'R.E.D. / ROLO / LTOWB whole blood doctrine' },
      ],
    },
    {
      id: 'pulse',
      label: 'Найденный пульс',
      type: 'select',
      options: [
        { value: 'radial', label: 'Лучевой (radial) присутствует' },
        { value: 'femoral', label: 'Только бедренный (femoral)' },
        { value: 'carotid', label: 'Только сонный (carotid)' },
        { value: 'none', label: 'Пульс не определяется' },
      ],
    },
  ],
  compute: (v) => {
    const tool = String(v.tool);
    if (tool === 'pulse') {
      const p = String(v.pulse);
      const map: Record<string, { txt: string; sbp: string; c: string }> = {
        radial: { txt: 'Пальпируемый лучевой пульс', sbp: 'SBP ≥ 80 мм рт.ст.', c: '#22C55E' },
        femoral: { txt: 'Только бедренный (нет лучевого)', sbp: 'SBP ≈ 70-80 мм рт.ст.', c: '#F59E0B' },
        carotid: { txt: 'Только сонный (нет бедренного)', sbp: 'SBP ≈ 60-70 мм рт.ст.', c: '#EF4444' },
        none: { txt: 'Пульс отсутствует', sbp: 'Клиническая смерть / PEA', c: '#991B1B' },
      };
      const r = (map[p] || map.radial)!;
      return {
        value: r.sbp,
        unit: '',
        interpretation: `${r.txt}. ${r.sbp}.`,
        color: r.c,
        details: 'Combat Pulse Check (TCCC, PHTLS) - полевой метод оценки перфузии без тонометра. Традиционные пороги (ATLS): radial ≥ 80, femoral ≥ 70, carotid ≥ 60 мм рт.ст. Исследования (Deakin & Low 2000) показали, что истинные пороги ниже: радиальный может пальпироваться при SBP ≥ 70, но принцип иерархии pulse-location сохраняется.',
        actions: [
          'Radial + ясное сознание → permissive hypotension приемлема',
          'Отсутствие radial / только femoral → тяжёлый шок, активная ресусцитация',
          'Только carotid → агония, whole blood + crystalloid + damage control',
          'Нет пульса → начать СЛР + поиск обратимых причин травмы (tension PTX, tamponade, гиповолемия)',
          'Traumatic arrest: bilateral needle decompression + pelvic binder + whole blood + REBOA при наличии',
        ],
        caveats: [
          'Deakin & Low BMJ 2000;321:673 - традиционные пороги переоценивают SBP на 10-20 мм рт.ст.',
          'Гипотермия, вазоконстрикция, аритмии снижают точность',
          'Использовать как ориентир, не вместо NIBP при доступности',
          'Mental status (ясное сознание) - эквивалент radial pulse как маркер адекватной перфузии',
        ],
        related: [
          { id: 'shock-index', title: 'Shock Index' },
          { id: 'tccc', title: 'TCCC' },
          { id: 'march-paws', title: 'MARCH-PAWS' },
          { id: 'phtls', title: 'PHTLS' },
          { id: 'mtp', title: 'MTP' },
          { id: 'abc-tash', title: 'ABC/TASH score' },
        ],
        relatedCourses: [
          { id: '308.2', title: 'Тактическая медицина' },
          { id: '300.4', title: 'Неотложная помощь' },
        ],
      };
    }
    return {
      value: 'R.E.D. / LTOWB',
      unit: '',
      interpretation: 'Remote Damage Control Resuscitation (RDCR) с цельной кровью Low-Titer O+ Whole Blood (LTOWB) - стандарт боевой трансфузии JTS 2023.',
      color: '#991B1B',
      details: 'R.E.D. (Ranger O Low-titer O+) - программа US Army Rangers (2016+). Whole blood доктрина заменила компонентную терапию 1:1:1 в боевых условиях - тёплая свежая цельная кровь содержит функциональные тромбоциты, факторы свёртывания, эритроциты в физиологических соотношениях.',
      actions: [
        'LTOWB (Low-Titer O+ Whole Blood) - первая линия при geometric shock',
        'Показания: systolic < 90, radial pulse отсутствует, активное кровотечение',
        'Titer cutoff: anti-A/anti-B < 256 (предотвращение hemolysis)',
        '500 мл порции, можно 2-4 порции в field setting',
        'ROLO (Ranger O Low-titer O) - buddy transfusion program',
        'Fresh Whole Blood (FWB) - от живого донора, при отсутствии стокированной крови',
        'TXA 1 г IV до/во время трансфузии (в первые 3 ч)',
        'Кальция глюконат 1 г IV после первой единицы (противостоять citrate toxicity)',
        'Минимизировать кристаллоиды (< 1 л)',
      ],
      caveats: [
        'LTOWB > 1:1:1 компоненты > crystalloid по данным USSTRATCOM / PROPPR',
        'JTS CPG DCR 2023: whole blood - первая линия для travma hemorrhage',
        'Civilian adoption - San Antonio STRAC, Mayo, NYC+ programs',
        'Storage: 4 °C, до 35 дней (vs 7 дней для platelets отдельно)',
        'Ratio 1:1:1 (RBC:FFP:Plt) - fallback при отсутствии whole blood',
      ],
      related: [
        { id: 'mtp', title: 'Massive Transfusion Protocol' },
        { id: 'abc-tash', title: 'ABC / TASH' },
        { id: 'shock-index', title: 'Shock Index' },
        { id: 'march-paws', title: 'MARCH-PAWS' },
        { id: 'tccc', title: 'TCCC' },
      ],
      relatedCourses: [
        { id: '308.2', title: 'Тактическая медицина' },
        { id: '300.4', title: 'Неотложная помощь' },
      ],
    };
  },
  reference: 'Deakin CD, Low JL. Accuracy of the Advanced Trauma Life Support guidelines for predicting systolic blood pressure using carotid, femoral, and radial pulses: observational study. BMJ 2000;321(7262):673-4. Joint Trauma System Clinical Practice Guideline: Damage Control Resuscitation. JTS 2023. Spinella PC et al. Whole blood for hemostatic resuscitation of major bleeding. Transfusion 2016;56 Suppl 2:S190.',
  countries: 'US DoD / NATO / постепенная civilian adoption',
  presets: [
    { label: 'Radial pulse', values: { tool: 'pulse', pulse: 'radial' } },
    { label: 'Только femoral', values: { tool: 'pulse', pulse: 'femoral' } },
    { label: 'Только carotid', values: { tool: 'pulse', pulse: 'carotid' } },
    { label: 'R.E.D. LTOWB доктрина', values: { tool: 'red', pulse: 'radial' } },
  ],
  info: `### Для чего используется
**Combat Pulse Check** + **R.E.D./LTOWB whole blood doctrine** - полевые инструменты оценки шока и боевой трансфузии.

### Combat Pulse Check (ATLS традиция)
| Пульс | SBP (классика ATLS) | SBP (Deakin 2000) |
|---|---|---|
| Radial | ≥ 80 | ≥ 70 |
| Femoral | ≥ 70 | ≥ 60 |
| Carotid | ≥ 60 | ≥ 50 |

Deakin & Low (BMJ 2000) показали: классические пороги переоценивают SBP. Но иерархия (radial > femoral > carotid) сохраняется.

### Клиническое применение
| Находка | Интерпретация | Тактика |
|---|---|---|
| Radial + ясное сознание | Адекватная перфузия | Permissive hypotension OK |
| Только femoral | Шок класс III | Whole blood, TXA |
| Только carotid | Тяжёлый шок IV | Aggressive DCR |
| Нет пульса | Arrest | СЛР + 4H/4T |

### R.E.D. (Ranger O Low-titer O+)
Программа 75th Ranger Regiment (2016+). **LTOWB** - Low-Titer O+ Whole Blood, anti-A/anti-B < 256.

### Преимущества Whole Blood
- Тёплая, свежая - функциональные тромбоциты
- Физиологические соотношения факторов
- Один контейнер (logistics)
- Меньше transfusion-related acute lung injury (TRALI) по данным USSTRATCOM

### Damage Control Resuscitation (DCR) принципы
1. **Permissive hypotension** - SBP 80-90 до хирургии (110 при TBI)
2. **Haemostatic resuscitation** - whole blood / 1:1:1 components
3. **Минимизация crystalloid** - < 1 л на догоспитальном
4. **TXA** 1 г в первые 3 ч
5. **Кальций** 1 г после первой единицы крови
6. **Предотвращение гипотермии** - warm blood, HPMK
7. **Damage control surgery** - не definitive, abbreviated laparotomy, packing

### Civilian adoption
- **San Antonio STRAC** - whole blood в city EMS
- **Mayo Clinic** - whole blood в trauma bay
- **NYC HEMS** - air ambulance whole blood
- Расширяется в US/UK/Norway EMS

### Источники
Deakin CD, Low JL. *BMJ* 2000;321:673. JTS CPG DCR 2023. Spinella PC et al. *Transfusion* 2016;56 Suppl 2. Fisher AD et al. Ranger O Low-Titer. *J Trauma Acute Care Surg* 2019;87:S139.
`,
};

export default runner;
