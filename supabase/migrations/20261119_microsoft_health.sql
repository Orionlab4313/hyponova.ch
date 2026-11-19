-- Zustand der Microsoft-Verbindung (Teams-Links), geschrieben vom täglichen
-- Keep-Alive-Cron und bei jedem Token-Refresh. Idempotent.
alter table public.admin_settings
  add column if not exists microsoft_last_check_at timestamptz,
  add column if not exists microsoft_last_error text;
