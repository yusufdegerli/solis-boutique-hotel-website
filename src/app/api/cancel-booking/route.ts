import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cancelBeds24Booking } from '@/lib/beds24';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token eksik.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // 1. Verify Token & Get Booking
    const { data: booking, error: fetchError } = await supabase
      .from('Reservation_Information')
      .select('id, room_status')
      .eq('cancellation_token', token)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ success: false, error: 'Geçersiz token veya rezervasyon bulunamadı.' }, { status: 404 });
    }

    if (booking.room_status === 'cancelled') {
      return NextResponse.json({ success: false, error: 'Rezervasyon zaten iptal edilmiş.' }, { status: 400 });
    }

    if (booking.room_status === 'completed' || booking.room_status === 'checked_out') {
      return NextResponse.json({ success: false, error: 'Tamamlanmış rezervasyonlar iptal edilemez.' }, { status: 400 });
    }

    // 2. Cancel Booking
    const { data: updatedData, error: updateError } = await supabase
      .from('Reservation_Information')
      .update({ room_status: 'cancelled' })
      .eq('id', booking.id)
      .select('beds24_booking_id')
      .single();

    if (updateError) {
      return NextResponse.json({ success: false, error: 'Güncelleme hatası: ' + updateError.message }, { status: 500 });
    }

    if (updatedData?.beds24_booking_id) {
      console.log(`Syncing user cancellation to Beds24 for Booking ID: ${updatedData.beds24_booking_id}`);
      await cancelBeds24Booking(updatedData.beds24_booking_id);
    }

    // Optional: Send Notification to Admin
    // await sendAdminNotification(booking.id, 'cancelled');

    return NextResponse.json({ success: true });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Sunucu hatası: ' + err.message }, { status: 500 });
  }
}
