-- Add missing columns to Hotel_Information_Table to replace mock data
ALTER TABLE "public"."Hotel_Information_Table"
ADD COLUMN IF NOT EXISTS "rating" numeric DEFAULT 9.0,
ADD COLUMN IF NOT EXISTS "reviews_count" integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS "phone" text DEFAULT '+90 212 555 0123',
ADD COLUMN IF NOT EXISTS "email" text DEFAULT 'info@solis.com',
ADD COLUMN IF NOT EXISTS "tagline" text DEFAULT 'Unutulmaz Bir Konaklama Deneyimi',
ADD COLUMN IF NOT EXISTS "features" text[] DEFAULT ARRAY['Ücretsiz Wi-Fi', 'Spa', 'Spor Salonu', 'Restoran'],
ADD COLUMN IF NOT EXISTS "coordinates" jsonb DEFAULT '{"lat": 41.0082, "lng": 28.9784}'::jsonb,
ADD COLUMN IF NOT EXISTS "stats" jsonb DEFAULT '{"totalRooms": 50, "availability": 10, "suiteCount": 5}'::jsonb;

-- Add missing columns to Rooms_Information to replace mock data
ALTER TABLE "public"."Rooms_Information"
ADD COLUMN IF NOT EXISTS "image_url" text DEFAULT 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80',
ADD COLUMN IF NOT EXISTS "size" text DEFAULT '35m²',
ADD COLUMN IF NOT EXISTS "amenities" text[] DEFAULT ARRAY['Klima', 'TV', 'Minibar', 'Wi-Fi'];

-- Update existing rows to have meaningful defaults if they are null (optional but good for testing)
UPDATE "public"."Hotel_Information_Table"
SET 
  rating = 9.5, 
  reviews_count = 120 
WHERE rating IS NULL;
