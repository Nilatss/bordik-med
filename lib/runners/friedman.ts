// @ts-nocheck
/** Runner: friedman - Friedman staging for OSA surgery candidacy */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'tonsil',
      label: 'Размер миндалин (Friedman Tonsil Grade)',
      type: 'select',
      options: [
        { value: '0', label: '0 - удалены', points: 0 },
        { value: '1', label: 'I - в пределах дужек', points: 1 },
        { value: '2', label: 'II - не доходят до uvula', points: 2 },
        { value: '3', label: 'III - доходят до uvula', points: 3 },
        { value: '4', label: 'IV - соприкасаются (kissing)', points: 4 },
      ],
    },
    {
      id: 'palate',
      label: 'Позиция мягкого нёба (Friedman Palate Position, модифицированный Mallampati)',
      type: 'select',
      options: [
        { value: '1', label: 'I - uvula+миндалины видны', points: 1 },
        { value: '2', label: 'II - uvula видна полностью', points: 2 },
        { value: '3', label: 'III - видна часть мягкого нёба', points: 3 },
        { value: '4', label: 'IV - только твёрдое нёбо', points: 4 },
      ],
    },
    {
      id: 'bmi',
      label: 'ИМТ (BMI, кг/м²)',
      type: 'number',
      min: 10,
      max: 80,
      step: 0.1,
      quickValues: [22, 28, 32, 40],
    },
  ],
  compute: (v) => {
    const tonsil = Number(v.tonsil) || 0;
    const palate = Number(v.palate) || 1;
    const bmi = Number(v.bmi) || 0;
    const bmiHigh = bmi >= 40;

    // Friedman staging (2002)
    // Stage I: Palate I-II + Tonsil III-IV + BMI < 40
    // Stage II: Palate I-II + Tonsil 0-II OR Palate III-IV + Tonsil III-IV, BMI < 40
    // Stage III: Palate III-IV + Tonsil 0-II, BMI < 40
    // Stage IV: any + BMI ≥ 40 OR significant craniofacial abnormality
    let stage = '';
    let color = '#22C55E';
    let details = '';
    let success = '';
    if (bmiHigh) {
      stage = 'Стадия IV';
      color = '#991B1B';
      success = '< 20 %';
      details = `Friedman Stage IV (BMI ≥ 40 или тяжёлые краниофациальные аномалии). УППП/ЛАУП малоэффективны.`;
    } else if ((palate === 1 || palate === 2) && (tonsil === 3 || tonsil === 4)) {
      stage = 'Стадия I';
      color = '#22C55E';
      success = '80-85 %';
      details = `Friedman Stage I - оптимальный кандидат для UPPP (увулопалатофарингопластики). Высокая вероятность хирургического успеха.`;
    } else if ((palate === 3 || palate === 4) && (tonsil === 0 || tonsil === 1 || tonsil === 2)) {
      stage = 'Стадия III';
      color = '#EF4444';
      success = '< 10 %';
      details = `Friedman Stage III - плохой кандидат для UPPP. Предпочтительны мультисегментарные методы (MMA, гипоглоссальная стимуляция) или CPAP.`;
    } else {
      stage = 'Стадия II';
      color = '#F59E0B';
      success = '~ 40 %';
      details = `Friedman Stage II - промежуточный результат UPPP. Рассмотреть мультиуровневую хирургию.`;
    }

    return {
      value: stage,
      interpretation: `Успех UPPP: ${success}`,
      color,
      details,
      actions: [
        'Золотой стандарт лечения СОАС - CPAP (вне зависимости от стадии)',
        'Полисомнография - подтверждение AHI, степени тяжести',
        stage === 'Стадия I' ? 'UPPP / тонзиллэктомия - высокая вероятность успеха' : '',
        stage === 'Стадия II' ? 'Мультиуровневая хирургия (UPPP + радиочастотная абляция основания языка)' : '',
        stage === 'Стадия III' ? 'Maxillomandibular advancement (MMA) / гипоглоссальная стимуляция (Inspire)' : '',
        stage === 'Стадия IV' ? 'Снижение веса (бариатрия), MMA, трахеостомия при тяжёлых случаях' : '',
        'Контроль AHI через 3-6 мес после вмешательства',
      ].filter(Boolean),
      caveats: [
        'Friedman staging - прогноз успеха UPPP, а не диагноз СОАС',
        'Требуется подтверждённый СОАС по ПСГ (AHI ≥ 5 с симптомами или ≥ 15 без)',
        'Успех UPPP традиционно определяется по Sher: AHI < 20 и снижение ≥ 50 %',
        'BMI ≥ 40 - системный фактор, хирургия глотки малоэффективна',
        'У детей с СОАС - аденотонзиллэктомия первой линии',
      ],
      scale: {
        segments: [
          { min: 1, max: 1, label: 'Stage I', color: '#22C55E' },
          { min: 2, max: 2, label: 'Stage II', color: '#F59E0B' },
          { min: 3, max: 3, label: 'Stage III', color: '#EF4444' },
          { min: 4, max: 4, label: 'Stage IV', color: '#991B1B' },
        ],
        current: stage === 'Стадия I' ? 1 : stage === 'Стадия II' ? 2 : stage === 'Стадия III' ? 3 : 4,
        unit: 'Friedman',
      },
      related: [
        { id: 'stop-bang', title: 'STOP-BANG' },
        { id: 'epworth', title: 'Epworth ESS' },
        { id: 'mallampati', title: 'Mallampati' },
      ],
      relatedCourses: [{ id: '314.3', title: 'Оториноларингология' }],
    };
  },
  reference: 'Friedman M, Ibrahim H, Joseph NJ. Staging of obstructive sleep apnea/hypopnea syndrome: a guide to appropriate treatment. Laryngoscope 2004;114:454-9.',
  countries: 'Международный (AAO-HNS)',
  presets: [
    { label: 'Stage I (хир. кандидат)', values: { tonsil: '4', palate: '1', bmi: 28 } },
    { label: 'Stage II (промежут.)', values: { tonsil: '2', palate: '2', bmi: 30 } },
    { label: 'Stage III (CPAP/MMA)', values: { tonsil: '1', palate: '4', bmi: 32 } },
    { label: 'Stage IV (BMI≥40)', values: { tonsil: '2', palate: '3', bmi: 42 } },
  ],
  info: `### Для чего используется
**Friedman staging (2002)** - клиническая система отбора пациентов с **СОАС (обструктивным апноэ сна)** для UPPP (увулопалатофарингопластики). Прогнозирует вероятность хирургического успеха.

### Компоненты
1. **Tonsil grade (0-IV)** - размер миндалин:
   - 0: удалены; I: в дужках; II: не до uvula; III: до uvula; IV: соприкасаются (kissing)
2. **Palate position (I-IV)** - модифицированный Mallampati с языком в нейтрали:
   - I: видны uvula + миндалины; II: uvula полностью; III: часть мягкого нёба; IV: только твёрдое нёбо
3. **BMI** - порог 40

### Стадии
| Стадия | Palate | Tonsil | BMI | Успех UPPP |
|---|---|---|---|---|
| I | I-II | III-IV | <40 | 80-85 % |
| II | I-II + Tonsil 0-II, или III-IV + Tonsil III-IV | <40 | ~40 % |
| III | III-IV | 0-II | <40 | <10 % |
| IV | любой | любой | ≥40 | <20 % |

### Клиническое применение
- **Stage I** - хороший кандидат на UPPP
- **Stage II** - мультиуровневая хирургия
- **Stage III-IV** - CPAP, MMA, гипоглоссальная стимуляция (Inspire), бариатрия

### Ограничения
- Не диагноз, а прогноз хирургии
- Нужна ПСГ для подтверждения СОАС
- CPAP остаётся первой линией независимо от стадии
- Success criterion (Sher): AHI < 20 + снижение ≥ 50 %

### Источник
Friedman M et al. Laryngoscope 2002;112:454. Obstructive sleep apnea staging.`,
};

export default runner;
