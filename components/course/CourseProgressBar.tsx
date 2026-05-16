'use client';

import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

/**
 * Striped green progress track with inline position label and end label.
 * The bar WIDTH animates via a framer-motion spring; the % caption is
 * derived directly from `pct` to avoid forcing a React re-render on every
 * spring frame (~60 fps), which used to make topic switches feel laggy.
 */
export default function CourseProgressBar({
  pct, currentLabel, endLabel, startCaption, endCaption,
}: {
  pct: number;
  currentLabel: string;
  endLabel: string;
  startCaption: string;
  endCaption: string;
}) {
  const safePct = Math.max(8, Math.min(100, pct));

  // Spring-animated percentage drives the bar width only — no setState
  // bridge, no per-frame React re-renders.
  const animatedPct = useSpring(safePct, { stiffness: 110, damping: 24 });
  const widthString = useTransform(animatedPct, (v) => `${v}%`);

  useEffect(() => {
    animatedPct.set(safePct);
  }, [safePct, animatedPct]);

  // The end-label colour switch is now driven by the prop value (instant
  // change) rather than the animated value — visually the threshold is
  // crossed at the same moment the user picks a new topic anyway.
  const labelOnGreen = safePct >= 80;

  return (
    <div className="w-full">
      {/* Bar */}
      <div className="relative h-8 rounded-md bg-[#F1F3F6] overflow-hidden">
        {/* Filled portion — solid green base + translucent white diagonal
            stripes overlay. Static (no animation): drift kept causing a
            visible snap at the keyframe boundary regardless of period math. */}
        <motion.div
          className="absolute top-0 left-0 bottom-0 bg-[#22C55E] bg-[repeating-linear-gradient(115deg,rgba(255,255,255,0.16)_0_10px,transparent_10px_20px)] rounded-md flex items-center pl-3"
          // eslint-disable-next-line react/forbid-dom-props -- framer-motion animated width
          style={{ width: widthString }}
        >
          <motion.span
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: [0.05, 0.7, 0.1, 1] }}
            key={currentLabel}
            className="relative font-[var(--font-body)] text-xs font-semibold text-white whitespace-nowrap [text-shadow:0_1px_1px_rgba(0,0,0,0.12)]"
          >
            {currentLabel}
          </motion.span>
        </motion.div>

        {/* End label — switches to white as bar overtakes it (≥ 80 %). */}
        <motion.span
          animate={{
            color: labelOnGreen ? '#FFFFFF' : '#6B7280',
            textShadow: labelOnGreen ? '0 1px 1px rgba(0,0,0,0.18)' : '0 0 0 rgba(0,0,0,0)',
          }}
          transition={{ duration: 0.25 }}
          className="absolute right-3 top-1/2 -translate-y-1/2 font-[var(--font-body)] text-xs font-semibold"
        >
          {endLabel}
        </motion.span>
      </div>

      {/* Captions row */}
      <div className="flex justify-between items-center mt-1.5 font-[var(--font-body)] text-[11px] text-[#6B7280]">
        <span>{startCaption}</span>
        <span className="font-semibold text-[#3B82F6]">
          {safePct}% пройдено
        </span>
        <span>{endCaption}</span>
      </div>
    </div>
  );
}
