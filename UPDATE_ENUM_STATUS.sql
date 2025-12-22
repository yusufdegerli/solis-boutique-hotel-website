-- Update the reservation_status ENUM to include new statuses
-- Run this in Supabase SQL Editor

BEGIN;

-- Attempt to add 'checked_in' if it doesn't exist
DO $$
BEGIN
    ALTER TYPE reservation_status ADD VALUE IF NOT EXISTS 'checked_in';
EXCEPTION
    WHEN duplicate_object THEN null; -- Ignore if already exists
END $$;

-- Attempt to add 'checked_out' if it doesn't exist
DO $$
BEGIN
    ALTER TYPE reservation_status ADD VALUE IF NOT EXISTS 'checked_out';
EXCEPTION
    WHEN duplicate_object THEN null; -- Ignore if already exists
END $$;

COMMIT;
