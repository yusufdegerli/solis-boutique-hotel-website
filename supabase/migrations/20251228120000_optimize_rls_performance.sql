-- Optimize RLS policies for better performance
-- Separate SELECT from write actions to avoid multiple permissive policies warning.
-- Wrap auth functions in subqueries.
-- Combine overlapping policies and remove redundant/conflicting ones.

-- 1. Blog_Posts table
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."Blog_Posts";
DROP POLICY IF EXISTS "Enable write access for authenticated users only" ON "public"."Blog_Posts";
DROP POLICY IF EXISTS "Blog_Allow_Everything" ON "public"."Blog_Posts";
DROP POLICY IF EXISTS "Public Read Blog_Posts" ON "public"."Blog_Posts";
DROP POLICY IF EXISTS "Admin Insert Blog_Posts" ON "public"."Blog_Posts";
DROP POLICY IF EXISTS "Admin Update Blog_Posts" ON "public"."Blog_Posts";
DROP POLICY IF EXISTS "Admin Delete Blog_Posts" ON "public"."Blog_Posts";

CREATE POLICY "Public Read Blog_Posts" ON "public"."Blog_Posts" FOR SELECT USING (true);
CREATE POLICY "Admin Insert Blog_Posts" ON "public"."Blog_Posts" FOR INSERT TO authenticated WITH CHECK ((select auth.role()) = 'authenticated');
CREATE POLICY "Admin Update Blog_Posts" ON "public"."Blog_Posts" FOR UPDATE TO authenticated USING ((select auth.role()) = 'authenticated') WITH CHECK ((select auth.role()) = 'authenticated');
CREATE POLICY "Admin Delete Blog_Posts" ON "public"."Blog_Posts" FOR DELETE TO authenticated USING ((select auth.role()) = 'authenticated');

-- 2. Hotel_Information_Table
-- Drop conflicting "Owner" and "Public" policies
DROP POLICY IF EXISTS "Hotel_Allow_Everything" ON "public"."Hotel_Information_Table";
DROP POLICY IF EXISTS "Hotel owners can delete" ON "public"."Hotel_Information_Table";
DROP POLICY IF EXISTS "Hotel owners can update" ON "public"."Hotel_Information_Table";
DROP POLICY IF EXISTS "Hotel owners can insert" ON "public"."Hotel_Information_Table";
DROP POLICY IF EXISTS "Hotel update only owner" ON "public"."Hotel_Information_Table";
DROP POLICY IF EXISTS "Hotel insert only for owner" ON "public"."Hotel_Information_Table";
DROP POLICY IF EXISTS "Hotel select only for owner" ON "public"."Hotel_Information_Table";
DROP POLICY IF EXISTS "Hotel owners can select" ON "public"."Hotel_Information_Table";
DROP POLICY IF EXISTS "Hotel select only owner" ON "public"."Hotel_Information_Table";
-- Drop previous Admin/Public policies to recreate them cleanly
DROP POLICY IF EXISTS "Public Read Hotels" ON "public"."Hotel_Information_Table";
DROP POLICY IF EXISTS "Admin All Hotels" ON "public"."Hotel_Information_Table";
DROP POLICY IF EXISTS "Admin Write Hotels" ON "public"."Hotel_Information_Table";
DROP POLICY IF EXISTS "Admin Insert Hotels" ON "public"."Hotel_Information_Table";
DROP POLICY IF EXISTS "Admin Update Hotels" ON "public"."Hotel_Information_Table";
DROP POLICY IF EXISTS "Admin Delete Hotels" ON "public"."Hotel_Information_Table";

-- Recreate Clean Policies
CREATE POLICY "Public Read Hotels" ON "public"."Hotel_Information_Table" FOR SELECT USING (true);
CREATE POLICY "Admin Insert Hotels" ON "public"."Hotel_Information_Table" FOR INSERT TO authenticated WITH CHECK ((select auth.role()) = 'authenticated');
CREATE POLICY "Admin Update Hotels" ON "public"."Hotel_Information_Table" FOR UPDATE TO authenticated USING ((select auth.role()) = 'authenticated') WITH CHECK ((select auth.role()) = 'authenticated');
CREATE POLICY "Admin Delete Hotels" ON "public"."Hotel_Information_Table" FOR DELETE TO authenticated USING ((select auth.role()) = 'authenticated');

