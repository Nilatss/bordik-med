'use client';

import React, { useState, useMemo, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCatalog, type CatalogMetaItem } from '@/lib/catalog-client';
import { findBand, type ToolInput, type Preset, type CalculatorResult, type ToolRunner } from '@/lib/tools-runners';
import { loadRunner } from '@/lib/runners';
import { primaryCountriesFor } from '@/lib/tool-meta-helpers';
import { useAppStore } from '@/lib/store';
import { reportToolTimeToResult } from '@/lib/analytics/tool-time-to-result';
import { useT } from '@/lib/i18n';
import { ArrowLeft } from '@/components/icons';
import EmojiOrFlag from '@/components/ui/EmojiOrFlag';
import { OfflineBadge } from './OfflineBadge';
import type { Tab } from '@/lib/tool-view/types';
import { URL_REGEX, slugify, shortenTitle, iconKeyForTitle, buildInfoTabs } from '@/lib/tool-view/utils';
import { MemoisedMarkdown } from './view/Markdown';
import { InputField } from './view/InputField';
import { ResultCard } from './view/Result';
import { linkify } from './view/linkify';
import { TabIcon } from './view/TabIcon';
import { NavButton, BackButton } from './view/Nav';
import { cleanReference, shortRef } from '@/lib/tool-view/refs';

/* slugify, URL_REGEX, shortenTitle, iconKeyForTitle, buildInfoTabs, Tab → lib/tool-view/ (P1-CR-3 step 1). */
/* linkify → ./view/linkify.tsx (P1-CR-3 step 4). */

export default function ToolView({ toolId }: { toolId: string }) {
  const t = useT();
  const { closeTool } = useAppStore();
  // Catalog arrives async via fetch /catalog.meta.json. While it's loading,
  // `tool` is undefined - the component below shows the loading state. The
  // runner load runs in parallel so by the time both arrive the page can
  // render in one paint.
  const catalog = useCatalog();
  const tool = useMemo<CatalogMetaItem | undefined>(
    () => catalog?.find((c) => c.id === toolId),
    [catalog, toolId],
  );

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
        // Number.isFinite ловит и NaN, и ±Infinity — раннее ограждение
        // от Number(""), Number("foo"), Number(Infinity).
        return typeof v === 'number' && Number.isFinite(v);
      }
      return values[inp.id] !== undefined;
    });
    if (!ready) return null;
    if (runner.kind === 'calculator') {
      try {
        const r = runner.compute(values);
        // Defense-in-depth: если compute() при «пограничных» входных вернул
        // числовую строку, которая не finite (Infinity/-Infinity/NaN), —
        // подменяем на N/A. Это страховка для раннеров, у которых ещё нет
        // явного guard'а в compute() (см. AUDIT_REPORT P0-1, GFR-формулы).
        // value теперь может быть string|number (interface widening, P0-CR-1)
        const valueStr = typeof r?.value === 'number' ? String(r.value) : r?.value;
        if (valueStr && /^-?(?:\d|Infinity|NaN)/i.test(valueStr)) {
          const n = parseFloat(valueStr);
          if (!Number.isFinite(n)) {
            return {
              ...r,
              value: 'N/A',
              interpretation: 'Не удалось вычислить — проверьте корректность значений',
              color: '#9CA3AF',
            };
          }
        }
        return r;
      } catch { return null; }
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

  // P0-A8 «время до результата»: при первом успешном compute для
  // данного tool.id отчитываемся в Sentry (миллисекунды от openTool).
  // Reporter сам идемпотентен — повторный вызов на ре-комптуте при
  // изменении input'а ничего не делает (он сбрасывает window-маркер
  // после первого отчёта).
  useEffect(() => {
    if (!result || !tool) return;
    reportToolTimeToResult(tool.id, runner?.kind);
  }, [result, tool, runner?.kind]);

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
  // Defensive: tabs.length >= 1 by construction; the explicit guard
  // pacifies strict-index TS without changing behaviour.
  if (!active) return null;
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
              {...(runner.presets && { presets: runner.presets })}
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

/* MemoisedMarkdown, withSexBadges, preprocessToolContent, mdComponents, callout helpers
   → ./view/Markdown.tsx (P1-CR-3 step 2). */

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

/* ResultCard, ResultSection, ResultScale → ./view/Result.tsx (P1-CR-3 step 4). */
/* NavButton, BackButton → ./view/Nav.tsx (P1-CR-3 step 5). */
/* TabIcon → ./view/TabIcon.tsx (P1-CR-3 step 5). */
/* cleanReference, shortRef → lib/tool-view/refs.ts (P1-CR-3 step 5). */

/* ════════════════ Header ════════════════ */

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
        // marginLeft:auto убран — теперь FavouriteButton стоит сразу
        // справа от OfflineBadge как сиблинг-чип, в одном комплекте.
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
  tool: { id: string; title: string; subcategory: string; category: string; description?: string; countries?: string | null };
  kind?: string;
}) {
  const isFavourite = useAppStore((s) => s.toolsFavourites.includes(tool.id));
  const toggleFav = useAppStore((s) => s.toggleFavouriteTool);
  const toolCountries = primaryCountriesFor(tool.countries);

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
        {/* Offline cache pill - lets the user pre-cache this tool's JSON
            for use without network. Sits next to favourite so both quick
            actions are in the same row. */}
        <OfflineBadge toolId={tool.id} />
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

/* InlineHintIcon, LabelWithHint, SelectField, InputField → ./view/InputField.tsx (P1-CR-3 step 3). */
