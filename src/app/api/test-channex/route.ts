import { NextResponse } from 'next/server';
import { updateAvailability } from '@/lib/channex';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // 1. Veritabanından Channex ID'si olan ilk odayı bul
    const { data: room, error: roomError } = await supabase
      .from('Rooms_Information')
      .select('type_name, channex_room_type_id, quantity')
      .not('channex_room_type_id', 'is', null)
      .limit(1)
      .single();

    if (roomError || !room) {
      return NextResponse.json({ 
        success: false, 
        error: 'Veritabanında Channex ID\'si tanımlı oda bulunamadı. Lütfen SQL update sorgusunu çalıştırdığınızdan emin olun.' 
      }, { status: 404 });
    }

    // 2. Channex'e test güncellemesi gönder (Bugünün tarihine mevcut stok sayısını tekrar gönder)
    const today = new Date().toISOString().split('T')[0];
    const result = await updateAvailability(room.channex_room_type_id, today, room.quantity);

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: `${room.type_name} için Channex bağlantısı başarılı!`, 
        details: result.data 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: result.error 
      }, { status: 500 });
    }

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
