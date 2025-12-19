'use server';

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// Try to use the Service Role Key first (bypasses RLS)
// If not available, fall back to Anon Key (subject to RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, serviceKey || anonKey);

export async function createBookingServer(bookingData: any) {
  console.log('Server Action: Creating booking...');
  
  // Construct payload (ensure clean data)
  // Assuming the DB schema matches the one inferred:
  // room_id, customer_name, check_in, check_out, total_price, room_status
  // And NO customer_email
  
  const payload = {
    room_id: bookingData.room_id,
    customer_name: bookingData.customer_name,
    // Note: DB column has a typo "custome_email" instead of "customer_email"
    custome_email: bookingData.customer_email || "no-email@provided.com",
    check_in: bookingData.check_in,
    check_out: bookingData.check_out,
    total_price: bookingData.total_price,
    room_status: bookingData.room_status || 'pending'
  };

  if (serviceKey) {
      console.log('Using Service Role Key (Bypassing RLS)');
  } else {
      console.log('Using Anon Key (Subject to RLS)');
  }

  const { data, error } = await supabase
    .from('Reservation_Information')
    .insert([payload])
    .select();

  if (error) {
    console.error('Supabase Error in createBookingServer:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}
