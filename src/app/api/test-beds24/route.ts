import { NextResponse } from 'next/server';
import { updateAvailability } from '@/lib/beds24';
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
        const beds24ApiKey = process.env.BEDS24_API_KEY;
        const beds24PropKey = process.env.BEDS24_PROP_KEY;

        // --- KEY DEBUG ---
        let keyDebug = "EKSİK";
        if (beds24ApiKey) {
            const len = beds24ApiKey.length;
            const start = beds24ApiKey.substring(0, 4);
            const end = beds24ApiKey.substring(len - 4);
            keyDebug = `Uzunluk: ${len}, Başlangıç: '${start}', Bitiş: '${end}'`;
        }
        log(`Beds24 API Key Info: ${keyDebug}`);
        log(`Beds24 Property Key: ${beds24PropKey || 'EKSİK'}`);
        // ----------------

        if (!beds24ApiKey || !beds24PropKey) {
            throw new Error('Beds24 API Key veya Property Key eksik.');
        }

        // ADIM 1: AUTH KONTROLÜ (Test API Connection)
        step = 'auth_check';
        log('Adım 1: Beds24 API Bağlantı Testi...');

        const headers = {
            'Content-Type': 'application/json'
        };

        // Test with a simple API call to verify credentials
        const testUrl = 'https://beds24.com/api/v2/authentication/test';
        const testPayload = {
            authentication: {
                apiKey: beds24ApiKey,
                propKey: beds24PropKey
            }
        };

        const authResponse = await fetch(testUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(testPayload)
        });

        const authStatus = authResponse.status;
        log(`Auth Check Status: ${authStatus}`);

        const authText = await authResponse.text();
        let authJson;
        try { authJson = JSON.parse(authText); } catch (e) { authJson = { raw: authText }; }

        if (authStatus !== 200) {
            log(`Auth Check Failed! Response: ${authText.substring(0, 200)}...`);
            return NextResponse.json({
                success: false,
                step_failed: 'auth_check',
                error: 'Beds24 API ile bağlantı kurulamadı. API Key veya Property Key yanlış olabilir.',
                beds24_response: authJson,
                debug_log: debugLog
            }, { status: 500 });
        }

        log('Auth Check BAŞARILI! Beds24 API bağlantısı doğrulandı.');

        // ADIM 2: VERİTABANI KONTROLÜ
        step = 'supabase_connect';
        log('Adım 2: Supabase Bağlantısı ve Oda Kontrolü...');
        const supabase = createClient(supabaseUrl!, serviceKey!);

        const { data: room, error: roomError } = await supabase
            .from('Rooms_Information')
            .select('type_name, beds24_room_id, quantity')
            .not('beds24_room_id', 'is', null)
            .limit(1)
            .single();

        if (roomError) {
            log(`Supabase Hatası: ${roomError.message}`);
            // If no rooms with beds24_room_id exist yet, that's expected
            log('Not: Henüz Beds24 Room ID tanımlı oda yok. Migration sonrası tanımlanmalı.');
            return NextResponse.json({
                success: true,
                message: 'Beds24 API bağlantısı başarılı. Henüz Beds24 Room ID tanımlı oda yok.',
                note: 'Migration\'ı çalıştırdıktan sonra Rooms_Information tablosunda beds24_room_id alanını güncelleyin.',
                debug_log: debugLog
            });
        }

        if (!room) {
            log('Supabase: Beds24 ID tanımlı oda bulunamadı.');
            return NextResponse.json({
                success: true,
                message: 'Beds24 API bağlantısı başarılı. Henüz Beds24 Room ID tanımlı oda yok.',
                note: 'Migration\'ı çalıştırdıktan sonra Rooms_Information tablosunda beds24_room_id alanını güncelleyin.',
                debug_log: debugLog
            });
        }

        // ADIM 3: AVAILABILITY GÜNCELLEME TESTİ
        step = 'beds24_update';
        log(`Adım 3: Availability Güncelleme Testi. Oda: ${room.type_name}, Beds24 ID: ${room.beds24_room_id}`);

        const today = new Date().toISOString().split('T')[0];
        const result = await updateAvailability(
            room.beds24_room_id,
            today,
            room.quantity
        );

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'TÜM AŞAMALAR BAŞARILI! Beds24 entegrasyonu çalışıyor.',
                room: room.type_name,
                beds24_room_id: room.beds24_room_id,
                details: result.data,
                debug_log: debugLog
            });
        } else {
            return NextResponse.json({
                success: false,
                step_failed: 'beds24_update',
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
