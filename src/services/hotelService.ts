import { supabase } from "@/lib/supabaseClient";
import roomDescriptions from '@/data/roomDescriptions.json';
import hotelDescriptions from '@/data/hotelDescriptions.json';
import roomNames from '@/data/roomNames.json';
import { Hotel, Room } from "@/lib/data";
import { 
  createHotelServer, updateHotelServer, deleteHotelServer,
  createRoomServer, updateRoomServer, deleteRoomServer
} from "@/actions/adminServerActions";

// --- HOTELS ---

// --- MOCK DATA FOR STATIC OPERATION ---
const mockHotels: Hotel[] = [
  {
    id: "1",
    name: "Solis Boutique Hotel",
    slug: "solis-hotel-istanbul",
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
    contact: { phone: "+90 533 793 24 72", email: "info@solisboutiquehotel.com", address: "Mimar Kemalettin Mah. Mithatpaşa Cad. No:14/16 Beyazıt, İstanbul" },
    bookingLinks: {
      expedia: "https://expe.onelink.me/hnLd/qaoed69m",
      booking: "https://www.booking.com/Share-eSoBspi",
      hotels_com: "https://tr.hotels.com/ho3406787680/"
    }
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
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    location: "Beyazıt, İstanbul",
    coordinates: { lat: 36.8624, lng: 31.0556 },
    stats: { totalRooms: 120, availability: 0, suiteCount: 15 },
    features: ["Özel Plaj", "Açık Havuz", "Her Şey Dahil", "Kids Club"],
    contact: { phone: "+90 533 793 24 72", email: "info@solisboutiquehotel.com", address: "Mimar Kemalettin Mah. Mithatpaşa Cad. No:14/16 Beyazıt, İstanbul" },
    underConstruction: true,
    bookingLinks: {}
  } as any
];

export const getHotels = async (): Promise<Hotel[]> => {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("Supabase environment variables are missing in getHotels!");
    }

    const { data, error } = await supabase.from('Hotel_Information_Table').select('*');
    if (error) {
      console.error("Error fetching hotels from DB:", error);
      // Also log details if it's a PostgrestError
      if (error.message) {
        console.error("Error Message:", error.message);
        console.error("Error Code:", error.code);
        console.error("Error Details:", error.details);
      }
      return mockHotels;
    }
    if (!data || data.length === 0) {
      console.warn("No data in DB, using mock fallback.");
      return mockHotels;
    }
    
    return data.map(mapDbHotelToModel);
  } catch (err) {
    console.error("Exception fetching hotels:", err);
    return mockHotels;
  }
};

export const getHotelBySlug = async (slug: string): Promise<Hotel | undefined> => {
  const hotels = await getHotels();
  return hotels.find(h => h.slug === slug);
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

  const data = await createHotelServer(dbHotel);
  return data;
};

export const updateHotel = async (id: string, hotel: Partial<Hotel>) => {
  const dbHotel: any = {};
  if (hotel.name) dbHotel.name = hotel.name;
  if (hotel.description) dbHotel.description = hotel.description;
  if (hotel.image) dbHotel.image_url = hotel.image;
  if (hotel.location) dbHotel.address = hotel.location;
  if (hotel.slug) dbHotel.slug = hotel.slug;

  const data = await updateHotelServer(id, dbHotel);
  return data;
};

export const deleteHotel = async (id: string) => {
  await deleteHotelServer(id);
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
  try {
    const { data, error } = await supabase.from('Rooms_Information').select('*');
    if (error) {
      console.error("Error fetching rooms from DB:", error);
      if (error.message) {
        console.error("Error Message:", error.message);
        console.error("Error Code:", error.code);
      }
      return mockRooms;
    }
    if (!data || data.length === 0) {
      return mockRooms;
    }
    return data.map(mapDbRoomToModel);
  } catch (err) {
    console.error("Exception fetching rooms:", err);
    return mockRooms;
  }
};

export const createRoom = async (room: Partial<Room>) => {
  if ((room.price ?? 0) < 0) throw new Error("Fiyat negatif olamaz.");
  if ((room.quantity ?? 0) < 0) throw new Error("Stok adedi negatif olamaz.");

  const dbRoom = {
    hotel_id: room.hotelId || null,
    type_name: room.name,
    description: room.description,
    base_price: room.price,
    capacity: parseInt(room.capacity?.split(' ')[0] || '2'),
    quantity: room.quantity || 10,
    images: room.images, // Save array
    amenities: room.amenities // Save amenities
  };

  const data = await createRoomServer(dbRoom);
  return data;
};

export const updateRoom = async (id: string, room: Partial<Room>) => {
  if (room.price !== undefined && room.price < 0) throw new Error("Fiyat negatif olamaz.");
  if (room.quantity !== undefined && room.quantity < 0) throw new Error("Stok adedi negatif olamaz.");

  const dbRoom: any = {};
  if (room.hotelId) dbRoom.hotel_id = room.hotelId;
  if (room.name) dbRoom.type_name = room.name;
  if (room.description) dbRoom.description = room.description;
  if (room.price) dbRoom.base_price = room.price;
  if (room.capacity) dbRoom.capacity = parseInt(room.capacity?.split(' ')[0] || '2');
  if (room.quantity !== undefined) dbRoom.quantity = room.quantity;
  if (room.images) dbRoom.images = room.images;
  if (room.amenities) dbRoom.amenities = room.amenities;

  const data = await updateRoomServer(id, dbRoom);
  return data;
};

export const deleteRoom = async (id: string) => {
  await deleteRoomServer(id);
};

// --- HELPERS ---

function mapDbHotelToModel(hotel: any): Hotel {
  return {
    id: hotel.id.toString(),
    name: hotel.name,
    slug: hotel.slug,
    tagline: hotel.tagline || "Unutulmaz Bir Konaklama Deneyimi",
    description: (hotelDescriptions as any)[hotel.name] ? JSON.stringify((hotelDescriptions as any)[hotel.name]) : hotel.description,
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
    },
    bookingLinks: hotel.booking_links || {}
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
    name: (roomNames as any)[room.type_name] ? JSON.stringify((roomNames as any)[room.type_name]) : room.type_name,
    description: (roomDescriptions as any)[room.type_name] ? JSON.stringify((roomDescriptions as any)[room.type_name]) : room.description || "Konforlu ve ferah bir oda.",
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
    console.error('Error fetching bookings:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
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
    console.error('Error fetching user bookings:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
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
