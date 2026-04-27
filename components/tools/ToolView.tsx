'use client';

import React, { useState, useMemo, useEffect, Children, isValidElement, cloneElement, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CATALOG_TOOLS } from '@/lib/tools-catalog';
import { findBand, type ToolInput, type Preset, type CalculatorResult, type ResultScaleSegment, type ToolRunner } from '@/lib/tools-runners';
import { loadRunner } from '@/lib/runners';
import { TOOL_META, primaryCountriesFor } from '@/lib/tool-meta';
import { useAppStore } from '@/lib/store';
import { useT } from '@/lib/i18n';
import { ArrowLeft } from '@/components/icons';
import EmojiOrFlag from '@/components/ui/EmojiOrFlag';

/** Slugify heading text for tab id */
function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-zа-я0-9]+/gi, '-').replace(/^-+|-+$/g, '');
}

/**
 * Split a plain-text string and turn any http(s):// URL into a clickable <a>.
 * Used for actions/caveats/details where runners often embed reference links.
 */
const URL_REGEX = /(https?:\/\/[^\s<>()"']+[^\s<>()"'.,;:!?])/g;
function linkify(text: string): ReactNode {
  if (!text || !text.includes('http')) return text;
  const parts = text.split(URL_REGEX);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#2563EB', textDecoration: 'underline', wordBreak: 'break-all' }}
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

interface Tab {
  id: string;
  title: string;
  short: string; // short label for sidebar
  iconKey: string; // for sidebar icon
  kind: 'calculator' | 'info' | 'reference';
  body?: string; // markdown for 'info' tabs
}

/** Split the info markdown into H3-based sections. Each section becomes a tab. */
function buildInfoTabs(md: string): Tab[] {
  const lines = md.split('\n');
  const tabs: Tab[] = [];
  let currentTitle = '';
  let currentLines: string[] = [];

  const push = () => {
    if (!currentTitle) return;
    tabs.push({
      id: slugify(currentTitle),
      title: currentTitle,
      short: shortenTitle(currentTitle),
      iconKey: iconKeyForTitle(currentTitle),
      kind: 'info',
      body: currentLines.join('\n').trim(),
    });
  };

  for (const line of lines) {
    const m = line.match(/^###\s+(.+?)\s*$/);
    if (m) {
      push();
      currentTitle = m[1].trim();
      currentLines = [];
    } else if (currentTitle) {
      currentLines.push(line);
    }
  }
  push();
  return tabs;
}

/** Shorten long H3 titles for sidebar pills (e.g. keep first ~24 chars at word boundary) */
function shortenTitle(title: string): string {
  if (title.length <= 28) return title;
  const cut = title.slice(0, 28);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 12 ? cut.slice(0, lastSpace) : cut) + '…';
}

/** Choose an icon key based on title text */
function iconKeyForTitle(t: string): string {
  const x = t.toLowerCase();
  if (/для чего|описани|что (с|и|о)/.test(x)) return 'info';
  if (/когда|применени|показани|время|период/.test(x)) return 'clock';
  if (/формул|расч|уравнен/.test(x)) return 'formula';
  if (/интерпрет|значени|шкал|класс|оцен|стади|групп|порог/.test(x)) return 'bar';
  if (/тактик|лечени|терапи|алгоритм|действи|ведени|препарат|лекарств|терапии/.test(x)) return 'action';
  if (/преимущ|сравнени|альтернатив|vs/.test(x)) return 'compare';
  if (/ограничени|противопоказ|предостер|ошиб|не работ/.test(x)) return 'warn';
  if (/критер|компонент|ключев|состав|параметр/.test(x)) return 'check';
  if (/возбуд|инфекц|микро|бактер|вирус|этиолог/.test(x)) return 'germ';
  if (/педиатр|дет/.test(x)) return 'child';
  if (/беремен|акушер/.test(x)) return 'preg';
  if (/мониторинг|контрол|отслеж/.test(x)) return 'pulse';
  if (/профилакт|предупрежд/.test(x)) return 'shield';
  if (/пример|расчёт|вычислен/.test(x)) return 'numbers';
  if (/свя[зз]|связанные|дополнительн|другие шкалы/.test(x)) return 'link';
  if (/ответ/.test(x)) return 'check';
  if (/кроме|эволюц/.test(x)) return 'compare';
  return 'doc';
}

export default function ToolView({ toolId }: { toolId: string }) {
  const t = useT();
  const { closeTool } = useAppStore();
  const tool = useMemo(() => CATALOG_TOOLS.find((t) => t.id === toolId), [toolId]);

  // Load the runner lazily - this triggers a per-runner dynamic import so the
  // 3+ MB encyclopaedia of clinical content stays out of the main bundle.
  const [runner, setRunner] = useState<ToolRunner | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setRunner(null);
    loadRunner(toolId)
      .then((r) => { if (!cancelled) { setRunner(r); setLoading(false); } })
      .catch(() => { if (!cancelled) { setRunner(null); setLoading(false); } });
    return () => { cancelled = true; };
  }, [toolId]);

  const tabs: Tab[] = useMemo(() => {
    if (!runner) return [];
    const tabKindLabel = runner.kind === 'score' ? t('tool.kind.score') : t('tool.kind.calculator');
    const calcTab: Tab = {
      id: 'calculator',
      title: tabKindLabel,
      short: tabKindLabel,
      iconKey: 'calc',
      kind: 'calculator',
    };
    // Filter out "Источник" heading from info tabs - we already have a dedicated referenceTab.
    const infoTabs: Tab[] = (runner.info ? buildInfoTabs(runner.info) : [])
      .filter((tb) => !/^(источник[иа]?|литература|references?)$/i.test(tb.title.trim()));
    const referenceTab: Tab = {
      id: 'reference',
      title: t('tool.tab.source'),
      short: t('tool.tab.source'),
      iconKey: 'book',
      kind: 'reference',
    };
    return [calcTab, ...infoTabs, referenceTab];
  }, [runner]);

  const [activeId, setActiveId] = useState<string>('calculator');
  const [values, setValues] = useState<Record<string, number | boolean | string>>({});

  useEffect(() => {
    if (!runner) return;
    const init: Record<string, number | boolean | string> = {};
    for (const inp of runner.inputs) {
      if (inp.type === 'checkbox') init[inp.id] = false;
      else if (inp.type === 'select' && inp.options?.[0]) init[inp.id] = inp.options[0].value;
      else if (inp.type === 'number') init[inp.id] = '' as unknown as number;
    }
    setValues(init);
  }, [runner]);

  // Reset active tab when switching tools
  useEffect(() => {
    setActiveId('calculator');
  }, [toolId]);

  // Scroll to top whenever the user switches tabs inside the tool view —
  // otherwise the new tab lands at whatever scroll offset the previous
  // one was at, hiding its header.
  useEffect(() => {
    const main = document.querySelector('main');
    if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeId]);

  // Memoise result computation - was running on every render. MUST be
  // declared before any early return below to satisfy Rules of Hooks.
  const result: CalculatorResult | null = useMemo(() => {
    if (!runner) return null;
    const ready = runner.inputs.every((inp) => {
      if (inp.type === 'number') {
        const v = values[inp.id];
        return typeof v === 'number' && !isNaN(v);
      }
      return values[inp.id] !== undefined;
    });
    if (!ready) return null;
    if (runner.kind === 'calculator') {
      try { return runner.compute(values); } catch { return null; }
    }
    let total = 0;
    for (const inp of runner.inputs) {
      if (inp.type === 'checkbox' && values[inp.id] === true && inp.points) {
        total += inp.points;
      } else if (inp.type === 'select' && inp.options) {
        const opt = inp.options.find((o) => String(o.value) === String(values[inp.id]));
        if (opt?.points) total += opt.points;
      }
    }
    const band = findBand(runner.bands, total);
    const sortedBands = [...runner.bands].sort((a, b) => a.min - b.min);
    return {
      value: String(total),
      unit: `из ${runner.maxScore}`,
      interpretation: `${band.label} · ${band.description}`,
      color: band.color,
      scale: {
        segments: sortedBands.map((b) => ({
          min: b.min,
          max: b.max,
          label: b.label,
          color: b.color,
        })),
        current: total,
        unit: `из ${runner.maxScore}`,
      },
      details: band.details,
      actions: band.actions,
      caveats: runner.caveats,
      related: runner.related,
      relatedCourses: runner.relatedCourses,
    };
  }, [runner, values]);

  if (!tool) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>
        {t('tool.notFound')}
        <div style={{ marginTop: 16 }}>
          <BackButton onClick={closeTool} />
        </div>
      </div>
    );
  }

  if (!runner) {
    // Either still fetching the per-runner chunk or the id has no runner yet.
    // Plain div (no motion): the loading state is short-lived and followed
    // by the real runner's motion.div — animating twice caused a double
    // fade flash on first tool open. The main view's animation is enough.
    return (
      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 760 }}>
        <BackButton onClick={closeTool} />
        <Header tool={tool} />
        <div style={{
          marginTop: 24, padding: '40px 24px',
          background: '#F5F6F8', borderRadius: 20, textAlign: 'center',
        }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#6B7280' }}>
            {loading ? t('tool.loading') : t('tool.runnerSoon')}
          </p>
        </div>
      </div>
    );
  }

  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];
  const activeIndex = tabs.indexOf(active);
  const prevTab = tabs[activeIndex - 1];
  const nextTab = tabs[activeIndex + 1];

  const kindLabel = runner.kind === 'score' ? t('tool.kind.score') : t('tool.kind.calculator');

  return (
    // Page-enter transition cloned from CourseHeader — opacity+translateY fade
    // with the same easing curve, so a tool opening feels identical to a course
    // opening. Only the outer wrapper animates; inner sections stay static.
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.05, 0.7, 0.1, 1] }}
    >
      {/* Top header - back + tags + title + description + InfoPills (full width, outside grid) */}
      <BackButton onClick={closeTool} />
      <Header tool={tool} kind={kindLabel} />
      <div className="info-pill-row" style={{ marginTop: 16, marginBottom: 20 }}>
        <InfoPill icon={<IconBolt />} label={t('tool.field.type')} value={kindLabel} />
        <InfoPill icon={<IconTag />} label={t('tool.field.section')} value={tool.subcategory} />
        <InfoPill icon={<IconBook />} label={t('tool.field.source')} value={shortRef(runner.reference)} />
        <InfoPill icon={<IconGlobe />} label={t('tool.field.countries')} value={runner.countries ?? t('tool.country.international')} />
      </div>

      {/* Main grid: content card (left) + TOC sidebar (right) - identical to TabbedLessonViewer */}
      <div className="rg-main-toc">
        {/* LEFT: tab content card - IDENTICAL to TabbedLessonViewer */}
        <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={active.id}
          className="lesson-card"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: [0.05, 0.7, 0.1, 1] }}
          style={{
          background: '#FFFFFF',
          borderRadius: 'var(--md-sys-shape-corner-extra-large)',
          padding: 'var(--space-6)',
          minHeight: 300,
        }}>
          {/* Tab header - identical structure to TabbedLessonViewer */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            marginBottom: 16, paddingBottom: 16,
            borderBottom: '1px solid #F0F0F0',
          }}>
            <span style={{ display: 'flex', color: '#1A1A1A' }}>
              <TabIcon name={active.iconKey} size={24} />
            </span>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
              color: '#1A1A1A', lineHeight: 1.2, letterSpacing: '-0.01em',
              margin: 0,
            }}>
              {active.title}
            </h2>
          </div>

          {/* Tab body */}
          {active.kind === 'calculator' && (
            <CalculatorBody
              inputs={runner.inputs}
              values={values}
              setValues={setValues}
              result={result}
              presets={runner.presets}
            />
          )}

          {active.kind === 'info' && active.body && (
            <div className="lesson-content tool-info">
              <MemoisedMarkdown body={active.body} />
            </div>
          )}

          {active.kind === 'reference' && (
            <div className="lesson-content tool-info">
              <p style={{ marginBottom: 12 }}>
                <strong>{t('tool.referenceTitle')}</strong>
              </p>
              <p>{cleanReference(runner.reference)}</p>
              <p style={{ marginTop: 20, color: '#6B7280', fontSize: 13 }}>
                {t('tool.referenceFooter')}
              </p>
            </div>
          )}

          {/* Prev / Next - identical to TabbedLessonViewer */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', gap: 12,
            marginTop: 32, paddingTop: 20,
            borderTop: '1px solid #F0F0F0',
          }}>
            {prevTab ? (
              <NavButton onClick={() => setActiveId(prevTab.id)} label={prevTab.short} dir="prev" />
            ) : <span />}
            {nextTab ? (
              <NavButton onClick={() => setActiveId(nextTab.id)} label={nextTab.short} dir="next" primary />
            ) : null}
          </div>
        </motion.div>
        </AnimatePresence>

        {/* RIGHT: sidebar - "Содержание" - IDENTICAL to TabbedLessonViewer aside */}
        <aside className="toc-sidebar" style={{
          position: 'sticky', top: 20,
          background: '#F5F6F8',
          borderRadius: 'var(--md-sys-shape-corner-extra-large)',
          padding: 16,
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 11,
            fontWeight: 600, color: '#888',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            padding: '4px 12px 10px',
            margin: 0,
          }}>
            {t('course.toc.title')}
          </p>
          {tabs.map((tab) => {
            const isActive = tab.id === active.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveId(tab.id)}
                className={`toc-tab${isActive ? ' is-active' : ''}`}
                style={{
                  position: 'relative',
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px',
                  color: isActive ? '#1A1A1A' : '#333',
                  border: 'none', borderRadius: 10,
                  cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'var(--font-body)', fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  transition: 'color 200ms ease',
                }}
              >
                {isActive && (
                  <motion.span
                    layoutId="tool-toc-active-pill"
                    style={{
                      position: 'absolute', inset: 0,
                      background: '#FFFFFF',
                      borderRadius: 10,
                      boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.04)',
                      zIndex: 0,
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span style={{
                  position: 'relative', zIndex: 1,
                  display: 'flex', flexShrink: 0,
                  color: isActive ? '#1A1A1A' : '#6B7280',
                  transition: 'color 200ms ease',
                }}>
                  <TabIcon name={tab.iconKey} size={16} />
                </span>
                <span style={{
                  position: 'relative', zIndex: 1,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  minWidth: 0, flex: 1,
                }}>
                  {tab.short}
                </span>
              </button>
            );
          })}
        </aside>
      </div>
    </motion.div>
  );
}

