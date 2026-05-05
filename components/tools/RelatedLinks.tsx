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
      style={{
        marginTop: 28,
        padding: '22px 24px',
        background: '#F5F6F8',
        borderRadius: 16,
      }}
    >
      <h2 style={{
        margin: '0 0 16px',
        fontFamily: 'var(--font-display)',
        fontSize: 16, fontWeight: 700,
        color: '#1A1A1A',
        letterSpacing: '-0.01em',
      }}>
        Связанные ресурсы
      </h2>

      {/* МКБ-10 — внутренние ссылки на /icd10 */}
      <div style={{ marginBottom: 18 }}>
        <h3 style={{
          margin: '0 0 8px',
          fontFamily: 'var(--font-mono, ui-monospace)',
          fontSize: 11, fontWeight: 700,
          color: '#9CA3AF',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          Коды МКБ-10
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {codes.map((code) => (
            <a
              key={code}
              href={`/icd10`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '5px 12px',
                background: '#FFFFFF',
                color: '#2563EB',
                border: '1px solid #DBEAFE',
                borderRadius: 999,
                textDecoration: 'none',
                fontFamily: 'var(--font-mono, ui-monospace)',
                fontSize: 12, fontWeight: 700,
                letterSpacing: '0.02em',
                transition: 'background 150ms, border-color 150ms',
              }}
            >
              {code}
            </a>
          ))}
        </div>
      </div>

      {/* Клинические рекомендации Минздрава — внешние */}
      <div>
        <h3 style={{
          margin: '0 0 8px',
          fontFamily: 'var(--font-mono, ui-monospace)',
          fontSize: 11, fontWeight: 700,
          color: '#9CA3AF',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          Клинические рекомендации Минздрава
        </h3>
        <ul style={{
          listStyle: 'none', padding: 0, margin: 0,
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          {codes.map((code) => (
            <li key={`cr-${code}`}>
              <a
                href={minzdravGuidelineSearchUrl(code)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '4px 0',
                  color: '#1A1A1A',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  lineHeight: 1.4,
                }}
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none"
                  stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
                  style={{ flexShrink: 0 }}>
                  <path d="M14 3h7v7" />
                  <path d="M10 14L21 3" />
                  <path d="M21 14v7H3V3h7" />
                </svg>
                <span style={{ textDecoration: 'underline', textUnderlineOffset: 2 }}>
                  Поиск по {code} на cr.minzdrav.gov.ru
                </span>
              </a>
            </li>
          ))}
        </ul>
        <p style={{
          marginTop: 10, paddingTop: 10,
          borderTop: '1px solid #E5E7EB',
          fontSize: 11, color: '#9CA3AF', lineHeight: 1.5,
        }}>
          Поиск ведёт в Рубрикатор Минздрава России — официальный реестр
          клинических рекомендаций. По коду МКБ-10 находите утверждённую КР
          с алгоритмами, дозами, уровнями доказательности.
        </p>
      </div>
    </section>
  );
}
