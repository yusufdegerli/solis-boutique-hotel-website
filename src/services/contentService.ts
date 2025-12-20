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

export const getBlogPosts = async (): Promise<BlogPost[]> => {
  const { data, error } = await supabase
    .from('Blog_Posts')
    .select('*')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }

  return data.map((post: any) => ({
    id: post.id.toString(),
    title: post.title,
    excerpt: post.excerpt,
    date: new Date(post.published_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
    image: post.image_url,
    slug: post.slug,
    content: post.content
  }));
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
