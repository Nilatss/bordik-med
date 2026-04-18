'use client';

import { useState, useMemo, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CATALOG_TOOLS } from '@/lib/tools-catalog';
import { getRunner, findBand, type ToolInput } from '@/lib/tools-runners';
import { useAppStore } from '@/lib/store';
import { ArrowLeft } from '@/components/icons';

export default function ToolView({ toolId }: { toolId: string }) {
  const { closeTool } = useAppStore();
  const tool = useMemo(() => CATALOG_TOOLS.find((t) => t.id === toolId), [toolId]);
  const runner = useMemo(() => getRunner(toolId), [toolId]);
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
      <div style={{ display: 'flex', flexDirection: 'column' }}>
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
    <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 760 }}>
      <BackButton onClick={closeTool} />
      <Header tool={tool} kind={kindLabel} />

      {/* InfoPills row — like CourseHeader */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16, marginBottom: 28 }}>
        <InfoPill
          icon={
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
            </svg>
          }
          label="Тип"
          value={kindLabel}
        />
        <InfoPill
          icon={
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
          label="Раздел"
          value={tool.subcategory}
        />
        <InfoPill
          icon={
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 6.253v13M12 6.253C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
          label="Источник"
          value={shortRef(runner.reference)}
        />
      </div>

      {/* Section: Calculator */}
      <SectionLabel>Калькулятор</SectionLabel>
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 10,
        marginBottom: result ? 16 : 28,
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

      {result && (
        <div style={{
          padding: '20px 24px',
          borderRadius: 16,
          background: `${result.color}10`,
          marginBottom: 28,
        }}>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            color: result.color, textTransform: 'uppercase', letterSpacing: '0.08em',
            marginBottom: 8,
          }}>
            Результат
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 800,
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
            marginTop: 12,
            fontFamily: 'var(--font-body)', fontSize: 14, color: '#1A1A1A',
            lineHeight: 1.55, fontWeight: 500,
          }}>
            {result.interpretation}
          </p>
        </div>
      )}

      {/* Article-like info content */}
      {runner.info && (
        <>
          <SectionLabel>Клиническая справка</SectionLabel>
          <div style={{ maxWidth: 'var(--content-max)' }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
              {runner.info}
            </ReactMarkdown>
          </div>
        </>
      )}

      {/* Reference */}
      <div style={{
        marginTop: 24, paddingTop: 20,
        background: '#F5F6F8', borderRadius: 12, padding: '14px 18px',
        fontFamily: 'var(--font-body)', fontSize: 12, color: '#6B7280',
        lineHeight: 1.55,
      }}>
        <strong style={{ color: '#374151', fontWeight: 700 }}>Источник:</strong> {runner.reference}
      </div>
    </div>
  );
}

/* ════════════════ Markdown renderer (professional clinical-style) ════════════════ */

