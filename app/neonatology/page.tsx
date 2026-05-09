/**
 * /neonatology — Neonatology section landing page.
 *
 * NEONATOLOGY MODULE audit issue 1.1 — раздел до этой sprint существовал
 * только как карточка-ссылка в меню «Сервисы» без дочерних страниц. Этот
 * Server Component создаёт landing page со специализированным
 * disclaimer'ом, обзором available P0 / P1 calculators и ссылками на
 * каждый через основной /tools route.
 *
 * Полноценная иерархия `/neonatology/{calculators, scales, protocols,
 * drugs, articles, tests, procedures}` — следующая итерация (M7+).
 *
 * Статически генерируется (SSG) — нет client-side state.
 */
import type { Metadata } from 'next';
import Link from 'next/link';
import NeonatologyDisclaimer from '@/components/layout/NeonatologyDisclaimer';

export const metadata: Metadata = {
  title: 'Неонатология — калькуляторы, шкалы, протоколы | Bordik',
  description:
    'Расчётные инструменты для родзала и NICU: Apgar, Ballard, Silverman, Bili-2022, Fenton 2025, реанимационные дозы (NRP/ERC/МЗ РФ), GIR, ЭТТ, UVC/UAC, Kaiser EOS, NEC, ВЖК, BPD, ROP, ХИЭ + cooling, PIPP-R, N-PASS, NIPS, mFNAS, ABG, экспresss-кальк ОПК и фототерапии. Источники: AAP, NICE, ESPGHAN, КР МЗ РФ, gov.uz.',
};

interface NeoTool {
  id: string;
  title: string;
  desc: string;
  source: string;
  audit_id: string;
}

interface ToolGroup {
  title: string;
  description?: string;
  tools: NeoTool[];
}

const P0_TOOLS: NeoTool[] = [
  {
    id: 'apgar',
    title: 'Apgar score',
    desc: 'Оценка состояния новорождённого 1 / 5 / 10 мин.',
    source: 'NRP 8 ed. 2021; AAP/ACOG 2015',
    audit_id: 'A1',
  },
  {
    id: 'silverman',
    title: 'Silverman-Anderson',
    desc: 'Тяжесть респираторного дистресс-синдрома.',
    source: 'КР РФ РДС',
    audit_id: 'A2',
  },
  {
    id: 'ballard',
    title: 'Ballard / New Ballard',
    desc: 'Гестационный возраст после рождения 20-44 нед.',
    source: 'Ballard JL 1991; StatPearls',
    audit_id: 'A4',
  },
  {
    id: 'neo-bili-2022',
    title: 'Bili-2022 AAP / NICE / КР РФ ГБН',
    desc: 'Пороги фототерапии и обмена при гипербилирубинемии ≥35 нед.',
    source: 'AAP 2022 Pediatrics 150:e2022058859; NICE CG98; КР МЗ РФ',
    audit_id: 'A8',
  },
  {
    id: 'neo-fluid',
    title: 'Жидкость по дням жизни',
    desc: 'Стартовый объём 60-160 мл/кг с поправками на losses.',
    source: 'ESPGHAN/ESPEN/ESPR PN 2018; КР МЗ РФ 2024',
    audit_id: 'A11',
  },
  {
    id: 'neo-gir',
    title: 'GIR (Glucose Infusion Rate)',
    desc: 'Скорость глюкозы мг/кг/мин из инфузии.',
    source: 'ESPGHAN PN 2018; PES 2015 (Thornton)',
    audit_id: 'A12',
  },
  {
    id: 'neo-ett',
    title: 'Размер ЭТТ + глубина',
    desc: 'Внутренний диаметр и глубина введения по массе/GA.',
    source: 'NRP 8 ed.; Takeuchi 2020 для ELBW; ERC 2021; МЗ РФ',
    audit_id: 'A15',
  },
  {
    id: 'neo-uvc-uac',
    title: 'UVC / UAC размер + глубина',
    desc: 'Пуповинные катетеры по Shukla, целевые позиции T8-T9.',
    source: 'NRP 8 ed. Chapter 10; Shukla 1986',
    audit_id: 'A16',
  },
  {
    id: 'neo-resus-doses',
    title: 'Реанимационные дозы (3 региона)',
    desc: 'Эпинефрин, NaHCO3, D10, налоксон. NRP / ERC / МЗ РФ.',
    source: 'NRP 8 ed.; ERC 2021/2025; МЗ РФ 04.03.2020',
    audit_id: 'A17',
  },
  {
    id: 'neo-fenton',
    title: 'Fenton 2025 growth (преэрмы)',
    desc: 'Перцентили и Z-scores 22-50 нед PMA.',
    source: 'Fenton 2025 Pediatrics 155:e2024069896',
    audit_id: 'A18',
  },
  {
    id: 'intergrowth',
    title: 'Intergrowth-21st / Fenton chart',
    desc: 'Кривые роста для недоношенных и после рождения.',
    source: 'Lancet 2014; intergrowth21.com',
    audit_id: 'A19',
  },
  {
    id: 'thompson',
    title: 'Thompson Score / Sarnat staging',
    desc: 'Тяжесть гипоксически-ишемической энцефалопатии (ХИЭ).',
    source: 'Thompson 1997; Sarnat & Sarnat 1976',
    audit_id: 'A24',
  },
];

