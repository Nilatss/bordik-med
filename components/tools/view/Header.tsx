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
  return (
    <motion.button
      type="button"
      onClick={handleClick}
      aria-label={isFavourite ? 'Убрать из избранного' : 'Добавить в избранное'}
      animate={{ scale: 1 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 480, damping: 22 }}
      style={{
        position: 'relative',
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '5px 10px 5px 8px', borderRadius: 999,
        background: isFavourite ? '#FEF3C7' : '#F0F1F5',
        color: isFavourite ? '#92400E' : '#6B7280',
        border: isFavourite ? '1px solid #FDE68A' : '1px solid transparent',
        cursor: 'pointer',
        fontFamily: 'var(--font-body)', fontSize: 11, fontWeight: 600,
        transition: 'background 160ms, color 160ms, border-color 160ms',
        overflow: 'visible',
      }}
      onMouseEnter={(e) => {
        if (!isFavourite) e.currentTarget.style.background = '#E2E4EA';
        else e.currentTarget.style.background = '#FDE68A';
      }}
      onMouseLeave={(e) => {
        if (!isFavourite) e.currentTarget.style.background = '#F0F1F5';
        else e.currentTarget.style.background = '#FEF3C7';
      }}
    >
      <motion.span
        style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 11, height: 11 }}
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
              style={{
                position: 'absolute', left: '50%', top: '50%',
                width: 4, height: 4, marginLeft: -2, marginTop: -2,
                borderRadius: '50%',
                background: i % 2 === 0 ? '#F59E0B' : '#FBBF24',
                pointerEvents: 'none',
              }}
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
      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: 12,
      }}>
        {kind && (
          <span style={{
            padding: '3px 10px', fontSize: 11,
            fontFamily: 'var(--font-body)', fontWeight: 500,
            borderRadius: 999,
            backgroundColor: '#E2E4EA', color: '#374151',
          }}>
            {kind}
          </span>
        )}
        <span style={{
          padding: '3px 10px', fontSize: 11,
          fontFamily: 'var(--font-body)', fontWeight: 400,
          color: '#6B7280', background: '#F0F1F5', borderRadius: 999,
        }}>
          {tool.subcategory}
        </span>
        {/* Country tags — shown as sibling pills so the user sees at a
            glance where the tool is used. Same pill style as subcategory. */}
        {toolCountries.slice(0, 3).map((c) => (
          <span key={c.name} title={c.name} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 10px', fontSize: 11,
            fontFamily: 'var(--font-body)', fontWeight: 400,
            color: '#6B7280', background: '#F0F1F5', borderRadius: 999,
          }}>
            <EmojiOrFlag emoji={c.flag} size={12} />
            {c.name}
          </span>
        ))}
        {toolCountries.length > 3 && (
          <span style={{
            padding: '3px 8px', fontSize: 11,
            fontFamily: 'var(--font-mono)', fontWeight: 600,
            color: '#6B7280', background: '#F0F1F5', borderRadius: 999,
          }}>
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
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-2xl)',
        fontWeight: 700,
        color: 'var(--md-sys-color-on-surface)',
        marginBottom: 8,
        letterSpacing: '-0.02em',
        lineHeight: 1.2,
      }}>
        {tool.title}
      </h1>
      {tool.description && (
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: 'var(--md-sys-color-on-surface-variant)',
          maxWidth: 'var(--content-max)',
          lineHeight: 1.6,
        }}>
          {tool.description}
        </p>
      )}
    </div>
  );
}

export function InfoPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{
      flex: 1, minWidth: 160,
      background: '#F5F6F8',
      borderRadius: 12,
      padding: '12px 16px',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#6B7280' }}>
        {icon}
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
          color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          {label}
        </span>
      </div>
      <span style={{
        fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
        color: '#1A1A1A', lineHeight: 1.35,
        overflow: 'hidden', textOverflow: 'ellipsis',
      }}>
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
