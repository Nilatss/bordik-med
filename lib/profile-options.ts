/** Profile dropdown options */

export interface Option {
  value: string;
  label: string;
  emoji?: string;
  /** Optional group label — renders a divider header in the dropdown when group changes */
  group?: string;
}

export const countries: Option[] = [
  { value: 'RU',    label: 'Россия',           emoji: '🇷🇺' },
  { value: 'KZ',    label: 'Казахстан',        emoji: '🇰🇿' },
  { value: 'BY',    label: 'Беларусь',         emoji: '🇧🇾' },
  { value: 'UA',    label: 'Украина',          emoji: '🇺🇦' },
  { value: 'UZ',    label: 'Узбекистан',       emoji: '🇺🇿' },
  { value: 'KG',    label: 'Кыргызстан',       emoji: '🇰🇬' },
  { value: 'TJ',    label: 'Таджикистан',      emoji: '🇹🇯' },
  { value: 'TM',    label: 'Туркменистан',     emoji: '🇹🇲' },
  { value: 'AZ',    label: 'Азербайджан',      emoji: '🇦🇿' },
  { value: 'AM',    label: 'Армения',          emoji: '🇦🇲' },
  { value: 'GE',    label: 'Грузия',           emoji: '🇬🇪' },
  { value: 'MD',    label: 'Молдова',          emoji: '🇲🇩' },
  { value: 'TR',    label: 'Турция',           emoji: '🇹🇷' },
  { value: 'DE',    label: 'Германия',         emoji: '🇩🇪' },
  { value: 'FR',    label: 'Франция',          emoji: '🇫🇷' },
  { value: 'GB',    label: 'Великобритания',   emoji: '🇬🇧' },
  { value: 'US',    label: 'США',              emoji: '🇺🇸' },
  { value: 'CA',    label: 'Канада',           emoji: '🇨🇦' },
  { value: 'IL',    label: 'Израиль',          emoji: '🇮🇱' },
  { value: 'AE',    label: 'ОАЭ',              emoji: '🇦🇪' },
  { value: 'IN',    label: 'Индия',            emoji: '🇮🇳' },
  { value: 'CN',    label: 'Китай',            emoji: '🇨🇳' },
  { value: 'KR',    label: 'Южная Корея',      emoji: '🇰🇷' },
  { value: 'JP',    label: 'Япония',           emoji: '🇯🇵' },
  { value: 'PL',    label: 'Польша',           emoji: '🇵🇱' },
  { value: 'CZ',    label: 'Чехия',            emoji: '🇨🇿' },
  { value: 'OTHER', label: 'Другая',           emoji: '🌍' },
];

