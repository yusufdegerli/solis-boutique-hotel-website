-- Add check-in and check-out details to Reservation_Information
ALTER TABLE "public"."Reservation_Information"
ADD COLUMN IF NOT EXISTS "guest_id_number" text,
ADD COLUMN IF NOT EXISTS "guest_nationality" text,
ADD COLUMN IF NOT EXISTS "check_in_notes" text,
ADD COLUMN IF NOT EXISTS "extra_charges" numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS "damage_report" text,
ADD COLUMN IF NOT EXISTS "payment_status" text DEFAULT 'pending'; -- 'paid', 'pending', 'refunded'
