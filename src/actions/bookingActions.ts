'use server';

import { createClient } from '@supabase/supabase-js';
import { z } from "zod";
import { sendConfirmationEmail } from '@/src/services/mailService';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, serviceKey || anonKey);

// ... existing validation schema ...
const serverBookingSchema = z.object({
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
  
  // 1. Zod Validation
  const result = serverBookingSchema.safeParse({
    room_id: bookingData.room_id,
    customer_name: bookingData.customer_name,
    customer_email: bookingData.customer_email || "no-email@provided.com",
    customer_phone: bookingData.customer_phone,
    check_in: bookingData.check_in,
    check_out: bookingData.check_out,
    guests_count: bookingData.guests_count || 1,
    total_price: bookingData.total_price // NEW
  });

  if (!result.success) {
    // Cast to any to bypass potential Zod type definition mismatch in this environment
    const errorMessage = (result.error as any).errors.map((e: any) => e.message).join(', ');
    console.error('Validation Error:', errorMessage);
    return { success: false, error: errorMessage };
  }

  const payload = result.data;
  
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
    
    if (!rpcResult.success) {
      return { success: false, error: rpcResult.error || 'Rezervasyon oluşturulamadı.' };
    }

    return { success: true, data: [{ id: rpcResult.data }] };

  } catch (err) {
    console.error('Unexpected error in createBookingServer:', err);
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

    // --- EMAIL NOTIFICATION LOGIC ---
    // If status is confirmed, send email
    if (status === 'confirmed') {
        const booking = data[0];
        if (booking.customer_email && booking.customer_email !== 'no-email@provided.com') {
            // Send email asynchronously (don't await strictly if you don't want to block UI)
            // But usually, awaiting ensures we know if it failed.
            console.log(`Sending confirmation email to ${booking.customer_email}...`);
            await sendConfirmationEmail(booking.customer_email, booking.customer_name);
        } else {
            console.log('No valid email for confirmation.');
        }
    }

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