/* ════════════════ Markdown helpers: ♂/♀ badges + formula cards ════════════════ */

/**
 * Walk React children recursively. When a string contains ♂/♀, split and wrap
 * those symbols in coloured badge spans.
 */
function withSexBadges(children: React.ReactNode): React.ReactNode {
  if (children == null) return children;
  if (typeof children === 'string') {
    if (!/[♂♀]/.test(children)) return children;
    const parts: React.ReactNode[] = [];
    let buffer = '';
    let keyCounter = 0;
    for (const ch of children) {
      if (ch === '♂' || ch === '♀') {
        if (buffer) { parts.push(buffer); buffer = ''; }
        parts.push(
          <span
            key={`sx-${keyCounter++}`}
            className={ch === '♂' ? 'sex-badge sex-m' : 'sex-badge sex-f'}
            aria-label={ch === '♂' ? 'мужчины' : 'женщины'}
          >{ch}</span>
        );
      } else {
        buffer += ch;
      }
    }
    if (buffer) parts.push(buffer);
    return parts.length === 1 ? parts[0] : <>{parts}</>;
  }
  if (Array.isArray(children)) {
    return children.map((c, i) => {
      const wrapped = withSexBadges(c);
      if (wrapped == null || typeof wrapped === 'string' || typeof wrapped === 'number') {
        return <React.Fragment key={i}>{wrapped}</React.Fragment>;
      }
      return <React.Fragment key={i}>{wrapped}</React.Fragment>;
    });
  }
  return children;
}

