// @ts-nocheck
/** Runner: afs-enzian - классификация эндометриоза (rASRM 1996 + ENZIAN / #Enzian 2021) */
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
  maxScore: 150,
  inputs: [
    { id: 'periSuperficial', label: 'Поверхностный перитонеальный эндометриоз < 3 см', type: 'checkbox', points: 2 },
    { id: 'periDeep', label: 'Глубокий перитонеальный эндометриоз > 3 см', type: 'checkbox', points: 6 },
    { id: 'endoSmallR', label: 'Эндометриома правая < 3 см', type: 'checkbox', points: 4 },
    { id: 'endoLargeR', label: 'Эндометриома правая > 3 см', type: 'checkbox', points: 16 },
    { id: 'endoSmallL', label: 'Эндометриома левая < 3 см', type: 'checkbox', points: 4 },
    { id: 'endoLargeL', label: 'Эндометриома левая > 3 см', type: 'checkbox', points: 16 },
    { id: 'adhesionsOvary', label: 'Плотные спайки яичников > 2/3', type: 'checkbox', points: 16 },
    { id: 'adhesionsTube', label: 'Плотные спайки труб > 2/3', type: 'checkbox', points: 16 },
    { id: 'cdsPartial', label: 'Частичная облитерация Douglas-пространства', type: 'checkbox', points: 4 },
    { id: 'cdsComplete', label: 'Полная облитерация Douglas-пространства', type: 'checkbox', points: 40 },
    { id: 'enzianA', label: 'ENZIAN A - инвазия ректовагинальной перегородки / влагалища', type: 'checkbox', points: 0 },
    { id: 'enzianB', label: 'ENZIAN B - uterosacral связки / параметрий', type: 'checkbox', points: 0 },
    { id: 'enzianC', label: 'ENZIAN C - поражение прямой кишки', type: 'checkbox', points: 0 },
    { id: 'enzianF', label: '#Enzian F - экстрагенитальные очаги (FA аденомиоз / FU мочевой пузырь / FI кишечник)', type: 'checkbox', points: 0 },
  ],
  bands: [
    { min: 0, max: 5, label: 'rASRM I - минимальный', color: '#22C55E', interpretation: '1-5 баллов.', actions: ['Симптоматическая терапия (НПВС, КОК)', 'Мониторинг фертильности'] },
    { min: 6, max: 15, label: 'rASRM II - лёгкий', color: '#86EFAC', interpretation: '6-15 баллов.', actions: ['Гормональная супрессия', 'Лапароскопическая аблация/эксцизия при симптомах'] },
    { min: 16, max: 40, label: 'rASRM III - умеренный', color: '#F59E0B', interpretation: '16-40 баллов.', actions: ['Хирургическая эксцизия эндометриом', 'Обсудить ВРТ при бесплодии (EFI, AMH)'] },
    { min: 41, max: 150, label: 'rASRM IV - тяжёлый', color: '#DC2626', interpretation: '> 40 баллов - включает DIE.', actions: ['Мультидисциплинарная команда (ENZIAN обязателен)', 'Хирургия высокого уровня ± сегментарная резекция кишки', 'ВРТ при бесплодии'] },
  ],
  reference:
    'Revised American Society for Reproductive Medicine classification of endometriosis: 1996. Fertil Steril 1997;67:817-21. Keckstein J et al. #Enzian classification 2021. Acta Obstet Gynecol Scand 2021;100:1165-1175.',
  countries: 'Международный (ASRM, ESHRE, #Enzian)',
  presets: [
    { label: 'Минимальный (I)', values: { periSuperficial: true } },
    { label: 'Лёгкий (II)', values: { periSuperficial: true, endoSmallR: true, cdsPartial: true } },
    { label: 'Умеренный (III)', values: { periDeep: true, endoLargeR: true } },
    { label: 'Тяжёлый (IV) + DIE', values: { periDeep: true, endoLargeR: true, endoLargeL: true, cdsComplete: true, enzianA: true, enzianB: true } },
  ],
  caveats: [
    'rASRM плохо коррелирует с симптомами боли; дополнительно используется EFI для фертильности',
    'ENZIAN описывает глубокий инфильтративный эндометриоз (DIE) - 4 компартмента A/B/C + F',
    '#Enzian 2021 - унифицированная классификация, применима клинически, хирургически и при визуализации',
    'Окончательная классификация после хирургической ревизии',
  ],
  related: [
    { id: 'palm-coein', title: 'PALM-COEIN' },
    { id: 'iota', title: 'IOTA/ADNEX' },
  ],
  relatedCourses: [
    { id: '203.9', title: 'Гинекология' },
    { id: '301.4', title: 'Эндокринология' },
  ],
  info: `### rASRM 1996
Балльная система на основании лапароскопии: перитонеальные очаги + эндометриомы + спайки + облитерация Douglas.

| Стадия | Баллы |
|---|---|
| I минимальный | 1-5 |
| II лёгкий | 6-15 |
| III умеренный | 16-40 |
| IV тяжёлый | > 40 |

### ENZIAN / #Enzian 2021
Классификация глубокого инфильтративного эндометриоза (DIE):
- **A** - ректовагинальная перегородка / влагалище
- **B** - uterosacral связки / параметрий
- **C** - прямая кишка
- **F** - экстрагенитальные: FA аденомиоз, FU мочевой пузырь, FI кишечник, FO иные

### Источники
ASRM 1996. Keckstein #Enzian 2021.`,
};

export default runner;
