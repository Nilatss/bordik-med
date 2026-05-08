/** Runner: amsler - Amsler grid screening for macular disease */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'centralScotoma', label: 'Центральная скотома (пятно в центре)', type: 'checkbox' },
    { id: 'metamorphopsia', label: 'Метаморфопсии (искривление линий)', type: 'checkbox' },
    { id: 'missingQuadrant', label: 'Выпадение квадранта / половины сетки', type: 'checkbox' },
    { id: 'blurredZones', label: 'Размытые зоны / искажение цвета', type: 'checkbox' },
    { id: 'newSymptoms', label: 'Симптомы появились остро (<2 нед)', type: 'checkbox' },
  ],
  compute: (v) => {
    const cs = !!v.centralScotoma;
    const mm = !!v.metamorphopsia;
    const mq = !!v.missingQuadrant;
    const bz = !!v.blurredZones;
    const ns = !!v.newSymptoms;
    const positive = cs || mm || mq || bz;
    const score = [cs, mm, mq, bz].filter(Boolean).length;

    let band = '', color = '#22C55E', details = '', urgency = '';
    if (!positive) {
      band = 'Норма (отрицательный тест)';
      color = '#22C55E';
      details = 'Сетка Амслера без искажений. Макула вероятно интактна.';
      urgency = 'Плановый осмотр';
    } else if (ns && (mm || cs)) {
      band = 'Срочно (острый процесс)';
      color = '#EF4444';
      details = `Положительный тест Амслера (${score}/4 признаков) + острое начало — подозрение на влажную AMD, ЦСР, ретинальный отёк, разрыв сетчатки.`;
      urgency = 'Офтальмолог в течение 24-48 ч, OCT + FA';
    } else if (mq) {
      band = 'Выраженные нарушения';
      color = '#FB923C';
      details = `Выпадение участка сетки — высокая вероятность макулярной патологии (AMD, эпиретинальная мембрана, макулярное отверстие).`;
      urgency = 'Офтальмолог в течение 1 недели';
    } else {
      band = 'Умеренные изменения';
      color = '#F59E0B';
      details = `${score}/4 признака. Метаморфопсии/размытость требуют OCT макулы.`;
      urgency = 'Плановое направление к офтальмологу 1-2 нед';
    }

    return {
      value: positive ? 'Положит.' : 'Отриц.',
      unit: `${score}/4 признаков`,
      interpretation: band,
      color,
      details: `${details} Срочность: ${urgency}.`,
      actions: [
        positive ? 'OCT макулы (SD-OCT) — ключевое исследование' : 'Ежегодный скрининг у лиц > 50 лет',
        positive ? 'Офтальмоскопия с расширением зрачка' : '',
        mm || cs ? 'FA / OCT-A при подозрении на CNV (неоваскулярная AMD)' : '',
        ns && positive ? 'Срочно исключить влажную AMD — анти-VEGF окно возможности' : '',
        'Повторный Amsler в домашних условиях ежедневно у лиц риска (сухая AMD, близорукость высокой степени)',
        'Один глаз закрыт, расстояние 30 см, фиксация центральной точки, очки для близи',
      ].filter(Boolean),
      caveats: [
        'Amsler — скрининговый, а не диагностический тест',
        'Чувствительность ~34-64% для ранней AMD — возможны ложноотрицательные',
        'Не заменяет OCT при подозрении на макулярную патологию',
        'Subjective — зависит от кооперации пациента и фиксации',
        'Есть модификации: Preferential Hyperacuity Perimetry (PHP, ForeseeHome) — точнее',
        'Использовать с коррекцией для близи, хорошее освещение',
      ],
      related: [{ id: 'snellen', title: 'Snellen VA' }, { id: 'areds', title: 'AREDS' }],
      relatedCourses: [{ id: '315.1', title: 'Офтальмология' }],
    };
  },
  reference: 'Amsler M. L\'Examen qualitatif de la fonction maculaire. Ophthalmologica 1947;114:248. AAO Preferred Practice Pattern AMD 2019.',
  countries: 'Международный (AAO)',
  presets: [
    { label: 'Норма', values: { centralScotoma: false, metamorphopsia: false, missingQuadrant: false, blurredZones: false, newSymptoms: false } },
    { label: 'Острая влажная AMD', values: { centralScotoma: true, metamorphopsia: true, missingQuadrant: false, blurredZones: true, newSymptoms: true } },
    { label: 'Макулярное отверстие', values: { centralScotoma: true, metamorphopsia: false, missingQuadrant: false, blurredZones: false, newSymptoms: false } },
  ],
  info: `### Для чего используется
**Сетка Амслера (Amsler grid, 1947)** — скрининговый тест для выявления **макулярных нарушений** (центральные 10° поля зрения).

### Методика
- Сетка 10×10 см, квадраты 5×5 мм
- Расстояние 30 см, один глаз закрыт, коррекция для близи
- Фиксация центральной точки
- Вопросы пациенту:
  1. Видна ли центральная точка?
  2. Видны ли все 4 угла сетки?
  3. Ровные ли линии?
  4. Нет ли тёмных/размытых участков?

### Патологические находки
| Симптом | Патология |
|---|---|
| Центральная скотома | AMD, макулярная дистрофия |
| Метаморфопсии | Влажная AMD, ЦСР, ЭРМ |
| Выпадение квадранта | Макулярное отверстие, отслойка |
| Размытость | Макулярный отёк (ДР, CRVO) |

### Срочность
- **Острое** начало + метаморфопсии → подозрение на **влажную AMD** — окно анти-VEGF 1-2 нед
- Хроническое — плановый OCT

### Ограничения
- Чувствительность 34-64% для ранней AMD
- Subjective; требует фиксации
- Альтернатива: **PHP / ForeseeHome** (domашний мониторинг, FDA одобрен)

### Источник
Amsler 1947. AAO PPP AMD 2019.`,
};

export default runner;
