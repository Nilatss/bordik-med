/**
 * Блок «Связанные ресурсы» внизу /tools/[id].
 *
 * Three sections:
 *   1. Клинические рекомендации Минздрава (cr.minzdrav.gov.ru) — внешние ссылки
 *   2. Коды МКБ-10 — внутренние, ведут на /icd10
 *   3. (опционально) связанные курсы Bordik — на текущем этапе берём
 *      только из category, full mapping будет в Phase 2.
 *
 * Если нет связанных кодов — компонент возвращает null (не рендерим
 * пустой блок). Это позволяет применять компонент глобально для всех
 * 738 страниц без визуальных артефактов на инструментах-«ресурсах»
 * (Справочники, Конверсии единиц, Россия и т.д.).
 *
 * Server-side компонент: только рендеринг, никаких хуков и состояния.
 */

import { getRelatedMkb10, minzdravGuidelineSearchUrl } from '@/lib/tool-relations';

interface Props {
  toolId: string;
  subcategory: string;
}

export default function RelatedLinks({ toolId, subcategory }: Props) {
  const codes = getRelatedMkb10(toolId, subcategory);

  if (codes.length === 0) return null;

  return (
    <section
      aria-label="Связанные ресурсы"
      className="mt-7 py-[22px] px-6 bg-[#F5F6F8] rounded-[16px]"
    >
      <h2 className="mt-0 mb-4 mx-0 font-[var(--font-display)] text-base font-bold text-[#1A1A1A] tracking-[-0.01em]">
        Связанные ресурсы
      </h2>

      {/* МКБ-10 — внутренние ссылки на /icd10 */}
      <div className="mb-[18px]">
        <h3 className="mt-0 mb-2 mx-0 font-[var(--font-mono,ui-monospace)] text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.08em]">
          Коды МКБ-10
        </h3>
        <div className="flex flex-wrap gap-2">
          {codes.map((code) => (
            <a
              key={code}
              href={`/icd10`}
              className="inline-flex items-center gap-1.5 py-[5px] px-3 bg-white text-[#2563EB] border border-[#DBEAFE] rounded-full no-underline font-[var(--font-mono,ui-monospace)] text-xs font-bold tracking-[0.02em] transition-[background,border-color] duration-150"
            >
              {code}
            </a>
          ))}
        </div>
      </div>

      {/* Клинические рекомендации Минздрава — внешние */}
      <div>
        <h3 className="mt-0 mb-2 mx-0 font-[var(--font-mono,ui-monospace)] text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.08em]">
          Клинические рекомендации Минздрава
        </h3>
        <ul className="list-none p-0 m-0 flex flex-col gap-1.5">
          {codes.map((code) => (
            <li key={`cr-${code}`}>
              <a
                href={minzdravGuidelineSearchUrl(code)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 py-1 px-0 text-[#1A1A1A] no-underline font-[var(--font-body)] text-[13px] leading-[1.4]"
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                  stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                  className="shrink-0">
                  <path d="M14 3h7v7" />
                  <path d="M10 14L21 3" />
                  <path d="M21 14v7H3V3h7" />
                </svg>
                <span className="underline underline-offset-2">
                  Поиск по {code} на cr.minzdrav.gov.ru
                </span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-2.5 pt-2.5 border-t border-[#E5E7EB] text-[11px] text-[#9CA3AF] leading-[1.5]">
          Поиск ведёт в Рубрикатор Минздрава России — официальный реестр
          клинических рекомендаций. По коду МКБ-10 находите утверждённую КР
          с алгоритмами, дозами, уровнями доказательности.
        </p>
      </div>
    </section>
  );
}
