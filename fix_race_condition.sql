-- Function to handle booking creation atomically to prevent race conditions (double booking)
CREATE OR REPLACE FUNCTION create_booking_safe(
  p_room_id BIGINT,
  p_customer_name TEXT,
  p_customer_email TEXT,
  p_check_in DATE,
  p_check_out DATE,
  p_guests_count INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_base_price NUMERIC;
  v_quantity INTEGER;
  v_current_bookings INTEGER;
  v_total_price NUMERIC;
  v_days INTEGER;
  v_new_reservation_id BIGINT;
  v_check_in DATE := p_check_in;
  v_check_out DATE := p_check_out;
BEGIN
  -- 1. Validate Dates
  IF v_check_in >= v_check_out THEN
    RETURN json_build_object('success', false, 'error', 'Çıkış tarihi giriş tarihinden sonra olmalıdır');
  END IF;

  -- 2. Lock the room type row to serialize checks for this specific room
  -- This prevents two concurrent requests from reading the same "available count" at the same time
  SELECT base_price, quantity
  INTO v_base_price, v_quantity
  FROM "Rooms_Information"
  WHERE id = p_room_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Seçilen oda tipi bulunamadı');
  END IF;

  -- 3. Calculate Price
  v_days := (v_check_out - v_check_in);
  v_total_price := v_base_price * v_days;

  -- 4. Check for existing bookings overlapping with the requested dates
  SELECT COUNT(*)
  INTO v_current_bookings
  FROM "Reservation_Information"
  WHERE room_id = p_room_id
    AND room_status != 'cancelled'
    AND check_in < v_check_out
    AND check_out > v_check_in;

  -- 5. Validate Availability
  -- Uses COALESCE to default quantity to 5 if null, matching previous logic
  IF v_current_bookings >= COALESCE(v_quantity, 5) THEN
    RETURN json_build_object('success', false, 'error', 'Üzgünüz, seçilen tarih aralığında bu oda tipi tamamen doludur (' || v_current_bookings || '/' || COALESCE(v_quantity, 5) || ')');
  END IF;

  -- 6. Insert new reservation
  INSERT INTO "Reservation_Information" (
    room_id,
    customer_name,
    customer_email,
    check_in,
    check_out,
    guests_count,
    total_price,
    room_status,
    hotel_id -- Keeping null or handling if passed, currently defaulting to null as per schema analysis
  ) VALUES (
    p_room_id,
    p_customer_name,
    p_customer_email,
    v_check_in,
    v_check_out,
    p_guests_count,
    v_total_price,
    'pending',
    NULL 
  ) RETURNING id INTO v_new_reservation_id;

  RETURN json_build_object('success', true, 'data', v_new_reservation_id);

EXCEPTION WHEN OTHERS THEN
  -- Catch any unexpected errors
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;
