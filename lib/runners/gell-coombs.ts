// @ts-nocheck
/** Runner: gell-coombs — Gell & Coombs hypersensitivity classification */
import type {
  CalculatorTool, ToolInput, Preset, CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'onset',
      label: 'Время развития после экспозиции',
      type: 'select',
      options: [
        { value: 'immediate', label: '< 1 ч (немедленная)' },
        { value: 'rapid', label: '1-24 ч (подострая)' },
        { value: 'delayed', label: '> 24 ч — дни (замедленная)' },
        { value: 'veryslow', label: 'Недели-месяцы' },
      ],
    },
    {
      id: 'pattern',
      label: 'Клиническая картина',
      type: 'select',
      options: [
        { value: 'urticaria', label: 'Крапивница / ангиоотёк / анафилаксия / бронхоспазм' },
        { value: 'cytopenia', label: 'Гемолиз / тромбоцитопения / лейкопения (таргет клетки)' },
        { value: 'vasculitis', label: 'Сыпь + артралгии + лихорадка + гломерулонефрит (8-14 дн)' },
        { value: 'contact', label: 'Контактный дерматит / экзема' },
        { value: 'drash', label: 'Макулопапулёзн. сыпь / DRESS / SJS / TEN (2-8 нед)' },
        { value: 'granuloma', label: 'Гранулематозное воспаление (ТБ, саркоидоз)' },
      ],
    },
    {
      id: 'trigger',
      label: 'Предполагаемый триггер',
      type: 'select',
      options: [
        { value: 'food', label: 'Пища / пыльца / эпидермис животных' },
        { value: 'drug', label: 'Лекарство (антибиотик, НПВП)' },
        { value: 'infection', label: 'Инфекция / вакцина' },
        { value: 'metal', label: 'Металл / латекс / химикат' },
        { value: 'blood', label: 'Переливание крови / Rh-конфликт' },
        { value: 'unknown', label: 'Неизвестно' },
      ],
    },
  ],
  compute: (v) => {
    const onset = String(v.onset || 'immediate');
    const pat = String(v.pattern || 'urticaria');

    let type = '';
    let mechanism = '';
    let typeNum = 0;
    let color = '#F59E0B';
    const actions: string[] = [];
    const examples: string[] = [];

    if (pat === 'urticaria' || (onset === 'immediate' && pat !== 'cytopenia')) {
      type = 'Тип I — IgE-опосредованная (немедленная)';
      typeNum = 1;
      mechanism = 'IgE на мастоцитах + базофилах → дегрануляция → гистамин, триптаза, лейкотриены, PGD2';
      color = '#EF4444';
      actions.push('Анафилаксия → адреналин 0,3-0,5 мг в/м латерал. бедра (повторять каждые 5-15 мин)');
      actions.push('H1-блокаторы, системные ГКС (вторичн. линия)');
      actions.push('β2-агонисты при бронхоспазме');
      actions.push('Тест: кожные prick-тесты, специф. IgE (ImmunoCAP), триптаза сыв. (пик 1-3 ч)');
      examples.push('Анафилаксия на пенициллин, пищевая аллергия, поллиноз, аллерг. астма');
    } else if (pat === 'cytopenia') {
      type = 'Тип II — Цитотоксическая (антитело-опосредованная)';
      typeNum = 2;
      mechanism = 'IgG/IgM против поверх. антигенов клетки → компл.-зависимый лизис + ADCC + фагоцитоз';
      color = '#F97316';
      actions.push('Отмена препарата-триггера (если лекарственная)');
      actions.push('Преднизолон 1 мг/кг, IVIG, ритуксимаб при тяж.');
      actions.push('Тест: прямой/непрямой Coombs, специф. антитела (анти-Rh, анти-ТПО и т.д.)');
      examples.push('АИГА, ИТП, ГБН, трансфузионная реакция, пемфигус, болезнь Грейвса (анти-TSH-R стимулир.), myasthenia gravis');
    } else if (pat === 'vasculitis') {
      type = 'Тип III — Иммунокомплексная';
      typeNum = 3;
      mechanism = 'Растворимые IC (Ag-Ab) осаждаются в сосудистой стенке, активируют комплемент → нейтрофильное воспаление';
      color = '#F97316';
      actions.push('Отмена триггера');
      actions.push('ГКС 0,5-1 мг/кг ± иммуносупрессор (ЦФ, ритуксимаб)');
      actions.push('Тест: C3/C4 ↓, циркулирующие ИК, биопсия (депозиты IgG + C3)');
      examples.push('Сывороточная болезнь, СКВ-нефрит, постстрепток. ГН, реакция Артуса, HSP/IgA-васкулит');
    } else if (pat === 'contact') {
      type = 'Тип IV — Замедленная, клеточно-опосредованная (IVa — Th1)';
      typeNum = 4;
      mechanism = 'CD4+ Th1 (тип IVa), Th2 (IVb), Tc (IVc), Th17 (IVd) → рекрутм. макрофагов, эозин., нейтроф.';
      color = '#F59E0B';
      actions.push('Избегание триггера');
      actions.push('Топические ГКС, ингиб. кальцинеурина (такролимус)');
      actions.push('Тест: патч-тест (72-96 ч), пери-лимфоцитарная пролиферация');
      examples.push('Контактный дерматит (никель, латекс), реакция на туберкулин (Манту)');
    } else if (pat === 'drash') {
      type = 'Тип IV — Лекарственные реакции (IVb/IVc — Т-клеточные)';
      typeNum = 4;
      mechanism = 'CD8+ цитотокс. Т-лимфоциты → апоптоз кератиноцитов (SJS/TEN); эозиноф. (DRESS)';
      color = '#EF4444';
      actions.push('НЕМЕДЛЕННАЯ отмена препарата (ключевой фактор выживаемости при SJS/TEN)');
      actions.push('Госпитализация в ожоговое отделение (TEN)');
      actions.push('Циклоспорин 3-5 мг/кг/сут или IVIG 1-2 г/кг');
      actions.push('DRESS: ГКС 0,5-2 мг/кг с медленной отменой (возможно реактивация HHV-6)');
      actions.push('HLA-тестирование у азиатов до карбамазепина (HLA-B*15:02), аллопуринола (HLA-B*58:01)');
      examples.push('SJS/TEN (сульфаниламиды, аллопуринол, карбамазепин), DRESS, фикс. лекарств. сыпь');
    } else if (pat === 'granuloma') {
      type = 'Тип IV — Гранулематозная (IVa — хронич.)';
      typeNum = 4;
      mechanism = 'Персистирующ. Ag → Th1 + макрофаги → эпителиоид. гранулёмы ± казеозный некроз';
      color = '#F59E0B';
      actions.push('Лечение основного заболевания (ТБ, саркоидоз, болезнь Крона)');
      actions.push('ГКС при саркоидозе с органной дисфункцией');
      examples.push('Туберкулёз, саркоидоз, болезнь Крона, лепра, хронический бериллиоз');
    } else {
      type = 'Неклассифицировано — дифдиагностика';
      mechanism = 'Оцените время, клинику и триггер совместно';
      actions.push('Сверьте анамнез, время, лаб. данные');
    }

    return {
      value: `Тип ${typeNum}`,
      unit: 'Gell-Coombs',
      interpretation: type,
      color,
      details: `Механизм: ${mechanism}\n\nТипичные примеры:\n${examples.map((e) => `- ${e}`).join('\n')}\n\nВремя развития: ${onset === 'immediate' ? '< 1 ч' : onset === 'rapid' ? '1-24 ч' : onset === 'delayed' ? '> 24 ч — дн.' : 'нед.-мес.'}`,
      actions,
      caveats: [
        'Многие реальные реакции смешанные (например, РА — Тип III + IV)',
        'При анафилаксии — адреналин первая линия, не антигистаминные',
        'SJS/TEN имеет летальность 10-50 % — профилактика HLA-тестированием у групп риска',
        'Современная классификация Pichler расширяет Тип IV до IVa/b/c/d',
        'Dermatohepatologic / нефрологическ. реакции могут быть смешанного типа II+III',
      ],
      scale: {
        segments: [
          { min: 0, max: 1, label: 'Тип I', color: '#EF4444' },
          { min: 1, max: 2, label: 'Тип II', color: '#F97316' },
          { min: 2, max: 3, label: 'Тип III', color: '#F97316' },
          { min: 3, max: 4, label: 'Тип IV', color: '#F59E0B' },
        ],
        current: Math.max(typeNum - 0.5, 0.5),
        unit: 'Gell-Coombs',
      },
      related: [
        { id: 'niaid', title: 'NIAID анафилаксия' },
        { id: 'naranjo', title: 'Naranjo ADR' },
      ],
      relatedCourses: [
        { id: '303.4', title: 'Иммунология' },
        { id: '306.2', title: 'Аллергология' },
      ],
    };
  },
  reference: 'Gell PGH, Coombs RRA. Clinical Aspects of Immunology. 1963. Pichler WJ. Ann Intern Med 2003;139:683.',
  countries: 'Международный',
  presets: [
    { label: 'Анафилаксия (I)', values: { onset: 'immediate', pattern: 'urticaria', trigger: 'drug' } },
    { label: 'АИГА (II)', values: { onset: 'delayed', pattern: 'cytopenia', trigger: 'drug' } },
    { label: 'Сывороточная б-нь (III)', values: { onset: 'delayed', pattern: 'vasculitis', trigger: 'drug' } },
    { label: 'Контактный дерм. (IV)', values: { onset: 'delayed', pattern: 'contact', trigger: 'metal' } },
  ],
  info: `### Для чего используется
**Классификация Gell & Coombs (1963)** — 4 типа гиперчувствительности по иммунному механизму.

### Типы
| Тип | Время | Медиатор | Пример |
|---|---|---|---|
| **I** (IgE) | < 1 ч | IgE + мастоциты | Анафилаксия, астма, поллиноз |
| **II** (цитотокс.) | мин-часы | IgG/IgM на клетке | АИГА, ИТП, ГБН, Грейвс |
| **III** (ИК) | 4-12 ч / 1-2 нед | Ag-Ab комплексы | СКВ, сыв. б-нь, постстр. ГН |
| **IV** (клет.) | 48-72 ч — нед | CD4+/CD8+ T | Контактный дерм., ТБ, DRESS |

### Расширение Pichler (2003) — Тип IV
| Подтип | Т-клетка | Эффектор | Пример |
|---|---|---|---|
| IVa | Th1 | ИФН-γ → макрофаги | ТБ, туберкулин |
| IVb | Th2 | ИЛ-4/5 → эозинофилы | DRESS, аллерг. эозиноф. |
| IVc | CTL (CD8+) | Перфорин/гранзим | SJS/TEN, контактн. |
| IVd | Th17 | ИЛ-17 → нейтрофилы | AGEP, пустулёзн. |

### Первая линия лечения
- **Тип I:** адреналин + O₂ + H1
- **Тип II:** отмена + ГКС + IVIG
- **Тип III:** ГКС + иммуносупрессор
- **Тип IV SJS/TEN:** отмена + циклоспорин/IVIG

### Источник
Gell PGH, Coombs RRA. 1963. Pichler WJ. Ann Intern Med 2003.`,
};

export default runner;
