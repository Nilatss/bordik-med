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

  const stateClass = available
    ? 'cursor-pointer opacity-100 hover:bg-[#F0F2F5]'
    : 'cursor-not-allowed opacity-[0.48]';

  return (
    <button
      onClick={handleClick}
      onMouseEnter={handlePrefetch}
      onFocus={handlePrefetch}
      disabled={!available}
      className={`bg-[#F5F6F8] rounded-[var(--md-sys-shape-corner-extra-large)] border-none p-[var(--space-5)] text-left relative overflow-hidden min-h-[160px] flex flex-col justify-between transition-colors duration-[300ms] ease-[cubic-bezier(0.22,1,0.36,1)] [content-visibility:auto] [contain-intrinsic-size:160px_220px] ${stateClass}`}
    >
      {!available && (
        <div className="absolute top-3 right-3 z-[2] inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-[#1A1A1A] text-white font-[var(--font-mono)] text-[10px] font-bold tracking-[0.06em] uppercase shadow-[0_2px_8px_rgba(0,0,0,0.12)]">
          <svg width={10} height={10} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          {t('tools.inDevelopment')}
        </div>
      )}

      <div className="mb-[var(--space-3)] relative z-[1] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 flex-1 min-w-0 flex-wrap">
          <span className="inline-flex items-center gap-[var(--space-1)] py-1 px-[var(--space-2)] rounded-[var(--md-sys-shape-corner-full)] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)] font-[var(--font-mono)] text-[0.625rem] font-medium text-[color:var(--md-sys-color-on-surface-variant)]">
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
                    className="inline-flex items-center gap-1 py-1 px-[var(--space-2)] rounded-[var(--md-sys-shape-corner-full)] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)] font-[var(--font-mono)] text-[0.625rem] font-medium text-[color:var(--md-sys-color-on-surface-variant)] whitespace-nowrap"
                  >
                    <EmojiOrFlag emoji={c.flag} size={12} />
                    {c.name}
                  </span>
                ))}
                {extra > 0 && (
                  <span className="inline-flex items-center py-1 px-2 rounded-full bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)] font-[var(--font-mono)] text-[0.625rem] font-semibold text-[#6B7280]">
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
          <span className="inline-flex items-center gap-1.5 shrink-0">
            <CardOfflineButton toolId={tool.id} />
            <CardFavButton
              isFavourite={isFavourite}
              onClick={handleFavClick}
              ariaLabel={isFavourite ? t('tool.favorite.removeAria') : t('tool.favorite.addAria')}
            />
          </span>
        )}
      </div>

      <div className="relative z-[1] flex-1">
        <h3 className="font-[var(--font-display)] text-[length:var(--text-base)] font-bold text-[color:var(--md-sys-color-on-surface)] mb-[var(--space-1)] leading-[1.25]">
          {tool.title}
        </h3>
        <p className="font-[var(--font-body)] text-[length:var(--text-xs)] text-[color:var(--md-sys-color-on-surface-variant)] leading-[1.4] overflow-hidden [-webkit-line-clamp:3] [-webkit-box-orient:vertical] [display:-webkit-box]">
          {tool.description}
        </p>
      </div>

      <div className="flex items-center gap-[var(--space-1)] mt-[var(--space-3)] relative z-[1]">
        <span className={`font-[var(--font-body)] text-[length:var(--text-xs)] font-medium ${available ? 'text-[color:var(--md-sys-color-on-surface)]' : 'text-[#9CA3AF]'}`}>
          {available ? t('tools.openTool') : t('tools.cardInDevelopment')}
        </span>
        {available && <ArrowRight size={14} color="var(--md-sys-color-on-surface)" />}
      </div>
    </button>
  );
});
