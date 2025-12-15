import { supabase } from "@/lib/supabaseClient";
import { Hotel, Room } from "@/lib/data";

// Helper to calculate a mock price or other missing data if needed
// For now, using static placeholders as requested

export const getHotels = async (): Promise<Hotel[]> => {
  console.log('Fetching hotels from Supabase (Hotel_Information_Table)...');
  const { data, error } = await supabase
    .from('Hotel_Information_Table')
    .select('*');

  if (error) {
    console.error('Error fetching hotels:', error);
    return [];
  }

  if (!data || data.length === 0) {
    console.warn('Warning: No hotels found in database.');
    return [];
  }

  console.log(`Successfully fetched ${data.length} hotels.`);

  return data.map((hotel: any) => ({
    id: hotel.id.toString(),
    name: hotel.name,
    slug: hotel.slug,
    tagline: "Unutulmaz Bir Konaklama Deneyimi", // Placeholder
    description: hotel.description,
    pricePerNight: 3500, // Placeholder
    rating: 9.5, // Placeholder
    reviews: 500, // Placeholder
    image: hotel.image_url,
    location: hotel.address, // Using address as location
    coordinates: {
      lat: 41.0082,
      lng: 28.9784
    }, // Placeholder (Istanbul)
    stats: {
      totalRooms: 100,
      availability: 20,
      suiteCount: 10
    }, // Placeholder
    features: ["Ücretsiz Wi-Fi", "Spa", "Spor Salonu", "Restoran"], // Placeholder
    contact: {
      phone: "+90 212 555 0123",
      email: "info@solis.com",
      address: hotel.address
    }
  }));
};

export const getHotelBySlug = async (slug: string): Promise<Hotel | undefined> => {
  console.log(`Fetching hotel by slug: ${slug}`);
  const { data, error } = await supabase
    .from('Hotel_Information_Table')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error(`Error fetching hotel with slug ${slug}:`, error);
    return undefined;
  }

  if (!data) {
    console.warn(`No hotel found with slug: ${slug}`);
    return undefined;
  }

  const hotel = data;
  return {
    id: hotel.id.toString(),
    name: hotel.name,
    slug: hotel.slug,
    tagline: "Unutulmaz Bir Konaklama Deneyimi",
    description: hotel.description,
    pricePerNight: 3500,
    rating: 9.5,
    reviews: 500,
    image: hotel.image_url,
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
};

export const getRooms = async (): Promise<Room[]> => {
  console.log('Fetching rooms from Supabase (Rooms_Information)...');
  const { data, error } = await supabase
    .from('Rooms_Information')
    .select('*');

  if (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }

  if (!data || data.length === 0) {
    console.warn('Warning: No rooms found in database.');
    return [];
  }

  console.log(`Successfully fetched ${data.length} rooms.`);

  return data.map((room: any) => ({
    id: room.id.toString(),
    name: room.type_name,
    description: room.description || "Konforlu ve ferah bir oda.",
    size: "35m²", // Placeholder
    capacity: `${room.capacity} Yetişkin`,
    price: room.base_price,
    image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80" // Placeholder
  }));
};
