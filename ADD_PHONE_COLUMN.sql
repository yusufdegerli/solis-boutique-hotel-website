-- Add 'customer_phone' column to Reservation_Information
-- Run this script in Supabase SQL Editor

ALTER TABLE "public"."Reservation_Information"
ADD COLUMN IF NOT EXISTS "customer_phone" text;
