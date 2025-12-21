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
  console.log('--- SERVER ACTION START ---');
  console.log('Received Payload:', JSON.stringify(bookingData, null, 2));
  console.log('Type of room_id:', typeof bookingData.room_id);
  console.log('Value of room_id:', bookingData.room_id);
  
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
  
  // --- SERVICE KEY CHECK ---
  if (!serviceKey) {
    console.error('CRITICAL ERROR: SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables.');
    return { 
      success: false, 
      error: 'Sunucu yapılandırma hatası: Rezervasyon sistemi şu an devre dışı.' 
    };
  }
  
  if (serviceKey) {
      console.log('Using Service Role Key (Bypassing RLS)');
  } else {
      console.log('Using Anon Key (Subject to RLS)');
  }

  // --- ATOMIC BOOKING CREATION (Via RPC) ---
  try {
    const { data: rpcResult, error: rpcError } = await supabase.rpc('create_booking_safe', {
      p_room_id: payload.room_id,
      p_customer_name: payload.customer_name,
      p_customer_email: payload.customer_email,
      p_check_in: payload.check_in,
      p_check_out: payload.check_out,
      p_guests_count: bookingData.guests_count || 1
    });

    if (rpcError) {
      console.error('RPC Error:', rpcError);
      return { success: false, error: 'İşlem sırasında bir hata oluştu: ' + rpcError.message };
    }

    // The RPC returns a JSON object with { success, error?, data? }
    // We need to parse/handle it. 
    // Supabase RPC usually returns the JSON directly as `data`.
    
    if (!rpcResult.success) {
      return { success: false, error: rpcResult.error || 'Rezervasyon oluşturulamadı.' };
    }

    return { success: true, data: [{ id: rpcResult.data }] };

  } catch (err) {
    console.error('Unexpected error in createBookingServer:', err);
    return { success: false, error: 'Beklenmedik bir hata oluştu.' };
  }
}
