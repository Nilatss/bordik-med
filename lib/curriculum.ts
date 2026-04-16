export type Difficulty = 'basic' | 'intermediate' | 'advanced';
export type LessonType = 'main' | 'physiology' | 'pathophysiology' | 'clinic' | 'protocol' | 'errors';
export type SectionId = 'basic' | 'advanced' | 'expert' | 'expansion' | 'territories' | 'frontiers' | 'calculators' | 'subjects';

export interface Course {
  id: string;
  moduleId: number;
  title: string;
  description: string;
  tags: string[];
  difficulty: Difficulty;
}

export interface Module {
  id: number;
  sectionId: SectionId;
  title: string;
  description: string;
  color: string;
  courses: Course[];
}

export interface Section {
  id: SectionId;
  title: string;
  description: string;
  icon: string;
}

export const LESSON_TYPE_LABELS: Record<LessonType, { label: string; icon: string; description: string }> = {
  main: { label: 'Основная лекция', icon: '📖', description: 'Полная академическая лекция' },
  physiology: { label: 'Физиология', icon: '🧬', description: 'Молекулярные и клеточные механизмы' },
  pathophysiology: { label: 'Патофизиология', icon: '🔬', description: 'Что ломается и почему' },
  clinic: { label: 'Клиника', icon: '🏥', description: 'Диагностика и клинические случаи' },
  protocol: { label: 'Протокол', icon: '📋', description: 'Пошаговый алгоритм действий' },
  errors: { label: 'Ошибки', icon: '⚠️', description: 'Критические ошибки и как их избежать' },
};

export const sections: Section[] = [
  { id: 'basic', title: 'Базовый', description: 'Фундаментальная медицина — от доклиники до профессиональных основ', icon: '📘' },
  { id: 'advanced', title: 'Продвинутый', description: 'Углублённые клинические, хирургические специальности и технологии', icon: '📗' },
  { id: 'expert', title: 'Экспертный', description: 'Экспертная практика, лидерство, исследования, философия медицины', icon: '📕' },
  { id: 'expansion', title: 'Расширение', description: '5 пластов: узкие специальности, углублённая фундаменталка, межсистемные темы', icon: '📒' },
  { id: 'territories', title: 'Территории', description: 'Диагностические технологии, хирургические основы, профилактика, популяции, смежные дисциплины', icon: '📓' },
  { id: 'frontiers', title: 'Фронтиры', description: 'Узкие специальности, тропическая медицина, иммуноонкология, танатология, медицина будущего', icon: '🔬' },
  { id: 'calculators', title: 'Калькуляторы', description: 'Медицинские калькуляторы, шкалы, формулы и скоринговые системы по специальностям', icon: '🧮' },
  { id: 'subjects', title: 'Специальности', description: 'Предметы по уровням: санинструктор, парамедик, военный врач, реаниматолог + направления', icon: '🎓' },
];

// ════════════════════════════════════════════════════════════
// РАЗДЕЛ: БАЗОВЫЙ (Блоки 0–14)
// ════════════════════════════════════════════════════════════

const basicModules: Module[] = [
  {
    id: 0, sectionId: 'basic', title: 'Доклинический фундамент', color: '#6c757d',
    description: 'Математика, физика, химия и биология клетки',
    courses: [
      { id: '0.1', moduleId: 0, title: 'Математика и физика для медика', description: 'Единицы измерения, pH, осмолярность, закон Пуазейля, газовые законы, диффузия, радиация.', tags: ['физика', 'pH', 'осмолярность'], difficulty: 'basic' },
      { id: '0.2', moduleId: 0, title: 'Общая химия для медика', description: 'Буферные системы, ОВР, растворы, ферментативная кинетика.', tags: ['химия', 'буферы', 'ферменты'], difficulty: 'basic' },
      { id: '0.3', moduleId: 0, title: 'Биология клетки', description: 'Мембранный транспорт, потенциал действия, митохондрии, сигнальные пути, воспаление.', tags: ['клетка', 'мембрана'], difficulty: 'basic' },
    ],
  },
  {
    id: 1, sectionId: 'basic', title: 'Биохимия', color: '#d63031',
    description: 'Углеводы, липиды, белки, нуклеиновые кислоты, КОС',
    courses: [
      { id: '1.1', moduleId: 1, title: 'Углеводы', description: 'Гликолиз, глюконеогенез, цикл Кребса, гликоген, ПФП.', tags: ['углеводы', 'гликолиз'], difficulty: 'basic' },
      { id: '1.2', moduleId: 1, title: 'Липиды', description: 'β-окисление, холестерин, эйкозаноиды, атеросклероз.', tags: ['липиды', 'холестерин'], difficulty: 'basic' },
      { id: '1.3', moduleId: 1, title: 'Белки и аминокислоты', description: 'Структуры белка, ферменты, протеолиз, амилоидоз.', tags: ['белки', 'ферменты'], difficulty: 'basic' },
      { id: '1.4', moduleId: 1, title: 'Нуклеиновые кислоты', description: 'ДНК, РНК, генетический код, мутации, эпигенетика.', tags: ['ДНК', 'мутации'], difficulty: 'basic' },
      { id: '1.5', moduleId: 1, title: 'Кислотно-основное состояние', description: 'pH, буферные системы, ацидоз/алкалоз, анализ ABG.', tags: ['КОС', 'ацидоз'], difficulty: 'intermediate' },
      { id: '1.6', moduleId: 1, title: 'Водно-электролитный баланс', description: 'Натрий, калий, кальций, магний, осмолярность.', tags: ['электролиты', 'натрий'], difficulty: 'intermediate' },
    ],
  },
  {
    id: 2, sectionId: 'basic', title: 'Анатомия', color: '#e07820',
    description: 'Все системы организма — от общей до клинической анатомии',
    courses: [
      { id: '2.1', moduleId: 2, title: 'Общая анатомия', description: 'Оси, плоскости, терминология, ткани, фасции.', tags: ['анатомия', 'терминология'], difficulty: 'basic' },
      { id: '2.2', moduleId: 2, title: 'Опорно-двигательный аппарат', description: 'Кости, суставы, скелет, мышцы, механизм сокращения.', tags: ['кости', 'мышцы'], difficulty: 'basic' },
      { id: '2.3', moduleId: 2, title: 'Сердечно-сосудистая система', description: 'Сердце, коронарные артерии, аорта, лимфатическая система.', tags: ['сердце', 'аорта'], difficulty: 'basic' },
      { id: '2.4', moduleId: 2, title: 'Дыхательная система', description: 'ДП, гортань, трахея, бронхи, лёгкие, плевра, диафрагма.', tags: ['лёгкие', 'плевра'], difficulty: 'basic' },
      { id: '2.5', moduleId: 2, title: 'Пищеварительная система', description: 'ЖКТ, печень, поджелудочная, брюшина.', tags: ['ЖКТ', 'печень'], difficulty: 'basic' },
      { id: '2.6', moduleId: 2, title: 'Мочеполовая система', description: 'Почки, нефрон, мочеточники, половые органы.', tags: ['почки', 'нефрон'], difficulty: 'basic' },
      { id: '2.7', moduleId: 2, title: 'Нервная система', description: 'ЦНС, черепные нервы I-XII, сплетения, ВНС.', tags: ['ЦНС', 'черепные нервы'], difficulty: 'intermediate' },
      { id: '2.8', moduleId: 2, title: 'Эндокринная система', description: 'Гипофиз, щитовидная, надпочечники, островки Лангерганса.', tags: ['эндокринная', 'гипофиз'], difficulty: 'basic' },
      { id: '2.9', moduleId: 2, title: 'Клиническая анатомия', description: 'Треугольники шеи, зоны I/II/III, квадранты живота, доступы.', tags: ['топография', 'доступы'], difficulty: 'intermediate' },
    ],
  },
  {
    id: 3, sectionId: 'basic', title: 'Гистология и эмбриология', color: '#c9a520',
    description: 'Микроскопическое строение тканей и органов',
    courses: [
      { id: '3.1', moduleId: 3, title: 'Общая гистология', description: 'Эпителий, соединительная, мышечная и нервная ткань, кровь.', tags: ['гистология', 'ткани'], difficulty: 'basic' },
      { id: '3.2', moduleId: 3, title: 'Частная гистология органов', description: 'Сердце, лёгкие, почки, печень, кожа.', tags: ['кардиомиоциты', 'гепатоциты'], difficulty: 'intermediate' },
      { id: '3.3', moduleId: 3, title: 'Эмбриология', description: 'Гаструляция, органогенез, критические периоды, пороки.', tags: ['эмбриология', 'пороки'], difficulty: 'basic' },
    ],
  },
  {
    id: 4, sectionId: 'basic', title: 'Физиология', color: '#20b05a',
    description: 'Нормальная физиология всех систем',
    courses: [
      { id: '4.1', moduleId: 4, title: 'Физиология крови', description: 'Эритроциты, кривая HbO2, гемостаз, каскад свёртывания, группы крови.', tags: ['кровь', 'гемостаз'], difficulty: 'basic' },
      { id: '4.2', moduleId: 4, title: 'Физиология ССС', description: 'Потенциал действия сердца, ЭКГ, закон Старлинга, регуляция АД.', tags: ['ЭКГ', 'гемодинамика'], difficulty: 'intermediate' },
      { id: '4.3', moduleId: 4, title: 'Физиология дыхания', description: 'Лёгочные объёмы, диффузия газов, V/Q, регуляция дыхания.', tags: ['дыхание', 'газообмен'], difficulty: 'intermediate' },
      { id: '4.4', moduleId: 4, title: 'Физиология почек', description: 'Нефрон, КФ, реабсорбция, РААС, регуляция КОС.', tags: ['почки', 'РААС'], difficulty: 'intermediate' },
      { id: '4.5', moduleId: 4, title: 'Физиология нервной системы', description: 'Синапс, нейромедиаторы, рефлексы, ВНС, ноцицепция, ГЭБ.', tags: ['нейроны', 'медиаторы'], difficulty: 'intermediate' },
      { id: '4.6', moduleId: 4, title: 'Физиология пищеварения', description: 'Моторика ЖКТ, секреция, всасывание, микробиом.', tags: ['ЖКТ', 'секреция'], difficulty: 'basic' },
      { id: '4.7', moduleId: 4, title: 'Физиология эндокринной системы', description: 'Гипоталамо-гипофизарная ось, T3/T4, инсулин, кортизол.', tags: ['гормоны', 'инсулин'], difficulty: 'intermediate' },
      { id: '4.8', moduleId: 4, title: 'Физиология иммунной системы', description: 'Врождённый и адаптивный иммунитет, антитела, комплемент.', tags: ['иммунитет', 'антитела'], difficulty: 'intermediate' },
    ],
  },
  {
    id: 5, sectionId: 'basic', title: 'Патофизиология', color: '#15bbb4',
    description: 'Патология клетки, воспаление, шок, опухоли',
    courses: [
      { id: '5.1', moduleId: 5, title: 'Общая патология клетки', description: 'Некроз, апоптоз, дистрофии, атрофия, гипертрофия, метаплазия.', tags: ['некроз', 'апоптоз'], difficulty: 'intermediate' },
      { id: '5.2', moduleId: 5, title: 'Воспаление', description: 'Острое и хроническое воспаление, медиаторы, гранулёмы.', tags: ['воспаление', 'TNF-α'], difficulty: 'intermediate' },
      { id: '5.3', moduleId: 5, title: 'Нарушения кровообращения', description: 'Тромбоз, эмболия, инфаркт, отёк, ДВС-синдром.', tags: ['тромбоз', 'ДВС'], difficulty: 'intermediate' },
      { id: '5.4', moduleId: 5, title: 'Опухолевый процесс', description: 'Онкогенез, паранеопластические синдромы, TNM.', tags: ['онкология', 'TNM'], difficulty: 'intermediate' },
      { id: '5.5', moduleId: 5, title: 'Патофизиология шока', description: 'Все виды шока, SIRS, MODS.', tags: ['шок', 'MODS'], difficulty: 'advanced' },
      { id: '5.6', moduleId: 5, title: 'Патофизиология боли', description: 'Ноцицепция, сенситизация, нейропатическая боль.', tags: ['боль', 'ноцицепция'], difficulty: 'intermediate' },
    ],
  },
  {
    id: 6, sectionId: 'basic', title: 'Микробиология', color: '#2980e8',
    description: 'Бактерии, вирусы, антибиотики, инфекционный контроль',
    courses: [
      { id: '6.1', moduleId: 6, title: 'Общая микробиология', description: 'Строение бактерий, окраска по Граму, токсины.', tags: ['бактерии', 'Грам'], difficulty: 'basic' },
      { id: '6.2', moduleId: 6, title: 'Клинически важные бактерии', description: 'Staph, Strep, E.coli, Pseudomonas, Clostridium, TB.', tags: ['MRSA', 'туберкулёз'], difficulty: 'intermediate' },
      { id: '6.3', moduleId: 6, title: 'Вирусология', description: 'Герпес, грипп, SARS-CoV-2, ВИЧ, гепатиты.', tags: ['вирусы', 'ВИЧ'], difficulty: 'intermediate' },
      { id: '6.4', moduleId: 6, title: 'Грибки и паразиты', description: 'Candida, Aspergillus, малярия, токсоплазма, гельминты.', tags: ['грибки', 'малярия'], difficulty: 'intermediate' },
      { id: '6.5', moduleId: 6, title: 'Антибиотики и резистентность', description: 'β-лактамы, аминогликозиды, фторхинолоны, ESBL, механизмы резистентности.', tags: ['антибиотики', 'ESBL'], difficulty: 'intermediate' },
      { id: '6.6', moduleId: 6, title: 'Инфекционный контроль', description: 'Пути передачи, нозокомиальные инфекции, стерилизация.', tags: ['HAI', 'стерилизация'], difficulty: 'basic' },
    ],
  },
  {
    id: 7, sectionId: 'basic', title: 'Фармакология', color: '#7c50d8',
    description: 'От фармакокинетики до антидотов',
    courses: [
      { id: '7.1', moduleId: 7, title: 'Общая фармакология', description: 'Фармакокинетика (ADME), фармакодинамика, рецепторы.', tags: ['фармакокинетика', 'CYP450'], difficulty: 'basic' },
      { id: '7.2', moduleId: 7, title: 'Вегетативная фармакология', description: 'Холинергические, антихолинергические, симпатомиметики.', tags: ['атропин', 'адреналин'], difficulty: 'intermediate' },
      { id: '7.3', moduleId: 7, title: 'Сердечно-сосудистые препараты', description: 'Антиаритмики, антигипертензивные, антикоагулянты.', tags: ['гепарин', 'варфарин'], difficulty: 'intermediate' },
      { id: '7.4', moduleId: 7, title: 'Анальгетики', description: 'Опиоиды, НПВС, парацетамол, кетамин.', tags: ['морфин', 'кетамин'], difficulty: 'intermediate' },
      { id: '7.5', moduleId: 7, title: 'Нейропсихофармакология', description: 'Антидепрессанты, антипсихотики, бензодиазепины.', tags: ['СИОЗС', 'бензодиазепины'], difficulty: 'intermediate' },
      { id: '7.6', moduleId: 7, title: 'Препараты интенсивной терапии', description: 'Вазопрессоры, инотропы, седация, миорелаксанты.', tags: ['норадреналин', 'пропофол'], difficulty: 'advanced' },
      { id: '7.7', moduleId: 7, title: 'Особые группы', description: 'Антидоты, препараты при анафилаксии, противосудорожные.', tags: ['антидоты', 'анафилаксия'], difficulty: 'advanced' },
    ],
  },
  {
    id: 8, sectionId: 'basic', title: 'Пропедевтика и обследование', color: '#d4316a',
    description: 'Клиническое обследование, ЭКГ, рентген, УЗИ, лаборатория',
    courses: [
      { id: '8.1', moduleId: 8, title: 'Методология обследования', description: 'Жалобы (OPQRSTA), анамнез, семейный и социальный.', tags: ['анамнез', 'OPQRSTA'], difficulty: 'basic' },
      { id: '8.2', moduleId: 8, title: 'Общий осмотр', description: 'Сознание, конституция, кожа, лимфоузлы, гидратация.', tags: ['осмотр', 'GCS'], difficulty: 'basic' },
      { id: '8.3', moduleId: 8, title: 'Сердечно-сосудистый осмотр', description: 'Аускультация, тоны, шумы, пульс, АД.', tags: ['аускультация', 'шумы'], difficulty: 'intermediate' },
      { id: '8.4', moduleId: 8, title: 'Осмотр органов дыхания', description: 'Голосовое дрожание, перкуссия, хрипы, крепитация.', tags: ['хрипы', 'перкуссия'], difficulty: 'intermediate' },
      { id: '8.5', moduleId: 8, title: 'Осмотр живота', description: 'Пальпация, перкуссия, аускультация, симптомы раздражения.', tags: ['живот', 'пальпация'], difficulty: 'intermediate' },
      { id: '8.6', moduleId: 8, title: 'Неврологический осмотр', description: 'Черепные нервы, рефлексы, менингеальные знаки.', tags: ['неврология', 'рефлексы'], difficulty: 'intermediate' },
      { id: '8.7', moduleId: 8, title: 'Инструментальная диагностика', description: 'ЭКГ, рентген, FAST/POCUS, лаборатория (ОАК, биохимия, ABG).', tags: ['ЭКГ', 'FAST'], difficulty: 'intermediate' },
    ],
  },
  {
    id: 9, sectionId: 'basic', title: 'Клинические дисциплины', color: '#8a6f2c',
    description: 'Терапия, хирургия, неврология, психиатрия, педиатрия',
    courses: [
      { id: '9.1', moduleId: 9, title: 'Терапия / Внутренние болезни', description: 'Кардиология, пульмонология, гастро, нефрология, гематология, эндокринология.', tags: ['терапия', 'кардиология'], difficulty: 'advanced' },
      { id: '9.2', moduleId: 9, title: 'Хирургия', description: 'Общая, травматология, торакальная, сосудистая, нейрохирургия.', tags: ['хирургия', 'травма'], difficulty: 'advanced' },
      { id: '9.3', moduleId: 9, title: 'Неврология', description: 'Инсульт, эпилепсия, менингит, Паркинсон, Гийена-Барре.', tags: ['инсульт', 'менингит'], difficulty: 'advanced' },
      { id: '9.4', moduleId: 9, title: 'Психиатрия', description: 'Депрессия, шизофрения, ПТСР, делирий, суицидальный риск.', tags: ['депрессия', 'ПТСР'], difficulty: 'intermediate' },
      { id: '9.5', moduleId: 9, title: 'Акушерство и гинекология', description: 'Беременность, эклампсия, HELLP, акушерские кровотечения.', tags: ['беременность', 'PPH'], difficulty: 'advanced' },
      { id: '9.6', moduleId: 9, title: 'Педиатрия', description: 'PALS, дыхательная недостаточность, сепсис, травма у детей.', tags: ['педиатрия', 'PALS'], difficulty: 'advanced' },
      { id: '9.7', moduleId: 9, title: 'Анестезиология и реаниматология', description: 'Общая анестезия, RSI, ИВЛ, сепсис, ОРДС.', tags: ['анестезия', 'ИВЛ'], difficulty: 'advanced' },
    ],
  },
  {
    id: 10, sectionId: 'basic', title: 'Экстренная медицина', color: '#e74c3c',
    description: 'ABCDE, критические состояния, отравления',
    courses: [
      { id: '10.1', moduleId: 10, title: 'Оценка тяжести состояния', description: 'ABCDE, NEWS2, qSOFA, триаж START/SALT.', tags: ['ABCDE', 'триаж'], difficulty: 'intermediate' },
      { id: '10.2', moduleId: 10, title: 'Критические состояния дыхания', description: 'ОДН типы I/II, стридор, бронхоспазм.', tags: ['ОДН', 'стридор'], difficulty: 'advanced' },
      { id: '10.3', moduleId: 10, title: 'Критические кардиологические состояния', description: 'Остановка сердца, BLS/ALS, ОКС/STEMI, тампонада.', tags: ['СЛР', 'STEMI'], difficulty: 'advanced' },
      { id: '10.4', moduleId: 10, title: 'Неврологические неотложные', description: 'Инсульт, эпистатус, нарушение сознания, менингит.', tags: ['инсульт', 'кома'], difficulty: 'advanced' },
      { id: '10.5', moduleId: 10, title: 'Анафилаксия', description: 'IgE-реакция, адреналин 0.3-0.5 мг в/м, двухфазная.', tags: ['анафилаксия', 'адреналин'], difficulty: 'intermediate' },
      { id: '10.6', moduleId: 10, title: 'Отравления и передозировки', description: 'Опиоиды, ТЦА, парацетамол, угарный газ, ФОС.', tags: ['отравления', 'антидоты'], difficulty: 'advanced' },
      { id: '10.7', moduleId: 10, title: 'Экологические поражения', description: 'Гипотермия, тепловой удар, утопление, высотная болезнь.', tags: ['гипотермия', 'утопление'], difficulty: 'intermediate' },
    ],
  },
  {
    id: 11, sectionId: 'basic', title: 'Военная и тактическая медицина', color: '#556b2f',
    description: 'TCCC, полевые ДП, взрывная травма, CBRN',
    courses: [
      { id: '11.1', moduleId: 11, title: 'Основы TCCC', description: '3 фазы, M.A.R.C.H., отличия от гражданской медицины.', tags: ['TCCC', 'MARCH'], difficulty: 'intermediate' },
      { id: '11.2', moduleId: 11, title: 'Кровотечения в бою', description: 'Жгуты CAT, тампонада, гемостатики, TXA, IO доступ.', tags: ['жгут', 'TXA'], difficulty: 'intermediate' },
      { id: '11.3', moduleId: 11, title: 'ДП в полевых условиях', description: 'NPA, крикотиротомия, декомпрессия пневмоторакса.', tags: ['крикотиротомия', 'NPA'], difficulty: 'advanced' },
      { id: '11.4', moduleId: 11, title: 'Взрывная травма', description: '4 типа blast-травмы, blast lung, bTBI.', tags: ['blast', 'bTBI'], difficulty: 'advanced' },
      { id: '11.5', moduleId: 11, title: 'Сортировка (Triage)', description: 'START, SALT, NATO triage, MASCAL.', tags: ['triage', 'START'], difficulty: 'intermediate' },
      { id: '11.6', moduleId: 11, title: 'CBRN медицина', description: 'НПА, иприт, хлор, цианиды, радиация, биоагенты.', tags: ['CBRN', 'ФОС'], difficulty: 'advanced' },
      { id: '11.7', moduleId: 11, title: 'Полевая хирургия', description: 'Damage control, фасциотомия, ампутация, открытые переломы.', tags: ['damage control', 'раны'], difficulty: 'advanced' },
    ],
  },
  {
    id: 12, sectionId: 'basic', title: 'Специальные темы', color: '#9b59b6',
    description: 'Ожоги, педиатрические неотложные, катастрофы, авиа/дайвинг/горная медицина',
    courses: [
      { id: '12.1', moduleId: 12, title: 'Ожоги', description: 'Правило девяток, Паркланд, дыхательные ожоги, химические.', tags: ['ожоги', 'Паркланд'], difficulty: 'intermediate' },
      { id: '12.2', moduleId: 12, title: 'Педиатрические неотложные', description: 'Детская СЛР, круп, эпиглоттит, бронхиолит.', tags: ['педиатрия', 'круп'], difficulty: 'advanced' },
      { id: '12.3', moduleId: 12, title: 'Акушерские неотложные', description: 'Преэклампсия, HELLP, PPH (4T), дистоция.', tags: ['акушерство', 'PPH'], difficulty: 'advanced' },
      { id: '12.4', moduleId: 12, title: 'Медицина катастроф', description: 'ICS, MASCAL, психологическая помощь, ПТСР.', tags: ['катастрофы', 'ICS'], difficulty: 'intermediate' },
      { id: '12.5', moduleId: 12, title: 'Авиационная медицина', description: 'Физиология высоты, перегрузки, дезориентация.', tags: ['авиация', 'G-force'], difficulty: 'intermediate' },
      { id: '12.6', moduleId: 12, title: 'Дайвинг-медицина', description: 'ДКБ, воздушная эмболия, баротравма, рекомпрессия.', tags: ['дайвинг', 'кессон'], difficulty: 'intermediate' },
      { id: '12.7', moduleId: 12, title: 'Горная медицина', description: 'AMS, HACE, HAPE, акклиматизация, обморожения.', tags: ['HACE', 'HAPE'], difficulty: 'intermediate' },
    ],
  },
  {
    id: 13, sectionId: 'basic', title: 'Навыки и процедуры', color: '#2ecc71',
    description: 'Венозный доступ, ДП, плевральные и кардиологические процедуры',
    courses: [
      { id: '13.1', moduleId: 13, title: 'Венозный доступ', description: 'ЦВК, IO (EZ-IO), периферическая венепункция, венесекция.', tags: ['ЦВК', 'IO'], difficulty: 'intermediate' },
      { id: '13.2', moduleId: 13, title: 'Дыхательные пути', description: 'BVM, воздуховоды, LMA, интубация, крикотиротомия.', tags: ['интубация', 'LMA'], difficulty: 'advanced' },
      { id: '13.3', moduleId: 13, title: 'Плевральные процедуры', description: 'Торакоцентез, дренирование, игольная декомпрессия.', tags: ['торакоцентез', 'дренаж'], difficulty: 'advanced' },
      { id: '13.4', moduleId: 13, title: 'Кардиологические процедуры', description: 'Дефибрилляция, кардиоверсия, ЭКС, перикардиоцентез.', tags: ['дефибрилляция', 'перикардиоцентез'], difficulty: 'advanced' },
      { id: '13.5', moduleId: 13, title: 'Прочие процедуры', description: 'Катетер, НГ зонд, люмбальная пункция, REBOA.', tags: ['люмбальная пункция', 'REBOA'], difficulty: 'advanced' },
    ],
  },
  {
    id: 14, sectionId: 'basic', title: 'Профессиональные основы', color: '#34495e',
    description: 'Этика, право, EBM, клиническое мышление, коммуникация',
    courses: [
      { id: '14.1', moduleId: 14, title: 'Медицинская этика', description: 'Автономия, благодеяние, согласие, DNR.', tags: ['этика', 'согласие'], difficulty: 'basic' },
      { id: '14.2', moduleId: 14, title: 'Медицинское право', description: 'Врачебная ошибка, халатность, ответственность.', tags: ['право', 'ошибка'], difficulty: 'basic' },
      { id: '14.3', moduleId: 14, title: 'Доказательная медицина', description: 'Уровни доказательности, PICO, OR/RR/NNT.', tags: ['EBM', 'мета-анализ'], difficulty: 'intermediate' },
      { id: '14.4', moduleId: 14, title: 'Клиническое мышление', description: 'Когнитивные ошибки, дифдиагноз, бритва Оккама.', tags: ['bias', 'дифдиагноз'], difficulty: 'intermediate' },
      { id: '14.5', moduleId: 14, title: 'Коммуникация', description: 'SBAR, SPIKES, CRM, документация.', tags: ['SBAR', 'CRM'], difficulty: 'basic' },
    ],
  },
];

