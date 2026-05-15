/**
 * CardFavButton — favourite-toggle для grid-карточки tool'а.
 *
 * P1-CR-3 step 3/6 — extracted from ToolsPage.tsx.
 *
 * Shares the amber/gold palette с in-tool FavouriteButton (TestPanel
 * module-final pill colours): bg `#FEF3C7`, fg `#D97706`, border
 * `#FDE68A`. Adds the same star-pop + sparkle-burst animation на add —
 * silent на remove.
 */
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isFavourite: boolean;
  onClick: (e: React.MouseEvent) => void;
  ariaLabel: string;
}

export const CardFavButton = React.memo(function CardFavButton({
  isFavourite, onClick, ariaLabel,
}: Props) {
  const [burstKey, setBurstKey] = useState(0);
  const handleClick = (e: React.MouseEvent) => {
    if (!isFavourite) setBurstKey((k) => k + 1);
    onClick(e);
  };
  const sparkles = useMemo(
    () => Array.from({ length: 6 }, (_, i) => {
      const angle = (i / 6) * Math.PI * 2;
      return { x: Math.cos(angle) * 20, y: Math.sin(angle) * 20 };
    }),
    [],
  );
  // P1-CR-4: migrated from inline style to Tailwind classes (hover via :hover variant).
  const stateClass = isFavourite
    ? 'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] hover:bg-[#FDE68A]'
    : 'bg-white text-[#9CA3AF] border border-transparent shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)] hover:bg-[#F5F6F8]';
  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e as unknown as React.MouseEvent);
        }
      }}
      aria-label={ariaLabel}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 480, damping: 22 }}
      className={`w-[26px] h-[26px] rounded-lg relative inline-flex items-center justify-center cursor-pointer shrink-0 overflow-visible transition-[background,color,box-shadow,border-color] duration-[160ms] ${stateClass}`}
    >
      <motion.span
        animate={isFavourite
          ? { scale: [0.6, 1.4, 1], rotate: [-90, 12, 0] }
          : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.45, ease: [0.05, 0.7, 0.1, 1] }}
        className="inline-flex"
      >
        <svg width={13} height={13} viewBox="0 0 24 24"
          fill={isFavourite ? 'currentColor' : 'none'}
          stroke="currentColor" strokeWidth={isFavourite ? 0 : 1.9}
          strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </motion.span>
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
    </motion.div>
  );
});