/** Pick an icon by heading text */
function headingIcon(text: string): React.ReactNode {
  const t = text.toLowerCase();
  const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const ic = (path: React.ReactNode) => (
    <svg width={16} height={16} viewBox="0 0 24 24" {...stroke}>{path}</svg>
  );
  if (/что (с|п)|описание/.test(t))           return ic(<><circle cx={12} cy={12} r={10}/><line x1={12} y1={16} x2={12} y2={12}/><line x1={12} y1={8} x2={12.01} y2={8}/></>);
  if (/когда|применени|показани/.test(t))      return ic(<><circle cx={12} cy={12} r={10}/><polyline points="12,6 12,12 16,14"/></>);
  if (/формул|расч/.test(t))                   return ic(<><rect x={4} y={4} width={16} height={16} rx={2}/><line x1={9} y1={9} x2={15} y2={15}/><line x1={15} y1={9} x2={9} y2={15}/></>);
  if (/интерпрет|значени|шкал|стади|групп/.test(t)) return ic(<><line x1={12} y1={20} x2={12} y2={10}/><line x1={18} y1={20} x2={18} y2={4}/><line x1={6} y1={20} x2={6} y2={16}/></>);
  if (/тактик|лечени|терапи|алгоритм|действи/.test(t)) return ic(<><path d="M9 11H1l8-8 8 8h-8v8z"/></>);
  if (/преимущ|сравнени|альтернатив/.test(t)) return ic(<><polyline points="3,17 9,11 13,15 21,7"/><polyline points="14,7 21,7 21,14"/></>);
  if (/ограничени|противопоказ/.test(t))       return ic(<><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1={12} y1={9} x2={12} y2={13}/><line x1={12} y1={17} x2={12.01} y2={17}/></>);
  if (/связ|допол|дальше|итог|зам/.test(t))    return ic(<><line x1={10} y1={13} x2={14} y2={11}/><line x1={10} y1={11} x2={14} y2={13}/><circle cx={12} cy={12} r={10}/></>);
  if (/критер|компонент|критич|ключев/.test(t))return ic(<><polyline points="9,11 12,14 22,4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></>);
  if (/возбуд|инфекц|микро/.test(t))           return ic(<><circle cx={12} cy={12} r={4}/><line x1={12} y1={2} x2={12} y2={5}/><line x1={12} y1={19} x2={12} y2={22}/><line x1={2} y1={12} x2={5} y2={12}/><line x1={19} y1={12} x2={22} y2={12}/></>);
  return ic(<><rect x={3} y={4} width={18} height={18} rx={2}/><line x1={3} y1={10} x2={21} y2={10}/></>);
}

const mdComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h2 style={{
      fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
      color: '#1A1A1A', letterSpacing: '-0.01em', marginTop: 28, marginBottom: 12,
    }}>{children}</h2>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h3 style={{
      fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
      color: '#1A1A1A', letterSpacing: '-0.01em', marginTop: 24, marginBottom: 10,
    }}>{children}</h3>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => {
    const txt = String(Array.isArray(children) ? children.join('') : children || '');
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginTop: 24, marginBottom: 12,
        color: '#1A1A1A',
      }}>
        <span style={{
          width: 28, height: 28, borderRadius: 8,
          background: '#F5F6F8', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#374151', flexShrink: 0,
        }}>
          {headingIcon(txt)}
        </span>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700,
          letterSpacing: '-0.005em',
        }}>{children}</span>
      </div>
    );
  },
  h4: ({ children }: { children?: React.ReactNode }) => (
    <h5 style={{
      fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700,
      color: '#374151', marginTop: 16, marginBottom: 6,
    }}>{children}</h5>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p style={{
      fontFamily: 'var(--font-body)', fontSize: 14, color: '#1A1A1A',
      lineHeight: 1.65, marginBottom: 12,
    }}>{children}</p>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong style={{ color: '#1A1A1A', fontWeight: 700 }}>{children}</strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => (
    <em style={{ color: '#374151', fontStyle: 'italic' }}>{children}</em>
  ),
  a: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
    <a href={href} target="_blank" rel="noreferrer"
      style={{
        color: '#1A1A1A', textDecoration: 'underline', textDecorationColor: '#9CA3AF',
        textDecorationThickness: 1, textUnderlineOffset: 3,
      }}>{children}</a>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="tool-md-ul">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="tool-md-ol">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="tool-md-li">{children}</li>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <div style={{
      margin: '14px 0',
      padding: '14px 18px',
      background: '#FFF7E6',
      borderRadius: 12,
      color: '#7A4F00',
      fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.6,
    }}>{children}</div>
  ),
  code: ({ children, inline }: { children?: React.ReactNode; inline?: boolean }) => {
    if (inline) return (
      <code style={{
        fontFamily: 'var(--font-mono)', fontSize: 13,
        padding: '2px 6px', borderRadius: 5,
        background: '#F0F1F5', color: '#1A1A1A',
      }}>{children}</code>
    );
    return (
      <pre style={{
        background: '#0F1115', color: '#E5E7EB',
        padding: '14px 18px', borderRadius: 12,
        fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.5,
        overflow: 'auto', margin: '12px 0',
      }}>
        <code>{children}</code>
      </pre>
    );
  },
  hr: () => <div style={{ height: 1, background: '#F0F1F5', margin: '20px 0' }} />,
  table: ({ children }: { children?: React.ReactNode }) => (
    <div style={{
      margin: '14px 0',
      background: '#FFFFFF',
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: '0 0 0 1px #F0F1F5',
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%', borderCollapse: 'collapse',
          fontFamily: 'var(--font-body)', fontSize: 13,
        }}>{children}</table>
      </div>
    </div>
  ),
  thead: ({ children }: { children?: React.ReactNode }) => (
    <thead style={{ background: '#F5F6F8' }}>{children}</thead>
  ),
  tr: ({ children }: { children?: React.ReactNode }) => (
    <tr style={{ borderBottom: '1px solid #F0F1F5' }}>{children}</tr>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th style={{
      padding: '10px 14px', textAlign: 'left',
      fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
      color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>{children}</th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td style={{
      padding: '10px 14px',
      fontFamily: 'var(--font-body)', fontSize: 13,
      color: '#1A1A1A', lineHeight: 1.5,
      verticalAlign: 'top',
    }}>{children}</td>
  ),
};

/* ════════════════ atoms ════════════════ */

function shortRef(ref: string): string {
  // First sentence or first 50 chars
  const s = ref.split('.')[0];
  return s.length > 50 ? s.slice(0, 50) + '…' : s;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{
      fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
      color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
      marginBottom: 12,
    }}>
      {children}
    </h3>
  );
}

function Header({ tool, kind }: { tool: { title: string; subcategory: string; category: string }; kind?: string }) {
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
      {tool && (
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: 'var(--md-sys-color-on-surface-variant)',
          maxWidth: 'var(--content-max)',
          lineHeight: 1.6,
        }}>
          {(tool as { description?: string }).description}
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

/* ════════════════ Inputs (BORDERLESS — filled style) ════════════════ */

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

  // Number — borderless filled input
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
