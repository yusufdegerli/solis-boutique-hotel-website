-- Fix RLS for Hotel_Information_Table
-- Ensure authenticated users can INSERT (create hotels)

-- 1. Enable RLS (just in case)
ALTER TABLE "public"."Hotel_Information_Table" ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policy to avoid conflicts
DROP POLICY IF EXISTS "Enable write access for authenticated users only" ON "public"."Hotel_Information_Table";

-- 3. Create a comprehensive write policy (INSERT, UPDATE, DELETE)
CREATE POLICY "Enable write access for authenticated users only"
ON "public"."Hotel_Information_Table"
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Ensure Public Read Access remains
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."Hotel_Information_Table";
CREATE POLICY "Enable read access for all users"
ON "public"."Hotel_Information_Table"
FOR SELECT
USING (true);
