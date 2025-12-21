import { supabase } from "@/lib/supabaseClient";
import { Hotel, Room } from "@/lib/data";

// --- HOTELS ---

export const getHotels = async (): Promise<Hotel[]> => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Supabase env variables missing in getHotels');
  }

  const { data, error } = await supabase
    .from('Hotel_Information_Table')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching hotels:', JSON.stringify(error, null, 2));
    return [];
  }

  return data.map((hotel: any) => mapDbHotelToModel(hotel));
};

export const getHotelBySlug = async (slug: string): Promise<Hotel | undefined> => {
  const { data, error } = await supabase
    .from('Hotel_Information_Table')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return undefined;
  }

  return mapDbHotelToModel(data);
};

export const createHotel = async (hotel: Partial<Hotel>) => {
  const dbHotel = {
    name: hotel.name,
    slug: hotel.slug || hotel.name?.toLowerCase().replace(/ /g, '-'),
    description: hotel.description,
    image_url: hotel.image,
    address: hotel.location,
    // Add other fields if DB supports them
  };

  const { data, error } = await supabase
    .from('Hotel_Information_Table')
    .insert([dbHotel])
    .select();

  if (error) throw error;
  return data;
};

export const updateHotel = async (id: string, hotel: Partial<Hotel>) => {
  const dbHotel: any = {};
  if (hotel.name) dbHotel.name = hotel.name;
  if (hotel.description) dbHotel.description = hotel.description;
  if (hotel.image) dbHotel.image_url = hotel.image;
  if (hotel.location) dbHotel.address = hotel.location;
  if (hotel.slug) dbHotel.slug = hotel.slug;

  const { data, error } = await supabase
    .from('Hotel_Information_Table')
    .update(dbHotel)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
};

export const deleteHotel = async (id: string) => {
  const { error } = await supabase
    .from('Hotel_Information_Table')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// --- STORAGE ---

export const uploadImage = async (file: File): Promise<string> => {
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
  const { data, error } = await supabase.storage
    .from('hotel-images')
    .upload(fileName, file);

  if (error) {
    console.error('Upload Error:', error);
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('hotel-images')
    .getPublicUrl(fileName);

  return publicUrl;
};

// --- ROOMS ---

export const getRooms = async (): Promise<Room[]> => {
  const { data, error } = await supabase
    .from('Rooms_Information')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching rooms:', JSON.stringify(error, null, 2));
    return [];
  }

  return data.map((room: any) => mapDbRoomToModel(room));
};

export const createRoom = async (room: Partial<Room>) => {
  if ((room.price ?? 0) < 0) throw new Error("Fiyat negatif olamaz.");
  if ((room.quantity ?? 0) < 0) throw new Error("Stok adedi negatif olamaz.");

  const dbRoom = {
    hotel_id: room.hotelId ? parseInt(room.hotelId) : null,
    type_name: room.name,
    description: room.description,
    base_price: room.price,
    capacity: parseInt(room.capacity?.split(' ')[0] || '2'),
    quantity: room.quantity || 10,
    images: room.images // Save array
  };

  const { data, error } = await supabase
    .from('Rooms_Information')
    .insert([dbRoom])
    .select();

  if (error) {
    console.error('Create Room Error:', JSON.stringify(error, null, 2));
    throw error;
  }
  return data;
};

export const updateRoom = async (id: string, room: Partial<Room>) => {
  if (room.price !== undefined && room.price < 0) throw new Error("Fiyat negatif olamaz.");
  if (room.quantity !== undefined && room.quantity < 0) throw new Error("Stok adedi negatif olamaz.");

  const dbRoom: any = {};
  if (room.hotelId) dbRoom.hotel_id = parseInt(room.hotelId);
  if (room.name) dbRoom.type_name = room.name;
  if (room.description) dbRoom.description = room.description;
  if (room.price) dbRoom.base_price = room.price;
  if (room.capacity) dbRoom.capacity = parseInt(room.capacity?.split(' ')[0] || '2');
  if (room.quantity !== undefined) dbRoom.quantity = room.quantity;
  if (room.images) dbRoom.images = room.images;

  const { data, error } = await supabase
    .from('Rooms_Information')
    .update(dbRoom)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Update Room Error:', JSON.stringify(error, null, 2));
    throw error;
  }
  return data;
};

