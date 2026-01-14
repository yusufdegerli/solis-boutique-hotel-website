'use server';

import { createClient } from '@supabase/supabase-js';
import { z } from "zod";
import { sendBookingNotification } from '@/services/notificationService';
import { sendConfirmationEmail } from '@/services/mailService'; // Keep for now or remove if unused later
import { updateAvailability, createChannexBooking, cancelChannexBooking } from '@/lib/channex';
import { eachDayOfInterval, format, subDays } from 'date-fns';

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
  customer_city: z.string().optional(),
  customer_address: z.string().optional(),
  notes: z.string().optional(),
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
  console.log('--- SERVER ACTION START ---');
  console.log('Received Payload:', JSON.stringify(bookingData, null, 2));
  
  // 1. Zod Validation
  const result = serverBookingSchema.safeParse({
    hotel_id: Number(bookingData.hotel_id), // Explicit cast
    room_id: Number(bookingData.room_id),   // Explicit cast
    customer_name: bookingData.customer_name,
    customer_email: bookingData.customer_email || "no-email@provided.com",
    customer_phone: bookingData.customer_phone,
    customer_city: bookingData.customer_city,
    customer_address: bookingData.customer_address,
    notes: bookingData.notes,
    check_in: bookingData.check_in,
    check_out: bookingData.check_out,
    guests_count: Number(bookingData.guests_count) || 1,
    total_price: Number(bookingData.total_price) // Explicit cast
  });

  if (!result.success) {
    console.error('Validation Failed:', JSON.stringify(result.error, null, 2));
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
  
  try {
      // 1. Get Room Info (for validation and hotel_id)
      const { data: roomInfo, error: roomInfoError } = await supabase
          .from('Rooms_Information')
          .select('id, quantity, hotel_id, channex_room_type_id, channex_rate_plan_id')
          .eq('id', payload.room_id)
          .single();

      if (roomInfoError || !roomInfo) {
          console.error('Room Fetch Error:', roomInfoError);
          return { success: false, error: 'Oda bilgisi bulunamadı.' };
      }

      const roomQuantity = roomInfo.quantity;
      const hotelId = payload.hotel_id || roomInfo.hotel_id; // Prefer payload, fallback to DB

      // 2. Check Availability (Overlapping bookings)
      const { count, error: countError } = await supabase
          .from('Reservation_Information')
          .select('*', { count: 'exact', head: true })
          .eq('room_id', payload.room_id)
          .neq('room_status', 'cancelled')
          .neq('room_status', 'checked_out')
          .neq('room_status', 'completed')
          .lt('check_in', payload.check_out)
          .gt('check_out', payload.check_in);

      if (countError) {
          console.error('Availability Check Error:', countError);
          return { success: false, error: 'Müsaitlik kontrolü başarısız.' };
      }

      if ((count || 0) >= roomQuantity) {
          return { success: false, error: 'Seçilen tarihlerde boş oda yok.' };
      }

      // 3. Create Booking (Supabase)
      const cancellationToken = crypto.randomUUID();

      const { data: newBooking, error: insertError } = await supabase
          .from('Reservation_Information')
          .insert({
              hotel_id: hotelId,
              room_id: payload.room_id,
              customer_name: payload.customer_name,
              customer_email: payload.customer_email,
              customer_phone: payload.customer_phone || "",
              customer_city: payload.customer_city,
              customer_address: payload.customer_address,
              check_in: payload.check_in,
              check_out: payload.check_out,
              guests_count: payload.guests_count,
              total_price: payload.total_price,
              room_status: 'pending',
              cancellation_token: cancellationToken,
              check_in_notes: payload.notes // Mapping notes to check_in_notes
          })
          .select()
          .single();

      if (insertError) {
          console.error('Insert Error:', insertError);
          return { success: false, error: 'Rezervasyon oluşturulamadı: ' + insertError.message };
      }

      const bookingId = newBooking.id;

      // --- CHANNEX BOOKING CREATE START (NEW) ---
      // We do this BEFORE the availability loop to ensure the booking exists in Channex first, 
      // although they are somewhat independent.
      let channexBookingId = null;
      if (roomInfo.channex_room_type_id && roomInfo.channex_rate_plan_id) {
         console.log('--- CHANNEX BOOKING SYNC START ---');
         const channexResult = await createChannexBooking({
            arrival_date: payload.check_in,
            departure_date: payload.check_out,
            room_type_id: roomInfo.channex_room_type_id,
            rate_plan_id: roomInfo.channex_rate_plan_id,
            guests_count: payload.guests_count,
            total_price: payload.total_price || 0,
            customer: {
               name: payload.customer_name,
               email: payload.customer_email,
               phone: payload.customer_phone,
               country: 'TR', // Default to TR or extract if available
               city: payload.customer_city,
               address: payload.customer_address
            },
            notes: payload.notes,
            unique_id: bookingId // Use our UUID as reference
         });

         if (channexResult.success && channexResult.data?.data) {
             channexBookingId = channexResult.data.data.id;
             console.log('Channex Booking ID:', channexBookingId);

             // Update Supabase record with Channex ID
             await supabase
                .from('Reservation_Information')
                .update({ channex_booking_id: channexBookingId })
                .eq('id', bookingId);
         } else {
             console.error('Channex Booking Creation Failed (Non-blocking):', channexResult.error);
         }
      }
      // --- CHANNEX BOOKING CREATE END ---

      // --- NOTIFICATION TRIGGER ---
      const notificationPayload = {
        id: bookingId,
        customer_name: payload.customer_name,
        customer_email: payload.customer_email,
        customer_phone: payload.customer_phone,
        cancellation_token: cancellationToken
      };
      
      sendBookingNotification(notificationPayload, 'pending').catch(err => console.error('Notification Error:', err));
      
      // --- CHANNEX AVAILABILITY SYNC (Existing Logic) ---
      // Still useful to sync exact counts even if Channex handles it, 
      // ensuring double safety or custom logic.
      try {
        if (roomInfo.channex_room_type_id && roomInfo.channex_rate_plan_id) {
            const totalRooms = roomInfo.quantity;
            const channexId = roomInfo.channex_room_type_id;
            const rateId = roomInfo.channex_rate_plan_id;

            const startDate = new Date(payload.check_in);
            const endDate = new Date(payload.check_out);
            const nights = eachDayOfInterval({
              start: startDate,
              end: subDays(endDate, 1) 
            });

            await Promise.all(nights.map(async (date) => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const { count, error: countError } = await supabase
                  .from('Reservation_Information')
                  .select('*', { count: 'exact', head: true })
                  .eq('room_id', payload.room_id)
                  .neq('room_status', 'cancelled')
                  .neq('room_status', 'checked_out')
                  .neq('room_status', 'completed')
                  .lte('check_in', dateStr)
                  .gt('check_out', dateStr);

                if (!countError) {
                    const currentCount = count !== null ? count : 0;
                    const remaining = Math.max(0, totalRooms - currentCount);
                    await updateAvailability(channexId, rateId, dateStr, remaining);
                }
            }));
        }
      } catch (channexErr) {
          console.error('Channex Sync Error:', channexErr);
      }

      return { success: true, data: [{ id: bookingId }] };
  
    } catch (err: any) {
    console.error('Unexpected error in createBookingServer:', err);
    return { success: false, error: 'Beklenmedik bir hata oluştu: ' + err.message };
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

    const booking = data[0];
    
    // Sync with Channex if cancelled
    if (status === 'cancelled' && booking.channex_booking_id) {
       console.log(`Syncing cancellation to Channex for Booking ID: ${booking.channex_booking_id}`);
       await cancelChannexBooking(booking.channex_booking_id);
    }

    sendBookingNotification(booking, status).catch(err => console.error('Update Notification Error:', err));

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
