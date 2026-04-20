// @ts-nocheck
/** Runner: bis - Multimodal neuroprognostication post-cardiac-arrest (ERC/ESICM 2021) */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    { id: 'n20', label: 'Билатерально отсутствуют N20 SSEP (24-72 ч)', type: 'checkbox' },
    { id: 'reflex', label: 'Билатерально отсутствуют зрачковые + корнеальные рефлексы ≥72 ч', type: 'checkbox' },
    { id: 'myoclonus', label: 'Status myoclonus в течение 72 ч', type: 'checkbox' },
    { id: 'nse', label: 'NSE >60 мкг/л в 48-72 ч', type: 'checkbox' },
    { id: 'eeg', label: 'Burst-suppression / status epilepticus на EEG', type: 'checkbox' },
    { id: 'ct', label: 'КТ: диффузный отёк, потеря grey-white дифференциации', type: 'checkbox' },
    { id: 'mri', label: 'МРТ: диффузные ишемические изменения DWI', type: 'checkbox' },
  ],
  compute: (v) => {
    const keys = ['n20', 'reflex', 'myoclonus', 'nse', 'eeg', 'ct', 'mri'];
    const count = keys.reduce((a, k) => a + (v[k] ? 1 : 0), 0);

    let interpretation = '', color = '', details = '';
    const actions: string[] = [];

    if (count >= 2) {
      interpretation = `${count} предиктора - плохой исход почти достоверен`;
      color = '#DC2626';
      details = 'По ERC/ESICM 2021: ≥2 независимых предиктора плохого неврологического исхода, оценённых в соответствующие окна, дают FPR <5%. Прогноз плохой (CPC 3-5) практически достоверен.';
      actions.push('Мультидисциплинарное обсуждение', 'Разговор с семьёй', 'Документация всех предикторов и временных окон', 'Рассмотрение перехода на паллиативную терапию', 'Органное донорство при подходящих условиях');
    } else if (count === 1) {
      interpretation = '1 предиктор - плохой исход вероятен';
      color = '#F59E0B';
      details = 'Один изолированный предиктор - прогноз склоняется к плохому, но требуется подтверждение вторым независимым методом.';
      actions.push('Дождаться 72 ч от ROSC + нормотермии', 'Дополнить мультимодальный прогноз (EEG + NSE + SSEP + нейровизуализация)', 'Избегать досрочной отмены терапии', 'Учесть остаточную седацию');
    } else {
      interpretation = 'Нет предикторов - неопределённый прогноз';
      color = '#22C55E';
      details = 'Ноль предикторов - шкала недостаточна для прогноза. Рекомендуется дождаться ≥72 ч после ROSC/нормотермии и повторить оценку.';
      actions.push('TTM 32-36 °C по протоколу', 'Седация - пропофол / мидазолам', 'Повторная оценка SSEP/NSE/EEG в 48-72 ч', 'Мозговая визуализация 2-5 сут', 'Не принимать ранних решений о withdrawal');
    }

    return {
      value: `${count} предикторов`,
      unit: '',
      interpretation,
      color,
      details,
      actions,
      caveats: [
        'ERC/ESICM 2021: мультимодальный подход обязателен - ни один тест изолированно',
        'Оценка только в соответствующие временные окна (SSEP 24-72 ч, NSE 48-72 ч, рефлексы ≥72 ч)',
        'Седация, гипотермия, миорелаксанты - confounders, исключить перед оценкой',
        'NSE: гемолиз и нейроэндокринные опухоли искажают',
        'BIS не валидирован как изолированный предиктор - только как часть EEG-оценки',
      ],
      related: [
        { id: 'ohca', title: 'OHCA score' },
        { id: 'gcs', title: 'GCS' },
        { id: 'four', title: 'FOUR score' },
        { id: 'cam-icu', title: 'CAM-ICU' },
      ],
      relatedCourses: [
        { id: '300.4', title: 'Интенсивная терапия' },
        { id: '301.1', title: 'Анестезиология' },
        { id: '301.5', title: 'Нейроанестезиология' },
      ],
      scale: {
        segments: [
          { min: 0, max: 1, label: 'Нет/неопр.', color: '#22C55E' },
          { min: 1, max: 2, label: '1 предиктор', color: '#F59E0B' },
          { min: 2, max: 7, label: '≥2 - плохой', color: '#DC2626' },
        ],
        current: count,
        unit: '',
      },
    };
  },
  reference: 'Nolan JP et al. Resuscitation 2021 (ERC/ESICM post-resuscitation care).',
  countries: 'Международный (ERC/ESICM)',
  presets: [
    { label: 'Нет предикторов', values: { n20: false, reflex: false, myoclonus: false, nse: false, eeg: false, ct: false, mri: false } },
    { label: '1 предиктор (NSE)', values: { n20: false, reflex: false, myoclonus: false, nse: true, eeg: false, ct: false, mri: false } },
    { label: '≥2 предикторов', values: { n20: true, reflex: true, myoclonus: false, nse: true, eeg: false, ct: false, mri: false } },
  ],
  caveats: [
    'Прогноз - только после исключения седации и достижения нормотермии',
  ],
  info: `### Для чего используется
Мультимодальный нейропрогноз коматозных пациентов после остановки кровообращения по алгоритму **ERC/ESICM 2021** (Nolan 2021).

### Когда оценивать
- **≥72 ч** после ROSC или конца TTM
- После исключения **остаточной седации, миорелаксантов, гипотермии**
- Больной коматозен (GCS-M ≤3, FOUR ≤... или отсутствие пробуждения)

### Критерии плохого прогноза (ERC/ESICM 2021, FPR <5%)
| Предиктор | Окно | Особенности |
|---|---|---|
| Билатерально отсутствующие **N20 SSEP** | 24-72 ч | Сильнейший предиктор |
| Билатерально отсутствующие **зрачковые + корнеальные** рефлексы | ≥72 ч | Проверка в нормотермии |
| **Status myoclonus** (≥30 мин, все конечности) | ≤72 ч | Не путать с benign post-anoxic myoclonus |
| **NSE >60 мкг/л** | 48-72 ч | Динамика важнее абсолютного значения |
| **Burst-suppression / status epilepticus** на EEG | 24-72 ч | Без реактивности |
| **КТ**: диффузный отёк, потеря grey-white границы | первые сутки | ≥2 мм редукция коры |
| **МРТ**: диффузные DWI-изменения | 2-5 сут | >10% объёма коры / БГЯ |

### Алгоритм
1. Клиника (coma, GCS-M ≤3) + исключение седации
2. Оценка ≥2 независимых предикторов
3. ≥2 положительных → плохой прогноз почти достоверен
4. 0-1 → подождать, повторить через 24-48 ч

### Ограничения
- Только коматозные пациенты
- Временные окна критичны
- Самоисполняющееся пророчество - уход от WLST после ≤48 ч без полного протокола не рекомендован`,
};

export default runner;
