ALTER TABLE "public"."Rooms_Information" ADD COLUMN IF NOT EXISTS "amenities" text[] DEFAULT '{}';
