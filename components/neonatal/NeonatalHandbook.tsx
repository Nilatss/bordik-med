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

export default function NeonatalHandbook() {
  const [bank, setBank] = useState<Bank | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const r = await fetch('/neonatal-monographs.json?v=1.0.0', { cache: 'force-cache' });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json();
        if (!cancelled) setBank(json as Bank);
      } catch (e) {
        if (!cancelled) setError((e as Error).message ?? 'load failed');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
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

      <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 14px' }}>
        Показано: <strong style={{ color: '#1A1A1A' }}>{filtered.length}</strong> из {bank.drugs.length}
      </p>

      {/* Drug list */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.12 }}
        style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
      >
        {filtered.map((d) => (
          <DrugCard
            key={d.id}
            drug={d}
            isOpen={openId === d.id}
            onToggle={() => setOpenId(openId === d.id ? null : d.id)}
          />
        ))}
        {filtered.length === 0 && (
          <div style={{
            padding: '32px 16px', background: '#F5F6F8', borderRadius: 12,
            textAlign: 'center', color: '#6B7280', fontSize: 14,
          }}>
            Ничего не найдено.
          </div>
        )}
      </motion.div>

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
      background: '#FFFFFF',
      border: '1px solid #F0F1F5',
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
        onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFBFC'; }}
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
          {drug.brand && (
            <span style={{ display: 'block', marginTop: 2, fontSize: 12, color: '#9CA3AF' }}>
              Brand: {drug.brand}
            </span>
          )}
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
              padding: '14px 18px 18px',
              background: '#FAFBFC',
              borderTop: '1px solid #F0F1F5',
              fontSize: 13, lineHeight: 1.6, color: '#374151',
              display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              {showStructured && drug.indications && (
                <Section label="Показания">{drug.indications}</Section>
              )}
              {showStructured && drug.dose && (
                <Section label="Доза">{drug.dose}</Section>
              )}
              {showStructured && drug.route && (
                <Section label="Путь введения">{drug.route}</Section>
              )}
              {showStructured && drug.levels && (
                <Section label="Levels and Metabolism">{drug.levels}</Section>
              )}
              {showStructured && drug.precautions && (
                <Section label="Precautions" tone="warning">{drug.precautions}</Section>
              )}
              {showStructured && drug.extemporaneous && (
                <Section label="Extemporaneous Preparation">{drug.extemporaneous}</Section>
              )}

              {/* Always show full raw text as fallback / verification */}
              <details>
                <summary style={{
                  fontSize: 11, color: '#9CA3AF', cursor: 'pointer',
                  fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                  Полный текст монографии (raw)
                </summary>
                <div style={{ marginTop: 8, fontSize: 12, color: '#6B7280', whiteSpace: 'pre-wrap' }}>
                  {drug.fullText}
                </div>
              </details>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Section({
  label, tone = 'neutral', children,
}: {
  label: string;
  tone?: 'neutral' | 'warning';
  children: React.ReactNode;
}) {
  return (
    <div>
      <div style={{
        fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: tone === 'warning' ? '#92400E' : '#9CA3AF',
        marginBottom: 4,
      }}>
        {label}
      </div>
      <div style={{ color: tone === 'warning' ? '#78350F' : '#374151' }}>
        {children}
      </div>
    </div>
  );
}
