-- Chat Cleanup Function
-- Retention Policy: 6 Months
-- This function deletes chat sessions (and their messages) that are 'closed' and older than 6 months.

CREATE OR REPLACE FUNCTION cleanup_old_chats()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with admin privileges
SET search_path = public -- Security Fix: Explicitly set search_path
AS $$
DECLARE
    deleted_sessions_count integer;
BEGIN
    -- 1. Delete messages belonging to old, closed sessions first (to avoid orphan records if no cascade)
    DELETE FROM "Chat_Messages" -- Table names are now safely resolved in public schema
    WHERE session_id IN (
        SELECT id FROM "Chat_Sessions"
        WHERE status = 'closed'
        AND last_message_at < NOW() - INTERVAL '6 months'
    );

    -- 2. Delete the sessions themselves
    WITH deleted_rows AS (
        DELETE FROM "Chat_Sessions"
        WHERE status = 'closed'
        AND last_message_at < NOW() - INTERVAL '6 months'
        RETURNING *
    )
    SELECT count(*) INTO deleted_sessions_count FROM deleted_rows;

    RETURN 'Cleanup complete. Deleted ' || deleted_sessions_count || ' old sessions.';
END;
$$;