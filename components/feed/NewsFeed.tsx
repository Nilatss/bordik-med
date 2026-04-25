'use client';

import { useAppStore } from '@/lib/store';

interface NewsItem {
  id: string;
  type: 'update' | 'feature' | 'event' | 'tip';
  title: string;
  body: string;
  date: string;
  badge?: string;
}

const NEWS: NewsItem[] = [
  {
    id: 'release-fundamentals',
    type: 'feature',
    title: 'Запущен раздел «Фундаментальная подготовка»',
    body: 'Первый раздел курсов для абитуриентов и студентов младших курсов уже доступен. В разделе собраны базовые темы по биологии, химии, физике и психологии.',
    date: '17 апреля 2026',
    badge: 'Новое',
  },
  {
    id: 'tools-beta',
    type: 'update',
    title: 'Клинические инструменты в разработке',
    body: 'Совсем скоро запустим первые калькуляторы: ИМТ, СКФ, CHA₂DS₂-VASc. Полный список будущих инструментов уже доступен в разделе «Инструменты».',
    date: '15 апреля 2026',
    badge: 'Скоро',
  },
  {
    id: 'language-support',
    type: 'feature',
    title: 'Поддержка 4 языков интерфейса',
    body: "Теперь интерфейс можно переключить на Русский, English или O'zbekcha в настройках профиля.",
    date: '12 апреля 2026',
  },
  {
    id: 'profile-editor',
    type: 'update',
    title: 'Профиль можно редактировать',
    body: 'Добавили возможность указать страну, направление, цель обучения - всё сохраняется автоматически.',
    date: '10 апреля 2026',
  },
  {
    id: 'tip-tests',
    type: 'tip',
    title: 'Как устроено тестирование',
    body: 'Каждый курс включает 5 уровней тестов по 20 вопросов. Для перехода на следующий нужно правильно ответить минимум на 18. После провала - сутки кулдауна.',
    date: '1 апреля 2026',
  },
];

const TYPE_META: Record<NewsItem['type'], { label: string; color: string; bg: string }> = {
  update:  { label: 'Обновление',    color: '#1D4ED8', bg: '#EEF4FF' },
  feature: { label: 'Новая функция', color: '#047857', bg: '#ECFDF5' },
  event:   { label: 'Событие',        color: '#B45309', bg: '#FFFBEB' },
  tip:     { label: 'Совет',          color: '#7E22CE', bg: '#F3E8FF' },
};

export default function NewsFeed() {
  const { userName, setShowLearning, setShowStats } = useAppStore();

  return (
    <div style={{ maxWidth: 860 }}>
      {/* Welcome header - avatar + name + "С возвращением" */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        marginBottom: 28,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: '#E2E4EA',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
          color: '#1A1A1A',
          flexShrink: 0,
        }}>
          {userName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700,
            color: '#1A1A1A', letterSpacing: '-0.01em',
          }}>
            {userName}
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 13, color: '#6B7280',
          }}>
            С возвращением на Bordik <span style={{ marginLeft: 4 }}>👋</span>
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="rg-2" style={{ gap: 'var(--space-3)', marginBottom: 28 }}>
        <button
          onClick={() => setShowLearning(true)}
          style={{
            background: 'linear-gradient(135deg, #1A1A1A 0%, #2B2B2B 100%)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 'var(--md-sys-shape-corner-extra-large)',
            padding: '20px 22px',
            textAlign: 'left',
            cursor: 'pointer',
            display: 'flex', flexDirection: 'column', gap: 8,
            transition: 'transform 350ms cubic-bezier(0.22,1,0.36,1)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
            color: '#A3A3A3', textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            Обучение
          </span>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700,
            letterSpacing: '-0.01em',
          }}>
            Продолжить учиться →
          </span>
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: 13, color: '#BBBBBB',
          }}>
            Откройте разделы и модули
          </span>
        </button>

        <button
          onClick={() => setShowStats(true)}
          style={{
            background: '#F5F6F8',
            color: '#1A1A1A',
            border: 'none',
            borderRadius: 'var(--md-sys-shape-corner-extra-large)',
            padding: '20px 22px',
            textAlign: 'left',
            cursor: 'pointer',
            display: 'flex', flexDirection: 'column', gap: 8,
            transition: 'background 350ms cubic-bezier(0.22,1,0.36,1), transform 350ms cubic-bezier(0.22,1,0.36,1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F0F2F5';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#F5F6F8';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
            color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            Статистика
          </span>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700,
            letterSpacing: '-0.01em',
          }}>
            Ваша активность →
          </span>
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: 13, color: '#6B7280',
          }}>
            Прогресс, тесты, время
          </span>
        </button>
      </div>

      {/* News feed */}
      <h3 style={{
        fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
        color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
        marginBottom: 12,
      }}>
        Новости платформы
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {NEWS.map((item) => {
          const meta = TYPE_META[item.type];
          return (
            <article key={item.id} style={{
              background: '#F5F6F8',
              borderRadius: 'var(--md-sys-shape-corner-extra-large)',
              padding: '20px 24px',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                marginBottom: 10,
              }}>
                <span style={{
                  padding: '3px 10px', borderRadius: 999,
                  background: meta.bg,
                  color: meta.color,
                  fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.04em', textTransform: 'uppercase',
                }}>
                  {meta.label}
                </span>
                {item.badge && (
                  <span style={{
                    padding: '3px 10px', borderRadius: 999,
                    background: '#1A1A1A', color: '#FFFFFF',
                    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                    letterSpacing: '0.04em', textTransform: 'uppercase',
                  }}>
                    {item.badge}
                  </span>
                )}
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9CA3AF',
                  marginLeft: 'auto',
                }}>
                  {item.date}
                </span>
              </div>
              <h4 style={{
                fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
                color: '#1A1A1A', marginBottom: 6, letterSpacing: '-0.01em',
                lineHeight: 1.3,
              }}>
                {item.title}
              </h4>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: 14, color: '#555',
                lineHeight: 1.55,
              }}>
                {item.body}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
