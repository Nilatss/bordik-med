/**
 * ToolCard — карточка инструмента в grid-каталоге.
 *
 * P1-CR-3 step 3/6 — extracted from ToolsPage.tsx.
 *
 * Pulls openTool / toggleFav / favouriteSet from `ToolCardContext` to
 * avoid 3× store-selector subscriptions × 60 cards.
 *
 * Plain `<button>` (а не motion.button) — Virtuoso recycles rows on
 * scroll, так что motion-fade-up при каждом re-mount = visible shimmer
 * под быстрым скроллом. Single CSS fade на parent list достаточно.
 */
import React, { useCallback } from 'react';
import { ArrowRight } from '@/components/icons';
import { useT } from '@/lib/i18n';
import EmojiOrFlag from '@/components/ui/EmojiOrFlag';
import { CardOfflineButton } from '../CardOfflineButton';
import type { CatalogTool } from '@/lib/tools-page/types';
import { getToolCountries } from '@/lib/tools-page/helpers';
import { ToolCardContext } from './ToolCardContext';
import { CardFavButton } from './CardFavButton';

export const ToolCard = React.memo(function ToolCard({ tool }: { tool: CatalogTool }) {
  const t = useT();
  const ctx = React.useContext(ToolCardContext)!;
  const { openTool, toggleFav, favouriteSet } = ctx;
  const isFavourite = favouriteSet.has(tool.id);
  const available = tool.available || tool.hasRunner;
  const countries = getToolCountries(tool);

  const handleClick = useCallback(() => {
    if (available) openTool(tool.id);
  }, [available, openTool, tool.id]);

  const handleFavClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleFav(tool.id);
  }, [toggleFav, tool.id]);

  // Warm the chunks needed to render this specific tool on hover/focus.
  // ToolView (markdown stack) + tools-runners (registry lookup) + the
  // SPECIFIC runner file (e.g. ./runners/cha2ds2-vasc). Without warming
  // the per-tool runner, clicking still waits ~150-300ms for that chunk
  // to download. Prefetching on hover hides the latency completely.
  const handlePrefetch = useCallback(() => {
    if (!available) return;
    import('@/components/tools/ToolView').catch(() => {});
    import('@/lib/tools-runners').catch(() => {});
    // Lazy-import the registry, then trigger the per-tool import.
    import('@/lib/runners')
      .then((m) => m.loadRunner(tool.id))
      .catch(() => { /* missing runner / network — silent */ });
  }, [available, tool.id]);

  return (
    <button
      onClick={handleClick}
      onMouseEnter={(e) => {
        handlePrefetch();
        if (available) e.currentTarget.style.background = '#F0F2F5';
      }}
      onFocus={handlePrefetch}
      onMouseLeave={(e) => { e.currentTarget.style.background = '#F5F6F8'; }}
      disabled={!available}
      style={{
        background: '#F5F6F8',
        borderRadius: 'var(--md-sys-shape-corner-extra-large)',
        border: 'none',
        padding: 'var(--space-5)', textAlign: 'left',
        cursor: available ? 'pointer' : 'not-allowed',
        opacity: available ? 1 : 0.48,
        position: 'relative', overflow: 'hidden', minHeight: 160,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        transition: 'background 300ms cubic-bezier(0.22,1,0.36,1)',
        // Browser skips layout/paint for off-screen cards — zero visual diff.
        contentVisibility: 'auto',
        containIntrinsicSize: '160px 220px',
      } as React.CSSProperties}
    >
      {!available && (
        <div style={{
          position: 'absolute', top: 12, right: 12, zIndex: 2,
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px',
          borderRadius: 999,
          background: '#1A1A1A',
          color: '#FFFFFF',
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
          letterSpacing: '0.06em', textTransform: 'uppercase',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        }}>
          <svg width={10} height={10} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          {t('tools.inDevelopment')}
        </div>
      )}

      <div style={{
        marginBottom: 'var(--space-3)', position: 'relative', zIndex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4, flex: 1, minWidth: 0,
          flexWrap: 'wrap',
        }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)',
            padding: '4px var(--space-2)', borderRadius: 'var(--md-sys-shape-corner-full)',
            background: '#FFFFFF',
            boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.625rem', fontWeight: 500,
            color: 'var(--md-sys-color-on-surface-variant)',
          }}>
            {tool.subcategory}
          </span>
          {/* Country tags — same pill style as subcategory. The countries
              array is parsed once per tool id and cached (getToolCountries).
              We cap at 2 to keep the card tidy; extra regions show as «+N». */}
          {countries.length > 0 && (() => {
            const visible = countries.slice(0, 2);
            const extra = countries.length - visible.length;
            return (
              <>
                {visible.map((c) => (
                  <span
                    key={c.name}
                    title={c.name}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '4px var(--space-2)', borderRadius: 'var(--md-sys-shape-corner-full)',
                      background: '#FFFFFF',
                      boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.625rem', fontWeight: 500,
                      color: 'var(--md-sys-color-on-surface-variant)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <EmojiOrFlag emoji={c.flag} size={12} />
                    {c.name}
                  </span>
                ))}
                {extra > 0 && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center',
                    padding: '4px 8px', borderRadius: 999,
                    background: '#FFFFFF',
                    boxShadow: '0 1px 2px rgba(16,24,40,0.06), 0 2px 6px rgba(16,24,40,0.06)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.625rem', fontWeight: 600,
                    color: '#6B7280',
                  }}>
                    +{extra}
                  </span>
                )}
              </>
            );
          })()}
        </div>
        {/* Favourite star + Download — два action-чипа карточки в одном
            размере (26×26). Сидят на той же строке, что и subcategory-тег,
            читаются как комплект. Скрываем оба на недоступных инструментах
            чтобы не пересекаться с абсолютно-позиционированным «Скоро»-бейджем. */}
        {available && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <CardOfflineButton toolId={tool.id} />
            <CardFavButton
              isFavourite={isFavourite}
              onClick={handleFavClick}
              ariaLabel={isFavourite ? t('tool.favorite.removeAria') : t('tool.favorite.addAria')}
            />
          </span>
        )}
      </div>

      <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
        <h3 style={{
          fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 700,
          color: 'var(--md-sys-color-on-surface)',
          marginBottom: 'var(--space-1)', lineHeight: 1.25,
        }}>
          {tool.title}
        </h3>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)',
          color: 'var(--md-sys-color-on-surface-variant)', lineHeight: 1.4,
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {tool.description}
        </p>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-1)',
        marginTop: 'var(--space-3)', position: 'relative', zIndex: 1,
      }}>
        <span style={{
          fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', fontWeight: 500,
          color: available ? 'var(--md-sys-color-on-surface)' : '#9CA3AF',
        }}>
          {available ? t('tools.openTool') : t('tools.cardInDevelopment')}
        </span>
        {available && <ArrowRight size={14} color="var(--md-sys-color-on-surface)" />}
      </div>
    </button>
  );
});
