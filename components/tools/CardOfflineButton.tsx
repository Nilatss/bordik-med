'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { isToolCached, cacheTool } from '@/lib/offline-cache';

/**
 * Кнопка «Скачать офлайн» на карточке каталога. Размер и поведение
 * зеркалят CardFavButton (26×26 квадрат, скруглённый, иконка 13×13),
 * чтобы две action-кнопки на карточке выглядели как один комплект.
 *
 * Состояния:
 *   - available  — серый, иконка стрелки-вниз, по клику запускает кеш
 *   - saving     — disabled spinner-ish (без анимации, просто disabled)
 *   - cached     — зелёный, иконка чек-марка («уже доступно офлайн»)
 *
 * Не используем text — только иконка, чтобы не утяжелять карточку.
 * onClick останавливает propagation: иначе клик по кнопке открывает
 * сам инструмент (родительская карточка `<button>`).
 */
export const CardOfflineButton = React.memo(function CardOfflineButton({
  toolId,
}: { toolId: string }) {
  const [state, setState] = useState<'unknown' | 'cached' | 'available' | 'saving'>('unknown');

  useEffect(() => {
    let cancelled = false;
    isToolCached(toolId)
      .then((c) => {
        if (!cancelled) setState(c ? 'cached' : 'available');
      })
      .catch(() => {
        // Cache API unavailable (private mode, storage quota) — show the
        // download button anyway so the user can attempt a cache.
        if (!cancelled) setState('available');
      });
    return () => { cancelled = true; };
  }, [toolId]);

  if (state === 'unknown') return null;

  const isCached = state === 'cached';
  const isSaving = state === 'saving';

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isCached || isSaving) return;
    setState('saving');
    const ok = await cacheTool(toolId);
    setState(ok ? 'cached' : 'available');
  };

  // P1-CR-4: migrated from inline style to Tailwind utility classes.
  // Hover states теперь через `hover:` modifier (CSS) вместо JS handlers.
  const baseClass = 'relative w-[26px] h-[26px] rounded-lg inline-flex items-center justify-center shrink-0 transition-[background,color,box-shadow,border-color] duration-[160ms]';
  const stateClass = isCached
    ? 'bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] hover:bg-[#D1FAE5]'
    : 'bg-white text-[#9CA3AF] border border-transparent shadow-[0_1px_2px_rgba(16,24,40,0.06),0_2px_6px_rgba(16,24,40,0.06)] hover:bg-[#F5F6F8]';
  const cursorClass = isSaving ? 'cursor-wait opacity-60' : 'cursor-pointer opacity-100';

  return (
    <motion.div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          handleClick(e as unknown as React.MouseEvent);
        }
      }}
      aria-label={isCached
        ? 'Доступно офлайн'
        : isSaving ? 'Сохраняем…' : 'Скачать для офлайн-доступа'}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 480, damping: 22 }}
      className={`${baseClass} ${stateClass} ${cursorClass}`}
    >
      {isCached ? (
        <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width={13} height={13} viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      )}
    </motion.div>
  );
});