const P1_GROUPS: ToolGroup[] = [
  {
    title: 'Гипербилирубинемия и ГБН',
    description: 'Скрининг, фототерапия, обменное переливание.',
    tools: [
      {
        id: 'neo-photo-preterm',
        title: 'Phototherapy thresholds 28-34 нед',
        desc: 'Пороги ФТ и ОПК для умеренно и глубоко недоношенных.',
        source: 'NICE CG98 addendum 2023; Maisels 2012',
        audit_id: 'A9',
      },
      {
        id: 'neo-exchange-volume',
        title: 'Double Volume Exchange (ОПК)',
        desc: 'Расчёт объёма обменного переливания (DVET ~ 160-170 мл/кг).',
        source: 'AAP 2022; NICE CG98; КР МЗ РФ ГБН',
        audit_id: 'A10',
      },
      {
        id: 'neo-tcb-conversion',
        title: 'TcB → TSB конверсия',
        desc: 'Конверсия транскутанного билирубина и скрининг по AAP/NICE.',
        source: 'Maisels 2006; NICE CG98 (2023); AAP 2022',
        audit_id: 'A42',
      },
      {
        id: 'kramer',
        title: 'Kramer / Bhutani nomogram',
        desc: 'Визуальная оценка желтухи и трактовка по часам жизни.',
        source: 'Kramer 1969; Bhutani 1999',
        audit_id: 'A8.alt',
      },
    ],
  },
  {
    title: 'Сепсис, EOS / LOS',
    tools: [
      {
        id: 'neo-kaiser-eos',
        title: 'Kaiser EOS calculator (≥ 34 нед)',
        desc: 'Bayesian probability модель раннего сепсиса. AAP/Kaiser update 2024.',
        source: 'Pediatrics 2024;154(4):e2023065267',
        audit_id: 'A22',
      },
      {
        id: 'neo-puopolo-eos',
        title: 'Puopolo EOS (≤ 34 нед, AAP 2018)',
        desc: 'Категориальная стратификация для недоношенных. 3-tiered подход.',
        source: 'Puopolo Pediatrics 2017;139:e20162426; AAP COFN 2018',
        audit_id: 'A23',
      },
    ],
  },
  {
    title: 'NEC, ВЖК, БЛД, ROP',
    description: 'Стадирование специфических осложнений недоношенности.',
    tools: [
      {
        id: 'neo-bell-nec',
        title: 'Bell staging НЭК',
        desc: 'Стадии I-IIIB modified Walsh-Kliegman.',
        source: 'Bell 1978; Walsh-Kliegman 1986',
        audit_id: 'A27',
      },
      {
        id: 'neo-papile',
        title: 'Papile ВЖК',
        desc: 'Степени intraventricular hemorrhage I-IV.',
        source: 'Papile 1978; Volpe 2018',
        audit_id: 'A28',
      },
      {
        id: 'neo-bpd-nih',
        title: 'NIH BPD consensus',
        desc: 'Severity grading бронхолёгочной дисплазии @ 36 нед PMA.',
        source: 'Jobe-Bancalari 2001; Higgins 2018',
        audit_id: 'A29',
      },
      {
        id: 'neo-icrop3',
        title: 'ICROP3 ROP staging',
        desc: 'Зоны 1-3, стадии 0-5, plus disease, AROP.',
        source: 'Chiang Ophthalmology 2021',
        audit_id: 'A30',
      },
    ],
  },
  {
    title: 'ХИЭ и нейропротекция',
    tools: [
      {
        id: 'neo-hie-cooling',
        title: 'TH eligibility (NICHD/TOBY)',
        desc: 'Критерии охлаждения при HIE: physiologic + perinatal + clinical.',
        source: 'NICHD; TOBY UK; SIBEN; КР МЗ РФ ХИЭ',
        audit_id: 'A26',
      },
    ],
  },
  {
    title: 'RDS, вентиляция, газы',
    tools: [
      {
        id: 'neo-downes',
        title: 'Downes Score (RDS)',
        desc: 'Тяжесть синдрома дыхательных расстройств (max 10).',
        source: 'Downes JJ 1970; КР МЗ РФ',
        audit_id: 'A3',
      },
      {
        id: 'neo-resp-indices',
        title: 'OI / OSI / A-aDO₂ / P/F / SF',
        desc: 'Decision-making по iNO, HFOV, ECMO. ELSO criteria.',
        source: 'Khemani 2009; ELSO; PALICC 2015',
        audit_id: 'A39',
      },
      {
        id: 'neo-abg',
        title: 'ABG / acid-base interpretation',
        desc: 'Систематическая интерпретация газов крови у новорождённого.',
        source: 'Tin Adv Neonatal Care 2017; КР МЗ РФ КЩС',
        audit_id: 'A40',
      },
    ],
  },
  {
    title: 'Боль, седация, NAS',
    tools: [
      {
        id: 'neo-nips',
        title: 'NIPS (Neonatal Infant Pain Scale)',
        desc: 'Поведенческая шкала боли у термин (≥ 32 нед).',
        source: 'Lawrence 1993; AAP 2016',
        audit_id: 'A34',
      },
      {
        id: 'neo-pipp-r',
        title: 'PIPP-R (Premature Infant Pain Profile)',
        desc: 'Шкала боли у недоношенных, 7 индикаторов.',
        source: 'Stevens 2014',
        audit_id: 'A35',
      },
      {
        id: 'neo-npass',
        title: 'N-PASS (Pain + Sedation)',
        desc: 'Бимодальная шкала боли (+) и седации (−).',
        source: 'Hummel 2008',
        audit_id: 'A36',
      },
      {
        id: 'neo-finnegan',
        title: 'Modified Finnegan (NAS)',
        desc: '22 признака неонатального абстинентного синдрома.',
        source: 'Finnegan 1975; Hudak/Tan AAP 2012',
        audit_id: 'A7',
      },
    ],
  },
  {
    title: 'Питание (PN + EN)',
    tools: [
      {
        id: 'neo-tpn',
        title: 'TPN macronutrient (ESPGHAN PN 2018)',
        desc: 'Белок, липиды, GIR, ккал/кг/сут с ramp-up по дням.',
        source: 'ESPGHAN/ESPEN/ESPR/CSPEN 2018 (Clin Nutr 37:2306)',
        audit_id: 'A13',
      },
      {
        id: 'neo-enteral',
        title: 'Enteral feed advancement (VLBW/ELBW)',
        desc: 'Темпы продвижения 15-40 мл/кг/сут по фазе и массе.',
        source: 'ESPGHAN 2022 EN Position',
        audit_id: 'A14',
      },
    ],
  },
  {
    title: 'Рост и развитие',
    tools: [
      {
        id: 'neo-newt',
        title: 'NEWT — потеря массы у эксклюзивно-грудных',
        desc: '% потеря; cut-offs <peak / mild (peak-9.9%) / pathologic (≥10%).',
        source: 'Flaherman 2015; newbornweight.org',
        audit_id: 'A21',
      },
      {
        id: 'neo-who-growth',
        title: 'WHO Growth Standards 0-24 мес (term)',
        desc: 'Перцентили и Z-scores массы по возрасту.',
        source: 'WHO Multicentre 2006',
        audit_id: 'A20',
      },
      {
        id: 'dubowitz',
        title: 'Dubowitz GA',
        desc: 'Классическая GA шкала по 21 критерию.',
        source: 'Dubowitz LMS 1970',
        audit_id: 'A5',
      },
    ],
  },
  {
    title: 'Тяжесть состояния',
    tools: [
      {
        id: 'crib',
        title: 'CRIB-II / SNAP-II / SNAPPE-II',
        desc: 'Severity score в неонатальной реанимации.',
        source: 'Parry 2003; Richardson 2001',
        audit_id: 'A31/A32',
      },
    ],
  },
  {
    title: 'Полицитемия',
    tools: [
      {
        id: 'neo-partial-exchange',
        title: 'Partial Exchange (полицитемия)',
        desc: 'Расчёт объёма частичного обмена 0.9% NaCl при Hct ≥ 65 %.',
        source: 'Rawlings AJDC 1982; AAP CFN 2008',
        audit_id: 'A38',
      },
    ],
  },
];