export const statuses: Option[] = [
  // ═══ Школа ═══
  { value: 'school-junior',  label: 'Школьник (5–8 класс)',          emoji: '🎒', group: 'Школа' },
  { value: 'school',         label: 'Школьник (9–11 класс)',         emoji: '📘', group: 'Школа' },
  { value: 'school-graduate',label: 'Выпускник школы / Абитуриент',  emoji: '🎓', group: 'Школа' },
  { value: 'college',        label: 'Студент колледжа / Медучилища', emoji: '🏫', group: 'Школа' },

  // ═══ ВУЗ ═══
  { value: 'uni-1',          label: 'Студент 1 курса',      emoji: '📚', group: 'ВУЗ' },
  { value: 'uni-2',          label: 'Студент 2 курса',      emoji: '📚', group: 'ВУЗ' },
  { value: 'uni-3',          label: 'Студент 3 курса',      emoji: '📚', group: 'ВУЗ' },
  { value: 'uni-4',          label: 'Студент 4 курса',      emoji: '📚', group: 'ВУЗ' },
  { value: 'uni-5',          label: 'Студент 5 курса',      emoji: '📚', group: 'ВУЗ' },
  { value: 'uni-6',          label: 'Студент 6 курса',      emoji: '📚', group: 'ВУЗ' },
  { value: 'university',     label: 'Студент ВУЗа (общее)', emoji: '🎓', group: 'ВУЗ' },
  { value: 'intern',         label: 'Интерн',               emoji: '🧑‍⚕️', group: 'ВУЗ' },

  // ═══ Постдипломное образование ═══
  { value: 'resident',       label: 'Ординатор',              emoji: '🩺', group: 'Постдипломное' },
  { value: 'resident-chief', label: 'Старший ординатор',      emoji: '🩺', group: 'Постдипломное' },
  { value: 'phd-student',    label: 'Аспирант',               emoji: '🧠', group: 'Постдипломное' },
  { value: 'doctoral',       label: 'Докторант',              emoji: '🎓', group: 'Постдипломное' },
  { value: 'fellowship',     label: 'Fellowship / Стажировка',emoji: '🌐', group: 'Постдипломное' },

  // ═══ Практикующие врачи ═══
  { value: 'doctor-junior', label: 'Начинающий врач',             emoji: '👩‍⚕️', group: 'Практика' },
  { value: 'doctor',        label: 'Врач',                        emoji: '👨‍⚕️', group: 'Практика' },
  { value: 'doctor-senior', label: 'Врач высшей категории',       emoji: '🏅', group: 'Практика' },
  { value: 'chief-doctor',  label: 'Заведующий отделением',       emoji: '🏥', group: 'Практика' },
  { value: 'head-doctor',   label: 'Главный врач',                emoji: '👔', group: 'Практика' },
  { value: 'private',       label: 'Частная практика',            emoji: '🏢', group: 'Практика' },

  // ═══ Средний медперсонал ═══
  { value: 'nurse',          label: 'Медсестра / Медбрат',   emoji: '💉', group: 'Средний медперсонал' },
  { value: 'nurse-chief',    label: 'Старшая медсестра',      emoji: '💊', group: 'Средний медперсонал' },
  { value: 'paramedic',      label: 'Фельдшер',               emoji: '🚑', group: 'Средний медперсонал' },
  { value: 'midwife',        label: 'Акушерка',               emoji: '🤱', group: 'Средний медперсонал' },
  { value: 'lab-assistant',  label: 'Лаборант',               emoji: '🧪', group: 'Средний медперсонал' },
  { value: 'radiology-tech', label: 'Рентгенолаборант',       emoji: '📡', group: 'Средний медперсонал' },
  { value: 'pharmacy-tech',  label: 'Фармацевт (средний)',    emoji: '💊', group: 'Средний медперсонал' },
  { value: 'dental-tech',    label: 'Зубной техник',          emoji: '🦷', group: 'Средний медперсонал' },

  // ═══ Смежные специалисты ═══
  { value: 'pharmacist',     label: 'Провизор',                     emoji: '💊', group: 'Смежные специалисты' },
  { value: 'dentist',        label: 'Врач-стоматолог',              emoji: '🦷', group: 'Смежные специалисты' },
  { value: 'psychologist',   label: 'Клинический психолог',         emoji: '🧠', group: 'Смежные специалисты' },
  { value: 'physiotherapist',label: 'Физиотерапевт',                emoji: '💆', group: 'Смежные специалисты' },
  { value: 'nutritionist',   label: 'Диетолог / Нутрициолог',       emoji: '🥗', group: 'Смежные специалисты' },
  { value: 'veterinarian',   label: 'Ветеринарный врач',            emoji: '🐾', group: 'Смежные специалисты' },
  { value: 'biologist',      label: 'Биолог / Биохимик',            emoji: '🧬', group: 'Смежные специалисты' },

  // ═══ Наука и образование ═══
  { value: 'teacher',        label: 'Преподаватель',            emoji: '📚', group: 'Наука и образование' },
  { value: 'docent',         label: 'Доцент',                   emoji: '🎓', group: 'Наука и образование' },
  { value: 'professor',      label: 'Профессор',                emoji: '🏛️', group: 'Наука и образование' },
  { value: 'dean',           label: 'Декан / Зав. кафедрой',    emoji: '🏢', group: 'Наука и образование' },
  { value: 'researcher',     label: 'Научный сотрудник',        emoji: '🔬', group: 'Наука и образование' },
  { value: 'tutor',          label: 'Репетитор / Тьютор',       emoji: '📝', group: 'Наука и образование' },
  { value: 'methodist',      label: 'Методист',                 emoji: '📋', group: 'Наука и образование' },

  // ═══ Прочее ═══
  { value: 'admin',          label: 'Администратор клиники',         emoji: '🗂️', group: 'Прочее' },
  { value: 'medrep',         label: 'Медицинский представитель',     emoji: '💼', group: 'Прочее' },
  { value: 'med-writer',     label: 'Медицинский копирайтер / журналист', emoji: '✍️', group: 'Прочее' },
  { value: 'med-tech-dev',   label: 'Разработчик медтехнологий',     emoji: '💻', group: 'Прочее' },
  { value: 'retired',        label: 'На пенсии',                     emoji: '🌿', group: 'Прочее' },
  { value: 'parent',         label: 'Родитель учащегося',            emoji: '👪', group: 'Прочее' },
  { value: 'career-change',  label: 'Меняю профессию',               emoji: '🔄', group: 'Прочее' },
  { value: 'other',          label: 'Другое',                        emoji: '✨', group: 'Прочее' },
];

