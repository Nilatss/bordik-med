'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * Striped green progress track with inline position label and end label —
 * styled 1:1 with the insurance-policy reference screenshot. Width and
 * percentage number animate smoothly via framer-motion springs.
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

  // Spring-animated percentage that the bar width and the caption number
  // both read from — keeps them perfectly in sync.
  const animatedPct = useSpring(0, { stiffness: 90, damping: 22 });
  const widthString = useTransform(animatedPct, (v) => `${v}%`);
  const [displayPct, setDisplayPct] = useState(0);

  useEffect(() => {
    animatedPct.set(safePct);
  }, [safePct, animatedPct]);

  // Mirror the spring value into a re-rendered integer so the % caption
  // and the threshold-driven end-label colour update on each frame.
  useEffect(() => {
    return animatedPct.on('change', (v) => setDisplayPct(Math.round(v)));
  }, [animatedPct]);

  const labelOnGreen = displayPct >= 80;

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
        {/* Filled portion — clean diagonal hatch like the reference. The
            inner moving layer is one full period wider than the visible bar
            and slides left via translateX → seamless infinite loop without
            background-position math (which is fragile at angled gradients). */}
        <motion.div
          style={{
            position: 'absolute', top: 0, left: 0, bottom: 0,
            width: widthString,
            background: '#22C55E',
            borderRadius: 6,
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', paddingLeft: 12,
          }}
        >
          {/* Sliding stripe layer — pointer-events: none so it doesn't
              swallow clicks; the inner content is rendered above. */}
          <span
            aria-hidden
            style={{
              position: 'absolute', top: 0, bottom: 0,
              // Wider than parent + offset so translateX(-PERIOD) lands on a
              // visually-identical position → loop is invisible.
              left: -28, right: 0, width: 'calc(100% + 28px)',
              backgroundImage:
                'repeating-linear-gradient(135deg, rgba(255,255,255,0.22) 0 10px, transparent 10px 28px)',
              animation: 'progress-stripes 6s linear infinite',
              pointerEvents: 'none',
              willChange: 'transform',
            }}
          />
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
          {displayPct}% пройдено
        </span>
        <span>{endCaption}</span>
      </div>
    </div>
  );
}
