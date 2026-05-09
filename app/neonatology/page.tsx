/**
 * /neonatology — Neonatology section landing page.
 *
 * NEONATOLOGY MODULE audit issue 1.1 — раздел до этой sprint существовал
 * только как карточка-ссылка в меню «Сервисы» без дочерних страниц. Этот
 * Server Component создаёт landing page со специализированным
 * disclaimer'ом, обзором available P0 calculators и ссылками на каждый
 * через основной /tools route.
 *
 * Полноценная иерархия `/neonatology/{calculators, scales, protocols,
 * drugs, articles, tests, procedures}` — следующая итерация (M2-M3 roadmap).
 * MVP здесь фокусирован на discoverability + audit compliance.
 *
 * Статически генерируется (SSG) — нет client-side state.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import NeonatologyDisclaimer from '@/components/layout/NeonatologyDisclaimer';

export const metadata: Metadata = {
  title: 'Неонатология — калькуляторы, шкалы, протоколы | Bordik',
  description:
    'Расчётные инструменты для родзала и NICU: Apgar, Ballard, Silverman, Bili-2022, Fenton 2025, реанимационные дозы (NRP/ERC/МЗ РФ), GIR, ЭТТ, UVC/UAC. Источники: AAP, NICE, ESPGHAN, КР МЗ РФ, gov.uz.',
};

interface NeoTool {
  id: string;
  title: string;
  desc: string;
  source: string;
  audit_id: string;
  group: 'P0' | 'P1';
}

const P0_TOOLS: NeoTool[] = [
  {
    id: 'apgar',
    title: 'Apgar score',
    desc: 'Оценка состояния новорождённого 1 / 5 / 10 мин.',
    source: 'NRP 8 ed. 2021; AAP/ACOG 2015',
    audit_id: 'A1',
    group: 'P0',
  },
  {
    id: 'silverman',
    title: 'Silverman-Anderson',
    desc: 'Тяжесть респираторного дистресс-синдрома.',
    source: 'КР РФ РДС',
    audit_id: 'A2',
    group: 'P0',
  },
  {
    id: 'ballard',
    title: 'Ballard / New Ballard',
    desc: 'Гестационный возраст после рождения 20-44 нед.',
    source: 'Ballard JL 1991; StatPearls',
    audit_id: 'A4',
    group: 'P0',
  },
  {
    id: 'neo-bili-2022',
    title: 'Bili-2022 AAP / NICE / КР РФ ГБН',
    desc: 'Пороги фототерапии и обмена при гипербилирубинемии ≥35 нед.',
    source: 'AAP 2022 Pediatrics 150:e2022058859; NICE CG98; КР МЗ РФ',
    audit_id: 'A8',
    group: 'P0',
  },
  {
    id: 'neo-fluid',
    title: 'Жидкость по дням жизни',
    desc: 'Стартовый объём 60-160 мл/кг с поправками на losses.',
    source: 'ESPGHAN/ESPEN/ESPR PN 2018; КР МЗ РФ 2024',
    audit_id: 'A11',
    group: 'P0',
  },
  {
    id: 'neo-gir',
    title: 'GIR (Glucose Infusion Rate)',
    desc: 'Скорость глюкозы мг/кг/мин из инфузии.',
    source: 'ESPGHAN PN 2018; PES 2015 (Thornton)',
    audit_id: 'A12',
    group: 'P0',
  },
  {
    id: 'neo-ett',
    title: 'Размер ЭТТ + глубина',
    desc: 'Внутренний диаметр и глубина введения по массе/GA.',
    source: 'NRP 8 ed.; Takeuchi 2020 для ELBW; ERC 2021; МЗ РФ',
    audit_id: 'A15',
    group: 'P0',
  },
  {
    id: 'neo-uvc-uac',
    title: 'UVC / UAC размер + глубина',
    desc: 'Пуповинные катетеры по Shukla, целевые позиции T8-T9.',
    source: 'NRP 8 ed. Chapter 10; Shukla 1986',
    audit_id: 'A16',
    group: 'P0',
  },
  {
    id: 'neo-resus-doses',
    title: 'Реанимационные дозы (3 региона)',
    desc: 'Эпинефрин, NaHCO3, D10, налоксон. NRP / ERC / МЗ РФ.',
    source: 'NRP 8 ed.; ERC 2021/2025; МЗ РФ 04.03.2020',
    audit_id: 'A17',
    group: 'P0',
  },
  {
    id: 'neo-fenton',
    title: 'Fenton 2025 growth (преэрмы)',
    desc: 'Перцентили и Z-scores 22-50 нед PMA.',
    source: 'Fenton 2025 Pediatrics 155:e2024069896',
    audit_id: 'A18',
    group: 'P0',
  },
  {
    id: 'intergrowth',
    title: 'Intergrowth-21st / Fenton chart',
    desc: 'Кривые роста для недоношенных и после рождения.',
    source: 'Lancet 2014; intergrowth21.com',
    audit_id: 'A19',
    group: 'P0',
  },
  {
    id: 'thompson',
    title: 'Thompson Score / Sarnat staging',
    desc: 'Тяжесть гипоксически-ишемической энцефалопатии (ХИЭ).',
    source: 'Thompson 1997; Sarnat & Sarnat 1976',
    audit_id: 'A24',
    group: 'P0',
  },
];

const P1_TOOLS: NeoTool[] = [
  { id: 'downes', title: 'Downes score', desc: 'Альтернатива Silverman.', source: 'NeoReviews; КР РФ', audit_id: 'A3', group: 'P1' },
  { id: 'finnegan', title: 'Finnegan NAS / mFNAS', desc: 'Синдром неонатальной абстиненции.', source: 'Finnegan 1992; MDCalc', audit_id: 'A7', group: 'P1' },
  { id: 'kramer', title: 'Kramer / Bhutani nomogram', desc: 'Визуальная оценка желтухи.', source: 'Kramer; Bhutani 1999', audit_id: 'A8.alt', group: 'P1' },
  { id: 'crib', title: 'CRIB-II / SNAP-II / SNAPPE-II', desc: 'Тяжесть состояния в неонатальной реанимации.', source: 'Parry 2003; Richardson 2001', audit_id: 'A31/A32', group: 'P1' },
  { id: 'dubowitz', title: 'Dubowitz', desc: 'Классическая GA шкала по 21 критерию.', source: 'Dubowitz LMS 1970', audit_id: 'A5', group: 'P1' },
];

export default function NeonatologyPage() {
  return (
    <main
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '24px 20px 64px',
        fontFamily: 'var(--font-body)',
        color: '#1A1A1A',
      }}
    >
      <header style={{ marginBottom: 24 }}>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 700,
            color: '#9CA3AF',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 8,
          }}
        >
          Неонатология · NICU · Родзал
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 32,
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            margin: '0 0 12px',
          }}
        >
          Калькуляторы и шкалы для новорождённых
        </h1>
        <p
          style={{
            fontSize: 16,
            color: '#4B5563',
            lineHeight: 1.55,
            maxWidth: 720,
            margin: 0,
          }}
        >
          Расчётные инструменты для оценки состояния, дозирования, размеров
          катетеров и трубок. Все расчёты опираются на NRP 8 ed. 2021,
          ERC 2021/2025, AAP 2022 Bili Guidelines, ESPGHAN 2018 PN,
          методическое письмо МЗ РФ 04.03.2020 (Байбарина) и нацпротоколы
          Узбекистана.
        </p>
      </header>

      <NeonatologyDisclaimer />

      <section style={{ marginTop: 32 }}>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            fontWeight: 700,
            margin: '0 0 12px',
            letterSpacing: '-0.01em',
          }}
        >
          P0 — обязательный набор (12 инструментов)
        </h2>
        <p style={{ color: '#6B7280', fontSize: 14, margin: '0 0 20px' }}>
          Минимальный набор для старта работы в родзале и NICU. Все 12
          калькуляторов available на текущий момент.
        </p>
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'grid',
            gap: 12,
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          }}
        >
          {P0_TOOLS.map((t) => (
            <li key={t.id}>
              <Link
                href={`/tools/${t.id}`}
                style={{
                  display: 'block',
                  padding: '14px 16px',
                  background: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: 12,
                  textDecoration: 'none',
                  color: '#1A1A1A',
                  transition: 'border-color 200ms, box-shadow 200ms',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: 6,
                  }}
                >
                  <strong style={{ fontSize: 15 }}>{t.title}</strong>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      color: '#9CA3AF',
                      fontWeight: 600,
                    }}
                  >
                    {t.audit_id}
                  </span>
                </div>
                <p style={{ fontSize: 13.5, color: '#4B5563', margin: '0 0 6px', lineHeight: 1.5 }}>
                  {t.desc}
                </p>
                <p
                  style={{
                    fontSize: 11.5,
                    color: '#9CA3AF',
                    margin: 0,
                    lineHeight: 1.4,
                  }}
                >
                  {t.source}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 40 }}>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            fontWeight: 700,
            margin: '0 0 12px',
            letterSpacing: '-0.01em',
          }}
        >
          P1 — расширенный набор
        </h2>
        <p style={{ color: '#6B7280', fontSize: 14, margin: '0 0 20px' }}>
          Дополнительные инструменты для специфических ситуаций (NAS,
          альтернативные шкалы, severity).
        </p>
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'grid',
            gap: 10,
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          }}
        >
          {P1_TOOLS.map((t) => (
            <li key={t.id}>
              <Link
                href={`/tools/${t.id}`}
                style={{
                  display: 'block',
                  padding: '12px 14px',
                  background: '#F5F6F8',
                  borderRadius: 10,
                  textDecoration: 'none',
                  color: '#1A1A1A',
                }}
              >
                <strong style={{ fontSize: 14 }}>{t.title}</strong>
                <p style={{ fontSize: 12.5, color: '#6B7280', margin: '4px 0 0' }}>{t.desc}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 40, padding: 16, background: '#F5F6F8', borderRadius: 12 }}>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 16,
            fontWeight: 700,
            margin: '0 0 8px',
          }}
        >
          Что планируется добавить (M3-M6 sprints)
        </h3>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13.5, color: '#4B5563', lineHeight: 1.6 }}>
          <li>Kaiser EOS calculator (Pediatrics 2024 update) — sepsis risk</li>
          <li>NIPS / PIPP-R / N-PASS — оценка боли и седации</li>
          <li>Bell staging NEC, Papile ВЖК, ICROP3 ROP, NIH BPD</li>
          <li>Drug DB неонатальный (NeoFax + BNFc + РФ-формуляр)</li>
          <li>Алгоритмы первичной реанимации (РФ / NRP / ERC) с таймером</li>
          <li>i18n RU / UZ / EN для всех инструментов</li>
        </ul>
        <p style={{ fontSize: 12.5, color: '#6B7280', margin: '12px 0 0' }}>
          Полная спецификация:{' '}
          <code style={{ background: '#FFF', padding: '2px 6px', borderRadius: 4 }}>
            ~/.claude/plans/imperative-prancing-lampson.md
          </code>{' '}
          — 12-месячный roadmap M1-M12 (44 калькулятора + 15 протоколов + 8 справочников).
        </p>
      </section>
    </main>
  );
}
