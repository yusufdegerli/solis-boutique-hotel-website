-- 1. Drop existing function explicitly with OLD signatures to avoid "not unique" error
DROP FUNCTION IF EXISTS "public"."create_booking_safe"(bigint, text, text, text, date, date, integer, numeric);
DROP FUNCTION IF EXISTS "public"."create_booking_safe"(bigint, text, text, text, date, date, integer, numeric, bigint);

-- 2. Re-create with hotel_id parameter
CREATE OR REPLACE FUNCTION "public"."create_booking_safe"(
    p_room_id bigint,
    p_customer_name text,
    p_customer_email text,
    p_customer_phone text,
    p_check_in date,
    p_check_out date,
    p_guests_count integer,
    p_total_price numeric DEFAULT 0,
    p_hotel_id bigint DEFAULT NULL -- NEW PARAMETER
)
RETURNS TABLE (success boolean, data bigint, error text) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_room_count integer;
    v_booking_count integer;
    v_new_id bigint;
    v_final_hotel_id bigint;
BEGIN
    -- 1. Determine Hotel ID if not provided
    IF p_hotel_id IS NOT NULL THEN
        v_final_hotel_id := p_hotel_id;
    ELSE
        -- Fixed: Use hotel_id (snake_case) to match DB column name
        SELECT "hotel_id" INTO v_final_hotel_id FROM "public"."Rooms_Information" WHERE id = p_room_id;
    END IF;

    -- 2. Check Room Existence
    SELECT "quantity" INTO v_room_count FROM "public"."Rooms_Information" WHERE id = p_room_id;
    
    IF v_room_count IS NULL THEN
        RETURN QUERY SELECT false, 0::bigint, 'Oda bulunamadı'::text;
        RETURN;
    END IF;

    -- 3. Check Availability (Simple overlapping date check)
    SELECT COUNT(*) INTO v_booking_count 
    FROM "public"."Reservation_Information"
    WHERE room_id = p_room_id
    AND room_status NOT IN ('cancelled', 'checked_out', 'completed')
    AND (
        (check_in <= p_check_in AND check_out > p_check_in) OR
        (check_in < p_check_out AND check_out >= p_check_out) OR
        (check_in >= p_check_in AND check_out <= p_check_out)
    );

    IF v_booking_count >= v_room_count THEN
        RETURN QUERY SELECT false, 0::bigint, 'Seçilen tarihlerde boş oda yok'::text;
        RETURN;
    END IF;

    -- 4. Insert Booking
    INSERT INTO "public"."Reservation_Information" (
        hotel_id, room_id, customer_name, customer_email, customer_phone, 
        check_in, check_out, guests_count, total_price, room_status
    ) VALUES (
        v_final_hotel_id, p_room_id, p_customer_name, p_customer_email, p_customer_phone,
        p_check_in, p_check_out, p_guests_count, p_total_price, 'pending'
    ) RETURNING id INTO v_new_id;

    RETURN QUERY SELECT true, v_new_id, 'Rezervasyon başarılı'::text;
END;
$$;
