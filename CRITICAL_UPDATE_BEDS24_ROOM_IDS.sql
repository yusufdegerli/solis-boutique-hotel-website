-- Populate beds24_room_id values for all rooms
-- This is CRITICAL for Beds24 integration to work!

-- Update Room ID 17 (Family Room)
UPDATE "Rooms_Information" 
SET "beds24_room_id" = '646875'
WHERE id = 17;

-- Update Room ID 18 (Twinbed)
UPDATE "Rooms_Information" 
SET "beds24_room_id" = '646866'
WHERE id = 18;

-- Update Room ID 19 (Single Room)
UPDATE "Rooms_Information" 
SET "beds24_room_id" = '646874'
WHERE id = 19;

-- Update Room ID 24 (Double Room)
UPDATE "Rooms_Information" 
SET "beds24_room_id" = '646877'
WHERE id = 24;

-- Verify the updates
SELECT id, type_name, beds24_room_id 
FROM "Rooms_Information" 
WHERE id IN (17, 18, 19, 24)
ORDER BY id;
