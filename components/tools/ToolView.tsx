'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CATALOG_TOOLS } from '@/lib/tools-catalog';
import { getRunner, findBand, type ToolInput } from '@/lib/tools-runners';
import { useAppStore } from '@/lib/store';
import { ArrowLeft } from '@/components/icons';

/** Slugify heading text for anchor id */
function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-zа-я0-9]+/gi, '-').replace(/^-+|-+$/g, '');
}

/** Extract H3 headings from markdown for TOC */
function extractSections(md: string): { id: string; title: string }[] {
  const out: { id: string; title: string }[] = [];
  const lines = md.split('\n');
  for (const line of lines) {
    const m = line.match(/^###\s+(.+?)\s*$/);
    if (m) {
      const title = m[1].trim();
      out.push({ id: slugify(title), title });
    }
  }
  return out;
}

export default function ToolView({ toolId }: { toolId: string }) {
  const { closeTool } = useAppStore();
  const tool = useMemo(() => CATALOG_TOOLS.find((t) => t.id === toolId), [toolId]);
  const runner = useMemo(() => getRunner(toolId), [toolId]);
  const [values, setValues] = useState<Record<string, number | boolean | string>>({});
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [activeSection, setActiveSection] = useState<string>('calculator');

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

  const sections = useMemo(
    () => (runner?.info ? extractSections(runner.info) : []),
    [runner?.info]
  );

  /** Scroll-spy: track which section is visible */
  useEffect(() => {
    if (!runner?.info) return;
    const ids = ['calculator', 'result', 'info-top', ...sections.map((s) => s.id)];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '-20% 0% -60% 0%', threshold: 0 }
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [runner?.info, sections]);

  const scrollToId = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    // find nearest scrollable ancestor (main)
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  if (!tool) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>
        Инструмент не найден.
        <div style={{ marginTop: 16 }}>
          <BackButton onClick={closeTool} />
        </div>
      </div>
    );
  }

  if (!runner) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 760 }}>
        <BackButton onClick={closeTool} />
        <Header tool={tool} />
        <div style={{
          marginTop: 24, padding: '40px 24px',
          background: '#F5F6F8', borderRadius: 20, textAlign: 'center',
        }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: '#6B7280' }}>
            Инструмент в разработке. Скоро будет доступен.
          </p>
        </div>
      </div>
    );
  }

  const ready = runner.inputs.every((inp) => {
    if (inp.type === 'number') {
      const v = values[inp.id];
      return typeof v === 'number' && !isNaN(v);
    }
    return values[inp.id] !== undefined;
  });

  let result: { value: string; unit?: string; interpretation: string; color: string } | null = null;
  if (ready) {
    if (runner.kind === 'calculator') {
      try { result = runner.compute(values); } catch { result = null; }
    } else {
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
      result = {
        value: String(total),
        unit: `из ${runner.maxScore}`,
        interpretation: `${band.label} · ${band.description}`,
        color: band.color,
      };
    }
  }

  const kindLabel = runner.kind === 'score' ? 'Шкала' : 'Калькулятор';

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) 260px',
      gap: 32,
      alignItems: 'start',
    }}>
      {/* LEFT: main content */}
      <div ref={contentRef} style={{ minWidth: 0 }}>
        <BackButton onClick={closeTool} />
        <Header tool={tool} kind={kindLabel} />

        {/* InfoPills row */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16, marginBottom: 32 }}>
          <InfoPill
            icon={<IconBolt />}
            label="Тип"
            value={kindLabel}
          />
          <InfoPill
            icon={<IconTag />}
            label="Раздел"
            value={tool.subcategory}
          />
          <InfoPill
            icon={<IconBook />}
            label="Источник"
            value={shortRef(runner.reference)}
          />
        </div>

        {/* ═══ Calculator section ═══ */}
        <section id="calculator" style={{ scrollMarginTop: 20, marginBottom: 28 }}>
          <SectionLabel>Калькулятор</SectionLabel>
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {runner.inputs.map((inp) => (
              <InputField
                key={inp.id}
                input={inp}
                value={values[inp.id]}
                onChange={(v) => setValues((prev) => ({ ...prev, [inp.id]: v }))}
              />
            ))}
          </div>
        </section>

        {/* ═══ Result section ═══ */}
        {result && (
          <section id="result" style={{ scrollMarginTop: 20, marginBottom: 32 }}>
            <div style={{
              padding: '22px 26px',
              borderRadius: 16,
              background: `${result.color}0F`,
              borderLeft: `4px solid ${result.color}`,
            }}>
              <p style={{
                fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                color: result.color, textTransform: 'uppercase', letterSpacing: '0.1em',
                marginBottom: 10,
              }}>
                Результат
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 800,
                  color: result.color, letterSpacing: '-0.02em', lineHeight: 1,
                }}>
                  {result.value}
                </span>
                {result.unit && (
                  <span style={{
                    fontFamily: 'var(--font-body)', fontSize: 16, color: '#6B7280',
                    fontWeight: 500,
                  }}>
                    {result.unit}
                  </span>
                )}
              </div>
              <p style={{
                marginTop: 14,
                fontFamily: 'var(--font-body)', fontSize: 14, color: '#1A1A1A',
                lineHeight: 1.6, fontWeight: 500,
              }}>
                {result.interpretation}
              </p>
            </div>
          </section>
        )}

        {/* ═══ Info: clinical reference ═══ */}
        {runner.info && (
          <section id="info-top" style={{ scrollMarginTop: 20 }}>
            <SectionLabel>Клиническая справка</SectionLabel>
            <div className="lesson-content tool-info">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                {runner.info}
              </ReactMarkdown>
            </div>
          </section>
        )}

        {/* Reference footer */}
        <div style={{
          marginTop: 32,
          background: '#F5F6F8', borderRadius: 12, padding: '14px 18px',
          fontFamily: 'var(--font-body)', fontSize: 12, color: '#6B7280',
          lineHeight: 1.55,
        }}>
          <strong style={{ color: '#374151', fontWeight: 700 }}>Источник:</strong> {runner.reference}
        </div>
      </div>

      {/* RIGHT: TOC sidebar — like course pages */}
      <aside style={{
        position: 'sticky', top: 20,
        background: '#F5F6F8',
        borderRadius: 'var(--md-sys-shape-corner-extra-large, 20px)',
        padding: 16,
        display: 'flex', flexDirection: 'column', gap: 2,
      }}>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 11,
          fontWeight: 600, color: '#888',
          textTransform: 'uppercase', letterSpacing: '0.08em',
          padding: '4px 12px 10px',
          margin: 0,
        }}>
          Содержание
        </p>

        <TocItem
          id="calculator"
          title="Калькулятор"
          icon={<IconCalculator />}
          active={activeSection === 'calculator'}
          onClick={scrollToId}
        />
        {result && (
          <TocItem
            id="result"
            title="Результат"
            icon={<IconSparkle />}
            active={activeSection === 'result'}
            onClick={scrollToId}
          />
        )}
        {runner.info && sections.length > 0 && (
          <>
            <div style={{ height: 8 }} />
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 11,
              fontWeight: 600, color: '#888',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              padding: '4px 12px 6px',
              margin: 0,
            }}>
              Справка
            </p>
            {sections.map((s) => (
              <TocItem
                key={s.id}
                id={s.id}
                title={s.title}
                icon={headingIcon(s.title)}
                active={activeSection === s.id}
                onClick={scrollToId}
              />
            ))}
          </>
        )}
      </aside>
    </div>
  );
}

