// @ts-nocheck
/** Runner: pvr */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'pvr', label: 'Остаточная моча (PVR)', type: 'number', unit: 'мл', min: 0, max: 2000, step: 5, quickValues: [30, 80, 150, 250, 500] },
    { id: 'age', label: 'Возраст', type: 'number', unit: 'лет', min: 18, max: 110, step: 1, quickValues: [40, 60, 75] },
    { id: 'symptoms', label: 'Симптомы (СНМП, ИМП, почечная недост.)', type: 'select', options: [
      { value: 'none', label: 'Нет симптомов', points: 0 },
      { value: 'mild', label: 'Лёгкие СНМП', points: 1 },
      { value: 'severe', label: 'Выраженные СНМП / ИМП / АКИ', points: 2 },
    ] },
    { id: 'catheter', label: 'Катетер ранее стоял / был острый заде́рж', type: 'checkbox' },
  ],
  compute: (v) => {
    const pvr = Number(v.pvr);
    const age = Number(v.age);
    const sx = String(v.symptoms);
    const cath = v.catheter === true;

    let interpretation = 'Норма', color = '#22C55E';
    if (pvr > 500) { interpretation = 'Критически повышен'; color = '#991B1B'; }
    else if (pvr > 200) { interpretation = 'Значительно повышен'; color = '#EF4444'; }
    else if (pvr > 100 || (pvr > 50 && age < 65)) { interpretation = 'Повышен'; color = '#F59E0B'; }
    else if (pvr > 50) { interpretation = 'Пограничный'; color = '#FACC15'; }

    const details = `PVR = ${pvr} мл. Нормы: <50 мл (<65 лет), <100 мл (≥65 лет). Хроническая задержка: >300 мл. ${interpretation}.`;

    const actions: string[] = [];
    if (pvr > 500 || (pvr > 300 && sx === 'severe')) {
      actions.push('Постоянный или интермиттирующий катетер (CIC) немедленно');
      actions.push('УЗИ почек — исключить двусторонний гидронефроз');
      actions.push('Биохимия: креатинин, K⁺ — риск постобструктивного АКИ');
      actions.push('Срочная консультация уролога');
    } else if (pvr > 200) {
      actions.push('Консультация уролога — урофлоуметрия, цистоскопия');
      actions.push('Рассмотреть CIC (перемежающаяся катетеризация)');
      actions.push('α-блокаторы при ДГПЖ; пересмотр антихолинергиков');
      actions.push('УЗИ почек и мочевого пузыря');
    } else if (pvr > 100 || (pvr > 50 && age < 65)) {
      actions.push('Оценить причину: ДГПЖ, стриктура, нейрогенный пузырь, лекарства');
      actions.push('Урофлоуметрия + IPSS');
      actions.push('α-блокаторы (тамсулозин) при ДГПЖ');
    } else if (pvr > 50) {
      actions.push('Контрольный повтор (в норме ≈10% от объёма пузыря)');
      actions.push('Обучение приёмам опорожнения (двойное мочеиспускание)');
    } else {
      actions.push('PVR в пределах нормы — рутинного вмешательства не требуется');
    }

    if (cath && pvr > 100) actions.push('После эпизода острой задержки: повторная try-void + контроль PVR');

    return {
      value: String(pvr),
      unit: 'мл',
      interpretation,
      color,
      details,
      actions,
      caveats: [
        'Измеряется УЗИ в течение 10 мин после мочеиспускания',
        'Однократное измерение ненадёжно — повтор 2–3 раза',
        'У женщин норма <50 мл в любом возрасте',
        'Беременность, недавняя катетеризация — ложный рост',
        'Хроническая задержка + гидронефроз = показание к катетеру',
      ],
      scale: {
        segments: [
          { min: 0, max: 50, label: 'Норма', color: '#22C55E' },
          { min: 50, max: 100, label: 'Пограничн.', color: '#FACC15' },
          { min: 100, max: 200, label: 'Повышен', color: '#F59E0B' },
          { min: 200, max: 500, label: 'Значительно', color: '#EF4444' },
          { min: 500, max: 2000, label: 'Критически', color: '#991B1B' },
        ],
        current: Math.max(0, Math.min(2000, pvr)),
        unit: 'мл',
      },
      relatedCourses: [
        { id: '301.4', title: 'Урология' },
        { id: '301.3', title: 'Нефрология' },
      ],
      related: [
        { id: 'ipss', title: 'IPSS' },
        { id: 'iciq', title: 'ICIQ-UI SF' },
        { id: 'stone', title: 'Urolithiasis' },
      ],
    };
  },
  reference: 'AUA Guideline on Male LUTS/BPH 2023; ICS Standards.',
  countries: 'Международный (AUA/EAU)',
  presets: [
    { label: 'Норма', values: { pvr: 30, age: 55, symptoms: 'none', catheter: false } },
    { label: 'ДГПЖ умеренный', values: { pvr: 150, age: 70, symptoms: 'mild', catheter: false } },
    { label: 'Хрон. задержка', values: { pvr: 600, age: 75, symptoms: 'severe', catheter: true } },
  ],
  info: `### Для чего используется
**PVR (Post-Void Residual)** — объём мочи, остающейся в мочевом пузыре после мочеиспускания. Маркер опорожняющей функции.

### Интерпретация
| PVR (мл) | Оценка |
|---|---|
| <50 (взр.) | Норма |
| 50–100 | Пограничный (норма у пожилых) |
| 100–200 | Повышен — обследование |
| 200–500 | Значительно повышен |
| >500 | Критически — катетеризация |

### Хроническая задержка мочи
- PVR >300 мл стойко ≥6 мес
- Риск: гидронефроз, ИМП, обструктивная уропатия → АКИ

### Методы
- УЗИ мочевого пузыря (портативный BladderScan) — предпочтительно
- Катетеризация — инвазивная, только если УЗИ недоступно`,
};
export default runner;
