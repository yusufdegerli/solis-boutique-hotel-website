-- Update create_booking_safe to accept an optional total price override
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION create_booking_safe(
  p_room_id BIGINT,
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_customer_phone TEXT,
  p_check_in DATE,
  p_check_out DATE,
  p_guests_count INTEGER,
  p_total_price NUMERIC DEFAULT NULL -- New Parameter (Optional)
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_base_price NUMERIC;
  v_quantity INTEGER;
  v_current_bookings INTEGER;
  v_calculated_price NUMERIC;
  v_final_price NUMERIC;
  v_days INTEGER;
  v_new_reservation_id TEXT;
  v_check_in DATE := p_check_in;
  v_check_out DATE := p_check_out;
BEGIN
  -- 1. Date Check
  IF v_check_in >= v_check_out THEN
    RETURN json_build_object('success', false, 'error', 'Çıkış tarihi giriş tarihinden sonra olmalıdır');
  END IF;

  -- 2. Locking
  SELECT base_price, quantity
  INTO v_base_price, v_quantity
  FROM "Rooms_Information"
  WHERE id = p_room_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Seçilen oda tipi bulunamadı');
  END IF;

  -- 3. Price Calculation
  v_days := (v_check_out - v_check_in);
  v_calculated_price := v_base_price * v_days;
  
  -- Use provided price if valid, otherwise use calculated
  IF p_total_price IS NOT NULL AND p_total_price > 0 THEN
      v_final_price := p_total_price;
  ELSE
      v_final_price := v_calculated_price;
  END IF;

  -- 4. Conflict Check
  SELECT COUNT(*)
  INTO v_current_bookings
  FROM "Reservation_Information"
  WHERE room_id = p_room_id
    AND room_status != 'cancelled'
    AND check_in < v_check_out
    AND check_out > v_check_in;

  -- 5. Capacity Check
  IF v_current_bookings >= COALESCE(v_quantity, 5) THEN
    RETURN json_build_object('success', false, 'error', 'Üzgünüz, seçilen tarih aralığında bu oda tipi tamamen doludur (' || v_current_bookings || '/' || COALESCE(v_quantity, 5) || ')');
  END IF;

  -- 6. Create Reservation
  INSERT INTO "Reservation_Information" (
    room_id,
    customer_name,
    customer_email,
    customer_phone,
    check_in,
    check_out,
    guests_count,
    total_price, -- Use final price
    room_status
  ) VALUES (
    p_room_id,
    p_customer_name,
    p_customer_email,
    p_customer_phone,
    v_check_in,
    v_check_out,
    p_guests_count,
    v_final_price,
    'pending'
  ) RETURNING id::text INTO v_new_reservation_id;

  RETURN json_build_object('success', true, 'data', v_new_reservation_id);

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;