// ════════════════════════════════════════════════════════════
// РАЗДЕЛ: ПРОДВИНУТЫЙ (Уровни 1–6)
// ════════════════════════════════════════════════════════════

const advancedModules: Module[] = [
  // Уровень 1 — Углублённые клинические специальности
  {
    id: 101, sectionId: 'advanced', title: 'Кардиология продвинутая', color: '#e74c3c',
    description: 'Инвазивная кардиология, электрофизиология, продвинутая СН',
    courses: [
      { id: '101.1', moduleId: 101, title: 'Инвазивная кардиология', description: 'Катетеризация, коронарография, PCI, ВАБК, TAVI.', tags: ['PCI', 'TAVI', 'катетеризация'], difficulty: 'advanced' },
      { id: '101.2', moduleId: 101, title: 'Электрофизиология', description: 'Механизмы аритмий, аблация, ЭКС, ИКД, CRT.', tags: ['аблация', 'ЭКС', 'ИКД'], difficulty: 'advanced' },
      { id: '101.3', moduleId: 101, title: 'СН продвинутая', description: 'Swan-Ganz, PiCCO, Impella, VA-ECMO, трансплантация.', tags: ['ЭКМО', 'Swan-Ganz'], difficulty: 'advanced' },
    ],
  },
  {
    id: 102, sectionId: 'advanced', title: 'Пульмонология продвинутая', color: '#3498db',
    description: 'Интервенционная пульмонология, нарушения дыхания во сне, реабилитация',
    courses: [
      { id: '102.1', moduleId: 102, title: 'Интервенционная пульмонология', description: 'Бронхоскопия, EBUS, термопластика, плевроскопия.', tags: ['бронхоскопия', 'EBUS'], difficulty: 'advanced' },
      { id: '102.2', moduleId: 102, title: 'Нарушения дыхания во сне', description: 'Полисомнография, ОСА, CPAP, центральное апноэ.', tags: ['ОСА', 'CPAP'], difficulty: 'intermediate' },
      { id: '102.3', moduleId: 102, title: 'Лёгочная реабилитация', description: 'КНПТ, программы реабилитации ХОБЛ и ИЛЗ.', tags: ['реабилитация', 'ХОБЛ'], difficulty: 'intermediate' },
    ],
  },
  {
    id: 103, sectionId: 'advanced', title: 'Гастроэнтерология продвинутая', color: '#e67e22',
    description: 'Эндоскопия, продвинутая гепатология',
    courses: [
      { id: '103.1', moduleId: 103, title: 'Эндоскопия', description: 'ЭГДС, колоноскопия, ЭРХПГ, EUS, гемостаз при ЖКК.', tags: ['ЭРХПГ', 'EUS'], difficulty: 'advanced' },
      { id: '103.2', moduleId: 103, title: 'Гепатология продвинутая', description: 'Биопсия печени, TIPS, трансплантация, ГЦК, ПППД.', tags: ['TIPS', 'MELD'], difficulty: 'advanced' },
    ],
  },
  {
    id: 104, sectionId: 'advanced', title: 'Нефрология продвинутая', color: '#9b59b6',
    description: 'Диализ, ЗПТ, трансплантация почки',
    courses: [
      { id: '104.1', moduleId: 104, title: 'Диализ и ЗПТ', description: 'Гемодиализ, ПД, ЗПОТ, антикоагуляция, трансплантация.', tags: ['гемодиализ', 'ЗПОТ'], difficulty: 'advanced' },
      { id: '104.2', moduleId: 104, title: 'Интервенционная нефрология', description: 'Биопсия почки, нефростомия, ангиопластика.', tags: ['биопсия', 'нефростомия'], difficulty: 'advanced' },
    ],
  },
  {
    id: 105, sectionId: 'advanced', title: 'Неврология продвинутая', color: '#2ecc71',
    description: 'Нейрореанимация, нейродиагностика, интервенционная неврология',
    courses: [
      { id: '105.1', moduleId: 105, title: 'Нейрореанимация', description: 'Мониторинг ВЧД, управление ВЧД, декомпрессивная гемикраниэктомия.', tags: ['ВЧД', 'осмотерапия'], difficulty: 'advanced' },
      { id: '105.2', moduleId: 105, title: 'Нейродиагностика', description: 'МРТ (DWI, FLAIR), КТ-ангиография, ЦАГ, ЭЭГ, ЭНМГ.', tags: ['МРТ', 'ЭЭГ'], difficulty: 'advanced' },
      { id: '105.3', moduleId: 105, title: 'Интервенционная неврология', description: 'Тромбэктомия, эмболизация аневризм, нейростимуляция DBS.', tags: ['тромбэктомия', 'DBS'], difficulty: 'advanced' },
    ],
  },
  {
    id: 106, sectionId: 'advanced', title: 'Онкология', color: '#8e44ad',
    description: 'Системная терапия, лучевая терапия, онкологические неотложные',
    courses: [
      { id: '106.1', moduleId: 106, title: 'Клиническая онкология', description: 'Химиотерапия, таргетная, иммунотерапия (PD-1, CAR-T), гормональная.', tags: ['иммунотерапия', 'CAR-T'], difficulty: 'advanced' },
      { id: '106.2', moduleId: 106, title: 'Лучевая терапия', description: 'IMRT, SBRT, брахитерапия, побочные эффекты.', tags: ['лучевая', 'SBRT'], difficulty: 'advanced' },
      { id: '106.3', moduleId: 106, title: 'Онкологические неотложные', description: 'Синдром ВПВ, лизис опухоли, спинальная компрессия, нейтропенический сепсис.', tags: ['лизис опухоли', 'ВПВ'], difficulty: 'advanced' },
    ],
  },
  // Уровень 2 — Хирургические специальности
  {
    id: 107, sectionId: 'advanced', title: 'Сердечно-сосудистая хирургия', color: '#c0392b',
    description: 'АИК, АКШ, протезирование клапанов, аневризмы аорты',
    courses: [
      { id: '107.1', moduleId: 107, title: 'Операции на открытом сердце', description: 'АИК, АКШ, протезирование клапанов, аорта, трансплантация.', tags: ['АКШ', 'АИК'], difficulty: 'advanced' },
      { id: '107.2', moduleId: 107, title: 'Минимально-инвазивная кардиохирургия', description: 'Торакоскопические операции, роботизированная хирургия.', tags: ['робот', 'торакоскопия'], difficulty: 'advanced' },
    ],
  },
  {
    id: 108, sectionId: 'advanced', title: 'Нейрохирургия', color: '#2c3e50',
    description: 'Черепно-мозговая и спинальная хирургия',
    courses: [
      { id: '108.1', moduleId: 108, title: 'Черепно-мозговая хирургия', description: 'Трепанация, удаление гематом, аневризмы, опухоли, гидроцефалия.', tags: ['трепанация', 'нейронавигация'], difficulty: 'advanced' },
      { id: '108.2', moduleId: 108, title: 'Спинальная хирургия', description: 'Декомпрессия, стабилизация, грыжи, стеноз, опухоли.', tags: ['ламинэктомия', 'микродискэктомия'], difficulty: 'advanced' },
    ],
  },
  {
    id: 109, sectionId: 'advanced', title: 'Ортопедия и травматология', color: '#27ae60',
    description: 'Переломы, эндопротезирование, артроскопия',
    courses: [
      { id: '109.1', moduleId: 109, title: 'Переломы', description: 'Остеосинтез, переломы таза, позвоночника, открытые (Gustilo).', tags: ['остеосинтез', 'Gustilo'], difficulty: 'advanced' },
      { id: '109.2', moduleId: 109, title: 'Эндопротезирование', description: 'ТБС, коленный сустав, ревизионные операции.', tags: ['эндопротезирование', 'ТБС'], difficulty: 'advanced' },
      { id: '109.3', moduleId: 109, title: 'Артроскопия', description: 'Колено (ПКС, мениск), плечо (Банкарт, ротаторная манжета).', tags: ['артроскопия', 'ПКС'], difficulty: 'advanced' },
    ],
  },
  {
    id: 110, sectionId: 'advanced', title: 'Урология', color: '#f39c12',
    description: 'Эндоурология, онкоурология',
    courses: [
      { id: '110.1', moduleId: 110, title: 'Эндоурология', description: 'Цистоскопия, ТУРП, уретероскопия, PCNL, ДЛТ.', tags: ['ТУРП', 'литотрипсия'], difficulty: 'advanced' },
      { id: '110.2', moduleId: 110, title: 'Онкоурология', description: 'Рак мочевого пузыря, почки, простаты, яичка.', tags: ['рак простаты', 'нефрэктомия'], difficulty: 'advanced' },
    ],
  },
  {
    id: 111, sectionId: 'advanced', title: 'Гинекология оперативная', color: '#e91e63',
    description: 'Лапароскопическая гинекология, акушерские операции',
    courses: [
      { id: '111.1', moduleId: 111, title: 'Лапароскопическая гинекология', description: 'Миомэктомия, гистерэктомия, эндометриоз, трубная беременность.', tags: ['лапароскопия', 'гистерэктомия'], difficulty: 'advanced' },
      { id: '111.2', moduleId: 111, title: 'Акушерские операции', description: 'Кесарево, вакуум-экстракция, щипцы, ручное отделение плаценты.', tags: ['кесарево', 'щипцы'], difficulty: 'advanced' },
    ],
  },
  // Уровень 3 — Узкие специализации
  {
    id: 112, sectionId: 'advanced', title: 'Интенсивная терапия продвинутая', color: '#e74c3c',
    description: 'Гемодинамический мониторинг, продвинутая ИВЛ, ЭКМО',
    courses: [
      { id: '112.1', moduleId: 112, title: 'Гемодинамический мониторинг', description: 'Инвазивное АД, PiCCO, Swan-Ganz, эхо в ОРИТ.', tags: ['PiCCO', 'Swan-Ganz'], difficulty: 'advanced' },
      { id: '112.2', moduleId: 112, title: 'Механическая вентиляция продвинутая', description: 'P-V loop, driving pressure, асинхрония, VV-ECMO, отлучение.', tags: ['ЭКМО', 'driving pressure'], difficulty: 'advanced' },
      { id: '112.3', moduleId: 112, title: 'Специфические состояния ОРИТ', description: 'Рефрактерный шок, ОРДС, ОПН, тяжёлый панкреатит, компартмент.', tags: ['ОРДС', 'прон-позиция'], difficulty: 'advanced' },
    ],
  },
  {
    id: 113, sectionId: 'advanced', title: 'Анестезиология специализированная', color: '#1abc9c',
    description: 'Регионарная анестезия, специальные виды',
    courses: [
      { id: '113.1', moduleId: 113, title: 'Регионарная анестезия', description: 'Спинальная, эпидуральная, CSE, блокады нервов под УЗИ.', tags: ['спинальная', 'УЗИ-блокады'], difficulty: 'advanced' },
      { id: '113.2', moduleId: 113, title: 'Специальные виды анестезии', description: 'Кардиохирургия, нейро-, акушерская, педиатрическая, торакальная.', tags: ['нейроанестезия', 'однолёгочная'], difficulty: 'advanced' },
    ],
  },
  {
    id: 114, sectionId: 'advanced', title: 'Инфекционные болезни продвинутые', color: '#16a085',
    description: 'Антибиотикотерапия в ОРИТ, тяжёлые и тропические инфекции',
    courses: [
      { id: '114.1', moduleId: 114, title: 'Антибиотикотерапия в ОРИТ', description: 'PK/PD-оптимизация, TDM, расширенные инфузии, де-эскалация.', tags: ['TDM', 'PK/PD'], difficulty: 'advanced' },
      { id: '114.2', moduleId: 114, title: 'Тяжёлые инфекции', description: 'Некротизирующий фасциит, токсический шок, эндокардит.', tags: ['фасциит', 'эндокардит'], difficulty: 'advanced' },
      { id: '114.3', moduleId: 114, title: 'Тропические инфекции', description: 'Малярия, тиф, холера, Эбола, ВИЧ/СПИД.', tags: ['малярия', 'ВИЧ'], difficulty: 'advanced' },
    ],
  },
  {
    id: 115, sectionId: 'advanced', title: 'Токсикология продвинутая', color: '#d35400',
    description: 'Клиническая токсикология, промышленные и военные яды',
    courses: [
      { id: '115.1', moduleId: 115, title: 'Клиническая токсикология', description: 'Токсидромы, детоксикация, усиление выведения, антидоты.', tags: ['токсидромы', 'детоксикация'], difficulty: 'advanced' },
      { id: '115.2', moduleId: 115, title: 'Промышленные и военные яды', description: 'ФОС, VX, зарин, цианиды, тяжёлые металлы.', tags: ['ФОС', 'цианиды'], difficulty: 'advanced' },
    ],
  },
  // Уровень 4 — Мультидисциплинарные
  {
    id: 116, sectionId: 'advanced', title: 'Трансплантология', color: '#2980b9',
    description: 'Иммунология трансплантации, отторжение, органы',
    courses: [
      { id: '116.1', moduleId: 116, title: 'Общие принципы', description: 'HLA-типирование, иммуносупрессия (такролимус), отторжение.', tags: ['HLA', 'иммуносупрессия'], difficulty: 'advanced' },
      { id: '116.2', moduleId: 116, title: 'Трансплантация по органам', description: 'Почка, печень (MELD), сердце (LVAD), лёгкие, поджелудочная.', tags: ['MELD', 'LVAD'], difficulty: 'advanced' },
    ],
  },
  {
    id: 117, sectionId: 'advanced', title: 'Паллиативная медицина', color: '#8e44ad',
    description: 'Симптомный контроль, боль, умирание',
    courses: [
      { id: '117.1', moduleId: 117, title: 'Принципы паллиатива', description: 'Коммуникация, симптомный контроль (боль, одышка, делирий).', tags: ['паллиатив', 'advance care'], difficulty: 'intermediate' },
      { id: '117.2', moduleId: 117, title: 'Боль в паллиативе', description: 'Лестница ВОЗ, адъюванты, интервенционное обезболивание.', tags: ['опиоиды', 'ротация'], difficulty: 'advanced' },
      { id: '117.3', moduleId: 117, title: 'Умирание', description: 'Признаки, паллиативная седация, смерть мозга, поддержка семьи.', tags: ['седация', 'смерть мозга'], difficulty: 'advanced' },
    ],
  },
  {
    id: 118, sectionId: 'advanced', title: 'Реабилитационная медицина', color: '#27ae60',
    description: 'МКФ, специфические программы реабилитации',
    courses: [
      { id: '118.1', moduleId: 118, title: 'Основы реабилитации', description: 'МКФ, команда, шкалы (Barthel, FIM, Rankin).', tags: ['МКФ', 'Barthel'], difficulty: 'intermediate' },
      { id: '118.2', moduleId: 118, title: 'Специфические программы', description: 'Кардио-, нейро-, лёгочная, ортопедическая, ожоговая, ампутированные.', tags: ['нейрореабилитация', 'протезы'], difficulty: 'intermediate' },
    ],
  },
  {
    id: 119, sectionId: 'advanced', title: 'Спортивная медицина', color: '#f1c40f',
    description: 'Физиология нагрузок, травматология спорта',
    courses: [
      { id: '119.1', moduleId: 119, title: 'Физиология нагрузок', description: 'VO2max, пороги, адаптации, сердце спортсмена, внезапная смерть.', tags: ['VO2max', 'ГКМП'], difficulty: 'intermediate' },
      { id: '119.2', moduleId: 119, title: 'Травматология спорта', description: 'ПКС, мениски, плечо, стрессовые переломы, concussion (SCAT5).', tags: ['ПКС', 'SCAT5'], difficulty: 'intermediate' },
    ],
  },
  // Уровень 5 — Технологии
  {
    id: 120, sectionId: 'advanced', title: 'Медицинские технологии', color: '#3498db',
    description: 'Визуализация, малоинвазивные вмешательства, мониторинг',
    courses: [
      { id: '120.1', moduleId: 120, title: 'Визуализация', description: 'КТ, МРТ, ПЭТ-КТ, ОФЭКТ, гибридные методы.', tags: ['МРТ', 'ПЭТ-КТ'], difficulty: 'intermediate' },
      { id: '120.2', moduleId: 120, title: 'Малоинвазивные вмешательства', description: 'Интервенционная радиология, роботизированная хирургия, навигация.', tags: ['da Vinci', 'навигация'], difficulty: 'advanced' },
      { id: '120.3', moduleId: 120, title: 'Мониторинг', description: 'Холтер, СМАД, носимые устройства, POCT.', tags: ['холтер', 'CGM'], difficulty: 'intermediate' },
    ],
  },
  {
    id: 121, sectionId: 'advanced', title: 'Молекулярная медицина и геномика', color: '#9b59b6',
    description: 'Генетика в клинике, молекулярная диагностика, генная терапия',
    courses: [
      { id: '121.1', moduleId: 121, title: 'Генетика в клинике', description: 'Наследственные кардиомиопатии, онкосиндромы (BRCA), фармакогеномика.', tags: ['BRCA', 'фармакогеномика'], difficulty: 'advanced' },
      { id: '121.2', moduleId: 121, title: 'Молекулярная диагностика', description: 'ПЦР, NGS, жидкостная биопсия, биомаркёры.', tags: ['NGS', 'ctDNA'], difficulty: 'advanced' },
      { id: '121.3', moduleId: 121, title: 'Генная и клеточная терапия', description: 'AAV, CAR-T, CRISPR-Cas9, стволовые клетки.', tags: ['CRISPR', 'CAR-T'], difficulty: 'advanced' },
    ],
  },
  {
    id: 122, sectionId: 'advanced', title: 'ИИ в медицине', color: '#1abc9c',
    description: 'Диагностика, CDSS, ограничения и риски',
    courses: [
      { id: '122.1', moduleId: 122, title: 'ИИ в диагностике', description: 'Распознавание изображений, ЭКГ-алгоритмы, предсказание сепсиса.', tags: ['ИИ', 'радиология'], difficulty: 'intermediate' },
      { id: '122.2', moduleId: 122, title: 'CDSS и ограничения', description: 'Системы поддержки решений, bias, чёрный ящик, валидация.', tags: ['CDSS', 'bias'], difficulty: 'intermediate' },
    ],
  },
  // Уровень 6 — Исследования
  {
    id: 123, sectionId: 'advanced', title: 'Клинические исследования', color: '#34495e',
    description: 'Дизайн исследований, статистика, GCP',
    courses: [
      { id: '123.1', moduleId: 123, title: 'Дизайн исследований', description: 'РКИ, когорты, случай-контроль, мета-анализ, адаптивные дизайны.', tags: ['РКИ', 'PRISMA'], difficulty: 'intermediate' },
      { id: '123.2', moduleId: 123, title: 'Статистика', description: 'Гипотезы, p-value, регрессии, Каплан-Мейер, размер выборки.', tags: ['p-value', 'регрессия'], difficulty: 'intermediate' },
      { id: '123.3', moduleId: 123, title: 'GCP и этика исследований', description: 'Хельсинкская декларация, ICH E6, этический комитет, согласие.', tags: ['GCP', 'Хельсинки'], difficulty: 'basic' },
    ],
  },
];

