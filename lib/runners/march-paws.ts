// @ts-nocheck
/** Runner: march-paws — MARCH-PAWS алгоритм TFC (TCCC) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'step',
      label: 'Шаг MARCH-PAWS',
      type: 'select',
      options: [
        { value: 'm', label: 'M — Massive hemorrhage (массивное кровотечение)' },
        { value: 'a1', label: 'A — Airway (дыхательные пути)' },
        { value: 'r', label: 'R — Respiration (дыхание)' },
        { value: 'c', label: 'C — Circulation (кровообращение + шок)' },
        { value: 'h', label: 'H — Head / Hypothermia (голова / гипотермия)' },
        { value: 'p', label: 'P — Pain (обезболивание)' },
        { value: 'a2', label: 'A — Antibiotics (антибиотики)' },
        { value: 'w', label: 'W — Wounds (раны)' },
        { value: 's', label: 'S — Splints (шины)' },
      ],
    },
  ],
  compute: (v) => {
    const step = String(v.step);
    const steps: Record<string, { title: string; c: string; actions: string[]; details: string }> = {
      m: {
        title: 'Massive hemorrhage',
        c: '#991B1B',
        actions: [
          'CAT tourniquet на конечность — 2–3 дюйма выше раны, затянуть до прекращения кровотечения',
          'Записать время наложения (T: чч:мм) на жгут или лоб',
          'Wound packing с Combat Gauze (QuikClot) + 3 мин прямого давления',
          'Junctional tourniquet (JETT, SAM Junctional) при паховом/подмышечном кровотечении',
          'Pressure dressing (Israeli bandage, OLAES) после удаления жгута',
          'Reassess каждые 30–60 мин; конверсия жгута → давящая повязка если возможно через < 2 ч',
        ],
        details: 'Смерть от exsanguination — № 1 preventable cause в бою. 50% preventable боевых смертей — extremity hemorrhage.',
      },
      a1: {
        title: 'Airway',
        c: '#F59E0B',
        actions: [
          'Chin-lift / jaw-thrust',
          'NPA (назофарингеальный воздуховод) — предпочтителен у сознательных/полусознательных',
          'Recovery position (lateral)',
          'Cricothyroidotomy при maxillofacial trauma / inhalation / обструкции (Bougie-assisted, Cric-Key)',
          'Supraglottic airway (iGel) в TFC/TACEVAC при опыте',
        ],
        details: 'TCCC не рекомендует OPA в TFC (ненадёжно). NPA > OPA по сохранению тонуса. ETT — только Role 2+ / опытный оператор.',
      },
      r: {
        title: 'Respiration',
        c: '#F59E0B',
        actions: [
          'Игольная декомпрессия 14G × 8 см: 4–5 м/р среднеподмышечной ИЛИ 2 м/р среднеключичной',
          'Vented chest seal (HyFin Vent, Russell) на открытую рану груди',
          'Reassess через 5–10 мин — повторная декомпрессия при возврате симптомов',
          'Burp / lift seal при tension под герметичной повязкой',
          'Finger thoracostomy в Role 1/2 при неэффективной игле',
        ],
        details: 'Напряжённый пневмоторакс — № 2 preventable cause смерти в бою (3–4%).',
      },
      c: {
        title: 'Circulation',
        c: '#EF4444',
        actions: [
          'Reassess tourniquet — корректировать положение/усилие',
          'IO первая линия: sternal (FAST1), humeral head, proximal tibia (EZ-IO)',
          'TXA 1 г в 100 мл физ. р-ра за 10 мин — в первые 3 ч от травмы',
          'Permissive hypotension: SBP 80–90 мм рт.ст. до хирургического контроля',
          'Whole blood (LTOWB O+) 500 мл — стандарт DCR (JTS 2023)',
          'Ratio 1:1:1 при отсутствии whole blood (RBC:FFP:Plt)',
          'Кальция глюконат 1 г IV после первой единицы крови (гипокальциемия citrate-indexed)',
          'Минимизировать кристаллоиды (вредны при травме)',
        ],
        details: 'Whole blood > blood components > colloid > crystalloid (JTS DCR CPG).',
      },
      h: {
        title: 'Head / Hypothermia',
        c: '#4B8DF5',
        actions: [
          'HPMK (Hypothermia Prevention Management Kit) — алюминиевое одеяло + греющий вкладыш',
          'Снять мокрую одежду, изолировать от земли',
          'Warmed IV fluids (если возможно)',
          'TBI: избегать гипоксии (SpO₂ > 90%), гипотензии (SBP > 110), гипервентиляции',
          'Elevate head 30° при проникающей TBI без spinal injury',
        ],
        details: '"Lethal triad": гипотермия + ацидоз + коагулопатия. Гипотермия < 35 °C удваивает mortality при травме.',
      },
      p: {
        title: 'Pain',
        c: '#84CC16',
        actions: [
          'Mild/moderate (способен к бою): меlоксикам 15 мг PO + парацетамол 1 г PO (TCCC Combat Pill Pack)',
          'Moderate/severe без шока: OTFC 800 мкг буккально (Oralet, Actiq)',
          'Severe с шоком/риском шока: Ketamine 20–30 мг IV/IO ИЛИ 50–100 мг IM, повтор q30 мин',
          'Не давать морфин при гипотензии / компрометации дыхания',
          'Мониторинг: ЧДД, SpO₂, уровень сознания',
        ],
        details: 'TCCC предпочитает кетамин — не угнетает дыхание и гемодинамику. Morphine противопоказан при шоке и TBI.',
      },
      a2: {
        title: 'Antibiotics',
        c: '#3B82F6',
        actions: [
          'Показания: penetrating trauma, ожоги > 20%, открытые переломы, ранения живота/груди, crush',
          'Способный глотать: Moxifloxacin 400 мг PO однократно',
          'НЕ способен глотать / проникновение брюшной полости: Ertapenem 1 г IV/IM однократно',
          'Cefoxitin 2 г IV — альтернатива при аллергии',
          'Не откладывать ранее хирургического контроля источника',
        ],
        details: 'Профилактика раневой инфекции и сепсиса на догоспитальном этапе. Эмпирически — широкий спектр.',
      },
      w: {
        title: 'Wounds',
        c: '#9CA3AF',
        actions: [
          'Обработка: удалить грубые загрязнения, промыть физ. р-ром',
          'Повязка: стерильная, по возможности не-адгезивная',
          'Ожоги: сухая стерильная повязка, НЕ влажная в полевых условиях',
          'Глазные травмы: Fox shield, не промывать, не давить',
        ],
        details: 'Оценка полноты — передача в MIST/9-Line.',
      },
      s: {
        title: 'Splints',
        c: '#9CA3AF',
        actions: [
          'SAM splint / vacuum splint при переломах',
          'Иммобилизация выше и ниже сустава',
          'Pelvic binder (SAM Pelvic Sling II) при подозрении на перелом таза — центр над большими вертелами',
          'Spine precautions при подозрении — КПВ (NEXUS/Canadian C-Spine), не рутинно в бою',
        ],
        details: 'TCCC 2018 изменил spine immobilization — не рутинно (задержка эвакуации опаснее, чем spine injury в проникающей травме).',
      },
    };
    const s = steps[step] || steps.m;
    return {
      value: s.title,
      unit: '',
      interpretation: s.details,
      color: s.c,
      details: s.details,
      actions: s.actions,
      caveats: [
        'MARCH-PAWS применяется в TFC (Tactical Field Care), не в CUF',
        'Переоценка после каждого шага — не застревать',
        'Documentation на TCCC Casualty Card (DD 1380)',
      ],
      related: [
        { id: 'tccc', title: 'TCCC 3 фазы' },
        { id: 'tecc', title: 'TECC (civilian)' },
        { id: 'phtls', title: 'PHTLS X-ABCDE' },
        { id: 'red-blood', title: 'Combat pulse + whole blood' },
        { id: '9-line', title: '9-Line MEDEVAC' },
        { id: 'mtp', title: 'MTP' },
      ],
      relatedCourses: [
        { id: '308.2', title: 'Тактическая медицина' },
        { id: '300.4', title: 'Неотложная помощь' },
      ],
    };
  },
  reference: 'Butler FK, Bennett B, Wedmore CS. Tactical Combat Casualty Care in the era of peace operations. Mil Med 2017;182(Suppl 1):1–7. CoTCCC TCCC Guidelines 2023. Joint Trauma System CPGs.',
  countries: 'Стандарт TCCC / NATO / US DoD',
  presets: [
    { label: 'M — Massive hemorrhage', values: { step: 'm' } },
    { label: 'A — Airway', values: { step: 'a1' } },
    { label: 'R — Respiration', values: { step: 'r' } },
    { label: 'C — Circulation', values: { step: 'c' } },
    { label: 'H — Hypothermia', values: { step: 'h' } },
  ],
  info: `### Для чего используется
**MARCH-PAWS** — алгоритм оказания помощи в фазе **Tactical Field Care (TFC)** по стандарту TCCC. Последовательность приоритетов, заменяющая ABCDE в боевой/тактической среде.

### MARCH (первичная)
| Буква | Значение | Основное вмешательство |
|---|---|---|
| **M** | Massive hemorrhage | CAT tourniquet, wound packing + Combat Gauze |
| **A** | Airway | NPA, recovery position, cric |
| **R** | Respiration | Needle decompression, chest seal |
| **C** | Circulation | IO, TXA, whole blood, permissive hypotension |
| **H** | Head/Hypothermia | HPMK, TBI management |

### PAWS (вторичная)
| Буква | Значение | Основное |
|---|---|---|
| **P** | Pain | Кетамин / OTFC / Combat Pill Pack |
| **A** | Antibiotics | Moxifloxacin PO / Ertapenem IV |
| **W** | Wounds | Повязки |
| **S** | Splints | Иммобилизация, pelvic binder |

### Ключевые моменты (JTS 2023)
- **Whole blood** (LTOWB O+) — № 1 по DCR
- **TXA 1 г** в первые 3 ч
- **Permissive hypotension** до хирургического контроля
- **Needle decompression** — 4–5 м/р среднеподмышечная линия (TCCC 2018)
- **Кетамин** — препарат выбора при severe pain + шок/риск шока
- **Morphine** противопоказан при шоке/TBI
- **Spine immobilization** — не рутинно при проникающей травме (TCCC 2018)

### Источники
Butler FK et al. TCCC Guidelines. CoTCCC. *Mil Med* 2017;182(Suppl 1). JTS CPG Damage Control Resuscitation 2023.
`,
};

export default runner;
