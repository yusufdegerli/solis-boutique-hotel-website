import { NextResponse } from 'next/server';
import { updateAvailability } from '@/lib/channex';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic'; // Caching'i engelle

export async function GET() {
  let step = 'init';
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const channexKey = process.env.API_KEY_CHANNEX;
    const propertyId = process.env.HOTEL_BOUTIQUE_ID;

    // 0. ENV KONTROLÜ
    if (!supabaseUrl || !serviceKey || !channexKey || !propertyId) {
       return NextResponse.json({ 
         success: false, 
         error: 'Eksik Env Değişkenleri',
         missing: {
            supabaseUrl: !supabaseUrl,
            serviceKey: !serviceKey,
            channexKey: !channexKey,
            propertyId: !propertyId
         }
       }, { status: 500 });
    }

    step = 'supabase_connect';
    const supabase = createClient(supabaseUrl, serviceKey);

    // 1. SUPABASE SORGUSU
    step = 'supabase_query';
    const { data: room, error: roomError } = await supabase
      .from('Rooms_Information')
      .select('type_name, channex_room_type_id, quantity')
      .not('channex_room_type_id', 'is', null)
      .limit(1)
      .single();

    if (roomError) {
      throw new Error(`Supabase Sorgu Hatası: ${roomError.message}`);
    }

    if (!room) {
      throw new Error('Supabase: Channex ID tanımlı oda bulunamadı.');
    }

    // 2. CHANNEX İSTEĞİ
    step = 'channex_request';
    const today = new Date().toISOString().split('T')[0];
    const result = await updateAvailability(room.channex_room_type_id, today, room.quantity);

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'BAŞARILI: Hem Veritabanı hem Channex bağlantısı çalışıyor.',
        room: room.type_name,
        details: result.data 
      });
    } else {
      throw new Error(`Channex API Hatası: ${result.error}`);
    }

  } catch (err: any) {
    console.error('Test Endpoint Error:', err);
    return NextResponse.json({ 
      success: false, 
      step_failed: step,
      error: err.message || 'Bilinmeyen hata',
      cause: err.cause ? JSON.stringify(err.cause) : undefined
    }, { status: 500 });
  }
}