/* ════════════════ TOC Item ════════════════ */

function TocItem({ id, title, icon, active, onClick }: {
  id: string; title: string; icon: React.ReactNode;
  active: boolean; onClick: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onClick(id)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 12px',
        background: active ? '#1A1A1A' : 'transparent',
        color: active ? '#FFFFFF' : '#333',
        border: 'none', borderRadius: 10,
        cursor: 'pointer', textAlign: 'left',
        fontFamily: 'var(--font-body)', fontSize: 12.5,
        fontWeight: active ? 600 : 500,
        transition: 'background 150ms ease, color 150ms ease',
        width: '100%',
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = '#E8E9ED'; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      <span style={{
        display: 'flex', flexShrink: 0,
        color: active ? '#FFF' : '#6B7280',
      }}>
        {icon}
      </span>
      <span style={{
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        minWidth: 0, flex: 1,
      }}>
        {title}
      </span>
    </button>
  );
}

/* ════════════════ Markdown components ════════════════ */

/**
 * Only override H3 to: (a) add an icon badge; (b) inject an anchor id
 * so the TOC sidebar can scroll to it.
 * All other elements (p, strong, em, code, pre, tables, lists, hr, a, blockquote)
 * are styled via .lesson-content CSS → identical to course lessons.
 */
const mdComponents = {
  h3: ({ children }: { children?: React.ReactNode }) => {
    const txt = String(Array.isArray(children) ? children.join('') : children || '');
    const id = slugify(txt);
    return (
      <h3 id={id} className="tool-info-h3" style={{ scrollMarginTop: 20 }}>
        <span className="tool-info-h3-icon" aria-hidden>
          {headingIcon(txt)}
        </span>
        <span>{children}</span>
      </h3>
    );
  },
};

/* ════════════════ Icons for TOC and H3 ════════════════ */

