-- ============================================================
-- WinePass — Phase 1 schema reference (appellations / chateaux / bundles)
--
-- These three tables already exist in the live Supabase project
-- (bhpcmfghmfvzaxfjsbfp) and already have every column Phase 1 needs:
--   chateaux.description_fr, .lat, .lng, .address, .photo_url,
--   .wine_styles, .languages, .is_sustainable are all present.
--
-- No ALTER TABLE is required for Phase 1 — this file is written as
-- CREATE TABLE IF NOT EXISTS so it's a safe, idempotent reference for
-- reproducing the schema on a fresh project, and documents the shape
-- that supabase/seed_chateaux.sql writes into.
--
-- price_min / price_max are intentionally NOT stored on chateaux —
-- they're derived from MIN/MAX(bundles.price) per château so the
-- "from €X" price never goes stale when bundle prices change
-- (Phase 5 owner dashboard will edit bundle prices directly).
-- ============================================================

create extension if not exists "uuid-ossp";

-- ── Appellations ──────────────────────────────────────────────
create table if not exists appellations (
  id              uuid primary key default uuid_generate_v4(),
  slug            text unique not null,
  name            text not null,
  name_en         text not null,
  name_fr         text not null,
  bank            text check (bank in ('left','right','both')),
  color_hex       text not null,
  dominant_grape  text,
  price_min       numeric,
  price_max       numeric,
  distance_km     numeric,
  avg_rating      numeric,
  chateau_count   integer not null default 0,
  description     text,
  created_at      timestamptz not null default now()
);

-- ── Châteaux ─────────────────────────────────────────────────
create table if not exists chateaux (
  id                  uuid primary key default uuid_generate_v4(),
  slug                text unique not null,
  name                text not null,
  appellation_id      uuid references appellations(id),
  tier                text not null default 'standard'
                        check (tier in ('grand_cru_classe','grand_cru','cru_bourgeois','standard')),
  description         text,
  description_en      text,
  description_fr      text,
  description_de      text,
  lat                 double precision,
  lng                 double precision,
  address             text,
  distance_km         numeric,
  wine_styles         text[] not null default '{}',
  grape_varieties     text[] not null default '{}',
  languages           text[] not null default '{}',
  avg_rating          numeric not null default 0,
  review_count        integer not null default 0,
  is_active           boolean not null default true,
  open_days           text[] not null default '{}',
  open_time           time not null default '10:00',
  close_time          time not null default '17:00',
  photo_url           text,
  color_hex           text not null default '5C1A1A',
  awards              text[] not null default '{}',
  is_sustainable      boolean not null default false,
  is_organic          boolean not null default false,
  free_cancellation   boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ── Bundles (Basic / Classic / Premium per château) ───────────
create table if not exists bundles (
  id                  uuid primary key default uuid_generate_v4(),
  chateau_id          uuid not null references chateaux(id) on delete cascade,
  name                text not null check (name in ('basic','classic','premium')),
  price               numeric not null,
  includes_tasting    boolean not null default true,
  includes_transport  boolean not null default false,
  includes_lunch      boolean not null default false,
  includes_guide      boolean not null default false,
  includes_second_ch  boolean not null default false,
  includes_dinner     boolean not null default false,
  tasting_wines       integer not null default 2,
  max_persons         integer not null default 20,
  duration_hours      numeric not null default 2,
  description_en      text,
  description_fr      text,
  is_active           boolean not null default true,
  created_at          timestamptz not null default now(),
  unique (chateau_id, name)
);

create index if not exists idx_chateaux_appellation on chateaux(appellation_id);
create index if not exists idx_bundles_chateau     on bundles(chateau_id);
