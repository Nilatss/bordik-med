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
      className="mb-[var(--space-5)] py-[14px] px-[18px] bg-[#FEF3C7] border border-[#F59E0B] rounded-[12px] text-[13px] leading-[1.6] text-[#78350F] font-[var(--font-body)]"
    >
      <strong className="text-[#7C2D12] text-sm">
        ⚠️ Калькуляторы родзала и NICU — стартовая оценка, не финальное решение
      </strong>
      <ul className="mt-2 mb-0 mx-0 pl-5">
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
            className="text-[#7C2D12] underline"
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
            className="text-[#7C2D12] underline"
          >
            cr.minzdrav.gov.ru
          </a>
          ,{' '}
          <a
            href="https://gov.uz/ru/ssv/pages/milliy-klinik-protokollar"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#7C2D12] underline"
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