// ════════════════════════════════════════════════════════════
// РАЗДЕЛ: ЭКСПЕРТНЫЙ (Уровни 7–11)
// ════════════════════════════════════════════════════════════

const expertModules: Module[] = [
  {
    id: 200, sectionId: 'expert', title: 'Экспертная клиническая практика', color: '#c0392b',
    description: 'Паттерн-распознавание, сложные диагнозы, экспертная интерпретация',
    courses: [
      { id: '200.1', moduleId: 200, title: 'Экспертная диагностика', description: 'Illness scripts, dual process thinking, когнитивные ошибки эксперта, calibration.', tags: ['illness scripts', 'calibration'], difficulty: 'advanced' },
      { id: '200.2', moduleId: 200, title: 'Сложные и редкие диагнозы', description: 'Зебры, симуляторы, FUO, мультисистемные заболевания.', tags: ['FUO', 'васкулиты'], difficulty: 'advanced' },
      { id: '200.3', moduleId: 200, title: 'Экспертная интерпретация', description: 'КТ/МРТ без радиолога, продвинутая эхо, биопсии.', tags: ['КТ', 'эхо'], difficulty: 'advanced' },
    ],
  },
  {
    id: 201, sectionId: 'expert', title: 'Экспертная хирургия', color: '#7f8c8d',
    description: 'Мастерство в операционной, ревизионная хирургия',
    courses: [
      { id: '201.1', moduleId: 201, title: 'Мастерство в операционной', description: 'Хирургическая анатомия вариантов, damage control нестандартный, импровизация.', tags: ['damage control', 'импровизация'], difficulty: 'advanced' },
      { id: '201.2', moduleId: 201, title: 'Ревизионная и реконструктивная', description: 'Рубцы, спайки, реконструкция после осложнений, пластика.', tags: ['ревизия', 'реконструкция'], difficulty: 'advanced' },
    ],
  },
  {
    id: 202, sectionId: 'expert', title: 'Экспертная интенсивная терапия', color: '#e74c3c',
    description: 'Рефрактерные состояния, этика в ОРИТ',
    courses: [
      { id: '202.1', moduleId: 202, title: 'Рефрактерные состояния', description: 'Рефрактерный шок, ОРДС, эпистатус, СН, невозможное отлучение.', tags: ['рефрактерный', 'ЭКМО'], difficulty: 'advanced' },
      { id: '202.2', moduleId: 202, title: 'Этические решения в ОРИТ', description: 'Ограничение лечения, смерть мозга, конфликты с семьёй.', tags: ['этика ОРИТ', 'смерть мозга'], difficulty: 'advanced' },
    ],
  },
  {
    id: 203, sectionId: 'expert', title: 'Медицинское лидерство', color: '#2c3e50',
    description: 'Управление командой, системное мышление, качество и безопасность',
    courses: [
      { id: '203.1', moduleId: 203, title: 'Управление командой', description: 'Psychological safety, CRM, debriefing, burnout, развитие коллег.', tags: ['CRM', 'burnout'], difficulty: 'intermediate' },
      { id: '203.2', moduleId: 203, title: 'Системное мышление', description: 'HRO, Swiss cheese, RCA, FMEA.', tags: ['HRO', 'RCA'], difficulty: 'intermediate' },
      { id: '203.3', moduleId: 203, title: 'Качество и безопасность', description: 'IHI, PDCA, Lean, Six Sigma, JCI.', tags: ['Lean', 'JCI'], difficulty: 'intermediate' },
    ],
  },
  {
    id: 204, sectionId: 'expert', title: 'Медицинское образование', color: '#16a085',
    description: 'Педагогика, клиническое обучение, разработка программ',
    courses: [
      { id: '204.1', moduleId: 204, title: 'Педагогика для врачей', description: 'Таксономия Блума, deliberate practice, simulation, feedback.', tags: ['Блум', 'симуляция'], difficulty: 'intermediate' },
      { id: '204.2', moduleId: 204, title: 'Клиническое обучение', description: 'One-minute preceptor, SNAPPS, teach-back, bedside teaching.', tags: ['preceptor', 'SNAPPS'], difficulty: 'intermediate' },
      { id: '204.3', moduleId: 204, title: 'Разработка программ', description: 'Kern model, needs assessment, OSCE, programmatic assessment.', tags: ['OSCE', 'Kern'], difficulty: 'intermediate' },
    ],
  },
  {
    id: 205, sectionId: 'expert', title: 'Медицинское право и экспертиза', color: '#34495e',
    description: 'Судебная экспертиза, медицинское право',
    courses: [
      { id: '205.1', moduleId: 205, title: 'Медицинская экспертиза', description: 'Судебно-медицинская экспертиза, causa mortis, токсикологическая.', tags: ['экспертиза', 'causa mortis'], difficulty: 'intermediate' },
      { id: '205.2', moduleId: 205, title: 'Медицинское право продвинутое', description: 'Стандарт помощи в суде, экспертное свидетельство, no-fault vs tort.', tags: ['суд', 'стандарт помощи'], difficulty: 'intermediate' },
    ],
  },
  {
    id: 206, sectionId: 'expert', title: 'Трансляционные исследования', color: '#3498db',
    description: 'Bench to bedside, фазы испытаний, регуляторная наука',
    courses: [
      { id: '206.1', moduleId: 206, title: 'От скамьи к постели', description: 'Модели на животных, органоиды, hit→lead→candidate, GLP.', tags: ['органоиды', 'GLP'], difficulty: 'advanced' },
      { id: '206.2', moduleId: 206, title: 'Фазы клинических испытаний', description: 'Фазы I-IV, адаптивные дизайны, basket/umbrella trials.', tags: ['фаза I', 'адаптивный'], difficulty: 'advanced' },
      { id: '206.3', moduleId: 206, title: 'Регуляторная наука', description: 'FDA/EMA, GCP/GMP, RWE, биомаркёры как суррогаты.', tags: ['FDA', 'RWE'], difficulty: 'advanced' },
    ],
  },
  {
    id: 207, sectionId: 'expert', title: 'Персонализированная медицина', color: '#9b59b6',
    description: 'Омиксные технологии, биоинформатика',
    courses: [
      { id: '207.1', moduleId: 207, title: 'Омиксные технологии', description: 'Геномика (WGS/WES), транскриптомика, протеомика, мультиомикс.', tags: ['WGS', 'RNA-seq'], difficulty: 'advanced' },
      { id: '207.2', moduleId: 207, title: 'Биоинформатика для клиницистов', description: 'NGS пайплайны, ClinVar, GWAS, PRS, TCGA.', tags: ['ClinVar', 'GWAS'], difficulty: 'advanced' },
    ],
  },
  {
    id: 208, sectionId: 'expert', title: 'Философия медицины', color: '#8e44ad',
    description: 'Концепции болезни, медицина и общество, история медицины',
    courses: [
      { id: '208.1', moduleId: 208, title: 'Концептуальные основы', description: 'Теории болезни (Boorse/Nordenfelt), причинность (Bradford Hill), EBM философия.', tags: ['философия', 'причинность'], difficulty: 'intermediate' },
      { id: '208.2', moduleId: 208, title: 'Медицина и общество', description: 'Медикализация, социальные детерминанты, глобальное неравенство.', tags: ['медикализация', 'детерминанты'], difficulty: 'intermediate' },
      { id: '208.3', moduleId: 208, title: 'История медицины', description: 'Гиппократ→Гален, Пастер и Кох, антисептика, талидомид, реанимация.', tags: ['история', 'Пастер'], difficulty: 'basic' },
    ],
  },
  {
    id: 209, sectionId: 'expert', title: 'Психология врача', color: '#e67e22',
    description: 'Мышление, осознанность, резильентность, врач как пациент',
    courses: [
      { id: '209.1', moduleId: 209, title: 'Врачебное мышление', description: 'Синдром самозванца, перфекционизм, психология ошибки, моральный дистресс.', tags: ['самозванец', 'second victim'], difficulty: 'intermediate' },
      { id: '209.2', moduleId: 209, title: 'Осознанность и резильентность', description: 'Mindfulness, резильентность, ikigai, личные границы.', tags: ['mindfulness', 'резильентность'], difficulty: 'basic' },
      { id: '209.3', moduleId: 209, title: 'Врач как пациент', description: 'Отрицание, самолечение, психические расстройства у врачей, возвращение.', tags: ['burnout', 'зависимость'], difficulty: 'intermediate' },
    ],
  },
  {
    id: 210, sectionId: 'expert', title: 'Передний край клинической науки', color: '#1abc9c',
    description: 'Регенеративная медицина, нейротехнологии, антистарение',
    courses: [
      { id: '210.1', moduleId: 210, title: 'Регенеративная медицина', description: 'Органоиды, биопринтинг, ксенотрансплантация, скаффолды.', tags: ['биопринтинг', 'ксено'], difficulty: 'advanced' },
      { id: '210.2', moduleId: 210, title: 'Нейротехнологии', description: 'BCI (Neuralink), ТМС, нейропротезы, коннектом.', tags: ['BCI', 'нейропротезы'], difficulty: 'advanced' },
      { id: '210.3', moduleId: 210, title: 'Иммунотерапия нового поколения', description: 'BiTE, CAR-NK, персонализированные mRNA-вакцины, FMT.', tags: ['BiTE', 'mRNA'], difficulty: 'advanced' },
      { id: '210.4', moduleId: 210, title: 'Антистарение и долголетие', description: 'Сенолитики, Яманака-факторы, NAD+, рапамицин.', tags: ['сенолитики', 'NAD+'], difficulty: 'advanced' },
    ],
  },
  {
    id: 211, sectionId: 'expert', title: 'Будущее медицины', color: '#2ecc71',
    description: 'Digital twins, liquid biopsy, нанотехнологии, этика будущего',
    courses: [
      { id: '211.1', moduleId: 211, title: 'Сходящиеся технологии', description: 'Digital twins, liquid biopsy, AI-диагноз, носимые устройства, нанотехнологии.', tags: ['digital twin', 'нанотехнологии'], difficulty: 'advanced' },
      { id: '211.2', moduleId: 211, title: 'Этические вызовы будущего', description: 'Генетическое редактирование зародышевой линии, enhancement, приватность, алгоритмическая предвзятость.', tags: ['CRISPR этика', 'enhancement'], difficulty: 'intermediate' },
    ],
  },
];

