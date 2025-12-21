-- Allow Public Uploads (Insert) for 'hotel-images' bucket
-- This resolves the "new row violates row-level security policy" error if the user's session is not correctly detected as 'authenticated'.

DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
CREATE POLICY "Public Upload"
ON storage.objects FOR INSERT
TO public
WITH CHECK ( bucket_id = 'hotel-images' );

-- Ensure Public Select is also active
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'hotel-images' );