/**
 * Callout helpers - keep the visual language identical to course pages.
 * Source paragraphs that begin with ℹ, ⚠, ✓, 💡, 🎯, 📷 are transformed into
 * blockquotes and then rendered with the same .callout-* classes used in
 * lesson-content.
 */
const CALLOUT_EMOJI_RE = /^(ℹ|⚠️|⚠|📷|✓|✅|🎯|💡)\s*/;

/** Convert paragraphs that start with a callout emoji into blockquotes. */
/**
 * Memoised markdown renderer for info tabs. `preprocessToolContent` does
 * string manipulation (ten regex passes); without memoisation it ran on
 * every ToolView render, including calculator input changes.
 */
const MemoisedMarkdown = React.memo(function MemoisedMarkdown({ body }: { body: string }) {
  const processed = useMemo(() => preprocessToolContent(body), [body]);
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
      {processed}
    </ReactMarkdown>
  );
});

function preprocessToolContent(md: string): string {
  if (!md) return md;
  const lines = md.split('\n');
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const m = line.match(/^([ℹ⚠✓✅🎯💡📷]|⚠️)\s*(.*)$/);
    // Only convert if this paragraph isn't already a blockquote / list / heading
    if (m && !line.startsWith('>') && !line.startsWith('#') && !line.startsWith('-')) {
      // Gather the paragraph (consecutive non-empty lines)
      const paraLines = [m[0]];
      i++;
      while (i < lines.length && lines[i].trim() !== '' && !lines[i].startsWith('#')
             && !lines[i].startsWith('|') && !lines[i].match(/^[ℹ⚠✓✅🎯💡📷]/) ) {
        paraLines.push(lines[i]);
        i++;
      }
      for (const p of paraLines) out.push('> ' + p);
      out.push(''); // blank line after blockquote
      continue;
    }
    out.push(line);
    i++;
  }
  return out.join('\n');
}

/** Strip leading emoji/marker from the first text node of a children tree. */
function stripLeadingEmoji(children: ReactNode): ReactNode {
  const arr = Children.toArray(children);
  for (let idx = 0; idx < arr.length; idx++) {
    const el = arr[idx];
    if (typeof el === 'string') {
      const stripped = el.replace(CALLOUT_EMOJI_RE, '');
      if (stripped !== el) { arr[idx] = stripped; return arr; }
      if (el.trim() === '') continue;
      return arr;
    }
    if (isValidElement(el)) {
      const props = (el as { props: { children: ReactNode } }).props;
      const newChildren = stripLeadingEmoji(props.children);
      if (newChildren !== props.children) {
        arr[idx] = cloneElement(el as React.ReactElement<{ children?: ReactNode }>, {}, newChildren);
        return arr;
      }
      return arr;
    }
  }
  return arr;
}

function extractTextFromChildren(node: ReactNode): string {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(extractTextFromChildren).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    return extractTextFromChildren((node as { props: { children: ReactNode } }).props.children);
  }
  return '';
}

/**
 * ReactMarkdown component overrides. Post-processing: wrap ♂/♀ in coloured
 * badges; convert emoji-prefixed blockquotes into styled callouts matching
 * the course layout. All visual styling lives in globals.css (.callout-*).
 */
const mdComponents = {
  p: ({ children }: { children?: React.ReactNode }) => <p>{withSexBadges(children)}</p>,
  li: ({ children }: { children?: React.ReactNode }) => <li>{withSexBadges(children)}</li>,
  td: ({ children }: { children?: React.ReactNode }) => <td>{withSexBadges(children)}</td>,
  th: ({ children }: { children?: React.ReactNode }) => <th>{withSexBadges(children)}</th>,
  strong: ({ children }: { children?: React.ReactNode }) => <strong>{withSexBadges(children)}</strong>,
  em: ({ children }: { children?: React.ReactNode }) => <em>{withSexBadges(children)}</em>,
  blockquote: ({ children }: { children?: React.ReactNode }) => {
    const text = extractTextFromChildren(children).trim();
    let className = 'callout';
    let icon = '', label = '';
    if (text.startsWith('ℹ')) { className += ' callout-info'; icon = 'ℹ'; label = 'Информация'; }
    else if (text.startsWith('⚠')) { className += ' callout-warning'; icon = '⚠'; label = 'Важно'; }
    else if (text.startsWith('✓') || text.startsWith('✅')) { className += ' callout-success'; icon = '✓'; label = 'Главное'; }
    else if (text.startsWith('🎯')) { className += ' callout-goal'; icon = '🎯'; label = 'Цель'; }
    else if (text.startsWith('💡')) { className += ' callout-tip'; icon = '💡'; label = 'Совет'; }
    return (
      <blockquote className={className}>
        {icon && (<div className="callout-label"><span>{label}</span></div>)}
        <div className="callout-body">{stripLeadingEmoji(children)}</div>
      </blockquote>
    );
  },
};

/* ════════════════ Calculator body ════════════════ */

function CalculatorBody({ inputs, values, setValues, result }: {
  inputs: ToolInput[];
  values: Record<string, number | boolean | string>;
  setValues: React.Dispatch<React.SetStateAction<Record<string, number | boolean | string>>>;
  result: CalculatorResult | null;
  presets?: Preset[]; // kept in signature for back-compat (unused)
}) {
  // Group checkboxes visually at the bottom — otherwise a single checkbox
  // sandwiched between number/select inputs blends in and is easy to miss.
  // Stable: we DO NOT reshuffle when all inputs are checkboxes or when
  // there are none (leave as-is).
  const { nonCheckboxes, checkboxes } = useMemo(() => {
    const nc: ToolInput[] = [];
    const cb: ToolInput[] = [];
    for (const inp of inputs) {
      if (inp.type === 'checkbox') cb.push(inp);
      else nc.push(inp);
    }
    return { nonCheckboxes: nc, checkboxes: cb };
  }, [inputs]);

  const renderInput = (inp: ToolInput) => (
    <InputField
      key={inp.id}
      input={inp}
      value={values[inp.id]}
      onChange={(v) => setValues((prev) => ({ ...prev, [inp.id]: v }))}
    />
  );

  return (
    <div>
      {/* Rhythm rules:
          – Between inputs of the same type (number↔number, select↔select,
            checkbox↔checkbox)                                             6 px
          – Between sections (non-checkbox group ↔ separator ↔ checkbox)   24 px
          – Internal offsets inside a single number block (label/field/
            chips)                                                         8 px
          Groups each have their own flex column; the outer layout stitches
          them with 24 px. */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {nonCheckboxes.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {nonCheckboxes.map(renderInput)}
          </div>
        )}
        {checkboxes.length > 0 && nonCheckboxes.length > 0 && (
          <div style={{ borderTop: '1px dashed #E2E4EA' }} />
        )}
        {checkboxes.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {checkboxes.map(renderInput)}
          </div>
        )}
      </div>

      {result && <ResultCard result={result} />}
    </div>
  );
}

/* ════════════════ Rich result card ════════════════ */

