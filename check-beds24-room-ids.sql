-- Check if beds24_room_id values are set in the database
SELECT id, type_name, beds24_room_id 
FROM "Rooms_Information" 
WHERE id IN (17, 18, 19, 24)
ORDER BY id;
