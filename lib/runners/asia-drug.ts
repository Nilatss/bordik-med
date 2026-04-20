// @ts-nocheck
/** Runner: asia-drug */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'country',
      label: 'Страна / Фармакопея',
      type: 'select',
      options: [
        { value: 'jp', label: 'Япония — Japanese Pharmacopoeia (JP XVIII)' },
        { value: 'kr', label: 'Корея — Korean Pharmacopoeia (KP XII)' },
        { value: 'cn', label: 'Китай — Chinese Pharmacopoeia (ChP 2020)' },
        { value: 'tw', label: 'Тайвань — Taiwan Herbal Pharmacopeia' },
      ],
    },
    {
      id: 'drug',
      label: 'Препарат / субстанция',
      type: 'select',
      options: [
        { value: 'paracetamol', label: 'Paracetamol / Acetaminophen' },
        { value: 'amoxicillin', label: 'Amoxicillin' },
        { value: 'metformin', label: 'Metformin HCl' },
        { value: 'insulin', label: 'Human Insulin' },
        { value: 'tcm', label: 'Традиционная медицина (ТКМ / Кампо)' },
      ],
    },
  ],
  compute: (v) => {
    const c = String(v.country);
    const d = String(v.drug);
    const ph: Record<string, { name: string; body: string; url: string; note: string }> = {
      jp: { name: 'Japanese Pharmacopoeia XVIII', body: 'PMDA (Pharmaceuticals and Medical Devices Agency)', url: 'https://www.pmda.go.jp/english/', note: 'Включает Kampo (традиционная японская медицина) отдельным томом' },
      kr: { name: 'Korean Pharmacopoeia XII', body: 'MFDS (Ministry of Food and Drug Safety)', url: 'https://www.mfds.go.kr/eng/', note: 'Обновление ~ каждые 5 лет, гармонизация с ICH' },
      cn: { name: 'Chinese Pharmacopoeia 2020', body: 'NMPA (National Medical Products Administration)', url: 'https://english.nmpa.gov.cn/', note: 'Три тома: I — ТКМ, II — химия, III — биологические препараты' },
      tw: { name: 'Taiwan Herbal Pharmacopeia', body: 'TFDA (Taiwan Food and Drug Administration)', url: 'https://www.fda.gov.tw/ENG/', note: 'Фокус на фитопрепаратах, интеграция с JP/ChP для химических стандартов' },
    };
    const p = ph[c] || { name: '—', body: '—', url: '—', note: '—' };
    const standardInfo: Record<string, string> = {
      paracetamol: 'Включён во все четыре фармакопеи. Стандарты: содержание 99,0-101,0%, тест на 4-аминофенол (примесь).',
      amoxicillin: 'JP/KP/ChP — стандарты HPLC, содержание 95,0-102,0% на безводной основе.',
      metformin: 'Стандарты HPLC, тесты на примесь диметиламина (гидразин-контроль).',
      insulin: 'Биопрепарат: тест на активность в МЕ/мг, HPLC для примесей.',
      tcm: 'Для TCM/Kampo — ботаническая идентификация, тест на тяжёлые металлы, пестициды, афлатоксины.',
    };
    return {
      value: p.name,
      unit: 'фармакопея',
      interpretation: `${p.name} · ${d}`,
      color: '#22C55E',
      details: `Страна: ${c.toUpperCase()}\nФармакопея: ${p.name}\nРегулятор: ${p.body}\nОсобенность: ${p.note}\n\nПрепарат: ${d}\nСтандарты: ${standardInfo[d] || 'См. соответствующую монографию фармакопеи.'}`,
      actions: [
        `Открыть сайт регулятора: ${p.url}`,
        'Найти монографию по названию субстанции (на английском или иероглифами)',
        'Для экспорта/импорта — проверить GMP-сертификат производителя',
        'При TCM — проверить ICH Q6B-эквивалент для биоактивных маркеров',
      ],
      caveats: [
        'Фармакопеи Азии часто не переведены полностью на английский — нужна местная экспертиза',
        'ChP 2020 обязателен для препаратов, регистрируемых в КНР',
        'Kampo и ТКМ имеют отдельные главы — требуют ботанической идентификации',
        'Гармонизация с USP/Ph.Eur. через PDG (Pharmacopoeial Discussion Group)',
      ],
      related: [
        { id: 'mims', title: 'MIMS (APAC)' },
        { id: 'martindale', title: 'Martindale' },
        { id: 'bnf', title: 'BNF' },
      ],
      relatedCourses: [
        { id: '308.1', title: 'Клиническая фармакология' },
        { id: '308.5', title: 'Международная фармакотерапия' },
      ],
    };
  },
  reference: 'JP XVIII (PMDA) · KP XII (MFDS) · ChP 2020 (NMPA) · Taiwan Herbal Pharmacopeia (TFDA)',
  countries: 'Япония · Корея · Китай · Тайвань',
  presets: [
    { label: 'Парацетамол — Япония (JP)', values: { country: 'jp', drug: 'paracetamol' } },
    { label: 'Метформин — Китай (ChP)', values: { country: 'cn', drug: 'metformin' } },
    { label: 'Kampo / TCM — Япония', values: { country: 'jp', drug: 'tcm' } },
  ],
  info: `### Для чего используется\nАзиатские национальные фармакопеи — обязательные стандарты качества ЛС для производителей и импортёров, работающих в регионе APAC.\n\n### Основные фармакопеи\n| Страна | Фармакопея | Регулятор |\n|---|---|---|\n| Япония | JP XVIII | PMDA |\n| Корея | KP XII | MFDS |\n| Китай | ChP 2020 (3 тома) | NMPA |\n| Тайвань | THP | TFDA |\n\n### Когда применять\n- Регистрация ЛС в странах APAC\n- Проверка стандартов для импорта / экспорта субстанций\n- Биоэквивалентность generics в регионе\n- Традиционная медицина (ТКМ / Kampo) — особые главы\n\n### Гармонизация\nChP, JP, USP, Ph.Eur. гармонизируют монографии через **PDG** (Pharmacopoeial Discussion Group). Не все монографии гармонизированы — для критичных препаратов требуется сверка.`,
};
export default runner;
