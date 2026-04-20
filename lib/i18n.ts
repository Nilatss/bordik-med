'use client';

import { useAppStore } from './store';

export type LangCode = 'ru' | 'en' | 'kk' | 'uk';

export const languages: { code: LangCode; label: string; flag: string }[] = [
  { code: 'ru', label: 'Русский',    flag: '🇷🇺' },
  { code: 'en', label: 'English',    flag: '🇬🇧' },
  { code: 'kk', label: 'Қазақша',    flag: '🇰🇿' },
  { code: 'uk', label: 'Українська', flag: '🇺🇦' },
];

type Dict = Record<string, string>;

const ru: Dict = {
  // Nav
  'nav.home': 'Главная',
  'nav.learning': 'Обучение',
  'nav.tests': 'Тесты',
  'nav.tools': 'Инструменты',
  'nav.stats': 'Статистика',
  'nav.profile': 'Профиль',
  'nav.search': 'Поиск...',
  'nav.nothingFound': 'Ничего не найдено',
  'nav.group.main': 'Основное',
  'nav.group.services': 'Сервисы',
  'nav.group.account': 'Аккаунт',
  'nav.group.courses': 'Найденные курсы',
  'nav.group.coursesAvailable': 'Доступные курсы',
  'nav.group.coursesSoon': 'Скоро будут доступны',
  'sidebar.welcome': 'Рады видеть\nвас!',
  // Profile
  'profile.email': 'Email',
  'profile.status': 'Статус',
  'profile.country': 'Страна',
  'profile.specialty': 'Направление',
  'profile.language': 'Язык интерфейса',
  'profile.goal': 'Цель обучения',
  'profile.notSet': 'Не указано',
  'profile.notSetF': 'Не указана',
  'profile.notSetM': 'Не указан',
  'profile.chooseEmail': 'Введите email',
  'profile.invalidEmail': 'Некорректный email',
  'profile.progress': 'Прогресс',
  'profile.tests': 'Тесты',
  'profile.avgScore': 'Средний балл',
  'profile.courses': 'Курсы',
  'profile.studyTime': 'Время обучения',
  'profile.coursesDone': '{n} из {total} курсов завершено',
  'profile.testsDone': '{n} тестов пройдено из {total}',
  'profile.noAttempts': 'Нет попыток',
  'profile.scoreBy': '{score}% по {n} попыткам',
  'profile.excellent': 'Отлично',
  'profile.good': 'Хорошо',
  'profile.start': 'Начало',
  'profile.needImprove': 'Нужно улучшить',
  'profile.much': 'Много',
  'profile.medium': 'Средне',
  'profile.little': 'Мало',
  'profile.bordikScore': 'Bordik Score',
  'profile.notChosen': '- не выбрано -',
  'footer.poweredBy': 'Powered by',
  'common.save': 'Сохранить',
  'common.cancel': 'Отмена',
  'common.search': 'Поиск...',
};

const en: Dict = {
  'nav.home': 'Home',
  'nav.learning': 'Learning',
  'nav.tests': 'Tests',
  'nav.tools': 'Tools',
  'nav.stats': 'Statistics',
  'nav.profile': 'Profile',
  'nav.search': 'Search...',
  'nav.nothingFound': 'Nothing found',
  'nav.group.main': 'Main',
  'nav.group.services': 'Services',
  'nav.group.account': 'Account',
  'nav.group.courses': 'Matching courses',
  'nav.group.coursesAvailable': 'Available courses',
  'nav.group.coursesSoon': 'Coming soon',
  'sidebar.welcome': 'Welcome\nback!',
  'profile.email': 'Email',
  'profile.status': 'Status',
  'profile.country': 'Country',
  'profile.specialty': 'Specialty',
  'profile.language': 'Interface language',
  'profile.goal': 'Learning goal',
  'profile.notSet': 'Not set',
  'profile.notSetF': 'Not set',
  'profile.notSetM': 'Not set',
  'profile.chooseEmail': 'Enter email',
  'profile.invalidEmail': 'Invalid email',
  'profile.progress': 'Progress',
  'profile.tests': 'Tests',
  'profile.avgScore': 'Avg. score',
  'profile.courses': 'Courses',
  'profile.studyTime': 'Study time',
  'profile.coursesDone': '{n} of {total} courses completed',
  'profile.testsDone': '{n} tests passed out of {total}',
  'profile.noAttempts': 'No attempts',
  'profile.scoreBy': '{score}% over {n} attempts',
  'profile.excellent': 'Excellent',
  'profile.good': 'Good',
  'profile.start': 'Starting',
  'profile.needImprove': 'Needs work',
  'profile.much': 'High',
  'profile.medium': 'Medium',
  'profile.little': 'Low',
  'profile.bordikScore': 'Bordik Score',
  'profile.notChosen': '- not selected -',
  'footer.poweredBy': 'Powered by',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.search': 'Search...',
};