-- 3. Rooms_Information
-- Drop conflicting "Owner" policies
DROP POLICY IF EXISTS "Room_Allow_Everything" ON "public"."Rooms_Information";
DROP POLICY IF EXISTS "Rooms update only for hotel owner" ON "public"."Rooms_Information";
DROP POLICY IF EXISTS "Rooms delete only for hotel owner" ON "public"."Rooms_Information";
DROP POLICY IF EXISTS "Rooms insert only for hotel owner" ON "public"."Rooms_Information";
DROP POLICY IF EXISTS "Rooms select only for hotel owner" ON "public"."Rooms_Information";
DROP POLICY IF EXISTS "Rooms insert only for owner of hotel" ON "public"."Rooms_Information";
-- Drop previous Admin/Public policies
DROP POLICY IF EXISTS "Public Read Rooms" ON "public"."Rooms_Information";
DROP POLICY IF EXISTS "Admin All Rooms" ON "public"."Rooms_Information";
DROP POLICY IF EXISTS "Admin Write Rooms" ON "public"."Rooms_Information";
DROP POLICY IF EXISTS "Admin Insert Rooms" ON "public"."Rooms_Information";
DROP POLICY IF EXISTS "Admin Update Rooms" ON "public"."Rooms_Information";
DROP POLICY IF EXISTS "Admin Delete Rooms" ON "public"."Rooms_Information";

-- Recreate Clean Policies
CREATE POLICY "Public Read Rooms" ON "public"."Rooms_Information" FOR SELECT USING (true);
CREATE POLICY "Admin Insert Rooms" ON "public"."Rooms_Information" FOR INSERT TO authenticated WITH CHECK ((select auth.role()) = 'authenticated');
CREATE POLICY "Admin Update Rooms" ON "public"."Rooms_Information" FOR UPDATE TO authenticated USING ((select auth.role()) = 'authenticated') WITH CHECK ((select auth.role()) = 'authenticated');
CREATE POLICY "Admin Delete Rooms" ON "public"."Rooms_Information" FOR DELETE TO authenticated USING ((select auth.role()) = 'authenticated');

-- 4. Services table
DROP POLICY IF EXISTS "Service_Allow_Everything" ON "public"."Services";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."Services";
DROP POLICY IF EXISTS "Enable write access for authenticated users only" ON "public"."Services";
DROP POLICY IF EXISTS "Public Read Services" ON "public"."Services";
DROP POLICY IF EXISTS "Admin Insert Services" ON "public"."Services";
DROP POLICY IF EXISTS "Admin Update Services" ON "public"."Services";
DROP POLICY IF EXISTS "Admin Delete Services" ON "public"."Services";

CREATE POLICY "Public Read Services" ON "public"."Services" FOR SELECT USING (true);
CREATE POLICY "Admin Insert Services" ON "public"."Services" FOR INSERT TO authenticated WITH CHECK ((select auth.role()) = 'authenticated');
CREATE POLICY "Admin Update Services" ON "public"."Services" FOR UPDATE TO authenticated USING ((select auth.role()) = 'authenticated') WITH CHECK ((select auth.role()) = 'authenticated');
CREATE POLICY "Admin Delete Services" ON "public"."Services" FOR DELETE TO authenticated USING ((select auth.role()) = 'authenticated');

-- 5. Reservation_Information
-- Drop conflicting policies
DROP POLICY IF EXISTS "Admin All Reservations" ON "public"."Reservation_Information";
DROP POLICY IF EXISTS "Admin Manage Reservations" ON "public"."Reservation_Information";
DROP POLICY IF EXISTS "Admins only" ON "public"."Reservation_Information";
DROP POLICY IF EXISTS "Herkes rezervasyonları gorebilir" ON "public"."Reservation_Information";
DROP POLICY IF EXISTS "Public Insert Reservations" ON "public"."Reservation_Information";
DROP POLICY IF EXISTS "Admin Select Reservations" ON "public"."Reservation_Information";
DROP POLICY IF EXISTS "Admin Insert Reservations" ON "public"."Reservation_Information";
DROP POLICY IF EXISTS "Admin Update Reservations" ON "public"."Reservation_Information";
DROP POLICY IF EXISTS "Admin Delete Reservations" ON "public"."Reservation_Information";

