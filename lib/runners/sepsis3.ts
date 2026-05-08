// @ts-nocheck
/**
 * Runner: sepsis3 — Sepsis-3 Definition (Singer 2016) screening tool
 *
 * P1-CR-10 — Formula source attribution:
 *   PRIMARY:    Singer M, Deutschman CS, Seymour CW, et al. The Third
 *               International Consensus Definitions for Sepsis and Septic
 *               Shock (Sepsis-3). JAMA. 2016;315(8):801-810.
 *               doi:10.1001/jama.2016.0287
 *   GUIDELINE:  Surviving Sepsis Campaign 2021 Guidelines — bundle:
 *               1-hour bundle (lactate, blood culture, broad-spectrum
 *               antibiotics, fluid resuscitation, vasopressors).
 *               doi:10.1097/CCM.0000000000005337
 *
 * Sepsis-3 hierarchy:
 *   1) Suspected infection
 *   2) Sepsis = infection + ΔSOFA ≥2 (см. sofa.ts)
 *   3) Septic shock = sepsis + vasopressors для MAP ≥65 + lactate >2 mmol/L
 *
 * Screening: qSOFA (см. qsofa.ts) — bedside trigger, НЕ диагноз.
 *
 * SIRS criteria (см. sirs.ts) — DEPRECATED for sepsis (Sepsis-1/-2 era),
 *   но остаются valid pediatric definitions (Goldstein 2005).
 *
 * Mortality (Singer 2016):
 *   Sepsis        → 10-20%
 *   Septic shock  → 40-50%
 *
 * Bundle compliance (CMS SEP-1):
 *   1h: lactate measured, blood cultures pre-antibiotic, broad-spectrum
 *        antibiotics started, ≥30 mL/kg crystalloid for hypotension
 *   3h: re-measure lactate если initial >2, vasopressors если refractory
 *
 * Tool implementation here: combined SOFA / qSOFA workflow
 * с auto-determination categorisation (sepsis vs septic shock).
 */
