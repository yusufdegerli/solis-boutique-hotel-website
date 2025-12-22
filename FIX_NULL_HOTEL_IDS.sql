-- Update hotel_id in Reservation_Information based on room_id
-- Fixed column name: Using hotel_id instead of hotelId

UPDATE "public"."Reservation_Information" r
SET "hotel_id" = (
    SELECT "hotel_id" 
    FROM "public"."Rooms_Information" rm 
    WHERE rm.id = r.room_id
)
WHERE "hotel_id" IS NULL;