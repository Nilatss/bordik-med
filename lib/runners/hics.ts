/** Runner: hics - Hospital Incident Command System */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'incidentType',
      label: 'Тип инцидента',
      type: 'select',
      options: [
        { value: 'mci', label: 'MCI (массовые жертвы)' },
        { value: 'hazmat', label: 'Hazmat / CBRN' },
        { value: 'evacuation', label: 'Эвакуация здания' },
        { value: 'surge', label: 'Surge capacity (пандемия)' },
        { value: 'it', label: 'IT / киберинцидент' },
        { value: 'utility', label: 'Сбой коммуникаций / энерго' },
      ],
    },
    {
      id: 'casualties',
      label: 'Ожидаемое число пациентов',
      type: 'number',
      unit: 'чел',
      min: 0,
      max: 1000,
      step: 1,
      quickValues: [10, 25, 50, 100, 250],
    },
    {
      id: 'duration',
      label: 'Ожидаемая длительность, ч',
      type: 'number',
      unit: 'ч',
      min: 0,
      max: 168,
      step: 1,
      quickValues: [4, 12, 24, 48, 72],
    },
    {
      id: 'level',
      label: 'Уровень активации',
      type: 'select',
      options: [
        { value: 'partial', label: 'Частичная (IC + 1-2 секции)' },
        { value: 'moderate', label: 'Умеренная (IC + все 4 секции)' },
        { value: 'full', label: 'Полная (все секции + unit leaders)' },
      ],
    },
  ],
  compute: (v) => {
    const inc = String(v.incidentType || 'mci');
    const n = Number(v.casualties) || 0;
    const d = Number(v.duration) || 0;
    const lvl = String(v.level || 'moderate');

    const iapCycles = Math.max(1, Math.ceil(d / 12));
    const sections = lvl === 'full' ? 4 : lvl === 'moderate' ? 4 : 2;

    let color = '#22C55E';
    if (lvl === 'full' || n >= 100) color = '#EF4444';
    else if (lvl === 'moderate' || n >= 25) color = '#F59E0B';

    const activationMap: Record<string, string[]> = {
      mci: ['Triage area + START / JumpSTART', 'Expand ED beds + discharge inpatient stable', 'Activate on-call surgery / anesthesia / trauma'],
      hazmat: ['Decon corridor outdoor before ED entrance', 'PPE уровень B/C', 'Lock down ventilation; notify региональный poison / AHLS'],
      evacuation: ['Evacuate horizontally first (same floor), then vertically', 'Triage tags: green walk, yellow assist, red stretcher', 'Muster points + accountability'],
      surge: ['Expand ICU / conventional → contingency → crisis standards of care', 'PPE supply chain + N95 reuse protocol', 'Activate MOU sister hospitals'],
      it: ['Downtime procedures: paper charting, manual MAR', 'Disconnect network; contact CISO + FBI at ≥ crit data', 'Activate IT unit + PIO communication'],
      utility: ['Emergency generator test; priority circuits', 'Ventilator manual bagging pool', 'Evacuate if prolonged > 4-6 ч'],
    };

    return {
      value: `IC + ${sections} секций, ${iapCycles} IAP циклов`,
      unit: '',
      interpretation: `HICS активирован (${lvl}). Инцидент: ${inc}. Пациентов: ${n}, длительность: ${d} ч.`,
      color,
      details: `Incident Commander (IC) - общая ответственность. Command Staff: Public Information Officer (PIO), Safety Officer, Liaison Officer, Medical-Technical Specialist.

4 секции (General Staff):
• Operations - непосредственные действия (treatment, triage, patient tracking, hazmat)
• Planning - сбор данных, IAP, ресурсы, demobilization
• Logistics - материалы, питание, коммуникации, ИТ, персонал
• Finance / Administration - стоимость, время, compensation, claims

IAP (Incident Action Plan) - цикл обычно 12 ч (operational period). На каждый цикл: objectives, strategy, tactics, resources, safety, comms plan.`,
      actions: [
        `Активировать HICS level: ${lvl}`,
        'Открыть HCC (Hospital Command Center) + раздать JAS (Job Action Sheets)',
        ...(activationMap[inc] || []),
        `IAP: ${iapCycles} операционный цикл × 12 ч`,
        'Коммуникация: 800 MHz / WebEOC / amateur radio при отказе телефонов',
        'Tracking: patient tracking board, personnel check-in, equipment log',
        'Документация: ICS 201 (briefing), 202 (objectives), 203 (org), 204 (assignments), 205 (comms), 206 (medical), 214 (activity log)',
        'Debrief: hot wash сразу, formal AAR (after-action review) ≤ 2 нед',
      ],
      caveats: [
        'HICS - адаптация FEMA ICS (NIMS) для госпиталей',
        'JAS = Job Action Sheet - чеклист для каждой позиции (start of shift, ongoing, end)',
        'Span of control: 3-7 прямых подчинённых на одного leader (оптимально 5)',
        'Demobilization - формальное сворачивание, не "все свободны"',
        'Требования Joint Commission (EM.02.02.07): HICS ежегодное обучение + drill × 2/год',
        'Crisis standards of care - только при утверждении регион. HHS / органа здравоохранения',
      ],
      scale: {
        segments: [
          { label: 'Partial', min: 1, max: 1, color: '#22C55E', description: 'IC + 1-2 секций' },
          { label: 'Moderate', min: 2, max: 2, color: '#F59E0B', description: 'Все 4 секции' },
          { label: 'Full', min: 3, max: 3, color: '#EF4444', description: 'Все unit leaders' },
        ],
        current: lvl === 'full' ? 3 : lvl === 'moderate' ? 2 : 1,
        unit: '',
      },
      related: [
        { id: 'atls', title: 'ATLS' },
        { id: 'ahls', title: 'AHLS' },
        { id: 'start-triage', title: 'START / JumpSTART' },
        { id: 'gwtg', title: 'AHA GWTG' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Неотложная помощь' },
        { id: '301.1', title: 'Анестезиология-реаниматология' },
        { id: '303.9', title: 'Организация здравоохранения' },
      ],
    };
  },
  reference: 'California Emergency Medical Services Authority. Hospital Incident Command System (HICS) Guidebook, 5th ed. 2014. FEMA ICS-100/200/700/800. Joint Commission EM Standards 2023.',
  countries: 'США (CalEMSA + FEMA), адаптирован в ЕС, РФ, Азии',
  presets: [
    { label: 'MCI 50 пациентов 24 ч', values: { incidentType: 'mci', casualties: 50, duration: 24, level: 'moderate' } },
    { label: 'Hazmat 15 / 12 ч', values: { incidentType: 'hazmat', casualties: 15, duration: 12, level: 'partial' } },
    { label: 'Surge 250 / 72 ч', values: { incidentType: 'surge', casualties: 250, duration: 72, level: 'full' } },
    { label: 'Эвакуация', values: { incidentType: 'evacuation', casualties: 0, duration: 6, level: 'moderate' } },
    { label: 'IT 48 ч', values: { incidentType: 'it', casualties: 0, duration: 48, level: 'moderate' } },
  ],
  info: `### Для чего используется
**HICS (Hospital Incident Command System)** - стандартизованная структура управления инцидентами в госпитале, адаптация FEMA ICS (NIMS).

### Структура
**Incident Commander (IC)** - топ.
**Command Staff:**
- Public Information Officer (PIO)
- Safety Officer
- Liaison Officer
- Medical-Technical Specialist

**General Staff (4 секции):**
| Секция | Ответственность |
|---|---|
| Operations | Treatment, triage, patient tracking |
| Planning | IAP, ресурсы, demob |
| Logistics | Materials, питание, comms, IT |
| Finance/Admin | Время, стоимость, claims |

### IAP (Incident Action Plan)
Цикл 12 ч. На каждый period: objectives, strategy, tactics, safety, comms plan.

### Ключевые ICS формы
- 201 briefing, 202 objectives, 203 org chart, 204 assignments, 205 comms, 206 medical plan, 214 activity log.

### Span of control
3-7 подчинённых на leader (optimal 5).

### Требования
Joint Commission EM.02.02.07: HICS training + drill ×2/год.

### Источники
CalEMSA HICS Guidebook 5 ed. 2014.
FEMA ICS-100/200/700/800.
`,
};
export default runner;
