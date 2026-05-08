'use client';

import React, { useState, useMemo, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCatalog, type CatalogMetaItem } from '@/lib/catalog-client';
import { findBand, type ToolInput, type Preset, type CalculatorResult, type ToolRunner } from '@/lib/tools-runners';
import { loadRunner } from '@/lib/runners';
import { useAppStore } from '@/lib/store';
import { reportToolTimeToResult } from '@/lib/analytics/tool-time-to-result';
import { useT } from '@/lib/i18n';
import type { Tab } from '@/lib/tool-view/types';
import { URL_REGEX, slugify, shortenTitle, iconKeyForTitle, buildInfoTabs } from '@/lib/tool-view/utils';
import { MemoisedMarkdown } from './view/Markdown';
import { InputField } from './view/InputField';
import { ResultCard } from './view/Result';
import { linkify } from './view/linkify';
import { TabIcon } from './view/TabIcon';
import { NavButton, BackButton } from './view/Nav';
import { cleanReference, shortRef } from '@/lib/tool-view/refs';
import { Header, InfoPill, IconBolt, IconTag, IconBook, IconGlobe } from './view/Header';

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
/* Header, FavouriteButton, InfoPill, IconBolt/Tag/Book/Globe → ./view/Header.tsx (P1-CR-3 step 6). */
/* InlineHintIcon, LabelWithHint, SelectField, InputField → ./view/InputField.tsx (P1-CR-3 step 3). */
