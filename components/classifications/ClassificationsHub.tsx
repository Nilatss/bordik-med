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
  { id: 'icd10cm',  label: 'ICD-10-CM',   fullName: 'ICD-10-CM (Clinical Modification)',       region: 'США (диагнозы)',         status: 'roadmap' },
  { id: 'icd10pcs', label: 'ICD-10-PCS',  fullName: 'ICD-10-PCS (Procedure Coding System)',    region: 'США (процедуры)',        status: 'roadmap' },
  { id: 'icd10ca',  label: 'ICD-10-CA',   fullName: 'ICD-10-CA (Canadian Adaptation)',         region: 'Канада',                  status: 'roadmap' },
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

const STUBS: Record<Exclude<TabId, 'icd10' | 'icd11'>, StubInfo> = {
  icd10cm: {
    description: 'Clinical Modification ICD-10 для США. Используется для всех диагнозов в системе здравоохранения США (Medicare, Medicaid, частное страхование). Обновляется ежегодно (FY = October 1).',
    coverage: '~73 000 кодов (FY2025)',
    source: 'CDC / NCHS — National Center for Health Statistics',
    sourceUrl: 'https://www.cdc.gov/nchs/icd/icd-10-cm/index.html',
    license: 'Public domain (US Federal)',
    eta: 'Q3 2026',
    notes: [
      '7-значная детализация: этиология / локализация / сторона / визит (initial / subsequent / sequela).',
      'Cross-walk через CMS GEMs (General Equivalence Mappings).',
      'Применяется в международной телемедицине и для пациентов, обслуживающихся в США.',
    ],
  },
  icd10pcs: {
    description: 'Procedure Coding System — отдельная классификация хирургических и медицинских процедур в США (заменила Volume 3 МКБ-9-CM). Используется только в стационарных условиях для отчётности перед CMS.',
    coverage: '~78 000 кодов (FY2025)',
    source: 'CMS — Centers for Medicare & Medicaid Services',
    sourceUrl: 'https://www.cms.gov/medicare/icd-10/2025-icd-10-pcs',
    license: 'Public domain (US Federal)',
    eta: 'Q4 2026',
    notes: [
      '7-значный код: section / body system / root operation / body part / approach / device / qualifier.',
      'Не диагнозы, а процедуры — отдельная UX-модель (селектор по разделам).',
      'Альтернатива в РФ: МКБ-9-CM Volume 3 (применяется для статистики операций).',
    ],
  },
  icd10ca: {
    description: 'Canadian Adaptation ICD-10. Используется во всей Канаде в стационарной отчётности. Параллельно работает классификация процедур CCI (Canadian Classification of Health Interventions).',
    coverage: '~17 100 кодов',
    source: 'CIHI — Canadian Institute for Health Information',
    sourceUrl: 'https://www.cihi.ca/en/submit-data-and-view-standards/codes-and-classifications/icd-10-ca',
    license: 'Лицензионный (CIHI) — требует подписки',
    eta: 'Q1 2027',
    notes: [
      'Расширения по сравнению с ВОЗ-версией: дополнительные коды для канадских реалий (дольковая структура, аборигенное население).',
      'Доступ к полному содержимому — только через подписку CIHI.',
      'В Bordik будет публичная заглушка + опция полного доступа для подписчиков клиник.',
    ],
  },
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
  const [icd11Bank, setIcd11Bank] = useState<Bank | null>(null);
  const [icd11Error, setIcd11Error] = useState<string | null>(null);

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

  // Грузим МКБ-11 MMS JSON (lazy). v=3.0.0 — Phase 3: полный обход дерева
  // MMS 2024-01 через WHO API. 34 663 кодов, 100% RU titles.
  useEffect(() => {
    if (activeTab !== 'icd11' || icd11Bank || icd11Error) return;
    let cancelled = false;
    void (async () => {
      try {
        const r = await fetch('/icd11-mms.json?v=3.0.0', { cache: 'no-cache' });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json();
        if (!cancelled) setIcd11Bank(json);
      } catch (e) {
        if (!cancelled) setIcd11Error((e as Error).message ?? 'load failed');
      }
    })();
    return () => { cancelled = true; };
  }, [activeTab, icd11Bank, icd11Error]);

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
            <Icd11Panel bank={icd11Bank} error={icd11Error} formatDate={formatDate} />
          )}
          {activeTab !== 'icd10' && activeTab !== 'icd11' && (
            <RoadmapPanel
              tab={TABS.find((t) => t.id === activeTab)!}
              info={STUBS[activeTab as Exclude<TabId, 'icd10' | 'icd11'>]}
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

function Icd11Panel({
  bank, error, formatDate,
}: { bank: Bank | null; error: string | null; formatDate: (iso: string) => string }) {
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
            МКБ-11 (ICD-11 MMS, WHO 2018-12 release)
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
        <Fact label="Источник" value={
          <a href="https://icd.who.int/browse/2024-01/mms/en" target="_blank" rel="noopener noreferrer"
             style={{ color: '#2563EB', textDecoration: 'none', borderBottom: '1px solid #BFDBFE' }}>
            {source}
          </a>
        } />
        <Fact label="Лицензия" value="CC BY-ND 3.0 IGO (WHO) — некоммерческое использование с указанием авторства" />
        <Fact label="Версия базы" value={`${version} · обновлено ${lastUpdated}`} />
      </dl>

      <div style={{
        padding: '14px 18px', background: '#ECFDF5', border: '1px solid #A7F3D0',
        borderRadius: 10, fontSize: 13, color: '#065F46', lineHeight: 1.5,
      }}>
        <strong>Phase 2 готов:</strong> русские переводы названий + определения,
        включения и исключения подгружены через официальный WHO ICD-11 API.
        Кликните на любой код, чтобы развернуть описание.
      </div>
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
