import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Beds24 Webhook Handler
 * 
 * Bu endpoint, Beds24'ten gelen webhook bildirimlerini işler.
 * OTA'lardan (Booking.com, Expedia vb.) gelen rezervasyon verileri
 * (yeni rezervasyon, iptal, değişiklik) bu endpoint üzerinden alınır.
 * 
 * ngrok URL: https://cherubical-natisha-unmarketable.ngrok-free.dev/api/webhooks/beds24
 * 
 * Beds24 Status Codes:
 * 0 = Cancelled
 * 1 = Confirmed  
 * 2 = New
 * 3 = Request
 */

// Beds24 status kodlarını local status'a çevir
function mapBeds24StatusToLocal(status: number | string): string {
    const statusNum = typeof status === 'string' ? parseInt(status) : status;
    switch (statusNum) {
        case 0:
            return 'cancelled';
        case 1:
            return 'confirmed';
        case 2:
            return 'pending'; // New = Pending (onay bekliyor)
        case 3:
            return 'pending'; // Request = Pending
        default:
            return 'confirmed'; // Default
    }
}

export async function POST(request: Request) {
    try {
        // ngrok-skip-browser-warning header'ını kontrol et
        const contentType = request.headers.get('content-type') || '';

        let body;
        if (contentType.includes('application/json')) {
            body = await request.json();
        } else {
            // Form data veya diğer formatlar için
            const text = await request.text();
            try {
                body = JSON.parse(text);
            } catch {
                console.log('Beds24 Webhook: Non-JSON payload received:', text);
                body = { raw: text };
            }
        }

        console.log('============================================');
        console.log('BEDS24 WEBHOOK RECEIVED');
        console.log('============================================');
        console.log('Timestamp:', new Date().toISOString());
        console.log('Headers:', JSON.stringify(Object.fromEntries(request.headers.entries()), null, 2));
        console.log('Body:', JSON.stringify(body, null, 2));
        console.log('============================================');

        // Beds24 webhook payload yapısı (birden fazla format destekle)
        // Format 1: { event: "...", booking: {...} }
        // Format 2: { bookings: [...] } (array format)
        // Format 3: Direct booking object { bookId: ..., roomId: ..., ... }

        let bookings: any[] = [];

        if (Array.isArray(body)) {
            bookings = body;
        } else if (body.bookings && Array.isArray(body.bookings)) {
            bookings = body.bookings;
        } else if (body.booking) {
            bookings = [body.booking];
        } else if (body.bookId || body.id || body.roomId) {
            // Direct booking object
            bookings = [body];
        }

        if (bookings.length === 0) {
            console.log('Webhook: No bookings found in payload');
            return NextResponse.json({
                success: true,
                message: 'No bookings to process',
                received: true
            });
        }

        // Supabase client (service role for admin operations)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        if (!supabaseUrl || !serviceKey) {
            console.error('Webhook: Missing Supabase configuration');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, serviceKey);

        const results: any[] = [];

        for (const booking of bookings) {
            try {
                const result = await processBooking(supabase, booking, body.event || body.type);
                results.push(result);
            } catch (err: any) {
                console.error('Error processing booking:', err.message);
                results.push({ error: err.message, booking });
            }
        }

        console.log('Webhook Processing Complete. Results:', results.length);

        return NextResponse.json({
            success: true,
            processed: results.length,
            results
        });

    } catch (err: any) {
        console.error('Webhook Fatal Error:', err.message);
        console.error('Stack:', err.stack);
        return NextResponse.json({
            error: 'Webhook processing failed',
            details: err.message
        }, { status: 500 });
    }
}

