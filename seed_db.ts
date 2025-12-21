
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function seed() {
  console.log('Seeding database...');

  // 1. Clean existing data (Reverse order due to FKs)
  await supabase.from('Reservation_Information').delete().neq('id', 0);
  await supabase.from('Rooms_Information').delete().neq('id', 0);
  await supabase.from('Hotel_Information_Table').delete().neq('id', 0);
  
  console.log('Old data cleared.');

  // 2. Insert Hotel
  const { data: hotel, error: hotelError } = await supabase
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

  if (hotelError) {
    console.error('Hotel insert failed:', hotelError);
    return;
  }
  console.log(`Hotel created: ${hotel.name} (ID: ${hotel.id})`);

  // 3. Insert Rooms
  const roomsData = [
    {
      hotel_id: hotel.id,
      type_name: 'Deluxe Oda',
      description: 'Deniz manzaralı, geniş balkonlu lüks oda.',
      base_price: 3500,
      capacity: 2,
      quantity: 10
    },
    {
      hotel_id: hotel.id,
      type_name: 'Suit Oda',
      description: 'Panoramik manzaralı, özel jakuzili suit.',
      base_price: 5500,
      capacity: 4,
      quantity: 5
    },
    {
      hotel_id: hotel.id,
      type_name: 'Standart Oda',
      description: 'Şehir manzaralı, konforlu oda.',
      base_price: 2500,
      capacity: 2,
      quantity: 20
    }
  ];

  const { data: rooms, error: roomsError } = await supabase
    .from('Rooms_Information')
    .insert(roomsData)
    .select();

  if (roomsError) {
    console.error('Rooms insert failed:', roomsError);
    return;
  }

  console.log(`Created ${rooms.length} rooms.`);
  console.log('Database seeded successfully!');
}

seed();
