/**
 * ResultCard, ResultSection, ResultScale — отображение результата
 * вычисления калькулятора в ToolView.
 *
 * P1-CR-3 step 4/8 — extracted from ToolView.tsx.
 *
 * `ResultCard` — самый большой компонент: headline (значение + unit),
 * scale, interpretation, actions (с null/undefined фильтром per
 * P0-CR-1 widening), differential, caveats, related tools, related
 * courses.
 *
 * `ResultScale` — horizontal band scale с marker'ом для current value.
 * Поддерживает discrete integer bands (CHA₂DS₂-VASc) и continuous
 * cutoffs (BMI / MELD) — auto-detect по integerness.
 */
import React from 'react';
import { useT } from '@/lib/i18n';
import { useAppStore } from '@/lib/store';
import type { CalculatorResult, ResultScaleSegment } from '@/lib/tools-runners';
import { linkify } from './linkify';
import { MarkdownLite } from '@/components/ui/MarkdownLite';
import { formatResultForCopy } from './format-result';

/** Detect markdown syntax that warrants block-level rendering. */
function hasMarkdownSyntax(text: string): boolean {
  return /(^|\n)\s*#{1,6}\s|\*\*[^*]+\*\*|(^|\n)\s*\|[^\n]*\|\s*\n\s*\|[\s|:-]+\||(^|\n)\s*[-•*]\s|`[^`]+`/.test(text);
}