async function processBooking(supabase: any, booking: any, eventType?: string) {
    // Extract Beds24 IDs
    const beds24BookingId = booking.bookId || booking.id;
    const beds24RoomId = booking.roomId || booking.room_id;

    console.log(`Processing: Beds24 Booking ID=${beds24BookingId}, Room ID=${beds24RoomId}`);

    if (!beds24RoomId || !beds24BookingId) {
        return { skipped: true, reason: 'Missing room ID or booking ID' };
    }

    // Find matching room in our database
    const { data: localRoom, error: roomError } = await supabase
        .from('Rooms_Information')
        .select('id, hotel_id, type_name')
        .eq('beds24_room_id', beds24RoomId)
        .single();

    if (roomError || !localRoom) {
        console.log(`Room ID ${beds24RoomId} not found in our DB. This may be an external channel room.`);
        return { skipped: true, reason: `Room ${beds24RoomId} not managed locally` };
    }

    console.log(`Matched local room: ${localRoom.type_name} (ID: ${localRoom.id})`);

    // Determine status
    let status = 'confirmed';

    if (booking.status !== undefined) {
        status = mapBeds24StatusToLocal(booking.status);
    } else if (eventType === 'booking_cancelled' || eventType === 'cancellation') {
        status = 'cancelled';
    } else if (eventType === 'booking_new' || eventType === 'new') {
        status = 'pending';
    }

    // Extract booking data
    const checkIn = booking.arrival || booking.arrivalDate || booking.firstNight || booking.check_in;
    const checkOut = booking.departure || booking.departureDate || booking.lastNight || booking.check_out;
    const totalPrice = parseFloat(booking.price || booking.totalPrice || booking.total || 0);

    const numAdult = parseInt(booking.numAdult || booking.adults || 0);
    const numChild = parseInt(booking.numChild || booking.children || 0);
    const guestCount = (numAdult + numChild) || 1;

    // Guest info - Beds24 API v2 uses firstName/lastName, not guestFirstName
    const firstName = booking.firstName || booking.guestFirstName || '';
    const lastName = booking.lastName || booking.guestLastName || '';
    const guestName = booking.guestName || `${firstName} ${lastName}`.trim() || 'OTA Guest';

    const guestEmail = booking.email || booking.guestEmail || 'ota-booking@noreply.com';
    const guestPhone = booking.phone || booking.mobile || booking.guestPhone || '';
    const guestCity = booking.city || booking.guestCity || '';
    const guestAddress = booking.address || booking.guestAddress || '';
    const guestCountry = booking.country || booking.guestCountry || '';

    // Source info
    const referer = booking.referer || booking.source || booking.channelName || 'Beds24/OTA';
    const notes = booking.notes || '';
    const comments = booking.comments || '';

    const checkInNotes = `Kaynak: ${referer} | Beds24 ID: ${beds24BookingId}${comments ? ' | ' + comments : ''}`;

    // Check if booking exists
    const { data: existingBooking } = await supabase
        .from('Reservation_Information')
        .select('id, room_status')
        .eq('beds24_booking_id', beds24BookingId)
        .single();

    let result;
    let action: string;

    if (existingBooking) {
        // UPDATE existing booking
        console.log(`Updating existing booking (Local ID: ${existingBooking.id})`);

        const updateData: any = {
            check_in: checkIn,
            check_out: checkOut,
            guests_count: guestCount,
            num_adults: numAdult || 1,
            num_children: numChild || 0,
            total_price: totalPrice,
            room_status: status,
            room_id: localRoom.id,
            check_in_notes: checkInNotes,
            updated_at: new Date().toISOString()
        };

        // Update guest info if provided
        if (guestName !== 'OTA Guest') updateData.customer_name = guestName;
        if (guestEmail !== 'ota-booking@noreply.com') updateData.customer_email = guestEmail;
        if (guestPhone) updateData.customer_phone = guestPhone;
        if (guestCity) updateData.customer_city = guestCity;
        if (guestAddress) updateData.customer_address = guestAddress;
        if (notes) updateData.notes = notes;

        result = await supabase
            .from('Reservation_Information')
            .update(updateData)
            .eq('id', existingBooking.id);

        action = 'updated';
    } else {
        // INSERT new booking
        if (status === 'cancelled') {
            console.log('Received cancellation for unknown booking. Ignoring.');
            return { skipped: true, reason: 'Cancellation for unknown booking' };
        }

        console.log('Inserting new booking from webhook');

        result = await supabase.from('Reservation_Information').insert({
            hotel_id: localRoom.hotel_id,
            room_id: localRoom.id,
            customer_name: guestName,
            customer_email: guestEmail,
            customer_phone: guestPhone,
            customer_city: guestCity,
            customer_address: guestAddress,
            notes: notes,
            check_in: checkIn,
            check_out: checkOut,
            guests_count: guestCount,
            num_adults: numAdult || 1,
            num_children: numChild || 0,
            total_price: totalPrice,
            room_status: status,
            payment_status: 'paid', // OTA bookings are typically pre-paid
            check_in_notes: checkInNotes,
            beds24_booking_id: beds24BookingId,
            created_at: new Date().toISOString()
        });

        action = 'inserted';
    }

    if (result.error) {
        console.error('Database Error:', result.error);
        throw new Error(result.error.message);
    }

    console.log(`Booking ${action} successfully`);

    return {
        success: true,
        action,
        beds24BookingId,
        localRoomId: localRoom.id,
        status
    };
}

// GET endpoint for health check and verification
export async function GET(request: Request) {
    const url = new URL(request.url);

    return NextResponse.json({
        status: 'active',
        message: 'Beds24 webhook endpoint is ready',
        endpoint: '/api/webhooks/beds24',
        timestamp: new Date().toISOString(),
        ngrokUrl: 'https://cherubical-natisha-unmarketable.ngrok-free.dev/api/webhooks/beds24',
        supportedMethods: ['GET', 'POST'],
        supportedFormats: ['application/json'],
        beds24StatusCodes: {
            0: 'Cancelled',
            1: 'Confirmed',
            2: 'New',
            3: 'Request'
        }
    });
}
