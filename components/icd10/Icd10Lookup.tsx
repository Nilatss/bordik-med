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
        maxWidth: 960,
        margin: '0 auto',
        padding: '32px 24px 80px',
        fontFamily: 'var(--font-body, system-ui)',
        color: 'var(--md-sys-color-on-surface, #1A1A1A)',
      }}
    >
      <header style={{ marginBottom: 28 }}>
        <p style={{
          margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: '#9CA3AF',
          fontFamily: 'var(--font-mono, ui-monospace)',
        }}>
          Справочник
        </p>
        <h1 style={{
          margin: '4px 0 8px',
          fontFamily: 'var(--font-display, system-ui)',
          fontSize: 28, fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em',
        }}>
          МКБ-10 lookup
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: '#6B7280', lineHeight: 1.55 }}>
          Поиск по коду или по названию диагноза. Все 22 главы МКБ-10 в
          редакции ВОЗ (русский перевод Минздрава).
        </p>
      </header>

      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder='Например: "I10", "гипертензия", "пневмония"…'
        aria-label="Поиск кода или диагноза"
        style={{
          width: '100%',
          padding: '12px 16px',
          fontSize: 15,
          fontFamily: 'inherit',
          background: '#F5F6F8',
          border: 'none',
          borderRadius: 12,
          outline: 'none',
          color: '#1A1A1A',
        }}
      />

      {/* Главы — фильтр-скроллер */}
      <div style={{
        display: 'flex', gap: 8, overflowX: 'auto', padding: '16px 0',
        margin: '0 -4px',
      }}>
        <ChapterPill
          label="Все главы"
          subtitle={`${codes.length} кодов`}
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
              subtitle={`${count}`}
              active={activeChapter === ch.id}
              onClick={() => setActiveChapter(activeChapter === ch.id ? null : ch.id)}
            />
          );
        })}
      </div>

      {/* Результаты */}
      <p style={{ margin: '8px 0 12px', fontSize: 13, color: '#6B7280' }}>
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
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          {filtered.map((c) => (
            <li
              key={c.code}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '12px 16px',
                background: '#F5F6F8',
                borderRadius: 10,
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

      {/* Provenance + disclaimer (как у /tools/[id]) */}
      <section
        aria-labelledby="icd10-provenance"
        style={{
          marginTop: 32,
          padding: '20px 22px',
          background: '#F5F6F8',
          borderRadius: 14,
          fontSize: 13,
          color: '#4B5563',
          lineHeight: 1.55,
        }}
      >
        <h2
          id="icd10-provenance"
          style={{
            margin: '0 0 12px',
            fontFamily: 'var(--font-mono, ui-monospace)',
            fontSize: 11,
            fontWeight: 700,
            color: '#6B7280',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Источник и обновление
        </h2>
        <dl style={{
          margin: 0, display: 'grid',
          gridTemplateColumns: 'auto 1fr', columnGap: 16, rowGap: 8,
        }}>
          <dt style={{ color: '#6B7280' }}>Версия базы</dt>
          <dd style={{ margin: 0, color: '#1A1A1A', fontFamily: 'var(--font-mono, ui-monospace)' }}>
            {version}
          </dd>
          <dt style={{ color: '#6B7280' }}>Обновлено</dt>
          <dd style={{ margin: 0, color: '#1A1A1A', fontFamily: 'var(--font-mono, ui-monospace)' }}>
            {lastUpdated}
          </dd>
          <dt style={{ color: '#6B7280' }}>Источник</dt>
          <dd style={{ margin: 0, color: '#1A1A1A' }}>{source}</dd>
          <dt style={{ color: '#6B7280' }}>Покрытие</dt>
          <dd style={{ margin: 0, color: '#1A1A1A' }}>
            Все 22 главы + {codes.length} наиболее частых кодов. Полная база
            (~14 000 кодов) — <a href="/docs/CONTENT_ROADMAP.md" style={{ color: '#1A1A1A' }}>в дорожной карте</a>.
          </dd>
        </dl>

        <p
          role="note"
          style={{
            marginTop: 18,
            paddingTop: 16,
            borderTop: '1px solid #E5E7EB',
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

function ChapterPill({
  label, subtitle, active, onClick,
}: {
  label: string; subtitle: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flexShrink: 0,
        padding: '8px 14px',
        background: active ? '#1A1A1A' : '#F5F6F8',
        color: active ? '#FFFFFF' : '#1A1A1A',
        border: 'none',
        borderRadius: 999,
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        transition: 'background 150ms',
      }}
    >
      <span>{label}</span>
      <span style={{
        fontFamily: 'var(--font-mono, ui-monospace)',
        fontSize: 10,
        opacity: 0.7,
      }}>
        {subtitle}
      </span>
    </button>
  );
}
