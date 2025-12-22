-- Add missing statuses to reservation_status ENUM
-- Run this in Supabase SQL Editor

BEGIN;

-- Add 'completed' (This was the cause of the error)
DO $$
BEGIN
    ALTER TYPE reservation_status ADD VALUE IF NOT EXISTS 'completed';
EXCEPTION
    WHEN duplicate_object THEN null; 
END $$;

-- Add 'confirmed' (Just in case)
DO $$
BEGIN
    ALTER TYPE reservation_status ADD VALUE IF NOT EXISTS 'confirmed';
EXCEPTION
    WHEN duplicate_object THEN null; 
END $$;

-- Add 'cancelled' (Just in case)
DO $$
BEGIN
    ALTER TYPE reservation_status ADD VALUE IF NOT EXISTS 'cancelled';
EXCEPTION
    WHEN duplicate_object THEN null; 
END $$;

COMMIT;
