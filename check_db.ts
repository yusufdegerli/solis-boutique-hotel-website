import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkData() {
  console.log('--- CHECKING DATABASE DATA ---');
  
  // Check Hotels
  const { data: hotels, error: hotelError } = await supabase.from('Hotel_Information_Table').select('id, name');
  if (hotelError) console.error('Hotel Error:', hotelError);
  console.log('Hotels:', hotels);

  // Check Rooms
  const { data: rooms, error: roomError } = await supabase.from('Rooms_Information').select('id, type_name, hotel_id');
  if (roomError) console.error('Room Error:', roomError);
  console.log('Rooms:', rooms);

  console.log('--- END CHECK ---');
}

checkData();