export const specialties: Option[] = [
  // ═══ Базовые программы подготовки (ВУЗ) ═══
  { value: 'general',      label: 'Лечебное дело',                        emoji: '🩺', group: 'Базовая подготовка' },
  { value: 'pediatrics',   label: 'Педиатрия',                            emoji: '👶', group: 'Базовая подготовка' },
  { value: 'dentistry',    label: 'Стоматология',                         emoji: '🦷', group: 'Базовая подготовка' },
  { value: 'pharmacy',     label: 'Фармация',                             emoji: '💊', group: 'Базовая подготовка' },
  { value: 'preventive',   label: 'Медико-профилактическое дело',         emoji: '🛡️', group: 'Базовая подготовка' },
  { value: 'nursing',      label: 'Сестринское дело',                     emoji: '💉', group: 'Базовая подготовка' },
  { value: 'bio-med',      label: 'Медицинская биохимия / биофизика',     emoji: '🧬', group: 'Базовая подготовка' },
  { value: 'cybernetics',  label: 'Медицинская кибернетика',              emoji: '💻', group: 'Базовая подготовка' },
  { value: 'clin-psy',     label: 'Клиническая психология',               emoji: '🧠', group: 'Базовая подготовка' },

  // ═══ Терапевтические ═══
  { value: 'internal',     label: 'Терапия / Внутренние болезни',         emoji: '🩻', group: 'Терапевтические' },
  { value: 'cardiology',   label: 'Кардиология',                          emoji: '❤️', group: 'Терапевтические' },
  { value: 'endocrinology',label: 'Эндокринология',                       emoji: '⚖️', group: 'Терапевтические' },
  { value: 'gastroenterology', label: 'Гастроэнтерология',                emoji: '🫃', group: 'Терапевтические' },
  { value: 'pulmonology',  label: 'Пульмонология',                        emoji: '🫁', group: 'Терапевтические' },
  { value: 'nephrology',   label: 'Нефрология',                           emoji: '🧪', group: 'Терапевтические' },
  { value: 'hematology',   label: 'Гематология',                          emoji: '🩸', group: 'Терапевтические' },
  { value: 'rheumatology', label: 'Ревматология',                         emoji: '🦴', group: 'Терапевтические' },
  { value: 'allergology',  label: 'Аллергология / Иммунология',           emoji: '🌿', group: 'Терапевтические' },
  { value: 'infectious',   label: 'Инфекционные болезни',                 emoji: '🦠', group: 'Терапевтические' },
  { value: 'phthisiology', label: 'Фтизиатрия',                           emoji: '🫁', group: 'Терапевтические' },
  { value: 'dermatology',  label: 'Дерматовенерология',                   emoji: '🧴', group: 'Терапевтические' },
  { value: 'neurology',    label: 'Неврология',                           emoji: '🧠', group: 'Терапевтические' },
  { value: 'geriatrics',   label: 'Гериатрия',                            emoji: '👴', group: 'Терапевтические' },
  { value: 'family',       label: 'Общая врачебная практика / Семейная', emoji: '👨‍👩‍👧', group: 'Терапевтические' },

  // ═══ Хирургические ═══
  { value: 'surgery',          label: 'Общая хирургия',                    emoji: '🔪', group: 'Хирургические' },
  { value: 'traumatology',     label: 'Травматология и ортопедия',         emoji: '🦴', group: 'Хирургические' },
  { value: 'neurosurgery',     label: 'Нейрохирургия',                     emoji: '🧠', group: 'Хирургические' },
  { value: 'cardiothoracic',   label: 'Сердечно-сосудистая хирургия',      emoji: '❤️', group: 'Хирургические' },
  { value: 'thoracic',         label: 'Торакальная хирургия',              emoji: '🫁', group: 'Хирургические' },
  { value: 'vascular',         label: 'Сосудистая хирургия',               emoji: '🩸', group: 'Хирургические' },
  { value: 'urology',          label: 'Урология',                          emoji: '🚽', group: 'Хирургические' },
  { value: 'plastic',          label: 'Пластическая хирургия',             emoji: '✨', group: 'Хирургические' },
  { value: 'maxillofacial',    label: 'Челюстно-лицевая хирургия',         emoji: '😬', group: 'Хирургические' },
  { value: 'oncosurgery',      label: 'Онкохирургия',                      emoji: '🎗️', group: 'Хирургические' },
  { value: 'pediatric-surgery',label: 'Детская хирургия',                  emoji: '👶', group: 'Хирургические' },
  { value: 'transplant',       label: 'Трансплантология',                  emoji: '🫀', group: 'Хирургические' },
  { value: 'coloproctology',   label: 'Колопроктология',                   emoji: '🩻', group: 'Хирургические' },

  // ═══ Охрана материнства и детства ═══
  { value: 'obstetrics',       label: 'Акушерство и гинекология',         emoji: '🤰', group: 'Материнство и детство' },
  { value: 'reproductive',     label: 'Репродуктология / ЭКО',            emoji: '🧬', group: 'Материнство и детство' },
  { value: 'neonatology',      label: 'Неонатология',                      emoji: '👶', group: 'Материнство и детство' },
  { value: 'pediatric-spec',   label: 'Педиатрические специальности',     emoji: '🧸', group: 'Материнство и детство' },

  // ═══ Диагностика / Лаборатория ═══
  { value: 'radiology',      label: 'Лучевая диагностика / Радиология',   emoji: '📡', group: 'Диагностика' },
  { value: 'us-diagnostics', label: 'УЗИ-диагностика',                     emoji: '📟', group: 'Диагностика' },
  { value: 'functional',     label: 'Функциональная диагностика',          emoji: '📊', group: 'Диагностика' },
  { value: 'endoscopy',      label: 'Эндоскопия',                          emoji: '🔦', group: 'Диагностика' },
  { value: 'pathology',      label: 'Патологическая анатомия',             emoji: '🔬', group: 'Диагностика' },
  { value: 'lab-diagnostics',label: 'Клиническая лабораторная диагностика',emoji: '⚗️', group: 'Диагностика' },
  { value: 'genetics',       label: 'Медицинская генетика',                emoji: '🧬', group: 'Диагностика' },
  { value: 'forensic',       label: 'Судебно-медицинская экспертиза',      emoji: '⚖️', group: 'Диагностика' },

  // ═══ Онкология / Радиация ═══
  { value: 'oncology',         label: 'Онкология',                        emoji: '🎗️', group: 'Онкология и радиология' },
  { value: 'radiotherapy',     label: 'Радиотерапия',                     emoji: '☢️', group: 'Онкология и радиология' },
  { value: 'nuclear-medicine', label: 'Ядерная медицина',                  emoji: '⚛️', group: 'Онкология и радиология' },

  // ═══ Неотложная помощь / Анестезия / Реанимация ═══
  { value: 'anesthesia',  label: 'Анестезиология-реаниматология',    emoji: '😴', group: 'Неотложка и реанимация' },
  { value: 'emergency',   label: 'Скорая медицинская помощь',         emoji: '🚑', group: 'Неотложка и реанимация' },
  { value: 'toxicology',  label: 'Токсикология',                      emoji: '☠️', group: 'Неотложка и реанимация' },

  // ═══ Психическое здоровье ═══
  { value: 'psychiatry',   label: 'Психиатрия',                       emoji: '🧘', group: 'Психическое здоровье' },
  { value: 'psychotherapy',label: 'Психотерапия',                     emoji: '💬', group: 'Психическое здоровье' },
  { value: 'narcology',    label: 'Психиатрия-наркология',            emoji: '💊', group: 'Психическое здоровье' },
  { value: 'child-psy',    label: 'Детская психиатрия',               emoji: '🧒', group: 'Психическое здоровье' },

  // ═══ Голова и шея / Сенсорные ═══
  { value: 'ophthalmology', label: 'Офтальмология',                   emoji: '👁️', group: 'Голова, шея, сенсорные' },
  { value: 'ent',           label: 'Оториноларингология (ЛОР)',       emoji: '👂', group: 'Голова, шея, сенсорные' },
  { value: 'oral-dent',     label: 'Терапевтическая стоматология',    emoji: '🦷', group: 'Голова, шея, сенсорные' },
  { value: 'orthodontics',  label: 'Ортодонтия',                      emoji: '🦷', group: 'Голова, шея, сенсорные' },
  { value: 'oral-surgery',  label: 'Хирургическая стоматология',      emoji: '🦷', group: 'Голова, шея, сенсорные' },

  // ═══ Реабилитация и спорт ═══
  { value: 'rehabilitation',label: 'Медицинская реабилитация',        emoji: '🦽', group: 'Реабилитация и спорт' },
  { value: 'sports-med',    label: 'Спортивная медицина',             emoji: '🏃', group: 'Реабилитация и спорт' },
  { value: 'physiotherapy', label: 'Физиотерапия',                    emoji: '💆', group: 'Реабилитация и спорт' },
  { value: 'pain',          label: 'Паллиативная помощь / Боль',      emoji: '🕊️', group: 'Реабилитация и спорт' },

  // ═══ Общественное здоровье / Управление ═══
  { value: 'public-health',      label: 'Общественное здоровье',       emoji: '🏥', group: 'Общественное здоровье' },
  { value: 'epidemiology',       label: 'Эпидемиология',                emoji: '📈', group: 'Общественное здоровье' },
  { value: 'occupational',       label: 'Профпатология',                emoji: '⚙️', group: 'Общественное здоровье' },
  { value: 'hygiene',            label: 'Гигиена',                      emoji: '🧼', group: 'Общественное здоровье' },
  { value: 'sanitation',         label: 'Санитарно-гигиенические',      emoji: '🛡️', group: 'Общественное здоровье' },
  { value: 'health-management',  label: 'Организация здравоохранения',  emoji: '🏛️', group: 'Общественное здоровье' },
  { value: 'medical-statistics', label: 'Медицинская статистика',       emoji: '📊', group: 'Общественное здоровье' },

  // ═══ Парамедицинские / Вспомогательные ═══
  { value: 'nursing-pro',     label: 'Медсестринское дело (практика)', emoji: '💉', group: 'Парамедицинские' },
  { value: 'paramedic',       label: 'Фельдшер',                       emoji: '🚑', group: 'Парамедицинские' },
  { value: 'midwife',         label: 'Акушерка',                       emoji: '🤱', group: 'Парамедицинские' },
  { value: 'lab-tech',        label: 'Медицинский лабораторный техник',emoji: '🧪', group: 'Парамедицинские' },
  { value: 'pharmacist',      label: 'Провизор / Фармацевт',           emoji: '💊', group: 'Парамедицинские' },
  { value: 'dental-tech',     label: 'Зубной техник',                  emoji: '🪥', group: 'Парамедицинские' },
  { value: 'dental-hygienist',label: 'Гигиенист стоматологический',    emoji: '✨', group: 'Парамедицинские' },

  // ═══ Наука / Техника ═══
  { value: 'research',        label: 'Медицинская наука / Исследования', emoji: '🔬', group: 'Наука и технологии' },
  { value: 'bioinformatics',  label: 'Биоинформатика',                   emoji: '💻', group: 'Наука и технологии' },
  { value: 'medtech',         label: 'Медицинская техника',              emoji: '🩻', group: 'Наука и технологии' },
  { value: 'digital-health',  label: 'Цифровая медицина / E-health',     emoji: '📱', group: 'Наука и технологии' },
  { value: 'medical-ai',      label: 'ИИ в медицине',                    emoji: '🤖', group: 'Наука и технологии' },

  // ═══ Прочее ═══
  { value: 'veterinary',  label: 'Ветеринария',                emoji: '🐾', group: 'Прочее' },
  { value: 'aviation',    label: 'Авиационная / Космическая медицина', emoji: '✈️', group: 'Прочее' },
  { value: 'military',    label: 'Военная медицина',           emoji: '🎖️', group: 'Прочее' },
  { value: 'sport-physio',label: 'Мануальная терапия',         emoji: '🙌', group: 'Прочее' },
  { value: 'acupuncture', label: 'Рефлексотерапия',            emoji: '📍', group: 'Прочее' },
  { value: 'cosmetology', label: 'Косметология',               emoji: '💄', group: 'Прочее' },
  { value: 'nutrition',   label: 'Диетология',                 emoji: '🥗', group: 'Прочее' },
  { value: 'undecided',   label: 'Ещё не выбрал(а)',           emoji: '🤔', group: 'Прочее' },
];

