-- FIX: 03_complete_schema_repair.sql
-- Run this in Supabase SQL Editor to ensure all necessary columns exist.

-- 1. Ensure 'hotel_id' exists and is a Foreign Key
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Reservation_Information' AND column_name = 'hotel_id') THEN
        ALTER TABLE "public"."Reservation_Information" ADD COLUMN "hotel_id" bigint REFERENCES "public"."Hotel_Information_Table"("id");
    END IF;
END $$;

-- 2. Ensure 'guests_count' exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Reservation_Information' AND column_name = 'guests_count') THEN
        ALTER TABLE "public"."Reservation_Information" ADD COLUMN "guests_count" integer DEFAULT 1;
    END IF;
END $$;

-- 3. Ensure 'customer_email' exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Reservation_Information' AND column_name = 'customer_email') THEN
        ALTER TABLE "public"."Reservation_Information" ADD COLUMN "customer_email" text;
    END IF;
END $$;

-- 4. Ensure 'customer_name' exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Reservation_Information' AND column_name = 'customer_name') THEN
        ALTER TABLE "public"."Reservation_Information" ADD COLUMN "customer_name" text;
    END IF;
END $$;

-- 5. Ensure 'total_price' exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Reservation_Information' AND column_name = 'total_price') THEN
        ALTER TABLE "public"."Reservation_Information" ADD COLUMN "total_price" numeric;
    END IF;
END $$;
