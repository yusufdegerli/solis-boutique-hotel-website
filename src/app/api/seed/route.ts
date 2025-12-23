import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: Request) {
  // --- SECURITY CHECK ---
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: 'Unauthorized: Invalid or missing seed secret.' }, { status: 401 });
  }
  // ----------------------

  try {
    // 1. Check/Create Hotel
    let { data: hotels } = await supabase.from('Hotel_Information_Table').select('id, name').limit(1);
    
    let hotelId;

    if (!hotels || hotels.length === 0) {
      console.log('No hotels found. Creating default hotel...');
      const { data: newHotel, error: hotelError } = await supabase
        .from('Hotel_Information_Table')
        .insert([{
          name: 'Solis Hotel Istanbul',
          slug: 'solis-hotel-istanbul',
          description: 'Boğazın eşsiz manzarası eşliğinde lüks konaklama.',
          image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
          address: 'Beşiktaş, İstanbul'
        }])
        .select()
        .single();
      
      if (hotelError) throw new Error(`Hotel creation failed: ${hotelError.message}`);
      hotelId = newHotel.id;
    } else {
      hotelId = hotels[0].id;
      console.log(`Found existing hotel: ${hotels[0].name} (ID: ${hotelId})`);
    }

    // 2. Check Rooms
    const { count } = await supabase
        .from('Rooms_Information')
        .select('*', { count: 'exact', head: true });

    if (count && count > 0) {
      return NextResponse.json({ message: 'Rooms already exist. Skipping seed.', count });
    }

    console.log('No rooms found. Seeding rooms...');

    // 3. Insert Rooms
    const rooms = [
      {
        hotel_id: hotelId,
        type_name: 'Deluxe Oda',
        description: 'Deniz manzaralı, geniş balkonlu lüks oda.',
        base_price: 3500,
        capacity: 2,
        quantity: 10
      },
      {
        hotel_id: hotelId,
        type_name: 'Suit Oda',
        description: 'Panoramik manzaralı, özel jakuzili suit.',
        base_price: 5500,
        capacity: 4,
        quantity: 5
      },
      {
        hotel_id: hotelId,
        type_name: 'Standart Oda',
        description: 'Şehir manzaralı, konforlu oda.',
        base_price: 2500,
        capacity: 2,
        quantity: 20
      }
    ];

    const { data: createdRooms, error: roomsError } = await supabase
      .from('Rooms_Information')
      .insert(rooms)
      .select();

    if (roomsError) {
      // If hotel_id column is missing, try inserting without it (fallback for schema mismatch)
      if (roomsError.message.includes('column "hotel_id" of relation "Rooms_Information" does not exist')) {
         console.warn('hotel_id column missing. Attempting to seed without hotel_id linkage.');
         const roomsNoHotel = rooms.map(({ hotel_id, ...r }) => r);
         const { error: retryError } = await supabase.from('Rooms_Information').insert(roomsNoHotel);
         if (retryError) throw retryError;
         return NextResponse.json({ message: 'Rooms seeded (without hotel linkage due to schema mismatch).', count: rooms.length });
      }
      throw new Error(`Rooms creation failed: ${roomsError.message}`);
    }

    return NextResponse.json({ 
      message: 'Database seeded successfully!', 
      hotel: hotelId,
      roomsCreated: createdRooms?.length 
    });

  } catch (error: any) {
    console.error('Seed Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