// ════════════════════════════════════════════════════════════
// РАЗДЕЛ: 5 ПЛАСТОВ РАСШИРЕНИЯ (A–E)
// ════════════════════════════════════════════════════════════

const expansionModules: Module[] = [
  // Пласт A — Клинические специальности
  {
    id: 300, sectionId: 'expansion', title: 'Офтальмология', color: '#3498db',
    description: 'Анатомия глаза, диагностика, заболевания, неотложные состояния',
    courses: [
      { id: '300.1', moduleId: 300, title: 'Анатомия и физиология глаза', description: 'Оболочки, преломляющие среды, сетчатка, зрачковый рефлекс.', tags: ['сетчатка', 'аккомодация'], difficulty: 'basic' },
      { id: '300.2', moduleId: 300, title: 'Диагностика', description: 'Визометрия, периметрия, тонометрия, офтальмоскопия, ОКТ.', tags: ['тонометрия', 'ОКТ'], difficulty: 'intermediate' },
      { id: '300.3', moduleId: 300, title: 'Заболевания глаз', description: 'Глаукома, катаракта, ВМД, диабетическая ретинопатия, увеит.', tags: ['глаукома', 'катаракта'], difficulty: 'intermediate' },
      { id: '300.4', moduleId: 300, title: 'Офтальмологические неотложные', description: 'Острая глаукома, окклюзия ЦАС/ЦВС, эндофтальмит, хим. ожог.', tags: ['ЦАС', 'эндофтальмит'], difficulty: 'advanced' },
    ],
  },
  {
    id: 301, sectionId: 'expansion', title: 'Оториноларингология', color: '#e67e22',
    description: 'ЛОР-анатомия, диагностика, заболевания, неотложные',
    courses: [
      { id: '301.1', moduleId: 301, title: 'Анатомия ЛОР-органов', description: 'Ухо (наружное, среднее, внутреннее), нос, пазухи, глотка, гортань.', tags: ['ухо', 'гортань'], difficulty: 'basic' },
      { id: '301.2', moduleId: 301, title: 'Диагностика ЛОР', description: 'Отоскопия, аудиометрия, Ринне/Вебер, ларингоскопия.', tags: ['аудиометрия', 'отоскопия'], difficulty: 'intermediate' },
      { id: '301.3', moduleId: 301, title: 'ЛОР-заболевания', description: 'Отит, холестеатома, Меньер, ДППГ, синусит, тонзиллит, рак гортани.', tags: ['отит', 'Меньер'], difficulty: 'intermediate' },
      { id: '301.4', moduleId: 301, title: 'ЛОР-неотложные', description: 'Носовое кровотечение, инородные тела, круп, заглоточный абсцесс.', tags: ['эпистаксис', 'круп'], difficulty: 'advanced' },
    ],
  },
  {
    id: 302, sectionId: 'expansion', title: 'Дерматология', color: '#e74c3c',
    description: 'Кожа, воспалительные дерматозы, инфекции, опухоли',
    courses: [
      { id: '302.1', moduleId: 302, title: 'Анатомия и физиология кожи', description: 'Эпидермис, дерма, придатки, барьер, терморегуляция.', tags: ['эпидермис', 'барьер'], difficulty: 'basic' },
      { id: '302.2', moduleId: 302, title: 'Дерматологическая диагностика', description: 'Морфологические элементы, дерматоскопия, биопсия, патч-тест.', tags: ['дерматоскопия', 'биопсия'], difficulty: 'intermediate' },
      { id: '302.3', moduleId: 302, title: 'Воспалительные дерматозы', description: 'Атопический дерматит, псориаз, розацеа, буллёзные.', tags: ['псориаз', 'атопический'], difficulty: 'intermediate' },
      { id: '302.4', moduleId: 302, title: 'Инфекции и опухоли кожи', description: 'Бактериальные, вирусные, грибковые инфекции; БКР, ПКР, меланома.', tags: ['меланома', 'БКР'], difficulty: 'intermediate' },
    ],
  },
  {
    id: 303, sectionId: 'expansion', title: 'Стоматология и ЧЛХ', color: '#95a5a6',
    description: 'Одонтология, челюстно-лицевая хирургия',
    courses: [
      { id: '303.1', moduleId: 303, title: 'Одонтология', description: 'Строение зуба, кариес, пульпит, пародонтит, хирургическая стоматология.', tags: ['кариес', 'пульпит'], difficulty: 'basic' },
      { id: '303.2', moduleId: 303, title: 'Челюстно-лицевая хирургия', description: 'Переломы челюсти, Le Fort, переломы орбиты, абсцессы, расщелины.', tags: ['Le Fort', 'остеонекроз'], difficulty: 'advanced' },
    ],
  },
  {
    id: 304, sectionId: 'expansion', title: 'Психиатрия специализированная', color: '#8e44ad',
    description: 'Нейропсихиатрия, аддиктология, судебная, детская',
    courses: [
      { id: '304.1', moduleId: 304, title: 'Нейропсихиатрия', description: 'Органические психозы, ЧМТ и психиатрия, аутоиммунные энцефалиты.', tags: ['анти-NMDA', 'делирий'], difficulty: 'advanced' },
      { id: '304.2', moduleId: 304, title: 'Аддиктология', description: 'Нейробиология зависимости, алкоголь, опиоиды, стимуляторы, каннабис.', tags: ['зависимость', 'метадон'], difficulty: 'intermediate' },
      { id: '304.3', moduleId: 304, title: 'Судебная психиатрия', description: 'Вменяемость, дееспособность, принудительная госпитализация, оценка опасности.', tags: ['вменяемость', 'опасность'], difficulty: 'intermediate' },
      { id: '304.4', moduleId: 304, title: 'Детская и подростковая', description: 'РАС, СДВГ, расстройства привязанности, анорексия, Туретт.', tags: ['РАС', 'СДВГ'], difficulty: 'intermediate' },
    ],
  },
  {
    id: 305, sectionId: 'expansion', title: 'Физиотерапия и ЛФК', color: '#27ae60',
    description: 'Электротерапия, ультразвук, ГБО, лечебная физкультура',
    courses: [
      { id: '305.1', moduleId: 305, title: 'Методы физиотерапии', description: 'Электротерапия, УЗ, лазер, магнит, ГБО, криотерапия, гидротерапия.', tags: ['ГБО', 'электротерапия'], difficulty: 'basic' },
      { id: '305.2', moduleId: 305, title: 'Лечебная физкультура', description: 'ЛФК при кардио/неврологии/ортопедии, дыхательная гимнастика, эрготерапия.', tags: ['ЛФК', 'эрготерапия'], difficulty: 'basic' },
    ],
  },
  // Пласт B — Фундаментальные (углублённо)
  {
    id: 306, sectionId: 'expansion', title: 'Иммунология углублённая', color: '#2980b9',
    description: 'Молекулярная иммунология, адаптивный иммунитет детально, иммунопатология',
    courses: [
      { id: '306.1', moduleId: 306, title: 'Молекулярная иммунология', description: 'TLR, инфламмасома NLRP3, интерфероны, комплемент детально, NK-клетки.', tags: ['TLR', 'инфламмасома'], difficulty: 'advanced' },
      { id: '306.2', moduleId: 306, title: 'Адаптивный иммунитет детально', description: 'Тимус, TCR/BCR, герминативные центры, Treg (FoxP3).', tags: ['TCR', 'Treg'], difficulty: 'advanced' },
      { id: '306.3', moduleId: 306, title: 'Иммунопатология', description: 'Гиперчувствительность I-IV, аутоиммунитет, ПИД (ТКИН, Брутон), иммуноредактирование.', tags: ['ТКИН', 'аутоиммунитет'], difficulty: 'advanced' },
    ],
  },
  {
    id: 307, sectionId: 'expansion', title: 'Генетика клиническая', color: '#9b59b6',
    description: 'Менделевская, хромосомная, молекулярная генетика, консультирование',
    courses: [
      { id: '307.1', moduleId: 307, title: 'Менделевская и хромосомная генетика', description: 'AD/AR/X-linked, импринтинг, анеуплоидии, микроделеции.', tags: ['Дауна', 'импринтинг'], difficulty: 'intermediate' },
      { id: '307.2', moduleId: 307, title: 'Молекулярная генетика заболеваний', description: 'Хантингтон, NF, муковисцидоз (CFTR), ФКУ, серповидноклеточная.', tags: ['CFTR', 'HbS'], difficulty: 'advanced' },
      { id: '307.3', moduleId: 307, title: 'Генетическое консультирование', description: 'НИПТ, ПГД, новорождённый скрининг, BRCA прогностическое тестирование.', tags: ['НИПТ', 'BRCA'], difficulty: 'intermediate' },
    ],
  },
  {
    id: 308, sectionId: 'expansion', title: 'Нейронауки углублённые', color: '#1abc9c',
    description: 'Молекулярная нейробиология, нейропластичность, нейродегенерация',
    courses: [
      { id: '308.1', moduleId: 308, title: 'Молекулярная нейробиология', description: 'Дофаминовые/серотониновые пути, ГАМК, глутамат, BDNF.', tags: ['дофамин', 'NMDA'], difficulty: 'advanced' },
      { id: '308.2', moduleId: 308, title: 'Нейропластичность', description: 'LTP, структурная пластичность, нейрогенез у взрослых.', tags: ['LTP', 'нейрогенез'], difficulty: 'advanced' },
      { id: '308.3', moduleId: 308, title: 'Нейродегенерация', description: 'Альцгеймер (амилоид), Паркинсон (α-синуклеин), БАС, Гентингтон, прионы.', tags: ['Альцгеймер', 'прионы'], difficulty: 'advanced' },
    ],
  },
  {
    id: 309, sectionId: 'expansion', title: 'Физиология экстремальных состояний', color: '#e74c3c',
    description: 'Травма, старение, боль углублённо',
    courses: [
      { id: '309.1', moduleId: 309, title: 'Физиология при травме', description: 'Нейроэндокринный ответ, SIRS (PAMPs/DAMPs), ишемия-реперфузия, MODS.', tags: ['PAMPs', 'реперфузия'], difficulty: 'advanced' },
      { id: '309.2', moduleId: 309, title: 'Физиология старения', description: 'Теломеры, саркопения, иммуностарение.', tags: ['саркопения', 'иммуностарение'], difficulty: 'intermediate' },
      { id: '309.3', moduleId: 309, title: 'Физиология боли углублённо', description: 'Aδ и C-волокна, задний рог, нисходящий контроль, центральная сенситизация.', tags: ['C-волокна', 'сенситизация'], difficulty: 'advanced' },
    ],
  },
  // Пласт C — Межсистемные темы
  {
    id: 310, sectionId: 'expansion', title: 'Медицина сна', color: '#34495e',
    description: 'Физиология сна, нарушения сна',
    courses: [
      { id: '310.1', moduleId: 310, title: 'Физиология сна', description: 'NREM/REM, регуляция (аденозин, мелатонин), полисомнография.', tags: ['REM', 'мелатонин'], difficulty: 'intermediate' },
      { id: '310.2', moduleId: 310, title: 'Нарушения сна', description: 'Инсомния (КПТ-И), нарколепсия, парасомнии, синдром беспокойных ног.', tags: ['инсомния', 'нарколепсия'], difficulty: 'intermediate' },
    ],
  },
  {
    id: 311, sectionId: 'expansion', title: 'Нутрициология', color: '#f39c12',
    description: 'Макро/микронутриенты, клиническое питание, бариатрия',
    courses: [
      { id: '311.1', moduleId: 311, title: 'Нутриенты клинически', description: 'Белок, углеводы, жиры, витамины D/B12, железо, цинк, магний.', tags: ['витамин D', 'B12'], difficulty: 'basic' },
      { id: '311.2', moduleId: 311, title: 'Клиническое питание', description: 'NRS-2002, энтеральное и парентеральное питание, бариатрия.', tags: ['энтеральное', 'бариатрия'], difficulty: 'intermediate' },
    ],
  },
  {
    id: 312, sectionId: 'expansion', title: 'Боль — клиническое управление', color: '#c0392b',
    description: 'Оценка, мультимодальная анальгезия, интервенции',
    courses: [
      { id: '312.1', moduleId: 312, title: 'Оценка боли', description: 'ВАШ, NRS, FLACC, BPS/CPOT, биопсихосоциальная модель.', tags: ['ВАШ', 'CPOT'], difficulty: 'intermediate' },
      { id: '312.2', moduleId: 312, title: 'Мультимодальная анальгезия', description: 'Лестница ВОЗ+, адъюванты, опиоидная ротация, интервенции.', tags: ['ротация', 'нейролитические'], difficulty: 'advanced' },
    ],
  },
  {
    id: 313, sectionId: 'expansion', title: 'Психосоматика', color: '#8e44ad',
    description: 'Психонейроиммунология, соматоформные расстройства, хронические болезни',
    courses: [
      { id: '313.1', moduleId: 313, title: 'Психосоматические механизмы', description: 'ПНИ (стресс→ГГН→иммуносупрессия), СРК, фибромиалгия, MUPS.', tags: ['ПНИ', 'фибромиалгия'], difficulty: 'intermediate' },
      { id: '313.2', moduleId: 313, title: 'Психология хронических болезней', description: 'Стадии принятия, комплаентность, мотивационное интервью, QoL.', tags: ['комплаентность', 'SF-36'], difficulty: 'intermediate' },
    ],
  },
  {
    id: 314, sectionId: 'expansion', title: 'Гериатрия', color: '#7f8c8d',
    description: 'Гериатрические синдромы, фармакотерапия у пожилых',
    courses: [
      { id: '314.1', moduleId: 314, title: 'Гериатрические синдромы', description: 'Хрупкость (Frailty), падения, делирий, деменция, мальнутриция, полипрагмазия.', tags: ['Frailty', 'полипрагмазия'], difficulty: 'intermediate' },
      { id: '314.2', moduleId: 314, title: 'Фармакотерапия у пожилых', description: 'PK/PD изменения, каскад назначений, Beers, STOPP/START, депрескрайбинг.', tags: ['Beers', 'депрескрайбинг'], difficulty: 'intermediate' },
    ],
  },
  // Пласт D — Профессиональные компетенции
  {
    id: 315, sectionId: 'expansion', title: 'Коммуникация продвинутая', color: '#2c3e50',
    description: 'Трудные разговоры, межкультурная медицина, health literacy',
    courses: [
      { id: '315.1', moduleId: 315, title: 'Трудные разговоры', description: 'Сообщение о смерти, диагноз рак (SPIKES), прогноз, прекращение реанимации.', tags: ['SPIKES', 'смерть'], difficulty: 'intermediate' },
      { id: '315.2', moduleId: 315, title: 'Межкультурная медицина', description: 'Культурная компетентность, религия, языковой барьер, стигма.', tags: ['культурная', 'переводчик'], difficulty: 'basic' },
      { id: '315.3', moduleId: 315, title: 'Health Literacy', description: 'Teach-Back, читабельность, shared decision making.', tags: ['Teach-Back', 'SDM'], difficulty: 'basic' },
    ],
  },
  {
    id: 316, sectionId: 'expansion', title: 'Медицинская информатика', color: '#3498db',
    description: 'ЭМЗ, стандарты, аналитика, телемедицина',
    courses: [
      { id: '316.1', moduleId: 316, title: 'ЭМЗ и стандарты', description: 'HL7, FHIR, SNOMED CT, ICD-10/11, CDSS, интероперабельность.', tags: ['FHIR', 'ICD'], difficulty: 'intermediate' },
      { id: '316.2', moduleId: 316, title: 'Данные и телемедицина', description: 'Регистры, RWD, предиктивные модели, телеОРИТ, дистанционный мониторинг.', tags: ['RWD', 'телемедицина'], difficulty: 'intermediate' },
    ],
  },
  {
    id: 317, sectionId: 'expansion', title: 'Медицинская экономика', color: '#f39c12',
    description: 'Финансирование, DRG, фармакоэкономика, управление больницей',
    courses: [
      { id: '317.1', moduleId: 317, title: 'Здравоохранение как система', description: 'DRG, clinical pathways, фармакоэкономика (CEA, QALY).', tags: ['DRG', 'QALY'], difficulty: 'intermediate' },
      { id: '317.2', moduleId: 317, title: 'Управление больницей', description: 'Поток пациентов, коечный фонд, OR utilization, кризисный менеджмент.', tags: ['менеджмент', 'операционная'], difficulty: 'intermediate' },
    ],
  },
  // Пласт E — Специфические сценарии
  {
    id: 318, sectionId: 'expansion', title: 'Межпрофессиональная медицина', color: '#16a085',
    description: 'Полиорганная патология, ятрогенные состояния',
    courses: [
      { id: '318.1', moduleId: 318, title: 'Полиорганная патология', description: 'Кардиоренальный синдром, кардиопульмональные взаимодействия, ГРС.', tags: ['кардиоренальный', 'ГРС'], difficulty: 'advanced' },
      { id: '318.2', moduleId: 318, title: 'Ятрогенные состояния', description: 'DILI, контраст-нефропатия, послеоперационные осложнения, ИСМП.', tags: ['DILI', 'ИСМП'], difficulty: 'advanced' },
    ],
  },
  {
    id: 319, sectionId: 'expansion', title: 'Редкие болезни', color: '#8e44ad',
    description: 'Подход к орфанным болезням, ключевые редкие заболевания',
    courses: [
      { id: '319.1', moduleId: 319, title: 'Подход к редким болезням', description: 'Орфанные болезни (~7000), геномная диагностика (WES/WGS), орфанные препараты.', tags: ['орфанные', 'WES'], difficulty: 'advanced' },
      { id: '319.2', moduleId: 319, title: 'Ключевые редкие болезни', description: 'Вильсон, гемохроматоз, порфирии, мастоцитоз, амилоидоз, болезни накопления.', tags: ['Вильсон', 'амилоидоз'], difficulty: 'advanced' },
    ],
  },
  {
    id: 320, sectionId: 'expansion', title: 'Ситуационная медицина', color: '#d35400',
    description: 'Медицина в нестандартных условиях, crush syndrome',
    courses: [
      { id: '320.1', moduleId: 320, title: 'Медицина в нестандартных условиях', description: 'Арктика, подводные лодки, тюрьма, беженцы, стихийные бедствия, космос.', tags: ['космос', 'беженцы'], difficulty: 'intermediate' },
      { id: '320.2', moduleId: 320, title: 'Синдром длительного сдавления', description: 'Миоглобин, ОПП, гиперкалиемия, ДВС, жидкости ДО освобождения.', tags: ['crush', 'миоглобин'], difficulty: 'advanced' },
    ],
  },
];

