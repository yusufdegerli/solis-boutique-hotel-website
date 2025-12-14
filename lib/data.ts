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

export const hotels: Hotel[] = [
  {
    id: "1",
    name: "Solis City",
    slug: "solis-city",
    tagline: "Şehrin Kalbinde Lüks Bir Kaçış",
    description: "İstanbul'un en canlı noktasında, modern mimari ve konforun buluştuğu nokta. İş seyahatleriniz ve şehir turlarınız için mükemmel bir tercih.",
    pricePerNight: 2500,
    rating: 9.2,
    reviews: 1240,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    location: "Beşiktaş, İstanbul",
    coordinates: {
      lat: 41.0422,
      lng: 29.0067
    },
    stats: {
      totalRooms: 120,
      availability: 15,
      suiteCount: 12
    },
    features: ["Spa & Wellness", "Panoramik Çatı Barı", "Toplantı Odaları", "Ücretsiz Yüksek Hızda Wi-Fi", "7/24 Oda Servisi"],
    contact: {
      phone: "+90 212 555 0101",
      email: "city@solishotels.com",
      address: "Barbaros Bulvarı No:12, Beşiktaş/İstanbul",
    },
  },
  {
    id: "2",
    name: "Solis Resort",
    slug: "solis-resort",
    tagline: "Mavinin ve Yeşilin Eşsiz Uyumu",
    description: "Bodrum'un kristal sularına nazır, doğayla iç içe, her şey dahil bir tatil deneyimi. Özel plajı ve sonsuzluk havuzuyla rüya gibi bir tatil.",
    pricePerNight: 5500,
    rating: 9.6,
    reviews: 850,
    image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80",
    location: "Bodrum, Muğla",
    coordinates: {
      lat: 37.0344,
      lng: 27.4305
    },
    stats: {
      totalRooms: 250,
      availability: 5,
      suiteCount: 45
    },
    features: ["Özel Plaj", "Sonsuzluk Havuzu", "Su Sporları", "Çocuk Kulübü", "Premium A La Carte Restoranlar"],
    contact: {
      phone: "+90 252 555 0202",
      email: "resort@solishotels.com",
      address: "Göltürkbükü Mah. Sahil Cad. No:5, Bodrum/Muğla",
    },
  },
];

// New Rooms Data
export interface Room {
  id: string;
  name: string;
  description: string;
  size: string;
  capacity: string;
  price: number;
  image: string;
}

export const rooms: Room[] = [
  {
    id: "deluxe",
    name: "Deluxe King Oda",
    description: "Modern tasarımın konforla buluştuğu, şehir veya deniz manzaralı ferah odalar.",
    size: "45m²",
    capacity: "2 Yetişkin, 1 Çocuk",
    price: 3500,
    image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "suite",
    name: "Executive Suit",
    description: "Ayrı oturma alanı ve özel terası ile lüksü yeniden tanımlayan bir deneyim.",
    size: "75m²",
    capacity: "3 Yetişkin",
    price: 6000,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "royal",
    name: "Royal Penthouse",
    description: "Panoramik manzaralı, özel jakuzili ve uşak hizmeti sunan en seçkin dairemiz.",
    size: "150m²",
    capacity: "4 Yetişkin",
    price: 15000,
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80"
  }
];

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