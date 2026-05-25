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
    // Do NOT cache the empty result: `icdIndex = []` is truthy, so the
    // `if (icdIndex)` guard above would return it forever, leaving ICD
    // search silently empty until a full reload. Leave the cache null so
    // the next palette open retries the fetch.
    return [];
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
      className="fixed inset-0 z-[9999] bg-[rgba(15,17,21,0.45)] backdrop-blur-[4px] [-webkit-backdrop-filter:blur(4px)] flex items-start justify-center pt-[12vh] px-4 pb-4 animate-[cmdk-fade_120ms_ease-out]"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <style jsx>{`
        @keyframes cmdk-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
      <div className="w-full max-w-[640px] bg-white rounded-[16px] shadow-[0_24px_60px_rgba(15,17,21,0.18),0_4px_12px_rgba(15,17,21,0.06)] overflow-hidden font-[var(--font-body,system-ui)] text-[#1A1A1A]">
        <div className="flex items-center gap-3 py-[14px] px-[18px] border-b border-[#F0F1F5]">
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
            className="flex-1 border-none outline-none bg-transparent text-base font-[inherit] text-[#1A1A1A]"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="py-0.5 px-2 rounded-md bg-[#F5F6F8] border border-[#E5E7EB] font-[var(--font-mono,ui-monospace)] text-[11px] text-[#6B7280]">
            esc
          </kbd>
        </div>

        <div
          role="listbox"
          aria-label={`Найдено: ${total}`}
          className="max-h-[60vh] overflow-y-auto py-2"
        >
          {!debouncedQ.trim() && (
            <Hint />
          )}

          {empty && (
            <div className="py-8 px-[18px] text-center text-[#6B7280] text-sm">
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

        <div className="py-2.5 px-[18px] border-t border-[#F0F1F5] flex gap-4 text-[11px] text-[#9CA3AF] font-[var(--font-mono,ui-monospace)] tracking-[0.02em]">
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
    <div className="py-1">
      <div className="py-1.5 px-[18px] font-[var(--font-mono,ui-monospace)] text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.08em]">
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
      className={`flex items-center gap-3 py-2.5 px-[18px] no-underline text-inherit cursor-pointer ${active ? 'bg-[#F5F6F8]' : 'bg-transparent'}`}
    >
      <span className="flex-1 min-w-0">
        <div className="text-sm font-medium text-[#1A1A1A] whitespace-nowrap overflow-hidden text-ellipsis">
          {primary}
        </div>
        {secondary && (
          <div className="text-xs text-[#6B7280] mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
            {secondary}
          </div>
        )}
      </span>
      {badge && (
        <span className="shrink-0 py-0.5 px-2 rounded-full bg-[#F5F6F8] text-[#6B7280] font-[var(--font-mono,ui-monospace)] text-[10px] font-semibold tracking-[0.04em]">
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
    <div className="pt-2 px-[18px] pb-4">
      <div className="font-[var(--font-mono,ui-monospace)] text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.08em] mt-1 mb-2.5 mx-0">
        Попробуйте
      </div>
      <div className="grid grid-cols-2 gap-2">
        {examples.map((e) => (
          <div
            key={e.q}
            className="flex items-center gap-2.5 py-2 px-2.5 bg-[#F5F6F8] rounded-[10px] text-xs text-[#4B5563]"
          >
            <span className="py-0.5 px-2 rounded-md bg-white border border-[#E5E7EB] font-[var(--font-mono,ui-monospace)] text-[11px] font-semibold text-[#1A1A1A]">
              {e.q}
            </span>
            <span className="text-[#6B7280]">{e.hint}</span>
          </div>
        ))}
      </div>
      <p className="mt-[14px] text-xs text-[#9CA3AF] leading-[1.5]">
        Поиск понимает синонимы рус/латынь/англ, аббревиатуры и нечёткое
        написание. Запускается через <KbdInline>Cmd</KbdInline> +{' '}
        <KbdInline>K</KbdInline> или <KbdInline>/</KbdInline>.
      </p>
    </div>
  );
}

function KbdInline({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="py-px px-1.5 rounded bg-white border border-[#E5E7EB] font-[var(--font-mono,ui-monospace)] text-[10px] text-[#1A1A1A]">
      {children}
    </kbd>
  );
}
