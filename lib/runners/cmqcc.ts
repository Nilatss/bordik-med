// @ts-nocheck
/** Runner: cmqcc - CMQCC / AWHONN PPH risk assessment */
import type {
  CalculatorTool,
  ToolInput,
  ScoreBand,
  Preset,
  CalculatorResult,
  ResultExtras,
  ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'risk',
      label: 'Суммарная оценка риска ПРК',
      type: 'select',
      options: [
        {
          value: 'low',
          label: 'Low: одноплодная, ≤ 4 ПР в анамнезе, без кровотечений/гемоконтроля в анамнезе',
        },
        {
          value: 'medium',
          label: 'Medium: рубец на матке, многоплодная, > 4 родов, миома, хориоамнионит, длительный окситоцин, BMI > 40',
        },
        {
          value: 'high',
          label: 'High: предлежание/врастание плаценты, активное кровотечение при поступлении, Hct < 30 + др., известная коагулопатия, HELLP, ↑ prior PPH',
        },
      ],
    },
  ],
  compute: (v) => {
    const r = v.risk;
    let color = '';
    let actions = [];
    let text = '';
    if (r === 'low') {
      color = '#22C55E';
      text = 'Low risk (CMQCC)';
      actions = [
        'Стандартная оценка кровопотери количественным методом (QBL)',
        'Активное ведение III периода: окситоцин 10 ЕД в/м или 5 ЕД в/в медленно',
        'Группа крови и Rh (type & screen)',
        'Готовность к эскалации при изменении статуса',
      ];
    } else if (r === 'medium') {
      color = '#F59E0B';
      text = 'Medium risk (CMQCC)';
      actions = [
        'Type & screen, 2 кубитальных доступа',
        'Активное ведение III периода + готовые утеротоники 2-й линии',
        'Измерение QBL при любых родах',
        'Информирование анестезиолога, уведомление банка крови',
      ];
    } else {
      color = '#DC2626';
      text = 'High risk (CMQCC)';
      actions = [
        'Type & crossmatch 2 дозы эр. массы',
        'Активация многопрофильной бригады (анестезиолог, неонатолог, кровь)',
        'Готовность MTP (массивная трансфузия)',
        'Раннее обсуждение гемостатических опций: баллон Бакри, B-Lynch, эмболизация, гистерэктомия',
        'TXA 1 г при диагностированном ПРК (WOMAN trial - снижение смертности при раннем введении)',
      ];
    }
    return {
      value: text,
      unit: '',
      interpretation: text,
      color,
      details:
        'CMQCC OB Hemorrhage Toolkit 2.0 (2015) + AWHONN Risk Assessment: stratification по low/medium/high определяет готовность и ресурсы.',
      actions,
      caveats: [
        'Факторы риска кумулятивны - пересмотр в родах и после',
        'QBL (количественная оценка кровопотери) лучше визуальной (занижает на 30-50%)',
        'Раннее распознавание: снижение АД на 10%, ЧСС > 110, SpO₂ < 95%, олигурия',
        'TXA - максимальный эффект в первые 3 ч от начала кровотечения',
      ],
      related: [
        { id: '4t-pph', title: '4T причины ПРК' },
        { id: 'mtp', title: 'MTP' },
      ],
      relatedCourses: [
        { id: '302.2', title: 'Акушерство' },
        { id: '300.4', title: 'Интенсивная терапия' },
      ],
    };
  },
  reference:
    'CMQCC OB Hemorrhage Toolkit V2.0, 2015 (Lyndon A et al.). AWHONN 2015. RCOG Green-top 52 (2016, rev 2022). WOMAN trial, Lancet 2017;389:2105.',
  countries: 'США (CMQCC/AWHONN), UK (RCOG 52), международно',
  presets: [
    { label: 'Low', values: { risk: 'low' } },
    { label: 'Medium', values: { risk: 'medium' } },
    { label: 'High', values: { risk: 'high' } },
  ],
  caveats: [
    'CMQCC и ACOG рекомендуют оценку риска при поступлении, в родах и послеродово',
    'Высокий риск не обязательно ведёт к ПРК - и наоборот',
  ],
  related: [
    { id: '4t-pph', title: '4T причины ПРК' },
    { id: 'mtp', title: 'MTP' },
  ],
  relatedCourses: [
    { id: '302.2', title: 'Акушерство' },
    { id: '300.4', title: 'Интенсивная терапия' },
  ],
  info: `### CMQCC / AWHONN PPH Risk
Стратификация на **Low / Medium / High** при поступлении, в родах и послеродово.

### Факторы риска
**Low:** одноплодная, ≤ 4 ПР, без ПРК/гемотрансфузий в анамнезе.
**Medium:** рубец, многоплодная, > 4 ПР, крупный плод, миома, хориоамнионит, магнезия, длительный окситоцин, BMI > 40.
**High:** previa/accreta, активное кровотечение, HELLP, DIC, известная коагулопатия, Hct < 30 + факторы, предыдущий ПРК.

### Протоколы
- RCOG GTG 52: профилактика и лечение ПРК
- CMQCC 2.0: readiness → recognition → response → reporting
- TXA 1 г в/в при ПРК (WOMAN trial, Lancet 2017)

### Источники
CMQCC OB Hemorrhage Toolkit V2.0, 2015. RCOG 52, 2016/2022. WOMAN trial, 2017.`,
};

export default runner;
