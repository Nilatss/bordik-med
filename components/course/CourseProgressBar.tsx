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
    <div style={{ width: '100%' }}>
      {/* Bar */}
      <div style={{
        position: 'relative',
        height: 32,
        borderRadius: 6,
        background: '#F1F3F6',
        overflow: 'hidden',
      }}>
        {/* Filled portion — solid green base + translucent white diagonal
            stripes overlay. Static (no animation): drift kept causing a
            visible snap at the keyframe boundary regardless of period math. */}
        <motion.div
          style={{
            position: 'absolute', top: 0, left: 0, bottom: 0,
            width: widthString,
            backgroundColor: '#22C55E',
            backgroundImage:
              'repeating-linear-gradient(115deg, rgba(255,255,255,0.16) 0 10px, transparent 10px 20px)',
            borderRadius: 6,
            display: 'flex', alignItems: 'center', paddingLeft: 12,
          }}
        >
          <motion.span
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: [0.05, 0.7, 0.1, 1] }}
            key={currentLabel}
            style={{
              position: 'relative',
              fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
              color: '#FFFFFF', whiteSpace: 'nowrap',
              textShadow: '0 1px 1px rgba(0,0,0,0.12)',
            }}
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
          style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
          }}
        >
          {endLabel}
        </motion.span>
      </div>

      {/* Captions row */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 6,
        fontFamily: 'var(--font-body)', fontSize: 11, color: '#6B7280',
      }}>
        <span>{startCaption}</span>
        <span style={{ fontWeight: 600, color: '#3B82F6' }}>
          {safePct}% пройдено
        </span>
        <span>{endCaption}</span>
      </div>
    </div>
  );
}
