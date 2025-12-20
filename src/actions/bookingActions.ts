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
    // total_price: bookingData.total_price, // REMOVED: Insecure
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
  
  // Calculate nights
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  const nights = diffDays > 0 ? diffDays : 1;
  // -----------------------

  if (serviceKey) {
      console.log('Using Service Role Key (Bypassing RLS)');
  } else {
      console.log('Using Anon Key (Subject to RLS)');
  }

  // --- PRICE CALCULATION (Secure) ---
  let calculatedTotalPrice = 0;
  let totalQuantity = 0;

  try {
      // Fetch Room Base Price & Quantity
      const { data: roomData, error: roomError } = await supabase
        .from('Rooms_Information')
        .select('base_price, quantity')
        .eq('id', payload.room_id)
        .single();

      if (roomError || !roomData) {
          console.error('Room Fetch Error:', roomError);
          return { success: false, error: 'Seçilen oda bilgisi bulunamadı.' };
      }

      const basePrice = Number(roomData.base_price);
      totalQuantity = roomData.quantity ?? 5;

      calculatedTotalPrice = basePrice * nights;
      console.log(`Price Calculation: ${basePrice} * ${nights} nights = ${calculatedTotalPrice}`);

  } catch (err) {
      console.error('Price calculation error:', err);
      return { success: false, error: 'Fiyat hesaplanırken bir hata oluştu.' };
  }
  // ----------------------------------

  // --- OVERBOOKING CHECK ---
  try {
      const { count, error: countError } = await supabase
        .from('Reservation_Information')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', payload.room_id)
        .neq('room_status', 'cancelled')
        .lt('check_in', payload.check_out) 
        .gt('check_out', payload.check_in);
        
      if (countError) {
          console.error('Availability Check Error:', countError);
      } else {
          const currentBookings = count || 0;
          if (currentBookings >= totalQuantity) {
              return { 
                  success: false, 
                  error: `Üzgünüz, seçilen tarih aralığında bu oda tipi tamamen doludur.` 
              };
          }
      }
  } catch (err) {
      console.error('Unexpected error during availability check:', err);
      return { success: false, error: 'Müsaitlik kontrolü sırasında bir hata oluştu.' };
  }
  // -------------------------

  // --- INSERT RESERVATION ---
  // Note: db_schema.sql has customer_name, customer_email in Reservation_Information.
  // It does NOT have customer_id or a separate Customers table.
  
  const { data, error } = await supabase
    .from('Reservation_Information')
    .insert([{
      hotel_id: null, // Schema has it, but we might not have it in bookingData easily. Optional/Nullable?
      room_id: payload.room_id,
      customer_name: payload.customer_name,
      customer_email: payload.customer_email,
      check_in: payload.check_in,
      check_out: payload.check_out,
      guests_count: bookingData.guests_count || 1, // Added guests_count
      total_price: calculatedTotalPrice, // Use SERVER-CALCULATED price
      room_status: payload.room_status
    }])
    .select();

  if (error) {
    console.error('Supabase Error in createBookingServer:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data };
}