// ════════════════════════════════════════════════════════════
// РАЗДЕЛ: НЕИССЛЕДОВАННЫЕ ТЕРРИТОРИИ (Пласты F–L)
// ════════════════════════════════════════════════════════════

const territoriesModules: Module[] = [
  // Пласт F — Диагностические технологии
  {
    id: 400, sectionId: 'territories', title: 'Радиология и визуализация', color: '#3498db',
    description: 'Физика визуализации, системная радиология, интервенционная радиология, ядерная медицина',
    courses: [
      { id: '400.1', moduleId: 400, title: 'Физика визуализации', description: 'Рентген, КТ (единицы Хаунсфилда), МРТ (T1/T2), УЗИ, ПЭТ.', tags: ['КТ', 'МРТ', 'УЗИ'], difficulty: 'intermediate' },
      { id: '400.2', moduleId: 400, title: 'Системная радиология', description: 'Голова, грудная клетка, сердце, живот, ОДА, молочная железа, детская.', tags: ['КТВР', 'маммография', 'BI-RADS'], difficulty: 'intermediate' },
      { id: '400.3', moduleId: 400, title: 'Интервенционная радиология', description: 'Ангиопластика, эмболизация, дренирование, биопсии, ТАХЭ, РЧА, криоаблация.', tags: ['эмболизация', 'ТАХЭ', 'РЧА'], difficulty: 'advanced' },
      { id: '400.4', moduleId: 400, title: 'Ядерная медицина', description: 'Сцинтиграфия, ОФЭКТ, ПЭТ, терапевтическая (I-131, PSMA, Ra-223).', tags: ['сцинтиграфия', 'ПЭТ'], difficulty: 'advanced' },
    ],
  },
  {
    id: 401, sectionId: 'territories', title: 'Клиническая лабораторная медицина', color: '#9b59b6',
    description: 'Гематологическая, биохимическая, микробиологическая, патологоанатомическая лаборатория',
    courses: [
      { id: '401.1', moduleId: 401, title: 'Гематологическая лаборатория', description: 'Мазок крови, ретикулоциты, расширенная коагулограмма, ТЭГ/РОТЕМ, проточная цитометрия.', tags: ['мазок', 'РОТЕМ', 'цитометрия'], difficulty: 'advanced' },
      { id: '401.2', moduleId: 401, title: 'Клиническая биохимия', description: 'Белки острой фазы, hsTnI, паттерны печени, маркёры опухолей, гормоны, ЦСЖ.', tags: ['тропонин', 'ПСА', 'ЦСЖ'], difficulty: 'intermediate' },
      { id: '401.3', moduleId: 401, title: 'Микробиологическая лаборатория', description: 'Посевы, антибиотикограмма (MIC), мультиплексная ПЦР, серология, экспресс-тесты.', tags: ['MIC', 'ПЦР', 'серология'], difficulty: 'intermediate' },
      { id: '401.4', moduleId: 401, title: 'Патологоанатомическая лаборатория', description: 'Гистология, ИГХ, FISH, срочная биопсия, аутопсия.', tags: ['ИГХ', 'FISH', 'аутопсия'], difficulty: 'advanced' },
    ],
  },
  // Пласт G — Хирургические основы
  {
    id: 402, sectionId: 'territories', title: 'Периоперационная медицина', color: '#27ae60',
    description: 'Предоперационная подготовка, интраоперационный мониторинг, послеоперационный уход',
    courses: [
      { id: '402.1', moduleId: 402, title: 'Предоперационная подготовка', description: 'Шкалы риска (NSQIP, RCRI), медикаменты, ERAS, преабилитация.', tags: ['ERAS', 'RCRI', 'риск'], difficulty: 'intermediate' },
      { id: '402.2', moduleId: 402, title: 'Интраоперационный мониторинг', description: 'Стандартный и расширенный, нейрофизиологический, BIS, TOF.', tags: ['BIS', 'NIRS', 'TOF'], difficulty: 'advanced' },
      { id: '402.3', moduleId: 402, title: 'Послеоперационный уход', description: 'Боль (PCIA), PONV, делирий, осложнения по срокам, критерии выписки.', tags: ['PONV', 'делирий', 'Aldrete'], difficulty: 'intermediate' },
    ],
  },
  {
    id: 403, sectionId: 'territories', title: 'Раневая медицина', color: '#e67e22',
    description: 'Физиология заживления, хронические раны, современные методы лечения',
    courses: [
      { id: '403.1', moduleId: 403, title: 'Физиология заживления ран', description: 'Фазы (гемостаз → воспаление → пролиферация → ремоделирование), факторы роста, MMP.', tags: ['заживление', 'PDGF', 'VEGF'], difficulty: 'intermediate' },
      { id: '403.2', moduleId: 403, title: 'Хронические раны', description: 'Диабетическая стопа (Вагнер), пролежни (NPUAP), венозные и артериальные язвы, ABI.', tags: ['диабетическая стопа', 'пролежни'], difficulty: 'intermediate' },
      { id: '403.3', moduleId: 403, title: 'Современные методы лечения ран', description: 'Влажная среда, повязки, VAC-терапия, PRP, ГБО, кожная пластика.', tags: ['VAC', 'PRP', 'пластика'], difficulty: 'advanced' },
    ],
  },
  // Пласт H — Профилактическая и общественная медицина
  {
    id: 404, sectionId: 'territories', title: 'Профилактическая медицина', color: '#2ecc71',
    description: 'Вакцинация, скрининг, профилактика, иммунизация при особых состояниях',
    courses: [
      { id: '404.1', moduleId: 404, title: 'Первичная профилактика', description: 'Вакцинация, типы вакцин, скрининг (РШМ, РМЖ, КРР), СС-риск, химиопрофилактика.', tags: ['вакцинация', 'скрининг', 'SCORE2'], difficulty: 'basic' },
      { id: '404.2', moduleId: 404, title: 'Вторичная и третичная профилактика', description: 'Реабилитация после ОИМ, вторичная профилактика инсульта, диспансеризация.', tags: ['диспансеризация', 'PCMH'], difficulty: 'basic' },
      { id: '404.3', moduleId: 404, title: 'Иммунизация при особых состояниях', description: 'Иммунокомпрометированные, беременные, пожилые, постэкспозиционная профилактика.', tags: ['Shingrix', 'ПЭП'], difficulty: 'intermediate' },
    ],
  },
  {
    id: 405, sectionId: 'territories', title: 'Гигиена и эпидемиология', color: '#16a085',
    description: 'Гигиена питания, труда, эпидемиология НИЗ',
    courses: [
      { id: '405.1', moduleId: 405, title: 'Гигиена питания и труда', description: 'Пищевые инфекции, ХАССП, профвредности, пневмокониозы, профрак.', tags: ['ХАССП', 'силикоз', 'асбест'], difficulty: 'basic' },
      { id: '405.2', moduleId: 405, title: 'Эпидемиология НИЗ', description: 'DALY, факторы риска, популяционный подход (Rose), налоги на табак/сахар.', tags: ['DALY', 'Rose'], difficulty: 'intermediate' },
    ],
  },
  {
    id: 406, sectionId: 'territories', title: 'Медицина окружающей среды', color: '#1abc9c',
    description: 'Экологические болезни, тяжёлые металлы, One Health',
    courses: [
      { id: '406.1', moduleId: 406, title: 'Экологические болезни', description: 'PM2.5, климат и здоровье, тяжёлые металлы, эндокринные дизрапторы, радон.', tags: ['PM2.5', 'свинец', 'радон'], difficulty: 'intermediate' },
      { id: '406.2', moduleId: 406, title: 'One Health', description: 'Здоровье человека + животных + экосистем, зоонозы, антибиотикорезистентность, климат.', tags: ['One Health', 'зоонозы'], difficulty: 'intermediate' },
    ],
  },
  // Пласт I — Специфические популяции
  {
    id: 407, sectionId: 'territories', title: 'Неонатология', color: '#e74c3c',
    description: 'Физиология новорождённого, реанимация (NRP), болезни, недоношенность',
    courses: [
      { id: '407.1', moduleId: 407, title: 'Физиология новорождённого', description: 'Фетальное кровообращение, переход при рождении, бурый жир, иммунитет.', tags: ['фетальное', 'овальное окно'], difficulty: 'intermediate' },
      { id: '407.2', moduleId: 407, title: 'Реанимация новорождённых (NRP)', description: 'Алгоритм NRP, компрессии 3:1, мекониальные воды, недоношенные.', tags: ['NRP', 'реанимация'], difficulty: 'advanced' },
      { id: '407.3', moduleId: 407, title: 'Болезни новорождённых', description: 'РДС, ГИЭ, НЭК, ретинопатия, ВЖК, гипербилирубинемия, ПЛГН.', tags: ['РДС', 'ГИЭ', 'НЭК'], difficulty: 'advanced' },
      { id: '407.4', moduleId: 407, title: 'Недоношенность', description: 'Степени, предел жизнеспособности (22-24 нед), БЛД, ДЦП, долгосрочные последствия.', tags: ['недоношенность', 'БЛД'], difficulty: 'advanced' },
    ],
  },
  {
    id: 408, sectionId: 'territories', title: 'Подростковая медицина', color: '#f39c12',
    description: 'Пубертат, расстройства питания, депрессия, зависимости, конфиденциальность',
    courses: [
      { id: '408.1', moduleId: 408, title: 'Физиология пубертата', description: 'ГнРГ, стадии Таннера, ростовой скачок, психология подростков.', tags: ['Таннер', 'пубертат'], difficulty: 'basic' },
      { id: '408.2', moduleId: 408, title: 'Проблемы подростков', description: 'РПП, депрессия/суицид, ПАВ (CRAFFT), репродуктивное здоровье, конфиденциальность.', tags: ['CRAFFT', 'РПП'], difficulty: 'intermediate' },
    ],
  },
  {
    id: 409, sectionId: 'territories', title: 'Гендерная медицина', color: '#8e44ad',
    description: 'Биологические различия пола, трансгендерная медицина',
    courses: [
      { id: '409.1', moduleId: 409, title: 'Биологические различия пола', description: 'Фармакокинетика, иммунология, ССЗ у женщин (MINOCA, SCAD), боль.', tags: ['MINOCA', 'SCAD'], difficulty: 'intermediate' },
      { id: '409.2', moduleId: 409, title: 'Трансгендерная медицина', description: 'Гормональная терапия, мониторинг, хирургия, пубертатные блокаторы.', tags: ['гормональная терапия', 'гендер'], difficulty: 'intermediate' },
    ],
  },
  {
    id: 410, sectionId: 'territories', title: 'Репродуктивная медицина', color: '#e91e63',
    description: 'Мужская и женская репродуктивная система, бесплодие, ЭКО',
    courses: [
      { id: '410.1', moduleId: 410, title: 'Мужская репродуктивная система', description: 'Сперматогенез, бесплодие (спермограмма), ЭД, гипогонадизм.', tags: ['спермограмма', 'гипогонадизм'], difficulty: 'intermediate' },
      { id: '410.2', moduleId: 410, title: 'Женская репродуктивная система', description: 'Менструальный цикл, бесплодие, ЭКО, СПКЯ, эндометриоз, климактерий.', tags: ['ЭКО', 'СПКЯ', 'эндометриоз'], difficulty: 'intermediate' },
    ],
  },
  // Пласт J — Смежные дисциплины
  {
    id: 411, sectionId: 'territories', title: 'Медицинская психология', color: '#34495e',
    description: 'Психология боли, нейропсихология, психология медперсонала',
    courses: [
      { id: '411.1', moduleId: 411, title: 'Психология боли и страдания', description: 'Катастрофизация (PCS), экзистенциальный дистресс, нейробиология страдания.', tags: ['катастрофизация', 'PCS'], difficulty: 'intermediate' },
      { id: '411.2', moduleId: 411, title: 'Нейропсихология', description: 'Когнитивные функции, MMSE/MoCA, когнитивный резерв, brain fog.', tags: ['MoCA', 'когнитивный резерв'], difficulty: 'intermediate' },
      { id: '411.3', moduleId: 411, title: 'Психология медперсонала', description: 'Вторичная травматизация, compassion fatigue, PFA для персонала.', tags: ['compassion fatigue', 'PFA'], difficulty: 'basic' },
    ],
  },
  {
    id: 412, sectionId: 'territories', title: 'Медицинская антропология', color: '#795548',
    description: 'Культура и болезнь, социальные детерминанты',
    courses: [
      { id: '412.1', moduleId: 412, title: 'Культура и болезнь', description: 'Explanatory models (Kleinman), этномедицина, ритуалы исцеления.', tags: ['Kleinman', 'этномедицина'], difficulty: 'basic' },
      { id: '412.2', moduleId: 412, title: 'Социальные детерминанты', description: 'Уайтхолл, аллостатическая нагрузка, эпигенетика бедности, структурный расизм.', tags: ['аллостаз', 'детерминанты'], difficulty: 'intermediate' },
    ],
  },
  {
    id: 413, sectionId: 'territories', title: 'Биомедицинская инженерия', color: '#607d8b',
    description: 'Медицинские устройства, аппараты, биосенсоры',
    courses: [
      { id: '413.1', moduleId: 413, title: 'Медицинские устройства и аппараты', description: 'Классификация FDA, биоматериалы, имплантируемые устройства, ИВЛ, диализ, AED.', tags: ['биоматериалы', 'FDA'], difficulty: 'intermediate' },
      { id: '413.2', moduleId: 413, title: 'Биосенсоры и носимые', description: 'CGM, PPG, непрерывное АД, перспективные устройства.', tags: ['CGM', 'PPG', 'носимые'], difficulty: 'intermediate' },
    ],
  },
  // Пласт K — Системы и процессы
  {
    id: 414, sectionId: 'territories', title: 'Управление качеством', color: '#455a64',
    description: 'Измерение качества, безопасность пациентов, аккредитация',
    courses: [
      { id: '414.1', moduleId: 414, title: 'Измерение качества и безопасность', description: 'Донабедиан, индикаторы, dashboards, ошибки (Reason), near miss, sentinel events, чеклисты ВОЗ.', tags: ['Донабедиан', 'ВОЗ чеклист'], difficulty: 'intermediate' },
      { id: '414.2', moduleId: 414, title: 'Аккредитация и стандарты', description: 'JCI, ISO 9001, NICE, Cochrane, GRADE.', tags: ['JCI', 'GRADE'], difficulty: 'intermediate' },
    ],
  },
  {
    id: 415, sectionId: 'territories', title: 'Медицинская логистика', color: '#546e7a',
    description: 'Лекарственное обеспечение, кровь и компоненты',
    courses: [
      { id: '415.1', moduleId: 415, title: 'Лекарственное обеспечение', description: 'Цепочка поставок, холодовая цепь, ABC/VEN, фальсификация.', tags: ['холодовая цепь', 'ABC/VEN'], difficulty: 'basic' },
      { id: '415.2', moduleId: 415, title: 'Кровь и компоненты', description: 'Заготовка, компоненты, MTP 1:1:1, безопасность, кровесбережение.', tags: ['MTP', 'кровесбережение'], difficulty: 'intermediate' },
    ],
  },
  // Пласт L — Философские основы
  {
    id: 416, sectionId: 'territories', title: 'Теория медицины', color: '#37474f',
    description: 'Эпистемология, модели здоровья, сложность',
    courses: [
      { id: '416.1', moduleId: 416, title: 'Медицинская эпистемология', description: 'Философская критика EBM, что доказывает РКИ, внешняя валидность, N-of-1.', tags: ['эпистемология', 'N-of-1'], difficulty: 'intermediate' },
      { id: '416.2', moduleId: 416, title: 'Модели здоровья и сложность', description: 'Биопсихосоциальная (Энгель), salutogenesis, экологическая, сложные системы, wicked problems.', tags: ['Энгель', 'salutogenesis'], difficulty: 'intermediate' },
    ],
  },
  {
    id: 417, sectionId: 'territories', title: 'Нарративная медицина', color: '#263238',
    description: 'Нарратив в болезни, close reading, рефлексивное письмо',
    courses: [
      { id: '417.1', moduleId: 417, title: 'Нарративная медицина', description: 'Illness narrative, close reading, рефлексивное письмо, параллельные карты.', tags: ['нарратив', 'рефлексия'], difficulty: 'basic' },
    ],
  },
];