export const deleteRoom = async (id: string) => {
  const { error } = await supabase
    .from('Rooms_Information')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// --- HELPERS ---

function mapDbHotelToModel(hotel: any): Hotel {
  return {
    id: hotel.id.toString(),
    name: hotel.name,
    slug: hotel.slug,
    tagline: hotel.tagline || "Unutulmaz Bir Konaklama Deneyimi",
    description: hotel.description,
    pricePerNight: hotel.stats?.min_price || 3500, // Use stats if available, else default
    rating: Number(hotel.rating) || 9.0,
    reviews: hotel.reviews_count || 0,
    image: hotel.image_url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    location: hotel.address,
    coordinates: hotel.coordinates || {
      lat: 41.0082,
      lng: 28.9784
    },
    stats: hotel.stats || {
      totalRooms: 20,
      availability: 10,
      suiteCount: 5
    },
    features: hotel.features || ["Ücretsiz Wi-Fi", "Spa", "Spor Salonu", "Restoran"],
    contact: {
      phone: hotel.phone || "+90 212 555 0123",
      email: hotel.email || "info@solis.com",
      address: hotel.address
    }
  };
}

function mapDbRoomToModel(room: any): Room {
  // Use 'images' array if exists, otherwise fallback to single 'image_url' wrap, otherwise default
  const images = room.images && room.images.length > 0 
    ? room.images 
    : (room.image_url ? [room.image_url] : ["https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80"]);

  return {
    id: room.id.toString(),
    hotelId: room.hotel_id?.toString(), // Map DB hotel_id to model
    name: room.type_name,
    description: room.description || "Konforlu ve ferah bir oda.",
    size: room.size || "35m²",
    capacity: `${room.capacity || 2} Yetişkin`,
    price: room.base_price || 0,
    quantity: room.quantity || 0,
    image: images[0], // Primary image for backward compatibility
    images: images
  };
}

// --- BOOKINGS ---

export interface Booking {
  id: string; // UUID
  room_id: number;
  customer_id?: any; // Linked customer ID
  customer_name: string;
  customer_email: string;
  check_in: string;
  check_out: string;
  total_price: number;
  room_status: 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'checked_out'; // reservation_status enum
  // Frontend helpers (not in DB)
  hotel_id?: number; 
  guests_count?: number; 
  email?: string; // alias for customer_email from form
  guest_name?: string; // alias for customer_name from form
}

export const getBookings = async (): Promise<Booking[]> => {
  const { data, error } = await supabase
    .from('Reservation_Information')
    .select('*')
    .order('check_in', { ascending: false });

  if (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }

  // Map DB columns to our Interface if needed, or just return as is if matches
  return data as Booking[];
};

import { createBookingServer } from "@/src/actions/bookingActions";

// ... existing imports ...

// ... existing code ...

export const createBooking = async (booking: Partial<Booking>) => {
  console.log('Creating booking with input:', booking);

  // 1. Validate Basic Inputs (Minimal client-side check)
  if (!booking.room_id || !booking.check_in || !booking.check_out) {
    throw new Error("Eksik bilgi: Oda ve tarihler gereklidir.");
  }

  // 2. Construct Payload
  // We send raw data to the server. The server calculates the price securely.
  const payload = {
    room_id: booking.room_id,
    customer_name: booking.guest_name || booking.customer_name,
    customer_email: booking.email || booking.customer_email || "no-email@provided.com", 
    check_in: booking.check_in,
    check_out: booking.check_out,
    // total_price: REMOVED (Calculated on server)
    guests_count: booking.guests_count || 1,
    room_status: 'pending' 
  };

  console.log('Delegating to Server Action with payload:', payload);

  // 3. Call Server Action
  const result = await createBookingServer(payload);

  if (!result.success) {
    console.error('Server Action Failed:', result.error);
    throw new Error(result.error);
  }
  
  return result.data;
};

export const updateBookingStatus = async (id: string, status: string) => {
  const { data, error } = await supabase
    .from('Reservation_Information')
    .update({ room_status: status })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
};