import type { CalculatorTool } from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'infection',
      label: 'Подозрение на инфекцию',
      type: 'select',
      options: [
        { value: 'no', label: 'Нет' },
        { value: 'yes', label: 'Да (культуры взяты и/или антибиотики назначены)' },
      ],
    },
    { id: 'deltaSofa', label: 'ΔSOFA ≥ 2 от базального уровня', type: 'checkbox' },
    { id: 'vaso', label: 'Вазопрессоры для поддержания MAP ≥ 65 мм рт. ст.', type: 'checkbox' },
    { id: 'lactate', label: 'Лактат > 2 ммоль/л несмотря на адекватную инфузию', type: 'checkbox' },
  ],
  compute: (v) => {
    const infected = v.infection === 'yes';
    const sofa = !!v.deltaSofa;
    const vaso = !!v.vaso;
    const lact = !!v.lactate;
    if (!infected) {
      return {
        value: 'Нет критериев',
        interpretation: 'Инфекция не подозревается',
        color: '#22C55E',
        details: 'Без подозрения на инфекцию диагноз сепсиса по Sepsis-3 невозможен. Рассмотреть qSOFA / NEWS2 для общего скрининга острого ухудшения.',
        actions: ['qSOFA для скрининга', 'SIRS при неясной этиологии'],
        related: [
          { id: 'qsofa', title: 'qSOFA' },
          { id: 'sirs', title: 'SIRS' },
          { id: 'news2', title: 'NEWS2' },
        ],
        relatedCourses: [{ id: '301.9', title: 'Инфекционные болезни' }],
      };
    }
    if (infected && vaso && lact) {
      return {
        value: 'Септический шок',
        interpretation: 'Септический шок (Sepsis-3)',
        color: '#991B1B',
        details: 'Септический шок = сепсис + вазопрессоры для MAP ≥ 65 + лактат > 2 ммоль/л. Госпитальная летальность ~ 40%.',
        actions: [
          'Hour-1 Bundle (SSC): лактат, культуры, антибиотик широкого спектра, 30 мл/кг кристаллоида, вазопрессор',
          'Норэпинефрин - первая линия, цель MAP ≥ 65',
          'Повтор лактата через 2-4 ч',
          'Поиск и контроль источника инфекции (< 6-12 ч)',
          'Рассмотреть гидрокортизон 200 мг/сут при рефрактерном шоке',
        ],
        caveats: ['Вазопрессоры только после адекватной инфузии', 'Лактат может быть повышен при дисфункции печени'],
        related: [
          { id: 'sofa', title: 'SOFA' }, { id: 'qsofa', title: 'qSOFA' },
          { id: 'news2', title: 'NEWS2' }, { id: 'sirs', title: 'SIRS' },
        ],
        relatedCourses: [{ id: '301.9', title: 'Инфекционные болезни' }, { id: '300.4', title: 'Интенсивная терапия' }],
      };
    }
    if (infected && sofa) {
      return {
        value: 'Сепсис',
        interpretation: 'Сепсис (Sepsis-3)',
        color: '#EF4444',
        details: 'Сепсис = подозрение на инфекцию + ΔSOFA ≥ 2. Госпитальная летальность ~ 10%.',
        actions: [
          'Hour-1 Bundle SSC 2021', 'Антибиотик широкого спектра в течение 1 часа',
          'Инфузия 30 мл/кг кристаллоида при гипоперфузии', 'Мониторинг лактата',
          'Поиск источника и его контроль',
        ],
        related: [
          { id: 'sofa', title: 'SOFA' }, { id: 'qsofa', title: 'qSOFA' },
          { id: 'news2', title: 'NEWS2' },
        ],
        relatedCourses: [{ id: '301.9', title: 'Инфекционные болезни' }, { id: '300.4', title: 'Интенсивная терапия' }],
      };
    }
    return {
      value: 'Инфекция без сепсиса',
      interpretation: 'Инфекция без органной дисфункции',
      color: '#F59E0B',
      details: 'Есть подозрение на инфекцию, но критерии сепсиса (ΔSOFA ≥ 2) не выполнены. Продолжать наблюдение и регулярно переоценивать SOFA.',
      actions: ['Антибактериальная терапия согласно источнику', 'Повтор SOFA каждые 6-12 ч', 'qSOFA при уходе из ICU'],
      related: [
        { id: 'sofa', title: 'SOFA' }, { id: 'qsofa', title: 'qSOFA' },
      ],
      relatedCourses: [{ id: '301.9', title: 'Инфекционные болезни' }],
    };
  },
  reference: 'Singer M et al. JAMA 2016;315:801-810.',
  countries: 'Международный (SCCM/ESICM Task Force 2016, SSC 2021)',
  presets: [
    { label: 'Септический шок', values: { infection: 'yes', deltaSofa: true, vaso: true, lactate: true } },
    { label: 'Сепсис', values: { infection: 'yes', deltaSofa: true, vaso: false, lactate: false } },
    { label: 'Инфекция без сепсиса', values: { infection: 'yes', deltaSofa: false, vaso: false, lactate: false } },
  ],
  caveats: [
    'qSOFA - для быстрого скрининга вне ICU, не заменяет SOFA',
    'Базовый SOFA принимается за 0, если нет данных о предсуществующей дисфункции',
    'Лактат может ложно повышаться при печёночной недостаточности, тиамин-дефиците',
  ],
  info: `### Для чего используется
**Sepsis-3 (Singer 2016)** - определение сепсиса и септического шока через органную дисфункцию (ΔSOFA) вместо SIRS.

### Определения
- **Сепсис** = подозрение на инфекцию + **ΔSOFA ≥ 2**
- **Септический шок** = сепсис + вазопрессоры для MAP ≥ 65 + лактат > 2 ммоль/л

### qSOFA (скрининг вне ICU)
- ЧДД ≥ 22, САД ≤ 100, GCS < 15 → ≥ 2 = высокий риск

### Источник
Singer M, Deutschman CS, Seymour CW, et al. The Third International Consensus Definitions for Sepsis and Septic Shock (Sepsis-3). JAMA 2016;315:801-10.`,
};

export default runner;
