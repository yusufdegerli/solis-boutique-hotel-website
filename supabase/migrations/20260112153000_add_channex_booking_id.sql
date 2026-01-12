-- Add channex_booking_id to Reservation_Information
ALTER TABLE "Reservation_Information" 
ADD COLUMN IF NOT EXISTS "channex_booking_id" text;

-- Add Unique Index (So we can quickly find bookings by Channex ID and ensure no duplicates)
CREATE UNIQUE INDEX IF NOT EXISTS "idx_reservations_channex_booking_id" 
ON "Reservation_Information" ("channex_booking_id");
