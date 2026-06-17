-- WinePass Phase 3b — bookings.bundle_id → nullable
-- Run in Supabase SQL editor before the payment step will work.
-- New marketplace bookings reference experience_id instead of bundle_id.
alter table bookings alter column bundle_id drop not null;
