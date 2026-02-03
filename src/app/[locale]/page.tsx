import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HotelCard from "@/components/HotelCard";
import Footer from "@/components/Footer";
import { getHotels } from "@/services/hotelService";
import { Star, Award, ShieldCheck, HeartHandshake } from "lucide-react";
import { getTranslations } from 'next-intl/server';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('Home');
  const tNav = await getTranslations('Navbar');
  const hotels = await getHotels();

  // Icons map for features
  const features = [
    { icon: Star, key: "service" },
    { icon: Award, key: "architecture" },
    { icon: ShieldCheck, key: "security" },
    { icon: HeartHandshake, key: "satisfaction" }
  ];

  return (
    <main className="min-h-screen flex flex-col bg-white overflow-x-hidden">
      <Navbar locale={locale} />

      <Hero locale={locale} />

      {/* Hotels Section */}
      <section id="hotels" className="py-32 bg-[var(--off-white)] relative">
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-white to-transparent"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20 space-y-4">
            <span className="text-[var(--gold)] font-serif italic text-xl">{t('collection')}</span>
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--off-black)] font-serif">{t('discoverTitle')}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg font-light">
              {t('discoverDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
            {hotels.map((hotel, index) => (
              <div key={hotel.id} className={`h-full animate-fade-in-up delay-${(index + 1) * 100}`}>
                <HotelCard hotel={hotel} locale={locale} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features/Why Us Section */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-[var(--off-white)] p-10 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 text-center group border border-gray-50 hover:-translate-y-2">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm group-hover:scale-110 transition-transform duration-300 border border-gray-100">
                  <feature.icon className="w-8 h-8 text-[var(--gold)]" />
                </div>
                <h3 className="font-serif font-bold text-xl mb-4 text-[var(--off-black)]">{t(`features.${feature.key}`)}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{t(`features.${feature.key}Desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-[var(--off-black)] text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-serif text-white mb-8">{t('ctaTitle')}</h2>
          <p className="text-gray-400 mb-10 text-lg font-light">{t('ctaDesc')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a href={`/${locale}/reservation`} className="inline-block px-10 py-5 bg-[var(--gold)] text-white font-serif text-lg rounded-full hover:bg-white hover:text-[var(--off-black)] transition-all duration-300 shadow-2xl">
              {tNav('book')}
            </a>
            <a href={`/${locale}/reservation-status`} className="inline-block px-10 py-5 bg-transparent border-2 border-[var(--gold)] text-[var(--gold)] font-serif text-lg rounded-full hover:bg-[var(--gold)] hover:text-white transition-all duration-300">
              {t('checkStatus') || 'Rezervasyon Sorgula'}
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}