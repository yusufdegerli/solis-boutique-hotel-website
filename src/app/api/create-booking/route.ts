import { NextRequest, NextResponse } from 'next/server';
// [BEDS24 DISABLED] - Elektra kullanılacak
// import { createBeds24Booking } from '@/lib/beds24';

export const dynamic = 'force-dynamic';

// [BEDS24 DISABLED] - Room ID mapping devre dışı
// Map local database room IDs to Beds24 room IDs
// const roomIdMap: Record<number, string> = {
//     17: "646875", // Family Room
//     18: "646866", // Twinbed
//     19: "646874", // Single Room
//     24: "646877", // Double Room
// };

/**
 * POST /api/create-booking
 * Create a new booking in channel manager
 * 
 * [BEDS24 DISABLED] - Bu endpoint Beds24 API kullanıyordu
 * Elektra entegrasyonu yapılana kadar devre dışı
 * 
 * Request Body:
 * {
 *   roomId: string;
 *   guestName: string;
 *   guestEmail: string;
 *   guestPhone?: string;
 *   checkIn: string;    // "YYYY-MM-DD"
 *   checkOut: string;   // "YYYY-MM-DD"
 *   price: number;
 *   adults: number;
 *   notes?: string;
 * }
 */
export async function POST(request: NextRequest) {
    // [BEDS24 DISABLED] - Elektra entegrasyonu yapılacak
    return NextResponse.json(
        {
            success: false,
            error: 'Direct booking creation is temporarily disabled. Channel manager migration in progress.',
            message: 'Doğrudan rezervasyon oluşturma geçici olarak devre dışı. Channel manager değişikliği yapılıyor.'
        },
        { status: 503 }
    );

    /*
    // Original Beds24 implementation
    try {
        const body = await request.json();
        const {
            roomId,
            guestName,
            guestEmail,
            guestPhone,
            checkIn,
            checkOut,
            price,
            adults,
            notes
        } = body;

        // Validation
        if (!roomId || !guestName || !guestEmail || !checkIn || !checkOut || !price) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Missing required fields: roomId, guestName, guestEmail, checkIn, checkOut, price'
                },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(guestEmail)) {
            return NextResponse.json(
                { success: false, error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Map local room ID to Beds24 room ID
        const roomIdNumber = typeof roomId === 'string' ? parseInt(roomId) : roomId;
        const realBeds24Id = roomIdMap[roomIdNumber];

        if (!realBeds24Id) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Room ID ${roomId} not found in Beds24 mapping. Please contact support.`
                },
                { status: 400 }
            );
        }

        console.log(`Mapping local room ID ${roomId} to Beds24 room ID ${realBeds24Id}`);

        // Create booking data
        const bookingData = {
            arrival_date: checkIn,
            departure_date: checkOut,
            room_id: realBeds24Id,  // Use Beds24 room ID instead of local ID
            customer: {
                name: guestName,
                email: guestEmail,
                phone: guestPhone || '',
            },
            num_adults: adults || 2,
            num_children: body.children || 0,
            total_price: price,
            currency: 'EUR',
            notes: notes || 'Booking from Solis Boutique Resort website',
            unique_id: `WEB-${Date.now()}`
        };

        // Call Beds24 API
        const result = await createBeds24Booking(bookingData);

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            bookingId: result.data?.bookId || result.data?.id,
            data: result.data
        });

    } catch (error: any) {
        console.error('Create Booking API Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
    */
}