function headingIcon(text: string): React.ReactNode {
  const t = text.toLowerCase();
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const ic = (path: React.ReactNode) => <svg width={16} height={16} viewBox="0 0 24 24" {...p}>{path}</svg>;

  if (/для чего|описани|что (с|и|о)/.test(t))
    return ic(<><circle cx={12} cy={12} r={10}/><line x1={12} y1={16} x2={12} y2={12}/><line x1={12} y1={8} x2={12.01} y2={8}/></>);
  if (/когда|применени|показани|время/.test(t))
    return ic(<><circle cx={12} cy={12} r={10}/><polyline points="12,6 12,12 16,14"/></>);
  if (/формул|расч|уравнен/.test(t))
    return ic(<><rect x={3} y={4} width={18} height={16} rx={2}/><line x1={8} y1={10} x2={16} y2={10}/><line x1={8} y1={14} x2={13} y2={14}/></>);
  if (/интерпрет|значени|шкал|класс|оцен|стади|групп|класс/.test(t))
    return ic(<><line x1={12} y1={20} x2={12} y2={10}/><line x1={18} y1={20} x2={18} y2={4}/><line x1={6} y1={20} x2={6} y2={16}/></>);
  if (/тактик|лечени|терапи|алгоритм|действи|ведени/.test(t))
    return ic(<><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></>);
  if (/преимущ|сравнени|альтернатив|vs/.test(t))
    return ic(<><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></>);
  if (/ограничени|противопоказ|предостер|ошиб|не работ/.test(t))
    return ic(<><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1={12} y1={9} x2={12} y2={13}/><line x1={12} y1={17} x2={12.01} y2={17}/></>);
  if (/связ|допол|дальше|итог|зам/.test(t))
    return ic(<><circle cx={12} cy={12} r={10}/><line x1={8} y1={12} x2={16} y2={12}/><line x1={12} y1={8} x2={12} y2={16}/></>);
  if (/критер|компонент|ключев|состав/.test(t))
    return ic(<><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></>);
  if (/возбуд|инфекц|микро|бактер|вирус/.test(t))
    return ic(<><circle cx={12} cy={12} r={4}/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/></>);
  if (/педиатр|дет/.test(t))
    return ic(<><circle cx={12} cy={8} r={4}/><path d="M6 22v-3c0-2 2-4 6-4s6 2 6 4v3"/></>);
  if (/беремен|акушер/.test(t))
    return ic(<><circle cx={12} cy={7} r={3}/><path d="M9 22c0-5 1-8 3-8s3 3 3 8"/></>);
  if (/мониторинг|контрол|отслеж/.test(t))
    return ic(<><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></>);
  if (/профилакт|предупрежд/.test(t))
    return ic(<><path d="M12 2l9 4v6c0 5.5-4 10-9 10S3 17.5 3 12V6z"/></>);
  // default: document
  return ic(<><rect x={4} y={3} width={16} height={18} rx={2}/><line x1={8} y1={9} x2={16} y2={9}/><line x1={8} y1={13} x2={16} y2={13}/><line x1={8} y1={17} x2={12} y2={17}/></>);
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
function IconCalculator() {
  return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><rect x={4} y={2} width={16} height={20} rx={2}/><line x1={8} y1={6} x2={16} y2={6}/><line x1={8} y1={10} x2={8} y2={10}/><line x1={12} y1={10} x2={12} y2={10}/><line x1={16} y1={10} x2={16} y2={10}/><line x1={8} y1={14} x2={8} y2={14}/><line x1={12} y1={14} x2={12} y2={14}/><line x1={16} y1={14} x2={16} y2={14}/><line x1={8} y1={18} x2={8} y2={18}/><line x1={12} y1={18} x2={12} y2={18}/><line x1={16} y1={18} x2={16} y2={18}/></svg>;
}
function IconSparkle() {
  return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.9 5.8L20 10.7l-5 3.6L16.5 21 12 17.5 7.5 21 9 14.3 4 10.7l6.1-1.9L12 3z"/></svg>;
}

/* ════════════════ atoms ════════════════ */

function shortRef(ref: string): string {
  const s = ref.split('.')[0];
  return s.length > 50 ? s.slice(0, 50) + '…' : s;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{
      fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
      color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
      marginBottom: 14, marginTop: 0,
    }}>
      {children}
    </h3>
  );
}

function Header({ tool, kind }: { tool: { title: string; subcategory: string; category: string; description?: string }; kind?: string }) {
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
      К каталогу инструментов
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
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
    }}>
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

function InputField({ input, value, onChange }: {
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
    return (
      <div>
        <LabelWithHint label={input.label} hint={input.hint} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {input.options.map((opt) => {
            const selected = String(value) === String(opt.value);
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => onChange(opt.value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px',
                  background: selected ? '#E8E9ED' : '#F5F6F8',
                  border: 'none',
                  borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'var(--font-body)', fontSize: 14, color: '#1A1A1A',
                  transition: 'background 150ms',
                }}
              >
                <span style={{
                  width: 18, height: 18, borderRadius: '50%',
                  background: '#FFFFFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {selected && (
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
    );
  }

  // Number input — borderless filled
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
        placeholder={input.hint || ''}
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
    </div>
  );
}
