import { NextResponse } from 'next/server';
import { updateAvailability } from '@/lib/channex';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  let step = 'init';
  const debugLog: string[] = [];
  
  const log = (msg: string) => {
      console.log(`[TEST] ${msg}`);
      debugLog.push(msg);
  };

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const channexKey = process.env.API_KEY_CHANNEX;
    const propertyId = process.env.HOTEL_BOUTIQUE_ID;

    // --- KEY DEBUG ---
    let keyDebug = "EKSİK";
    if (channexKey) {
        const len = channexKey.length;
        const start = channexKey.substring(0, 4);
        const end = channexKey.substring(len - 4);
        keyDebug = `Uzunluk: ${len}, Başlangıç: '${start}', Bitiş: '${end}'`;
    }
    log(`API Key Info: ${keyDebug}`);
    // ----------------

    if (!channexKey || !propertyId) {
        throw new Error('Channex API Key veya Property ID eksik.');
    }

    // ADIM 1: AUTH KONTROLÜ (GET Properties)
    step = 'auth_check_properties';
    log('Adım 1: Channex Auth Kontrolü (GET /properties)...');
    
    // Hem user-api-key hem apikey deneyelim, garanti olsun.
    const headers = {
        'Content-Type': 'application/json',
        'user-api-key': channexKey,
        'apikey': channexKey
    };

    const authCheckUrl = 'https://app.channex.io/api/v1/properties';
    const authResponse = await fetch(authCheckUrl, { method: 'GET', headers });
    
    const authStatus = authResponse.status;
    log(`Auth Check Status: ${authStatus}`);
    
    const authText = await authResponse.text();
    let authJson;
    try { authJson = JSON.parse(authText); } catch(e) { authJson = { raw: authText }; }

    if (authStatus !== 200) {
        log(`Auth Check Failed! Response: ${authText.substring(0, 200)}...`);
        return NextResponse.json({
            success: false,
            step_failed: 'auth_check_properties',
            error: 'API Anahtarı ile Channex\'e giriş yapılamadı. Anahtar yanlış veya yanlış sunucu (staging/app).',
            channex_response: authJson,
            debug_log: debugLog
        }, { status: 500 });
    }
    
    log('Auth Check BAŞARILI! Otel listesi alındı.');

    // ADIM 2: VERİTABANI KONTROLÜ
    step = 'supabase_connect';
    log('Adım 2: Supabase Bağlantısı...');
    const supabase = createClient(supabaseUrl!, serviceKey!);

    const { data: room, error: roomError } = await supabase
      .from('Rooms_Information')
      .select('type_name, channex_room_type_id, channex_rate_plan_id, quantity')
      .not('channex_room_type_id', 'is', null)
      .limit(1)
      .single();

    if (roomError) throw new Error(`Supabase Hatası: ${roomError.message}`);
    if (!room) throw new Error('Supabase: Channex ID tanımlı oda bulunamadı.');
    
    if (!room.channex_rate_plan_id) {
        throw new Error(`Oda (${room.type_name}) için Rate Plan ID eksik.`);
    }

    // ADIM 3: AVAILABILITY GÜNCELLEME
    step = 'channex_update';
    log(`Adım 3: Güncelleme Deneniyor. Oda: ${room.type_name}, Rate: ${room.channex_rate_plan_id}`);
    
    const today = new Date().toISOString().split('T')[0];
    const result = await updateAvailability(
        room.channex_room_type_id, 
        room.channex_rate_plan_id, 
        today, 
        room.quantity
    );

    if (result.success) {
      return NextResponse.json({
        success: true, 
        message: 'TÜM AŞAMALAR BAŞARILI!',
        room: room.type_name,
        details: result.data,
        debug_log: debugLog
      });
    } else {
      return NextResponse.json({
          success: false, 
          step_failed: 'channex_update',
          error: result.error,
          debug_log: debugLog
      }, { status: 500 });
    }

  } catch (err: any) {
    console.error('Test Error:', err);
    return NextResponse.json({
      success: false, 
      step_failed: step,
      error: err.message,
      debug_log: debugLog
    }, { status: 500 });
  }
}
