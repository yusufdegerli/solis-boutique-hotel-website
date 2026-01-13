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
     v_new_id uuid;
     v_final_hotel_id bigint;
 BEGIN
     SELECT "hotel_id" INTO v_final_hotel_id FROM "Rooms_Information" WHERE id = p_room_id;
 
     INSERT INTO "Reservation_Information" (
         hotel_id,
         room_id,
         customer_name,
         customer_email,
         customer_phone,
         check_in,
         check_out,
         guests_count,
         total_price,
         room_status,
         cancellation_token
     ) VALUES (
         v_final_hotel_id,
         p_room_id,
         p_customer_name,
         p_customer_email,
         p_customer_phone,
         p_check_in,
         p_check_out,
         p_guests_count,
         p_total_price,
         'pending',
         '11111111-1111-1111-1111-111111111111'::uuid -- SABİT UUID
     ) RETURNING id INTO v_new_id;
 
     RETURN QUERY SELECT true, jsonb_build_object('id', v_new_id), 'Başarılı'::text;
 END;
 $$;