function ResultCard({ result }: { result: CalculatorResult }) {
  const t = useT();
  const {
    value, unit, interpretation, color,
    details, actions, differential, caveats, scale, related, relatedCourses,
  } = result;
  const openTool = useAppStore((s) => s.openTool);
  const openCourse = useAppStore((s) => s.openCourse);
  const setShowLearning = useAppStore((s) => s.setShowLearning);
  // Clicking a related course must also leave the tools view, otherwise
  // the store sets currentCourseId but the page stays on the tool tree
  // because showTools/activeToolId still take priority.
  const openRelatedCourse = (id: string) => {
    setShowLearning(true);
    openCourse(id);
  };

  return (
    <div style={{
      marginTop: 24,
      padding: '20px 24px',
      borderRadius: 16,
      background: `${color}0F`,
      borderLeft: `4px solid ${color}`,
    }}>
      {/* Headline */}
      <p style={{
        fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
        color, textTransform: 'uppercase', letterSpacing: '0.1em',
        margin: 0, marginBottom: 10,
      }}>
        Результат
      </p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 800,
          color, letterSpacing: '-0.02em', lineHeight: 1,
        }}>
          {value}
        </span>
        {unit && (
          <span style={{
            fontFamily: 'var(--font-body)', fontSize: 16, color: '#6B7280',
            fontWeight: 500,
          }}>
            {unit}
          </span>
        )}
      </div>
      <p style={{
        marginTop: 14,
        fontFamily: 'var(--font-body)', fontSize: 14, color: '#1A1A1A',
        lineHeight: 1.6, fontWeight: 500, margin: 0,
      }}>
        {linkify(interpretation)}
      </p>

      {/* Visual band scale */}
      {scale && scale.segments.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <ResultScale segments={scale.segments} current={scale.current} unit={scale.unit ?? unit} />
        </div>
      )}

      {/* Longer clinical narrative */}
      {details && (
        <ResultSection title={t('tool.section.interpretation')} icon="info">
          <p style={{ margin: 0, color: '#374151', fontSize: 13.5, lineHeight: 1.55 }}>
            {linkify(details)}
          </p>
        </ResultSection>
      )}

      {/* Recommended next actions */}
      {actions && actions.length > 0 && (
        <ResultSection title={t('tool.section.actions')} icon="arrow">
          <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {actions.map((a, i) => (
              <li key={i} style={{
                display: 'flex', gap: 8, alignItems: 'flex-start',
                color: '#374151', fontSize: 13.5, lineHeight: 1.5,
              }}>
                <span style={{
                  flexShrink: 0, marginTop: 7,
                  width: 5, height: 5, borderRadius: '50%',
                  background: color,
                }} />
                <span>{linkify(a)}</span>
              </li>
            ))}
          </ul>
        </ResultSection>
      )}

      {/* Differential / mnemonic breakdown (MUDPILES etc.) */}
      {differential && differential.length > 0 && (
        <ResultSection title={t('tool.section.differential')} icon="list">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {differential.map((d, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '20px 1fr', gap: 10,
                padding: '4px 0',
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
                  color, lineHeight: 1.5,
                }}>
                  {d.term}
                </span>
                <span style={{ color: '#374151', fontSize: 13.5, lineHeight: 1.5 }}>
                  {d.desc}
                </span>
              </div>
            ))}
          </div>
        </ResultSection>
      )}

      {/* Caveats / pitfalls */}
      {caveats && caveats.length > 0 && (
        <ResultSection title={t('tool.section.caveats')} icon="warn">
          <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {caveats.map((c, i) => (
              <li key={i} style={{
                display: 'flex', gap: 8, alignItems: 'flex-start',
                color: '#374151', fontSize: 13.5, lineHeight: 1.5,
              }}>
                <span style={{
                  flexShrink: 0, marginTop: 5, color: '#F59E0B', fontSize: 12, fontWeight: 700,
                }}>⚠</span>
                <span>{linkify(c)}</span>
              </li>
            ))}
          </ul>
        </ResultSection>
      )}

      {/* Related tools */}
      {related && related.length > 0 && (
        <ResultSection title={t('tool.section.related')} icon="link">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {related.map((r) => (
              <button
                key={r.id}
                onClick={() => openTool(r.id)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '5px 12px',
                  background: '#FFFFFF', color: '#1A1A1A',
                  border: '1px solid #E5E7EB', borderRadius: 999,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500,
                  transition: 'background 150ms, border-color 150ms',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F5F6F8';
                  e.currentTarget.style.borderColor = '#D1D5DB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                }}
              >
                {r.title}
                <svg width={11} height={11} viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <line x1={5} y1={12} x2={19} y2={12} />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            ))}
          </div>
        </ResultSection>
      )}

      {/* Related courses - only rendered when the tool-runner author
          explicitly listed course ids. Never auto-generated, so we never
          send the user to a lesson that doesn't actually cover this tool. */}
      {relatedCourses && relatedCourses.length > 0 && (
        <ResultSection title={t('tool.section.relatedCourses')} icon="book">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {relatedCourses.slice(0, 3).map((c) => (
              <button
                key={c.id}
                onClick={() => openRelatedCourse(c.id)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '5px 12px',
                  background: '#FFFFFF', color: '#1A1A1A',
                  border: '1px solid #E5E7EB', borderRadius: 999,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500,
                  transition: 'background 150ms, border-color 150ms',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F5F6F8';
                  e.currentTarget.style.borderColor = '#D1D5DB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                }}
              >
                {c.title}
                <svg width={11} height={11} viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <line x1={5} y1={12} x2={19} y2={12} />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            ))}
          </div>
        </ResultSection>
      )}
    </div>
  );
}

function ResultSection({ title, icon, children }: {
  title: string;
  icon: 'info' | 'arrow' | 'list' | 'warn' | 'link' | 'book';
  children: React.ReactNode;
}) {
  const iconEl = {
    info: <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx={12} cy={12} r={10} /><line x1={12} y1={16} x2={12} y2={12} /><line x1={12} y1={8} x2={12.01} y2={8} /></svg>,
    arrow: <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>,
    list: <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1={8} y1={6} x2={21} y2={6} /><line x1={8} y1={12} x2={21} y2={12} /><line x1={8} y1={18} x2={21} y2={18} /><line x1={3} y1={6} x2={3.01} y2={6} /><line x1={3} y1={12} x2={3.01} y2={12} /><line x1={3} y1={18} x2={3.01} y2={18} /></svg>,
    warn: <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1={12} y1={9} x2={12} y2={13} /><line x1={12} y1={17} x2={12.01} y2={17} /></svg>,
    link: <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>,
    book: <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>,
  }[icon];

  return (
    <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 7,
        marginBottom: 10,
        color: '#6B7280',
      }}>
        {iconEl}
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

/**
 * Horizontal band scale with a marker for the current value.
 *
 * Segments may be continuous (e.g. BMI 18.5-25) or discrete integer bands
 * (e.g. CHADS-VASc [0,0], [1,1], [2,9]). The algorithm auto-detects by
 * checking that every finite min/max is an integer. In the discrete case
 * each integer counts as one "slot" so single-point bands like [0,0] get
 * visible width and the segments sum to 100 % of the bar - no gaps. For
 * continuous scales segment width is simply (max − min).
 */
