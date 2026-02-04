import { NextResponse } from 'next/server';
// [BEDS24 DISABLED] - Elektra kullanılacak
// import { updateAvailability } from '@/lib/beds24';
// import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * [BEDS24 DISABLED] - Elektra kullanılacak
 * 
 * Bu test endpoint'i Beds24 channel manager bağlantısını test etmek için oluşturulmuştu.
 * Elektra entegrasyonuna geçildiği için devre dışı bırakıldı.
 */
export async function GET() {
    return NextResponse.json({
        success: false,
        status: 'disabled',
        message: 'Beds24 test endpoint is disabled. Migrating to Elektra channel manager.',
        note: 'Beds24 entegrasyonu devre dışı bırakıldı. Elektra channel manager kullanılacak.'
    }, { status: 503 });
}
