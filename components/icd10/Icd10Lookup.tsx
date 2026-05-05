'use client';

/**
 * МКБ-10 lookup — поиск кода по названию диагноза или по самому коду.
 *
 * Стартовая база — ~80–90 наиболее частых кодов из data/icd10-starter.json,
 * охватывает все 22 главы. Расширение до полных ~14 000 кодов планируется
 * через scripts/build-icd10.mjs (см. docs/CONTENT_ROADMAP.md, фича #3).
 *
 * Поиск
 * -----
 * - Без AI, без сетевых вызовов. Линейный fuzzy-фильтр на клиенте: при
 *   текущем размере (~100 entries) этого хватает с запасом, ms-уровень
 *   ответ. После расширения до 14 000 — переключим на MiniSearch index
 *   (мы уже используем MiniSearch для каталога tools).
 * - Совпадение по `code.toLowerCase().startsWith()` И по
 *   `title.toLowerCase().includes()` — даёт одинаково удобный поиск
 *   как по «I10» так и по «гипертензия».
 */
import { useMemo, useState } from 'react';

interface Chapter {
  id: string;
  range: string;
  title: string;
}

interface CodeEntry {
  code: string;
  title: string;
  chapter: string;
}

interface Props {
  chapters: Chapter[];
  codes: CodeEntry[];
  /** Версия и дата стартовой базы — пробрасываются из server-страницы. */
  version: string;
  lastUpdated: string;
  source: string;
}