const cardLink: React.CSSProperties = {
  display: 'block',
  padding: '14px 16px',
  background: '#FFFFFF',
  border: '1px solid #E5E7EB',
  borderRadius: 12,
  textDecoration: 'none',
  color: '#1A1A1A',
  transition: 'border-color 200ms, box-shadow 200ms',
};

const cardLinkSecondary: React.CSSProperties = {
  display: 'block',
  padding: '12px 14px',
  background: '#F5F6F8',
  borderRadius: 10,
  textDecoration: 'none',
  color: '#1A1A1A',
};

export default function NeonatologyPage() {
  const totalP1 = P1_GROUPS.reduce((s, g) => s + g.tools.length, 0);

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
          P0 — обязательный набор ({P0_TOOLS.length} инструментов)
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
              <Link href={`/tools/${t.id}`} style={cardLink}>
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
          P1 — расширенный набор ({totalP1} инструментов)
        </h2>
        <p style={{ color: '#6B7280', fontSize: 14, margin: '0 0 24px' }}>
          Специализированные инструменты по тематическим группам: сепсис,
          гипербилирубинемия, неврология, питание, боль, рост, тяжесть
          состояния.
        </p>

        {P1_GROUPS.map((group) => (
          <div key={group.title} style={{ marginBottom: 28 }}>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 17,
                fontWeight: 700,
                margin: '0 0 6px',
                color: '#1F2937',
              }}
            >
              {group.title}
            </h3>
            {group.description && (
              <p style={{ fontSize: 13, color: '#6B7280', margin: '0 0 12px' }}>
                {group.description}
              </p>
            )}
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
              {group.tools.map((t) => (
                <li key={t.id}>
                  <Link href={`/tools/${t.id}`} style={cardLinkSecondary}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        marginBottom: 4,
                      }}
                    >
                      <strong style={{ fontSize: 14 }}>{t.title}</strong>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 10.5,
                          color: '#9CA3AF',
                          fontWeight: 600,
                        }}
                      >
                        {t.audit_id}
                      </span>
                    </div>
                    <p style={{ fontSize: 12.5, color: '#6B7280', margin: '4px 0 4px' }}>
                      {t.desc}
                    </p>
                    <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0, lineHeight: 1.35 }}>
                      {t.source}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
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
          Что планируется добавить (M7-M12 sprints)
        </h3>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13.5, color: '#4B5563', lineHeight: 1.6 }}>
          <li>Drug DB неонатальный (NeoFax + BNFc + РФ-формуляр) — 150+ препаратов</li>
          <li>Алгоритмы первичной реанимации (РФ / NRP / ERC / HBB) с таймером и flowchart UI</li>
          <li>Kangaroo Mother Care (KMC), surfactant LISA/MIST/INSURE — interactive checklists</li>
          <li>i18n RU / UZ / EN для всех инструментов</li>
          <li>Региональный селектор (РФ / Узбекистан / Международный) с persistence</li>
          <li>Offline PWA — все P0 инструменты работают без сети</li>
          <li>Кейсы и тесты подготовки к аккредитации</li>
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
