-- 1. Ajout de la colonne pour le Soft Delete RGPD
ALTER TABLE "public"."users" ADD COLUMN IF NOT EXISTS "deletion_requested_at" TIMESTAMP(3);

-- 2. Configuration du cron via pg_cron et pg_net pour la purge asynchrone (optionnel mais recommandé si Supabase gère le cron)
-- Si vous utilisez déjà Vercel Cron (via vercel.json), cette étape côté Supabase n'est pas nécessaire.
-- Si vous souhaitez déléguer ce cron à Supabase :

-- create extension if not exists pg_net;
-- create extension if not exists pg_cron;

-- select cron.unschedule('rgpd-purge-job');
-- select cron.schedule(
--   'rgpd-purge-job',
--   '0 2 * * *', -- Tous les jours à 2h du matin
--   $$
--   select net.http_get(
--     url := current_setting('app.settings.api_url', true) || '/api/cron/process-scheduled',
--     headers := '{"Authorization": "Bearer ' || current_setting('app.settings.cron_secret', true) || '"}'::jsonb
--   );
--   $$
-- );