function ResultScale({ segments, current, unit }: {
  segments: ResultScaleSegment[];
  current: number;
  unit?: string;
}) {
  if (!segments.length) return null;

  /*
   * Two distinct input conventions come in from runners:
   *
   *   (a) Non-overlapping discrete bands, e.g. CHA₂DS₂-VASc
   *         {0,0}, {1,1}, {2,9}             → each integer inclusive on both ends
   *
   *   (b) Touching continuous cutoffs, e.g. MELD or BMI
   *         {6,10}, {10,20}, {20,30}, …     → max of one == min of next
   *
   * Both are valid clinical notations. Internally we normalise to (a)'s
   * semantics: each segment covers [min, max] inclusive. When consecutive
   * segments touch at an integer boundary we decrement the earlier max by
   * 1 so they don't double-count that integer.
   */
  const touchesIntegerNeighbour = (i: number) => {
    if (i + 1 >= segments.length) return false;
    const cur = segments[i];
    const nxt = segments[i + 1];
    if (!Number.isFinite(cur.max)) return false;
    if (cur.max !== nxt.min) return false;
    return Number.isInteger(cur.max) && Number.isInteger(nxt.min);
  };
  const normalised = segments.map((s, i) => ({
    ...s,
    max: touchesIntegerNeighbour(i) ? (s.max as number) - 1 : s.max,
  }));

  // Is every normalised segment's bound an integer? Governs the +1 rule.
  const allInt = normalised.every((s) =>
    Number.isInteger(s.min) && (!Number.isFinite(s.max) || Number.isInteger(s.max))
  );

  const finiteMax = normalised.reduce((acc, s) => {
    if (Number.isFinite(s.max)) return Math.max(acc, s.max);
    return acc;
  }, -Infinity);
  const finiteMin = normalised[0].min;
  const spanMax = Number.isFinite(finiteMax) ? finiteMax : finiteMin + 10;

  // Width helper. Integer bands get (max − min + 1); continuous bands get
  // (max − min). Open-ended upper bounds clip to the effective max.
  const segWidth = (s: ResultScaleSegment) => {
    const hi = Number.isFinite(s.max) ? s.max : spanMax;
    const raw = Math.max(hi - s.min, 0);
    return allInt ? raw + 1 : raw;
  };
  const total = normalised.reduce((sum, s) => sum + segWidth(s), 0) || 1;

  // Marker: discrete scales centre the mark inside the integer cell.
  const markerOffset = allInt ? (current - finiteMin + 0.5) : (current - finiteMin);
  const markerPct = Math.max(0, Math.min(100, (markerOffset / total) * 100));

  // Marker is a clinical value - must align with its band regardless of
  // marker width; compute using translateX instead of a fixed pixel offset.
  return (
    <div>
      <div style={{
        position: 'relative', height: 10, borderRadius: 999,
        overflow: 'hidden', display: 'flex',
        background: '#EEF0F4',
      }}>
        {normalised.map((s, i) => {
          const w = (segWidth(s) / total) * 100;
          return (
            <div key={i} title={`${s.label} (${s.min}${Number.isFinite(s.max) ? (s.min === s.max ? '' : '-' + s.max) : '+'})`}
              style={{ flex: `0 0 ${w}%`, background: s.color, opacity: 0.65 }} />
          );
        })}
        {/* Marker - 4px wide, centred at markerPct via translateX. */}
        <div style={{
          position: 'absolute', top: -3, bottom: -3,
          left: `${markerPct}%`,
          width: 4, borderRadius: 2,
          transform: 'translateX(-50%)',
          background: '#1A1A1A',
          boxShadow: '0 0 0 2px #FFFFFF',
        }} />
      </div>
      {/*
        Label row. The current-value label is absolutely positioned so it
        sits directly below the marker. Min/max sit at the ends. When the
        marker is close to an edge (≤ 12 % or ≥ 88 %) we suppress the near
        edge label so the current-value text doesn't collide with it.
      */}
      <div style={{
        position: 'relative',
        marginTop: 6,
        height: 14,
        fontFamily: 'var(--font-mono)', fontSize: 10.5, color: '#9CA3AF',
      }}>
        {markerPct > 12 && (
          <span style={{ position: 'absolute', left: 0, top: 0 }}>
            {finiteMin}{unit ? ' ' + unit : ''}
          </span>
        )}
        <span style={{
          position: 'absolute',
          left: `${markerPct}%`,
          top: 0,
          transform: 'translateX(-50%)',
          color: '#374151', fontWeight: 700,
          whiteSpace: 'nowrap',
        }}>
          {current}{unit ? ' ' + unit : ''}
        </span>
        {markerPct < 88 && (
          <span style={{ position: 'absolute', right: 0, top: 0 }}>
            {Number.isFinite(finiteMax) ? finiteMax : `${spanMax}+`}{unit ? ' ' + unit : ''}
          </span>
        )}
      </div>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 10,
        marginTop: 10,
      }}>
        {segments.map((s, i) => (
          <div key={i} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 11.5, color: '#6B7280',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════ Navigation button (Prev/Next) ════════════════ */

function NavButton({ onClick, label, dir, primary }: {
  onClick: () => void; label: string; dir: 'prev' | 'next'; primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '10px 16px',
        background: primary ? '#3B82F6' : '#F5F6F8',
        color: primary ? '#FFFFFF' : '#1A1A1A',
        border: 'none', borderRadius: 10,
        cursor: 'pointer',
        fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: primary ? 600 : 500,
        transition: 'background 180ms',
        maxWidth: '50%',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = primary ? '#2563EB' : '#EFF1F4';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = primary ? '#3B82F6' : '#F5F6F8';
      }}
    >
      {dir === 'prev' ? '← ' : ''}{label}{dir === 'next' ? ' →' : ''}
    </button>
  );
}

/* ════════════════ Tab icons ════════════════ */

function TabIcon({ name, size = 16 }: { name: string; size?: number }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const s = size;
  switch (name) {
    case 'calc':
      return (<svg width={s} height={s} viewBox="0 0 24 24" {...p}><rect x={4} y={2} width={16} height={20} rx={2}/><line x1={8} y1={6} x2={16} y2={6}/><circle cx={8} cy={10.5} r={0.5}/><circle cx={12} cy={10.5} r={0.5}/><circle cx={16} cy={10.5} r={0.5}/><circle cx={8} cy={14.5} r={0.5}/><circle cx={12} cy={14.5} r={0.5}/><circle cx={16} cy={14.5} r={0.5}/><circle cx={8} cy={18.5} r={0.5}/><circle cx={12} cy={18.5} r={0.5}/><circle cx={16} cy={18.5} r={0.5}/></svg>);
    case 'info':
      return (<svg width={s} height={s} viewBox="0 0 24 24" {...p}><circle cx={12} cy={12} r={10}/><line x1={12} y1={16} x2={12} y2={12}/><line x1={12} y1={8} x2={12.01} y2={8}/></svg>);
    case 'clock':
      return (<svg width={s} height={s} viewBox="0 0 24 24" {...p}><circle cx={12} cy={12} r={10}/><polyline points="12,6 12,12 16,14"/></svg>);
    case 'formula':
      return (<svg width={s} height={s} viewBox="0 0 24 24" {...p}><path d="M4 20h4l6-16h4"/><line x1={4} y1={12} x2={12} y2={12}/></svg>);
    case 'bar':
      return (<svg width={s} height={s} viewBox="0 0 24 24" {...p}><line x1={6} y1={20} x2={6} y2={14}/><line x1={12} y1={20} x2={12} y2={8}/><line x1={18} y1={20} x2={18} y2={4}/></svg>);
    case 'action':
      return (<svg width={s} height={s} viewBox="0 0 24 24" {...p}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>);
    case 'compare':
      return (<svg width={s} height={s} viewBox="0 0 24 24" {...p}><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>);
    case 'warn':
      return (<svg width={s} height={s} viewBox="0 0 24 24" {...p}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1={12} y1={9} x2={12} y2={13}/><line x1={12} y1={17} x2={12.01} y2={17}/></svg>);
    case 'check':
      return (<svg width={s} height={s} viewBox="0 0 24 24" {...p}><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>);
    case 'germ':
      return (<svg width={s} height={s} viewBox="0 0 24 24" {...p}><circle cx={12} cy={12} r={5}/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2 2M16.4 16.4l2 2M5.6 18.4l2-2M16.4 7.6l2-2"/></svg>);
    case 'child':
      return (<svg width={s} height={s} viewBox="0 0 24 24" {...p}><circle cx={12} cy={8} r={4}/><path d="M6 22v-3c0-2 2-4 6-4s6 2 6 4v3"/></svg>);
    case 'preg':
      return (<svg width={s} height={s} viewBox="0 0 24 24" {...p}><circle cx={12} cy={7} r={3}/><path d="M9 22c0-5 1-8 3-8s3 3 3 8"/></svg>);
    case 'pulse':
      return (<svg width={s} height={s} viewBox="0 0 24 24" {...p}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>);
    case 'shield':
      return (<svg width={s} height={s} viewBox="0 0 24 24" {...p}><path d="M12 2l9 4v6c0 5.5-4 10-9 10S3 17.5 3 12V6z"/></svg>);
    case 'numbers':
      return (<svg width={s} height={s} viewBox="0 0 24 24" {...p}><line x1={10} y1={4} x2={8} y2={20}/><line x1={16} y1={4} x2={14} y2={20}/><line x1={4} y1={9} x2={20} y2={9}/><line x1={4} y1={15} x2={20} y2={15}/></svg>);
    case 'link':
      return (<svg width={s} height={s} viewBox="0 0 24 24" {...p}><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>);
    case 'book':
      return (<svg width={s} height={s} viewBox="0 0 24 24" {...p}><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>);
    case 'doc':
    default:
      return (<svg width={s} height={s} viewBox="0 0 24 24" {...p}><rect x={4} y={3} width={16} height={18} rx={2}/><line x1={8} y1={9} x2={16} y2={9}/><line x1={8} y1={13} x2={16} y2={13}/><line x1={8} y1={17} x2={12} y2={17}/></svg>);
  }
}

/* ════════════════ Header ════════════════ */

/**
 * Full citation cleanup for the Источник tab body.
 * Keeps author + journal + year, strips formulas/doses/threshold values.
 * Year (4-digit) is preserved.
 */
function cleanReference(ref: string): string {
  if (!ref) return '';
  // Remove obvious formulas like "= ... expr ..." / ": value threshold stuff"
  // but keep if the segment contains a 4-digit year.
  const segments = ref.split(/\.\s+/).map((s) => s.trim()).filter(Boolean);
  const keep: string[] = [];
  for (const seg of segments) {
    // Drop segments that are pure thresholds/formulas (no year, contain math/drug dosing)
    const hasYear = /\b(19|20)\d{2}\b/.test(seg);
    const isFormulaOrDose = /[×÷∑√=<>≤≥±]|\bмг\b|\bмл\b|\bкг\b|\bч\b|мг\/|мл\/|кг\/|мм рт/.test(seg);
    if (isFormulaOrDose && !hasYear) continue;
    // Inside a kept segment, still trim after formula markers
    let clean = seg.replace(/[:=][^.]*?([×÷=<>≤≥][^.]*)/, '').replace(/\s{2,}/g, ' ').trim();
    if (clean) keep.push(clean);
  }
  return keep.join('. ') + (keep.length ? '.' : '');
}

/**
 * Extract just the citation (author + optional year + journal) from the reference string.
 * Strip formulas, thresholds, drug doses and everything that isn't bibliographic.
 *
 * Examples:
 *  "Antman EM. JAMA 2000. TIMI Risk Score for UA/NSTEMI." → "Antman EM. JAMA 2000"
 *  "ВОЗ: <18.5 / 18.5-24.9 / 25-29.9 / ≥30. Азия: 23 и 27.5." → "ВОЗ"
 *  "Parkland (Baxter): 4 мл × %TBSA × кг Ringer за 24 ч..." → "Parkland (Baxter)"
 */
function shortRef(ref: string): string {
  if (!ref) return '';
  // Split by sentence; the citation is usually the first sentence.
  // Keep only first sentence, then strip content after any of: colon, equals, formula chars.
  let s = ref.split(/\.\s/)[0];

  // Remove anything after formula/value markers
  s = s.replace(/[:=].*$/, '')           // "ВОЗ: <18.5 / 18.5..." → "ВОЗ"
       .replace(/\s-\s.*$/, '')          // "Wells 2001 - алгоритм..." → "Wells 2001"
       .replace(/\s-\s.*$/, '');         // same with hyphen

  // If still contains formula characters, keep only up to first one
  const formulaMatch = s.match(/^(.+?)[×÷∑√=<>≤≥±][^.]*$/);
  if (formulaMatch) s = formulaMatch[1].trim();

  // Drop trailing punctuation and collapse whitespace
  s = s.replace(/[,;:\s]+$/, '').trim();

  // If looks like just a list of abbreviations without author, keep as-is but max 50 chars
  if (s.length > 50) s = s.slice(0, 50).replace(/[,\s]+$/, '') + '…';
  return s;
}

/**
 * Favourite toggle pill. Idle = neutral grey; Active = amber/gold (same
 * palette as the module-final test pill on TestPanel: bg #FEF3C7, fg #92400E,
 * star fill #D97706, border #FDE68A).
 *
 * Animation on add (idle → active):
 *   - Whole pill: spring scale pop 1 → 1.12 → 1
 *   - Star: scale 0 → 1.4 → 1 with a quarter-turn rotation, anchored at center
 *   - 6 sparkle particles burst outward and fade
 * On remove: silent shrink, no burst.
 */
function FavouriteButton({ isFavourite, onToggle }: {
  isFavourite: boolean;
  onToggle: () => void;
}) {
  // burstKey changes only when the user JUST added to favourites - drives
  // <AnimatePresence> for the sparkle particles. The button itself relies
  // on framer-motion's `animate` prop tied to `isFavourite`.
  const [burstKey, setBurstKey] = useState(0);
  const handleClick = () => {
    if (!isFavourite) setBurstKey((k) => k + 1);
    onToggle();
  };
  // 6 sparkles around the star at evenly spaced angles
  const sparkles = useMemo(
    () => Array.from({ length: 6 }, (_, i) => {
      const angle = (i / 6) * Math.PI * 2;
      return {
        x: Math.cos(angle) * 22,
        y: Math.sin(angle) * 22,
      };
    }),
    [],
  );
  return (
    <motion.button
      type="button"
      onClick={handleClick}
      aria-label={isFavourite ? 'Убрать из избранного' : 'Добавить в избранное'}
      animate={{ scale: 1 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 480, damping: 22 }}
      style={{
        marginLeft: 'auto',
        position: 'relative',
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '5px 10px 5px 8px', borderRadius: 999,
        background: isFavourite ? '#FEF3C7' : '#F0F1F5',
        color: isFavourite ? '#92400E' : '#6B7280',
        border: isFavourite ? '1px solid #FDE68A' : '1px solid transparent',
        cursor: 'pointer',
        fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600,
        transition: 'background 160ms, color 160ms, border-color 160ms',
        overflow: 'visible',
      }}
      onMouseEnter={(e) => {
        if (!isFavourite) e.currentTarget.style.background = '#E2E4EA';
        else e.currentTarget.style.background = '#FDE68A';
      }}
      onMouseLeave={(e) => {
        if (!isFavourite) e.currentTarget.style.background = '#F0F1F5';
        else e.currentTarget.style.background = '#FEF3C7';
      }}
    >
      <motion.span
        style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 11, height: 11 }}
        // Star itself: pop on add, gentle shrink-to-baseline on remove
        animate={isFavourite
          ? { scale: [0.6, 1.4, 1], rotate: [-90, 12, 0] }
          : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.45, ease: [0.05, 0.7, 0.1, 1] }}
      >
        <svg width={11} height={11} viewBox="0 0 24 24"
          fill={isFavourite ? '#D97706' : 'none'}
          stroke={isFavourite ? '#D97706' : 'currentColor'}
          strokeWidth={isFavourite ? 0 : 2}
          strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>

        {/* Sparkle burst on add. Re-mounted via burstKey so each click replays. */}
        <AnimatePresence>
          {isFavourite && burstKey > 0 && sparkles.map((s, i) => (
            <motion.span
              key={`${burstKey}-${i}`}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
              animate={{ x: s.x, y: s.y, opacity: 0, scale: 0.2 }}
              transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1], delay: i * 0.012 }}
              style={{
                position: 'absolute', left: '50%', top: '50%',
                width: 4, height: 4, marginLeft: -2, marginTop: -2,
                borderRadius: '50%',
                background: i % 2 === 0 ? '#F59E0B' : '#FBBF24',
                pointerEvents: 'none',
              }}
            />
          ))}
        </AnimatePresence>
      </motion.span>
      {isFavourite ? 'В избранном' : 'В избранное'}
    </motion.button>
  );
}

