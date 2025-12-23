-- 1. Add cancellation_token column (Safe to run multiple times)
ALTER TABLE "public"."Reservation_Information" 
ADD COLUMN IF NOT EXISTS "cancellation_token" uuid DEFAULT gen_random_uuid();

CREATE INDEX IF NOT EXISTS "idx_reservation_token" ON "public"."Reservation_Information" ("cancellation_token");

-- 2. Drop the existing function first to allow return type change
DROP FUNCTION IF EXISTS "public"."create_booking_safe"(bigint, text, text, text, date, date, integer, numeric, bigint);

-- 3. Re-create the function with new return type (jsonb including token)
CREATE OR REPLACE FUNCTION "public"."create_booking_safe"(
    p_room_id bigint,
    p_customer_name text,
    p_customer_email text,
    p_customer_phone text,
    p_check_in date,
    p_check_out date,
    p_guests_count integer,
    p_total_price numeric DEFAULT 0,
    p_hotel_id bigint DEFAULT NULL
)
RETURNS TABLE (success boolean, data jsonb, error text) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_room_count integer;
    v_booking_count integer;
    v_new_id bigint;
    v_new_token uuid;
    v_final_hotel_id bigint;
BEGIN
    -- Determine Hotel ID
    IF p_hotel_id IS NOT NULL THEN
        v_final_hotel_id := p_hotel_id;
    ELSE
        SELECT "hotel_id" INTO v_final_hotel_id FROM "public"."Rooms_Information" WHERE id = p_room_id;
    END IF;

    -- Check Room Existence
    SELECT "quantity" INTO v_room_count FROM "public"."Rooms_Information" WHERE id = p_room_id;
    
    IF v_room_count IS NULL THEN
        RETURN QUERY SELECT false, NULL::jsonb, 'Oda bulunamadı'::text;
        RETURN;
    END IF;

    -- Check Availability
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
        RETURN QUERY SELECT false, NULL::jsonb, 'Seçilen tarihlerde boş oda yok'::text;
        RETURN;
    END IF;

    -- Insert Booking
    INSERT INTO "public"."Reservation_Information" (
        hotel_id, room_id, customer_name, customer_email, customer_phone, 
        check_in, check_out, guests_count, total_price, room_status
    ) VALUES (
        v_final_hotel_id, p_room_id, p_customer_name, p_customer_email, p_customer_phone,
        p_check_in, p_check_out, p_guests_count, p_total_price, 'pending'
    ) RETURNING id, cancellation_token INTO v_new_id, v_new_token;

    -- Return ID and Token
    RETURN QUERY SELECT true, jsonb_build_object('id', v_new_id, 'token', v_new_token), 'Rezervasyon başarılı'::text;
END;
$$;