export default function Icd10Lookup({ chapters, codes, version, lastUpdated, source }: Props) {
  const [q, setQ] = useState('');
  const [activeChapter, setActiveChapter] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    let pool = codes;
    if (activeChapter) pool = pool.filter((c) => c.chapter === activeChapter);
    if (!query) return pool;
    return pool.filter((c) => {
      return (
        c.code.toLowerCase().startsWith(query) ||
        c.title.toLowerCase().includes(query)
      );
    });
  }, [q, activeChapter, codes]);

  const chapterById = useMemo(
    () => Object.fromEntries(chapters.map((c) => [c.id, c])) as Record<string, Chapter>,
    [chapters],
  );

  return (
    <main
      id="main-content"
      style={{
        width: '100%',
        fontFamily: 'var(--font-body, system-ui)',
        color: 'var(--md-sys-color-on-surface, #1A1A1A)',
      }}
    >
      {/* Заголовок и подпись — повторяет паттерн ToolsPage:
          display-font 28, body-font 14 muted, gap 6+20. */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700,
          color: '#1A1A1A', marginBottom: 6, letterSpacing: '-0.02em',
        }}>
          МКБ-10
        </h2>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 14, color: '#6B7280', lineHeight: 1.5,
        }}>
          Справочник кодов: поиск по диагнозу или коду. Все 22 главы МКБ-10
          в редакции ВОЗ (русский перевод Минздрава) — {codes.length} наиболее
          частых кодов.
        </p>
      </div>

      {/* Search — точно как в /tools: иконка слева, F5F6F8 пилл, max 480 */}
      <div style={{ marginBottom: 14 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 16px',
          background: '#F5F6F8',
          borderRadius: 12,
          maxWidth: 480,
        }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
            stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder='Например: "I10", "гипертензия", "пневмония"…'
            aria-label="Поиск кода или диагноза"
            style={{
              flex: 1,
              border: 'none', outline: 'none',
              background: 'transparent',
              fontFamily: 'var(--font-body)', fontSize: 14,
              color: '#1A1A1A',
            }}
          />
          {q && (
            <button
              onClick={() => setQ('')}
              style={{
                background: 'transparent', border: 'none', padding: 0,
                cursor: 'pointer', color: '#9CA3AF',
                display: 'flex',
              }}
              aria-label="Очистить поиск"
            >
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Главы — фильтр-пиллы в стиле filter bar /tools */}
      <div style={{
        display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center',
        marginBottom: 20,
      }}>
        <ChapterPill
          label="Все главы"
          count={codes.length}
          active={activeChapter === null}
          onClick={() => setActiveChapter(null)}
        />
        {chapters.map((ch) => {
          const count = codes.filter((c) => c.chapter === ch.id).length;
          if (count === 0) return null;
          return (
            <ChapterPill
              key={ch.id}
              label={`${ch.id} · ${ch.range}`}
              count={count}
              active={activeChapter === ch.id}
              onClick={() => setActiveChapter(activeChapter === ch.id ? null : ch.id)}
            />
          );
        })}
      </div>

      {/* Результаты */}
      <p style={{ margin: '0 0 12px', fontSize: 13, color: '#6B7280' }}>
        Найдено: <strong style={{ color: '#1A1A1A' }}>{filtered.length}</strong>
        {activeChapter ? <> · Глава {activeChapter}: {chapterById[activeChapter]?.title}</> : null}
      </p>

      {filtered.length === 0 ? (
        <div style={{
          padding: '32px 16px',
          background: '#F5F6F8',
          borderRadius: 12,
          textAlign: 'center',
          color: '#6B7280',
          fontSize: 14,
        }}>
          Ничего не найдено. Попробуйте другой запрос или сбросьте фильтр главы.
        </div>
      ) : (
        <ul style={{
          listStyle: 'none', padding: 0, margin: 0,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {filtered.map((c) => (
            <li
              key={c.code}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 18px',
                background: '#FFFFFF',
                border: '1px solid #F0F1F5',
                borderRadius: 14,
                transition: 'border-color 150ms, background 150ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#FAFAFB';
                e.currentTarget.style.borderColor = '#E5E7EB';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#FFFFFF';
                e.currentTarget.style.borderColor = '#F0F1F5';
              }}
            >
              <span style={{
                flex: '0 0 80px',
                fontFamily: 'var(--font-mono, ui-monospace)',
                fontWeight: 700,
                fontSize: 13,
                color: '#1A1A1A',
              }}>
                {c.code}
              </span>
              <span style={{ flex: 1, fontSize: 14, color: '#1A1A1A', lineHeight: 1.45 }}>
                {c.title}
              </span>
              <span style={{
                flex: '0 0 auto',
                fontFamily: 'var(--font-mono, ui-monospace)',
                fontSize: 11,
                color: '#9CA3AF',
                whiteSpace: 'nowrap',
              }}>
                {c.chapter}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Provenance + disclaimer — компактный info-блок в стиле /tools/[id]
          provenance-карточек: белый фон, 1px серая рамка, 14px радиус. */}
      <section
        aria-labelledby="icd10-provenance"
        style={{
          marginTop: 32,
          padding: '20px 22px',
          background: '#FFFFFF',
          border: '1px solid #F0F1F5',
          borderRadius: 14,
          fontSize: 13,
          color: '#4B5563',
          lineHeight: 1.55,
        }}
      >
        <h3
          id="icd10-provenance"
          style={{
            margin: '0 0 14px',
            fontFamily: 'var(--font-display)',
            fontSize: 15,
            fontWeight: 700,
            color: '#1A1A1A',
            letterSpacing: '-0.01em',
          }}
        >
          Источник и обновление
        </h3>
        <dl style={{
          margin: 0, display: 'grid',
          gridTemplateColumns: 'auto 1fr', columnGap: 18, rowGap: 10,
        }}>
          <dt style={{ color: '#9CA3AF', fontSize: 12 }}>Версия базы</dt>
          <dd style={{ margin: 0, color: '#1A1A1A', fontFamily: 'var(--font-mono, ui-monospace)', fontSize: 12 }}>
            {version}
          </dd>
          <dt style={{ color: '#9CA3AF', fontSize: 12 }}>Обновлено</dt>
          <dd style={{ margin: 0, color: '#1A1A1A', fontFamily: 'var(--font-mono, ui-monospace)', fontSize: 12 }}>
            {lastUpdated}
          </dd>
          <dt style={{ color: '#9CA3AF', fontSize: 12 }}>Источник</dt>
          <dd style={{ margin: 0, color: '#1A1A1A' }}>{source}</dd>
          <dt style={{ color: '#9CA3AF', fontSize: 12 }}>Покрытие</dt>
          <dd style={{ margin: 0, color: '#1A1A1A' }}>
            Все 22 главы + {codes.length} наиболее частых кодов. Полная база
            (~14 000 кодов) — <a href="/docs/CONTENT_ROADMAP.md" style={{ color: '#1A1A1A', textDecoration: 'underline', textUnderlineOffset: 2 }}>в дорожной карте</a>.
          </dd>
        </dl>

        <p
          role="note"
          style={{
            marginTop: 18,
            paddingTop: 16,
            borderTop: '1px solid #F0F1F5',
            fontSize: 12,
            color: '#6B7280',
            lineHeight: 1.5,
          }}
        >
          <strong style={{ color: '#1A1A1A' }}>Не заменяет клиническое суждение.</strong>{' '}
          Кодирование диагноза должно опираться на полный клинический контекст
          и официальные методические рекомендации Минздрава. Заметили ошибку
          или нужный код отсутствует — напишите через «Обратную связь».
        </p>
      </section>
    </main>
  );
}

/** Pill-фильтр главы в едином стиле с filter-bar / tag-pills из /tools.
    Активная — чёрная (#1A1A1A bg + white text), неактивная — серая
    (#F5F6F8 bg + #374151 text). Внутри — лейбл + count в monospace. */
function ChapterPill({
  label, count, active, onClick,
}: {
  label: string; count: number; active: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '7px 12px',
        background: active ? '#1A1A1A' : '#F5F6F8',
        color: active ? '#FFFFFF' : '#374151',
        border: 'none', borderRadius: 999,
        cursor: 'pointer',
        fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
        whiteSpace: 'nowrap',
        transition: 'background 180ms, color 180ms',
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = '#EFF1F4'; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = '#F5F6F8'; }}
    >
      <span>{label}</span>
      <span style={{
        fontFamily: 'var(--font-mono, ui-monospace)',
        fontSize: 10, fontWeight: 700,
        color: active ? 'rgba(255,255,255,0.65)' : '#9CA3AF',
        letterSpacing: '0.02em',
      }}>
        {count}
      </span>
    </button>
  );
}