export const goals: Option[] = [
  // International medical licensing exams — shown first
  { value: 'usmle',   label: 'USMLE (США)',                emoji: '🇺🇸', group: 'Международные экзамены' },
  { value: 'plab',    label: 'PLAB (Великобритания)',       emoji: '🇬🇧', group: 'Международные экзамены' },
  { value: 'mrcp',    label: 'MRCP (Великобритания)',       emoji: '🇬🇧', group: 'Международные экзамены' },
  { value: 'mrcs',    label: 'MRCS (Великобритания)',       emoji: '🇬🇧', group: 'Международные экзамены' },
  { value: 'mccqe',   label: 'MCCQE (Канада)',              emoji: '🇨🇦', group: 'Международные экзамены' },
  { value: 'amc',     label: 'AMC (Австралия)',             emoji: '🇦🇺', group: 'Международные экзамены' },
  { value: 'nzrex',   label: 'NZREX (Новая Зеландия)',      emoji: '🇳🇿', group: 'Международные экзамены' },
  { value: 'euboard', label: 'European Board (ЕС)',         emoji: '🇪🇺', group: 'Международные экзамены' },
  { value: 'fsmge',   label: 'FSMGE / FMGE (Индия)',        emoji: '🇮🇳', group: 'Международные экзамены' },
  { value: 'neet',    label: 'NEET PG (Индия)',             emoji: '🇮🇳', group: 'Международные экзамены' },
  { value: 'dha',     label: 'DHA (Дубай)',                 emoji: '🇦🇪', group: 'Международные экзамены' },
  { value: 'moh',     label: 'MOH (ОАЭ)',                   emoji: '🇦🇪', group: 'Международные экзамены' },
  { value: 'haad',    label: 'HAAD (Абу-Даби)',             emoji: '🇦🇪', group: 'Международные экзамены' },
  { value: 'sle',     label: 'SLE / SMLE (Саудовская Аравия)', emoji: '🇸🇦', group: 'Международные экзамены' },
  { value: 'qchp',    label: 'QCHP (Катар)',                emoji: '🇶🇦', group: 'Международные экзамены' },
  { value: 'kmle',    label: 'KMLE (Южная Корея)',          emoji: '🇰🇷', group: 'Международные экзамены' },
  { value: 'nmle_jp', label: 'NMLE (Япония)',               emoji: '🇯🇵', group: 'Международные экзамены' },
  { value: 'tus',     label: 'TUS (Турция)',                emoji: '🇹🇷', group: 'Международные экзамены' },
  { value: 'mir',     label: 'MIR (Испания)',               emoji: '🇪🇸', group: 'Международные экзамены' },
  { value: 'lek',     label: 'LEK (Польша)',                emoji: '🇵🇱', group: 'Международные экзамены' },
  { value: 'nmle_de', label: 'Approbation (Германия)',      emoji: '🇩🇪', group: 'Международные экзамены' },
  { value: 'ecfmg',   label: 'ECFMG сертификация',          emoji: '🇺🇸', group: 'Международные экзамены' },

  // Domestic / general learning goals
  { value: 'ege',        label: 'Подготовка к ЕГЭ',            emoji: '📝', group: 'Цели обучения' },
  { value: 'entry',      label: 'Поступление в медвуз',         emoji: '🎯', group: 'Цели обучения' },
  { value: 'university', label: 'Учёба в медвузе',              emoji: '📚', group: 'Цели обучения' },
  { value: 'residency',  label: 'Ординатура',                   emoji: '🏥', group: 'Цели обучения' },
  { value: 'accred',     label: 'Аккредитация / Сертификация',  emoji: '📜', group: 'Цели обучения' },
  { value: 'board',      label: 'Профессиональная аттестация',  emoji: '🏅', group: 'Цели обучения' },
  { value: 'cme',        label: 'CME / Непрерывное обучение',   emoji: '🔄', group: 'Цели обучения' },
  { value: 'research',   label: 'Научная работа / PhD',         emoji: '🔬', group: 'Цели обучения' },
  { value: 'olympiad',   label: 'Медицинские олимпиады',        emoji: '🏆', group: 'Цели обучения' },
  { value: 'interest',   label: 'Для себя / Интерес',           emoji: '💡', group: 'Цели обучения' },
];

/** Find option by value */
export function findOption(list: Option[], value: string): Option | undefined {
  if (!value) return undefined;
  return list.find((o) => o.value === value || o.label === value);
}

/** Display label (with migration for legacy label-stored values) */
export function displayLabel(list: Option[], value: string): string | null {
  if (!value) return null;
  const found = findOption(list, value);
  return found ? found.label : value;
}

/** Display emoji */
export function displayEmoji(list: Option[], value: string): string | null {
  if (!value) return null;
  const found = findOption(list, value);
  return found?.emoji ?? null;
}
