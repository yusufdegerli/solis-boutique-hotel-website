-- SECURITY PATCH: 01_secure_rls_policies.sql
-- Run this in Supabase SQL Editor to secure your database.

-- 1. Drop existing insecure policies (if they exist)
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."Hotel_Information_Table";
DROP POLICY IF EXISTS "Enable insert access for all users" ON "public"."Hotel_Information_Table";
DROP POLICY IF EXISTS "Enable update access for all users" ON "public"."Hotel_Information_Table";
DROP POLICY IF EXISTS "Enable delete access for all users" ON "public"."Hotel_Information_Table";

DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."Rooms_Information";
DROP POLICY IF EXISTS "Enable insert access for all users" ON "public"."Rooms_Information";
DROP POLICY IF EXISTS "Enable update access for all users" ON "public"."Rooms_Information";
DROP POLICY IF EXISTS "Enable delete access for all users" ON "public"."Rooms_Information";

DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."Reservation_Information";
DROP POLICY IF EXISTS "Enable insert access for all users" ON "public"."Reservation_Information";
DROP POLICY IF EXISTS "Enable update access for all users" ON "public"."Reservation_Information";
DROP POLICY IF EXISTS "Enable delete access for all users" ON "public"."Reservation_Information";

-- 2. Create SECURE policies

-- Hotel: Public Read, Admin Write
-- Everyone can view hotels.
CREATE POLICY "Enable read access for all users" ON "public"."Hotel_Information_Table" FOR SELECT USING (true);
-- Only logged-in users (admins) can create/edit/delete.
CREATE POLICY "Enable write access for authenticated users only" ON "public"."Hotel_Information_Table" FOR ALL USING (auth.role() = 'authenticated');

-- Rooms: Public Read, Admin Write
-- Everyone can view rooms.
CREATE POLICY "Enable read access for all users" ON "public"."Rooms_Information" FOR SELECT USING (true);
-- Only logged-in users (admins) can create/edit/delete.
CREATE POLICY "Enable write access for authenticated users only" ON "public"."Rooms_Information" FOR ALL USING (auth.role() = 'authenticated');

-- Reservations: Admin Only
-- Public users CANNOT insert/read directly (they use Server Actions).
-- Only logged-in users (admins) can manage reservations.
CREATE POLICY "Enable access for authenticated users only" ON "public"."Reservation_Information" FOR ALL USING (auth.role() = 'authenticated');
