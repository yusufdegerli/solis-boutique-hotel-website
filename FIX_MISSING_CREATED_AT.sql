-- Add created_at column if it is missing
ALTER TABLE "public"."Reservation_Information" 
ADD COLUMN IF NOT EXISTS "created_at" timestamp with time zone DEFAULT now();
