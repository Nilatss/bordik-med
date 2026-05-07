'use client';

/**
 * Neonatal Handbook — 127 препаратов NICU dosing reference.
 * Источник: "Neonatal Dosage and Practical Guidelines Handbook 2nd Ed."
 * (Saudi Arabia, 2016) — Saleh Al-Alaiyan, Najwa Al-Ghamdi.
 *
 * UX: список препаратов с поиском + раскрываемая monograph card.
 * Каждая карточка содержит: brand, indications, dose с разбивкой по
 * gestational age, route, levels/metabolism, precautions, extemporaneous.
 *
 * Поскольку PDF column layout не позволяет 100% structured parsing,
 * UI gracefully показывает то что есть + fallback на full raw text.
 */

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Drug {
  id: string;
  name_en: string;
  name_ru: string;
  brand: string;
  indications: string;
  dose: string;
  route: string;
  levels: string;
  precautions: string;
  extemporaneous: string;
  fullText: string;
}

interface Bank {
  version: string;
  lastUpdated: string;
  source: string;
  authors: string[];
  license: string;
  drugs: Drug[];
}

interface Guideline {
  id: string;
  title_en: string;
  title_ru: string;
  content: string;
  references: string[];
}

interface GuidelinesBank {
  version: string;
  lastUpdated: string;
  source: string;
  guidelines: Guideline[];
}

type Tab = 'drugs' | 'guidelines';

