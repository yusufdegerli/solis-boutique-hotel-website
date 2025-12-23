import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getServices } from "@/services/contentService";
import Image from "next/image";
import Link from "next/link";
import { Car, Map, Bell, ChevronRight } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [services, t] = await Promise.all([
    getServices(),
    getTranslations('Services')
  ]);

  // Icon mapping
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'car': return <Car className="w-10 h-10 text-[var(--gold)]" />;
      case 'map': return <Map className="w-10 h-10 text-[var(--gold)]" />;
      case 'bell': return <Bell className="w-10 h-10 text-[var(--gold)]" />;
      default: return <Bell className="w-10 h-10 text-[var(--gold)]" />;
    }
  };

  return (
    <main className="min-h-screen bg-[var(--off-white)]">
      <Navbar locale={locale} />
      
      <div className="bg-[var(--off-black)] text-white py-32 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/60 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1560938450-32326759ce45?auto=format&fit=crop&w=1920&q=80"
            alt="Concierge Services"
            fill
            className="object-cover opacity-50"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {services.map((service, idx) => (
            <div key={service.id} className="bg-white p-10 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border-t-4 border-[var(--gold)] group hover:-translate-y-2">
              <div className="w-20 h-20 bg-[var(--off-white)] rounded-full flex items-center justify-center mb-8 group-hover:bg-[var(--gold)]/10 transition-colors">
                {getIcon(service.icon)}
              </div>
              <h3 className="text-2xl font-serif font-bold text-[var(--off-black)] mb-4">{service.title}</h3>
              <p className="text-gray-600 mb-8 font-sans leading-relaxed min-h-[80px]">
                {service.description}
              </p>
              <Link 
                href={`/${locale}/contact`}
                className="inline-flex items-center justify-center w-full py-4 border border-gray-200 text-[var(--off-black)] font-serif font-bold hover:bg-[var(--off-black)] hover:text-white transition-all duration-300 rounded-sm"
              >
                {t('moreInfo')} <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          ))}
        </div>

        {/* Extra Info Section */}
        <div className="mt-24 bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
            <div className="md:w-1/2 relative min-h-[400px]">
                <Image 
                    src="https://images.unsplash.com/photo-1566552881560-0be862a7c445?auto=format&fit=crop&w=800&q=80" 
                    alt="Luxury Car Transfer" 
                    fill 
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center p-12">
                    <h3 className="text-4xl font-serif font-bold text-white max-w-xs">{t('vipTitle')}</h3>
                </div>
            </div>
            <div className="md:w-1/2 p-12 md:p-16 flex flex-col justify-center bg-[var(--off-black)] text-white">
                <h4 className="text-2xl font-serif font-bold text-[var(--gold)] mb-6">{t('vipSubtitle')}</h4>
                <p className="text-gray-300 font-sans leading-relaxed mb-8">
                    {t('vipDesc')}
                </p>
                <ul className="space-y-4 font-sans text-gray-400 mb-10">
                    <li className="flex items-center gap-3"><span className="w-2 h-2 bg-[var(--gold)] rounded-full"></span> {t('feature1')}</li>
                    <li className="flex items-center gap-3"><span className="w-2 h-2 bg-[var(--gold)] rounded-full"></span> {t('feature2')}</li>
                    <li className="flex items-center gap-3"><span className="w-2 h-2 bg-[var(--gold)] rounded-full"></span> {t('feature3')}</li>
                </ul>
                <Link href={`/${locale}/reservation`} className="self-start px-8 py-4 bg-[var(--gold)] text-white font-serif font-bold uppercase tracking-widest hover:bg-white hover:text-[var(--off-black)] transition-all">
                    {t('bookTransfer')}
                </Link>
            </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
