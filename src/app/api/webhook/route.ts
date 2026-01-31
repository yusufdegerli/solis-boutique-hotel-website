import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Beds24 Webhook Handler
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Beds24 Webhook Received:', JSON.stringify(body, null, 2));

    // Beds24 webhook structure (adjust based on actual Beds24 format)
    const eventType = body.event || body.type; // e.g. 'booking_new', 'booking_cancelled'
    const booking = body.booking || body.data || body;

    // 1. Basic Validation
    if (!booking) {
      return NextResponse.json({ message: 'Invalid payload structure' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // 2. Extract Booking Data from Beds24 Payload
    const beds24RoomId = booking.roomId || booking.room_id;
    const beds24BookingId = booking.bookId || booking.id;

    if (!beds24RoomId || !beds24BookingId) {
      console.error('Webhook: Missing room ID or booking ID in payload');
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // 3. Find Matching Room in Our DB
    const { data: localRoom, error: roomError } = await supabase
      .from('Rooms_Information')
      .select('id, hotel_id, type_name')
      .eq('beds24_room_id', beds24RoomId)
      .single();

    if (roomError || !localRoom) {
      console.log(`Webhook: Room ID ${beds24RoomId} not found in our DB. Skipping as external room.`);
      return NextResponse.json({ message: 'Room not managed by local system, skipped.' });
    }

    console.log(`Webhook: Matched local room: ${localRoom.type_name} (ID: ${localRoom.id})`);

    // 4. Map Status
    let status = 'confirmed'; // Default for new bookings
    if (eventType === 'booking_cancelled' || booking.status === 'cancelled') {
      status = 'cancelled';
    }

    // 5. Prepare Data
    const checkIn = booking.arrival || booking.arrivalDate || booking.check_in;
    const checkOut = booking.departure || booking.departureDate || booking.check_out;
    const totalPrice = booking.price || booking.totalPrice || 0;
    const guestCount = (booking.numAdult || 0) + (booking.numChild || 0) || 1;

    const guestName = booking.guestName || `${booking.guestFirstName || ''} ${booking.guestLastName || ''}`.trim() || 'OTA Guest';
    const guestEmail = booking.guestEmail || booking.email || 'ota-booking@noreply.com';
    const guestPhone = booking.guestPhone || booking.phone || '';

    const notes = `Source: ${booking.referer || 'Beds24'} | Beds24 ID: ${beds24BookingId}`;

    // 6. Database Operation (Upsert Logic)
    // Check if booking exists
    const { data: existingBooking } = await supabase
      .from('Reservation_Information')
      .select('id')
      .eq('beds24_booking_id', beds24BookingId)
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
          room_id: localRoom.id,
          check_in_notes: notes
        })
        .eq('id', existingBooking.id);
    } else {
      // INSERT New
      if (status === 'cancelled') {
        console.log('Webhook: Received cancellation for unknown booking. Ignoring.');
        return NextResponse.json({ message: 'Cancellation for unknown booking ignored' });
      }

      console.log('Webhook: Inserting new booking');
      result = await supabase.from('Reservation_Information').insert({
        hotel_id: localRoom.hotel_id,
        room_id: localRoom.id,
        customer_name: guestName,
        customer_email: guestEmail,
        customer_phone: guestPhone,
        check_in: checkIn,
        check_out: checkOut,
        guests_count: guestCount,
        total_price: totalPrice,
        room_status: status,
        payment_status: 'paid', // Assume OTA paid
        check_in_notes: notes,
        beds24_booking_id: beds24BookingId
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
  return NextResponse.json({ message: 'Beds24 webhook endpoint active' });
}