-- Recreate Clean Policies (Split by action to avoid future permissive warnings)
-- Note: Public usually books via RPC 'create_booking_safe', so we restrict INSERT to Admins here. 
-- If direct public insert is needed, change "Admin Insert" to "Public Insert" with true check.
CREATE POLICY "Admin Select Reservations" ON "public"."Reservation_Information" FOR SELECT TO authenticated USING ((select auth.role()) = 'authenticated');
CREATE POLICY "Admin Insert Reservations" ON "public"."Reservation_Information" FOR INSERT TO authenticated WITH CHECK ((select auth.role()) = 'authenticated');
CREATE POLICY "Admin Update Reservations" ON "public"."Reservation_Information" FOR UPDATE TO authenticated USING ((select auth.role()) = 'authenticated') WITH CHECK ((select auth.role()) = 'authenticated');
CREATE POLICY "Admin Delete Reservations" ON "public"."Reservation_Information" FOR DELETE TO authenticated USING ((select auth.role()) = 'authenticated');

-- 6. Chat_Sessions table
DROP POLICY IF EXISTS "Admins can do everything on sessions" ON "public"."Chat_Sessions";
DROP POLICY IF EXISTS "Public can create sessions" ON "public"."Chat_Sessions";
DROP POLICY IF EXISTS "Public can read sessions" ON "public"."Chat_Sessions";
DROP POLICY IF EXISTS "Public can read their own session" ON "public"."Chat_Sessions";
DROP POLICY IF EXISTS "Admin Select Sessions" ON "public"."Chat_Sessions";
DROP POLICY IF EXISTS "Admin Update Sessions" ON "public"."Chat_Sessions";
DROP POLICY IF EXISTS "Admin Delete Sessions" ON "public"."Chat_Sessions";
DROP POLICY IF EXISTS "Insert Sessions" ON "public"."Chat_Sessions";
DROP POLICY IF EXISTS "Public Read Sessions" ON "public"."Chat_Sessions";

CREATE POLICY "Public Read Sessions" ON "public"."Chat_Sessions" FOR SELECT USING (true);
CREATE POLICY "Admin Update Sessions" ON "public"."Chat_Sessions" FOR UPDATE TO authenticated USING ((select auth.role()) = 'authenticated') WITH CHECK ((select auth.role()) = 'authenticated');
CREATE POLICY "Admin Delete Sessions" ON "public"."Chat_Sessions" FOR DELETE TO authenticated USING ((select auth.role()) = 'authenticated');
CREATE POLICY "Insert Sessions" ON "public"."Chat_Sessions" FOR INSERT WITH CHECK (true);

-- 7. Chat_Messages table
DROP POLICY IF EXISTS "Admins can do everything on messages" ON "public"."Chat_Messages";
DROP POLICY IF EXISTS "Public can insert messages" ON "public"."Chat_Messages";
DROP POLICY IF EXISTS "Public can read messages" ON "public"."Chat_Messages";
DROP POLICY IF EXISTS "Public can read their own messages" ON "public"."Chat_Messages";
DROP POLICY IF EXISTS "Admin Select Messages" ON "public"."Chat_Messages";
DROP POLICY IF EXISTS "Admin Update Messages" ON "public"."Chat_Messages";
DROP POLICY IF EXISTS "Admin Delete Messages" ON "public"."Chat_Messages";
DROP POLICY IF EXISTS "Insert Messages" ON "public"."Chat_Messages";
DROP POLICY IF EXISTS "Public Read Messages" ON "public"."Chat_Messages";

CREATE POLICY "Public Read Messages" ON "public"."Chat_Messages" FOR SELECT USING (true);
CREATE POLICY "Admin Update Messages" ON "public"."Chat_Messages" FOR UPDATE TO authenticated USING ((select auth.role()) = 'authenticated') WITH CHECK ((select auth.role()) = 'authenticated');
CREATE POLICY "Admin Delete Messages" ON "public"."Chat_Messages" FOR DELETE TO authenticated USING ((select auth.role()) = 'authenticated');
CREATE POLICY "Insert Messages" ON "public"."Chat_Messages" FOR INSERT WITH CHECK (true);

-- 8. user_roles table
DROP POLICY IF EXISTS "Allow individual read access" ON "public"."user_roles";
CREATE POLICY "Allow individual read access" 
ON "public"."user_roles" 
FOR SELECT 
TO authenticated 
USING ( (select auth.uid()) = user_id );