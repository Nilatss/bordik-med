// @ts-nocheck
/** Runner: sanford */
import type {
  CalculatorTool, ToolInput, ScoreBand, Preset,
  CalculatorResult, ResultExtras, ResultScaleSegment,
} from '../tools-runners';

const runner: CalculatorTool = {
  kind: 'calculator',
  inputs: [
    {
      id: 'site',
      label: 'Очаг инфекции',
      type: 'select',
      options: [
        { value: 'cap', label: 'Внебольничная пневмония (CAP)' },
        { value: 'uti', label: 'Неосложнённый ИМП' },
        { value: 'pyelo', label: 'Острый пиелонефрит' },
        { value: 'cellulitis', label: 'Целлюлит / SSTI' },
        { value: 'meningitis', label: 'Бактериальный менингит (эмпирически)' },
        { value: 'sepsis', label: 'Сепсис (внебольничный)' },
        { value: 'endocarditis', label: 'Эндокардит нативного клапана' },
      ],
    },
    {
      id: 'pathogen',
      label: 'Предполагаемый/подтверждённый возбудитель',
      type: 'select',
      options: [
        { value: 'empiric', label: 'Эмпирически (посев не готов)' },
        { value: 'spneumo', label: 'S. pneumoniae' },
        { value: 'ecoli', label: 'E. coli' },
        { value: 'mrsa', label: 'MRSA' },
        { value: 'mssa', label: 'MSSA' },
        { value: 'pseudomonas', label: 'P. aeruginosa' },
        { value: 'nmeningitidis', label: 'N. meningitidis' },
      ],
    },
  ],
  compute: (v) => {
    const s = String(v.site);
    const p = String(v.pathogen);
    const key = `${s}|${p}`;
    const map: Record<string, { first: string; alt: string; duration: string; note: string }> = {
      'cap|empiric': { first: 'Амбул.: Амоксициллин 1 г × 3 ИЛИ Азитромицин 500 мг × 1; стационар: Цефтриаксон 1-2 г + Азитромицин 500 мг', alt: 'Доксициклин 100 мг × 2; респираторный ФХ (левофлоксацин 750 мг × 1)', duration: '5-7 дней (амбул.), 7 дней (стационар)', note: 'IDSA/ATS 2019 CAP guideline' },
      'cap|spneumo': { first: 'Амоксициллин 1 г × 3 (чувств.) ИЛИ Цефтриаксон 2 г × 1 в/в', alt: 'Левофлоксацин, моксифлоксацин (при PCN-аллергии)', duration: '5-7 дней (афебрильность ≥ 48 ч)', note: 'Penicillin-нечувствительный — цефтриаксон + ванкомицин' },
      'uti|ecoli': { first: 'Нитрофурантоин 100 мг × 2 × 5 дней ИЛИ фосфомицин 3 г однократно', alt: 'ТМП/СМК 160/800 × 2 × 3 дня (если резистентность < 20%)', duration: '3-5 дней', note: 'IDSA 2011 uncomplicated UTI' },
      'pyelo|ecoli': { first: 'Цефтриаксон 1 г × 1 в/в → пероральный ципрофлоксацин 500 мг × 2', alt: 'ТМП/СМК, пиперациллин-тазобактам при сепсисе', duration: '7-14 дней (7 при ФХ)', note: 'Учитывать локальный антибиотикограмм' },
      'cellulitis|mssa': { first: 'Цефалексин 500 мг × 4 ИЛИ Диклоксациллин 500 мг × 4 (в/в: цефазолин 2 г × 3)', alt: 'Клиндамицин 450 мг × 4 (при PCN-аллергии)', duration: '5-7 дней', note: 'IDSA SSTI 2014' },
      'cellulitis|mrsa': { first: 'ТМП/СМК 160/800 × 2 ИЛИ Доксициклин 100 мг × 2 (амбул.); Ванкомицин в/в (стационар)', alt: 'Линезолид, даптомицин', duration: '5-7 дней', note: 'В/в ванкомицин с AUC-мониторингом' },
      'meningitis|empiric': { first: 'Цефтриаксон 2 г × 2 + Ванкомицин + Дексаметазон 10 мг × 4 × 4 дня', alt: '+ Ампициллин 2 г × 6 при возрасте > 50 или иммуносупрессии (Listeria)', duration: '7-21 день (зависит от возбудителя)', note: 'Дексаметазон ПЕРЕД первой дозой АБ' },
      'meningitis|nmeningitidis': { first: 'Цефтриаксон 2 г × 2 в/в', alt: 'Пенициллин G 4 млн ЕД × 6 (при чувствительности)', duration: '7 дней', note: 'Химиопрофилактика контактов: ципро 500 мг однократно' },
      'sepsis|empiric': { first: 'Пиперациллин-тазобактам 4,5 г × 4 ± Ванкомицин (при риске MRSA)', alt: 'Меропенем 1 г × 3 (при ESBL-риске) + ванкомицин', duration: '7-10 дней (де-эскалация после посева)', note: 'SSC 2021 — АБ в первый час' },
      'endocarditis|mssa': { first: 'Нафциллин/оксациллин 12 г/сут ИЛИ цефазолин 6 г/сут', alt: 'Ванкомицин (при PCN-аллергии)', duration: '6 недель (нативный клапан); + гентамицин 3-5 дней не рекомендован (AHA 2015)', note: 'Добавить рифампицин при протезе' },
      'endocarditis|mrsa': { first: 'Ванкомицин AUC 400-600 ИЛИ даптомицин 10-12 мг/кг', alt: 'Цефтаролин при неудаче', duration: '6 недель', note: 'AHA/IDSA 2015' },
    };
    const e = map[key] || { first: 'См. Sanford Guide для точной комбинации', alt: '—', duration: 'См. руководство', note: 'Уточните в приложении Sanford Guide' };
    return {
      value: e.first.split(' ИЛИ ')[0].split(';')[0],
      unit: 'Sanford',
      interpretation: `${s} · ${p}`,
      color: '#22C55E',
      details: `Очаг: ${s}. Возбудитель: ${p}.\n\n**Первая линия:** ${e.first}\n\n**Альтернатива:** ${e.alt}\n\n**Длительность:** ${e.duration}\n\n**Заметка:** ${e.note}`,
      actions: [
        'Открыть приложение Sanford Guide (iOS/Android) или webedition.sanfordguide.com',
        'Навигация: Tables → по синдрому или возбудителю',
        'Проверить локальный антибиотикограмм больницы (может отличаться от US-нормативов)',
        'Де-эскалировать по результатам посева / чувствительности через 48-72 ч',
      ],
      caveats: [
        'Sanford Guide ориентирован на US-эпидемиологию; в РФ/ЕС учитывать локальную резистентность',
        'Обновляется ежегодно; мобильное приложение — непрерывно',
        'Для MDR/XDR — консультация клинического фармаколога',
        'Педиатрические дозы — отдельная версия Sanford Guide Pediatric',
        'При беременности/лактации — сверить с teratology данными',
      ],
      related: [
        { id: 'vanco-auc', title: 'Ванкомицин AUC/MIC' },
        { id: 'aminoglycoside', title: 'Аминогликозиды' },
        { id: 'lexicomp', title: 'Lexicomp (взаимодействия АБ)' },
      ],
      relatedCourses: [
        { id: '305.1', title: 'Общая инфектология' },
        { id: '305.2', title: 'Рациональная антибиотикотерапия' },
        { id: '308.3', title: 'Лекарственные взаимодействия' },
      ],
    };
  },
  reference: 'Gilbert DN et al. The Sanford Guide to Antimicrobial Therapy. Antimicrobial Therapy Inc. https://www.sanfordguide.com/',
  countries: 'США (IDSA) · Международный',
  presets: [
    { label: 'ВП — эмпирически', values: { site: 'cap', pathogen: 'empiric' } },
    { label: 'ИМП — E. coli', values: { site: 'uti', pathogen: 'ecoli' } },
    { label: 'Целлюлит — MRSA', values: { site: 'cellulitis', pathogen: 'mrsa' } },
  ],
  info: `### Для чего используется\n**Sanford Guide to Antimicrobial Therapy** — золотой стандарт справочника антимикробной терапии в США. Ежегодно обновляется, используется в рекомендациях IDSA.\n\n### Структура\n- Tables по синдрому (пневмония, сепсис, менингит...)\n- По возбудителю (S. aureus, E. coli, P. aeruginosa...)\n- Дозы, длительность, альтернативы при аллергии/резистентности\n- Педиатрия / беременность\n- HIV / HCV / грибковые / паразитарные\n\n### Форматы\n- Мобильное приложение (iOS/Android) — самое актуальное\n- Печатная "pocket edition" — ежегодно\n- Webedition (подписка)\n\n### Когда применять\n- Эмпирический выбор АБ до посева\n- Де-эскалация после идентификации возбудителя\n- Подбор дозы при почечной/печёночной недостаточности\n- Комбинированная терапия (эндокардит, туберкулёз, HIV)\n\n### Источник\nhttps://www.sanfordguide.com/`,
};
export default runner;
