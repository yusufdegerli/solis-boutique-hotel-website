-- Allow Public Read Access
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'hotel-images' );

-- Allow Authenticated Users to Upload (Insert)
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'hotel-images' );

-- Allow Authenticated Users to Update
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'hotel-images' );

-- Allow Authenticated Users to Delete
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'hotel-images' );
