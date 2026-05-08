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
          {/* P0-CR-1 interface widening — scale.current опционально, fallback
              на scale.value (legacy alias некоторых runners) или 0. */}
          <ResultScale
            segments={scale.segments}
            current={scale.current ?? scale.value ?? 0}
            unit={scale.unit ?? unit}
          />
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

      {/* Recommended next actions. P0-CR-1: filter null/undefined items
          (interface widening разрешает (string|null|undefined)[]). */}
      {actions && actions.filter((a): a is string => typeof a === 'string' && a.length > 0).length > 0 && (
        <ResultSection title={t('tool.section.actions')} icon="arrow">
          <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {actions
              .filter((a): a is string => typeof a === 'string' && a.length > 0)
              .map((a, i) => (
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

      {/* Related courses — only rendered when the tool-runner author
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
        {/* Marker — 4px wide, centred at markerPct via translateX. */}
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
        Label row. Current-value label absolutely positioned так sit'ит
        прямо под marker'ом. Min/max сидят на ends. Когда marker близко
        к edge (≤ 12 % или ≥ 88 %) suppress'им near edge label так
        current-value text не collides с ним.
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