function Header({ tool, kind }: {
  tool: { id: string; title: string; subcategory: string; category: string; description?: string };
  kind?: string;
}) {
  const isFavourite = useAppStore((s) => s.toolsFavourites.includes(tool.id));
  const toggleFav = useAppStore((s) => s.toggleFavouriteTool);
  const toolCountries = primaryCountriesFor(TOOL_META[tool.id]?.countries);

  return (
    <div>
      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: 12,
      }}>
        {kind && (
          <span style={{
            padding: '3px 10px', fontSize: 11,
            fontFamily: 'var(--font-body)', fontWeight: 500,
            borderRadius: 999,
            backgroundColor: '#E2E4EA', color: '#374151',
          }}>
            {kind}
          </span>
        )}
        <span style={{
          padding: '3px 10px', fontSize: 11,
          fontFamily: 'var(--font-body)', fontWeight: 400,
          color: '#6B7280', background: '#F0F1F5', borderRadius: 999,
        }}>
          {tool.subcategory}
        </span>
        {/* Country tags — shown as sibling pills so the user sees at a
            glance where the tool is used. Same pill style as subcategory. */}
        {toolCountries.slice(0, 3).map((c) => (
          <span key={c.name} title={c.name} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', fontSize: 11,
            fontFamily: 'var(--font-body)', fontWeight: 400,
            color: '#6B7280', background: '#F0F1F5', borderRadius: 999,
          }}>
            <EmojiOrFlag emoji={c.flag} size={12} />
            {c.name}
          </span>
        ))}
        {toolCountries.length > 3 && (
          <span style={{
            padding: '3px 8px', fontSize: 11,
            fontFamily: 'var(--font-mono)', fontWeight: 600,
            color: '#6B7280', background: '#F0F1F5', borderRadius: 999,
          }}>
            +{toolCountries.length - 3}
          </span>
        )}
        {/* Favourite toggle - amber/gold palette matches the module-final
            test pill on TestPanel. Pop animation on add, sparkle burst. */}
        <FavouriteButton
          isFavourite={isFavourite}
          onToggle={() => toggleFav(tool.id)}
        />
      </div>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-2xl)',
        fontWeight: 700,
        color: 'var(--md-sys-color-on-surface)',
        marginBottom: 8,
        letterSpacing: '-0.02em',
        lineHeight: 1.2,
      }}>
        {tool.title}
      </h1>
      {tool.description && (
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: 'var(--md-sys-color-on-surface-variant)',
          maxWidth: 'var(--content-max)',
          lineHeight: 1.6,
        }}>
          {tool.description}
        </p>
      )}
    </div>
  );
}

function InfoPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{
      flex: 1, minWidth: 160,
      background: '#F5F6F8',
      borderRadius: 12,
      padding: '12px 16px',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6B7280' }}>
        {icon}
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
          color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          {label}
        </span>
      </div>
      <span style={{
        fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
        color: '#1A1A1A', lineHeight: 1.35,
        overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
        {value}
      </span>
    </div>
  );
}

function IconBolt() {
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
}
function IconTag() {
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1={7} y1={7} x2={7.01} y2={7}/></svg>;
}
function IconBook() {
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>;
}
function IconGlobe() {
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx={12} cy={12} r={10}/><line x1={2} y1={12} x2={22} y2={12}/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>;
}

const backBtnStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  background: 'transparent', border: 'none', cursor: 'pointer',
  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
  color: '#6B7280', padding: '6px 10px', borderRadius: 8,
  marginBottom: 16, alignSelf: 'flex-start',
};

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={backBtnStyle}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#F0F1F5'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <ArrowLeft size={16} />
      Назад
    </button>
  );
}

/* ════════════════ Inputs ════════════════ */

function InlineHintIcon({ hint }: { hint: string }) {
  return (
    <span
      tabIndex={0}
      title={hint}
      onClick={(e) => e.preventDefault()}
      style={{
        position: 'relative',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 14, height: 14, borderRadius: '50%',
        background: '#FFFFFF', color: '#6B7280',
        cursor: 'help', flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        const tip = e.currentTarget.querySelector('.tool-tooltip') as HTMLElement | null;
        if (tip) tip.style.opacity = '1';
      }}
      onMouseLeave={(e) => {
        const tip = e.currentTarget.querySelector('.tool-tooltip') as HTMLElement | null;
        if (tip) tip.style.opacity = '0';
      }}
    >
      <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx={12} cy={12} r={10}/>
        <line x1={12} y1={16} x2={12} y2={12}/>
        <line x1={12} y1={8} x2={12.01} y2={8}/>
      </svg>
      <span
        className="tool-tooltip"
        style={{
          position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%',
          transform: 'translateX(-50%)',
          background: '#1A1A1A', color: '#FFFFFF',
          padding: '8px 12px', borderRadius: 8,
          fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 400,
          lineHeight: 1.4, whiteSpace: 'normal',
          width: 220,
          opacity: 0, pointerEvents: 'none',
          transition: 'opacity 150ms',
          zIndex: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
        }}
      >
        {hint}
      </span>
    </span>
  );
}

function LabelWithHint({ label, hint }: { label: React.ReactNode; hint?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
      <label style={{
        fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
        color: '#374151',
      }}>
        {label}
      </label>
      {hint && (
        <span
          tabIndex={0}
          title={hint}
          style={{
            position: 'relative',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 16, height: 16, borderRadius: '50%',
            background: '#F0F1F5', color: '#6B7280',
            cursor: 'help', flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            const tip = e.currentTarget.querySelector('.tool-tooltip') as HTMLElement | null;
            if (tip) tip.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            const tip = e.currentTarget.querySelector('.tool-tooltip') as HTMLElement | null;
            if (tip) tip.style.opacity = '0';
          }}
        >
          <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <circle cx={12} cy={12} r={10}/>
            <line x1={12} y1={16} x2={12} y2={12}/>
            <line x1={12} y1={8} x2={12.01} y2={8}/>
          </svg>
          <span
            className="tool-tooltip"
            style={{
              position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%',
              transform: 'translateX(-50%)',
              background: '#1A1A1A', color: '#FFFFFF',
              padding: '8px 12px', borderRadius: 8,
              fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 400,
              lineHeight: 1.4, whiteSpace: 'normal',
              width: 240,
              opacity: 0, pointerEvents: 'none',
              transition: 'opacity 150ms',
              zIndex: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            }}
          >
            {hint}
          </span>
        </span>
      )}
    </div>
  );
}

/**
 * SelectField - collapsible radio-group for multi-option questions (e.g. PHQ-9, GAD-7).
 * After the user picks an option, the field collapses to a compact row showing
 * question + chosen answer. Click the row to re-expand and change the answer.
 */
