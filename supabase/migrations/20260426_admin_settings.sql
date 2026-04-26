-- Admin Settings: zentrale Konfiguration fuer Webseiten-PW, Admin-PW, 2FA
-- Single-Row-Tabelle mit fester id=1, niemals mehr als ein Datensatz
create table if not exists admin_settings (
  id int primary key default 1,
  site_password_hash text,
  admin_password_hash text not null,
  totp_secret text,
  totp_enabled boolean not null default false,
  backup_codes text[] not null default '{}',
  notification_email text not null default 'simon.topalli@hyponova.ch',
  updated_at timestamptz not null default now(),
  constraint admin_settings_singleton check (id = 1)
);

-- Initial-Datensatz mit Default-Hashes (werden beim ersten Login gesetzt)
-- Hashes leer → Code faellt auf process.env zurueck (Migration ohne Downtime)
insert into admin_settings (id, site_password_hash, admin_password_hash, notification_email)
values (1, null, '', 'simon.topalli@hyponova.ch')
on conflict (id) do nothing;

-- Reset-Tokens fuer Admin-Passwort-Aenderung per Email
create table if not exists admin_password_reset_tokens (
  token text primary key,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_admin_password_reset_tokens_expires
  on admin_password_reset_tokens (expires_at)
  where used = false;

-- RLS aus, Tabellen werden ausschliesslich vom Service-Role-Key zugegriffen
alter table admin_settings disable row level security;
alter table admin_password_reset_tokens disable row level security;
