// @ts-nocheck
/**
 * Runner: sirs — Systemic Inflammatory Response Syndrome (Bone 1992)
 */
import type { ScoreTool } from '../tools-runners';

const runner: ScoreTool = {
  kind: 'score',
  maxScore: 4,
  inputs: [
    { id: 'temp', label: 'Температура > 38 °C или < 36 °C', type: 'checkbox', points: 1 },
    { id: 'hr', label: 'ЧСС > 90/мин', type: 'checkbox', points: 1 },
    { id: 'rr', label: 'ЧДД > 20/мин или PaCO₂ < 32 мм рт. ст.', type: 'checkbox', points: 1 },
    { id: 'wbc', label: 'Лейкоциты > 12 × 10⁹/л, < 4 × 10⁹/л или > 10 % палочкоядерных', type: 'checkbox', points: 1 },
  ],
  bands: [
    { min: 0, max: 1, label: '0–1', color: '#22C55E', description: 'SIRS не выявлен.' },
    { min: 2, max: 2, label: '2', color: '#F59E0B', description: 'SIRS присутствует — искать причину (инфекция, травма, панкреатит, ожог, ишемия).' },
    { min: 3, max: 4, label: '3–4', color: '#EF4444', description: 'Выраженный SIRS — высокий риск ухудшения, рассмотреть сепсис (Sepsis-3) и/или шок.' },
  ],
  caveats: [
    'SIRS ≥ 2 — исторический критерий сепсиса (до 2016), сейчас заменён на ΔSOFA по Sepsis-3',
    'Низкая специфичность: положителен у многих не-инфекционных состояний (травма, панкреатит, ожог)',
    'Остаётся полезным скрининговым инструментом в приёмном отделении',
    'Не оценивает органную дисфункцию — поэтому уступил место SOFA/qSOFA',
  ],
  relatedCourses: [
    { id: '301.9', title: 'Инфекционные болезни' },
    { id: '300.4', title: 'Неотложная помощь' },
  ],
  related: [
    { id: 'sepsis3', title: 'Sepsis-3' },
    { id: 'sofa', title: 'SOFA' },
    { id: 'qsofa', title: 'qSOFA' },
    { id: 'news2', title: 'NEWS2' },
  ],
  reference: 'Bone RC et al. Chest 1992;101:1644–1655. ACCP/SCCM Consensus Conference.',
  countries: 'Международный (исторический)',
  info: `### Для чего используется
**SIRS (Systemic Inflammatory Response Syndrome, Bone 1992)** — синдромное определение системной воспалительной реакции. До Sepsis-3 (2016) был основным критерием сепсиса; сейчас — общий скрининговый инструмент при инфекции, травме, панкреатите, ожоге.

### Критерии (≥ 2 из 4)
| Критерий | Пороги |
|---|---|
| T° | > 38 или < 36 °C |
| ЧСС | > 90/мин |
| ЧДД | > 20/мин или PaCO₂ < 32 |
| WBC | > 12 · 10⁹/л, < 4 · 10⁹/л, или > 10 % палочек |

### Эволюция определений сепсиса
| Консенсус | Год | Критерий сепсиса |
|---|---|---|
| Sepsis-1 | 1992 | SIRS ≥ 2 + подозрение на инфекцию |
| Sepsis-2 | 2001 | SIRS + расширенные маркеры |
| Sepsis-3 | 2016 | **ΔSOFA ≥ 2** + подозрение на инфекцию (SIRS отвергнут) |

### Источник
Bone RC, Balk RA, Cerra FB, et al. Definitions for sepsis and organ failure and guidelines for the use of innovative therapies in sepsis. Chest 1992;101:1644–55.`,
};

export default runner;
