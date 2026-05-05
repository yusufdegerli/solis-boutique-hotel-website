import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Globe, Hotel as HotelIcon } from "lucide-react";
import { getTranslations } from 'next-intl/server';

export default async function ReservationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Reservation' });

  const selectionHotels = [
    {
      id: "solis-boutique",
      name: "Solis Boutique Hotel",
      slug: "solis-hotel-istanbul",
      image: "https://gjgiykewaxmylnwdvikz.supabase.co/storage/v1/object/public/hotel-images/IMG_5806.jpg",
      location: "Beyazıt, İstanbul"
    },
    {
      id: "solis-hotel",
      name: "Solis Hotel",
      slug: "hotel2",
      image: "https://gjgiykewaxmylnwdvikz.supabase.co/storage/v1/object/public/hotel-images/solishotelmain.jpeg",
      location: "Beyazıt, İstanbul"
    }
  ];

  return (
    <main className="min-h-screen bg-[var(--off-white)] flex flex-col">
      <Navbar locale={locale} />
      
      <div className="flex-grow flex items-center justify-center py-20 px-4 md:py-32">
        <div className="max-w-4xl w-full">
          <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 p-8 md:p-12 flex flex-col items-center">
            
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-[var(--gold)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <HotelIcon className="w-8 h-8 text-[var(--gold)]" />
              </div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-[var(--off-black)] mb-4">
                {t('whichHotel')}
              </h1>
              <p className="text-gray-500 max-w-md mx-auto italic">
                {t('selectHotelDesc')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              {selectionHotels.map((hotel) => (
                <Link
                  key={hotel.id}
                  href={`/${locale}/hotels/${hotel.slug}/book`}
                  className="group relative h-64 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
                >
                  <Image 
                    src={hotel.image} 
                    alt={hotel.name} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                    <h3 className="text-xl font-serif font-bold text-white mb-1 group-hover:text-[var(--gold)] transition-colors">
                      {hotel.name}
                    </h3>
                    <p className="text-white/70 text-[10px] font-sans flex items-center gap-2 tracking-widest uppercase">
                      <Globe className="w-3 h-3 text-[var(--gold)]" />
                      {hotel.location}
                    </p>
                  </div>
                  {/* Selection Overlay */}
                  <div className="absolute inset-0 bg-[var(--gold)]/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </Link>
              ))}
            </div>

            <Link
              href={`/${locale}`}
              className="flex items-center justify-center gap-2 text-gray-400 hover:text-[var(--gold)] text-xs font-medium pt-12 transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" /> {t('backToHotel')}
            </Link>
          </div>
        </div>
      </div>

      <Footer locale={locale} />
    </main>
  );
}
