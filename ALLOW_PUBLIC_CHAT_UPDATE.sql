-- Allow public (anon) users to update chat sessions (for name and last_message_at)
-- WARNING: This relies on the UUID being secret enough.
CREATE POLICY "Public can update sessions" ON "public"."Chat_Sessions" FOR UPDATE USING (true);
