-- Remove Channex integration columns and indexes
-- This migration removes all Channex-specific fields as we migrate to Beds24

-- Drop indexes first
DROP INDEX IF EXISTS "idx_rooms_channex_id";
DROP INDEX IF EXISTS "idx_reservations_channex_booking_id";

-- Remove columns from Rooms_Information
ALTER TABLE "Rooms_Information" 
DROP COLUMN IF EXISTS "channex_room_type_id",
DROP COLUMN IF EXISTS "channex_rate_plan_id";

-- Remove column from Reservation_Information
ALTER TABLE "Reservation_Information" 
DROP COLUMN IF EXISTS "channex_booking_id";
