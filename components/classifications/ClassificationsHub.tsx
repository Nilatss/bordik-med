'use client';

/**
 * Унифицированный хаб классификаций (МКБ / ICD).
 *
 * Содержит 7 табов:
 *   - МКБ-10 (РФ, ВОЗ rev.10) — РАБОЧИЙ, 3742 кода, реюзает <Icd10Lookup/>
 *   - МКБ-11 (ВОЗ rev.11) — заглушка
 *   - ICD-10-CM (США, диагнозы) — заглушка
 *   - ICD-10-PCS (США, процедуры) — заглушка
 *   - ICD-10-CA (Канада) — заглушка
 *   - ICD-10-GM (Германия) — заглушка
 *   - ICD-10-AM (Австралия / NZ / Ирландия) — заглушка
 *
 * Этап 1 IA-переезда (см. docs/CONTENT_ROADMAP.md #3a):
 *   - перенос /icd10 функциональности в общий хаб без потери deeplink;
 *   - заглушки с описанием системы, объёмом, лицензией, ETA;
 *   - под каждой заглушкой — публичная ссылка на первоисточник (icd.who.int,
 *     CDC, BfArM, IHACPA), чтобы пользователь мог обратиться к данным
 *     напрямую пока тут нет интегрированного lookup.
 *
 * SPA-обёртка: грузит /icd10-starter.json (fetch + SW cache) — тот же
 * подход, что был в Icd10View. ?v= bust обновляется при росте версии
 * базы (текущая 0.6.0 = 3742 кода).
 */

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icd10Lookup from '@/components/icd10/Icd10Lookup';

interface Chapter { id: string; range: string; title: string }
interface CodeEntry { code: string; title: string; chapter: string }
interface Bank {
  version: string;
  lastUpdated: string;
  source: string;
  chapters: Chapter[];
  codes: CodeEntry[];
}

type TabId = 'icd10' | 'icd11' | 'icd10cm' | 'icd10pcs' | 'icd10ca' | 'icd10gm' | 'icd10am';

interface TabDef {
  id: TabId;
  label: string;
  fullName: string;
  region: string;
  status: 'active' | 'roadmap';
}

const TABS: TabDef[] = [
  { id: 'icd10',    label: 'МКБ-10',      fullName: 'МКБ-10 (ВОЗ rev.10, РФ-адаптация)',     region: 'РФ / СНГ',                status: 'active' },
  { id: 'icd11',    label: 'МКБ-11',      fullName: 'МКБ-11 (ВОЗ rev.11, MMS)',                region: 'Мир (с 2022)',           status: 'active' },
  { id: 'icd10cm',  label: 'ICD-10-CM',   fullName: 'ICD-10-CM (Clinical Modification, FY2026)', region: 'США (диагнозы)',         status: 'active' },
  { id: 'icd10pcs', label: 'ICD-10-PCS',  fullName: 'ICD-10-PCS (Procedure Coding System, FY2026)', region: 'США (процедуры)',        status: 'active' },
  { id: 'icd10ca',  label: 'ICD-10-CA',   fullName: 'ICD-10-CA (Canadian Adaptation, v.2009/2012)', region: 'Канада',                  status: 'active' },
  { id: 'icd10gm',  label: 'ICD-10-GM',   fullName: 'ICD-10-GM (German Modification)',         region: 'Германия',                status: 'roadmap' },
  { id: 'icd10am',  label: 'ICD-10-AM',   fullName: 'ICD-10-AM (Australian Modification)',     region: 'Австралия / NZ / Ирландия', status: 'roadmap' },
];

interface StubInfo {
  description: string;
  coverage: string;
  source: string;
  sourceUrl: string;
  license: string;
  eta: string;
  notes: string[];
}

const STUBS: Record<Exclude<TabId, 'icd10' | 'icd11' | 'icd10cm' | 'icd10pcs' | 'icd10ca'>, StubInfo> = {
  icd10gm: {
    description: 'German Modification ICD-10. Официальная диагностическая классификация в Германии. Используется в DRG-системе оплаты больниц и амбулаторной отчётности GKV.',
    coverage: '~16 000 кодов',
    source: 'BfArM — Bundesinstitut für Arzneimittel und Medizinprodukte (ранее DIMDI)',
    sourceUrl: 'https://www.bfarm.de/EN/Code-systems/Classifications/ICD/ICD-10-GM/_node.html',
    license: 'Public domain (Германия) — открытые данные',
    eta: 'Q4 2026',
    notes: [
      'Тесная связка с OPS (Operationen- und Prozedurenschlüssel) — немецкая классификация процедур.',
      'Cross-walk МКБ-10 ↔ ICD-10-GM в большинстве случаев 1:1 на 4-знаковом уровне.',
      'Полезно для пациентов, наблюдающихся в Германии, и для академического обмена с DE-вузами.',
    ],
  },
  icd10am: {
    description: 'Australian Modification ICD-10. Используется в Австралии, Новой Зеландии, Ирландии и Сингапуре. Сопровождается ACHI (Australian Classification of Health Interventions) и ACS (Australian Coding Standards).',
    coverage: '~16 800 кодов',
    source: 'IHACPA — Independent Health and Aged Care Pricing Authority',
    sourceUrl: 'https://www.ihacpa.gov.au/health-care/classification/icd-10-am-achi-acs',
    license: 'Лицензионный (IHACPA) — требует подписки',
    eta: 'Q1 2027',
    notes: [
      'Используется в DRG/AR-DRG системе финансирования больниц.',
      'Регулярные обновления (около раз в 2 года), последняя версия — 12-я редакция.',
      'В Bordik — заглушка + контент по подписке организации.',
    ],
  },
};

