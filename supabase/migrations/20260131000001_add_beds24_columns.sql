-- Add Beds24 integration columns
-- This migration adds Beds24-specific fields for channel manager integration

-- Add beds24_room_id to Rooms_Information
-- This will store the Beds24 room ID for mapping local rooms to Beds24 rooms
ALTER TABLE "Rooms_Information" 
ADD COLUMN IF NOT EXISTS "beds24_room_id" text;

-- Add index for performance when querying by Beds24 room ID
CREATE INDEX IF NOT EXISTS "idx_rooms_beds24_id" 
ON "Rooms_Information" ("beds24_room_id");

-- Add beds24_booking_id to Reservation_Information
-- This will store the Beds24 booking reference ID
ALTER TABLE "Reservation_Information" 
ADD COLUMN IF NOT EXISTS "beds24_booking_id" text;

-- Add unique index to ensure no duplicate Beds24 bookings
-- and for fast lookups when processing webhooks
CREATE UNIQUE INDEX IF NOT EXISTS "idx_reservations_beds24_booking_id" 
ON "Reservation_Information" ("beds24_booking_id");

-- Optional: Add comment to document the purpose
COMMENT ON COLUMN "Rooms_Information"."beds24_room_id" IS 'Beds24 room ID for channel manager integration';
COMMENT ON COLUMN "Reservation_Information"."beds24_booking_id" IS 'Beds24 booking reference ID from channel manager';
