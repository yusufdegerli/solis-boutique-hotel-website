ALTER TABLE "public"."Reservation_Information" 
ADD COLUMN IF NOT EXISTS "customer_city" text,
ADD COLUMN IF NOT EXISTS "customer_address" text;
