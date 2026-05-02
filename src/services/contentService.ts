import { supabase } from "@/lib/supabaseClient";

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  slug?: string;
  content?: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  image?: string;
}

const mockBlogPosts: BlogPost[] = [
  {
    id: "1",
    title: "İstanbul'un Gizli Hazineleri: Keşfedilmeyi Bekleyen 7 Mekân",
    excerpt: "Turistlerin yoğun ilgisinin gölgesinde kalan, yalnızca yerlilerin bildiği bu tarihi köşeler İstanbul'un ruhunu yansıtıyor.",
    date: "15 Şubat 2025",
    image: "https://images.unsplash.com/photo-1527838832700-5059252407fa?auto=format&fit=crop&w=800&q=80",
    slug: "istanbul-gizli-hazineleri",
  },
  {
    id: "2",
    title: "Solis'te Bir Sabah: Boğaz Manzaralı Kahvaltı Ritüeli",
    excerpt: "Güneşin Boğaz'da doğuşunu izlerken servis edilen Türk kahvaltısı, konaklamamızın en unutulmaz anlarından biri.",
    date: "28 Ocak 2025",
    image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=800&q=80",
    slug: "solis-sabah-kahvaltisi",
  },
  {
    id: "3",
    title: "Sultanahmet'ten Kapalıçarşı'ya: Yaya Turu Rehberi",
    excerpt: "Tarihi yarımadayı keşfetmek için hazırladığımız yürüyüş rotası, sizi yüzyıllar öncesine götürecek.",
    date: "10 Ocak 2025",
    image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=800&q=80",
    slug: "sultanahmet-kapalicarsi-tur",
  },
  {
    id: "4",
    title: "VIP Transfer Hizmetimiz: Havalimanından Otele Sorunsuz Yolculuk",
    excerpt: "Solis'in VIP transfer hizmetiyle İstanbul'a ilk adımınızdan itibaren lüksü hissedebilirsiniz.",
    date: "5 Aralık 2024",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
    slug: "vip-transfer-hizmeti",
  },
  {
    id: "5",
    title: "Boğaz'da Gün Batımı: Unutulmaz Tekne Turu Deneyimi",
    excerpt: "Boğaz'ın iki yakasını birbirine bağlayan bu eşsiz suda, gün batımının pembe ve altın rengi tonlarını izleyin.",
    date: "20 Kasım 2024",
    image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80",
    slug: "bogaz-gun-batimi-tekne",
  },
  {
    id: "6",
    title: "Türk Mutfağının İncelikleri: Solis Şefinden Özel Tarifler",
    excerpt: "Geleneksel Türk lezzetlerini modern tekniklerle buluşturan şefimiz, mutfağın sırlarını paylaşıyor.",
    date: "3 Kasım 2024",
    image: "https://images.unsplash.com/photo-1603360946369-dc9bb6258143?auto=format&fit=crop&w=800&q=80",
    slug: "turk-mutfagi-tarifler",
  },
];

export const getBlogPosts = async (): Promise<BlogPost[]> => {
  // Return mock blog posts (Supabase not active)
  return mockBlogPosts;
};

export const getServices = async (): Promise<Service[]> => {
  const { data, error } = await supabase
    .from('Services')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching services:', error);
    return [];
  }

  return data.map((service: any) => ({
    id: service.id,
    title: service.title,
    description: service.description,
    icon: service.icon_name,
    image: service.image_url
  }));
};
