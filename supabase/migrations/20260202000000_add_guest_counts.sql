-- Add separate adult and children count columns to Reservation_Information
-- This allows proper tracking of guest demographics for Beds24 integration

ALTER TABLE "public"."Reservation_Information" 
ADD COLUMN IF NOT EXISTS "num_adults" integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS "num_children" integer DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN "public"."Reservation_Information"."num_adults" IS 'Number of adult guests';
COMMENT ON COLUMN "public"."Reservation_Information"."num_children" IS 'Number of child guests';
