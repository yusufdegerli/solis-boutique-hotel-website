'use server';

import { createClient } from '@supabase/supabase-js';
import { z } from "zod";
import { sendBookingNotification } from '@/services/notificationService';
import { sendConfirmationEmail } from '@/services/mailService'; // Keep for now or remove if unused later

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, serviceKey || anonKey);

// ... existing validation schema ...
const serverBookingSchema = z.object({
  hotel_id: z.coerce.number().optional(), // NEW
  room_id: z.coerce.number().positive(),
  customer_name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
  customer_email: z.string().email("Geçersiz e-posta adresi").or(z.literal("no-email@provided.com")),
  customer_phone: z.string().optional(),
  check_in: z.string().refine((date) => new Date(date) >= new Date(new Date().setHours(0,0,0,0)), {
    message: "Giriş tarihi bugünden eski olamaz",
  }),
  check_out: z.string(),
  guests_count: z.coerce.number().min(1).max(10),
  total_price: z.coerce.number().optional(), // NEW
}).refine((data) => {
  const start = new Date(data.check_in);
  const end = new Date(data.check_out);
  return end > start;
}, {
  message: "Çıkış tarihi giriş tarihinden sonra olmalıdır",
  path: ["check_out"],
});

export async function createBookingServer(bookingData: any) {
  // ... existing code ...
  console.log('--- SERVER ACTION START ---');
  console.log('Received Payload:', JSON.stringify(bookingData, null, 2));
  
  // 1. Zod Validation
  // Ensure we handle "NaN" or string numbers correctly
  const result = serverBookingSchema.safeParse({
    hotel_id: Number(bookingData.hotel_id), // Explicit cast
    room_id: Number(bookingData.room_id),   // Explicit cast
    customer_name: bookingData.customer_name,
    customer_email: bookingData.customer_email || "no-email@provided.com",
    customer_phone: bookingData.customer_phone,
    check_in: bookingData.check_in,
    check_out: bookingData.check_out,
    guests_count: Number(bookingData.guests_count) || 1,
    total_price: Number(bookingData.total_price) // Explicit cast
  });

  if (!result.success) {
    console.error('Validation Failed:', JSON.stringify(result.error, null, 2));
    // Try to extract messages from the formatted error or the flat errors
    const formatted = result.error.format();
    const flatErrors = result.error.flatten();
    
    // Prioritize field errors
    const fieldErrorMessages = Object.entries(flatErrors.fieldErrors)
        .map(([field, errors]) => `${field}: ${errors?.join(', ')}`)
        .join(' | ');
        
    const formErrorMessages = flatErrors.formErrors.join(', ');

    const combinedMessage = [fieldErrorMessages, formErrorMessages].filter(Boolean).join(' | ');

    return { success: false, error: combinedMessage || 'Doğrulama Hatası (Detay yok)' };
  }

  const payload = result.data;
  
  if (isNaN(payload.room_id)) {
     return { success: false, error: "Geçersiz Oda ID" };
  }
  
  // --- SERVICE KEY CHECK ---
  if (!serviceKey) {
    console.error('CRITICAL ERROR: SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables.');
    return { 
      success: false, 
      error: 'Sunucu yapılandırma hatası: Rezervasyon sistemi şu an devre dışı.' 
    };
  }

      // --- ATOMIC BOOKING CREATION (Via RPC) ---
    try {
      const { data: rpcResult, error: rpcError } = await supabase.rpc('create_booking_safe', {
        p_hotel_id: payload.hotel_id, // NEW
        p_room_id: payload.room_id,
        p_customer_name: payload.customer_name,
        p_customer_email: payload.customer_email,
        p_customer_phone: payload.customer_phone || "",
        p_check_in: payload.check_in,
        p_check_out: payload.check_out,
        p_guests_count: payload.guests_count,
        p_total_price: payload.total_price // NEW PARAM
      });
  
      if (rpcError) {
        console.error('RPC Error:', rpcError);
        return { success: false, error: 'İşlem sırasında bir hata oluştu: ' + rpcError.message };
      }
  
      // Handle RPC response
      // The new RPC returns { success: bool, data: { id: number, token: string }, error: string }
      // But rpc returns an array of rows. Since we use RETURN QUERY SELECT..., it might be [ { success:..., data:..., error:... } ]
      
      const row = Array.isArray(rpcResult) ? rpcResult[0] : rpcResult;
      
      if (!row || !row.success) {
        return { success: false, error: row?.error || 'Rezervasyon oluşturulamadı.' };
      }
  
      const resultData = row.data; // This is now { id: ..., token: ... }
      const bookingId = resultData.id;
      const cancellationToken = resultData.token;
  
      // --- NOTIFICATION TRIGGER (NEW) ---
      const notificationPayload = {
        id: bookingId,
        customer_name: payload.customer_name,
        customer_email: payload.customer_email,
        customer_phone: payload.customer_phone,
        cancellation_token: cancellationToken // Pass token to notification
      };
      
      // Send "Pending" notification
      sendBookingNotification(notificationPayload, 'pending').catch(err => console.error('Notification Error:', err));
      
      return { success: true, data: [{ id: bookingId }] };
  
    } catch (err) {    console.error('Unexpected error in createBookingServer:', err);
    return { success: false, error: 'Beklenmedik bir hata oluştu.' };
  }
}

export async function updateBookingStatusServer(id: string, status: string, details?: any) {
  const supabase = createClient(supabaseUrl, serviceKey || anonKey);
  
  const updatePayload: any = { room_status: status };
  
  if (details) {
      if (details.guest_id_number !== undefined) updatePayload.guest_id_number = details.guest_id_number;
      if (details.guest_nationality !== undefined) updatePayload.guest_nationality = details.guest_nationality;
      if (details.check_in_notes !== undefined) updatePayload.check_in_notes = details.check_in_notes;
      if (details.extra_charges !== undefined) updatePayload.extra_charges = details.extra_charges;
      if (details.damage_report !== undefined) updatePayload.damage_report = details.damage_report;
      if (details.payment_status !== undefined) updatePayload.payment_status = details.payment_status;
  }

  try {
    const { data, error } = await supabase
      .from('Reservation_Information')
      .update(updatePayload)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Update Error (Server):', error);
      return { success: false, error: error.message };
    }
    
    if (!data || data.length === 0) {
       return { success: false, error: "Kayıt bulunamadı veya güncellenemedi." };
    }

    // --- NOTIFICATION LOGIC ---
    // Trigger notification for ANY status change that we care about
    const booking = data[0];
    // Check if status actually changed or if it's just an update of details? 
    // The function argument 'status' is the target status.
    
    // Send notification (async)
    sendBookingNotification(booking, status).catch(err => console.error('Update Notification Error:', err));

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
