-- FIX: 02_add_missing_columns.sql
-- Run this in Supabase SQL Editor to fix the schema mismatch error.

-- 1. Add missing 'guests_count' column to Reservation_Information if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Reservation_Information' AND column_name = 'guests_count') THEN
        ALTER TABLE "public"."Reservation_Information" ADD COLUMN "guests_count" integer DEFAULT 1;
    END IF;
END $$;

-- 2. Reload the schema cache is automatic in Supabase, but adding the column is key.
-- Verifying other potential missing columns just in case:

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'Reservation_Information' AND column_name = 'customer_email') THEN
        ALTER TABLE "public"."Reservation_Information" ADD COLUMN "customer_email" text;
    END IF;
END $$;
