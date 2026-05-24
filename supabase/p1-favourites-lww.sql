-- ════════════════════════════════════════════════════════════════
-- Favourites cross-device LWW — adds a dedicated last-write timestamp.
--
-- Stage-3 bug audit MEDIUM: removing a tool from favourites on one device
-- never propagated to another (the client PULL merged favourites with a
-- union, so a delete on device A was re-added from the server on device B).
--
-- A correct last-write-wins needs a favourites-SPECIFIC timestamp, because
-- tool_settings.updated_at is bumped on EVERY sync push (favourites are sent
-- alongside filters/progress), so it can't tell "favourites changed" from
-- "something else changed". This column tracks only favourites mutations
-- (set from the client's own toolsFavouritesUpdatedAt), letting the client
-- compare server-vs-local and adopt the newer set — so deletes propagate.
--
-- Additive + nullable + idempotent → safe to apply anytime. The app code
-- degrades gracefully when this column is absent/NULL (falls back to the
-- legacy union merge), so apply order vs deploy does not matter.
-- ════════════════════════════════════════════════════════════════

alter table public.tool_settings
  add column if not exists favourites_updated_at timestamptz;

-- ════════════════════════════════════════════════════════════════
-- Verification:
--   select column_name from information_schema.columns
--     where table_schema='public' and table_name='tool_settings'
--       and column_name='favourites_updated_at';
--   -- expected: 1 row
-- ════════════════════════════════════════════════════════════════