export default function NeonatalHandbook() {
  const [bank, setBank] = useState<Bank | null>(null);
  const [guidelines, setGuidelines] = useState<GuidelinesBank | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('drugs');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [drugsR, guidelinesR] = await Promise.all([
          fetch('/neonatal-monographs.json?v=1.0.0', { cache: 'force-cache' }),
          fetch('/neonatal-guidelines.json?v=1.0.0', { cache: 'force-cache' }),
        ]);
        if (!drugsR.ok) throw new Error(`monographs ${drugsR.status}`);
        const drugsJson = await drugsR.json();
        const guidesJson = guidelinesR.ok ? await guidelinesR.json() : null;
        if (!cancelled) {
          setBank(drugsJson as Bank);
          if (guidesJson) setGuidelines(guidesJson as GuidelinesBank);
        }
      } catch (e) {
        if (!cancelled) setError((e as Error).message ?? 'load failed');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filteredDrugs = useMemo(() => {
    if (!bank) return [];
    const query = q.trim().toLowerCase();
    if (!query) return bank.drugs;
    return bank.drugs.filter((d) =>
      d.name_en.toLowerCase().includes(query)
      || d.name_ru.toLowerCase().includes(query)
      || d.brand.toLowerCase().includes(query)
      || d.fullText.toLowerCase().includes(query)
    );
  }, [bank, q]);

  const filteredGuidelines = useMemo(() => {
    if (!guidelines) return [];
    const query = q.trim().toLowerCase();
    if (!query) return guidelines.guidelines;
    return guidelines.guidelines.filter((g) =>
      g.title_en.toLowerCase().includes(query)
      || g.title_ru.toLowerCase().includes(query)
      || g.content.toLowerCase().includes(query)
    );
  }, [guidelines, q]);

  if (error) {
    return (
      <main style={{ padding: '24px', maxWidth: 980, margin: '0 auto' }}>
        <div style={{
          padding: 24, borderRadius: 12, background: '#FEF2F2',
          border: '1px solid #FECACA', color: '#991B1B', fontSize: 14,
        }}>
          Не удалось загрузить справочник: {error}.
        </div>
      </main>
    );
  }

  if (!bank) {
    return (
      <main style={{ padding: '24px', maxWidth: 980, margin: '0 auto' }}>
        <div style={{ padding: '8px 0' }}>
          <div className="lc-shimmer" style={{ height: 32, width: 280, borderRadius: 8, marginBottom: 16 }} />
          <div className="lc-shimmer" style={{ height: 16, width: '70%', borderRadius: 6, marginBottom: 24 }} />
          <div className="lc-shimmer" style={{ height: 48, width: '100%', borderRadius: 12, marginBottom: 12 }} />
          <div className="lc-shimmer" style={{ height: 64, width: '100%', borderRadius: 12 }} />
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" style={{
      padding: 0,
      fontFamily: 'var(--font-body, system-ui)',
      color: 'var(--md-sys-color-on-surface, #1A1A1A)',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1] }}
        style={{ marginBottom: 24 }}
      >
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700,
          color: '#101010', margin: '0 0 8px', letterSpacing: '-0.02em',
        }}>
          Неонатология — справочник доз
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280', margin: 0, maxWidth: 720, lineHeight: 1.55 }}>
          {bank.drugs.length} препаратов NICU с дозированием по гестационному возрасту,
          путём введения, метаболизмом и предостережениями. Источник:{' '}
          <em>{bank.source}</em>.
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1], delay: 0.06 }}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 16px',
          background: '#F5F6F8',
          borderRadius: 12,
          maxWidth: 480,
          marginBottom: 18,
        }}
      >
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
          stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder='Например: «Ампициллин», «Caffeine», «Surfactant»…'
          aria-label="Поиск препарата"
          style={{
            flex: 1, background: 'transparent', border: 'none', outline: 'none',
            fontFamily: 'inherit', fontSize: 14, color: '#1A1A1A',
          }}
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ('')}
            aria-label="Очистить"
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: '#9CA3AF', fontSize: 16, padding: 0,
            }}
          >×</button>
        )}
      </motion.div>

      {/* Tabs: Препараты / Протоколы */}
      <div role="tablist" aria-label="Разделы" style={{
        display: 'flex', gap: 4, flexWrap: 'wrap',
        borderBottom: '1px solid #E5E7EB',
        marginBottom: 18, paddingBottom: 0,
        marginLeft: -14, marginRight: -14,
      }}>
        {([
          { id: 'drugs' as const, label: 'Препараты', count: bank.drugs.length },
          { id: 'guidelines' as const, label: 'Протоколы NICU', count: guidelines?.guidelines.length ?? 0 },
        ]).map((t) => {
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => { setTab(t.id); setOpenId(null); }}
              style={{
                position: 'relative',
                background: 'transparent',
                border: 'none',
                padding: '10px 14px',
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                fontFamily: 'inherit',
                color: isActive ? '#2563EB' : '#374151',
                cursor: 'pointer',
                borderBottom: isActive ? '2px solid #2563EB' : '2px solid transparent',
                marginBottom: -1,
                display: 'inline-flex', alignItems: 'center', gap: 6,
                transition: 'color 120ms',
              }}
            >
              <span>{t.label}</span>
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: isActive ? '#2563EB' : '#9CA3AF',
                opacity: isActive ? 0.85 : 0.7,
              }}>
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {tab === 'drugs' ? (
        <>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 14px' }}>
            Показано: <strong style={{ color: '#1A1A1A' }}>{filteredDrugs.length}</strong> из {bank.drugs.length}
          </p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            {filteredDrugs.map((d) => (
              <DrugCard
                key={d.id}
                drug={d}
                isOpen={openId === d.id}
                onToggle={() => setOpenId(openId === d.id ? null : d.id)}
              />
            ))}
            {filteredDrugs.length === 0 && (
              <div style={{
                padding: '32px 16px', background: '#F5F6F8', borderRadius: 12,
                textAlign: 'center', color: '#6B7280', fontSize: 14,
              }}>
                Ничего не найдено.
              </div>
            )}
          </motion.div>
        </>
      ) : (
        <>
          <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 14px' }}>
            Показано: <strong style={{ color: '#1A1A1A' }}>{filteredGuidelines.length}</strong> из {guidelines?.guidelines.length ?? 0}
          </p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            {filteredGuidelines.map((g) => (
              <GuidelineCard
                key={g.id}
                guideline={g}
                isOpen={openId === g.id}
                onToggle={() => setOpenId(openId === g.id ? null : g.id)}
              />
            ))}
            {filteredGuidelines.length === 0 && (
              <div style={{
                padding: '32px 16px', background: '#F5F6F8', borderRadius: 12,
                textAlign: 'center', color: '#6B7280', fontSize: 14,
              }}>
                Ничего не найдено.
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* Disclaimer */}
      <section style={{
        marginTop: 32, padding: '16px 18px',
        background: '#FFFBEB', border: '1px solid #FDE68A',
        borderRadius: 10, fontSize: 12, color: '#78350F', lineHeight: 1.55,
      }}>
        <strong>Не заменяет фарм-консультацию.</strong>{' '}
        Дозы у новорождённых критически зависят от гестационного возраста,
        дней жизни, веса, функции почек и печени. Решение по конкретному
        пациенту принимает врач/клин-фармаколог. Авторы исходного руководства:
        {' '}{bank.authors.join('; ')}.
      </section>
    </main>
  );
}

function DrugCard({
  drug, isOpen, onToggle,
}: {
  drug: Drug;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const showStructured = !!(drug.brand || drug.dose || drug.precautions);

  return (
    <div style={{
      background: '#F5F6F8',
      border: 'none',
      borderRadius: 14,
      overflow: 'hidden',
    }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 18px',
          background: 'transparent', border: 'none',
          cursor: 'pointer', textAlign: 'left',
          fontFamily: 'inherit',
          transition: 'background 150ms',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#EFF1F4'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            display: 'block', fontFamily: 'var(--font-display)',
            fontSize: 15, fontWeight: 700, color: '#1A1A1A',
            lineHeight: 1.35, letterSpacing: '-0.01em',
          }}>
            {drug.name_ru}
            {drug.name_en !== drug.name_ru && (
              <span style={{ fontWeight: 400, color: '#6B7280', marginLeft: 6 }}>
                ({drug.name_en})
              </span>
            )}
          </span>
        </span>
        <span style={{
          color: '#6B7280',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 200ms',
        }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.25, ease: [0.05, 0.7, 0.1, 1] },
              opacity: { duration: 0.18 },
            }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              borderTop: '1px solid #E5E7EB',
              background: '#FFFFFF',
            }}>
              {showStructured ? (
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 13, color: '#374151', lineHeight: 1.55,
                }}>
                  <tbody>
                    {drug.brand && (
                      <DrugDetailRow label="Бренд" labelEn="Brand Name" value={drug.brand} mono />
                    )}
                    {drug.indications && (
                      <DrugDetailRow label="Показания" labelEn="Indications" value={drug.indications} />
                    )}
                    {drug.dose && (
                      <DrugDetailRow label="Доза" labelEn="Dose" value={drug.dose} bold />
                    )}
                    {drug.route && (
                      <DrugDetailRow label="Путь" labelEn="Route" value={drug.route} mono />
                    )}
                    {drug.levels && (
                      <DrugDetailRow label="Метаболизм" labelEn="Levels & Metabolism" value={drug.levels} />
                    )}
                    {drug.precautions && (
                      <DrugDetailRow label="Предосторожности" labelEn="Precautions" value={drug.precautions} tone="warning" />
                    )}
                    {drug.extemporaneous && (
                      <DrugDetailRow label="Приготовление" labelEn="Extemporaneous" value={drug.extemporaneous} last />
                    )}
                  </tbody>
                </table>
              ) : (
                /* Если структурированных полей нет — показываем raw монограф
                 * как fallback (без дублирования). */
                <div style={{
                  padding: '14px 18px',
                  fontSize: 13, lineHeight: 1.6, color: '#374151',
                  whiteSpace: 'pre-wrap',
                }}>
                  {drug.fullText}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Bordik-style таблица: th-label слева, td-value справа.
 *  Идентична DetailRow в DrugChecker — единый стиль. */
function DrugDetailRow({
  label, labelEn, value, bold, mono, tone = 'neutral', last,
}: {
  label: string;
  labelEn?: string;
  value: string;
  bold?: boolean;
  mono?: boolean;
  tone?: 'neutral' | 'warning';
  last?: boolean;
}) {
  const cellStyle: React.CSSProperties = {
    padding: '12px 18px',
    borderBottom: last ? 'none' : '1px solid #F0F1F5',
    verticalAlign: 'top',
    background: tone === 'warning' ? '#FFFBEB' : '#FFFFFF',
  };
  return (
    <tr>
      <th
        scope="row"
        style={{
          ...cellStyle,
          width: 160,
          textAlign: 'left',
          fontFamily: 'var(--font-mono, ui-monospace)',
          fontSize: 11, fontWeight: 700,
          color: tone === 'warning' ? '#92400E' : '#9CA3AF',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        <div>{label}</div>
        {labelEn && (
          <div style={{ marginTop: 2, fontSize: 10, fontWeight: 500, textTransform: 'none', letterSpacing: 0, opacity: 0.7 }}>
            {labelEn}
          </div>
        )}
      </th>
      <td style={{
        ...cellStyle,
        fontWeight: bold ? 600 : 400,
        fontFamily: mono ? 'var(--font-mono, ui-monospace)' : 'inherit',
        color: tone === 'warning' ? '#78350F' : '#374151',
      }}>
        {value}
      </td>
    </tr>
  );
}

type Block =
  | { kind: 'step'; text: string }
  | { kind: 'heading'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'formula'; text: string }
  | { kind: 'para'; text: string };

// Replace broken PDF glyphs (U+FFFD and similar) with a neutral placeholder.
// Original handbook used ÷, ×, →, − that pdftotext could not decode.
function sanitizePdfText(s: string): string {
  return s
    .replace(/�/g, '÷')      // best-guess: most � appear in division formulas
    .replace(/ /g, '')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function isFormulaLine(s: string): boolean {
  // Lines with blanks, equals signs, or unit ratios — render in mono.
  return /_{2,}|\b(mg|mcg|mL|kg|g)\/(kg|day|min|hr|hour|mL)|=|×|÷/.test(s);
}

function parseGuidelineContent(raw: string): Block[] {
  const lines = raw.split('\n').map((l) => sanitizePdfText(l));
  const chunks: string[][] = [];
  let cur: string[] = [];
  for (const line of lines) {
    if (!line) {
      if (cur.length) { chunks.push(cur); cur = []; }
    } else {
      cur.push(line);
    }
  }
  if (cur.length) chunks.push(cur);

  const blocks: Block[] = [];
  const bulletRe = /^\s*(?:[-•*·]|\d+[.)]|[a-z][.)])\s+/i;
  const stepRe = /^STEP\s+(ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN|\d+)\b/i;

  for (const chunk of chunks) {
    // Step heading like "STEP ONE" possibly with trailing words.
    if (chunk.length === 1 && chunk[0] && stepRe.test(chunk[0])) {
      blocks.push({ kind: 'step', text: chunk[0] });
      continue;
    }

    const allBullet = chunk.every((l) => bulletRe.test(l));
    if (allBullet && chunk.length >= 2) {
      blocks.push({ kind: 'list', items: chunk.map((l) => l.replace(bulletRe, '').trim()) });
      continue;
    }

    // Multi-line formula block: every line looks like a formula.
    if (chunk.length >= 1 && chunk.every(isFormulaLine)) {
      blocks.push({ kind: 'formula', text: chunk.join('\n') });
      continue;
    }

    const joined = chunk.join(' ').replace(/\s+/g, ' ').trim();
    const isHeading =
      chunk.length === 1 &&
      joined.length <= 80 &&
      (joined === joined.toUpperCase() || /:$/.test(joined)) &&
      !isFormulaLine(joined);
    if (isHeading) {
      blocks.push({ kind: 'heading', text: joined.replace(/:$/, '') });
      continue;
    }

    blocks.push({ kind: 'para', text: joined });
  }
  return blocks;
}

function GuidelineContent({ content }: { content: string }) {
  const blocks = parseGuidelineContent(content);
  return (
    <div style={{ fontSize: 13, lineHeight: 1.6, color: '#374151' }}>
      {blocks.map((b, i) => {
        if (b.kind === 'step') {
          return (
            <div key={i} style={{
              marginTop: i === 0 ? 0 : 18, marginBottom: 10,
              padding: '6px 10px',
              background: '#F3F4F6',
              borderLeft: '3px solid #6B7280',
              borderRadius: 4,
              fontFamily: 'var(--font-mono, ui-monospace)',
              fontSize: 11, fontWeight: 700,
              color: '#111827',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}>
              {b.text}
            </div>
          );
        }
        if (b.kind === 'heading') {
          return (
            <div key={i} style={{
              marginTop: i === 0 ? 0 : 14, marginBottom: 6,
              fontFamily: 'var(--font-display)',
              fontSize: 13, fontWeight: 700, color: '#111827',
              letterSpacing: '-0.005em',
            }}>
              {b.text}
            </div>
          );
        }
        if (b.kind === 'list') {
          return (
            <ul key={i} style={{
              margin: '0 0 12px', paddingLeft: 20,
              fontSize: 13, lineHeight: 1.6, color: '#374151',
            }}>
              {b.items.map((it, j) => (
                <li key={j} style={{ marginBottom: 4 }}>{it}</li>
              ))}
            </ul>
          );
        }
        if (b.kind === 'formula') {
          return (
            <pre key={i} style={{
              margin: '0 0 12px',
              padding: '10px 12px',
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: 8,
              fontFamily: 'var(--font-mono, ui-monospace)',
              fontSize: 12, lineHeight: 1.7,
              color: '#1F2937',
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}>
              {b.text}
            </pre>
          );
        }
        return (
          <p key={i} style={{
            margin: '0 0 10px',
            fontSize: 13, lineHeight: 1.6, color: '#374151',
          }}>
            {b.text}
          </p>
        );
      })}
    </div>
  );
}

function GuidelineCard({
  guideline, isOpen, onToggle,
}: {
  guideline: Guideline;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div style={{
      background: '#F5F6F8',
      border: 'none',
      borderRadius: 14,
      overflow: 'hidden',
    }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'flex-start', gap: 14,
          padding: '14px 18px',
          background: 'transparent', border: 'none',
          cursor: 'pointer', textAlign: 'left',
          fontFamily: 'inherit',
          transition: 'background 150ms',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#EFF1F4'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            display: 'block',
            fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
            color: '#111827', letterSpacing: '-0.01em', lineHeight: 1.35,
          }}>
            {guideline.title_ru}
          </span>
          {guideline.title_en !== guideline.title_ru && (
            <span style={{
              display: 'block', marginTop: 3, fontSize: 12, color: '#6B7280',
            }}>
              {guideline.title_en}
            </span>
          )}
        </span>
        <span style={{
          flexShrink: 0,
          color: '#9CA3AF',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 200ms',
          marginTop: 4,
        }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.25, ease: [0.05, 0.7, 0.1, 1] },
              opacity: { duration: 0.18 },
            }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: '18px 20px 20px',
              background: '#FFFFFF',
              borderTop: '1px solid #E5E7EB',
            }}>
              <GuidelineContent content={guideline.content} />
              {guideline.references.length > 0 && (
                <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid #E5E7EB' }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
                    textTransform: 'uppercase', color: '#9CA3AF', marginBottom: 8,
                  }}>
                    References
                  </div>
                  <ol style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: '#6B7280', lineHeight: 1.55 }}>
                    {guideline.references.map((ref, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>{ref}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