// ════════════════════════════════════════════════════════════
// РАЗДЕЛ: ФРОНТИРЫ (Пласты M–U)
// ════════════════════════════════════════════════════════════

const frontiersModules: Module[] = [
  // Пласт M — Специальности
  {
    id: 500, sectionId: 'frontiers', title: 'Медицина боли (Pain Medicine)', color: '#e74c3c',
    description: 'Интервенционное лечение боли, имплантируемые системы (SCS, помпы)',
    courses: [
      { id: '500.1', moduleId: 500, title: 'Интервенционное лечение боли', description: 'Эпидуральные инъекции, фасеточные блокады, РЧА, симпатические блокады, нейролизис.', tags: ['РЧА', 'эпидуральная', 'блокады'], difficulty: 'advanced' },
      { id: '500.2', moduleId: 500, title: 'Имплантируемые системы', description: 'SCS (спинальная нейростимуляция), интратекальные помпы, DRG стимуляция.', tags: ['SCS', 'помпы', 'DRG'], difficulty: 'advanced' },
    ],
  },
  {
    id: 501, sectionId: 'frontiers', title: 'Сосудистая медицина (Ангиология)', color: '#c0392b',
    description: 'ХВН, лимфедема, периферические артериальные болезни',
    courses: [
      { id: '501.1', moduleId: 501, title: 'Хроническая венозная недостаточность', description: 'CEAP классификация, дуплекс, склеротерапия, EVLA, RFA, варикоз.', tags: ['CEAP', 'варикоз', 'EVLA'], difficulty: 'intermediate' },
      { id: '501.2', moduleId: 501, title: 'Лимфедема', description: 'Первичная/вторичная, стадии ISL, КДТ, хирургия.', tags: ['лимфедема', 'КДТ'], difficulty: 'intermediate' },
      { id: '501.3', moduleId: 501, title: 'Периферические артериальные болезни', description: 'ЗАНК, Фонтен/Рутерфорд, ABI, CLTI, реваскуляризация, диабетическая ангиопатия.', tags: ['ЗАНК', 'ABI', 'CLTI'], difficulty: 'advanced' },
    ],
  },
  {
    id: 502, sectionId: 'frontiers', title: 'Аллергология', color: '#e67e22',
    description: 'Иммунопатология аллергии, диагностика, АСИТ, биологики',
    courses: [
      { id: '502.1', moduleId: 502, title: 'Иммунопатология и диагностика аллергии', description: 'IgE, тучные клетки, Th2, прик-тесты, ImmunoCAP, провокационные тесты, BAT.', tags: ['IgE', 'прик-тест', 'Th2'], difficulty: 'intermediate' },
      { id: '502.2', moduleId: 502, title: 'Аллергические болезни', description: 'Ринит (ARIA), астма, АД, пищевая аллергия, лекарственная, крапивница.', tags: ['ARIA', 'крапивница', 'астма'], difficulty: 'intermediate' },
      { id: '502.3', moduleId: 502, title: 'АСИТ и биологики', description: 'SCIT, SLIT, омализумаб, дупилумаб, меполизумаб.', tags: ['АСИТ', 'омализумаб'], difficulty: 'advanced' },
    ],
  },
  {
    id: 503, sectionId: 'frontiers', title: 'Спортивная медицина углублённая', color: '#f1c40f',
    description: 'Спортивная кардиология, пульмонология, питание',
    courses: [
      { id: '503.1', moduleId: 503, title: 'Спортивная кардиология', description: 'ЭКГ спортсмена (Seattle Criteria), скрининг ВСС, миокардит, athlete\'s heart.', tags: ['Seattle Criteria', 'ГКМП'], difficulty: 'advanced' },
      { id: '503.2', moduleId: 503, title: 'Спортивная пульмонология и питание', description: 'EIB, дыхательные ограничения, углеводная загрузка, креатин, кофеин.', tags: ['EIB', 'креатин'], difficulty: 'intermediate' },
    ],
  },
  {
    id: 504, sectionId: 'frontiers', title: 'Авиационная и морская медицина', color: '#3498db',
    description: 'Гипоксия на высоте, G-сила, морская болезнь, дайвинг углублённо',
    courses: [
      { id: '504.1', moduleId: 504, title: 'Авиационная медицина углублённая', description: 'TUC, декомпрессия, иллюзии, G-сила, GLOC, fatigue management.', tags: ['TUC', 'GLOC'], difficulty: 'intermediate' },
      { id: '504.2', moduleId: 504, title: 'Морская медицина', description: 'Морская болезнь, изолированная среда, азотный наркоз, O2 токсичность.', tags: ['морская', 'азотный наркоз'], difficulty: 'intermediate' },
    ],
  },
  // Пласт N — Лабораторные специальности
  {
    id: 505, sectionId: 'frontiers', title: 'Клиническая фармация', color: '#9b59b6',
    description: 'TDM, лекарственные взаимодействия, реконцилиация, фармация в ОРИТ',
    courses: [
      { id: '505.1', moduleId: 505, title: 'Клинический фармацевт', description: 'TDM (ванкомицин, такролимус), PK-консультирование, взаимодействия, реконцилиация.', tags: ['TDM', 'реконцилиация'], difficulty: 'intermediate' },
    ],
  },
  {
    id: 506, sectionId: 'frontiers', title: 'Банк крови и трансфузиология', color: '#e74c3c',
    description: 'Иммуногематология, компоненты крови, осложнения трансфузии',
    courses: [
      { id: '506.1', moduleId: 506, title: 'Иммуногематология', description: 'ABO, Rh, Kell, перекрёстная совместимость, DAT.', tags: ['ABO', 'Rh', 'DAT'], difficulty: 'advanced' },
      { id: '506.2', moduleId: 506, title: 'Компоненты и осложнения', description: 'Лейкоредукция, облучение, TRALI, TACO, гемолитические реакции, РТПХ.', tags: ['TRALI', 'TACO'], difficulty: 'advanced' },
    ],
  },
  {
    id: 507, sectionId: 'frontiers', title: 'Клиническая генетика практическая', color: '#8e44ad',
    description: 'Генетические синдромы, митохондриальные и метаболические болезни',
    courses: [
      { id: '507.1', moduleId: 507, title: 'Генетические синдромы', description: 'Дисморфология, скелетные дисплазии, микроделеции/дупликации (CMA).', tags: ['дисморфология', 'CMA'], difficulty: 'advanced' },
      { id: '507.2', moduleId: 507, title: 'Митохондриальные и метаболические болезни', description: 'MELAS, MERRF, органические ацидурии, нарушения цикла мочевины, лизосомальные.', tags: ['MELAS', 'MMA', 'ERT'], difficulty: 'advanced' },
    ],
  },
  // Пласт O — Стресс и адаптация
  {
    id: 508, sectionId: 'frontiers', title: 'Психонейроэндокриноиммунология', color: '#16a085',
    description: 'ПНЭИ: интеграция HPA, стресс и болезни, интервенции',
    courses: [
      { id: '508.1', moduleId: 508, title: 'Стресс и системная интеграция', description: 'Ось HPA, аллостаз, кортизол и иммунитет, NF-κB, теломеры и стресс.', tags: ['HPA', 'аллостаз', 'NF-κB'], difficulty: 'intermediate' },
      { id: '508.2', moduleId: 508, title: 'Медицина образа жизни', description: '6 доменов (питание, движение, сон, стресс, зависимости, социальные связи), DiRECT trial, Орниш.', tags: ['lifestyle', 'DiRECT'], difficulty: 'basic' },
    ],
  },
  // Пласт P — Тропическая медицина
  {
    id: 509, sectionId: 'frontiers', title: 'Тропическая медицина', color: '#27ae60',
    description: 'Протозойные инфекции, гельминтозы, арбовирусы, тропические бактерии',
    courses: [
      { id: '509.1', moduleId: 509, title: 'Протозойные инфекции', description: 'Малярия углублённо (артесунат), лейшманиоз, сонная болезнь, Шагас, амёбиаз.', tags: ['малярия', 'лейшманиоз'], difficulty: 'advanced' },
      { id: '509.2', moduleId: 509, title: 'Гельминтозы и арбовирусы', description: 'Аскаридоз, шистосомоз, эхинококкоз, денге (ADE), Zika, жёлтая лихорадка.', tags: ['шистосомоз', 'денге', 'Zika'], difficulty: 'advanced' },
      { id: '509.3', moduleId: 509, title: 'Медицина путешественников', description: 'Предотревожная консультация, малярийная профилактика, лихорадка после поездки.', tags: ['путешественники', 'профилактика'], difficulty: 'intermediate' },
    ],
  },
  // Пласт Q — Экспериментальная наука
  {
    id: 510, sectionId: 'frontiers', title: 'Иммуноонкология углублённая', color: '#2c3e50',
    description: 'Опухолевое микроокружение, чекпоинт-ингибиторы, CAR-T, irAE',
    courses: [
      { id: '510.1', moduleId: 510, title: 'Опухолевое микроокружение', description: 'TIL, TAM, MDSC, Treg, PD-L1, иммуноредактирование.', tags: ['TME', 'PD-L1', 'TIL'], difficulty: 'advanced' },
      { id: '510.2', moduleId: 510, title: 'Чекпоинты и клеточная терапия', description: 'Анти-PD-1/CTLA-4, irAE, CAR-T (CRS, ICANS), CAR-NK, TIL-терапия.', tags: ['CAR-T', 'CRS', 'irAE'], difficulty: 'advanced' },
    ],
  },
  {
    id: 511, sectionId: 'frontiers', title: 'Эпигенетика и синтетическая биология', color: '#1abc9c',
    description: 'Метилирование ДНК, эпигенетические часы, генетические схемы',
    courses: [
      { id: '511.1', moduleId: 511, title: 'Эпигенетика в медицине', description: 'Метилирование ДНК, гистоны, miRNA, Horvath clock, эпигенетика рака, наркомании.', tags: ['метилирование', 'Horvath', 'miRNA'], difficulty: 'advanced' },
      { id: '511.2', moduleId: 511, title: 'Синтетическая биология', description: 'BioBricks, генетические схемы, сенсорные клетки, терапевтические бактерии, xenobots.', tags: ['BioBricks', 'xenobots'], difficulty: 'advanced' },
    ],
  },
  // Пласт R — Смерть и умирание
  {
    id: 512, sectionId: 'frontiers', title: 'Танатология', color: '#7f8c8d',
    description: 'Биология смерти, посмертные изменения, умирание как процесс, донорство органов',
    courses: [
      { id: '512.1', moduleId: 512, title: 'Биология смерти', description: 'Смерть мозга, ПВС, locked-in, посмертные изменения, NDE.', tags: ['смерть мозга', 'ПВС'], difficulty: 'intermediate' },
      { id: '512.2', moduleId: 512, title: 'Донорство органов', description: 'DBD, DCD, живые доноры, машинная перфузия, opt-in vs opt-out, этика.', tags: ['донорство', 'DBD', 'DCD'], difficulty: 'intermediate' },
    ],
  },
  // Пласт S — Коммуникации
  {
    id: 513, sectionId: 'frontiers', title: 'Цифровое здоровье и документация', color: '#34495e',
    description: 'Медицинская дезинформация, приложения, SOAP, HL7 FHIR, статистика выживания',
    courses: [
      { id: '513.1', moduleId: 513, title: 'Цифровое здоровье', description: 'Дезинформация, инфодемия, SaMD (FDA), digital phenotyping, PatientsLikeMe.', tags: ['инфодемия', 'SaMD'], difficulty: 'basic' },
      { id: '513.2', moduleId: 513, title: 'Документация и стандарты', description: 'SOAP, ICD-11, FHIR, клинические регистры, Каплан-Мейер, hazard ratio.', tags: ['SOAP', 'FHIR', 'Каплан-Мейер'], difficulty: 'intermediate' },
    ],
  },
  // Пласт T — Финансы
  {
    id: 514, sectionId: 'frontiers', title: 'Медицинская экономика углублённая', color: '#f39c12',
    description: 'HTA, QALY, ICER, DRG, value-based care',
    courses: [
      { id: '514.1', moduleId: 514, title: 'Оценка технологий и финансирование', description: 'QALY, ICER, NICE, DRG (КСГ), value-based care, P4P.', tags: ['QALY', 'DRG', 'NICE'], difficulty: 'intermediate' },
    ],
  },
  // Пласт U — Медицина будущего
  {
    id: 515, sectionId: 'frontiers', title: 'Предиктивная и превентивная медицина', color: '#2ecc71',
    description: 'Полигенные риск-скоры, мультимодальный скрининг, liquid biopsy',
    courses: [
      { id: '515.1', moduleId: 515, title: 'Предиктивная медицина', description: 'PRS (GWAS), liquid biopsy (ctDNA), протеомный скрининг.', tags: ['PRS', 'ctDNA', 'скрининг'], difficulty: 'advanced' },
    ],
  },
  {
    id: 516, sectionId: 'frontiers', title: 'Квантовые технологии и нейроинтерфейсы', color: '#3498db',
    description: 'Квантовые сенсоры, квантовые вычисления, BCI, DBS, нейропротезы',
    courses: [
      { id: '516.1', moduleId: 516, title: 'Квантовые технологии в медицине', description: 'Квантовые магнитометры, квантовая МРТ, NV-центры, симуляция молекул.', tags: ['квантовые', 'NV-центры'], difficulty: 'advanced' },
      { id: '516.2', moduleId: 516, title: 'Нейроинтерфейсы', description: 'Кохлеарные импланты, DBS, BCI (Neuralink), закрытые контуры, декодирование речи.', tags: ['BCI', 'DBS', 'Neuralink'], difficulty: 'advanced' },
    ],
  },
];

