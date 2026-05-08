/** Runner: rcog-37a - RCOG Green-top 37a 2015: профилактика ВТЭ в беременности и послеродовом периоде */
import type {
  ScoreTool,
  ToolInput,
  ScoreBand,
  Preset,
  CalculatorResult,
  ResultExtras,
  ResultScaleSegment,
} from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 20,
  inputs: [
    {
      id: 'period',
      label: 'Период',
      type: 'select',
      options: [
        { value: 'ante', label: 'Антенатальный', points: 0 },
        { value: 'post', label: 'Постнатальный', points: 0 },
      ],
    },
    { id: 'prevVteRec', label: 'Рецидивирующая ВТЭ в анамнезе', type: 'checkbox', points: 4 },
    { id: 'prevVteUnprov', label: 'Предыдущая ВТЭ (неспровоцированная или эстроген-связанная)', type: 'checkbox', points: 4 },
    { id: 'prevVteProv', label: 'Предыдущая ВТЭ, спровоцированная большой операцией', type: 'checkbox', points: 3 },
    { id: 'thromboHigh', label: 'Тромбофилия высокого риска (APS, AT-дефицит, комбинированные)', type: 'checkbox', points: 3 },
    { id: 'thromboLow', label: 'Тромбофилия низкого риска без ВТЭ (FV Leiden гетеро, PT G20210A)', type: 'checkbox', points: 1 },
    { id: 'medical', label: 'Медицинская коморбидность (СКВ, рак, нефротический синдром, СН, серповидно-клеточная)', type: 'checkbox', points: 3 },
    { id: 'famHistory', label: 'Семейный анамнез неспровоцированной ВТЭ у родственника 1-й линии', type: 'checkbox', points: 1 },
    { id: 'age35', label: 'Возраст > 35 лет', type: 'checkbox', points: 1 },
    { id: 'parity3', label: 'Паритет ≥ 3', type: 'checkbox', points: 1 },
    { id: 'bmi30', label: 'BMI ≥ 30', type: 'checkbox', points: 1 },
    { id: 'bmi40', label: 'BMI ≥ 40 (доп. балл)', type: 'checkbox', points: 1 },
    { id: 'smoker', label: 'Курение', type: 'checkbox', points: 1 },
    { id: 'varicose', label: 'Выраженный варикоз', type: 'checkbox', points: 1 },
    { id: 'preeclampsia', label: 'Преэклампсия (текущая беременность)', type: 'checkbox', points: 1 },
    { id: 'immobility', label: 'Иммобилизация / дегидратация / длительный перелёт', type: 'checkbox', points: 1 },
    { id: 'multiple', label: 'Многоплодная беременность', type: 'checkbox', points: 1 },
    { id: 'art', label: 'ВРТ (антенатально)', type: 'checkbox', points: 1 },
    { id: 'csEmerg', label: 'Экстренное кесарево сечение', type: 'checkbox', points: 2 },
    { id: 'csElect', label: 'Плановое кесарево сечение', type: 'checkbox', points: 1 },
    { id: 'laborLong', label: 'Роды > 24 ч', type: 'checkbox', points: 1 },
    { id: 'pph1L', label: 'PPH > 1 л или гемотрансфузия', type: 'checkbox', points: 1 },
    { id: 'preterm', label: 'Преждевременные роды (< 37 нед, текущая беременность)', type: 'checkbox', points: 1 },
    { id: 'stillbirth', label: 'Мертворождение (текущая беременность)', type: 'checkbox', points: 1 },
  ],
  bands: [
    { min: 0, max: 1, label: 'Низкий риск', color: '#22C55E', description: 'Ранняя мобилизация, адекватная гидратация.', actions: ['Без фармакопрофилактики', 'Повторная оценка при изменении клиники'] },
    { min: 2, max: 2, label: 'Промежуточный риск', color: '#F59E0B', description: 'Антенатально: мобилизация/гидратация. Постнатально: ≥ 2 - LMWH ≥ 10 дней.', actions: ['Постнатально LMWH ≥ 10 дней при сумме ≥ 2', 'Компрессионный трикотаж как дополнение'] },
    { min: 3, max: 3, label: 'Высокий риск', color: '#EF4444', description: 'Антенатально: LMWH с 28 нед. Постнатально: LMWH ≥ 10 дней (до 6 нед при высоком риске).', actions: ['LMWH в профилактической дозе (enoxaparin 40 мг/сут ± коррекция по массе)', 'Учитывать функцию почек'] },
    { min: 4, max: 20, label: 'Очень высокий риск', color: '#DC2626', description: 'Антенатально: LMWH с I триместра. Постнатально: LMWH 6 нед.', actions: ['Профилактическая или промежуточная доза LMWH', 'Консультация гематолога при APS / тромбофилиях', 'Компрессионный трикотаж'] },
  ],
  reference:
    'Royal College of Obstetricians and Gynaecologists. Reducing the Risk of Venous Thromboembolism during Pregnancy and the Puerperium. Green-top Guideline No. 37a. April 2015.',
  countries: 'Великобритания (RCOG); адаптация в ЕС',
  presets: [
    { label: 'Низкий риск (здоровая)', values: { period: 'ante' } },
    { label: 'Промежуточный (возраст + BMI)', values: { period: 'post', age35: true, bmi30: true } },
    { label: 'Высокий - 28 нед LMWH', values: { period: 'ante', prevVteProv: true } },
    { label: 'Очень высокий (прев. ВТЭ + APS)', values: { period: 'ante', prevVteUnprov: true, thromboHigh: true } },
  ],
  caveats: [
    'Сумма баллов антенатально ≥ 4 - LMWH с I триместра; = 3 - с 28 недель',
    'Постнатально ≥ 2 - LMWH минимум 10 дней; у групп высокого риска - до 6 нед',
    'Для LMWH дозировка корректируется по массе тела (enoxaparin 40/60/80 мг/сут)',
    'Отличать этот инструмент от общего RCOG VTE checklist - здесь специфическая схема антенатал/постнатал',
  ],
  related: [
    { id: 'rcog-vte', title: 'RCOG VTE общий' },
    { id: 'wells-pe', title: 'Wells PE' },
    { id: 'caprini', title: 'Caprini' },
  ],
  relatedCourses: [
    { id: '302.2', title: 'Акушерство' },
    { id: '301.8', title: 'Тромбоз и гемостаз' },
  ],
  info: `### RCOG Green-top 37a (2015)
Стратификация риска венозной тромбоэмболии в беременности и послеродовом периоде.

### Антенатальная тактика
| Сумма | Тактика |
|---|---|
| ≥ 4 | LMWH с I триместра |
| 3 | LMWH с 28 нед |
| ≤ 2 | Мобилизация, гидратация |

### Постнатальная тактика
| Сумма | Тактика |
|---|---|
| ≥ 2 | LMWH минимум 10 дней |
| ≥ 4 или высокий риск | LMWH 6 недель |

### Дозировки LMWH
- < 50 кг: enoxaparin 20 мг/сут
- 50-90 кг: 40 мг/сут
- 91-130 кг: 60 мг/сут
- 131-170 кг: 80 мг/сут

### Источник
RCOG Green-top Guideline No. 37a, April 2015.`,
};

export default runner;
