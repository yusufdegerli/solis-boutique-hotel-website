import { NextResponse } from 'next/server';

/**
 * [BEDS24 DISABLED] - Elektra kullanılacak
 * 
 * Bu webhook endpoint'i Beds24 channel manager için oluşturulmuştu.
 * Elektra entegrasyonuna geçildiği için devre dışı bırakıldı.
 * 
 * Eski işlev: Beds24'ten gelen OTA rezervasyonlarını (Booking.com, Expedia vb.)
 * işleyip Supabase'e kaydetmek.
 */

export async function POST(request: Request) {
    console.log('[BEDS24 DISABLED] Webhook received but Beds24 integration is disabled');

    return NextResponse.json({
        success: false,
        error: 'Beds24 webhook is disabled. Migrating to Elektra channel manager.',
        message: 'Beds24 webhook devre dışı. Elektra channel manager\'a geçiliyor.'
    }, { status: 503 });
}

export async function GET(request: Request) {
    return NextResponse.json({
        status: 'disabled',
        message: 'Beds24 webhook endpoint is disabled. Migrating to Elektra channel manager.',
        timestamp: new Date().toISOString()
    });
}