// ════════════════════════════════════════════════════════════
// РАЗДЕЛ: КАЛЬКУЛЯТОРЫ
// ════════════════════════════════════════════════════════════

const calculatorsModules: Module[] = [
  {
    id: 600, sectionId: 'calculators', title: 'Реанимация и интенсивная терапия', color: '#e74c3c',
    description: 'Дозировки вазопрессоров, вентиляция, гемодинамика, шок',
    courses: [
      { id: '600.1', moduleId: 600, title: 'Дозировки препаратов ОРИТ', description: 'Вазопрессоры мкг/кг/мин→мл/ч, гепарин, инсулин, седация, кетамин.', tags: ['вазопрессоры', 'инфузия'], difficulty: 'advanced' },
      { id: '600.2', moduleId: 600, title: 'Вентиляция', description: 'ДО (6-8 мл/кг IBW), driving pressure, P/F ratio, комплаенс, мех. мощность.', tags: ['IBW', 'P/F ratio'], difficulty: 'advanced' },
      { id: '600.3', moduleId: 600, title: 'Гемодинамика', description: 'СВ по Фику, DO2/VO2, ОПСС, ЛСС, MAP, ЦПД, PPV/SVV.', tags: ['Фик', 'ОПСС', 'ЦПД'], difficulty: 'advanced' },
      { id: '600.4', moduleId: 600, title: 'Шок и реанимация', description: 'Паркланд (ожоги), лактат клиренс, дефицит оснований, триггеры трансфузии.', tags: ['Паркланд', 'лактат'], difficulty: 'advanced' },
    ],
  },
  {
    id: 601, sectionId: 'calculators', title: 'Кардиология', color: '#c0392b',
    description: 'Риск ССЗ, антикоагуляция, СН, ЭКГ-калькуляторы',
    courses: [
      { id: '601.1', moduleId: 601, title: 'Риск и прогноз', description: 'GRACE, TIMI, HEART, Framingham, SCORE2, EuroSCORE II, STS.', tags: ['GRACE', 'HEART', 'SCORE2'], difficulty: 'intermediate' },
      { id: '601.2', moduleId: 601, title: 'Антикоагуляция', description: 'CHA₂DS₂-VASc, HAS-BLED, дозировки гепарина, реверсия антикоагулянтов.', tags: ['CHA₂DS₂-VASc', 'HAS-BLED'], difficulty: 'intermediate' },
      { id: '601.3', moduleId: 601, title: 'СН и ЭКГ', description: 'MAGGIC, SHFM, INTERMACS, QTc (Bazett/Fridericia), ось сердца.', tags: ['QTc', 'MAGGIC'], difficulty: 'intermediate' },
    ],
  },
  {
    id: 602, sectionId: 'calculators', title: 'Анестезиология', color: '#1abc9c',
    description: 'RSI дозировки, регионарная анестезия, интраоперационные расчёты',
    courses: [
      { id: '602.1', moduleId: 602, title: 'RSI и регионарная анестезия', description: 'Пропофол, кетамин, рокуроний, сугаммадекс, максимальные дозы МА, дерматомные уровни.', tags: ['RSI', 'сугаммадекс', 'МА'], difficulty: 'advanced' },
      { id: '602.2', moduleId: 602, title: 'Интраоперационные расчёты', description: '4-2-1 правило, MABL (допустимая кровопотеря), размер ЭТТ, MAC по возрасту.', tags: ['MABL', 'MAC', '4-2-1'], difficulty: 'advanced' },
    ],
  },
  {
    id: 603, sectionId: 'calculators', title: 'Педиатрия', color: '#7c50d8',
    description: 'Нормативы по возрасту, дозировки по весу, оборудование, шкалы',
    courses: [
      { id: '603.1', moduleId: 603, title: 'Нормативы и дозировки', description: 'ЧСС/ЧДД/АД по возрасту, 15+ препаратов по весу, оборудование (ЭТТ, LMA, IO).', tags: ['педиатрия', 'дозировки'], difficulty: 'intermediate' },
      { id: '603.2', moduleId: 603, title: 'Педиатрические шкалы', description: 'GCS педиатр., PEWS, FLACC, Апгар.', tags: ['Апгар', 'PEWS', 'FLACC'], difficulty: 'basic' },
    ],
  },
  {
    id: 604, sectionId: 'calculators', title: 'Нефрология и КОС', color: '#3498db',
    description: 'GFR, электролиты, диализ, анионная щель, компенсация КОС',
    courses: [
      { id: '604.1', moduleId: 604, title: 'Функция почек', description: 'CKD-EPI, MDRD, Шварц, Кокрофт-Голт, стадии ХБП/ОПП (KDIGO).', tags: ['CKD-EPI', 'KDIGO'], difficulty: 'intermediate' },
      { id: '604.2', moduleId: 604, title: 'Электролиты и КОС', description: 'Дефицит воды/Na/K, коррекция Na при гипергликемии, анионная щель, delta-delta, Winters.', tags: ['анионная щель', 'Winters'], difficulty: 'intermediate' },
      { id: '604.3', moduleId: 604, title: 'Диализ', description: 'Kt/V, URR, ультрафильтрация, дозировка ЗПОТ.', tags: ['Kt/V', 'URR'], difficulty: 'advanced' },
    ],
  },
  {
    id: 605, sectionId: 'calculators', title: 'Гематология и трансфузия', color: '#9b59b6',
    description: 'Анемия, коагуляция, ТЭГ/РОТЕМ, расчёт трансфузии',
    courses: [
      { id: '605.1', moduleId: 605, title: 'Анемия и коагуляция', description: 'Индекс ретикулоцитов, MCV, RDW, TSAT, МНО, гепарин по АЧТВ, ТЭГ/РОТЕМ.', tags: ['ретикулоциты', 'РОТЕМ'], difficulty: 'intermediate' },
      { id: '605.2', moduleId: 605, title: 'Трансфузия', description: 'Дозы ЭМ→Hb, тромбоциты, СЗП, криопреципитат, трансфузионная нагрузка Fe.', tags: ['трансфузия', 'ЭМ'], difficulty: 'intermediate' },
    ],
  },
  {
    id: 606, sectionId: 'calculators', title: 'Пульмонология', color: '#27ae60',
    description: 'Спирометрия, газы крови, риск ТЭЛА',
    courses: [
      { id: '606.1', moduleId: 606, title: 'Спирометрия и газы', description: 'ОФВ1/ФЖЕЛ, GOLD, бронхотест, DLCO, A-a градиент, PAO2, P/F, Sf/Fi.', tags: ['GOLD', 'A-a градиент'], difficulty: 'intermediate' },
      { id: '606.2', moduleId: 606, title: 'ТЭЛА', description: 'Wells, Geneva, PESI, sPESI, D-димер по возрасту, PERC rule.', tags: ['Wells', 'PESI', 'PERC'], difficulty: 'intermediate' },
    ],
  },
  {
    id: 607, sectionId: 'calculators', title: 'Гастро, неврология, эндокринология', color: '#e67e22',
    description: 'Печень (Child-Pugh, MELD), панкреатит, инсульт (NIHSS), диабет, щитовидная',
    courses: [
      { id: '607.1', moduleId: 607, title: 'Печень и панкреатит', description: 'Child-Pugh, MELD, MELD-Na, FIB-4, APRI, Balthazar, Ranson, BISAP, Форрест, Rockall.', tags: ['MELD', 'Ranson', 'Форрест'], difficulty: 'intermediate' },
      { id: '607.2', moduleId: 607, title: 'Неврология', description: 'NIHSS, mRS, ASPECTS, тромболизис критерии, GCS, Marshall КТ, ЦПД, маннитол.', tags: ['NIHSS', 'ASPECTS'], difficulty: 'intermediate' },
      { id: '607.3', moduleId: 607, title: 'Эндокринология', description: 'HbA1c→глюкоза, ISF (1700 правило), углеводный коэффициент, L-тироксин, синактен.', tags: ['HbA1c', 'ISF'], difficulty: 'intermediate' },
    ],
  },
  {
    id: 608, sectionId: 'calculators', title: 'Хирургия и травма', color: '#34495e',
    description: 'RCRI, NSQIP, ISS, TRISS, шок-индекс, нутриция',
    courses: [
      { id: '608.1', moduleId: 608, title: 'Предоп. риск и травма', description: 'RCRI, NSQIP, МЕТ, ISS, RTS, TRISS, шок-индекс, eFAST.', tags: ['RCRI', 'ISS', 'шок-индекс'], difficulty: 'intermediate' },
      { id: '608.2', moduleId: 608, title: 'Нутриция и акушерство', description: 'MUST, NRS-2002, Харрис-Бенедикт, Mifflin, Негеле, MgSO4 при ПЭ.', tags: ['MUST', 'Негеле'], difficulty: 'intermediate' },
    ],
  },
  {
    id: 609, sectionId: 'calculators', title: 'Скоринг и прогноз', color: '#7f8c8d',
    description: 'APACHE, SOFA, qSOFA, NEWS2, CURB-65, PSI и другие прогностические шкалы',
    courses: [
      { id: '609.1', moduleId: 609, title: 'Шкалы ОРИТ и сепсис', description: 'APACHE II/IV, SOFA, qSOFA, SAPS II/3, MPM, Сепсис-3.', tags: ['APACHE', 'SOFA', 'qSOFA'], difficulty: 'advanced' },
      { id: '609.2', moduleId: 609, title: 'Прочие шкалы', description: 'NEWS2, PSI/PORT, CURB-65, BISAP, HEART, Ottawa, Canadian CT, фармакокинетика, антибиотики PK/PD.', tags: ['NEWS2', 'CURB-65', 'Ottawa'], difficulty: 'intermediate' },
    ],
  },
  {
    id: 610, sectionId: 'calculators', title: 'Специальные калькуляторы', color: '#607d8b',
    description: 'Нутриция, антропометрия, офтальмология, ортопедия, дерматология, онкология',
    courses: [
      { id: '610.1', moduleId: 610, title: 'Антропометрия и нутриция', description: 'ИМТ, IBW (Devine), скорректированный вес, ППТ (Mosteller/Dubois), калории, азотистый баланс.', tags: ['ИМТ', 'IBW', 'ППТ'], difficulty: 'basic' },
      { id: '610.2', moduleId: 610, title: 'Узкие специальности', description: 'PASI, SCORAD, DLQI, Кобб, Harris Hip, ВГД коррекция, ИОЛ, карбоплатин AUC (Калверт).', tags: ['PASI', 'Кобб', 'Калверт'], difficulty: 'intermediate' },
    ],
  },
];

