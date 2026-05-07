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
import Highlight from '@/components/ui/Highlight';
import GrowthCharts from '@/components/neonatal/GrowthCharts';
import BilirubinNomogram from '@/components/neonatal/BilirubinNomogram';
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

type Tab = 'drugs' | 'guidelines' | 'growth' | 'bilirubin';

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
          fetch('/neonatal-monographs.json?v=2.0.0', { cache: 'force-cache' }),
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
          путём введения, метаболизмом и предостережениями.
        </p>
      </motion.div>

      {/* Search — только для табов с поиском (drugs/guidelines); на growth/bilirubin не нужен */}
      {(tab === 'drugs' || tab === 'guidelines') && (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.05, 0.7, 0.1, 1], delay: 0.06 }}
        className="bordik-search"
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
      )}

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
          { id: 'growth' as const, label: 'Графики роста', count: null as number | null },
          { id: 'bilirubin' as const, label: 'Билирубин', count: null as number | null },
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
              {t.count !== null && (
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: isActive ? '#2563EB' : '#9CA3AF',
                  opacity: isActive ? 0.85 : 0.7,
                }}>
                  {t.count}
                </span>
              )}
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
                query={q}
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
      ) : tab === 'guidelines' ? (
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
                query={q}
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
      ) : tab === 'growth' ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <GrowthCharts />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <BilirubinNomogram />
        </motion.div>
      )}

      {/* Source / disclaimer panel — единый стиль с DrugChecker provenance */}
      <section
        aria-labelledby="neonatal-provenance"
        style={{
          marginTop: 32,
          padding: '20px 22px',
          background: '#F5F6F8',
          border: 'none',
          borderRadius: 14,
          fontSize: 13,
          color: '#4B5563',
          lineHeight: 1.55,
        }}
      >
        <h3 id="neonatal-provenance" style={{
          margin: '0 0 14px',
          fontFamily: 'var(--font-display)',
          fontSize: 15, fontWeight: 700,
          color: '#1A1A1A',
          letterSpacing: '-0.01em',
        }}>
          Источник и обновление
        </h3>
        <dl style={{
          margin: 0, display: 'grid',
          gridTemplateColumns: 'auto 1fr', columnGap: 18, rowGap: 10,
        }}>
          <dt style={{ color: '#9CA3AF', fontSize: 12 }}>Препараты + протоколы</dt>
          <dd style={{ margin: 0, color: '#1A1A1A' }}>
            {bank.source} — {bank.drugs.length} препаратов NICU + 13 практических протоколов.
            <span style={{ color: '#6B7280', display: 'block', marginTop: 2, fontSize: 12 }}>
              Авторы: {bank.authors.join('; ')}
            </span>
          </dd>

          <dt style={{ color: '#9CA3AF', fontSize: 12 }}>Графики роста</dt>
          <dd style={{ margin: 0, color: '#1A1A1A' }}>
            Fenton TR, Kim JH. BMC Pediatrics 2013;13:59 — кривые для недоношенных 22–50 нед PMA.
            <span style={{ color: '#6B7280', display: 'block', marginTop: 2, fontSize: 12 }}>
              Лицензия: CC-BY 2.0 (open access)
            </span>
          </dd>

          <dt style={{ color: '#9CA3AF', fontSize: 12 }}>Билирубин</dt>
          <dd style={{ margin: 0, color: '#1A1A1A' }}>
            AAP 2022 — Kemper AR, Newman TB, Slaughter JL, et al. Pediatrics 2022;150(3):e2022058859. Пороги фототерапии и обменного переливания.
            <span style={{ color: '#6B7280', display: 'block', marginTop: 2, fontSize: 12 }}>
              Лицензия: AAP Clinical Practice Guideline (открыт для клинического использования)
            </span>
          </dd>
        </dl>

        <p role="note" style={{
          marginTop: 18, paddingTop: 16,
          borderTop: '1px solid #E5E7EB',
          fontSize: 12, color: '#6B7280', lineHeight: 1.55,
          margin: '18px 0 0',
        }}>
          <strong style={{ color: '#1A1A1A' }}>Не заменяет клиническое решение.</strong>{' '}
          Дозы у новорождённых критически зависят от гестационного возраста, дней жизни, веса,
          функции почек и печени. Графики роста — для пограничных случаев сверяйтесь с официальными
          LMS-таблицами производителя стандарта. Билирубин — для GA &lt; 35 нед, при острой
          энцефалопатии или пограничных значениях TSB сверяйтесь с локальными протоколами и
          руководством AAP 2022 в полном виде. Решение по конкретному пациенту принимает
          врач/клин-фармаколог/неонатолог.
        </p>
      </section>
    </main>
  );
}

