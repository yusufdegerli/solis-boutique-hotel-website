'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Initialize Supabase admin client (Service Role Key bypasses RLS)
const supabaseAdmin = createClient(supabaseUrl, serviceKey);

// ---- HOTELS ----
export async function createHotelServer(dbHotel: any) {
  const { data, error } = await supabaseAdmin.from('Hotel_Information_Table').insert([dbHotel]).select();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateHotelServer(id: string, dbHotel: any) {
  const { data, error } = await supabaseAdmin.from('Hotel_Information_Table').update(dbHotel).eq('id', id).select();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteHotelServer(id: string) {
  const { error } = await supabaseAdmin.from('Hotel_Information_Table').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}

// ---- ROOMS ----
export async function createRoomServer(dbRoom: any) {
  if ((dbRoom.base_price ?? 0) < 0) throw new Error("Fiyat negatif olamaz.");
  if ((dbRoom.quantity ?? 0) < 0) throw new Error("Stok adedi negatif olamaz.");

  const { data, error } = await supabaseAdmin.from('Rooms_Information').insert([dbRoom]).select();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateRoomServer(id: string, dbRoom: any) {
  if (dbRoom.base_price !== undefined && dbRoom.base_price < 0) throw new Error("Fiyat negatif olamaz.");
  if (dbRoom.quantity !== undefined && dbRoom.quantity < 0) throw new Error("Stok adedi negatif olamaz.");

  const { data, error } = await supabaseAdmin.from('Rooms_Information').update(dbRoom).eq('id', id).select();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteRoomServer(id: string) {
  const { error } = await supabaseAdmin.from('Rooms_Information').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}
