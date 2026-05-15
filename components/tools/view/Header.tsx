/**
 * Header, FavouriteButton, InfoPill, IconBolt/Tag/Book/Globe — top-of-page
 * primitives для ToolView.
 *
 * P1-CR-3 step 6/8 — extracted from ToolView.tsx.
 *
 * `Header` — title + subcategory pill + country tags + offline badge +
 * favourite toggle + tool description.
 *
 * `FavouriteButton` — amber/gold pill (matches module-final test pill on
 * TestPanel). Spring scale pop + 6-sparkle burst на add, silent shrink
 * на remove.
 *
 * `InfoPill` + `IconBolt/Tag/Book/Globe` — reference-tab "Источник"
 * info row primitives.
 */
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { primaryCountriesFor } from '@/lib/tool-meta-helpers';
import EmojiOrFlag from '@/components/ui/EmojiOrFlag';
import { OfflineBadge } from '../OfflineBadge';

export function FavouriteButton({ isFavourite, onToggle }: {
  isFavourite: boolean;
  onToggle: () => void;
}) {
  // burstKey changes only when user JUST added to favourites — drives
  // <AnimatePresence> for sparkle particles. Button itself relies на
  // framer-motion's `animate` prop tied to `isFavourite`.
  const [burstKey, setBurstKey] = useState(0);
  const handleClick = () => {
    if (!isFavourite) setBurstKey((k) => k + 1);
    onToggle();
  };
  // 6 sparkles around star at evenly spaced angles
  const sparkles = useMemo(
    () => Array.from({ length: 6 }, (_, i) => {
      const angle = (i / 6) * Math.PI * 2;
      return {
        x: Math.cos(angle) * 22,
        y: Math.sin(angle) * 22,
      };
    }),
    [],
  );
  const stateClass = isFavourite
    ? 'bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] border-[#FDE68A]'
    : 'bg-[#F0F1F5] hover:bg-[#E2E4EA] text-[#6B7280] border-transparent';
  return (
    <motion.button
      type="button"
      onClick={handleClick}
      aria-label={isFavourite ? 'Убрать из избранного' : 'Добавить в избранное'}
      animate={{ scale: 1 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 480, damping: 22 }}
      className={`relative inline-flex items-center gap-1.5 py-[5px] pl-2 pr-2.5 rounded-full border cursor-pointer font-[var(--font-body)] text-[11px] font-semibold transition-[background,color,border-color] duration-[160ms] overflow-visible ${stateClass}`}
    >
      <motion.span
        className="relative inline-flex items-center justify-center w-[11px] h-[11px]"
        // Star itself: pop on add, gentle shrink-to-baseline on remove
        animate={isFavourite
          ? { scale: [0.6, 1.4, 1], rotate: [-90, 12, 0] }
          : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.45, ease: [0.05, 0.7, 0.1, 1] }}
      >
        <svg width={11} height={11} viewBox="0 0 24 24"
          fill={isFavourite ? '#D97706' : 'none'}
          stroke={isFavourite ? '#D97706' : 'currentColor'}
          strokeWidth={isFavourite ? 0 : 2}
          strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>

        {/* Sparkle burst on add. Re-mounted via burstKey so each click replays. */}
        <AnimatePresence>
          {isFavourite && burstKey > 0 && sparkles.map((s, i) => (
            <motion.span
              key={`${burstKey}-${i}`}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
              animate={{ x: s.x, y: s.y, opacity: 0, scale: 0.2 }}
              transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1], delay: i * 0.012 }}
              className={`absolute left-1/2 top-1/2 w-1 h-1 -ml-0.5 -mt-0.5 rounded-full pointer-events-none ${i % 2 === 0 ? 'bg-[#F59E0B]' : 'bg-[#FBBF24]'}`}
            />
          ))}
        </AnimatePresence>
      </motion.span>
      {isFavourite ? 'В избранном' : 'В избранное'}
    </motion.button>
  );
}

export function Header({ tool, kind }: {
  tool: { id: string; title: string; subcategory: string; category: string; description?: string; countries?: string | null };
  kind?: string;
}) {
  const isFavourite = useAppStore((s) => s.toolsFavourites.includes(tool.id));
  const toggleFav = useAppStore((s) => s.toggleFavouriteTool);
  const toolCountries = primaryCountriesFor(tool.countries);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        {kind && (
          <span className="py-[3px] px-2.5 text-[11px] font-[var(--font-body)] font-medium rounded-full bg-[#E2E4EA] text-[#374151]">
            {kind}
          </span>
        )}
        <span className="py-[3px] px-2.5 text-[11px] font-[var(--font-body)] font-normal text-[#6B7280] bg-[#F0F1F5] rounded-full">
          {tool.subcategory}
        </span>
        {/* Country tags — shown as sibling pills so the user sees at a
            glance where the tool is used. Same pill style as subcategory. */}
        {toolCountries.slice(0, 3).map((c) => (
          <span key={c.name} title={c.name} className="inline-flex items-center gap-[5px] py-[3px] px-2.5 text-[11px] font-[var(--font-body)] font-normal text-[#6B7280] bg-[#F0F1F5] rounded-full">
            <EmojiOrFlag emoji={c.flag} size={12} />
            {c.name}
          </span>
        ))}
        {toolCountries.length > 3 && (
          <span className="py-[3px] px-2 text-[11px] font-[var(--font-mono)] font-semibold text-[#6B7280] bg-[#F0F1F5] rounded-full">
            +{toolCountries.length - 3}
          </span>
        )}
        {/* Offline cache pill — pre-cache JSON для offline-first UX. Sits
            рядом с favourite, оба quick-actions в одной строке. */}
        <OfflineBadge toolId={tool.id} />
        {/* Favourite toggle — amber/gold palette matches module-final test
            pill on TestPanel. Pop animation on add, sparkle burst. */}
        <FavouriteButton
          isFavourite={isFavourite}
          onToggle={() => toggleFav(tool.id)}
        />
      </div>
      <h1 className="font-[var(--font-display)] text-[length:var(--text-2xl)] font-bold text-[color:var(--md-sys-color-on-surface)] mb-2 tracking-[-0.02em] leading-[1.2]">
        {tool.title}
      </h1>
      {tool.description && (
        <p className="font-[var(--font-body)] text-[length:var(--text-sm)] text-[color:var(--md-sys-color-on-surface-variant)] max-w-[var(--content-max)] leading-[1.6]">
          {tool.description}
        </p>
      )}
    </div>
  );
}

export function InfoPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex-1 min-w-[160px] bg-[#F5F6F8] rounded-[12px] py-3 px-4 flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-[#6B7280]">
        {icon}
        <span className="font-[var(--font-mono)] text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.06em]">
          {label}
        </span>
      </div>
      <span className="font-[var(--font-body)] text-[13px] font-semibold text-[#1A1A1A] leading-[1.35] overflow-hidden text-ellipsis">
        {value}
      </span>
    </div>
  );
}

export function IconBolt() {
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
}
export function IconTag() {
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1={7} y1={7} x2={7.01} y2={7}/></svg>;
}
export function IconBook() {
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>;
}
export function IconGlobe() {
  return <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx={12} cy={12} r={10}/><line x1={2} y1={12} x2={22} y2={12}/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>;
}
