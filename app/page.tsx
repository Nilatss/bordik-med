/**
 * P1-PERF-NEW-1 — `app/page.tsx` теперь Server Component.
 *
 * Содержит только тонкую обёртку, которая рендерит client-side SPA
 * shell (HomeApp). Server-side выгоды:
 *   - HTML outer chrome стрим server'ом (через layout.tsx + это)
 *   - Generation-time metadata + JSON-LD остаются server-rendered
 *   - HomeApp client-bundle всё равно был ssr:false — для юзера нет
 *     visible изменений
 *
 * Полная Server Component decomposition (split SPA на отдельные
 * routes /tools, /drugs, /icd10, /profile, /tests, /stats и т.д.) —
 * отдельный архитектурный sprint (2-3 нед). Сейчас — формальная
 * SC-обёртка, упрощает будущую миграцию (легко выделить /tools/page.tsx
 * без 'use client').
 *
 * См. components/home/HomeApp.tsx для actual SPA logic.
 */
import HomeApp from '@/components/home/HomeApp';

export default function Page() {
  return <HomeApp />;
}
