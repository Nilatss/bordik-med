'use client';

/**
 * Глобальный Cmd-K поиск (A4 из P0-аудита).
 *
 * Что ищет:
 *   1. Калькуляторы (732) — через готовый MiniSearch индекс /search-ru.json
 *   2. Коды МКБ-10 (стартовая база ~90) — через /icd10-data.json (server-side
 *      вытащено в build-time копию, чтобы не таскать data/icd10-starter.json)
 *   3. Разделы обучения (12) — статически
 *
 * Как работает синонимы:
 *   - lib/search/synonyms.ts разворачивает «ТЭЛА» → «pe pulmonary embolism …»
 *   - MiniSearch ищет с combineWith=OR по расширенному запросу
 *   - в результатах подсветка идёт по оригинальному вводу
 *
 * Производительность:
 *   - debounce 200 мс
 *   - индекс лениво грузится при первом открытии палитры
 *   - результаты top-8 на группу — больше не имеет смысла, всё равно надо
 *     уточнять запрос
 *
 * UX-инварианты (из аудита, T5):
 *   - открытие через Cmd-K (Mac) / Ctrl-K (Win/Linux)
 *   - ESC закрывает; ↑↓ навигация; Enter переход
 *   - время до первого результата ≤ 300 мс на типичной машине
 *
 * Доступность: role="dialog", aria-modal, focus-trap через autoFocus +
 * restoreFocus, скринридерное объявление количества результатов.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MiniSearch from 'minisearch';
import { expandQuery, normalize } from '@/lib/search/synonyms';

interface ToolHit {
  id: string;
  title: string;
  category?: string | undefined;
  subcategory?: string | undefined;
}
interface IcdHit {
  code: string;
  title: string;
}
interface SectionHit {
  id: string;
  title: string;
  description: string;
}

const SECTION_HINTS: SectionHit[] = [
  { id: 'fundamentals', title: 'Образование и подготовка',     description: 'Доуниверситетская подготовка, поступление' },
  { id: 'biomedical',   title: 'Биомедицинские основы',         description: 'Анатомия, физиология, биохимия' },
  { id: 'clinical',     title: 'Клиническое ядро',              description: 'Внутренние болезни, хирургия, педиатрия' },
  { id: 'skills',       title: 'Клинические навыки',            description: 'Опрос, осмотр, манипуляции' },
  { id: 'allied',       title: 'Смежные профессии',             description: 'Сестринское дело, фармация' },
  { id: 'threads',      title: 'Сквозные темы',                 description: 'Этика, доказательная медицина' },
  { id: 'hss',          title: 'Системы здравоохранения',       description: 'Организация, финансирование' },
  { id: 'regulatory',   title: 'Регуляторика и право',          description: 'Аккредитация, лицензирование' },
  { id: 'frontier',     title: 'Передовые направления',         description: 'Геномика, регенеративная медицина' },
  { id: 'business',     title: 'Медицинский бизнес',            description: 'Управление клиникой, MedTech-стартапы' },
  { id: 'career',       title: 'Карьера',                       description: 'Резидентура, ординатура' },
  { id: 'tech',         title: 'Технологии и будущее',          description: 'AI, телемедицина, цифровая медицина' },
];

const INDEX_FIELDS = ['title', 'description', 'category', 'subcategory'];
const SEARCH_OPTS = {
  boost: { title: 4, subcategory: 2, category: 1.5 },
  prefix: true,
  fuzzy: 0.2,
};

// Сессионный кэш индекса (один раз грузим, дальше живёт до закрытия вкладки).
let toolsIndex: MiniSearch | null = null;
let toolsIndexLoading: Promise<MiniSearch | null> | null = null;
let icdIndex: { code: string; title: string; chapter: string }[] | null = null;

async function loadToolsIndex(): Promise<MiniSearch | null> {
  if (toolsIndex) return toolsIndex;
  if (toolsIndexLoading) return toolsIndexLoading;
  toolsIndexLoading = (async () => {
    try {
      const r = await fetch('/search-ru.json', { cache: 'force-cache' });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const json = await r.text();
      toolsIndex = MiniSearch.loadJSON(json, { fields: INDEX_FIELDS, storeFields: ['id'], searchOptions: SEARCH_OPTS });
      return toolsIndex;
    } catch (err) {
      console.warn('[cmdk] tools index load failed', err);
      return null;
    } finally {
      toolsIndexLoading = null;
    }
  })();
  return toolsIndexLoading;
}

async function loadIcdIndex(): Promise<typeof icdIndex> {
  if (icdIndex) return icdIndex;
  try {
    const r = await fetch('/icd10-starter.json', { cache: 'force-cache' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    icdIndex = data.codes ?? [];
    return icdIndex;
  } catch (err) {
    console.warn('[cmdk] icd index load failed', err);
    icdIndex = [];
    return icdIndex;
  }
}

// Минимальная карта id калькулятора → краткие метаданные. Грузим только
// когда есть hits — чтобы один раз вытащить названия и категории для
// показа в палитре. catalog.meta.json уже отдаётся PWA-precache, поэтому
// fetch обычно идёт из кэша.
let catalogMeta: Map<string, { title: string; category?: string | undefined; subcategory?: string | undefined }> | null = null;
async function loadCatalogMeta(): Promise<typeof catalogMeta> {
  if (catalogMeta) return catalogMeta;
  try {
    const r = await fetch('/catalog.meta.json', { cache: 'force-cache' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const arr = (await r.json()) as Array<{ id: string; title: string; category?: string; subcategory?: string }>;
    const map = new Map<string, { title: string; category?: string | undefined; subcategory?: string | undefined }>();
    for (const t of arr) map.set(t.id, { title: t.title, category: t.category, subcategory: t.subcategory });
    catalogMeta = map;
    return catalogMeta;
  } catch (err) {
    console.warn('[cmdk] catalog meta load failed', err);
    catalogMeta = new Map();
    return catalogMeta;
  }
}

interface FlatItem {
  kind: 'tool' | 'icd' | 'section';
  href: string;
  primary: string;
  secondary?: string;
  badge?: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [tools, setTools] = useState<ToolHit[]>([]);
  const [icds, setIcds] = useState<IcdHit[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  // Hotkey: Cmd-K (Mac) / Ctrl-K (Win/Linux). И /, как в GitHub.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
      const cmdK = (isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'k';
      const slash = e.key === '/' && !(e.target as HTMLElement | null)?.matches?.('input, textarea, [contenteditable=true]');
      if (cmdK || slash) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Прелоадим индексы при первом открытии (а не при mount) — чтобы
  // 95% посетителей, никогда не нажавших Cmd-K, не платили цену.
  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    void loadToolsIndex();
    void loadIcdIndex();
    void loadCatalogMeta();
    // Фокус на input. Ставим в next tick чтобы dialog уже был в DOM.
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  // Debounce ввода. 200 мс — достаточно чтобы не дёргать индекс на каждом
  // нажатии, и быстро для ощущения «живого» поиска.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query), 200);
    return () => clearTimeout(t);
  }, [query]);

  // Сам поиск. Запускается на debouncedQ; всё in-memory.
  useEffect(() => {
    let cancelled = false;
    if (!debouncedQ.trim()) {
      setTools([]);
      setIcds([]);
      setActiveIdx(0);
      return;
    }
    void (async () => {
      const idx = await loadToolsIndex();
      const icd = await loadIcdIndex();
      const meta = await loadCatalogMeta();
      if (cancelled) return;
      const { strict, expanded } = expandQuery(debouncedQ);
      // Калькуляторы: сначала пробуем строгий AND-match по оригиналу,
      // если меньше 4 — добавляем OR-расширение по синонимам.
      const toolHits: ToolHit[] = [];
      const seenTool = new Set<string>();
      if (idx) {
        const strictHits = idx.search(strict, { ...SEARCH_OPTS, combineWith: 'AND' });
        for (const h of strictHits.slice(0, 8)) {
          const id = String(h.id);
          if (!seenTool.has(id)) {
            const m = meta?.get(id);
            toolHits.push({ id, title: m?.title ?? id, category: m?.category, subcategory: m?.subcategory });
            seenTool.add(id);
          }
        }
        if (toolHits.length < 4 && expanded !== strict) {
          const orHits = idx.search(expanded, { ...SEARCH_OPTS, combineWith: 'OR' });
          for (const h of orHits) {
            if (toolHits.length >= 8) break;
            const id = String(h.id);
            if (!seenTool.has(id)) {
              const m = meta?.get(id);
              toolHits.push({ id, title: m?.title ?? id, category: m?.category, subcategory: m?.subcategory });
              seenTool.add(id);
            }
          }
        }
      }
      // МКБ-10: тривиальный substring + prefix по коду. База маленькая, fuzzy не нужно.
      const icdHits: IcdHit[] = [];
      const q = normalize(strict);
      if (icd) {
        for (const c of icd) {
          if (icdHits.length >= 6) break;
          if (c.code.toLowerCase().startsWith(q) || normalize(c.title).includes(q)) {
            icdHits.push({ code: c.code, title: c.title });
          }
        }
      }
      setTools(toolHits);
      setIcds(icdHits);
      setActiveIdx(0);
    })();
    return () => { cancelled = true; };
  }, [debouncedQ]);

  // Разделы — статические, фильтруем тем же expand-нутым запросом.
  const sectionHits = useMemo<SectionHit[]>(() => {
    const q = normalize(debouncedQ);
    if (!q) return [];
    const { expanded } = expandQuery(debouncedQ);
    const expSet = new Set(expanded.split(' '));
    return SECTION_HINTS.filter((s) => {
      const hay = `${normalize(s.title)} ${normalize(s.description)}`;
      if (hay.includes(q)) return true;
      for (const tok of expSet) if (tok && hay.includes(tok)) return true;
      return false;
    }).slice(0, 4);
  }, [debouncedQ]);

  // Плоский список для клавиатурной навигации. Порядок ровно как
  // отрисуем: разделы → калькуляторы → МКБ.
  const flat = useMemo<FlatItem[]>(() => {
    const arr: FlatItem[] = [];
    for (const s of sectionHits) {
      arr.push({
        kind: 'section',
        href: `/?section=${s.id}`,
        primary: s.title,
        secondary: s.description,
        badge: 'Раздел',
      });
    }
    for (const t of tools) {
      arr.push({
        kind: 'tool',
        href: `/tools/${t.id}`,
        primary: t.title,
        secondary: [t.category, t.subcategory].filter(Boolean).join(' · '),
        badge: 'Калькулятор',
      });
    }
    for (const c of icds) {
      arr.push({
        kind: 'icd',
        href: `/icd10`,
        primary: `${c.code} · ${c.title}`,
        secondary: 'МКБ-10',
        badge: 'МКБ-10',
      });
    }
    return arr;
  }, [sectionHits, tools, icds]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, Math.max(flat.length - 1, 0)));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = flat[activeIdx];
        if (item) {
          window.location.href = item.href;
          setOpen(false);
          setQuery('');
        }
      }
    },
    [flat, activeIdx],
  );

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    restoreFocusRef.current?.focus?.();
  }, []);

  if (!open) return null;

  const total = flat.length;
  const empty = !!debouncedQ.trim() && total === 0 && tools.length === 0 && icds.length === 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Глобальный поиск"
      onKeyDown={onKeyDown}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(15, 17, 21, 0.45)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '12vh 16px 16px',
        animation: 'cmdk-fade 120ms ease-out',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <style jsx>{`
        @keyframes cmdk-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
      <div
        style={{
          width: '100%', maxWidth: 640,
          background: '#FFFFFF',
          borderRadius: 16,
          boxShadow: '0 24px 60px rgba(15,17,21,0.18), 0 4px 12px rgba(15,17,21,0.06)',
          overflow: 'hidden',
          fontFamily: 'var(--font-body, system-ui)',
          color: '#1A1A1A',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 18px', borderBottom: '1px solid #F0F1F5',
        }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
            stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Калькуляторы, МКБ-10, разделы... ("ТЭЛА", "Wells", "I10", "GCS")'
            aria-label="Поисковый запрос"
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontSize: 16, fontFamily: 'inherit', color: '#1A1A1A',
            }}
            autoComplete="off"
            spellCheck={false}
          />
          <kbd style={{
            padding: '2px 8px', borderRadius: 6,
            background: '#F5F6F8', border: '1px solid #E5E7EB',
            fontFamily: 'var(--font-mono, ui-monospace)', fontSize: 11,
            color: '#6B7280',
          }}>
            esc
          </kbd>
        </div>

        <div
          role="listbox"
          aria-label={`Найдено: ${total}`}
          style={{ maxHeight: '60vh', overflowY: 'auto', padding: '8px 0' }}
        >
          {!debouncedQ.trim() && (
            <Hint />
          )}

          {empty && (
            <div style={{
              padding: '32px 18px', textAlign: 'center',
              color: '#6B7280', fontSize: 14,
            }}>
              Ничего не нашли. Попробуйте код МКБ-10, аббревиатуру шкалы или диагноз.
            </div>
          )}

          {sectionHits.length > 0 && (
            <Group title="Разделы">
              {sectionHits.map((s, i) => (
                <Row
                  key={`section-${s.id}`}
                  href={`/?section=${s.id}`}
                  primary={s.title}
                  secondary={s.description}
                  badge="Раздел"
                  active={activeIdx === i}
                />
              ))}
            </Group>
          )}

          {tools.length > 0 && (
            <Group title="Калькуляторы">
              {tools.map((t, i) => (
                <Row
                  key={`tool-${t.id}`}
                  href={`/tools/${t.id}`}
                  primary={t.title}
                  secondary={[t.category, t.subcategory].filter(Boolean).join(' · ')}
                  badge="Калькулятор"
                  active={activeIdx === sectionHits.length + i}
                />
              ))}
            </Group>
          )}

          {icds.length > 0 && (
            <Group title="МКБ-10">
              {icds.map((c, i) => (
                <Row
                  key={`icd-${c.code}`}
                  href={`/icd10`}
                  primary={`${c.code} · ${c.title}`}
                  badge="МКБ-10"
                  active={activeIdx === sectionHits.length + tools.length + i}
                />
              ))}
            </Group>
          )}
        </div>

        <div style={{
          padding: '10px 18px', borderTop: '1px solid #F0F1F5',
          display: 'flex', gap: 16, fontSize: 11, color: '#9CA3AF',
          fontFamily: 'var(--font-mono, ui-monospace)', letterSpacing: '0.02em',
        }}>
          <span>↑↓ навигация</span>
          <span>↵ открыть</span>
          <span>esc закрыть</span>
        </div>
      </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '4px 0' }}>
      <div style={{
        padding: '6px 18px',
        fontFamily: 'var(--font-mono, ui-monospace)', fontSize: 10, fontWeight: 700,
        color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({
  href, primary, secondary, badge, active,
}: {
  href: string; primary: string; secondary?: string; badge?: string; active: boolean;
}) {
  return (
    <a
      href={href}
      role="option"
      aria-selected={active}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 18px',
        background: active ? '#F5F6F8' : 'transparent',
        textDecoration: 'none', color: 'inherit',
        cursor: 'pointer',
      }}
    >
      <span style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 500, color: '#1A1A1A',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {primary}
        </div>
        {secondary && (
          <div style={{
            fontSize: 12, color: '#6B7280', marginTop: 2,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {secondary}
          </div>
        )}
      </span>
      {badge && (
        <span style={{
          flexShrink: 0,
          padding: '2px 8px', borderRadius: 999,
          background: '#F5F6F8', color: '#6B7280',
          fontFamily: 'var(--font-mono, ui-monospace)', fontSize: 10, fontWeight: 600,
          letterSpacing: '0.04em',
        }}>
          {badge}
        </span>
      )}
    </a>
  );
}

function Hint() {
  const examples = [
    { q: 'ТЭЛА',         hint: '→ Wells, Geneva, PESI' },
    { q: 'I10',          hint: '→ Эссенциальная гипертензия' },
    { q: 'GCS',          hint: '→ Шкала комы Глазго' },
    { q: 'CHA2DS2-VA',   hint: '→ Риск инсульта при ФП' },
    { q: 'eGFR',         hint: '→ CKD-EPI, Cockcroft' },
    { q: 'sepsis',       hint: '→ qSOFA, NEWS2' },
  ];
  return (
    <div style={{ padding: '8px 18px 16px' }}>
      <div style={{
        fontFamily: 'var(--font-mono, ui-monospace)', fontSize: 10, fontWeight: 700,
        color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
        margin: '4px 0 10px',
      }}>
        Попробуйте
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
      }}>
        {examples.map((e) => (
          <div
            key={e.q}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px',
              background: '#F5F6F8', borderRadius: 10,
              fontSize: 12, color: '#4B5563',
            }}
          >
            <span style={{
              padding: '2px 8px', borderRadius: 6,
              background: '#FFFFFF', border: '1px solid #E5E7EB',
              fontFamily: 'var(--font-mono, ui-monospace)', fontSize: 11, fontWeight: 600,
              color: '#1A1A1A',
            }}>
              {e.q}
            </span>
            <span style={{ color: '#6B7280' }}>{e.hint}</span>
          </div>
        ))}
      </div>
      <p style={{
        marginTop: 14, fontSize: 12, color: '#9CA3AF',
        lineHeight: 1.5,
      }}>
        Поиск понимает синонимы рус/латынь/англ, аббревиатуры и нечёткое
        написание. Запускается через <KbdInline>Cmd</KbdInline> +{' '}
        <KbdInline>K</KbdInline> или <KbdInline>/</KbdInline>.
      </p>
    </div>
  );
}

function KbdInline({ children }: { children: React.ReactNode }) {
  return (
    <kbd style={{
      padding: '1px 6px', borderRadius: 4,
      background: '#FFFFFF', border: '1px solid #E5E7EB',
      fontFamily: 'var(--font-mono, ui-monospace)', fontSize: 10,
      color: '#1A1A1A',
    }}>
      {children}
    </kbd>
  );
}
