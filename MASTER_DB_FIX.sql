-- MASTER DATABASE FIX
-- Run this entire script in your Supabase SQL Editor.

BEGIN;

-- =================================================================
-- 1. SCHEMA FIXES (Tablo Eksikliklerini Giderme)
-- =================================================================

-- Add 'guests_count' if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Reservation_Information' AND column_name = 'guests_count') THEN
        ALTER TABLE "public"."Reservation_Information" ADD COLUMN "guests_count" integer DEFAULT 1;
    END IF;
END $$;

-- Add 'customer_email' if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Reservation_Information' AND column_name = 'customer_email') THEN
        ALTER TABLE "public"."Reservation_Information" ADD COLUMN "customer_email" text;
    END IF;
END $$;

-- =================================================================
-- 2. RACE CONDITION FIX (Güvenli Rezervasyon Fonksiyonu)
-- =================================================================

-- Drop old version if exists
DROP FUNCTION IF EXISTS create_booking_safe;

-- Create secure function with LOCKING
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
SECURITY DEFINER -- Runs with admin privileges
AS $$
DECLARE
  v_base_price NUMERIC;
  v_quantity INTEGER;
  v_current_bookings INTEGER;
  v_total_price NUMERIC;
  v_days INTEGER;
  v_new_reservation_id TEXT; -- Changed from BIGINT to TEXT to support UUIDs
  v_check_in DATE := p_check_in;
  v_check_out DATE := p_check_out;
BEGIN
  -- 1. Tarih Kontrolü
  IF v_check_in >= v_check_out THEN
    RETURN json_build_object('success', false, 'error', 'Çıkış tarihi giriş tarihinden sonra olmalıdır');
  END IF;

  -- 2. KİLİTLEME (Locking): Aynı anda gelen istekleri sıraya sokar.
  SELECT base_price, quantity
  INTO v_base_price, v_quantity
  FROM "Rooms_Information"
  WHERE id = p_room_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Seçilen oda tipi bulunamadı');
  END IF;

  -- 3. Fiyat Hesaplama
  v_days := (v_check_out - v_check_in);
  v_total_price := v_base_price * v_days;

  -- 4. Çakışma Kontrolü
  SELECT COUNT(*)
  INTO v_current_bookings
  FROM "Reservation_Information"
  WHERE room_id = p_room_id
    AND room_status != 'cancelled'
    AND check_in < v_check_out
    AND check_out > v_check_in;

  -- 5. Kapasite Kontrolü
  IF v_current_bookings >= COALESCE(v_quantity, 5) THEN
    RETURN json_build_object('success', false, 'error', 'Üzgünüz, seçilen tarih aralığında bu oda tipi tamamen doludur (' || v_current_bookings || '/' || COALESCE(v_quantity, 5) || ')');
  END IF;

  -- 6. Rezervasyonu Oluştur
  INSERT INTO "Reservation_Information" (
    room_id,
    customer_name,
    customer_email,
    check_in,
    check_out,
    guests_count,
    total_price,
    room_status
  ) VALUES (
    p_room_id,
    p_customer_name,
    p_customer_email,
    v_check_in,
    v_check_out,
    p_guests_count,
    v_total_price,
    'pending'
  ) RETURNING id::text INTO v_new_reservation_id;

  RETURN json_build_object('success', true, 'data', v_new_reservation_id);

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- =================================================================
-- 3. SECURITY PATCH (RLS Politikaları)
-- =================================================================

-- Enable RLS on all tables
ALTER TABLE "public"."Hotel_Information_Table" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Rooms_Information" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Reservation_Information" ENABLE ROW LEVEL SECURITY;

-- 3.1 Hotel Table: Public Read, Admin Write
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."Hotel_Information_Table";
CREATE POLICY "Enable read access for all users" ON "public"."Hotel_Information_Table" FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable write access for authenticated users only" ON "public"."Hotel_Information_Table";
CREATE POLICY "Enable write access for authenticated users only" ON "public"."Hotel_Information_Table" FOR ALL USING (auth.role() = 'authenticated');

-- 3.2 Rooms Table: Public Read, Admin Write
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."Rooms_Information";
CREATE POLICY "Enable read access for all users" ON "public"."Rooms_Information" FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable write access for authenticated users only" ON "public"."Rooms_Information";
CREATE POLICY "Enable write access for authenticated users only" ON "public"."Rooms_Information" FOR ALL USING (auth.role() = 'authenticated');

-- 3.3 Reservations Table: ADMIN ONLY (Strict Security)
-- Public users interact via 'create_booking_safe' function only.
-- They CANNOT insert/select directly.

DROP POLICY IF EXISTS "Enable access for authenticated users only" ON "public"."Reservation_Information";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."Reservation_Information";
DROP POLICY IF EXISTS "Enable insert access for all users" ON "public"."Reservation_Information";

-- Only logged in users (admins) can see/edit reservations directly
DROP POLICY IF EXISTS "Admins only" ON "public"."Reservation_Information";
CREATE POLICY "Admins only" ON "public"."Reservation_Information" FOR ALL USING (auth.role() = 'authenticated');

COMMIT;
