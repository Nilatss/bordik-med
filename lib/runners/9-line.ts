// @ts-nocheck
/** Runner: 9-line — 9-Line MEDEVAC / MIST / SBAR / AT-MIST */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'format',
      label: 'Формат передачи',
      type: 'select',
      options: [
        { value: '9line', label: '9-Line MEDEVAC (NATO / US)' },
        { value: 'mist', label: 'MIST — боевая передача' },
        { value: 'atmist', label: 'AT-MIST — расширенный MIST' },
        { value: 'sbar', label: 'SBAR — стационарная передача (IHI)' },
      ],
    },
  ],
  compute: (v) => {
    const format = String(v.format);
    const map: Record<string, { title: string; c: string; actions: string[]; details: string }> = {
      '9line': {
        title: '9-Line MEDEVAC',
        c: '#3B82F6',
        actions: [
          'Line 1: Location — координаты PZ (pickup zone), MGRS/UTM/lat-long',
          'Line 2: Frequency + Call sign (контакт на PZ)',
          'Line 3: Number of patients by precedence — A Urgent (< 1 ч), B Urgent-surgical (< 2 ч), C Priority (< 4 ч), D Routine (< 24 ч), E Convenience',
          'Line 4: Special equipment — A None / B Hoist / C Extraction / D Ventilator',
          'Line 5: Number of patients by type — L Litter / A Ambulatory (например, 2L+1A)',
          'Line 6: Security at PZ (wartime) — N No enemy / P Possible / E Enemy / X Armed escort required. ИЛИ NBC type (peacetime): N Nuclear / B Biological / C Chemical',
          'Line 7: Method of marking PZ — A Panels / B Pyrotechnic / C Smoke / D None / E Other',
          'Line 8: Patient nationality/status — A US military / B US civilian / C Non-US military / D Non-US civilian / E EPW',
          'Line 9: Terrain / NBC description (wartime) — obstacles / трещины / узкая полоса. ИЛИ NBC contamination detected (peacetime)',
        ],
        details: 'US DoD FM 4-02.2 / ATP 4-25.13. Lines 1–5 передаются ДО взлёта, 6–9 — дополнительно/в воздухе.',
      },
      mist: {
        title: 'MIST — боевая передача',
        c: '#F59E0B',
        actions: [
          'M — Mechanism of injury (механизм: GSW, IED, фрагментация, падение)',
          'I — Injuries sustained (видимые/предполагаемые ранения, по head-to-toe)',
          'S — Signs / vital signs (ЧСС, АД, ЧДД, SpO₂, GCS, температура)',
          'T — Treatment given (tourniquet T: чч:мм, TXA, IV, IO, лекарства, кровь)',
        ],
        details: 'NATO AMedP-7.5 / UK Defence Medical Services. Используется при передаче из TFC в TACEVAC и далее в Role 2/3.',
      },
      atmist: {
        title: 'AT-MIST — расширенный MIST',
        c: '#F59E0B',
        actions: [
          'A — Age + sex',
          'T — Time of injury (время ранения — критично для TXA 3-часового окна)',
          'M — Mechanism',
          'I — Injuries',
          'S — Signs / vitals',
          'T — Treatment given',
        ],
        details: 'Расширение MIST — добавлены возраст/пол и время травмы. Стандарт UK/NATO / многих civilian EMS.',
      },
      sbar: {
        title: 'SBAR — IHI structured handoff',
        c: '#22C55E',
        actions: [
          'S — Situation: кто, где, что происходит (пациент X, палата Y, проблема Z)',
          'B — Background: клинический контекст (диагноз, hospital course, аллергии, лекарства)',
          'A — Assessment: ваша оценка (что думаете — sepsis? PE? decompensation?)',
          'R — Recommendation: что запрашиваете (осмотр, перевод в ICU, антибиотики, консилиум)',
        ],
        details: 'IHI / WHO / Joint Commission стандарт. Разработан ВМФ США (submarines), адаптирован для medicine Kaiser Permanente 2002.',
      },
    };
    const r = map[format] || map['9line'];
    return {
      value: r.title,
      unit: '',
      interpretation: r.details,
      color: r.c,
      details: r.details,
      actions: r.actions,
      caveats: [
        'Lines 6 и 9 — разные в wartime vs peacetime',
        'Precedence (Line 3): A-Urgent = жизнеспасающая помощь < 1 ч, B-Urgent-surgical = spot surgery < 2 ч',
        'MEDEVAC — помеченные санитарные воздушные суда (Красный Крест, защита ЖК)',
        'CASEVAC — любой транспорт, без защиты Красным Крестом',
        'SBAR — для стационарной межсменной передачи, не для догоспитальной',
      ],
      related: [
        { id: 'tccc', title: 'TCCC' },
        { id: 'march-paws', title: 'MARCH-PAWS' },
        { id: 'tecc', title: 'TECC' },
        { id: 'phtls', title: 'PHTLS' },
        { id: 'ru-military', title: 'Российская военная медицина' },
      ],
      relatedCourses: [
        { id: '308.2', title: 'Тактическая медицина' },
        { id: '300.4', title: 'Неотложная помощь' },
      ],
    };
  },
  reference: 'US Army FM 4-02.2 Medical Evacuation (2014). ATP 4-25.13 Casualty Evacuation (2013). NATO AMedP-7.5 Medical Evacuation. Institute for Healthcare Improvement (IHI). SBAR Communication Technique. Haig KM, Sutton S, Whittington J. SBAR: a shared mental model for improving communication between clinicians. Jt Comm J Qual Patient Saf 2006;32:167.',
  countries: 'NATO / US DoD / WHO / IHI',
  presets: [
    { label: '9-Line MEDEVAC', values: { format: '9line' } },
    { label: 'MIST', values: { format: 'mist' } },
    { label: 'AT-MIST', values: { format: 'atmist' } },
    { label: 'SBAR', values: { format: 'sbar' } },
  ],
  info: `### Для чего используется
Стандартизированные форматы передачи информации при **эвакуации и handoff** пациента.

### 9-Line MEDEVAC (US/NATO)
| Line | Содержание |
|---|---|
| 1 | Location (PZ coordinates) |
| 2 | Frequency + call sign |
| 3 | Number of patients by precedence (A/B/C/D/E) |
| 4 | Special equipment (A none / B hoist / C extraction / D ventilator) |
| 5 | Number by type (L litter / A ambulatory) |
| 6 | Security (wartime) OR NBC (peacetime) |
| 7 | PZ marking method |
| 8 | Patient nationality |
| 9 | Terrain description (wartime) OR NBC contamination (peacetime) |

### Precedence (Line 3)
| Category | Time | Indication |
|---|---|---|
| **A** Urgent | < 1 ч | Жизнь под угрозой немедленно |
| **B** Urgent-surgical | < 2 ч | Требует surgery < 2 ч |
| **C** Priority | < 4 ч | Состояние ухудшается, но не экстренно |
| **D** Routine | < 24 ч | Стабилен, плановая эвакуация |
| **E** Convenience | > 24 ч | Административная эвакуация |

### MIST (NATO боевая передача)
- **M** echanism of injury
- **I** njuries sustained
- **S** igns (vitals + GCS)
- **T** reatment given

### AT-MIST (расширенная)
- **A** ge + sex
- **T** ime of injury
- **M** echanism
- **I** njuries
- **S** igns
- **T** reatment

### SBAR (IHI 2002)
- **S** ituation: кто/где/что
- **B** ackground: клинический контекст
- **A** ssessment: ваша оценка
- **R** ecommendation: что запрашиваете

### Примеры использования
| Сценарий | Формат |
|---|---|
| Запрос MEDEVAC в бою | 9-Line |
| Передача из TFC в TACEVAC | MIST/AT-MIST |
| Поступление в Role 3 / ED | AT-MIST |
| Межсменная передача в госпитале | SBAR |
| Consult specialist | SBAR |

### Источники
US Army FM 4-02.2 2014. ATP 4-25.13. NATO AMedP-7.5. Haig KM et al. SBAR. *Jt Comm J Qual Patient Saf* 2006;32:167.
`,
};

export default runner;
