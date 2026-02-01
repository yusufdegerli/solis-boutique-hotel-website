-- Update Rooms_Information with Beds24 Room IDs
-- This maps local room IDs to their corresponding Beds24 room IDs

UPDATE "Rooms_Information" 
SET "beds24_room_id" = '646874' 
WHERE "id" = 18; -- Single Room

UPDATE "Rooms_Information" 
SET "beds24_room_id" = '646866' 
WHERE "id" = 19; -- Twinbed

-- Diğer odalar için de ekle:
-- UPDATE "Rooms_Information" SET "beds24_room_id" = '646875' WHERE "id" = XX; -- Family Room
-- UPDATE "Rooms_Information" SET "beds24_room_id" = '646877' WHERE "id" = XX; -- Double Room