const kk: Dict = {
  'nav.home': 'Басты бет',
  'nav.learning': 'Оқу',
  'nav.tests': 'Тесттер',
  'nav.tools': 'Құралдар',
  'nav.stats': 'Статистика',
  'nav.profile': 'Профиль',
  'nav.search': 'Іздеу...',
  'nav.nothingFound': 'Ештеңе табылмады',
  'nav.group.main': 'Негізгі',
  'nav.group.services': 'Сервистер',
  'nav.group.account': 'Аккаунт',
  'nav.group.courses': 'Табылған курстар',
  'nav.group.coursesAvailable': 'Қолжетімді курстар',
  'nav.group.coursesSoon': 'Жақында қолжетімді',
  'sidebar.welcome': 'Қош келдіңіз!',
  'profile.email': 'Email',
  'profile.status': 'Мәртебесі',
  'profile.country': 'Ел',
  'profile.specialty': 'Бағыт',
  'profile.language': 'Интерфейс тілі',
  'profile.goal': 'Оқу мақсаты',
  'profile.notSet': 'Көрсетілмеген',
  'profile.notSetF': 'Көрсетілмеген',
  'profile.notSetM': 'Көрсетілмеген',
  'profile.chooseEmail': 'Email енгізіңіз',
  'profile.invalidEmail': 'Қате email',
  'profile.progress': 'Ілгері',
  'profile.tests': 'Тесттер',
  'profile.avgScore': 'Орташа балл',
  'profile.courses': 'Курстар',
  'profile.studyTime': 'Оқу уақыты',
  'profile.coursesDone': '{total}-тен {n} курс аяқталды',
  'profile.testsDone': '{total}-тен {n} тест тапсырылды',
  'profile.noAttempts': 'Әрекеттер жоқ',
  'profile.scoreBy': '{n} әрекетте {score}%',
  'profile.excellent': 'Тамаша',
  'profile.good': 'Жақсы',
  'profile.start': 'Бастама',
  'profile.needImprove': 'Жақсарту керек',
  'profile.much': 'Көп',
  'profile.medium': 'Орташа',
  'profile.little': 'Аз',
  'profile.bordikScore': 'Bordik Score',
  'profile.notChosen': '- таңдалмаған -',
  'footer.poweredBy': 'Powered by',
  'common.save': 'Сақтау',
  'common.cancel': 'Болдырмау',
  'common.search': 'Іздеу...',
};

const uk: Dict = {
  'nav.home': 'Головна',
  'nav.learning': 'Навчання',
  'nav.tests': 'Тести',
  'nav.tools': 'Інструменти',
  'nav.stats': 'Статистика',
  'nav.profile': 'Профіль',
  'nav.search': 'Пошук...',
  'nav.nothingFound': 'Нічого не знайдено',
  'nav.group.main': 'Основне',
  'nav.group.services': 'Сервіси',
  'nav.group.account': 'Обліковий запис',
  'nav.group.courses': 'Знайдені курси',
  'nav.group.coursesAvailable': 'Доступні курси',
  'nav.group.coursesSoon': 'Незабаром',
  'sidebar.welcome': 'Раді вас\nбачити!',
  'profile.email': 'Email',
  'profile.status': 'Статус',
  'profile.country': 'Країна',
  'profile.specialty': 'Напрямок',
  'profile.language': 'Мова інтерфейсу',
  'profile.goal': 'Мета навчання',
  'profile.notSet': 'Не вказано',
  'profile.notSetF': 'Не вказана',
  'profile.notSetM': 'Не вказаний',
  'profile.chooseEmail': 'Введіть email',
  'profile.invalidEmail': 'Некоректний email',
  'profile.progress': 'Прогрес',
  'profile.tests': 'Тести',
  'profile.avgScore': 'Середній бал',
  'profile.courses': 'Курси',
  'profile.studyTime': 'Час навчання',
  'profile.coursesDone': '{n} із {total} курсів завершено',
  'profile.testsDone': '{n} тестів пройдено з {total}',
  'profile.noAttempts': 'Немає спроб',
  'profile.scoreBy': '{score}% за {n} спроб',
  'profile.excellent': 'Відмінно',
  'profile.good': 'Добре',
  'profile.start': 'Початок',
  'profile.needImprove': 'Потрібно покращити',
  'profile.much': 'Багато',
  'profile.medium': 'Середньо',
  'profile.little': 'Мало',
  'profile.bordikScore': 'Bordik Score',
  'profile.notChosen': '- не вибрано -',
  'footer.poweredBy': 'Powered by',
  'common.save': 'Зберегти',
  'common.cancel': 'Скасувати',
  'common.search': 'Пошук...',
};

const dictionaries: Record<LangCode, Dict> = { ru, en, kk, uk };

/** Backward compat: map legacy label → code */
export function normalizeLang(v: string): LangCode {
  if (v === 'Русский' || v === 'ru') return 'ru';
  if (v === 'English' || v === 'en') return 'en';
  if (v === 'Қазақша' || v === 'kk') return 'kk';
  if (v === 'Українська' || v === 'uk') return 'uk';
  return 'ru';
}

export function t(lang: LangCode, key: string, vars?: Record<string, string | number>): string {
  const dict = dictionaries[lang] || ru;
  let str = dict[key] ?? ru[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return str;
}

export function useT() {
  const userLanguage = useAppStore((s) => s.userLanguage);
  const lang = normalizeLang(userLanguage);
  return (key: string, vars?: Record<string, string | number>) => t(lang, key, vars);
}

export function useLang(): LangCode {
  const userLanguage = useAppStore((s) => s.userLanguage);
  return normalizeLang(userLanguage);
}

/* Email validation */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}
