-- WinePass Phase 4 — pg_cron backstop for expired seat holds
-- Run in Supabase SQL editor (project bhpcmfghmfvzaxfjsbfp)
--
-- pg_cron is enabled by default on Supabase.
-- This schedules a job every 5 minutes as a DB-level backstop;
-- the app-level lazy cleanup (called by the availability and
-- booking-create routes) already handles holds in real time.

-- Remove any previous version of this job first (idempotent):
select cron.unschedule('cleanup-expired-holds');

-- Schedule the job:
select cron.schedule(
  'cleanup-expired-holds',
  '*/5 * * * *',
  $$
    update bookings
    set    status        = 'cancelled',
           cancel_reason = 'hold_expired'
    where  status         = 'pending'
      and  hold_expires_at < now()
  $$
);
