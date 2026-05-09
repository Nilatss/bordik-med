'use client';

/**
 * Специализированный дисклеймер для неонатологического раздела.
 *
 * NEONATOLOGY MODULE audit issue 1.14 — отсутствуют дисклеймеры о
 * справочном характере калькуляторов. Особенно критично для родзала
 * и реанимации новорождённых, где ошибочный расчёт = ятрогенный вред.
 *
 * Дополняет ZetDisclaimer (ФЗ № 28-ФЗ — без ЗЕТ для аккредитации в РФ);
 * добавляет специфичные для неонатологии warnings:
 *   - Все калькуляторы — стартовые, требуют клинической верификации
 *   - X-ray verification обязательна для UVC/UAC/ETT
 *   - Региональные различия (NRP/ERC/МЗ РФ) — проверить локальный протокол
 *   - Для точных номограмм Bili-2022/Fenton 2025 → peditools.org
 *   - Не заменяет cr.minzdrav.gov.ru, gov.uz/ru/ssv, AAP/NICE официальные ресурсы
 *
 * Используется на /neonatology landing + per-tool footer для всех
 * neo-* runners.
 *
 * TODO(legal, P2): текст составлен внутри команды; до prod-запуска
 * провести юр-ревью с фокусом на медоборудование/отвественность.
 */

export default function NeonatologyDisclaimer() {
  return (
    <aside
      role="note"
      aria-label="Специализированный дисклеймер для неонатологического раздела"
      style={{
        marginBottom: 'var(--space-5)',
        padding: '14px 18px',
        background: '#FEF3C7',
        border: '1px solid #F59E0B',
        borderRadius: 12,
        fontSize: 13,
        lineHeight: 1.6,
        color: '#78350F',
        fontFamily: 'var(--font-body)',
      }}
    >
      <strong style={{ color: '#7C2D12', fontSize: 14 }}>
        ⚠️ Калькуляторы родзала и NICU — стартовая оценка, не финальное решение
      </strong>
      <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
        <li>
          Все расчёты (ЭТТ, UVC/UAC, GIR, реанимационные дозы) —{' '}
          <strong>стартовая оценка</strong>. X-ray верификация для
          катетеров и трубок обязательна.
        </li>
        <li>
          Региональные различия (NRP 8 ed. / ERC 2021 / МЗ РФ 04.03.2020)
          — проверьте локальный протокол ОРИТН перед применением.
        </li>
        <li>
          Для точных номограмм Bili-2022, Fenton 2025, Kaiser EOS
          используйте параллельно{' '}
          <a
            href="https://peditools.org"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#7C2D12', textDecoration: 'underline' }}
          >
            peditools.org
          </a>
          .
        </li>
        <li>
          Bordik не подменяет:{' '}
          <a
            href="https://cr.minzdrav.gov.ru"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#7C2D12', textDecoration: 'underline' }}
          >
            cr.minzdrav.gov.ru
          </a>
          ,{' '}
          <a
            href="https://gov.uz/ru/ssv/pages/milliy-klinik-protokollar"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#7C2D12', textDecoration: 'underline' }}
          >
            gov.uz UZ-протоколы
          </a>
          , AAP / NICE / WHO официальные ресурсы — это образовательно-
          справочный инструмент.
        </li>
        <li>
          Каждое решение по новорождённому — командная ответственность
          неонатолога / реаниматолога / акушера. Этот сервис не выдаёт
          ЗЕТ и не заменяет ДПО.
        </li>
      </ul>
    </aside>
  );
}
