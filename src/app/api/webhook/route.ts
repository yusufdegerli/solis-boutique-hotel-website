import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Channex Webhook Handler
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Webhook Received:', JSON.stringify(body, null, 2));

    const eventType = body.event; // e.g. 'booking_new', 'booking_modification', 'booking_cancellation'
    const payload = body.payload;

    // 1. Basic Validation
    if (!payload || !eventType) {
      return NextResponse.json({ message: 'Invalid payload structure' }, { status: 400 });
    }

    // We only care about bookings for now
    if (!eventType.startsWith('booking_')) {
      return NextResponse.json({ message: 'Event ignored (not a booking)' });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // 2. Extract Booking Data from Payload
    // If the payload has a 'booking' wrapper, use it. Otherwise use payload directly.
    const booking = payload.booking || payload;
    
    const channexRooms = booking.rooms || [];
    const channexRoom = channexRooms[0];
    
    if (!channexRoom) {
         console.error('Webhook: No room details found in booking payload.');
         return NextResponse.json({ message: 'No room details' });
    }

    const channexRoomTypeId = channexRoom.room_type_id;
    const channexBookingId = booking.id || payload.id; // Channex Booking UUID

    // 3. Find Matching Room in Our DB
    const { data: localRoom, error: roomError } = await supabase
        .from('Rooms_Information')
        .select('id, hotel_id, type_name')
        .eq('channex_room_type_id', channexRoomTypeId)
        .single();

    if (roomError || !localRoom) {
        console.log(`Webhook: Room ID ${channexRoomTypeId} not found in our DB. Skipping as external room.`);
        return NextResponse.json({ message: 'Room not managed by local system, skipped.' });
    }

    console.log(`Webhook: Matched local room: ${localRoom.type_name} (ID: ${localRoom.id})`);

    // 4. Map Status
    let status = 'confirmed'; // Default for new bookings from OTAs
    if (eventType === 'booking_cancellation' || booking.status === 'cancelled') {
        status = 'cancelled';
    } else if (booking.status === 'modified') {
        status = 'confirmed'; 
    }

    // 5. Prepare Data
    const customer = booking.customer || {};
    const checkIn = booking.arrival_date;
    const checkOut = booking.departure_date;
    const totalPrice = booking.total_price || 0;
    
    // Calculate total guests from occupancy or guests array
    let guestCount = 1;
    if (channexRoom.occupancy) {
        guestCount = (channexRoom.occupancy.adults || 0) + (channexRoom.occupancy.children || 0);
    } else if (channexRoom.guests) {
        guestCount = channexRoom.guests.length;
    }
    
    const notes = `Source: ${booking.ota_name || 'OTA'} | OTA Ref: ${booking.ota_reservation_code || 'N/A'} | Channex ID: ${channexBookingId}`;

    // 6. Database Operation (Upsert Logic)
    // We try to update first based on channex_booking_id. If not found, we insert.
    
    // Check if booking exists
    const { data: existingBooking } = await supabase
        .from('Reservation_Information')
        .select('id')
        .eq('channex_booking_id', channexBookingId)
        .single();

    let result;
    
    if (existingBooking) {
        // UPDATE Existing
        console.log(`Webhook: Updating existing booking ${existingBooking.id}`);
        result = await supabase
            .from('Reservation_Information')
            .update({
                check_in: checkIn,
                check_out: checkOut,
                guests_count: guestCount,
                total_price: totalPrice,
                room_status: status,
                // We update room_id just in case they changed room type, 
                // but this requires the new room type to be mapped too. 
                // For now, we assume room type update is handled by the initial lookup.
                room_id: localRoom.id, 
                check_in_notes: notes
            })
            .eq('id', existingBooking.id);
    } else {
        // INSERT New
        // Only insert if it's NOT a cancellation for a booking we don't have
        if (status === 'cancelled') {
             console.log('Webhook: Received cancellation for unknown booking. Ignoring.');
             return NextResponse.json({ message: 'Cancellation for unknown booking ignored' });
        }

        console.log('Webhook: Inserting new booking');
        result = await supabase.from('Reservation_Information').insert({
            hotel_id: localRoom.hotel_id,
            room_id: localRoom.id,
            customer_name: `${customer.name || ''} ${customer.surname || ''}`.trim() || 'OTA Guest',
            customer_email: customer.mail || 'ota-booking@noreply.com',
            customer_phone: customer.phone || '',
            check_in: checkIn,
            check_out: checkOut,
            guests_count: guestCount,
            total_price: totalPrice,
            room_status: status,
            payment_status: 'paid', // Assume OTA paid
            check_in_notes: notes,
            channex_booking_id: channexBookingId
        });
    }

    if (result.error) {
        console.error('Webhook DB Error:', result.error);
        throw new Error(result.error.message);
    }

    return NextResponse.json({ success: true, action: existingBooking ? 'updated' : 'inserted' });

  } catch (err: any) {
    console.error('Webhook Fatal Error:', err.message);
    return NextResponse.json({ error: 'Webhook processing failed', details: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Webhook endpoint active' });
}