export function ResultCard({ result }: { result: CalculatorResult }) {
  const t = useT();
  const {
    value, unit, interpretation, color,
    details, actions, differential, caveats, scale, related, relatedCourses,
  } = result;
  const openTool = useAppStore((s) => s.openTool);
  const openCourse = useAppStore((s) => s.openCourse);
  const setShowLearning = useAppStore((s) => s.setShowLearning);
  // Clicking a related course must also leave the tools view, иначе
  // store ставит currentCourseId но page stays на tool tree, потому что
  // showTools/activeToolId всё ещё имеют priority.
  const openRelatedCourse = (id: string) => {
    setShowLearning(true);
    openCourse(id);
  };

  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    navigator.clipboard?.writeText(formatResultForCopy(result)).then(
      () => { setCopied(true); setTimeout(() => setCopied(false), 1500); },
      () => { /* clipboard blocked (insecure context / permission denied) */ },
    );
  };

  return (
    <div
      className="mt-6 py-5 px-6 rounded-[16px] bg-[var(--result-bg)] border-l-4 border-[var(--result-color)]"
      // eslint-disable-next-line react/forbid-dom-props -- dynamic result color tied to band
      style={{ ['--result-color' as string]: color, ['--result-bg' as string]: `${color}0F` }}
    >
      {/* Headline */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <p className="font-[var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.1em] m-0 text-[color:var(--result-color)]">
          Результат
        </p>
        <button
          type="button"
          onClick={handleCopy}
          title="Скопировать результат"
          className="shrink-0 px-2 py-1 rounded-md text-[11px] font-medium text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F0F1F5] transition-colors"
        >
          {copied ? 'Скопировано' : 'Копировать'}
        </button>
      </div>
      <div className="flex items-baseline gap-2.5 flex-wrap">
        <span className="font-[var(--font-display)] text-[44px] font-extrabold tracking-[-0.02em] leading-none text-[color:var(--result-color)]">
          {value}
        </span>
        {unit && (
          <span className="font-[var(--font-body)] text-base text-[#6B7280] font-medium">
            {unit}
          </span>
        )}
      </div>
      <p className="mt-[14px] font-[var(--font-body)] text-sm text-[#1A1A1A] leading-[1.6] font-medium mb-0 mx-0">
        {linkify(interpretation)}
      </p>

      {/* Visual band scale */}
      {scale && scale.segments.length > 0 && (
        <div className="mt-5">
          {/* P0-CR-1 interface widening — scale.current опционально, fallback
              на scale.value (legacy alias некоторых runners) или 0. */}
          <ResultScale
            segments={scale.segments}
            current={scale.current ?? scale.value ?? 0}
            unit={scale.unit ?? unit}
          />
        </div>
      )}

      {/* Longer clinical narrative — renders markdown (###, **bold**, tables,
          lists) when present, falls back to plain text with auto-linkified
          URLs otherwise. Fixes Bili-2022 / TPN / etc. where details contain
          GFM tables that previously displayed as raw `|col1|col2|` syntax. */}
      {details && (
        <ResultSection title={t('tool.section.interpretation')} icon="info">
          {hasMarkdownSyntax(details) ? (
            <MarkdownLite content={details} variant="compact" />
          ) : (
            <p className="m-0 text-[#374151] text-[13.5px] leading-[1.55]">
              {linkify(details)}
            </p>
          )}
        </ResultSection>
      )}

      {/* Recommended next actions. P0-CR-1: filter null/undefined items
          (interface widening разрешает (string|null|undefined)[]). */}
      {actions && actions.filter((a): a is string => typeof a === 'string' && a.length > 0).length > 0 && (
        <ResultSection title={t('tool.section.actions')} icon="arrow">
          <ul className="m-0 pl-0 list-none flex flex-col gap-1.5">
            {actions
              .filter((a): a is string => typeof a === 'string' && a.length > 0)
              .map((a, i) => (
              <li key={i} className="flex gap-2 items-start text-[#374151] text-[13.5px] leading-[1.5]">
                <span className="shrink-0 mt-[7px] w-[5px] h-[5px] rounded-full bg-[color:var(--result-color)]" />
                <span>{linkify(a)}</span>
              </li>
            ))}
          </ul>
        </ResultSection>
      )}

      {/* Differential / mnemonic breakdown (MUDPILES etc.) */}
      {differential && differential.length > 0 && (
        <ResultSection title={t('tool.section.differential')} icon="list">
          <div className="flex flex-col gap-1">
            {differential.map((d, i) => (
              <div key={i} className="grid grid-cols-[20px_1fr] gap-2.5 py-1">
                <span className="font-[var(--font-mono)] text-xs font-bold leading-[1.5] text-[color:var(--result-color)]">
                  {d.term}
                </span>
                <span className="text-[#374151] text-[13.5px] leading-[1.5]">
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
          <ul className="m-0 pl-0 list-none flex flex-col gap-1.5">
            {caveats.map((c, i) => (
              <li key={i} className="flex gap-2 items-start text-[#374151] text-[13.5px] leading-[1.5]">
                <span className="shrink-0 mt-[5px] text-[#F59E0B] text-xs font-bold">⚠</span>
                <span>{linkify(c)}</span>
              </li>
            ))}
          </ul>
        </ResultSection>
      )}

      {/* Related tools */}
      {related && related.length > 0 && (
        <ResultSection title={t('tool.section.related')} icon="link">
          <div className="flex flex-wrap gap-1.5">
            {related.map((r) => (
              <button
                key={r.id}
                onClick={() => openTool(r.id)}
                className="inline-flex items-center gap-1.5 py-[5px] px-3 bg-white hover:bg-[#F5F6F8] text-[#1A1A1A] border border-[#E5E7EB] hover:border-[#D1D5DB] rounded-full cursor-pointer font-[var(--font-body)] text-xs font-medium transition-[background,border-color] duration-150"
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

      {/* Related courses — only rendered when the tool-runner author
          explicitly listed course ids. Never auto-generated, so we never
          send the user to a lesson that doesn't actually cover this tool. */}
      {relatedCourses && relatedCourses.length > 0 && (
        <ResultSection title={t('tool.section.relatedCourses')} icon="book">
          <div className="flex flex-wrap gap-1.5">
            {relatedCourses.slice(0, 3).map((c) => (
              <button
                key={c.id}
                onClick={() => openRelatedCourse(c.id)}
                className="inline-flex items-center gap-1.5 py-[5px] px-3 bg-white hover:bg-[#F5F6F8] text-[#1A1A1A] border border-[#E5E7EB] hover:border-[#D1D5DB] rounded-full cursor-pointer font-[var(--font-body)] text-xs font-medium transition-[background,border-color] duration-150"
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

export function ResultSection({ title, icon, children }: {
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
    <div className="mt-[18px] pt-[14px] border-t border-black/[0.06]">
      <div className="flex items-center gap-[7px] mb-2.5 text-[#6B7280]">
        {iconEl}
        <span className="font-[var(--font-mono)] text-[10px] font-bold uppercase tracking-[0.08em]">
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
 * Segments может быть continuous (e.g. BMI 18.5-25) или discrete integer
 * bands (e.g. CHADS-VASc [0,0], [1,1], [2,9]). Algorithm auto-detects по
 * integerness каждого finite min/max. В discrete case каждое целое =
 * один "slot" так single-point bands like [0,0] получают visible width
 * и сегменты sum to 100 % bar — no gaps. Continuous scales: segment
 * width = (max − min).
 */
export function ResultScale({ segments, current, unit }: {
  segments: ResultScaleSegment[];
  current: number;
  unit?: string | undefined;
}) {
  if (!segments.length) return null;

  /*
   * Two distinct input conventions come в from runners:
   *
   *   (a) Non-overlapping discrete bands, e.g. CHA₂DS₂-VASc
   *         {0,0}, {1,1}, {2,9}             → каждый integer inclusive on both ends
   *
   *   (b) Touching continuous cutoffs, e.g. MELD or BMI
   *         {6,10}, {10,20}, {20,30}, …     → max одного == min следующего
   *
   * Both валидны клинически. Внутри normalise to (a)'s semantics: каждый
   * сегмент покрывает [min, max] inclusive. When consecutive segments
   * touch at an integer boundary мы decrement раньший max by 1 so они
   * не double-count тот integer.
   */
  const touchesIntegerNeighbour = (i: number) => {
    if (i + 1 >= segments.length) return false;
    const cur = segments[i];
    const nxt = segments[i + 1];
    if (!cur || !nxt) return false;
    if (!Number.isFinite(cur.max)) return false;
    if (cur.max !== nxt.min) return false;
    return Number.isInteger(cur.max) && Number.isInteger(nxt.min);
  };
  const normalised = segments.map((s, i) => ({
    ...s,
    max: touchesIntegerNeighbour(i) ? (s.max as number) - 1 : s.max,
  }));

  // Is каждый normalised segment's bound integer? Governs +1 rule.
  const allInt = normalised.every((s) =>
    Number.isInteger(s.min) && (!Number.isFinite(s.max) || Number.isInteger(s.max))
  );

  const finiteMax = normalised.reduce((acc, s) => {
    if (Number.isFinite(s.max)) return Math.max(acc, s.max);
    return acc;
  }, -Infinity);
  const finiteMin = normalised[0]?.min ?? 0;
  const spanMax = Number.isFinite(finiteMax) ? finiteMax : finiteMin + 10;

  // Width helper. Integer bands get (max − min + 1); continuous bands
  // get (max − min). Open-ended upper bounds clip to effective max.
  const segWidth = (s: ResultScaleSegment) => {
    const hi = Number.isFinite(s.max) ? s.max : spanMax;
    const raw = Math.max(hi - s.min, 0);
    return allInt ? raw + 1 : raw;
  };
  const total = normalised.reduce((sum, s) => sum + segWidth(s), 0) || 1;

  // Marker: discrete scales центрируют mark внутри integer cell.
  const markerOffset = allInt ? (current - finiteMin + 0.5) : (current - finiteMin);
  const markerPct = Math.max(0, Math.min(100, (markerOffset / total) * 100));

  // Marker — clinical value, должен align со своим band'ом независимо от
  // marker width; compute через translateX вместо fixed pixel offset.
  return (
    <div>
      <div className="relative h-2.5 rounded-full overflow-hidden flex bg-[#EEF0F4]">
        {normalised.map((s, i) => {
          const w = (segWidth(s) / total) * 100;
          return (
            <div
              key={i}
              title={`${s.label} (${s.min}${Number.isFinite(s.max) ? (s.min === s.max ? '' : '-' + s.max) : '+'})`}
              className="opacity-65 bg-[var(--seg-color)] basis-[var(--seg-width)] flex-grow-0 flex-shrink-0"
              // eslint-disable-next-line react/forbid-dom-props -- per-segment dynamic width + color
              style={{ ['--seg-width' as string]: `${w}%`, ['--seg-color' as string]: s.color }}
            />
          );
        })}
        {/* Marker — 4px wide, centred at markerPct via translateX. */}
        <div
          className="absolute -top-[3px] -bottom-[3px] w-1 rounded-[2px] -translate-x-1/2 bg-[#1A1A1A] shadow-[0_0_0_2px_#FFFFFF] left-[var(--marker-pct)]"
          // eslint-disable-next-line react/forbid-dom-props -- dynamic marker position
          style={{ ['--marker-pct' as string]: `${markerPct}%` }}
        />
      </div>
      {/*
        Label row. Current-value label absolutely positioned так sit'ит
        прямо под marker'ом. Min/max сидят на ends. Когда marker близко
        к edge (≤ 12 % или ≥ 88 %) suppress'им near edge label так
        current-value text не collides с ним.
      */}
      <div className="relative mt-1.5 h-[14px] font-[var(--font-mono)] text-[10.5px] text-[#9CA3AF]">
        {markerPct > 12 && (
          <span className="absolute left-0 top-0">
            {finiteMin}{unit ? ' ' + unit : ''}
          </span>
        )}
        <span
          className="absolute top-0 -translate-x-1/2 text-[#374151] font-bold whitespace-nowrap left-[var(--marker-pct)]"
          // eslint-disable-next-line react/forbid-dom-props -- dynamic marker position
          style={{ ['--marker-pct' as string]: `${markerPct}%` }}
        >
          {current}{unit ? ' ' + unit : ''}
        </span>
        {markerPct < 88 && (
          <span className="absolute right-0 top-0">
            {Number.isFinite(finiteMax) ? finiteMax : `${spanMax}+`}{unit ? ' ' + unit : ''}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2.5 mt-2.5">
        {segments.map((s, i) => (
          <div key={i} className="inline-flex items-center gap-1.5 text-[11.5px] text-[#6B7280]">
            <span
              className="w-2 h-2 rounded-[2px] bg-[var(--seg-color)]"
              // eslint-disable-next-line react/forbid-dom-props -- legend swatch dynamic color
              style={{ ['--seg-color' as string]: s.color }}
            />
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
