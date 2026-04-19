// @ts-nocheck
/** Runner: mpi — Mannheim Peritonitis Index (Wacha 1987) */
import type { ScoreTool } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 47,
  inputs: [
    { id: 'age', label: 'Возраст > 50 лет', type: 'select', options: [
      { value: '0', label: 'Нет', points: 0 },
      { value: '5', label: 'Да (+5)', points: 5 },
    ] },
    { id: 'sex', label: 'Женский пол', type: 'select', options: [
      { value: '0', label: 'Нет (мужчина)', points: 0 },
      { value: '5', label: 'Да (+5)', points: 5 },
    ] },
    { id: 'of', label: 'Органная недостаточность', type: 'select', options: [
      { value: '0', label: 'Нет', points: 0 },
      { value: '7', label: 'Да (+7)', points: 7 },
    ] },
    { id: 'malig', label: 'Злокачественное новообразование', type: 'select', options: [
      { value: '0', label: 'Нет', points: 0 },
      { value: '4', label: 'Да (+4)', points: 4 },
    ] },
    { id: 'preop', label: 'Длительность перитонита > 24 ч до операции', type: 'select', options: [
      { value: '0', label: 'Нет', points: 0 },
      { value: '4', label: 'Да (+4)', points: 4 },
    ] },
    { id: 'origin', label: 'Источник — НЕ тонкая кишка', type: 'select', options: [
      { value: '0', label: 'Источник: тонкая кишка', points: 0 },
      { value: '4', label: 'Источник не из тонкой кишки (+4)', points: 4 },
    ] },
    { id: 'diffuse', label: 'Диффузный генерализованный перитонит', type: 'select', options: [
      { value: '0', label: 'Локальный', points: 0 },
      { value: '6', label: 'Диффузный (+6)', points: 6 },
    ] },
    { id: 'exudate', label: 'Характер экссудата', type: 'select', options: [
      { value: '0', label: 'Прозрачный (0)', points: 0 },
      { value: '6', label: 'Мутный / гнойный (+6)', points: 6 },
      { value: '12', label: 'Каловый / фекальный (+12)', points: 12 },
    ] },
  ],
  bands: [
    { min: 0, max: 20, label: '< 21', color: '#22C55E', description: 'Низкий риск, смертность 0–2,3%' },
    { min: 21, max: 29, label: '21–29', color: '#F59E0B', description: 'Умеренный риск, смертность ~ 22%' },
    { min: 30, max: 47, label: '≥ 30', color: '#991B1B', description: 'Высокий риск, смертность 58–100%' },
  ],
  caveats: [
    'MPI валидирован Wacha H et al. (1987) на 1253 пациентах',
    'При MPI ≥ 26 — консервативное ушивание с лапаростомой / relaparotomy on-demand',
    'Альтернативы: APACHE II, SOFA, POSSUM, PIPAS',
    'Exudate score — характер интраоперационный, не предоперационный',
    'Не применяется у детей < 16 лет',
  ],
  relatedCourses: [
    { id: '300.4', title: 'Неотложная помощь' },
  ],
  related: [
    { id: 'apache', title: 'APACHE II' },
    { id: 'sofa', title: 'SOFA' },
    { id: 'boey', title: 'Boey (перфоративная язва)' },
    { id: 'hinchey', title: 'Hinchey (дивертикулит)' },
    { id: 'asa-ps', title: 'ASA-PS' },
  ],
  reference: 'Wacha H, Linder MM, Feldmann U, Wesch G, Gundlach E, Steifensand RA. Mannheim peritonitis index — prediction of risk of death from peritonitis. Theor Surg 1987;1:169–77. Linder MM et al. Chirurg 1987;58:84.',
  countries: 'Международный (Германия, Европа, РФ)',
  info: `### Для чего используется
**Mannheim Peritonitis Index (MPI, Wacha 1987)** — прогноз смертности при **вторичном перитоните**. 8 параметров, 0–47 баллов.

### Шкала
| Параметр | Баллы |
|---|---|
| Возраст > 50 | 5 |
| Женский пол | 5 |
| Органная недостаточность | 7 |
| Малигнизация | 4 |
| Длительность > 24 ч | 4 |
| Источник НЕ из тонкой кишки | 4 |
| Диффузный перитонит | 6 |
| Экссудат: прозрачный / гнойный / фекальный | 0 / 6 / 12 |

### Интерпретация (Wacha 1987)
| MPI | Mortality |
|---|---|
| < 21 | 0–2,3% |
| 21–29 | ~ 22% |
| ≥ 30 | 58–100% |

### Критерии органной недостаточности (в оригинале)
- Креатинин > 177 мкмоль/л
- Мочевина > 16,7 ммоль/л
- Диурез < 20 мл/ч
- PaO₂ < 50 мм рт.ст.
- PaCO₂ > 50 мм рт.ст.
- SBP < 85 мм рт.ст.
- Paralytic ileus > 24 ч

### Тактика
- **MPI < 21** — однократная лапаротомия с санацией, антибиотики 5–7 дней
- **MPI 21–29** — плановая релапаротомия или on-demand, ICU
- **MPI ≥ 26** — лапаростома (открытый живот), этапные санации каждые 48–72 ч, damage control

### Альтернативы
- **APACHE II ≥ 20** — эквивалентно MPI ≥ 30
- **SOFA ≥ 8** — предиктор mortality > 30%
- **PIPAS score** (2018) — новая предоперационная шкала для ICU

### Источники
Wacha H et al. *Theor Surg* 1987;1:169. Billing A, Fröhlich D, Schildberg FW. *Br J Surg* 1994;81:209 (validation).
`,
};

export default runner;
