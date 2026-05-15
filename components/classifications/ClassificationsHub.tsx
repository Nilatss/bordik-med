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

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icd10Lookup from '@/components/icd10/Icd10Lookup';
import Highlight from '@/components/ui/Highlight';

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
    <main id="main-content" className="p-0 font-[var(--font-body,system-ui)]">
      {/* Шапка хаба */}
      <header className="mb-6">
        <h1 className="text-[32px] font-bold mt-0 mb-2 text-[#101010]">
          Классификации
        </h1>
        <p className="text-base text-[#6B7280] m-0 max-w-[760px] leading-[1.5]">
          Единый справочник классификаций МКБ/ICD — российская МКБ-10, новая МКБ-11 ВОЗ
          и национальные адаптации (США, Канада, Германия, Австралия). Cross-walk между
          системами появится по мере подключения каждой.
        </p>
      </header>

      {/* Табы — left-flush с заголовком (компенсируем padding кнопок через marginLeft) */}
      <div role="tablist" aria-label="Классификации" className="flex gap-1 flex-wrap border-b border-[#E5E7EB] mb-6 pb-0 -mx-3.5">
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
              className={`relative bg-transparent border-0 px-3.5 py-2.5 text-sm font-[inherit] cursor-pointer -mb-px inline-flex items-center gap-1.5 transition-[color] duration-[120ms] ease-out border-b-2 ${
                isActive
                  ? 'font-semibold text-[#2563EB] border-b-[#2563EB]'
                  : isRoadmap
                    ? 'font-medium text-[#9CA3AF] hover:text-[#2563EB] border-b-transparent'
                    : 'font-medium text-[#374151] hover:text-[#2563EB] border-b-transparent'
              }`}
            >
              <span>{tab.label}</span>
              {isRoadmap && (
                <span className="text-[9px] font-semibold tracking-[0.04em] bg-[#F5F6F8] text-[#6B7280] px-1.5 py-0.5 rounded-full uppercase">
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
      <div className="p-6 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-sm">
        Не удалось загрузить справочник МКБ-10: {error}.
      </div>
    );
  }
  if (!bank) {
    return (
      <div className="py-2">
        <div className="lc-shimmer h-7 w-[240px] rounded-lg mb-3.5" />
        <div className="lc-shimmer h-4 w-[60%] rounded-md mb-6" />
        <div className="lc-shimmer h-12 w-full rounded-xl mb-3" />
        <div className="lc-shimmer h-16 w-full rounded-xl" />
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
    <div className="max-w-[880px] bg-white rounded-2xl border border-[#E5E7EB] pt-8 px-8 pb-7 mb-6">
      <div className="flex items-start gap-3 mb-5 flex-wrap">
        <div className="flex-1 min-w-[240px]">
          <div className="text-[11px] text-[#9CA3AF] tracking-[0.06em] uppercase font-semibold mb-1.5">
            РФ / СНГ · ВОЗ rev.10
          </div>
          <h2 className="text-[22px] font-bold mt-0 mb-1.5 text-[#101010]">
            МКБ-10 (ВОЗ rev.10, РФ-адаптация Минздрава)
          </h2>
          <div className="text-sm text-[#6B7280] leading-[1.55]">
            Российская редакция Международной классификации болезней 10-го пересмотра.
            Используется в РФ для всей официальной диагностической отчётности — амбулаторной
            и стационарной. Поиск работает в офлайн-режиме после первой загрузки.
          </div>
        </div>
      </div>

      <FactsPanel items={[
        { label: 'Покрытие', value: `${codesCount.toLocaleString('ru-RU')} кодов · ${chaptersCount} глав` },
        { label: 'Источник', value: source },
        { label: 'Лицензия', value: 'Public domain (ВОЗ) · перевод Минздрава РФ' },
        { label: 'Версия базы', value: `${version} · обновлено ${lastUpdated}` },
      ]} />
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
      <div className="p-6 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-sm">
        Не удалось загрузить справочник МКБ-11: {error}.
      </div>
    );
  }

  if (!bank) {
    return (
      <div className="py-2">
        <div className="lc-shimmer h-7 w-[240px] rounded-lg mb-3.5" />
        <div className="lc-shimmer h-4 w-[60%] rounded-md mb-6" />
        <div className="lc-shimmer h-12 w-full rounded-xl mb-3" />
        <div className="lc-shimmer h-16 w-full rounded-xl" />
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
    <div className="max-w-[880px] bg-white rounded-2xl border border-[#E5E7EB] pt-8 px-8 pb-7 mb-6">
      <div className="flex items-start gap-3 mb-5 flex-wrap">
        <div className="flex-1 min-w-[240px]">
          <div className="text-[11px] text-[#9CA3AF] tracking-[0.06em] uppercase font-semibold mb-1.5">
            Мир · ВОЗ rev.11 · MMS
          </div>
          <h2 className="text-[22px] font-bold mt-0 mb-1.5 text-[#101010]">
            МКБ-11 (ICD-11 MMS, WHO 2024-01 release)
          </h2>
          <div className="text-sm text-[#6B7280] leading-[1.55]">
            Международная классификация болезней 11-го пересмотра ВОЗ — Mortality
            and Morbidity Statistics linearization. Включает все терминальные категории,
            extension-коды (XA-XY) для постcoordination и раздел традиционной медицины (SA-SJ).
            Русские названия и определения подгружены через официальный WHO ICD-11 API.
          </div>
        </div>
      </div>

      <FactsPanel items={[
        { label: 'Покрытие', value: `${codesCount.toLocaleString('ru-RU')} кодов · ${chaptersCount} глав (включая X-extension и V-functioning)` },
        { label: 'Источник', value: source },
        { label: 'Лицензия', value: 'CC BY-ND 3.0 IGO (WHO) — некоммерческое использование с указанием авторства' },
        { label: 'Версия базы', value: `${version} · обновлено ${lastUpdated}` },
      ]} />

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
      <div className="p-6 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-sm">
        Не удалось загрузить ICD-10-CM: {error}.
      </div>
    );
  }
  if (!bank) {
    return (
      <div className="py-2">
        <div className="lc-shimmer h-7 w-[240px] rounded-lg mb-3.5" />
        <div className="lc-shimmer h-4 w-[60%] rounded-md mb-6" />
        <div className="lc-shimmer h-12 w-full rounded-xl mb-3" />
        <div className="lc-shimmer h-16 w-full rounded-xl" />
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
    <div
      className={`max-w-[880px] bg-[#F5F6F8] rounded-[14px] mb-3 overflow-hidden transition-[border-color] duration-150 ease-out ${
        open ? 'border border-[#E5E7EB]' : 'border-0'
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 px-4 py-3 bg-transparent hover:bg-[#EFF1F4] border-0 cursor-pointer text-left font-[inherit] transition-[background-color] duration-150"
      >
        <span className="flex-1">
          <span className="block text-sm font-semibold text-[#1A1A1A]">
            Поиск по симптому (Алфавитный указатель)
          </span>
          <span className="block mt-0.5 text-xs text-[#6B7280]">
            CMS Alphabetic Index — 76 327 терминов. Удобно когда знаешь жалобу/симптом, а не точный диагноз.
          </span>
        </span>
        <span
          className={`text-[#6B7280] transition-transform duration-200 ${
            open ? 'rotate-180' : 'rotate-0'
          }`}
        >
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
            className="overflow-hidden"
          >
            <div className="border-t border-[#E5E7EB] bg-white px-4 py-3">
              <div className="bordik-search flex items-center gap-2.5 px-3.5 py-2.5 bg-[#F5F6F8] rounded-[10px] mb-3">
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
                  className="flex-1 bg-transparent border-0 outline-none font-[inherit] text-sm text-[#1A1A1A]"
                />
              </div>
              {!index ? (
                <div className="text-[13px] text-[#6B7280] p-2">Загружаем указатель…</div>
              ) : !q.trim() ? (
                <div className="text-xs text-[#9CA3AF] p-2 italic">
                  Начните печатать симптом или жалобу.
                </div>
              ) : results.length === 0 ? (
                <div className="text-xs text-[#9CA3AF] p-2 italic">
                  Ничего не найдено.
                </div>
              ) : (
                <ul className="list-none p-0 m-0 flex flex-col gap-1.5">
                  {results.map((r, i) => (
                    <li key={i} className="flex items-start gap-2.5 px-3 py-2 bg-[#FAFBFC] rounded-lg">
                      <span className="flex-1 text-[13px] text-[#1A1A1A] leading-[1.4]">
                        <Highlight text={r.term} query={q} />
                      </span>
                      {r.code ? (
                        <CopyCodeButton code={r.code} />
                      ) : r.see ? (
                        <span className="shrink-0 text-[11px] text-[#6B7280] italic">
                          → см. {r.see}
                        </span>
                      ) : r.seeAlso ? (
                        <span className="shrink-0 text-[11px] text-[#6B7280] italic">
                          ↗ также {r.seeAlso}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
              {results.length === 50 && (
                <div className="text-[11px] text-[#9CA3AF] pt-2 italic">
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
    <div
      className={`max-w-[880px] bg-[#F5F6F8] rounded-[14px] mb-3 overflow-hidden transition-[border-color] duration-150 ease-out ${
        open ? 'border border-[#E5E7EB]' : 'border-0'
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 px-4 py-3 bg-transparent hover:bg-[#EFF1F4] border-0 cursor-pointer text-left font-[inherit] transition-[background-color] duration-150"
      >
        <span className="flex-1">
          <span className="block text-sm font-semibold text-[#1A1A1A]">
            Онко-кодер (Neoplasm Table)
          </span>
          <span className="block mt-0.5 text-xs text-[#6B7280]">
            CMS Neoplasm Table — введи локализацию, получи коды для всех 6 типов поведения опухоли.
          </span>
        </span>
        <span
          className={`text-[#6B7280] transition-transform duration-200 ${
            open ? 'rotate-180' : 'rotate-0'
          }`}
        >
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
            className="overflow-hidden"
          >
            <div className="border-t border-[#E5E7EB] bg-white px-4 py-3">
              <div className="bordik-search flex items-center gap-2.5 px-3.5 py-2.5 bg-[#F5F6F8] rounded-[10px] mb-3">
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
                  className="flex-1 bg-transparent border-0 outline-none font-[inherit] text-sm text-[#1A1A1A]"
                />
              </div>
              {!data ? (
                <div className="text-[13px] text-[#6B7280] p-2">Загружаем Neoplasm Table…</div>
              ) : !q.trim() ? (
                <div className="text-xs text-[#9CA3AF] p-2 italic">
                  Введите анатомическую локализацию (на английском).
                </div>
              ) : results.length === 0 ? (
                <div className="text-xs text-[#9CA3AF] p-2 italic">
                  Ничего не найдено.
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {results.map((r, i) => (
                    <div key={i} className="bg-[#FAFBFC] rounded-[10px] px-3 py-2.5">
                      <div className="text-xs text-[#6B7280] mb-2">
                        <Highlight text={r.site} query={q} />
                      </div>
                      {r.seeAlso ? (
                        <div className="text-[11px] text-[#9CA3AF] italic">
                          → см. также: {r.seeAlso}
                        </div>
                      ) : (
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(110px,1fr))] gap-1.5">
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

/** Inline pill-кнопка с кодом — копирует в clipboard, мигает зелёным
 *  на 1.2с после клика, чтобы был визуальный фидбек. */
function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const handleCopy = (): void => {
    void navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1200);
    });
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? `${code} скопирован` : `Скопировать ${code}`}
      aria-live="polite"
      className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-md cursor-pointer font-[var(--font-mono,ui-monospace)] text-xs font-bold transition-[background-color,border-color] duration-150 border ${
        copied
          ? 'bg-[#DCFCE7] border-[#86EFAC] text-[#15803D]'
          : 'bg-[#EFF6FF] border-[#DBEAFE] text-[#2563EB]'
      }`}
    >
      {copied && (
        <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
      {code}
    </button>
  );
}

function NeoplasmCell({ label, code }: { label: string; code?: string | null | undefined }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  if (!code || code === '--') {
    return (
      <div className="px-2 py-1.5 bg-white border border-[#F0F1F5] rounded-md text-[#D1D5DB] text-[10px] text-center">
        <div>{label}</div>
        <div className="mt-0.5">—</div>
      </div>
    );
  }

  const handleCopy = (): void => {
    void navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1200);
    });
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? `${code} скопирован` : `Скопировать ${code}`}
      aria-live="polite"
      className={`px-2 py-1.5 rounded-md cursor-pointer text-center font-[inherit] transition-[background-color,border-color] duration-150 border ${
        copied ? 'bg-[#DCFCE7] border-[#86EFAC]' : 'bg-white border-[#DBEAFE]'
      }`}
    >
      <div className={`text-[10px] ${copied ? 'text-[#15803D]' : 'text-[#6B7280]'}`}>
        {copied ? 'Скопировано' : label}
      </div>
      <div
        className={`mt-0.5 font-[var(--font-mono,ui-monospace)] text-xs font-bold inline-flex items-center gap-1 ${
          copied ? 'text-[#15803D]' : 'text-[#2563EB]'
        }`}
      >
        {copied && (
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
        {code}
      </div>
    </button>
  );
}

function Icd10cmInfoCard({
  version, lastUpdated, source, codesCount, chaptersCount,
}: { version: string; lastUpdated: string; source: string; codesCount: number; chaptersCount: number }) {
  return (
    <div className="max-w-[880px] bg-white rounded-2xl border border-[#E5E7EB] pt-8 px-8 pb-7 mb-6">
      <div className="flex items-start gap-3 mb-5 flex-wrap">
        <div className="flex-1 min-w-[240px]">
          <div className="text-[11px] text-[#9CA3AF] tracking-[0.06em] uppercase font-semibold mb-1.5">
            США · Clinical Modification
          </div>
          <h2 className="text-[22px] font-bold mt-0 mb-1.5 text-[#101010]">
            ICD-10-CM (FY2026)
          </h2>
          <div className="text-sm text-[#6B7280] leading-[1.55]">
            Clinical Modification ICD-10 для США (CDC / CMS). Используется для всей
            диагностической отчётности в системе здравоохранения США (Medicare,
            Medicaid, частное страхование). Семизначные коды с детализацией по
            этиологии, локализации, стороне (left/right/bilateral) и типу визита
            (initial/subsequent/sequela). Применима для пациентов в США и для
            академического обмена.
          </div>
        </div>
      </div>

      <FactsPanel items={[
        { label: 'Покрытие', value: `${codesCount.toLocaleString('ru-RU')} кодов · ${chaptersCount} глав` },
        { label: 'Источник', value: source },
        { label: 'Лицензия', value: 'Public domain (US Federal — CMS / NCHS)' },
        { label: 'Версия базы', value: `${version} · обновлено ${lastUpdated}` },
      ]} />
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
      <div className="p-6 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-sm">
        Не удалось загрузить ICD-10-PCS: {error}.
      </div>
    );
  }
  if (!bank) {
    return (
      <div className="py-2">
        <div className="lc-shimmer h-7 w-[240px] rounded-lg mb-3.5" />
        <div className="lc-shimmer h-4 w-[60%] rounded-md mb-6" />
        <div className="lc-shimmer h-12 w-full rounded-xl mb-3" />
        <div className="lc-shimmer h-16 w-full rounded-xl" />
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
    <div className="max-w-[880px] bg-white rounded-2xl border border-[#E5E7EB] pt-8 px-8 pb-7 mb-6">
      <div className="flex items-start gap-3 mb-5 flex-wrap">
        <div className="flex-1 min-w-[240px]">
          <div className="text-[11px] text-[#9CA3AF] tracking-[0.06em] uppercase font-semibold mb-1.5">
            США · Procedures
          </div>
          <h2 className="text-[22px] font-bold mt-0 mb-1.5 text-[#101010]">
            ICD-10-PCS (FY2026)
          </h2>
          <div className="text-sm text-[#6B7280] leading-[1.55]">
            Procedure Coding System — классификация хирургических и медицинских
            процедур в США (заменила МКБ-9-CM Volume 3). Применяется только в
            стационаре для отчётности перед CMS. Семизначные коды:
            section / body system / root operation / body part / approach / device / qualifier.
          </div>
        </div>
      </div>

      <FactsPanel items={[
        { label: 'Покрытие', value: `${codesCount.toLocaleString('ru-RU')} кодов · ${chaptersCount} разделов` },
        { label: 'Источник', value: source },
        { label: 'Лицензия', value: 'Public domain (US Federal — CMS)' },
        { label: 'Версия базы', value: `${version} · обновлено ${lastUpdated}` },
      ]} />
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
      <div className="p-6 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-sm">
        Не удалось загрузить ICD-10-CA: {error}.
      </div>
    );
  }
  if (!bank) {
    return (
      <div className="py-2">
        <div className="lc-shimmer h-7 w-[240px] rounded-lg mb-3.5" />
        <div className="lc-shimmer h-4 w-[60%] rounded-md mb-6" />
        <div className="lc-shimmer h-12 w-full rounded-xl mb-3" />
        <div className="lc-shimmer h-16 w-full rounded-xl" />
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
    <div className="max-w-[880px] bg-white rounded-2xl border border-[#E5E7EB] pt-8 px-8 pb-7 mb-6">
      <div className="flex items-start gap-3 mb-5 flex-wrap">
        <div className="flex-1 min-w-[240px]">
          <div className="text-[11px] text-[#9CA3AF] tracking-[0.06em] uppercase font-semibold mb-1.5">
            Канада · Diagnoses
          </div>
          <h2 className="text-[22px] font-bold mt-0 mb-1.5 text-[#101010]">
            ICD-10-CA ({version})
          </h2>
          <div className="text-sm text-[#6B7280] leading-[1.55]">
            Canadian Adaptation ICD-10. Используется во всей Канаде в стационарной
            отчётности (DAD/NACRS). Параллельно работает классификация процедур
            CCI (Canadian Classification of Health Interventions). По сравнению с
            ВОЗ-версией добавлены коды для канадских реалий (дольковая структура
            кодов, аборигенное население, специфика провинций).
          </div>
        </div>
      </div>

      <FactsPanel items={[
        { label: 'Покрытие', value: `${codesCount.toLocaleString('ru-RU')} кодов · ${chaptersCount} глав` },
        { label: 'Источник', value: source },
        { label: 'Лицензия', value: 'CIHI — некоммерческое использование с указанием авторства' },
        { label: 'Версия базы', value: `${version} · обновлено ${lastUpdated}` },
      ]} />
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// Панель-заглушка для систем, не интегрированных в Bordik
// ───────────────────────────────────────────────────────────────────

function RoadmapPanel({ tab, info }: { tab: TabDef; info: StubInfo }) {
  return (
    <div className="max-w-[880px] bg-white rounded-2xl border border-[#E5E7EB] pt-8 px-8 pb-7">
      {/* Заголовок */}
      <div className="flex items-start gap-3 mb-5 flex-wrap">
        <div className="flex-1 min-w-[240px]">
          <div className="text-[11px] text-[#9CA3AF] tracking-[0.06em] uppercase font-semibold mb-1.5">
            {tab.region}
          </div>
          <h2 className="text-[22px] font-bold mt-0 mb-1.5 text-[#101010]">
            {tab.fullName}
          </h2>
          <div className="text-sm text-[#6B7280]">
            {info.description}
          </div>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1.5 bg-[#EFF6FF] text-[#1D4ED8] text-[11px] font-semibold tracking-[0.04em] uppercase px-3 py-1.5 rounded-full">
          В разработке · {info.eta}
        </span>
      </div>

      {/* Таблица фактов */}
      <div className="mb-6">
        <FactsPanel items={[
          { label: 'Покрытие', value: info.coverage },
          {
            label: 'Источник',
            value: (
              <a
                href={info.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2563EB] no-underline border-b border-[#BFDBFE]"
              >
                {info.source}
              </a>
            ),
          },
          { label: 'Лицензия', value: info.license },
        ]} />
      </div>

      {/* Заметки */}
      {info.notes.length > 0 && (
        <div className="mb-6">
          <div className="text-[11px] text-[#9CA3AF] tracking-[0.06em] uppercase font-semibold mb-3">
            Особенности системы
          </div>
          <ul className="m-0 pl-[18px] flex flex-col gap-2">
            {info.notes.map((n, i) => (
              <li key={i} className="text-sm text-[#374151] leading-[1.55]">{n}</li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA — пока нет интеграции */}
      <div className="flex items-center justify-between gap-3 px-5 py-4 bg-[#F5F6F8] rounded-xl flex-wrap">
        <div className="text-[13px] text-[#6B7280] max-w-[520px]">
          Полный поиск по {tab.label} появится в Bordik к {info.eta}. Пока пользуйтесь
          официальным источником — он в открытом доступе на сайте организации.
        </div>
        <a
          href={info.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1.5 bg-[#2563EB] text-white text-[13px] font-semibold px-4 py-2.5 rounded-lg no-underline whitespace-nowrap"
        >
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

/** Панель «фактов» — единый стиль для всех InfoCard'ов в Классификациях.
 *  Серый фон, чёткие границы, row-дивайдеры между строками. */
function FactsPanel({ items }: { items: Array<{ label: string; value: React.ReactNode }> }) {
  return (
    <dl className="m-0 bg-[#F5F6F8] rounded-xl overflow-hidden">
      {items.map((item, i) => (
        <div key={i} className="grid grid-cols-[160px_1fr] gap-4 px-[18px] py-3.5">
          <dt className="m-0 text-[11px] text-[#9CA3AF] tracking-[0.06em] uppercase font-semibold pt-0.5">
            {item.label}
          </dt>
          <dd className="m-0 text-sm text-[#374151] leading-[1.55]">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
