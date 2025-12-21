-- Add 'images' array column to Rooms_Information
ALTER TABLE "public"."Rooms_Information" ADD COLUMN IF NOT EXISTS "images" text[];

-- Migrate existing single 'image_url' data to the new 'images' array
-- This ensures we don't lose existing photos
UPDATE "public"."Rooms_Information" 
SET "images" = ARRAY[image_url] 
WHERE image_url IS NOT NULL AND "images" IS NULL;

-- (Optional) We keep image_url for now as backup, but the app will use 'images'
