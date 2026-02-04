import { NextRequest, NextResponse } from 'next/server';
// [BEDS24 DISABLED] - Elektra kullanılacak
// import { getAvailabilities } from '@/lib/beds24';

export const dynamic = 'force-dynamic';

/**
 * POST /api/availability
 * Check room availability
 * 
 * [BEDS24 DISABLED] - Bu endpoint Beds24 API kullanıyordu
 * Elektra entegrasyonu yapılana kadar devre dışı
 * 
 * Request Body:
 * {
 *   checkIn: string;    // "YYYYMMDD"
 *   checkOut: string;   // "YYYYMMDD"
 *   adults: number;     // Number of guests
 * }
 */
export async function POST(request: NextRequest) {
    // [BEDS24 DISABLED] - Elektra entegrasyonu yapılacak
    return NextResponse.json(
        {
            success: false,
            error: 'Availability check is temporarily disabled. Channel manager migration in progress.',
            message: 'Müsaitlik kontrolü geçici olarak devre dışı. Channel manager değişikliği yapılıyor.'
        },
        { status: 503 }
    );

    /*
    // Original Beds24 implementation
    try {
        const body = await request.json();
        const { checkIn, checkOut, adults } = body;

        // Validation
        if (!checkIn || !checkOut) {
            return NextResponse.json(
                { success: false, error: 'checkIn and checkOut are required' },
                { status: 400 }
            );
        }

        // Validate date format (YYYYMMDD)
        const dateRegex = /^\d{8}$/;
        if (!dateRegex.test(checkIn) || !dateRegex.test(checkOut)) {
            return NextResponse.json(
                { success: false, error: 'Invalid date format. Use YYYYMMDD' },
                { status: 400 }
            );
        }

        // Call Beds24 API
        const result = await getAvailabilities(checkIn, checkOut, adults || 2);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            rooms: result.rooms
        });

    } catch (error: any) {
        console.error('Availability API Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
    */
}
