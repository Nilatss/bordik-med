/** Runner: atls - ATLS 10th ed (ACS-COT 2018) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'phase',
      label: 'Этап ATLS',
      type: 'select',
      options: [
        { value: 'primary', label: 'Primary Survey (ABCDE)' },
        { value: 'adjuncts', label: 'Adjuncts to Primary (FAST, monitoring, rx)' },
        { value: 'resuscitation', label: 'Hemorrhagic shock / MTP 1:1:1' },
        { value: 'secondary', label: 'Secondary Survey (AMPLE, head-to-toe)' },
        { value: 'disposition', label: 'Definitive care / transfer' },
      ],
    },
    {
      id: 'sbp',
      hint: 'САД, мм рт.ст. Норма: <130',
      label: 'САД пациента',
      type: 'number',
      unit: 'мм рт.ст.',
      min: 0,
      max: 260,
      step: 1,
      quickValues: [60, 80, 90, 100, 120],
    },
    {
      id: 'hr',
      hint: 'ЧСС, уд/мин. Норма: 60-100',
      label: 'ЧСС',
      type: 'number',
      unit: '/мин',
      min: 0,
      max: 220,
      step: 1,
      quickValues: [80, 100, 120, 140],
    },
  ],
  compute: (v) => {
    const phase = String(v.phase);
    const sbp = Number(v.sbp) || 0;
    const hr = Number(v.hr) || 0;

    // ATLS class of haemorrhage (10th ed table)
    let hClass = 'I';
    let color = '#22C55E';
    if (sbp < 70 || hr >= 140) { hClass = 'IV'; color = '#7C2D12'; }
    else if (sbp < 90 || hr >= 120) { hClass = 'III'; color = '#EF4444'; }
    else if (hr >= 100) { hClass = 'II'; color = '#F59E0B'; }

    const phaseMap: Record<string, { title: string; details: string; actions: string[] }> = {
      primary: {
        title: 'Primary Survey - ABCDE',
        details: 'Первичный осмотр ATLS: выявление и лечение жизнеугрожающих состояний в порядке приоритета A → B → C → D → E.',
        actions: [
          'A - Airway + c-spine protection: голос, обструкция, definitive airway если GCS ≤ 8',
          'B - Breathing: SpO₂, ЧДД, аускультация, исключить tension PTX / open PTX / massive HTX / flail chest',
          'C - Circulation: 2 крупных в/в доступа (14-16G), контроль кровотечения, permissive hypotension SBP 80-90 до остановки кровотечения',
          'D - Disability: GCS, зрачки, латерализация, глюкоза',
          'E - Exposure / environment: полный осмотр, предотвращение гипотермии (warmer, blankets, тёплые растворы)',
        ],
      },
      adjuncts: {
        title: 'Adjuncts to Primary Survey',
        details: 'Дополнения к первичному осмотру: инструментальный минимум немедленно, ещё до вторичного осмотра.',
        actions: [
          'Мониторинг: ЭКГ, SpO₂, EtCO₂, АД, температура, диурез',
          'Катетер мочевого пузыря (если нет травмы уретры), назогастральный зонд (если нет травмы base of skull)',
          'Рентген: грудная клетка AP, таз AP (по показаниям - c-spine)',
          'eFAST: абдоминальные квадранты + перикард + плевральные окна (PTX)',
          'Лабораторно: газы артериальные, лактат, base deficit, группа + Rh + перекрёстная совместимость, β-hCG у женщин',
          'Tranexamic acid 1 г IV < 3 ч от травмы (CRASH-2), затем 1 г × 8 ч',
        ],
      },
      resuscitation: {
        title: 'Hemorrhagic shock - Class ' + hClass,
        details: `Класс геморрагического шока ${hClass} (ATLS 10th ed). SBP ${sbp}, HR ${hr}. Massive transfusion protocol (MTP) 1:1:1 - плазма:тромбоциты:эритроциты.`,
        actions: [
          'Контроль источника: давящая повязка, турникет на конечность, taz-binder при pelvic fracture, REBOA / OR при торсо-геморрагии',
          'Permissive hypotension до остановки кровотечения: SBP 80-90 (не применять при ЧМТ!)',
          'Не давать > 1 л кристаллоидов перед кровью - переходить на MTP',
          'MTP 1:1:1: pRBC : FFP : platelets (или цельная кровь low-titer O)',
          'TXA 1 г IV bolus < 3 ч от травмы, затем 1 г × 8 ч',
          'Ca²⁺ 1 г глюконата после каждых 4 ЕД pRBC (ионизированный Ca > 1.0)',
          'Согревание (Level-1, Belmont), avoid triad: hypothermia / acidosis / coagulopathy',
          'При ЧМТ SBP ≥ 110, MAP ≥ 80',
        ],
      },
      secondary: {
        title: 'Secondary Survey',
        details: 'Полный head-to-toe осмотр + AMPLE анамнез. Начинать только после стабилизации ABCDE.',
        actions: [
          'AMPLE: Allergies · Medications · Past medical history · Last meal · Events',
          'Head-to-toe: голова (раны, battle sign, raccoon eyes, haemotympanum), шея (c-spine), грудь (flail, crepitus), живот (DPL/FAST повтор), таз (не качать после 1-го осмотра), конечности, спина (log-roll), промежность + DRE',
          'Тщательное неврологическое обследование (GCS, зрачки, сила, чувствительность, рефлексы)',
          'Повторная оценка ABCDE каждые 15 мин',
          'Рентген / КТ расширенное по показаниям (pan-CT при высокоэнергетической травме)',
        ],
      },
      disposition: {
        title: 'Definitive care / transfer',
        details: 'Принятие решения о лечении и/или транспортировке в центр более высокого уровня.',
        actions: [
          'Критерии перевода: полиорганная травма, ожоги > 20% или лицо/кисти/промежность, ЧМТ, spinal injury, pelvic ring, проникающая травма торсо',
          'Transfer без задержки - "treat what you can, transfer what you can\'t"',
          'Полная документация, copy labs/imaging, стабилизация airway перед транспортировкой',
          'Связь MD-to-MD до отправки',
          'Мониторинг во время транспорта, ABCDE reassess при прибытии',
        ],
      },
    };
    const r = (phaseMap[phase] || phaseMap.primary)!;
    return {
      value: r.title,
      unit: '',
      interpretation: `${r.title}. Оценка гемодинамики: класс ${hClass} (SBP ${sbp}, HR ${hr}).`,
      color,
      details: r.details,
      actions: r.actions,
      caveats: [
        'ATLS 10th ed: permissive hypotension противопоказана при сопутствующей ЧМТ (цель SBP ≥ 110, MAP ≥ 80)',
        'TXA эффективен только если введён < 3 ч от травмы; после 3 ч - вред',
        'Пересмотр ABCDE при любом ухудшении - вернуться к A',
        'Не полагаться только на SBP: base deficit, лактат, SI более ранние маркеры шока',
      ],
      scale: {
        segments: [
          { label: 'I', min: 0, max: 14, color: '#22C55E', description: '< 15% кровопотери' },
          { label: 'II', min: 15, max: 29, color: '#F59E0B', description: '15-30% - tachycardia' },
          { label: 'III', min: 30, max: 39, color: '#EF4444', description: '30-40% - hypotension' },
          { label: 'IV', min: 40, max: 100, color: '#7C2D12', description: '> 40% - life-threatening' },
        ],
        current: hClass === 'I' ? 10 : hClass === 'II' ? 22 : hClass === 'III' ? 35 : 50,
        unit: '% кровопотери',
      },
      related: [
        { id: 'etc', title: 'European Trauma Course' },
        { id: 'phtls-nm', title: 'PHTLS / ITLS' },
        { id: 'tccc-17', title: 'TCCC' },
        { id: 'shock-index', title: 'Shock Index' },
        { id: 'parkland', title: 'Parkland (ожоги)' },
        { id: 'rule-9', title: 'Rule of 9 (%TBSA)' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Неотложная помощь' },
        { id: '302.1', title: 'Хирургия' },
      ],
    };
  },
  reference: 'American College of Surgeons Committee on Trauma. ATLS Advanced Trauma Life Support Student Course Manual. 10th ed. Chicago: ACS, 2018. Holcomb JB et al. PROPPR trial: 1:1:1 vs 1:1:2. JAMA 2015;313:471.',
  countries: 'ACS-COT (США), 86 стран (курсы ATLS проводятся официально)',
  presets: [
    { label: 'Primary Survey', values: { phase: 'primary', sbp: 120, hr: 90 } },
    { label: 'Class II шок', values: { phase: 'resuscitation', sbp: 100, hr: 110 } },
    { label: 'Class III шок', values: { phase: 'resuscitation', sbp: 85, hr: 125 } },
    { label: 'Class IV шок', values: { phase: 'resuscitation', sbp: 60, hr: 145 } },
    { label: 'Secondary Survey', values: { phase: 'secondary', sbp: 115, hr: 95 } },
  ],
  info: `### Для чего используется
**ATLS 10th edition (2018)** - Advanced Trauma Life Support, стандарт ACS-COT для начальной оценки и ведения пациента с травмой в первые минуты и часы.

### ABCDE - Primary Survey
- **A** Airway + c-spine
- **B** Breathing + ventilation
- **C** Circulation + haemorrhage control
- **D** Disability (GCS, зрачки, глюкоза)
- **E** Exposure / environment (prevent hypothermia)

### Класс геморрагического шока (ATLS 10)
| Класс | Кровопотеря | HR | SBP | Pulse pressure |
|---|---|---|---|---|
| I | < 15% | < 100 | норма | норма |
| II | 15-30% | 100-120 | норма | ↓ |
| III | 30-40% | 120-140 | ↓ | ↓ |
| IV | > 40% | > 140 | ↓↓ | ↓↓ |

### Permissive hypotension
SBP 80-90 мм рт.ст. до остановки кровотечения (кроме ЧМТ - SBP ≥ 110).

### MTP 1:1:1
pRBC : FFP : platelets (PROPPR trial 2015). Добавить TXA 1 г < 3 ч от травмы.

### Источники
ACS-COT. ATLS 10th ed, 2018.
CRASH-2, CRASH-3, PROPPR trials.
`,
};

export default runner;
