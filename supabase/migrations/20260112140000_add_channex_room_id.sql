-- Add channex_room_type_id column to Rooms_Information table
ALTER TABLE "Rooms_Information" 
ADD COLUMN IF NOT EXISTS "channex_room_type_id" text;

-- Add an index for performance since we will query by this ID
CREATE INDEX IF NOT EXISTS "idx_rooms_channex_id" ON "Rooms_Information" ("channex_room_type_id");

-- Example Update Query (Template)
-- You can run this manually in Supabase SQL Editor with your real IDs from .env
/*
UPDATE "Rooms_Information"
SET "channex_room_type_id" = CASE
    WHEN name = 'Deluxe Room' THEN 'ROOM_TYPE_ID_FROM_CHANNEX_1'
    WHEN name = 'Standard Room' THEN 'ROOM_TYPE_ID_FROM_CHANNEX_2'
    ELSE "channex_room_type_id"
END
WHERE name IN ('Deluxe Room', 'Standard Room');
*/
