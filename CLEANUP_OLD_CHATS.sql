-- Delete chat sessions older than 24 hours
-- Warning: This will cascade delete messages due to foreign key constraints

DELETE FROM "public"."Chat_Sessions"
WHERE last_message_at < (now() - interval '24 hours');

-- Optional: If you have pg_cron extension enabled in Supabase
-- SELECT cron.schedule(
--   'cleanup-old-chats',
--   '0 0 * * *', -- Every day at midnight
--   $$DELETE FROM "public"."Chat_Sessions" WHERE last_message_at < (now() - interval '24 hours')$$
-- );
