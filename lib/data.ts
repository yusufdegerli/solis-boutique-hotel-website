// Existing Hotels Data with Updates
export interface Hotel {
  id: string;
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

// New Rooms Data
export interface Room {
  id: string;
  hotelId?: string; // Added to link room to hotel
  name: string;
  description: string;
  size: string;
  capacity: string;
  price: number;
  quantity: number;
  image: string;
}

// New Blog Data
export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "İstanbul'un Gizli Hazineleri",
    excerpt: "Turist rehberlerinde bulamayacağınız, şehrin en büyüleyici tarihi sokakları ve lezzet durakları.",
    date: "12 Aralık 2025",
    image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "2",
    title: "Mükemmel Bir Spa Deneyimi İçin İpuçları",
    excerpt: "Vücudunuzu ve ruhunuzu dinlendirmek için spa ritüellerinin inceliklerini keşfedin.",
    date: "5 Kasım 2025",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "3",
    title: "Bodrum'da Gün Batımı Rotaları",
    excerpt: "Ege'nin en güzel gün batımını izleyebileceğiniz en romantik ve huzurlu noktalar.",
    date: "20 Ekim 2025",
    image: "https://images.unsplash.com/photo-1580242279262-d9c9fb7d2062?auto=format&fit=crop&w=800&q=80"
  }
];

// New Services Data
export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const services: Service[] = [
  {
    id: "transfer",
    title: "VIP Havaalanı Transferi",
    description: "Sizi havaalanında karşılıyor, lüks araçlarımızla otelinize konforlu bir şekilde ulaştırıyoruz.",
    icon: "car"
  },
  {
    id: "tour",
    title: "Özel Şehir Turları",
    description: "Profesyonel rehberler eşliğinde İstanbul'un ve Bodrum'un tarihi güzelliklerini keşfedin.",
    icon: "map"
  },
  {
    id: "concierge",
    title: "Kişisel Asistan (Concierge)",
    description: "Restoran rezervasyonlarından etkinlik biletlerine kadar her türlü isteğiniz için 7/24 hizmetinizdeyiz.",
    icon: "bell"
  }
];
