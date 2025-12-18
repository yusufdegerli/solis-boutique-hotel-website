import { supabase } from "@/lib/supabaseClient";
import { Hotel, Room } from "@/lib/data";

// --- HOTELS ---

export const getHotels = async (): Promise<Hotel[]> => {
  const { data, error } = await supabase
    .from('Hotel_Information_Table')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching hotels:', error);
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

// --- ROOMS ---

export const getRooms = async (): Promise<Room[]> => {
  const { data, error } = await supabase
    .from('Rooms_Information')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }

  return data.map((room: any) => mapDbRoomToModel(room));
};

export const createRoom = async (room: Partial<Room>) => {
  const dbRoom = {
    type_name: room.name,
    description: room.description,
    base_price: room.price,
    capacity: parseInt(room.capacity?.split(' ')[0] || '2'),
    // image_url: room.image // If DB has this column
  };

  const { data, error } = await supabase
    .from('Rooms_Information')
    .insert([dbRoom])
    .select();

  if (error) throw error;
  return data;
};

export const updateRoom = async (id: string, room: Partial<Room>) => {
  const dbRoom: any = {};
  if (room.name) dbRoom.type_name = room.name;
  if (room.description) dbRoom.description = room.description;
  if (room.price) dbRoom.base_price = room.price;
  if (room.capacity) dbRoom.capacity = parseInt(room.capacity?.split(' ')[0] || '2');

  const { data, error } = await supabase
    .from('Rooms_Information')
    .update(dbRoom)
    .eq('id', id)
    .select();

  if (error) throw error;
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
    tagline: "Unutulmaz Bir Konaklama Deneyimi",
    description: hotel.description,
    pricePerNight: 3500, // Default if not in DB
    rating: 9.5,
    reviews: 500,
    image: hotel.image_url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    location: hotel.address,
    coordinates: {
      lat: 41.0082,
      lng: 28.9784
    },
    stats: {
      totalRooms: 100,
      availability: 20,
      suiteCount: 10
    },
    features: ["Ücretsiz Wi-Fi", "Spa", "Spor Salonu", "Restoran"],
    contact: {
      phone: "+90 212 555 0123",
      email: "info@solis.com",
      address: hotel.address
    }
  };
}

function mapDbRoomToModel(room: any): Room {
  return {
    id: room.id.toString(),
    name: room.type_name,
    description: room.description || "Konforlu ve ferah bir oda.",
    size: "35m²",
    capacity: `${room.capacity || 2} Yetişkin`,
    price: room.base_price || 0,
    image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80"
  };
}