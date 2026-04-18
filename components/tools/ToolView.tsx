'use client';

import { useState, useMemo, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CATALOG_TOOLS } from '@/lib/tools-catalog';
import { getRunner, findBand, type ToolInput, type Preset } from '@/lib/tools-runners';
import { useAppStore } from '@/lib/store';
import { ArrowLeft } from '@/components/icons';

/** Slugify heading text for tab id */
function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-zа-я0-9]+/gi, '-').replace(/^-+|-+$/g, '');
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
  const { closeTool } = useAppStore();
  const tool = useMemo(() => CATALOG_TOOLS.find((t) => t.id === toolId), [toolId]);
  const runner = useMemo(() => getRunner(toolId), [toolId]);

  const tabs: Tab[] = useMemo(() => {
    if (!runner) return [];
    const calcTab: Tab = {
      id: 'calculator',
      title: runner.kind === 'score' ? 'Шкала' : 'Калькулятор',
      short: runner.kind === 'score' ? 'Шкала' : 'Калькулятор',
      iconKey: 'calc',
      kind: 'calculator',
    };
    const infoTabs: Tab[] = runner.info ? buildInfoTabs(runner.info) : [];
    const referenceTab: Tab = {
      id: 'reference',
      title: 'Источник',
      short: 'Источник',
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

  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];
  const activeIndex = tabs.indexOf(active);
  const prevTab = tabs[activeIndex - 1];
  const nextTab = tabs[activeIndex + 1];

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
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Top header — back + tags + title + description + InfoPills */}
      <BackButton onClick={closeTool} />
      <Header tool={tool} kind={kindLabel} />
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16, marginBottom: 20 }}>
        <InfoPill icon={<IconBolt />} label="Тип" value={kindLabel} />
        <InfoPill icon={<IconTag />} label="Раздел" value={tool.subcategory} />
        <InfoPill icon={<IconBook />} label="Источник" value={shortRef(runner.reference)} />
      </div>

      {/* Main grid: content card (left) + TOC sidebar (right) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 260px',
        gap: 24,
        alignItems: 'start',
      }}>
        {/* LEFT: tab content card */}
        <div key={active.id} style={{
          background: '#FFFFFF',
          borderRadius: 'var(--md-sys-shape-corner-extra-large, 24px)',
          padding: '28px 32px',
          minHeight: 360,
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        }}>
          {/* Tab header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            marginBottom: 20, paddingBottom: 16,
            borderBottom: '1px solid #F0F1F5',
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
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {active.body}
              </ReactMarkdown>
            </div>
          )}

          {active.kind === 'reference' && (
            <div className="lesson-content tool-info">
              <p style={{ marginBottom: 12 }}>
                <strong>Источник и клиническая валидация:</strong>
              </p>
              <p>{runner.reference}</p>
              <p style={{ marginTop: 20, color: '#6B7280', fontSize: 13 }}>
                Все пороги, формулы и рекомендации приведены в соответствии с актуальными
                международными гайдлайнами. Инструмент не заменяет клиническое суждение врача.
              </p>
            </div>
          )}

          {/* Prev / Next */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', gap: 12,
            marginTop: 32, paddingTop: 20,
            borderTop: '1px solid #F0F1F5',
          }}>
            {prevTab ? (
              <NavButton onClick={() => setActiveId(prevTab.id)} label={prevTab.short} dir="prev" />
            ) : <span />}
            {nextTab ? (
              <NavButton onClick={() => setActiveId(nextTab.id)} label={nextTab.short} dir="next" primary />
            ) : null}
          </div>
        </div>

        {/* RIGHT: sidebar — "Содержание" */}
        <aside style={{
          position: 'sticky', top: 20,
          background: '#F5F6F8',
          borderRadius: 'var(--md-sys-shape-corner-extra-large, 24px)',
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
          {tabs.map((t) => {
            const isActive = t.id === active.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveId(t.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px',
                  background: isActive ? '#1A1A1A' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#333',
                  border: 'none', borderRadius: 10,
                  cursor: 'pointer', textAlign: 'left',
                  fontFamily: 'var(--font-body)', fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 150ms ease',
                  width: '100%',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#E8E9ED'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{
                  display: 'flex', flexShrink: 0,
                  color: isActive ? '#FFF' : '#6B7280',
                }}>
                  <TabIcon name={t.iconKey} size={16} />
                </span>
                <span style={{
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  minWidth: 0, flex: 1,
                }}>
                  {t.short}
                </span>
              </button>
            );
          })}
        </aside>
      </div>
    </div>
  );
}

