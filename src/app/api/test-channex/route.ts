import { NextResponse } from 'next/server';
import { updateAvailability } from '@/lib/channex';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  let step = 'init';
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const channexKey = process.env.API_KEY_CHANNEX;
    const propertyId = process.env.HOTEL_BOUTIQUE_ID;

    // --- DEBUGGING KEY ---
    let keyDebug = "EKSİK";
    if (channexKey) {
        const len = channexKey.length;
        const start = channexKey.substring(0, 4);
        const end = channexKey.substring(len - 4);
        keyDebug = `Uzunluk: ${len}, Başlangıç: '${start}', Bitiş: '${end}'`;
    }
    console.log(`[DEBUG] API Key Info: ${keyDebug}`);
    // ---------------------

    if (!supabaseUrl || !serviceKey || !channexKey || !propertyId) {
       return NextResponse.json({ 
         success: false, 
         error: 'Eksik Env Değişkenleri',
         debug_key: keyDebug
       }, { status: 500 });
    }

    step = 'supabase_connect';
    const supabase = createClient(supabaseUrl, serviceKey);

    step = 'supabase_query';
    const { data: room, error: roomError } = await supabase
      .from('Rooms_Information')
      .select('type_name, channex_room_type_id, quantity')
      .not('channex_room_type_id', 'is', null)
      .limit(1)
      .single();

    if (roomError) throw new Error(`Supabase Sorgu Hatası: ${roomError.message}`);
    if (!room) throw new Error('Supabase: Channex ID tanımlı oda bulunamadı.');

    step = 'channex_request';
    const today = new Date().toISOString().split('T')[0];
    
    // Log Property ID as well
    console.log(`[DEBUG] Property ID: '${propertyId}'`);
    
    const result = await updateAvailability(room.channex_room_type_id, today, room.quantity);

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'BAŞARILI',
        room: room.type_name,
        details: result.data 
      });
    } else {
      // Return the debug info in the error response to see it in browser
      return NextResponse.json({ 
          success: false, 
          step_failed: step,
          error: result.error,
          debug_info: {
              key_summary: keyDebug,
              property_id_summary: `Uzunluk: ${propertyId.length}`
          }
      }, { status: 500 });
    }

  } catch (err: any) {
    console.error('Test Endpoint Error:', err);
    return NextResponse.json({ 
      success: false, 
      step_failed: step,
      error: err.message
    }, { status: 500 });
  }
}