interface Props {
  /** Если задан — открыть конкретный таб при монтировании. */
  defaultTab?: TabId;
}

export default function ClassificationsHub({ defaultTab = 'icd10' }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>(defaultTab);
  const [bank, setBank] = useState<Bank | null>(null);
  const [error, setError] = useState<string | null>(null);
  // (МКБ-11 / ICD-10-CM грузятся в их собственных panel-компонентах;
  //  здесь только МКБ-10.)

  // Грузим МКБ-10 starter JSON только когда открыт его таб (lazy).
  // ?v=2.0.0 — полная база Минздрава РФ (14 641 код).
  // Версию увеличиваем при каждом обновлении data/icd10-starter.json.
  useEffect(() => {
    if (activeTab !== 'icd10' || bank || error) return;
    let cancelled = false;
    void (async () => {
      try {
        const r = await fetch('/icd10-starter.json?v=2.0.0', { cache: 'no-cache' });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json();
        if (!cancelled) setBank(json);
      } catch (e) {
        if (!cancelled) setError((e as Error).message ?? 'load failed');
      }
    })();
    return () => { cancelled = true; };
  }, [activeTab, bank, error]);


  const formatDate = (iso: string): string => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    return m ? `${m[3]}.${m[2]}.${m[1]}` : iso;
  };

  return (
    <main id="main-content" style={{
      padding: 0,
      fontFamily: 'var(--font-body, system-ui)',
    }}>
      {/* Шапка хаба */}
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 8px', color: '#101010' }}>
          Классификации
        </h1>
        <p style={{ fontSize: 16, color: '#6B7280', margin: 0, maxWidth: 760, lineHeight: 1.5 }}>
          Единый справочник классификаций МКБ/ICD — российская МКБ-10, новая МКБ-11 ВОЗ
          и национальные адаптации (США, Канада, Германия, Австралия). Cross-walk между
          системами появится по мере подключения каждой.
        </p>
      </header>

      {/* Табы — left-flush с заголовком (компенсируем padding кнопок через marginLeft) */}
      <div role="tablist" aria-label="Классификации" style={{
        display: 'flex', gap: 4, flexWrap: 'wrap',
        borderBottom: '1px solid #E5E7EB',
        marginBottom: 24, paddingBottom: 0,
        marginLeft: -14, marginRight: -14,
      }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const isRoadmap = tab.status === 'roadmap';
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                position: 'relative',
                background: 'transparent',
                border: 'none',
                padding: '10px 14px',
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                fontFamily: 'inherit',
                color: isActive ? '#2563EB' : isRoadmap ? '#9CA3AF' : '#374151',
                cursor: 'pointer',
                borderBottom: isActive ? '2px solid #2563EB' : '2px solid transparent',
                marginBottom: -1,
                display: 'inline-flex', alignItems: 'center', gap: 6,
                transition: 'color 120ms ease',
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = '#2563EB'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = isRoadmap ? '#9CA3AF' : '#374151'; }}
            >
              <span>{tab.label}</span>
              {isRoadmap && (
                <span style={{
                  fontSize: 9, fontWeight: 600, letterSpacing: '0.04em',
                  background: '#F5F6F8', color: '#6B7280',
                  padding: '2px 6px', borderRadius: 999, textTransform: 'uppercase',
                }}>
                  скоро
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Панели */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
        >
          {activeTab === 'icd10' && (
            <Icd10Panel bank={bank} error={error} formatDate={formatDate} />
          )}
          {activeTab === 'icd11' && (
            <Icd11Panel />
          )}
          {activeTab === 'icd10cm' && (
            <Icd10cmPanel />
          )}
          {activeTab === 'icd10pcs' && (
            <Icd10pcsPanel />
          )}
          {activeTab === 'icd10ca' && (
            <Icd10caPanel />
          )}
          {activeTab !== 'icd10' && activeTab !== 'icd11' && activeTab !== 'icd10cm' && activeTab !== 'icd10pcs' && activeTab !== 'icd10ca' && (
            <RoadmapPanel
              tab={TABS.find((t) => t.id === activeTab)!}
              info={STUBS[activeTab as Exclude<TabId, 'icd10' | 'icd11' | 'icd10cm' | 'icd10pcs' | 'icd10ca'>]}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

// ───────────────────────────────────────────────────────────────────
// Панель МКБ-10 — рабочая
// ───────────────────────────────────────────────────────────────────

function Icd10Panel({
  bank, error, formatDate,
}: { bank: Bank | null; error: string | null; formatDate: (iso: string) => string }) {
  if (error) {
    return (
      <div style={{
        padding: 24, borderRadius: 12, background: '#FEF2F2',
        border: '1px solid #FECACA', color: '#991B1B', fontSize: 14,
      }}>
        Не удалось загрузить справочник МКБ-10: {error}.
      </div>
    );
  }
  if (!bank) {
    return (
      <div style={{ padding: '8px 0' }}>
        <div className="lc-shimmer" style={{ height: 28, width: 240, borderRadius: 8, marginBottom: 14 }} />
        <div className="lc-shimmer" style={{ height: 16, width: '60%', borderRadius: 6, marginBottom: 24 }} />
        <div className="lc-shimmer" style={{ height: 48, width: '100%', borderRadius: 12, marginBottom: 12 }} />
        <div className="lc-shimmer" style={{ height: 64, width: '100%', borderRadius: 12 }} />
      </div>
    );
  }
  return (
    <>
      <Icd10InfoCard
        version={bank.version}
        lastUpdated={formatDate(bank.lastUpdated)}
        source={bank.source}
        codesCount={bank.codes.length}
        chaptersCount={bank.chapters.length}
      />
      <Icd10Lookup
        chapters={bank.chapters}
        codes={bank.codes}
        version={bank.version}
        lastUpdated={formatDate(bank.lastUpdated)}
        source={bank.source}
        hideHeading
      />
    </>
  );
}

// ───────────────────────────────────────────────────────────────────
// Rich-info card для МКБ-10 (та же визуальная модель, что у RoadmapPanel,
// но статус — "рабочая система", и нет CTA "открыть источник", потому что
// поиск встроен прямо ниже).
// ───────────────────────────────────────────────────────────────────

function Icd10InfoCard({
  version, lastUpdated, source, codesCount, chaptersCount,
}: { version: string; lastUpdated: string; source: string; codesCount: number; chaptersCount: number }) {
  return (
    <div style={{
      maxWidth: 880,
      background: '#FFFFFF',
      borderRadius: 16,
      border: '1px solid #E5E7EB',
      padding: '32px 32px 28px',
      marginBottom: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 11, color: '#9CA3AF', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>
            РФ / СНГ · ВОЗ rev.10
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px', color: '#101010' }}>
            МКБ-10 (ВОЗ rev.10, РФ-адаптация Минздрава)
          </h2>
          <div style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.55 }}>
            Российская редакция Международной классификации болезней 10-го пересмотра.
            Используется в РФ для всей официальной диагностической отчётности — амбулаторной
            и стационарной. Поиск работает в офлайн-режиме после первой загрузки.
          </div>
        </div>
        <span style={{
          flexShrink: 0,
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: '#DCFCE7', color: '#166534',
          fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
          textTransform: 'uppercase',
          padding: '6px 12px', borderRadius: 999,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
          Рабочая система
        </span>
      </div>

      <dl style={{
        display: 'grid', gridTemplateColumns: '160px 1fr', gap: '12px 16px',
        margin: '0 0 4px', padding: '20px 20px',
        background: '#F9FAFB', borderRadius: 12,
        border: '1px solid #F3F4F6',
      }}>
        <Fact label="Покрытие" value={`${codesCount.toLocaleString('ru-RU')} кодов · ${chaptersCount} глав`} />
        <Fact label="Источник" value={source} />
        <Fact label="Лицензия" value="Public domain (ВОЗ) · перевод Минздрава РФ" />
        <Fact label="Версия базы" value={`${version} · обновлено ${lastUpdated}`} />
      </dl>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// Панель МКБ-11 — рабочая (WHO MMS 2018-12)
// ───────────────────────────────────────────────────────────────────

function Icd11Panel() {
  // Используем проверенный Icd10Lookup (тот же что для МКБ-10) —
  // визуал унифицирован, expand работает inline, нет lazy-fetch гонок.
  // Загружаем slim (codes only) + details параллельно и мержим в bank.
  const [bank, setBank] = useState<Bank | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        // Параллельно: slim (метаданные + коды) + details (definitions)
        const [slimR, detailsR] = await Promise.all([
          fetch('/icd11-slim.json?v=3.3.0', { cache: 'force-cache' }),
          fetch('/icd11-details.json?v=3.3.0', { cache: 'force-cache' }),
        ]);
        if (!slimR.ok) throw new Error(`slim ${slimR.status}`);
        const slim = await slimR.json();
        const details = detailsR.ok ? await detailsR.json() : {};
        if (cancelled) return;

        // Merge details в codes (inline формат для Icd10Lookup)
        const merged: typeof slim & { codes: Bank['codes'] } = {
          ...slim,
          codes: slim.codes.map((c: { code: string; title: string; chapter: string }) => {
            const d = details[c.code];
            return d ? { ...c, ...d } : c;
          }),
        };
        setBank(merged as Bank);
      } catch (e) {
        if (!cancelled) setError((e as Error).message ?? 'load failed');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <div style={{
        padding: 24, borderRadius: 12, background: '#FEF2F2',
        border: '1px solid #FECACA', color: '#991B1B', fontSize: 14,
      }}>
        Не удалось загрузить справочник МКБ-11: {error}.
      </div>
    );
  }

  if (!bank) {
    return (
      <div style={{ padding: '8px 0' }}>
        <div className="lc-shimmer" style={{ height: 28, width: 240, borderRadius: 8, marginBottom: 14 }} />
        <div className="lc-shimmer" style={{ height: 16, width: '60%', borderRadius: 6, marginBottom: 24 }} />
        <div className="lc-shimmer" style={{ height: 48, width: '100%', borderRadius: 12, marginBottom: 12 }} />
        <div className="lc-shimmer" style={{ height: 64, width: '100%', borderRadius: 12 }} />
      </div>
    );
  }

  return (
    <>
      <Icd11InfoCard
        version={bank.version}
        lastUpdated={bank.lastUpdated}
        source={bank.source}
        codesCount={bank.codes.length}
        chaptersCount={bank.chapters.length}
      />
      <Icd10Lookup
        chapters={bank.chapters}
        codes={bank.codes}
        version={bank.version}
        lastUpdated={bank.lastUpdated}
        source={bank.source}
        hideHeading
      />
    </>
  );
}

function Icd11InfoCard({
  version, lastUpdated, source, codesCount, chaptersCount,
}: { version: string; lastUpdated: string; source: string; codesCount: number; chaptersCount: number }) {
  return (
    <div style={{
      maxWidth: 880,
      background: '#FFFFFF',
      borderRadius: 16,
      border: '1px solid #E5E7EB',
      padding: '32px 32px 28px',
      marginBottom: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 11, color: '#9CA3AF', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>
            Мир · ВОЗ rev.11 · MMS
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px', color: '#101010' }}>
            МКБ-11 (ICD-11 MMS, WHO 2024-01 release)
          </h2>
          <div style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.55 }}>
            Международная классификация болезней 11-го пересмотра ВОЗ — Mortality
            and Morbidity Statistics linearization. Включает все терминальные категории,
            extension-коды (XA-XY) для постcoordination и раздел традиционной медицины (SA-SJ).
            Русские названия и определения подгружены через официальный WHO ICD-11 API.
          </div>
        </div>
        <span style={{
          flexShrink: 0,
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: '#DCFCE7', color: '#166534',
          fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
          textTransform: 'uppercase',
          padding: '6px 12px', borderRadius: 999,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
          Рабочая система
        </span>
      </div>

      <dl style={{
        display: 'grid', gridTemplateColumns: '160px 1fr', gap: '12px 16px',
        margin: '0 0 16px', padding: '20px 20px',
        background: '#F9FAFB', borderRadius: 12,
        border: '1px solid #F3F4F6',
      }}>
        <Fact label="Покрытие" value={`${codesCount.toLocaleString('ru-RU')} кодов · ${chaptersCount} глав (включая X-extension и V-functioning)`} />
        <Fact label="Источник" value={source} />
        <Fact label="Лицензия" value="CC BY-ND 3.0 IGO (WHO) — некоммерческое использование с указанием авторства" />
        <Fact label="Версия базы" value={`${version} · обновлено ${lastUpdated}`} />
      </dl>

    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// Панель ICD-10-CM (FY2026, US Clinical Modification) — рабочая
// ───────────────────────────────────────────────────────────────────

function Icd10cmPanel() {
  const [bank, setBank] = useState<Bank | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [slimR, detailsR] = await Promise.all([
          fetch('/icd10cm-slim.json?v=1.1.0', { cache: 'force-cache' }),
          fetch('/icd10cm-details.json?v=1.1.0', { cache: 'force-cache' }),
        ]);
        if (!slimR.ok) throw new Error(`slim ${slimR.status}`);
        const slim = await slimR.json();
        const details = detailsR.ok ? await detailsR.json() : {};
        if (cancelled) return;
        const merged: typeof slim & { codes: Bank['codes'] } = {
          ...slim,
          codes: slim.codes.map((c: { code: string; title: string; chapter: string }) => {
            const d = details[c.code];
            return d ? { ...c, ...d } : c;
          }),
        };
        setBank(merged as Bank);
      } catch (e) {
        if (!cancelled) setError((e as Error).message ?? 'load failed');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <div style={{
        padding: 24, borderRadius: 12, background: '#FEF2F2',
        border: '1px solid #FECACA', color: '#991B1B', fontSize: 14,
      }}>
        Не удалось загрузить ICD-10-CM: {error}.
      </div>
    );
  }
  if (!bank) {
    return (
      <div style={{ padding: '8px 0' }}>
        <div className="lc-shimmer" style={{ height: 28, width: 240, borderRadius: 8, marginBottom: 14 }} />
        <div className="lc-shimmer" style={{ height: 16, width: '60%', borderRadius: 6, marginBottom: 24 }} />
        <div className="lc-shimmer" style={{ height: 48, width: '100%', borderRadius: 12, marginBottom: 12 }} />
        <div className="lc-shimmer" style={{ height: 64, width: '100%', borderRadius: 12 }} />
      </div>
    );
  }

  return (
    <>
      <Icd10cmInfoCard
        version={bank.version}
        lastUpdated={bank.lastUpdated}
        source={bank.source}
        codesCount={bank.codes.length}
        chaptersCount={bank.chapters.length}
      />
      <Icd10cmIndexSearch />
      <Icd10cmNeoplasmCoder />
      <Icd10Lookup
        chapters={bank.chapters}
        codes={bank.codes}
        version={bank.version}
        lastUpdated={bank.lastUpdated}
        source={bank.source}
        hideHeading
      />
    </>
  );
}

/**
 * Поиск по симптому через CMS Alphabetic Index (Index to Diseases).
 * 76 327 entries — лазит lazy при первом раскрытии секции.
 * Use case: врач знает симптом ("боль в груди"), не знает точный код —
 * вводит симптом, получает список ICD-10-CM кодов с full path в указателе.
 */
function Icd10cmIndexSearch() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState<Array<{ term: string; code?: string; see?: string; seeAlso?: string }> | null>(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    if (!open || index) return;
    let cancelled = false;
    void (async () => {
      try {
        const r = await fetch('/icd10cm-index.json?v=1.0.0', { cache: 'force-cache' });
        if (!r.ok) return;
        const json = await r.json();
        if (!cancelled) setIndex(json);
      } catch { /* */ }
    })();
    return () => { cancelled = true; };
  }, [open, index]);

  const results = useMemo(() => {
    if (!index || !q.trim()) return [];
    const query = q.trim().toLowerCase();
    const out: typeof index = [];
    for (const e of index) {
      if (e.term.toLowerCase().includes(query)) {
        out.push(e);
        if (out.length >= 50) break;
      }
    }
    return out;
  }, [index, q]);

  return (
    <div style={{
      maxWidth: 880,
      background: '#FFFFFF',
      borderRadius: 14,
      border: '1px solid #E5E7EB',
      marginBottom: 20,
      overflow: 'hidden',
    }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 18px',
          background: 'transparent', border: 'none',
          cursor: 'pointer', textAlign: 'left',
          fontFamily: 'inherit',
        }}
      >
        <span style={{ flex: 1 }}>
          <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>
            Поиск по симптому (Алфавитный указатель)
          </span>
          <span style={{ display: 'block', marginTop: 2, fontSize: 12, color: '#6B7280' }}>
            CMS Alphabetic Index — 76 327 терминов. Удобно когда знаешь жалобу/симптом, а не точный диагноз.
          </span>
        </span>
        <span style={{
          color: '#6B7280',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 200ms',
        }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
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
            <div style={{ borderTop: '1px solid #E5E7EB', padding: '14px 18px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', background: '#F5F6F8', borderRadius: 10, marginBottom: 12,
              }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
                  stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Например: «headache», «pain», «cough», «fever»…"
                  aria-label="Поиск по симптому"
                  style={{
                    flex: 1, background: 'transparent', border: 'none', outline: 'none',
                    fontFamily: 'inherit', fontSize: 14, color: '#1A1A1A',
                  }}
                />
              </div>
              {!index ? (
                <div style={{ fontSize: 13, color: '#6B7280', padding: 8 }}>Загружаем указатель…</div>
              ) : !q.trim() ? (
                <div style={{ fontSize: 12, color: '#9CA3AF', padding: 8, fontStyle: 'italic' }}>
                  Начните печатать симптом или жалобу.
                </div>
              ) : results.length === 0 ? (
                <div style={{ fontSize: 12, color: '#9CA3AF', padding: 8, fontStyle: 'italic' }}>
                  Ничего не найдено.
                </div>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {results.map((r, i) => (
                    <li key={i} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                      padding: '8px 12px',
                      background: '#FAFBFC', borderRadius: 8,
                    }}>
                      <span style={{ flex: 1, fontSize: 13, color: '#1A1A1A', lineHeight: 1.4 }}>
                        {r.term}
                      </span>
                      {r.code ? (
                        <button
                          type="button"
                          onClick={() => { void navigator.clipboard?.writeText(r.code!); }}
                          title={`Скопировать ${r.code}`}
                          style={{
                            flexShrink: 0,
                            padding: '4px 10px', background: '#EFF6FF', border: '1px solid #DBEAFE',
                            borderRadius: 6, cursor: 'pointer',
                            fontFamily: 'var(--font-mono, ui-monospace)',
                            fontSize: 12, fontWeight: 700, color: '#2563EB',
                          }}
                        >
                          {r.code}
                        </button>
                      ) : r.see ? (
                        <span style={{ flexShrink: 0, fontSize: 11, color: '#6B7280', fontStyle: 'italic' }}>
                          → см. {r.see}
                        </span>
                      ) : r.seeAlso ? (
                        <span style={{ flexShrink: 0, fontSize: 11, color: '#6B7280', fontStyle: 'italic' }}>
                          ↗ также {r.seeAlso}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
              {results.length === 50 && (
                <div style={{ fontSize: 11, color: '#9CA3AF', padding: '8px 0 0', fontStyle: 'italic' }}>
                  Показаны первые 50 совпадений — уточните запрос.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Онко-кодер — поиск по локализации опухоли + поведению (Primary,
 * Secondary, Ca in situ, Benign, Uncertain, Unspecified) → ICD-10-CM код.
 * Источник: CMS Neoplasm Table (1828 записей).
 */
function Icd10cmNeoplasmCoder() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Array<{
    site: string;
    primary?: string | null;
    secondary?: string | null;
    in_situ?: string | null;
    benign?: string | null;
    uncertain?: string | null;
    unspecified?: string | null;
    seeAlso?: string;
  }> | null>(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    if (!open || data) return;
    let cancelled = false;
    void (async () => {
      try {
        const r = await fetch('/icd10cm-neoplasm.json?v=1.0.0', { cache: 'force-cache' });
        if (!r.ok) return;
        const json = await r.json();
        if (!cancelled) setData(json);
      } catch { /* */ }
    })();
    return () => { cancelled = true; };
  }, [open, data]);

  const results = useMemo(() => {
    if (!data || !q.trim()) return [];
    const query = q.trim().toLowerCase();
    const out: typeof data = [];
    for (const e of data) {
      if (e.site.toLowerCase().includes(query)) {
        out.push(e);
        if (out.length >= 30) break;
      }
    }
    return out;
  }, [data, q]);

  return (
    <div style={{
      maxWidth: 880,
      background: '#FFFFFF',
      borderRadius: 14,
      border: '1px solid #E5E7EB',
      marginBottom: 20,
      overflow: 'hidden',
    }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 18px',
          background: 'transparent', border: 'none',
          cursor: 'pointer', textAlign: 'left',
          fontFamily: 'inherit',
        }}
      >
        <span style={{ flex: 1 }}>
          <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>
            Онко-кодер (Neoplasm Table)
          </span>
          <span style={{ display: 'block', marginTop: 2, fontSize: 12, color: '#6B7280' }}>
            CMS Neoplasm Table — введи локализацию, получи коды для всех 6 типов поведения опухоли.
          </span>
        </span>
        <span style={{
          color: '#6B7280',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 200ms',
        }}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
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
            <div style={{ borderTop: '1px solid #E5E7EB', padding: '14px 18px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', background: '#F5F6F8', borderRadius: 10, marginBottom: 12,
              }}>
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
                  stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Локализация: «liver», «lung upper lobe», «brain stem»…"
                  aria-label="Поиск локализации опухоли"
                  style={{
                    flex: 1, background: 'transparent', border: 'none', outline: 'none',
                    fontFamily: 'inherit', fontSize: 14, color: '#1A1A1A',
                  }}
                />
              </div>
              {!data ? (
                <div style={{ fontSize: 13, color: '#6B7280', padding: 8 }}>Загружаем Neoplasm Table…</div>
              ) : !q.trim() ? (
                <div style={{ fontSize: 12, color: '#9CA3AF', padding: 8, fontStyle: 'italic' }}>
                  Введите анатомическую локализацию (на английском).
                </div>
              ) : results.length === 0 ? (
                <div style={{ fontSize: 12, color: '#9CA3AF', padding: 8, fontStyle: 'italic' }}>
                  Ничего не найдено.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {results.map((r, i) => (
                    <div key={i} style={{
                      background: '#FAFBFC', borderRadius: 10, padding: '10px 12px',
                    }}>
                      <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>
                        {r.site}
                      </div>
                      {r.seeAlso ? (
                        <div style={{ fontSize: 11, color: '#9CA3AF', fontStyle: 'italic' }}>
                          → см. также: {r.seeAlso}
                        </div>
                      ) : (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                          gap: 6,
                        }}>
                          <NeoplasmCell label="Primary"      code={r.primary} />
                          <NeoplasmCell label="Secondary"    code={r.secondary} />
                          <NeoplasmCell label="Ca in situ"   code={r.in_situ} />
                          <NeoplasmCell label="Benign"       code={r.benign} />
                          <NeoplasmCell label="Uncertain"    code={r.uncertain} />
                          <NeoplasmCell label="Unspecified"  code={r.unspecified} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NeoplasmCell({ label, code }: { label: string; code?: string | null | undefined }) {
  if (!code || code === '--') {
    return (
      <div style={{
        padding: '6px 8px', background: '#FFFFFF', border: '1px solid #F0F1F5',
        borderRadius: 6, color: '#D1D5DB', fontSize: 10, textAlign: 'center',
      }}>
        <div>{label}</div>
        <div style={{ marginTop: 2 }}>—</div>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => { void navigator.clipboard?.writeText(code); }}
      title={`Скопировать ${code}`}
      style={{
        padding: '6px 8px', background: '#FFFFFF', border: '1px solid #DBEAFE',
        borderRadius: 6, cursor: 'pointer', textAlign: 'center',
        fontFamily: 'inherit',
      }}
    >
      <div style={{ fontSize: 10, color: '#6B7280' }}>{label}</div>
      <div style={{
        marginTop: 2, fontFamily: 'var(--font-mono, ui-monospace)',
        fontSize: 12, fontWeight: 700, color: '#2563EB',
      }}>
        {code}
      </div>
    </button>
  );
}

function Icd10cmInfoCard({
  version, lastUpdated, source, codesCount, chaptersCount,
}: { version: string; lastUpdated: string; source: string; codesCount: number; chaptersCount: number }) {
  return (
    <div style={{
      maxWidth: 880,
      background: '#FFFFFF',
      borderRadius: 16,
      border: '1px solid #E5E7EB',
      padding: '32px 32px 28px',
      marginBottom: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 11, color: '#9CA3AF', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>
            США · Clinical Modification
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px', color: '#101010' }}>
            ICD-10-CM (FY2026)
          </h2>
          <div style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.55 }}>
            Clinical Modification ICD-10 для США (CDC / CMS). Используется для всей
            диагностической отчётности в системе здравоохранения США (Medicare,
            Medicaid, частное страхование). Семизначные коды с детализацией по
            этиологии, локализации, стороне (left/right/bilateral) и типу визита
            (initial/subsequent/sequela). Применима для пациентов в США и для
            академического обмена.
          </div>
        </div>
        <span style={{
          flexShrink: 0,
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: '#DCFCE7', color: '#166534',
          fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
          textTransform: 'uppercase',
          padding: '6px 12px', borderRadius: 999,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
          Рабочая система
        </span>
      </div>

      <dl style={{
        display: 'grid', gridTemplateColumns: '160px 1fr', gap: '12px 16px',
        margin: '0 0 4px', padding: '20px 20px',
        background: '#F9FAFB', borderRadius: 12,
        border: '1px solid #F3F4F6',
      }}>
        <Fact label="Покрытие" value={`${codesCount.toLocaleString('ru-RU')} кодов · ${chaptersCount} глав`} />
        <Fact label="Источник" value={source} />
        <Fact label="Лицензия" value="Public domain (US Federal — CMS / NCHS)" />
        <Fact label="Версия базы" value={`${version} · обновлено ${lastUpdated}`} />
      </dl>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// Панель ICD-10-PCS (FY2026, US Procedure Coding System) — рабочая
// ───────────────────────────────────────────────────────────────────

function Icd10pcsPanel() {
  const [bank, setBank] = useState<Bank | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const r = await fetch('/icd10pcs-slim.json?v=1.0.0', { cache: 'force-cache' });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const slim = await r.json();
        if (cancelled) return;
        setBank(slim as Bank);
      } catch (e) {
        if (!cancelled) setError((e as Error).message ?? 'load failed');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <div style={{
        padding: 24, borderRadius: 12, background: '#FEF2F2',
        border: '1px solid #FECACA', color: '#991B1B', fontSize: 14,
      }}>
        Не удалось загрузить ICD-10-PCS: {error}.
      </div>
    );
  }
  if (!bank) {
    return (
      <div style={{ padding: '8px 0' }}>
        <div className="lc-shimmer" style={{ height: 28, width: 240, borderRadius: 8, marginBottom: 14 }} />
        <div className="lc-shimmer" style={{ height: 16, width: '60%', borderRadius: 6, marginBottom: 24 }} />
        <div className="lc-shimmer" style={{ height: 48, width: '100%', borderRadius: 12, marginBottom: 12 }} />
        <div className="lc-shimmer" style={{ height: 64, width: '100%', borderRadius: 12 }} />
      </div>
    );
  }

  return (
    <>
      <Icd10pcsInfoCard
        version={bank.version}
        lastUpdated={bank.lastUpdated}
        source={bank.source}
        codesCount={bank.codes.length}
        chaptersCount={bank.chapters.length}
      />
      <Icd10Lookup
        chapters={bank.chapters}
        codes={bank.codes}
        version={bank.version}
        lastUpdated={bank.lastUpdated}
        source={bank.source}
        hideHeading
      />
    </>
  );
}

function Icd10pcsInfoCard({
  version, lastUpdated, source, codesCount, chaptersCount,
}: { version: string; lastUpdated: string; source: string; codesCount: number; chaptersCount: number }) {
  return (
    <div style={{
      maxWidth: 880,
      background: '#FFFFFF',
      borderRadius: 16,
      border: '1px solid #E5E7EB',
      padding: '32px 32px 28px',
      marginBottom: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 11, color: '#9CA3AF', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>
            США · Procedures
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px', color: '#101010' }}>
            ICD-10-PCS (FY2026)
          </h2>
          <div style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.55 }}>
            Procedure Coding System — классификация хирургических и медицинских
            процедур в США (заменила МКБ-9-CM Volume 3). Применяется только в
            стационаре для отчётности перед CMS. Семизначные коды:
            section / body system / root operation / body part / approach / device / qualifier.
          </div>
        </div>
        <span style={{
          flexShrink: 0,
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: '#DCFCE7', color: '#166534',
          fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
          textTransform: 'uppercase',
          padding: '6px 12px', borderRadius: 999,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
          Рабочая система
        </span>
      </div>

      <dl style={{
        display: 'grid', gridTemplateColumns: '160px 1fr', gap: '12px 16px',
        margin: '0 0 4px', padding: '20px 20px',
        background: '#F9FAFB', borderRadius: 12,
        border: '1px solid #F3F4F6',
      }}>
        <Fact label="Покрытие" value={`${codesCount.toLocaleString('ru-RU')} кодов · ${chaptersCount} разделов`} />
        <Fact label="Источник" value={source} />
        <Fact label="Лицензия" value="Public domain (US Federal — CMS)" />
        <Fact label="Версия базы" value={`${version} · обновлено ${lastUpdated}`} />
      </dl>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// Панель ICD-10-CA (Canadian Adaptation, v.2009/2012) — рабочая
// ───────────────────────────────────────────────────────────────────

function Icd10caPanel() {
  const [bank, setBank] = useState<Bank | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [slimR, detailsR] = await Promise.all([
          fetch('/icd10ca-slim.json?v=1.0.0', { cache: 'force-cache' }),
          fetch('/icd10ca-details.json?v=1.0.0', { cache: 'force-cache' }),
        ]);
        if (!slimR.ok) throw new Error(`slim ${slimR.status}`);
        const slim = await slimR.json();
        const details = detailsR.ok ? await detailsR.json() : {};
        if (cancelled) return;
        const merged: typeof slim & { codes: Bank['codes'] } = {
          ...slim,
          codes: slim.codes.map((c: { code: string; title: string; chapter: string }) => {
            const d = details[c.code];
            return d ? { ...c, ...d } : c;
          }),
        };
        setBank(merged as Bank);
      } catch (e) {
        if (!cancelled) setError((e as Error).message ?? 'load failed');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <div style={{
        padding: 24, borderRadius: 12, background: '#FEF2F2',
        border: '1px solid #FECACA', color: '#991B1B', fontSize: 14,
      }}>
        Не удалось загрузить ICD-10-CA: {error}.
      </div>
    );
  }
  if (!bank) {
    return (
      <div style={{ padding: '8px 0' }}>
        <div className="lc-shimmer" style={{ height: 28, width: 240, borderRadius: 8, marginBottom: 14 }} />
        <div className="lc-shimmer" style={{ height: 16, width: '60%', borderRadius: 6, marginBottom: 24 }} />
        <div className="lc-shimmer" style={{ height: 48, width: '100%', borderRadius: 12, marginBottom: 12 }} />
        <div className="lc-shimmer" style={{ height: 64, width: '100%', borderRadius: 12 }} />
      </div>
    );
  }

  return (
    <>
      <Icd10caInfoCard
        version={bank.version}
        lastUpdated={bank.lastUpdated}
        source={bank.source}
        codesCount={bank.codes.length}
        chaptersCount={bank.chapters.length}
      />
      <Icd10Lookup
        chapters={bank.chapters}
        codes={bank.codes}
        version={bank.version}
        lastUpdated={bank.lastUpdated}
        source={bank.source}
        hideHeading
      />
    </>
  );
}

function Icd10caInfoCard({
  version, lastUpdated, source, codesCount, chaptersCount,
}: { version: string; lastUpdated: string; source: string; codesCount: number; chaptersCount: number }) {
  return (
    <div style={{
      maxWidth: 880,
      background: '#FFFFFF',
      borderRadius: 16,
      border: '1px solid #E5E7EB',
      padding: '32px 32px 28px',
      marginBottom: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 11, color: '#9CA3AF', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>
            Канада · Diagnoses
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px', color: '#101010' }}>
            ICD-10-CA ({version})
          </h2>
          <div style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.55 }}>
            Canadian Adaptation ICD-10. Используется во всей Канаде в стационарной
            отчётности (DAD/NACRS). Параллельно работает классификация процедур
            CCI (Canadian Classification of Health Interventions). По сравнению с
            ВОЗ-версией добавлены коды для канадских реалий (дольковая структура
            кодов, аборигенное население, специфика провинций).
          </div>
        </div>
        <span style={{
          flexShrink: 0,
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: '#DCFCE7', color: '#166534',
          fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
          textTransform: 'uppercase',
          padding: '6px 12px', borderRadius: 999,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E' }} />
          Рабочая система
        </span>
      </div>

      <dl style={{
        display: 'grid', gridTemplateColumns: '160px 1fr', gap: '12px 16px',
        margin: '0 0 4px', padding: '20px 20px',
        background: '#F9FAFB', borderRadius: 12,
        border: '1px solid #F3F4F6',
      }}>
        <Fact label="Покрытие" value={`${codesCount.toLocaleString('ru-RU')} кодов · ${chaptersCount} глав`} />
        <Fact label="Источник" value={source} />
        <Fact label="Лицензия" value="CIHI — некоммерческое использование с указанием авторства" />
        <Fact label="Версия базы" value={`${version} · обновлено ${lastUpdated}`} />
      </dl>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// Панель-заглушка для систем, не интегрированных в Bordik
// ───────────────────────────────────────────────────────────────────

function RoadmapPanel({ tab, info }: { tab: TabDef; info: StubInfo }) {
  return (
    <div style={{
      maxWidth: 880,
      background: '#FFFFFF',
      borderRadius: 16,
      border: '1px solid #E5E7EB',
      padding: '32px 32px 28px',
    }}>
      {/* Заголовок */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 11, color: '#9CA3AF', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>
            {tab.region}
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px', color: '#101010' }}>
            {tab.fullName}
          </h2>
          <div style={{ fontSize: 14, color: '#6B7280' }}>
            {info.description}
          </div>
        </div>
        <span style={{
          flexShrink: 0,
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: '#EFF6FF', color: '#1D4ED8',
          fontSize: 11, fontWeight: 600, letterSpacing: '0.04em',
          textTransform: 'uppercase',
          padding: '6px 12px', borderRadius: 999,
        }}>
          В разработке · {info.eta}
        </span>
      </div>

      {/* Таблица фактов */}
      <dl style={{
        display: 'grid', gridTemplateColumns: '160px 1fr', gap: '12px 16px',
        margin: '0 0 24px', padding: '20px 20px',
        background: '#F9FAFB', borderRadius: 12,
        border: '1px solid #F3F4F6',
      }}>
        <Fact label="Покрытие" value={info.coverage} />
        <Fact label="Источник" value={
          <a href={info.sourceUrl} target="_blank" rel="noopener noreferrer"
             style={{ color: '#2563EB', textDecoration: 'none', borderBottom: '1px solid #BFDBFE' }}>
            {info.source}
          </a>
        } />
        <Fact label="Лицензия" value={info.license} />
      </dl>

      {/* Заметки */}
      {info.notes.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontSize: 11, color: '#9CA3AF', letterSpacing: '0.06em',
            textTransform: 'uppercase', fontWeight: 600, marginBottom: 12,
          }}>
            Особенности системы
          </div>
          <ul style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {info.notes.map((n, i) => (
              <li key={i} style={{ fontSize: 14, color: '#374151', lineHeight: 1.55 }}>{n}</li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA — пока нет интеграции */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, padding: '16px 20px',
        background: '#F5F6F8', borderRadius: 12, flexWrap: 'wrap',
      }}>
        <div style={{ fontSize: 13, color: '#6B7280', maxWidth: 520 }}>
          Полный поиск по {tab.label} появится в Bordik к {info.eta}. Пока пользуйтесь
          официальным источником — он в открытом доступе на сайте организации.
        </div>
        <a href={info.sourceUrl} target="_blank" rel="noopener noreferrer"
           style={{
             flexShrink: 0,
             display: 'inline-flex', alignItems: 'center', gap: 6,
             background: '#2563EB', color: '#FFFFFF',
             fontSize: 13, fontWeight: 600,
             padding: '10px 16px', borderRadius: 8,
             textDecoration: 'none', whiteSpace: 'nowrap',
           }}>
          Открыть источник
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M7 17L17 7" />
            <polyline points="7 7 17 7 17 17" />
          </svg>
        </a>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <>
      <dt style={{
        fontSize: 11, color: '#9CA3AF', letterSpacing: '0.06em',
        textTransform: 'uppercase', fontWeight: 600, paddingTop: 2,
      }}>
        {label}
      </dt>
      <dd style={{ margin: 0, fontSize: 14, color: '#374151' }}>
        {value}
      </dd>
    </>
  );
}