/* ════════════════ Calculator body ════════════════ */

function CalculatorBody({ inputs, values, setValues, result, presets }: {
  inputs: ToolInput[];
  values: Record<string, number | boolean | string>;
  setValues: React.Dispatch<React.SetStateAction<Record<string, number | boolean | string>>>;
  result: { value: string; unit?: string; interpretation: string; color: string } | null;
  presets?: Preset[];
}) {
  const applyPreset = (preset: Preset) => {
    setValues((prev) => ({ ...prev, ...preset.values }));
  };
  const resetAll = () => {
    const cleared: Record<string, number | boolean | string> = {};
    for (const inp of inputs) {
      if (inp.type === 'checkbox') cleared[inp.id] = false;
      else if (inp.type === 'select' && inp.options?.[0]) cleared[inp.id] = inp.options[0].value;
      else if (inp.type === 'number') cleared[inp.id] = '' as unknown as number;
    }
    setValues(cleared);
  };

  return (
    <div>
      {/* Presets row */}
      {presets && presets.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
              color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              Быстрый пример
            </span>
            <button
              onClick={resetAll}
              style={{
                marginLeft: 'auto',
                fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 500,
                color: '#9CA3AF', background: 'transparent',
                border: 'none', cursor: 'pointer', padding: '2px 6px',
                borderRadius: 6,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#1A1A1A'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF'; }}
              title="Очистить все поля"
            >
              Очистить
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {presets.map((preset, i) => (
              <button
                key={i}
                onClick={() => applyPreset(preset)}
                style={{
                  padding: '6px 12px',
                  background: '#F5F6F8',
                  color: '#1A1A1A',
                  border: 'none', borderRadius: 999,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500,
                  transition: 'background 150ms',
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#E8E9ED'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#F5F6F8'; }}
              >
                <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="13 17 18 12 13 7"/>
                  <polyline points="6 17 11 12 6 7"/>
                </svg>
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {inputs.map((inp) => (
          <InputField
            key={inp.id}
            input={inp}
            value={values[inp.id]}
            onChange={(v) => setValues((prev) => ({ ...prev, [inp.id]: v }))}
          />
        ))}
      </div>

      {result && (
        <div style={{
          marginTop: 24,
          padding: '20px 24px',
          borderRadius: 16,
          background: `${result.color}0F`,
          borderLeft: `4px solid ${result.color}`,
        }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            color: result.color, textTransform: 'uppercase', letterSpacing: '0.1em',
            margin: 0, marginBottom: 10,
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
            lineHeight: 1.6, fontWeight: 500, margin: 0,
          }}>
            {result.interpretation}
          </p>
        </div>
      )}
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
        background: primary ? '#1A1A1A' : '#F5F6F8',
        color: primary ? '#FFFFFF' : '#1A1A1A',
        border: 'none', borderRadius: 10,
        cursor: 'pointer',
        fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: primary ? 600 : 500,
        transition: 'background 180ms',
        maxWidth: '50%',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = primary ? '#000000' : '#EFF1F4';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = primary ? '#1A1A1A' : '#F5F6F8';
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

function shortRef(ref: string): string {
  const s = ref.split('.')[0];
  return s.length > 50 ? s.slice(0, 50) + '…' : s;
}

function Header({ tool, kind }: {
  tool: { title: string; subcategory: string; category: string; description?: string };
  kind?: string;
}) {
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

function IconBolt() {
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
}
function IconTag() {
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1={7} y1={7} x2={7.01} y2={7}/></svg>;
}
function IconBook() {
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>;
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
