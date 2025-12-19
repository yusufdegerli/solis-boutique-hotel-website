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
    customer_email: bookingData.customer_email || "no-email@provided.com",
    check_in: bookingData.check_in,
    check_out: bookingData.check_out,
    total_price: bookingData.total_price,
    room_status: bookingData.room_status || 'pending'
  };

  // --- DATE VALIDATION ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkIn = new Date(payload.check_in);
  const checkOut = new Date(payload.check_out);

  if (checkIn < today) {
    return { success: false, error: 'Giriş tarihi bugünden eski olamaz.' };
  }
  if (checkOut <= checkIn) {
    return { success: false, error: 'Çıkış tarihi giriş tarihinden sonra olmalıdır.' };
  }
  // -----------------------

  if (serviceKey) {
      console.log('Using Service Role Key (Bypassing RLS)');
  } else {
      console.log('Using Anon Key (Subject to RLS)');
  }

  // --- CUSTOMER HANDLING (Find or Create) ---
  let customerId = null;
  try {
    // 1. Check if customer exists by email
    const { data: existingCustomer, error: findError } = await supabase
      .from('Customers')
      .select('id')
      .eq('email', payload.customer_email)
      .single();

    if (existingCustomer) {
      customerId = existingCustomer.id;
      console.log(`Found existing customer ID: ${customerId}`);
    } else {
      // 2. Create new customer if not found
      // Ignore "PGRST116" (JSON object requested, multiple (or no) rows returned) -> usually means not found in .single()
      
      console.log('Creating new customer...');
      const { data: newCustomer, error: createError } = await supabase
        .from('Customers')
        .insert([{
          full_name: payload.customer_name,
          email: payload.customer_email,
          // phone: payload.phone // If we had phone in form
        }])
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating customer:', createError);
        // We can choose to fail or proceed without linking customer. 
        // Let's proceed but log error.
      } else {
        customerId = newCustomer.id;
        console.log(`Created new customer ID: ${customerId}`);
      }
    }
  } catch (err) {
    console.error('Unexpected error in customer handling:', err);
  }
  // ------------------------------------------

  // --- OVERBOOKING CHECK ---
  try {
      // 1. Get Room Quantity
      const { data: roomData, error: roomError } = await supabase
        .from('Rooms_Information')
        .select('quantity')
        .eq('id', payload.room_id)
        .single();
        
      if (roomError) {
          console.error('Check Room Error:', roomError);
          // If room not found/error, maybe default to allow or fail. Let's fail safe.
          // But if column quantity is missing (old DB), this might fail. Assuming DB is updated.
      }
      
      const totalQuantity = roomData?.quantity ?? 5; // Default to 5 if not set

      // 2. Count overlapping active bookings
      // Active = Not Cancelled AND Not Checked Out (Checked Out means they left, room is free? 
      // Actually Checked Out means the booking IS completed. But for *future* availability, 
      // checked_out bookings are in the past. If a booking is currently checked_out, 
      // its dates are in the past (or today).
      // So we just filter out 'cancelled'.
      // Wait, if I check out today, my booking dates (Jan 1 - Jan 5) still overlap 
      // with a request for Jan 4-6. So 'checked_out' SHOULD be counted if it overlaps!
      // Only 'cancelled' should be ignored.
      
      const { count, error: countError } = await supabase
        .from('Reservation_Information')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', payload.room_id)
        .neq('room_status', 'cancelled')
        .lt('check_in', payload.check_out) // Existing Start < Request End
        .gt('check_out', payload.check_in); // Existing End > Request Start
        
      if (countError) {
          console.error('Availability Check Error:', countError);
          // throw countError; // Decide if we want to block on check error
      } else {
          const currentBookings = count || 0;
          if (currentBookings >= totalQuantity) {
              return { 
                  success: false, 
                  error: `Üzgünüz, seçilen tarih aralığında bu oda tipi tamamen doludur. (Müsait: 0, Talep: 1)` 
              };
          }
      }

  } catch (err) {
      console.error('Unexpected error during availability check:', err);
      // Fallthrough to insert? Or return error?
      // Let's return error to be safe.
      return { success: false, error: 'Müsaitlik kontrolü sırasında bir hata oluştu.' };
  }
  // -------------------------

  const { data, error } = await supabase
    .from('Reservation_Information')
    .insert([{
      ...payload,
      customer_id: customerId // Add the linked customer ID
    }])
    .select();

  if (error) {
    console.error('Supabase Error in createBookingServer:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}
