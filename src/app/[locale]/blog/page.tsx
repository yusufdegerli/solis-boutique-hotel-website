import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getBlogPosts } from "@/services/contentService";
import Image from "next/image";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [blogPosts, t] = await Promise.all([
    getBlogPosts(),
    getTranslations('Blog')
  ]);

  return (
    <main className="min-h-screen bg-[var(--off-white)]">
      <Navbar locale={locale} />
      
      <div className="bg-[var(--off-black)] text-white py-32 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/60 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1920&q=80"
            alt="Travel Blog"
            fill
            className="object-cover opacity-40"
          />
        </div>
        <div className="relative z-10">
            <h1 className="text-5xl font-bold mb-4 font-serif">{t('title')}</h1>
            <p className="text-gray-300 max-w-2xl mx-auto px-4 font-light font-sans tracking-wide">
              {t('desc')}
            </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {blogPosts.map((post) => (
            <article key={post.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group flex flex-col h-full">
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded text-xs font-bold uppercase tracking-wider text-[var(--off-black)] flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-[var(--gold)]" />
                    {post.date}
                </div>
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <h2 className="text-xl font-serif font-bold text-[var(--off-black)] mb-4 group-hover:text-[var(--gold)] transition-colors line-clamp-2">
                    {post.title}
                </h2>
                <p className="text-gray-600 mb-6 font-sans text-sm leading-relaxed line-clamp-3 flex-grow">
                  {post.excerpt}
                </p>
                <Link 
                    href="#" 
                    className="inline-flex items-center gap-2 text-[var(--gold)] font-bold text-sm uppercase tracking-wider hover:gap-3 transition-all mt-auto"
                >
                    {t('readMore')} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
