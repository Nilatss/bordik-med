'use client';

import React, { useState, useMemo, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCatalog, type CatalogMetaItem } from '@/lib/catalog-client';
import { findBand, type CalculatorResult, type ToolRunner } from '@/lib/tools-runners';
import { loadRunner } from '@/lib/runners';
import { useAppStore } from '@/lib/store';
import { seedNeoContext } from '@/lib/neo-context-seed';
import { reportToolTimeToResult } from '@/lib/analytics/tool-time-to-result';
import { useT } from '@/lib/i18n';
import type { Tab } from '@/lib/tool-view/types';
import { URL_REGEX, slugify, shortenTitle, iconKeyForTitle, buildInfoTabs, hasZeroPositiveInput } from '@/lib/tool-view/utils';
import { MemoisedMarkdown } from './view/Markdown';
import { linkify } from './view/linkify';
import { TabIcon } from './view/TabIcon';
import { NavButton, BackButton } from './view/Nav';
import { cleanReference, shortRef } from '@/lib/tool-view/refs';
import { Header, InfoPill, IconBolt, IconTag, IconBook, IconGlobe } from './view/Header';
import { CalculatorBody } from './view/CalculatorBody';
import { TocSidebar } from './view/TocSidebar';

/* slugify, URL_REGEX, shortenTitle, iconKeyForTitle, buildInfoTabs, Tab → lib/tool-view/ (P1-CR-3 step 1). */
/* linkify → ./view/linkify.tsx (P1-CR-3 step 4). */

export default function ToolView({ toolId }: { toolId: string }) {
  const t = useT();
  // Audit P-1: atomic selector. Was `const { closeTool } = useAppStore()`
  // — destructure без селектора subscribes ToolView to every store tick.
  const closeTool = useAppStore((s) => s.closeTool);
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
    // Pre-seed neonatal calculators from the shared patient context (weight/
    // GA/day from PatientContextBar). Read via getState so the seed reflects
    // the context at open-time without re-firing on the user's later edits.
    const seeded = seedNeoContext(toolId, runner.inputs, useAppStore.getState().patientContext);
    setValues({ ...init, ...seeded });
  }, [runner, toolId]);

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
    // Audit B-1: clinical safety guard — runners with strictly-positive
    // input ranges (weight, height, BSA, dose, volume, …) must NEVER emit
    // "0 мл" / "0 мг/кг" as if it were a valid result. HTML `min=0.1`
    // can be bypassed via paste, programmatic preset, or browser quirk.
    // We reject the compute() entirely and surface an explicit N/A so the
    // clinician sees there is no result rather than a misleading zero.
    // Cockcroft-Gault, CKD-EPI, pediatric-dose already had per-runner
    // guards (P0-CR-1); this wrapper-level guard covers all other ~700
    // runners at once. Logic extracted to `hasZeroPositiveInput()` so it
    // can be unit-tested independently of React.
    if (hasZeroPositiveInput(runner.inputs, values)) {
      return {
        value: 'N/A',
        interpretation: 'Введите корректные значения — ноль / отрицательные числа недопустимы',
        color: '#9CA3AF',
      };
    }
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
        // Audit B-10: secondary fields (unit, details, interpretation) can
        // also leak Infinity/NaN when runners compute multiple derived
        // values from the same input. drip-rate, infusion-rate, и
        // несколько neonatal-dose runners пишут secondary numbers в `unit`
        // (e.g. "(50 мл/ч)") и `details` (markdown narrative). Если
        // primary value прошёл проверку, но secondary fields содержат
        // Infinity/NaN, мы тоже surface'им N/A — лучше консервативно,
        // чем дать клиницисту "Infinity мл/ч" в скобках.
        const leak = /(?:^|[\s(,])(?:Infinity|-Infinity|NaN)(?:[\s),]|$)/;
        if (
          (typeof r?.unit === 'string' && leak.test(r.unit))
          || (typeof r?.details === 'string' && leak.test(r.details))
          || (typeof r?.interpretation === 'string' && leak.test(r.interpretation))
        ) {
          return {
            ...r,
            value: 'N/A',
            interpretation: 'Не удалось вычислить — проверьте корректность значений',
            color: '#9CA3AF',
          };
        }
        return r;
      } catch { return null; }
    }
    // Bug #2 fix: wrap score-kind path in try-catch like the calculator-kind
    // path above. If findBand() throws (e.g. empty bands on a misconfigured
    // runner), the exception would propagate from useMemo to React and crash
    // the component tree. Returning null lets the UI stay mounted.
    try {
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
    } catch { return null; }
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
      <div className="p-10 text-center text-[#9CA3AF]">
        {t('tool.notFound')}
        <div className="mt-4">
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
      <div className="flex flex-col max-w-[760px]">
        <BackButton onClick={closeTool} />
        <Header tool={tool} />
        <div className="mt-6 py-10 px-6 bg-[#F5F6F8] rounded-[20px] text-center">
          <p className="font-[var(--font-body)] text-sm text-[#6B7280]">
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
      <div className="info-pill-row mt-4 mb-5">
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
          className="lesson-card bg-white rounded-[var(--md-sys-shape-corner-extra-large)] p-[var(--space-6)] min-h-[300px]"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: [0.05, 0.7, 0.1, 1] }}
        >
          {/* Tab header - identical structure to TabbedLessonViewer */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#F0F0F0]">
            <span className="flex text-[#1A1A1A]">
              <TabIcon name={active.iconKey} size={24} />
            </span>
            <h2 className="font-[var(--font-display)] text-[22px] font-bold text-[#1A1A1A] leading-[1.2] tracking-[-0.01em] m-0">
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
              <p className="mb-3">
                <strong>{t('tool.referenceTitle')}</strong>
              </p>
              <p>{cleanReference(runner.reference)}</p>
              <p className="mt-5 text-[#6B7280] text-[13px]">
                {t('tool.referenceFooter')}
              </p>
            </div>
          )}

          {/* Prev / Next - identical to TabbedLessonViewer */}
          <div className="flex justify-between gap-3 mt-8 pt-5 border-t border-[#F0F0F0]">
            {prevTab ? (
              <NavButton onClick={() => setActiveId(prevTab.id)} label={prevTab.short} dir="prev" />
            ) : <span />}
            {nextTab ? (
              <NavButton onClick={() => setActiveId(nextTab.id)} label={nextTab.short} dir="next" primary />
            ) : null}
          </div>
        </motion.div>
        </AnimatePresence>

        {/* RIGHT: sidebar — «Содержание» — identical visual treatment к TabbedLessonViewer */}
        <TocSidebar tabs={tabs} activeId={active.id} onSelect={setActiveId} />
      </div>
    </motion.div>
  );
}

/* MemoisedMarkdown, withSexBadges, preprocessToolContent, mdComponents, callout helpers
   → ./view/Markdown.tsx (P1-CR-3 step 2). */

/* CalculatorBody → ./view/CalculatorBody.tsx (P1-CR-3 step 7). */

/* ResultCard, ResultSection, ResultScale → ./view/Result.tsx (P1-CR-3 step 4). */
/* NavButton, BackButton → ./view/Nav.tsx (P1-CR-3 step 5). */
/* TabIcon → ./view/TabIcon.tsx (P1-CR-3 step 5). */
/* cleanReference, shortRef → lib/tool-view/refs.ts (P1-CR-3 step 5). */
/* Header, FavouriteButton, InfoPill, IconBolt/Tag/Book/Globe → ./view/Header.tsx (P1-CR-3 step 6). */
/* InlineHintIcon, LabelWithHint, SelectField, InputField → ./view/InputField.tsx (P1-CR-3 step 3). */
