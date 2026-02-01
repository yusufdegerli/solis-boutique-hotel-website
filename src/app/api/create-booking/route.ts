import { NextRequest, NextResponse } from 'next/server';
import { createBeds24Booking } from '@/lib/beds24';

export const dynamic = 'force-dynamic';

/**
 * POST /api/create-booking
 * Create a new booking in Beds24
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

        // Create booking data
        const bookingData = {
            arrival_date: checkIn,
            departure_date: checkOut,
            room_id: roomId,
            customer: {
                name: guestName,
                email: guestEmail,
                phone: guestPhone || '',
            },
            guests_count: adults || 2,
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
}