function DrugCard({
  drug, query, isOpen, onToggle,
}: {
  drug: Drug;
  query: string;
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
            fontSize: 15, fontWeight: 600, color: '#1A1A1A',
            lineHeight: 1.35, letterSpacing: '-0.01em',
          }}>
            <Highlight text={drug.name_ru} query={query} />
            {drug.name_en !== drug.name_ru && (
              <span style={{ fontWeight: 400, color: '#6B7280', marginLeft: 6 }}>
                (<Highlight text={drug.name_en} query={query} />)
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
              padding: '14px 20px 18px',
              fontSize: 13.5, lineHeight: 1.55, color: '#374151',
              display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              {showStructured ? (
                <>
                  {drug.brand && (
                    <NeonatalDetailBlock label="Бренд" labelEn="Brand Name">
                      {renderFieldValue(drug.brand)}
                    </NeonatalDetailBlock>
                  )}
                  {drug.indications && (
                    <NeonatalDetailBlock label="Показания" labelEn="Indications">
                      {renderFieldValue(drug.indications)}
                    </NeonatalDetailBlock>
                  )}
                  {drug.dose && (
                    <NeonatalDetailBlock label="Доза" labelEn="Dose">
                      {renderFieldValue(drug.dose)}
                    </NeonatalDetailBlock>
                  )}
                  {drug.route && (
                    <NeonatalDetailBlock label="Путь" labelEn="Route">
                      {renderFieldValue(drug.route)}
                    </NeonatalDetailBlock>
                  )}
                  {drug.levels && (
                    <NeonatalDetailBlock label="Метаболизм" labelEn="Levels & Metabolism">
                      {renderFieldValue(drug.levels)}
                    </NeonatalDetailBlock>
                  )}
                  {drug.precautions && (
                    <NeonatalDetailBlock label="Предосторожности" labelEn="Precautions" tone="warning">
                      {renderFieldValue(drug.precautions)}
                    </NeonatalDetailBlock>
                  )}
                  {drug.extemporaneous && (
                    <NeonatalDetailBlock label="Приготовление" labelEn="Extemporaneous">
                      {renderFieldValue(drug.extemporaneous)}
                    </NeonatalDetailBlock>
                  )}
                </>
              ) : (
                /* Если структурированных полей нет — показываем raw монограф
                 * как fallback. Большую простыню режем на смысловые блоки и
                 * отдаём в той же таблице, что и структурированные препараты. */
                <MonographFullText text={drug.fullText} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Чистит broken-glyph (�) и схлопывает пробелы. */
function sanitizeFieldText(s: string): string {
  return s
    .replace(/�/g, '÷')
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Разбивает длинный текст на читаемые предложения/клаузы.
 *  Защищает медицинские сокращения (max., mg., hr., и т.д.) от
 *  ложных делений на границе предложения. */
function splitIntoSentences(raw: string): string[] {
  const ABBREV = ['max', 'min', 'mg', 'mcg', 'hr', 'hrs', 'kg', 'mL', 'wk', 'wks', 'q', 'approx', 'incl', 'excl', 'ca', 'cf', 'i.e', 'e.g', 'vs', 'no', 'Dr', 'Mr', 'Ms', 'St'];
  let s = raw;
  // Защищаем сокращения временным маркером §
  for (const a of ABBREV) {
    const escaped = a.replace(/\./g, '\\.');
    s = s.replace(new RegExp(`\\b${escaped}\\.`, 'g'), `${a}§`);
  }
  // Делим на границе предложения/клаузы: . или ; + пробел + заглавная
  const parts = s.split(/(?<=[.;])\s+(?=[A-ZА-Я0-9])/g)
    .map((p) => p.replace(/§/g, '.').trim())
    .filter(Boolean);
  return parts;
}

/** Рендер «значения» поля. Короткое — inline. Длинное (>120 знаков
 *  или несколько предложений) — список с буллетами для удобства чтения. */
function renderFieldValue(value: string): React.ReactNode {
  const clean = sanitizeFieldText(value);
  if (clean.length < 120) return clean;
  const parts = splitIntoSentences(clean);
  if (parts.length < 2) return clean;
  return (
    <ul style={{
      margin: 0, paddingLeft: 18,
      listStyle: 'disc',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      {parts.map((p, i) => (
        <li key={i}>{p}</li>
      ))}
    </ul>
  );
}

/** Структурированный рендер raw-монографа: режем на смысловые блоки
 *  по ключевым медицинским секциям («Indications», «Dose», «Metabolism»,
 *  «Excretion», «Precautions», «Extemporaneous Preparation», «References»),
 *  потом каждый блок — на буллеты по предложениям. Содержимое не теряется. */
const MONOGRAPH_SECTIONS: Array<{ keys: RegExp; label: string; labelRu: string; tone?: 'warning' }> = [
  // Узкие совпадения: "Indications", "Mechanism", "Action of ..." — не "Use" в общем
  // (т.к. "Use within 4 hours" / "Use with caution" — это precautions/storage, не indications)
  { keys: /^(Indications?|Mechanism|Action of)\b/i, label: 'Indications & Mechanism', labelRu: 'Показания и механизм' },
  { keys: /^(Dose|Dosing|Dosage|Administration|PO|IV|IM)\b/i, label: 'Dose & Administration', labelRu: 'Доза и введение' },
  { keys: /^(Metabolism|Pharmacokinetics|Half-life|Clearance|Levels?)\b/i, label: 'Pharmacokinetics', labelRu: 'Фармакокинетика' },
  { keys: /^(Excretion|Elimination)\b/i, label: 'Excretion', labelRu: 'Выведение' },
  { keys: /^(Monitor(?:ing)?|CBC|Renal|Hepatic function)\b/i, label: 'Monitoring', labelRu: 'Мониторинг' },
  // "Use 25% albumin with caution", "Use with caution", "Avoid", "Causes" — все попадают сюда
  { keys: /^(Use with|Use \d|Use \w+ albumin|Precaution|Adverse|Warning|Contraindication|Causes|Avoid|May cause|Do not)\b/i, label: 'Precautions', labelRu: 'Предосторожности', tone: 'warning' },
  { keys: /^(Extemporaneous|Preparation|Reconstitution|Compounding|Stability|Storage|Use within|Stable for|Refrigerate|Discard)\b/i, label: 'Preparation', labelRu: 'Приготовление' },
  { keys: /^(References?|Bibliography|Source)\b/i, label: 'References', labelRu: 'Источники' },
];

interface MonographBlock {
  labelRu: string;
  label: string;
  tone?: 'warning';
  sentences: string[];
}

function structureMonograph(raw: string): MonographBlock[] {
  const clean = sanitizeFieldText(raw);
  const sentences = splitIntoSentences(clean);
  if (sentences.length === 0) return [];

  const blocks: MonographBlock[] = [];
  let current: MonographBlock = { labelRu: 'Описание', label: 'Description', sentences: [] };

  const sectionFor = (s: string): MonographBlock | null => {
    for (const sec of MONOGRAPH_SECTIONS) {
      if (sec.keys.test(s)) {
        const block: MonographBlock = { labelRu: sec.labelRu, label: sec.label, sentences: [] };
        if (sec.tone) block.tone = sec.tone;
        return block;
      }
    }
    return null;
  };

  for (const sent of sentences) {
    const next = sectionFor(sent);
    if (next && next.labelRu !== current.labelRu) {
      // Только переключаемся, если новая секция действительно отличается от текущей.
      // Иначе оставляем предложение в текущей секции (избегаем дублирования заголовков).
      if (current.sentences.length) blocks.push(current);
      current = next;
    }
    current.sentences.push(sent);
  }
  if (current.sentences.length) blocks.push(current);

  // Финальный merge: если две соседние секции с одинаковым labelRu — склеиваем
  // (бывает если между двумя одноимёнными секциями вклинилась короткая «Use ...»
  // фраза, отнесённая в Precautions, и потом снова Indications).
  const merged: MonographBlock[] = [];
  for (const b of blocks) {
    const prev = merged[merged.length - 1];
    if (prev && prev.labelRu === b.labelRu) {
      prev.sentences.push(...b.sentences);
    } else {
      merged.push(b);
    }
  }
  return merged;
}

function MonographFullText({ text }: { text: string }) {
  const blocks = structureMonograph(text);
  if (blocks.length === 0) return null;

  return (
    <>
      {blocks.map((b, i) => (
        <NeonatalDetailBlock
          key={i}
          label={b.labelRu}
          labelEn={b.label}
          {...(b.tone === 'warning' ? { tone: 'warning' as const } : {})}
        >
          {renderFieldValue(b.sentences.join(' '))}
        </NeonatalDetailBlock>
      ))}
    </>
  );
}

/** Bordik-style блок «лейбл сверху → значение снизу» — единый паттерн с ICD-11
 *  / МКБ. Используется в раскрытых карточках препаратов и монографов.
 *  RU label первой строкой (мелкий uppercase mono-color), EN — вторым словом
 *  справа в той же строке (микро-капшен), ниже — content. */
function NeonatalDetailBlock({
  label, labelEn, tone = 'neutral', children,
}: {
  label: string;
  labelEn?: string;
  tone?: 'neutral' | 'warning';
  children: React.ReactNode;
}) {
  return (
    <div>
      <div style={{
        marginBottom: 6,
        display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap',
      }}>
        <span style={{
          fontSize: 11, fontWeight: 600, letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: tone === 'warning' ? '#92400E' : '#9CA3AF',
        }}>
          {label}
        </span>
        {labelEn && (
          <span style={{
            fontSize: 10, fontWeight: 500,
            color: tone === 'warning' ? '#B45309' : '#9CA3AF',
            opacity: 0.75,
          }}>
            {labelEn}
          </span>
        )}
      </div>
      <div style={{
        color: tone === 'warning' ? '#78350F' : '#374151',
        fontSize: 13.5, lineHeight: 1.55,
      }}>
        {children}
      </div>
    </div>
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
  guideline, query, isOpen, onToggle,
}: {
  guideline: Guideline;
  query: string;
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
            fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600,
            color: '#111827', letterSpacing: '-0.01em', lineHeight: 1.35,
          }}>
            <Highlight text={guideline.title_ru} query={query} />
          </span>
          {guideline.title_en !== guideline.title_ru && (
            <span style={{
              display: 'block', marginTop: 3, fontSize: 12, color: '#6B7280',
            }}>
              <Highlight text={guideline.title_en} query={query} />
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

