'use server';

import { createClient } from '@supabase/supabase-js';
import { z } from "zod";
import { sendBookingNotification } from '@/services/notificationService';
import { sendConfirmationEmail } from '@/services/mailService'; // Keep for now or remove if unused later
// [BEDS24 DISABLED] - Elektra kullanılacak
// import { updateAvailability, createBeds24Booking, cancelBeds24Booking, cancelBeds24BookingV1, updateBeds24BookingStatus } from '@/lib/beds24';
import { eachDayOfInterval, format, subDays } from 'date-fns';
import { checkRateLimit } from '@/lib/rateLimit';
import { headers } from 'next/headers';

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
  check_in: z.string().refine((date) => new Date(date) >= new Date(new Date().setHours(0, 0, 0, 0)), {
    message: "Giriş tarihi bugünden eski olamaz",
  }),
  check_out: z.string(),
  guests_count: z.coerce.number().min(1).max(10),
  num_adults: z.coerce.number().min(1).max(10).optional(),
  num_children: z.coerce.number().min(0).max(10).optional(),
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

  // === HONEYPOT CHECK ===
  // If honeypot field is filled, it's a bot
  if (bookingData._honeypot && bookingData._honeypot.trim() !== '') {
    console.log('Honeypot triggered - blocking spam request');
    return { success: false, error: 'İstek reddedildi.' };
  }

  // === RATE LIMITING ===
  const headersList = await headers();
  const clientIP = headersList.get('x-forwarded-for')?.split(',')[0] ||
    headersList.get('x-real-ip') ||
    'unknown';

  const rateLimitResult = checkRateLimit(clientIP);
  if (!rateLimitResult.allowed) {
    const minutesLeft = Math.ceil(rateLimitResult.resetIn / 60000);
    console.log(`Rate limit exceeded for IP: ${clientIP}`);
    return {
      success: false,
      error: `Çok fazla istek gönderdiniz. Lütfen ${minutesLeft} dakika sonra tekrar deneyin.`
    };
  }

  console.log(`Rate limit check passed for IP: ${clientIP} (${rateLimitResult.remaining} remaining)`);
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
    num_adults: Number(bookingData.num_adults) || 1,
    num_children: Number(bookingData.num_children) || 0,
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
    // === MOCK ROOM VALIDATION (Bypass DB) ===
    const hotelId = payload.hotel_id;

    // === MOCK AVAILABILITY CHECK ===
    // We assume the room is always requested, no DB overlapping checks

    // === MOCK BOOKING CREATION ===
    console.log('--- BYPASSING SUPABASE INSERT ---');
    const cancellationToken = crypto.randomUUID();
    const mockDbId = Math.floor(Math.random() * 100000); // Random ID for the user's reference

    const newBooking = {
      id: mockDbId,
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
      num_adults: payload.num_adults || 1,
      num_children: payload.num_children || 0,
      total_price: payload.total_price,
      room_status: 'pending',
      cancellation_token: cancellationToken,
      check_in_notes: payload.notes
    };

    console.log('Mock Booking ID generated:', newBooking.id);
    const bookingId = newBooking.id;

    // [BEDS24 DISABLED] - Elektra kullanılacak
    // --- BEDS24 BOOKING CREATE START ---
    // Beds24 channel manager entegrasyonu devre dışı bırakıldı
    // Elektra entegrasyonu yapılacak
    /*
    let beds24BookingId = null;
    if (roomInfo.beds24_room_id) {
      console.log('--- BEDS24 BOOKING SYNC START ---');
      const beds24Result = await createBeds24Booking({
        arrival_date: payload.check_in,
        departure_date: payload.check_out,
        room_id: roomInfo.beds24_room_id,
        num_adults: payload.num_adults || payload.guests_count,
        num_children: payload.num_children || 0,
        guest_names: bookingData.guest_names || [],
        total_price: payload.total_price || 0,
        customer: {
          name: payload.customer_name,
          email: payload.customer_email,
          phone: payload.customer_phone,
          country: 'TR',
          city: payload.customer_city,
          address: payload.customer_address
        },
        notes: payload.notes,
        unique_id: bookingId
      });

      if (beds24Result.success && beds24Result.data?.bookId) {
        beds24BookingId = beds24Result.data.bookId;
        console.log('Beds24 Booking ID:', beds24BookingId);

        // Update Supabase record with Beds24 ID
        await supabase
          .from('Reservation_Information')
          .update({ beds24_booking_id: beds24BookingId })
          .eq('id', bookingId);
      } else {
        console.error('Beds24 Booking Creation Failed (Non-blocking):', beds24Result.error);
      }
    }
    */
    // --- BEDS24 BOOKING CREATE END ---

    // --- NOTIFICATION TRIGGER ---
    const notificationPayload = {
      id: bookingId,
      customer_name: payload.customer_name,
      customer_email: payload.customer_email,
      customer_phone: payload.customer_phone,
      cancellation_token: cancellationToken
    };

    sendBookingNotification(notificationPayload, 'pending').catch(err => console.error('Notification Error:', err));

    // [BEDS24 DISABLED] - Elektra kullanılacak
    // --- BEDS24 AVAILABILITY SYNC ---
    // Beds24 müsaitlik senkronizasyonu devre dışı bırakıldı
    /*
    try {
      if (roomInfo.beds24_room_id) {
        const totalRooms = roomInfo.quantity;
        const beds24RoomId = roomInfo.beds24_room_id;

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
            await updateAvailability(beds24RoomId, dateStr, remaining);
          }
        }));
      }
    } catch (beds24Err) {
      console.error('Beds24 Sync Error:', beds24Err);
    }
    */

    return { success: true, data: [{ id: bookingId }] };

  } catch (err: any) {
    console.error('Unexpected error in createBookingServer:', err);
    return { success: false, error: 'Beklenmedik bir hata oluştu: ' + err.message };
  }
}

export async function updateBookingStatusServer(id: string, status: string, details?: any): Promise<{ success: boolean; data?: any; error?: string }> {
  // Bypass completely for static mockup
  return { success: true, data: [] };
}