function SelectField({ input, value, onChange }: {
  input: ToolInput;
  value: number | boolean | string | undefined;
  onChange: (v: number | boolean | string) => void;
}) {
  const options = input.options ?? [];
  const selected = options.find((o) => String(o.value) === String(value));
  // Track user-made choice vs default initialisation.
  const [userPicked, setUserPicked] = useState(false);
  // Manual toggle state: when user clicks the collapsed row to edit again.
  const [manualExpand, setManualExpand] = useState(false);

  // Collapse only when the user has actively picked an answer AND hasn't re-expanded.
  const collapsed = userPicked && !manualExpand && !!selected;

  const handlePick = (optValue: string | number) => {
    onChange(optValue);
    setUserPicked(true);
    setManualExpand(false);
  };

  return (
    <div>
      {/* Collapsed summary row - only rendered when field is in collapsed state */}
      <AnimatePresence initial={false} mode="wait">
        {collapsed && selected ? (
          <motion.button
            key="collapsed"
            type="button"
            onClick={() => setManualExpand(true)}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px',
              background: '#F5F6F8',
              border: 'none',
              borderRadius: 12, cursor: 'pointer', textAlign: 'left',
              fontFamily: 'var(--font-body)', fontSize: 14,
              color: '#1A1A1A',
              width: '100%',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#EFF1F4'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#F5F6F8'; }}
          >
            <span style={{
              width: 18, height: 18, borderRadius: '50%',
              background: '#1A1A1A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20,6 9,17 4,12" />
              </svg>
            </span>
            <span style={{
              flex: 1, minWidth: 0,
              display: 'flex', flexDirection: 'column', gap: 1,
            }}>
              <span style={{
                fontSize: 12, color: '#6B7280', fontWeight: 500,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {input.label}
              </span>
              <span style={{ fontSize: 14, color: '#1A1A1A', fontWeight: 600 }}>
                {selected.label}
              </span>
            </span>
            {selected.points !== undefined && selected.points !== 0 && (
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                color: '#6B7280', padding: '3px 8px', borderRadius: 6,
                background: '#FFFFFF',
              }}>
                {selected.points > 0 ? '+' : ''}{selected.points}
              </span>
            )}
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
              stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
              style={{ flexShrink: 0 }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
              opacity: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
            }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingBottom: 2 }}>
              <LabelWithHint label={input.label} hint={input.hint} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {options.map((opt) => {
                  const isSel = String(value) === String(opt.value);
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => handlePick(opt.value)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '11px 14px',
                        background: isSel ? '#E8E9ED' : '#F5F6F8',
                        border: 'none',
                        borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                        fontFamily: 'var(--font-body)', fontSize: 14, color: '#1A1A1A',
                        transition: 'background 150ms',
                      }}
                      onMouseEnter={(e) => { if (!isSel) e.currentTarget.style.background = '#EFF1F4'; }}
                      onMouseLeave={(e) => { if (!isSel) e.currentTarget.style.background = '#F5F6F8'; }}
                    >
                      <span style={{
                        width: 18, height: 18, borderRadius: '50%',
                        background: '#FFFFFF',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {isSel && (
                          <span style={{
                            width: 10, height: 10, borderRadius: '50%', background: '#1A1A1A',
                          }} />
                        )}
                      </span>
                      <span style={{ flex: 1, fontWeight: 500 }}>{opt.label}</span>
                      {opt.points !== undefined && opt.points !== 0 && (
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                          color: '#6B7280', padding: '3px 8px', borderRadius: 6,
                          background: '#FFFFFF',
                        }}>
                          {opt.points > 0 ? '+' : ''}{opt.points}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// React.memo with custom equality that IGNORES onChange identity. The parent
// passes a fresh arrow-fn for onChange on every render (closure over input.id),
// so default memo wouldn't help. We only re-render when the input definition
// or its value actually changes.
const InputField = React.memo(function InputField({ input, value, onChange }: {
  input: ToolInput;
  value: number | boolean | string | undefined;
  onChange: (v: number | boolean | string) => void;
}) {
  if (input.type === 'checkbox') {
    const checked = value === true;
    return (
      <label style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '13px 16px',
        background: checked ? '#E8E9ED' : '#F5F6F8',
        borderRadius: 12,
        cursor: 'pointer',
        transition: 'background 150ms',
      }}>
        <span style={{
          width: 20, height: 20, borderRadius: 6,
          background: checked ? '#1A1A1A' : '#FFFFFF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {checked && (
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
              stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20,6 9,17 4,12" />
            </svg>
          )}
        </span>
        <input
          type="checkbox" checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
        />
        <span style={{
          flex: 1, fontFamily: 'var(--font-body)', fontSize: 14,
          color: '#1A1A1A', fontWeight: 500, lineHeight: 1.4,
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          {input.label}
          {input.hint && <InlineHintIcon hint={input.hint} />}
        </span>
        {input.points !== undefined && input.points !== 0 && (
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
            color: '#6B7280', padding: '3px 8px', borderRadius: 6,
            background: '#FFFFFF', flexShrink: 0,
          }}>
            {input.points > 0 ? '+' : ''}{input.points}
          </span>
        )}
      </label>
    );
  }

  if (input.type === 'select' && input.options) {
    return <SelectField input={input} value={value} onChange={onChange} />;
  }

  // Number input - with quick-value chips below
  const currentNum = typeof value === 'number' && !isNaN(value) ? value : null;
  return (
    <div>
      <LabelWithHint
        label={
          <>
            {input.label}
            {input.unit && (
              <span style={{ color: '#9CA3AF', fontWeight: 400, marginLeft: 6 }}>({input.unit})</span>
            )}
          </>
        }
        hint={input.hint}
      />
      <input
        type="number"
        value={(value as number) ?? ''}
        onChange={(e) => {
          const n = e.target.value === '' ? '' : Number(e.target.value);
          onChange(n as number);
        }}
        min={input.min} max={input.max} step={input.step ?? 'any'}
        // Short placeholder only — the full clinical hint lives in the ℹ
        // tooltip next to the label. If the input has a min/max range we
        // show it ("0-100"); otherwise we fall back to the unit, or empty.
        placeholder={
          typeof input.min === 'number' && typeof input.max === 'number'
            ? `${input.min} – ${input.max}${input.unit ? ' ' + input.unit : ''}`
            : input.unit || ''
        }
        style={{
          width: '100%', padding: '13px 16px',
          background: '#F5F6F8', border: 'none',
          borderRadius: 12, fontFamily: 'var(--font-body)', fontSize: 15,
          color: '#1A1A1A', outline: 'none',
          transition: 'background 150ms',
        }}
        onFocus={(e) => { e.currentTarget.style.background = '#E8E9ED'; }}
        onBlur={(e) => { e.currentTarget.style.background = '#F5F6F8'; }}
      />
      {input.quickValues && input.quickValues.length > 0 && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 4,
          marginTop: 8,
        }}>
          {input.quickValues.map((qv) => {
            const isActive = currentNum === qv;
            return (
              <button
                key={qv}
                type="button"
                onClick={() => onChange(qv)}
                style={{
                  padding: '3px 10px',
                  background: isActive ? '#1A1A1A' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#6B7280',
                  border: `1px solid ${isActive ? '#1A1A1A' : '#E5E7EB'}`,
                  borderRadius: 999,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 600,
                  transition: 'all 120ms',
                  lineHeight: 1.4,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#F5F6F8';
                    e.currentTarget.style.borderColor = '#D1D5DB';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#FFFFFF';
                    e.currentTarget.style.borderColor = '#E5E7EB';
                  }
                }}
              >
                {qv}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}, (prev, next) => prev.input === next.input && prev.value === next.value);