// ════════════════════════════════════════════════════════════
// РАЗДЕЛ: ПРЕДМЕТЫ СПЕЦИАЛЬНОСТЕЙ
// ════════════════════════════════════════════════════════════

const subjectsModules: Module[] = [
  // Уровень 1 — Санинструктор
  {
    id: 700, sectionId: 'subjects', title: 'Уровень 1: Санинструктор', color: '#27ae60',
    description: 'Минимум для выживания в поле — TCCC, остановка кровотечений, BLS, сортировка',
    courses: [
      { id: '700.1', moduleId: 700, title: 'Тактическая медицина (TCCC)', description: 'Care Under Fire, Tactical Field Care, TACEVAC — полный цикл.', tags: ['TCCC', 'CUF', 'TFC'], difficulty: 'basic' },
      { id: '700.2', moduleId: 700, title: 'Остановка кровотечения', description: 'Жгуты CAT, wound packing, гемостатические агенты, давящие повязки.', tags: ['жгут', 'CAT', 'гемостатики'], difficulty: 'basic' },
      { id: '700.3', moduleId: 700, title: 'Дыхательные пути и пневмоторакс', description: 'NPA, chest seal, игольная и пальцевая декомпрессия пневмоторакса.', tags: ['NPA', 'chest seal', 'декомпрессия'], difficulty: 'basic' },
      { id: '700.4', moduleId: 700, title: 'BLS / СЛР и шок', description: 'Базовая реанимация, AED, распознавание шока, допустимая гипотензия.', tags: ['BLS', 'AED', 'шок'], difficulty: 'basic' },
      { id: '700.5', moduleId: 700, title: 'Сортировка и эвакуация', description: 'START, SALT, NATO triage, MIST доклад, иммобилизация и транспортировка.', tags: ['START', 'MIST', 'triage'], difficulty: 'basic' },
      { id: '700.6', moduleId: 700, title: 'Ожоги, CBRN, гипотермия', description: 'Правило девяток, Паркланд, CBRN базовый, атропин, профилактика гипотермии.', tags: ['ожоги', 'CBRN', 'гипотермия'], difficulty: 'basic' },
      { id: '700.7', moduleId: 700, title: 'Доступ, обезболивание, антибиотики', description: 'В/В и IO доступ, кетамин, фентанил назальный, выбор антибиотика в поле.', tags: ['IO', 'кетамин', 'антибиотики'], difficulty: 'basic' },
    ],
  },
  // Уровень 2 — Парамедик
  {
    id: 701, sectionId: 'subjects', title: 'Уровень 2: Парамедик', color: '#2980b9',
    description: 'Расширенная догоспитальная помощь — интубация, ACLS, ЧМТ, вазопрессоры',
    courses: [
      { id: '701.1', moduleId: 701, title: 'Клинические основы', description: 'Топографическая анатомия, базовая физиология ССС/дыхания/ЦНС, патофизиология шока и ЧМТ.', tags: ['анатомия', 'физиология'], difficulty: 'intermediate' },
      { id: '701.2', moduleId: 701, title: 'Расширенные ДП и интубация', description: 'Интубация (RSI), LMA, i-gel, крикотиротомия, ИВЛ мешком Амбу.', tags: ['RSI', 'LMA', 'крикотиротомия'], difficulty: 'intermediate' },
      { id: '701.3', moduleId: 701, title: 'Кардиология и ACLS', description: 'ЭКГ базовая, ACLS алгоритмы (VF/VT, PEA, асистолия), дефибрилляция, аритмии.', tags: ['ACLS', 'ЭКГ', 'дефибрилляция'], difficulty: 'intermediate' },
      { id: '701.4', moduleId: 701, title: 'Неврология и ЧМТ', description: 'GCS, классификация ЧМТ, инсульт (FAST), эпилептический статус на месте.', tags: ['GCS', 'инсульт', 'эпистатус'], difficulty: 'intermediate' },
      { id: '701.5', moduleId: 701, title: 'Интенсивная терапия базовая', description: 'Шок расширенно, мониторинг (SpO2, ETCO2), инфузия, вазопрессоры.', tags: ['мониторинг', 'вазопрессоры'], difficulty: 'intermediate' },
      { id: '701.6', moduleId: 701, title: 'Специальные темы парамедика', description: 'Акушерские неотложные, PALS, токсикология, анафилаксия, нутриция.', tags: ['PALS', 'анафилаксия', 'токсикология'], difficulty: 'intermediate' },
      { id: '701.7', moduleId: 701, title: 'Фармакология практическая', description: 'Опиоиды, НПВС, кетамин, антибиотики, антикоагулянты, расчёт доз по весу.', tags: ['дозы', 'опиоиды', 'TXA'], difficulty: 'intermediate' },
    ],
  },
  // Уровень 3 — Военный врач
  {
    id: 702, sectionId: 'subjects', title: 'Уровень 3: Военный врач', color: '#8e44ad',
    description: 'Тактическая и расширенная клиника — damage control surgery, анестезия, ИВЛ, POCUS',
    courses: [
      { id: '702.1', moduleId: 702, title: 'Хирургия damage control', description: 'DCS принципы, обработка ран, торакотомия, лапаротомия, сосудистая хирургия, фасциотомия, ампутация.', tags: ['DCS', 'торакотомия', 'фасциотомия'], difficulty: 'advanced' },
      { id: '702.2', moduleId: 702, title: 'Анестезиология полевая', description: 'Общая анестезия, регионарные блокады (УЗИ), спинальная, сложные ДП, нейромышечная блокада.', tags: ['блокады', 'спинальная', 'RSI'], difficulty: 'advanced' },
      { id: '702.3', moduleId: 702, title: 'Интенсивная терапия расширенная', description: 'ИВЛ параметры (lung-protective), гемодинамический мониторинг, сепсис (SSC), ОРДС, нейрореанимация, коагулопатия.', tags: ['ИВЛ', 'сепсис', 'ОРДС'], difficulty: 'advanced' },
      { id: '702.4', moduleId: 702, title: 'Диагностика', description: 'Расширенная ЭКГ, POCUS/eFAST, рентген грудной клетки, газы крови, лабораторная диагностика.', tags: ['POCUS', 'eFAST', 'ABG'], difficulty: 'advanced' },
      { id: '702.5', moduleId: 702, title: 'Специальная медицина', description: 'CBRN расширенный, взрывная травма, высокогорье, дайвинг, авиамедицина, холод, ожоги расширенно.', tags: ['CBRN', 'blast', 'высокогорье'], difficulty: 'advanced' },
      { id: '702.6', moduleId: 702, title: 'Клинические дисциплины базовые', description: 'Внутренние болезни неотложные, инфекционные болезни, токсикология клиническая, педиатрия.', tags: ['ОКС', 'ТЭЛА', 'сепсис'], difficulty: 'advanced' },
    ],
  },
  // Уровень 4 — Реаниматолог
  {
    id: 703, sectionId: 'subjects', title: 'Уровень 4: Реаниматолог', color: '#c0392b',
    description: 'Полная клиническая компетентность — фундаментальные науки, все клин. специальности, экспертные процедуры',
    courses: [
      { id: '703.1', moduleId: 703, title: 'Фундаментальные науки', description: 'Биохимия, физиология молекулярная, патофизиология, фармакология (PK/PD), микробиология, иммунология.', tags: ['биохимия', 'PK/PD', 'иммунология'], difficulty: 'advanced' },
      { id: '703.2', moduleId: 703, title: 'Клинические специальности', description: 'Кардиология, пульмонология, нефрология, неврология, гастро, эндокринология, гематология, психиатрия, педиатрия.', tags: ['кардиология', 'нефрология', 'неврология'], difficulty: 'advanced' },
      { id: '703.3', moduleId: 703, title: 'Экспертные процедуры', description: 'ЦВК, артериальный катетер, люмбальная пункция, торакоцентез, перикардиоцентез, бронхоскопия, эхо базовая.', tags: ['ЦВК', 'бронхоскопия', 'эхо'], difficulty: 'advanced' },
      { id: '703.4', moduleId: 703, title: 'Экспертная интенсивная терапия', description: 'PiCCO, Swan-Ganz, ЗПОТ, нутриция, седация протоколы, PCAS, трудное отлучение от ИВЛ.', tags: ['PiCCO', 'ЗПОТ', 'PCAS'], difficulty: 'advanced' },
      { id: '703.5', moduleId: 703, title: 'Доказательная медицина и профессионализм', description: 'EBM, клиническое мышление, этика, SBAR, качество и безопасность, RCA.', tags: ['EBM', 'SBAR', 'RCA'], difficulty: 'intermediate' },
    ],
  },
  // Специализированные направления
  {
    id: 704, sectionId: 'subjects', title: 'Военная медицина (направление)', color: '#556b2f',
    description: 'Тактика, организация медслужбы, MASCAL, боевой стресс, медразведка',
    courses: [
      { id: '704.1', moduleId: 704, title: 'Организация и тактика', description: 'Основы военного дела для медика, роли I-IV, медицинское планирование операций, MASCAL.', tags: ['роли I-IV', 'MASCAL', 'планирование'], difficulty: 'intermediate' },
      { id: '704.2', moduleId: 704, title: 'Боевой стресс и разведка', description: 'PFA (Combat Stress), ПТСР, нестандартные ранения, работа в темноте, медразведка.', tags: ['ПТСР', 'PFA', 'разведка'], difficulty: 'intermediate' },
    ],
  },
  {
    id: 705, sectionId: 'subjects', title: 'Экстренная медицина (направление)', color: '#e74c3c',
    description: 'Организация приёмного покоя, ESI, кризисный менеджмент',
    courses: [
      { id: '705.1', moduleId: 705, title: 'Экстренная медицина', description: 'Организация приёмного покоя, ESI протоколы, MASCAL в больнице, CRM в операционной.', tags: ['ESI', 'CRM', 'приёмный покой'], difficulty: 'intermediate' },
    ],
  },
  {
    id: 706, sectionId: 'subjects', title: 'Педиатрическая медицина (направление)', color: '#7c50d8',
    description: 'NRP, PALS, педиатрическая травма и интенсивная терапия',
    courses: [
      { id: '706.1', moduleId: 706, title: 'Педиатрическое направление', description: 'NRP, PALS, педиатрическая травма, ПИКТ, инфекционные болезни у детей.', tags: ['NRP', 'PALS', 'ПИКТ'], difficulty: 'advanced' },
    ],
  },
  {
    id: 707, sectionId: 'subjects', title: 'Тропическая и экспедиционная (направление)', color: '#16a085',
    description: 'Малярия, денге, медицина путешественников, высокогорье, катастрофы',
    courses: [
      { id: '707.1', moduleId: 707, title: 'Тропическая и экспедиционная', description: 'Малярия, лейшманиоз, денге, медицина путешественников, высокогорная, изолированные условия, гуманитарная помощь.', tags: ['малярия', 'высокогорье', 'гуманитарная'], difficulty: 'intermediate' },
    ],
  },
  // Практические навыки
  {
    id: 708, sectionId: 'subjects', title: 'Практические навыки', color: '#34495e',
    description: 'Критические навыки до автоматизма, продвинутые и экспертные процедуры',
    courses: [
      { id: '708.1', moduleId: 708, title: 'Критические навыки (автоматизм)', description: 'Жгут CAT <30 сек, wound packing 3 мин, NPA, chest seal, декомпрессия, BLS, GCS <60 сек, MIST.', tags: ['CAT', 'BLS', 'GCS'], difficulty: 'basic' },
      { id: '708.2', moduleId: 708, title: 'Продвинутые навыки', description: 'Интубация RSI, крикотиротомия, IO (EZ-IO), ЦВК, FAST/eFAST, дренирование плевры, инфузия вазопрессоров.', tags: ['RSI', 'EZ-IO', 'FAST'], difficulty: 'intermediate' },
      { id: '708.3', moduleId: 708, title: 'Экспертные навыки', description: 'Видеоларингоскопия, регионарные блокады под УЗИ, реанимационная торакотомия, интраоперационный мониторинг, управление ВЧД.', tags: ['видеоларингоскоп', 'УЗИ-блокады', 'торакотомия'], difficulty: 'advanced' },
    ],
  },
];

// ════════════════════════════════════════════════════════════
// ОБЪЕДИНЕНИЕ ВСЕХ МОДУЛЕЙ
// ════════════════════════════════════════════════════════════

export const modules: Module[] = [
  ...basicModules,
  ...advancedModules,
  ...expertModules,
  ...expansionModules,
  ...territoriesModules,
  ...frontiersModules,
  ...calculatorsModules,
  ...subjectsModules,
];

export function getCourseById(id: string): Course | undefined {
  for (const mod of modules) {
    const course = mod.courses.find(c => c.id === id);
    if (course) return course;
  }
  return undefined;
}

export function getModuleById(id: number): Module | undefined {
  return modules.find(m => m.id === id);
}

export function getModuleForCourse(courseId: string): Module | undefined {
  const moduleId = parseInt(courseId.split('.')[0]);
  return getModuleById(moduleId);
}

export function getModulesBySection(sectionId: SectionId): Module[] {
  return modules.filter(m => m.sectionId === sectionId);
}

export function getSectionById(id: SectionId): Section | undefined {
  return sections.find(s => s.id === id);
}

export const TOTAL_COURSES = modules.reduce((sum, m) => sum + m.courses.length, 0);
