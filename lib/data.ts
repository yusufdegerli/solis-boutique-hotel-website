// Type definitions for Hotel and Room
// Note: Actual data is fetched from Supabase, not hardcoded here.

export interface Hotel {
  id: string; // Converted to string for frontend usage
  name: string;
  slug: string;
  tagline: string;
  description: string;
  pricePerNight: number;
  rating: number;
  reviews: number;
  image: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  stats: {
    totalRooms: number;
    availability: number; // percentage
    suiteCount: number;
  };
  features: string[];
  contact: {
    phone: string;
    email: string;
    address: string;
  };
}

export interface Room {
  id: string; // Converted to string for frontend usage
  hotelId?: string; 
  name: string;
  description: string;
  size: string;
  capacity: string;
  price: number;
  quantity: number;
  image: string; // Deprecated: Use images[0]
  images: string[]; // New: Array of image URLs
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}