import { supabase } from "@/lib/supabaseClient";
import { Hotel, Room } from "@/lib/data";

// --- HOTELS ---

// --- MOCK DATA FOR STATIC OPERATION ---
const mockHotels: Hotel[] = [
  {
    id: "1",
    name: "Solis Boutique Hotel",
    slug: "solis-city",
    tagline: "Şehrin Kalbinde Lüks",
    description: "Solis Boutique Hotel, İstanbul'un tarihi yarımadasında lüksü ve konforu bir araya getiriyor.",
    pricePerNight: 120,
    rating: 9.2,
    reviews: 128,
    image: "/images/hotels/solis-city.jpg",
    location: "Beyazıt, İstanbul",
    coordinates: { lat: 41.0082, lng: 28.9784 },
    stats: { totalRooms: 45, availability: 80, suiteCount: 5 },
    features: ["Ücretsiz Wi-Fi", "Spa", "Tarihi Manzara", "Restoran"],
    contact: { phone: "+90 533 793 24 72", email: "info@solisboutiquehotel.com", address: "Mimar Kemalettin Mah. Mithatpaşa Cad. No:14/16 Beyazıt, İstanbul" }
  } as Hotel,
  {
    id: "2",
    name: "Solis Hotel",
    slug: "solis-belek",
    tagline: "Yakında Açılıyor...",
    description: "Solis Hotel, modern mimarisi ve doğayla bütünleşen tasarımıyla çok yakında kapılarını açıyor. İnşaat devam etmekte.",
    pricePerNight: 200,
    rating: 0,
    reviews: 0,
    image: "/images/hotels/solis-belek.jpg",
    location: "Beyazıt, İstanbul",
    coordinates: { lat: 36.8624, lng: 31.0556 },
    stats: { totalRooms: 120, availability: 0, suiteCount: 15 },
    features: ["Özel Plaj", "Açık Havuz", "Her Şey Dahil", "Kids Club"],
    contact: { phone: "+90 533 793 24 72", email: "info@solisboutiquehotel.com", address: "Beyazıt, İstanbul" },
    underConstruction: true
  } as any
];

export const getHotels = async (): Promise<Hotel[]> => {
  return mockHotels;
};

export const getHotelBySlug = async (slug: string): Promise<Hotel | undefined> => {
  return mockHotels.find(h => h.slug === slug);
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

const mockRooms: Room[] = [
  {
    id: "1", hotelId: "1", name: "Standart Oda", description: "Minimalist tasarıma sahip modern ve konforlu standart odalarımız.", size: "25m²", capacity: "2 Yetişkin", price: 120, quantity: 15, image: "/images/rooms/standard.jpg", images: ["/images/rooms/standard.jpg"], amenities: ["Wi-Fi", "Minibar", "Klima"]
  },
  {
    id: "2", hotelId: "1", name: "Deluxe Oda", description: "Ekstra alan ve daha fazla konfor sunan lüks deluxe odalarımız.", size: "35m²", capacity: "3 Yetişkin", price: 180, quantity: 10, image: "/images/rooms/deluxe.jpg", images: ["/images/rooms/deluxe.jpg"], amenities: ["Wi-Fi", "Deniz Manzarası", "Klima"]
  },
  {
    id: "3", hotelId: "2", name: "Suit Oda", description: "Balkonlu ve ayrı oturma alanına sahip özel suitler.", size: "55m²", capacity: "4 Yetişkin", price: 300, quantity: 5, image: "/images/rooms/suite.jpg", images: ["/images/rooms/suite.jpg"], amenities: ["Wi-Fi", "Özel Teras", "Jakuzi", "Klima"]
  }
];

export const getRooms = async (): Promise<Room[]> => {
  return mockRooms;
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
    images: room.images, // Save array
    amenities: room.amenities // Save amenities
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
  if (room.amenities) dbRoom.amenities = room.amenities;

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
    pricePerNight: hotel.stats?.min_price || 120, // Use stats if available, else default
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
    images: images,
    amenities: room.amenities || []
  };
}

// --- BOOKINGS ---

export interface Booking {
  id: string; // UUID
  room_id: number;
  customer_id?: any; // Linked customer ID
  customer_name: string;
  customer_email: string;
  customer_phone?: string; // NEW: Phone number
  customer_city?: string; // NEW: City
  customer_address?: string; // NEW: Address
  notes?: string; // NEW: Customer notes
  check_in: string;
  check_out: string;
  total_price: number;
  room_status: 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'checked_out'; // reservation_status enum
  // Frontend helpers (not in DB)
  hotel_id?: number;
  guests_count?: number;
  num_adults?: number;
  num_children?: number;
  guest_names?: string[]; // Array of guest names for room occupants
  email?: string; // alias for customer_email from form
  guest_name?: string; // alias for customer_name from form
  phone?: string; // alias for customer_phone from form
  // Extra fields for check-in/out
  guest_id_number?: string;
  guest_nationality?: string;
  check_in_notes?: string;
  extra_charges?: number;
  damage_report?: string;
  payment_status?: 'pending' | 'paid' | 'refunded';
  // Security
  _honeypot?: string; // Hidden spam protection field
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

export const getUserBookings = async (email: string): Promise<Booking[]> => {
  const { data, error } = await supabase
    .from('Reservation_Information')
    .select('*')
    .eq('customer_email', email)
    .order('check_in', { ascending: false });

  if (error) {
    console.error('Error fetching user bookings:', error);
    return [];
  }

  return data as Booking[];
};

import { createBookingServer, updateBookingStatusServer } from "@/actions/bookingActions";

// ... existing imports ...

// ... existing code ...

export const createBooking = async (_booking: Partial<Booking>) => {
  // Harici rezervasyon sistemine yönlendir
  // Elektra/Rezervasyonal entegrasyonu kullanılıyor
  return {
    success: true,
    redirect: "https://solis-boutique.rezervasyonal.com"
  };
};

export const updateBookingStatus = async (id: string, status: string, details?: Partial<Booking>) => {
  console.log(`Updating booking ${id} to status ${status}`);

  // Call the server action which handles Beds24 sync
  const result = await updateBookingStatusServer(id, status, details);

  if (!result.success) {
    throw new Error((result as any).error || 'Rezervasyon güncellenemedi');
  }

  return result.data;
};
